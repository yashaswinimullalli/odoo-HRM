const { pool } = require('../config/db');
const { logAudit } = require('../utils/auditLogger');
const { sendNotification } = require('../utils/notifier');
const { getSalaryCreditedEmailTemplate } = require('../services/emailService');

/**
 * Employee view own monthly payroll history (READ-ONLY)
 */
const getMyPayroll = async (req, res, next) => {
  try {
    const employeeId = req.user.employee_id;
    if (!employeeId) {
      return res.status(400).json({ success: false, message: 'No employee profile linked to user.' });
    }

    const { year } = req.query;
    let query = `
      SELECT 
        id,
        month,
        year,
        TO_CHAR(TO_DATE(month::text, 'MM'), 'Month') AS month_name,
        basic_salary,
        hra,
        allowances,
        deductions,
        net_salary,
        payment_status,
        payment_date,
        remarks,
        created_at
      FROM payrolls
      WHERE employee_id = $1
    `;
    const params = [employeeId];

    if (year) {
      params.push(year);
      query += ` AND year = $2`;
    }

    query += ` ORDER BY year DESC, month DESC`;

    const result = await pool.query(query, params);

    res.json({
      success: true,
      count: result.rows.length,
      payrolls: result.rows,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Employee view own base salary structure (READ-ONLY)
 */
const getMySalaryStructure = async (req, res, next) => {
  try {
    const employeeId = req.user.employee_id;
    if (!employeeId) {
      return res.status(400).json({ success: false, message: 'No employee profile linked to user.' });
    }

    const query = `
      SELECT 
        s.id,
        s.employee_id,
        e.employee_code,
        s.basic_salary,
        s.hra,
        s.allowances,
        s.deductions,
        s.net_salary,
        s.currency,
        s.updated_at
      FROM salary_structures s
      JOIN employees e ON s.employee_id = e.id
      WHERE s.employee_id = $1
    `;
    const result = await pool.query(query, [employeeId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Salary structure not found.' });
    }

    res.json({
      success: true,
      salary_structure: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Admin view all payroll records with filters (month, year, payment_status, department)
 */
const getAllPayrolls = async (req, res, next) => {
  try {
    const { month, year, payment_status, department_id, employee_id, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT 
        p.id,
        p.employee_id,
        e.employee_code,
        e.first_name || ' ' || e.last_name AS employee_name,
        d.name AS department_name,
        p.month,
        p.year,
        TO_CHAR(TO_DATE(p.month::text, 'MM'), 'Month') AS month_name,
        p.basic_salary,
        p.hra,
        p.allowances,
        p.deductions,
        p.net_salary,
        p.payment_status,
        p.payment_date,
        p.remarks,
        p.created_at
      FROM payrolls p
      JOIN employees e ON p.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE 1=1
    `;
    const params = [];

    if (month) {
      params.push(month);
      query += ` AND p.month = $${params.length}`;
    }

    if (year) {
      params.push(year);
      query += ` AND p.year = $${params.length}`;
    }

    if (payment_status) {
      params.push(payment_status.toUpperCase());
      query += ` AND p.payment_status = $${params.length}`;
    }

    if (department_id) {
      params.push(department_id);
      query += ` AND e.department_id = $${params.length}`;
    }

    if (employee_id) {
      params.push(employee_id);
      query += ` AND p.employee_id = $${params.length}`;
    }

    query += ` ORDER BY p.year DESC, p.month DESC, e.id ASC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Get total disbursement summary
    const summaryRes = await pool.query(
      `SELECT COUNT(*) AS total_records, COALESCE(SUM(net_salary), 0) AS total_amount FROM payrolls`
    );

    res.json({
      success: true,
      summary: summaryRes.rows[0],
      count: result.rows.length,
      payrolls: result.rows,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Admin update salary structure for an employee
 */
const updateSalaryStructure = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const { basic_salary, hra = 0, allowances = 0, deductions = 0, currency = 'INR' } = req.body;

    if (basic_salary === undefined) {
      return res.status(400).json({ success: false, message: 'basic_salary is required.' });
    }

    const basic = parseFloat(basic_salary) || 0;
    const h = parseFloat(hra) || 0;
    const allow = parseFloat(allowances) || 0;
    const ded = parseFloat(deductions) || 0;
    const net = basic + h + allow - ded;

    const query = `
      INSERT INTO salary_structures (employee_id, basic_salary, hra, allowances, deductions, net_salary, currency)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (employee_id) DO UPDATE 
      SET 
        basic_salary = EXCLUDED.basic_salary,
        hra = EXCLUDED.hra,
        allowances = EXCLUDED.allowances,
        deductions = EXCLUDED.deductions,
        net_salary = EXCLUDED.net_salary,
        currency = EXCLUDED.currency,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    const result = await pool.query(query, [employeeId, basic, h, allow, ded, net, currency]);

    // Fetch user_id for notification
    const empRes = await pool.query('SELECT user_id, employee_code, first_name, last_name FROM employees WHERE id = $1', [employeeId]);
    if (empRes.rows.length > 0) {
      await sendNotification({
        userId: empRes.rows[0].user_id,
        title: 'Salary Structure Updated',
        message: `Your monthly compensation package has been updated by Admin. Net Salary: INR ${net.toLocaleString()}.`,
        notificationType: 'PAYROLL_UPDATED',
        relatedEntityType: 'PAYROLL',
        relatedEntityId: employeeId,
      });
    }

    await logAudit({
      userId: req.user.user_id,
      action: 'UPDATE_SALARY_STRUCTURE',
      entityType: 'SALARY_STRUCTURE',
      entityId: employeeId,
      details: { net_salary: net, currency },
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Salary structure updated successfully.',
      salary_structure: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Admin generate/process monthly payroll batch for all active employees
 */
const processMonthlyBatch = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { month, year } = req.body;

    if (!month || !year) {
      return res.status(400).json({ success: false, message: 'Please provide month (1-12) and year.' });
    }

    await client.query('BEGIN');

    // Fetch active employees with configured salary structures
    const employeesRes = await client.query(`
      SELECT e.id AS employee_id, s.basic_salary, s.hra, s.allowances, s.deductions, s.net_salary
      FROM employees e
      JOIN salary_structures s ON e.id = s.employee_id
      WHERE e.employment_status = 'ACTIVE'
    `);

    let processedCount = 0;
    for (const emp of employeesRes.rows) {
      await client.query(`
        INSERT INTO payrolls (
          employee_id, month, year, basic_salary, hra, allowances, deductions, net_salary, payment_status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'PROCESSED')
        ON CONFLICT (employee_id, month, year) 
        DO UPDATE SET 
          basic_salary = EXCLUDED.basic_salary,
          hra = EXCLUDED.hra,
          allowances = EXCLUDED.allowances,
          deductions = EXCLUDED.deductions,
          net_salary = EXCLUDED.net_salary,
          payment_status = 'PROCESSED',
          updated_at = CURRENT_TIMESTAMP
      `, [emp.employee_id, month, year, emp.basic_salary, emp.hra, emp.allowances, emp.deductions, emp.net_salary]);
      processedCount++;
    }

    await client.query('COMMIT');

    await logAudit({
      userId: req.user.user_id,
      action: 'PROCESS_PAYROLL_BATCH',
      entityType: 'PAYROLL',
      entityId: `${year}_${month}`,
      details: { month, year, records_processed: processedCount },
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: `Successfully processed payroll batch for ${month}/${year}.`,
      processed_count: processedCount,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

/**
 * Admin update status of a specific payroll record (e.g. mark as PAID)
 */
const updatePayrollStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { payment_status, payment_date, remarks } = req.body;

    if (!payment_status || !['PENDING', 'PROCESSED', 'PAID', 'FAILED'].includes(payment_status.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: 'Valid payment_status required: PENDING, PROCESSED, PAID, FAILED.',
      });
    }

    const query = `
      UPDATE payrolls 
      SET 
        payment_status = $1,
        payment_date = COALESCE($2, payment_date, CURRENT_DATE),
        remarks = COALESCE($3, remarks),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *
    `;
    const result = await pool.query(query, [payment_status.toUpperCase(), payment_date, remarks, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Payroll record not found.' });
    }

    const record = result.rows[0];

    // Notify employee if marked as PAID
    if (payment_status.toUpperCase() === 'PAID') {
      const empRes = await pool.query(
        'SELECT user_id, first_name, last_name FROM employees WHERE id = $1',
        [record.employee_id]
      );
      if (empRes.rows.length > 0) {
        const emp = empRes.rows[0];
        const empName = `${emp.first_name || ''} ${emp.last_name || ''}`.trim();
        const emailHtml = getSalaryCreditedEmailTemplate({
          employeeName: empName,
          month: record.month,
          year: record.year,
          netSalary: record.net_salary,
        });

        await sendNotification({
          userId: emp.user_id,
          title: 'Salary Credited',
          message: `Your salary for ${record.month}/${record.year} of INR ${parseFloat(record.net_salary).toLocaleString()} has been credited.`,
          notificationType: 'PAYROLL_UPDATED',
          relatedEntityType: 'PAYROLL',
          relatedEntityId: record.id,
          emailHtml,
        });
      }
    }

    res.json({
      success: true,
      message: 'Payroll status updated successfully.',
      payroll: record,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMyPayroll,
  getMySalaryStructure,
  getAllPayrolls,
  updateSalaryStructure,
  processMonthlyBatch,
  updatePayrollStatus,
};
