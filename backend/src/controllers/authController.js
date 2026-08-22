const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const { logAudit } = require('../utils/auditLogger');
const { sendNotification } = require('../utils/notifier');

const JWT_SECRET = process.env.JWT_SECRET || 'dayflow_hrms_super_secret_jwt_key_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Register a new employee or HR user
 * Body: { employee_code, first_name, last_name, email, password, role, department_id, designation_id, phone }
 */
const register = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const {
      employee_code,
      first_name,
      last_name,
      email,
      password,
      role = 'EMPLOYEE',
      department_id,
      designation_id,
      phone,
      gender,
      joining_date,
    } = req.body;

    if (!email || !password || !first_name || !last_name || !employee_code) {
      return res.status(400).json({
        success: false,
        message: 'employee_code, first_name, last_name, email, and password are required.',
      });
    }

    if (!['ADMIN', 'HR', 'EMPLOYEE'].includes(role.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be EMPLOYEE, HR, or ADMIN.',
      });
    }

    await client.query('BEGIN');

    // Check if email or employee_code already exists
    const existingUser = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );
    if (existingUser.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ success: false, message: 'Email is already registered.' });
    }

    const existingCode = await client.query(
      'SELECT id FROM employees WHERE employee_code = $1',
      [employee_code.trim()]
    );
    if (existingCode.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ success: false, message: 'Employee code already in use.' });
    }

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

    // Insert employee profile
    const empRes = await client.query(
      `INSERT INTO employees (
        user_id, employee_code, first_name, last_name, gender, 
        phone, department_id, designation_id, joining_date, employment_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'ACTIVE')
      RETURNING id, employee_code, first_name, last_name, department_id, designation_id, joining_date`,
      [
        newUser.id,
        employee_code.trim(),
        first_name.trim(),
        last_name.trim(),
        gender || 'PREFER_NOT_TO_SAY',
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
       VALUES ($1, 25000.00, 12500.00, 10000.00, 2500.00, 45000.00, 'INR')
       ON CONFLICT (employee_id) DO NOTHING`,
      [newEmp.id]
    );

    await client.query('COMMIT');

    // Audit log
    await logAudit({
      userId: newUser.id,
      action: 'USER_REGISTER',
      entityType: 'USER',
      entityId: newUser.id,
      details: { email: newUser.email, role: newUser.role, employee_code: newEmp.employee_code },
      ipAddress: req.ip,
    });

    // Welcome Notification
    await sendNotification({
      userId: newUser.id,
      title: 'Welcome to Dayflow HRMS!',
      message: `Hello ${first_name}, your account (${newEmp.employee_code}) has been created successfully.`,
    });

    // Generate JWT
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email, role: newUser.role, employeeId: newEmp.id },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully.',
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
 * Sign in with email and password
 * Body: { email, password }
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

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
      WHERE LOWER(u.email) = LOWER($1)
    `;
    const result = await pool.query(query, [email.trim()]);

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
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
        message: 'Invalid email or password.',
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

    // Audit log
    await logAudit({
      userId: user.user_id,
      action: 'USER_LOGIN',
      entityType: 'USER',
      entityId: user.user_id,
      details: { email: user.email, role: user.role },
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Signed in successfully.',
      token,
      user: {
        id: user.user_id,
        email: user.email,
        role: user.role,
        is_verified: user.is_verified,
        employee: {
          id: user.employee_id,
          employee_code: user.employee_code,
          first_name: user.first_name,
          last_name: user.last_name,
          full_name: `${user.first_name} ${user.last_name}`,
          profile_picture_url: user.profile_picture_url,
          department: user.department,
          designation: user.designation,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get current authenticated session user profile
 */
const getMe = async (req, res, next) => {
  try {
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
        e.date_of_birth,
        e.phone,
        e.address,
        e.joining_date,
        e.profile_picture_url,
        e.employment_status,
        d.id AS department_id,
        d.name AS department_name,
        ds.id AS designation_id,
        ds.title AS designation_title,
        s.basic_salary,
        s.hra,
        s.allowances,
        s.deductions,
        s.net_salary,
        s.currency
      FROM users u
      LEFT JOIN employees e ON u.id = e.user_id
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN designations ds ON e.designation_id = ds.id
      LEFT JOIN salary_structures s ON e.id = s.employee_id
      WHERE u.id = $1
    `;
    const result = await pool.query(query, [req.user.user_id]);

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
        is_verified: row.is_verified,
        created_at: row.created_at,
        employee: {
          id: row.employee_id,
          employee_code: row.employee_code,
          first_name: row.first_name,
          last_name: row.last_name,
          full_name: `${row.first_name} ${row.last_name}`,
          gender: row.gender,
          date_of_birth: row.date_of_birth,
          phone: row.phone,
          address: row.address,
          joining_date: row.joining_date,
          profile_picture_url: row.profile_picture_url,
          employment_status: row.employment_status,
          department: { id: row.department_id, name: row.department_name },
          designation: { id: row.designation_id, title: row.designation_title },
          salary: {
            basic_salary: row.basic_salary,
            hra: row.hra,
            allowances: row.allowances,
            deductions: row.deductions,
            net_salary: row.net_salary,
            currency: row.currency,
          },
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Verify user email
 */
const verifyEmail = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    await pool.query('UPDATE users SET is_verified = TRUE WHERE id = $1', [userId]);

    res.json({
      success: true,
      message: 'Email verified successfully.',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  getMe,
  verifyEmail,
};
