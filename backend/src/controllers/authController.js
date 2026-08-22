const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const { logAudit } = require('../utils/auditLogger');
const { sendNotification } = require('../utils/notifier');
const { generateLoginId } = require('../utils/idGenerator');

const JWT_SECRET = process.env.JWT_SECRET || 'dayflow_hrms_super_secret_jwt_key_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Register a new company and admin user (Company Sign Up)
 * Body: { company_name, first_name, last_name, email, password, phone, logo_url }
 */
const register = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const {
      company_name = 'Odoo India',
      name,
      first_name,
      last_name,
      email,
      password,
      phone,
      logo_url,
      role = 'ADMIN',
      department_id,
      designation_id,
      joining_date,
    } = req.body;

    // Support single 'name' field from wireframe or first_name/last_name
    let fName = first_name;
    let lName = last_name;
    if (!fName && name) {
      const parts = name.trim().split(/\s+/);
      fName = parts[0];
      lName = parts.slice(1).join(' ') || parts[0];
    }

    if (!email || !password || !fName) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.',
      });
    }

    await client.query('BEGIN');

    // Check if email already registered
    const existingUser = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );
    if (existingUser.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ success: false, message: 'Email is already registered.' });
    }

    // Auto-generate Login ID / Employee Code if not supplied
    const loginId = await generateLoginId({
      companyName: company_name,
      firstName: fName,
      lastName: lName || '',
      joiningDate: joining_date || new Date(),
    });

    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Insert user
    const userRes = await client.query(
      `INSERT INTO users (email, password_hash, role, is_active, is_verified)
       VALUES ($1, $2, $3, TRUE, TRUE)
       RETURNING id, email, role, is_active, is_verified, created_at`,
      [email.toLowerCase().trim(), password_hash, role.toUpperCase()]
    );
    const newUser = userRes.rows[0];

    // Insert employee profile with auto-generated login ID
    const empRes = await client.query(
      `INSERT INTO employees (
        user_id, employee_code, first_name, last_name, 
        phone, department_id, designation_id, joining_date, employment_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'ACTIVE')
      RETURNING id, employee_code, first_name, last_name, department_id, designation_id, joining_date`,
      [
        newUser.id,
        loginId,
        fName.trim(),
        (lName || '').trim(),
        phone || null,
        department_id || null,
        designation_id || null,
        joining_date || new Date().toISOString().split('T')[0],
      ]
    );
    const newEmp = empRes.rows[0];

    // Initialize default salary structure
    await client.query(
      `INSERT INTO salary_structures (employee_id, basic_salary, hra, allowances, deductions, net_salary, currency)
       VALUES ($1, 75000.00, 25000.00, 15000.00, 5000.00, 110000.00, 'INR')
       ON CONFLICT (employee_id) DO NOTHING`,
      [newEmp.id]
    );

    // Initial audit log
    await client.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
       VALUES ($1, 'COMPANY_SIGNUP', 'USER', $2, $3)`,
      [newUser.id, String(newUser.id), JSON.stringify({ email: newUser.email, login_id: loginId, company_name })]
    );

    await client.query('COMMIT');

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email, role: newUser.role, employeeId: newEmp.id },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(201).json({
      success: true,
      message: 'Company and Admin account registered successfully.',
      login_id: loginId,
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        employee: newEmp,
      },
    });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

/**
 * Sign in with Login ID or Email and password
 * Body: { identifier (or email), password }
 */
const login = async (req, res, next) => {
  try {
    const { identifier, email, password } = req.body;
    const loginKey = (identifier || email || '').trim();

    if (!loginKey || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your Login ID/Email and password.',
      });
    }

    // Query by either email or employee_code (Login ID)
    const query = `
      SELECT 
        u.id AS user_id,
        u.email,
        u.password_hash,
        u.role,
        u.is_active,
        u.is_verified,
        e.id AS employee_id,
        e.employee_code,
        e.first_name,
        e.last_name,
        e.profile_picture_url,
        d.name AS department,
        ds.title AS designation
      FROM users u
      LEFT JOIN employees e ON u.id = e.user_id
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN designations ds ON e.designation_id = ds.id
      WHERE LOWER(u.email) = LOWER($1) OR UPPER(e.employee_code) = UPPER($1)
    `;
    const result = await pool.query(query, [loginKey]);

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Login ID/Email or password.',
      });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please reach out to HR.',
      });
    }

    // Verify password hash
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Login ID/Email or password.',
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        userId: user.user_id,
        email: user.email,
        role: user.role,
        employeeId: user.employee_id,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Audit login
    await logAudit({
      userId: user.user_id,
      action: 'USER_LOGIN',
      entityType: 'USER',
      entityId: user.user_id,
      details: { email: user.email, login_id: user.employee_code },
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user.user_id,
        email: user.email,
        role: user.role,
        is_verified: user.is_verified,
        employee: user.employee_id
          ? {
              id: user.employee_id,
              employee_code: user.employee_code,
              first_name: user.first_name,
              last_name: user.last_name,
              profile_picture_url: user.profile_picture_url,
              department_name: user.department,
              designation_title: user.designation,
            }
          : null,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get current authenticated user profile
 */
const getMe = async (req, res, next) => {
  try {
    const userId = req.user.user_id;

    const query = `
      SELECT 
        u.id AS user_id,
        u.email,
        u.role,
        u.is_active,
        u.is_verified,
        u.created_at,
        e.id AS employee_id,
        e.employee_code,
        e.first_name,
        e.last_name,
        e.gender,
        e.phone,
        e.current_address,
        e.joining_date,
        e.employment_status,
        e.profile_picture_url,
        e.bank_account_number,
        e.bank_name,
        e.pan_number,
        d.id AS department_id,
        d.name AS department_name,
        ds.id AS designation_id,
        ds.title AS designation_title
      FROM users u
      LEFT JOIN employees e ON u.id = e.user_id
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN designations ds ON e.designation_id = ds.id
      WHERE u.id = $1
    `;
    const result = await pool.query(query, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const row = result.rows[0];

    res.json({
      success: true,
      user: {
        id: row.user_id,
        email: row.email,
        role: row.role,
        is_active: row.is_active,
        is_verified: row.is_verified,
        created_at: row.created_at,
        employee: row.employee_id
          ? {
              id: row.employee_id,
              employee_code: row.employee_code,
              first_name: row.first_name,
              last_name: row.last_name,
              gender: row.gender,
              phone_number: row.phone,
              current_address: row.current_address,
              joining_date: row.joining_date,
              employment_status: row.employment_status,
              profile_picture_url: row.profile_picture_url,
              department_id: row.department_id,
              department_name: row.department_name,
              designation_id: row.designation_id,
              designation_title: row.designation_title,
              bank_account_number: row.bank_account_number,
              bank_name: row.bank_name,
              pan_number: row.pan_number,
            }
          : null,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Change Password (for first-time login or security updates)
 */
const changePassword = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const { current_password, new_password } = req.body;

    if (!new_password || new_password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters.',
      });
    }

    const userRes = await pool.query('SELECT password_hash FROM users WHERE id = $1', [userId]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // If current_password is provided, verify it
    if (current_password) {
      const match = await bcrypt.compare(current_password, userRes.rows[0].password_hash);
      if (!match) {
        return res.status(400).json({ success: false, message: 'Current password does not match.' });
      }
    }

    const hashed = await bcrypt.hash(new_password, 10);
    await pool.query('UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [hashed, userId]);

    await logAudit({
      userId,
      action: 'CHANGE_PASSWORD',
      entityType: 'USER',
      entityId: userId,
      details: { updated: true },
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Password updated successfully.',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  getMe,
  changePassword,
};
