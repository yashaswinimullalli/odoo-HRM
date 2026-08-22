const { pool } = require('../config/db');
const { logAudit } = require('../utils/auditLogger');
const { sendNotification } = require('../utils/notifier');

/**
 * List all employees with search & filter (Admin / HR)
 */
const listEmployees = async (req, res, next) => {
  try {
    const { department_id, status, search, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT 
        e.id,
        e.user_id,
        e.employee_code,
        e.first_name,
        e.last_name,
        e.first_name || ' ' || e.last_name AS full_name,
        u.email,
        u.role,
        e.gender,
        e.phone,
        e.address,
        e.joining_date,
        e.employment_status,
        e.profile_picture_url,
        d.id AS department_id,
        d.name AS department_name,
        ds.id AS designation_id,
        ds.title AS designation_title,
        s.net_salary,
        e.created_at
      FROM employees e
      JOIN users u ON e.user_id = u.id
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN designations ds ON e.designation_id = ds.id
      LEFT JOIN salary_structures s ON e.id = s.employee_id
      WHERE 1=1
    `;
    const params = [];

    if (department_id) {
      params.push(department_id);
      query += ` AND e.department_id = $${params.length}`;
    }

    if (status) {
      params.push(status);
      query += ` AND e.employment_status = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (
        e.first_name ILIKE $${params.length} 
        OR e.last_name ILIKE $${params.length} 
        OR e.employee_code ILIKE $${params.length}
        OR u.email ILIKE $${params.length}
      )`;
    }

    query += ` ORDER BY e.id ASC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Total count for pagination
    const totalCountRes = await pool.query('SELECT COUNT(*) FROM employees');

    res.json({
      success: true,
      total: parseInt(totalCountRes.rows[0].count, 10),
      count: result.rows.length,
      employees: result.rows,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get detailed profile for an employee by ID
 */
const getEmployeeById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Normal employees can only view their own profile unless they are Admin/HR
    if (req.user.role === 'EMPLOYEE' && req.user.employee_id !== parseInt(id, 10)) {
      return res.status(403).json({ success: false, message: 'Forbidden. You can only view your own profile.' });
    }

    const empQuery = `
      SELECT 
        e.id,
        e.user_id,
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
        e.created_at,
        e.updated_at,
        u.email,
        u.role,
        u.is_active,
        u.is_verified,
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
      FROM employees e
      JOIN users u ON e.user_id = u.id
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN designations ds ON e.designation_id = ds.id
      LEFT JOIN salary_structures s ON e.id = s.employee_id
      WHERE e.id = $1
    `;
    const empRes = await pool.query(empQuery, [id]);

    if (empRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Employee profile not found.' });
    }

    // Fetch documents
    const docRes = await pool.query(
      `SELECT id, document_name, document_type, document_url, uploaded_at 
       FROM documents 
       WHERE employee_id = $1 
       ORDER BY uploaded_at DESC`,
      [id]
    );

    const emp = empRes.rows[0];

    res.json({
      success: true,
      employee: {
        id: emp.id,
        user_id: emp.user_id,
        employee_code: emp.employee_code,
        first_name: emp.first_name,
        last_name: emp.last_name,
        full_name: `${emp.first_name} ${emp.last_name}`,
        email: emp.email,
        role: emp.role,
        gender: emp.gender,
        date_of_birth: emp.date_of_birth,
        phone: emp.phone,
        address: emp.address,
        joining_date: emp.joining_date,
        profile_picture_url: emp.profile_picture_url,
        employment_status: emp.employment_status,
        department: { id: emp.department_id, name: emp.department_name },
        designation: { id: emp.designation_id, title: emp.designation_title },
        salary_structure: {
          basic_salary: emp.basic_salary,
          hra: emp.hra,
          allowances: emp.allowances,
          deductions: emp.deductions,
          net_salary: emp.net_salary,
          currency: emp.currency,
        },
        documents: docRes.rows,
        created_at: emp.created_at,
        updated_at: emp.updated_at,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Employee updates limited profile fields: phone, address, profile_picture_url
 */
const updateMyProfile = async (req, res, next) => {
  try {
    const employeeId = req.user.employee_id;
    if (!employeeId) {
      return res.status(400).json({ success: false, message: 'No employee profile linked to your account.' });
    }

    const { phone, address, profile_picture_url } = req.body;

    const updateQuery = `
      UPDATE employees 
      SET 
        phone = COALESCE($1, phone),
        address = COALESCE($2, address),
        profile_picture_url = COALESCE($3, profile_picture_url),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING id, employee_code, first_name, last_name, phone, address, profile_picture_url, updated_at
    `;
    const result = await pool.query(updateQuery, [phone, address, profile_picture_url, employeeId]);

    await logAudit({
      userId: req.user.user_id,
      action: 'UPDATE_OWN_PROFILE',
      entityType: 'EMPLOYEE',
      entityId: employeeId,
      details: { updated_fields: Object.keys(req.body) },
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      profile: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Admin / HR updates all employee details
 */
const updateEmployeeByAdmin = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const {
      first_name,
      last_name,
      gender,
      date_of_birth,
      phone,
      address,
      department_id,
      designation_id,
      joining_date,
      profile_picture_url,
      employment_status,
      basic_salary,
      hra,
      allowances,
      deductions,
    } = req.body;

    await client.query('BEGIN');

    const updateEmpQuery = `
      UPDATE employees 
      SET 
        first_name = COALESCE($1, first_name),
        last_name = COALESCE($2, last_name),
        gender = COALESCE($3, gender),
        date_of_birth = COALESCE($4, date_of_birth),
        phone = COALESCE($5, phone),
        address = COALESCE($6, address),
        department_id = COALESCE($7, department_id),
        designation_id = COALESCE($8, designation_id),
        joining_date = COALESCE($9, joining_date),
        profile_picture_url = COALESCE($10, profile_picture_url),
        employment_status = COALESCE($11, employment_status),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $12
      RETURNING *
    `;
    const empRes = await client.query(updateEmpQuery, [
      first_name,
      last_name,
      gender,
      date_of_birth,
      phone,
      address,
      department_id,
      designation_id,
      joining_date,
      profile_picture_url,
      employment_status,
      id,
    ]);

    if (empRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    // Update salary structure if salary numbers provided
    if (basic_salary !== undefined) {
      const basic = parseFloat(basic_salary) || 0;
      const h = parseFloat(hra) || 0;
      const allow = parseFloat(allowances) || 0;
      const ded = parseFloat(deductions) || 0;
      const net = basic + h + allow - ded;

      await client.query(
        `INSERT INTO salary_structures (employee_id, basic_salary, hra, allowances, deductions, net_salary)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (employee_id) DO UPDATE 
         SET basic_salary = EXCLUDED.basic_salary,
             hra = EXCLUDED.hra,
             allowances = EXCLUDED.allowances,
             deductions = EXCLUDED.deductions,
             net_salary = EXCLUDED.net_salary,
             updated_at = CURRENT_TIMESTAMP`,
        [id, basic, h, allow, ded, net]
      );
    }

    await client.query('COMMIT');

    const updatedEmp = empRes.rows[0];

    await logAudit({
      userId: req.user.user_id,
      action: 'ADMIN_UPDATE_EMPLOYEE',
      entityType: 'EMPLOYEE',
      entityId: id,
      details: { updated_by: req.user.email, employee_code: updatedEmp.employee_code },
      ipAddress: req.ip,
    });

    // Notify employee of profile update
    await sendNotification({
      userId: updatedEmp.user_id,
      title: 'Profile Updated',
      message: 'Your employee profile information has been updated by HR/Admin.',
    });

    res.json({
      success: true,
      message: 'Employee profile updated successfully.',
      employee: updatedEmp,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

module.exports = {
  listEmployees,
  getEmployeeById,
  updateMyProfile,
  updateEmployeeByAdmin,
};
