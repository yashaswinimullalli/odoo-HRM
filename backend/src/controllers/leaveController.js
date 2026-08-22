const { pool } = require('../config/db');
const { logAudit } = require('../utils/auditLogger');
const { sendNotification } = require('../utils/notifier');

/**
 * Apply for a leave request (Employee)
 * Body: { leave_type, start_date, end_date, reason }
 */
const applyLeave = async (req, res, next) => {
  try {
    const employeeId = req.user.employee_id;
    if (!employeeId) {
      return res.status(400).json({ success: false, message: 'No employee profile linked to user.' });
    }

    const { leave_type, start_date, end_date, reason } = req.body;

    if (!leave_type || !start_date || !end_date || !reason) {
      return res.status(400).json({
        success: false,
        message: 'leave_type, start_date, end_date, and reason are required.',
      });
    }

    if (!['PAID', 'SICK', 'UNPAID'].includes(leave_type.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid leave type. Allowed: PAID, SICK, UNPAID.',
      });
    }

    if (new Date(end_date) < new Date(start_date)) {
      return res.status(400).json({
        success: false,
        message: 'End date cannot be earlier than start date.',
      });
    }

    const insertQuery = `
      INSERT INTO leaves (employee_id, leave_type, start_date, end_date, reason, status)
      VALUES ($1, $2, $3, $4, $5, 'PENDING')
      RETURNING *
    `;
    const result = await pool.query(insertQuery, [
      employeeId,
      leave_type.toUpperCase(),
      start_date,
      end_date,
      reason.trim(),
    ]);
    const leave = result.rows[0];

    // Log Audit
    await logAudit({
      userId: req.user.user_id,
      action: 'APPLY_LEAVE',
      entityType: 'LEAVE',
      entityId: leave.id,
      details: { leave_type, start_date, end_date, reason },
      ipAddress: req.ip,
    });

    // Notify HR / Admins of new pending leave request
    const hrUsersRes = await pool.query("SELECT id FROM users WHERE role IN ('ADMIN', 'HR')");
    for (const hr of hrUsersRes.rows) {
      await sendNotification({
        userId: hr.id,
        title: 'New Leave Request',
        message: `${req.user.first_name || 'An employee'} (${req.user.employee_code}) requested ${leave_type} leave from ${start_date} to ${end_date}.`,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Leave request submitted successfully.',
      leave,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get current employee's leave history
 */
const getMyLeaves = async (req, res, next) => {
  try {
    const employeeId = req.user.employee_id;
    if (!employeeId) {
      return res.status(400).json({ success: false, message: 'No employee profile linked to user.' });
    }

    const query = `
      SELECT 
        l.id,
        l.leave_type,
        l.start_date,
        l.end_date,
        l.reason,
        l.status,
        l.reviewer_comment,
        l.reviewed_at,
        u.email AS reviewer_email,
        l.created_at
      FROM leaves l
      LEFT JOIN users u ON l.reviewed_by = u.id
      WHERE l.employee_id = $1
      ORDER BY l.created_at DESC
    `;
    const result = await pool.query(query, [employeeId]);

    res.json({
      success: true,
      count: result.rows.length,
      leaves: result.rows,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Admin / HR view all leave requests
 */
const getAllLeaves = async (req, res, next) => {
  try {
    const { status, leave_type, employee_id, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT 
        l.id,
        l.employee_id,
        e.employee_code,
        e.first_name || ' ' || e.last_name AS employee_name,
        d.name AS department_name,
        l.leave_type,
        l.start_date,
        l.end_date,
        l.reason,
        l.status,
        l.reviewed_by,
        ru.email AS reviewer_email,
        l.reviewer_comment,
        l.reviewed_at,
        l.created_at
      FROM leaves l
      JOIN employees e ON l.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN users ru ON l.reviewed_by = ru.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      params.push(status.toUpperCase());
      query += ` AND l.status = $${params.length}`;
    }

    if (leave_type) {
      params.push(leave_type.toUpperCase());
      query += ` AND l.leave_type = $${params.length}`;
    }

    if (employee_id) {
      params.push(employee_id);
      query += ` AND l.employee_id = $${params.length}`;
    }

    query += ` ORDER BY l.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.json({
      success: true,
      count: result.rows.length,
      leaves: result.rows,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Admin / HR review a leave request (APPROVE or REJECT)
 * Body: { status: 'APPROVED' | 'REJECTED', reviewer_comment }
 */
const reviewLeave = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { status, reviewer_comment } = req.body;

    if (!status || !['APPROVED', 'REJECTED'].includes(status.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either APPROVED or REJECTED.',
      });
    }

    await client.query('BEGIN');

    // Get current leave details
    const leaveCheck = await client.query(
      `SELECT l.*, e.user_id, e.employee_code 
       FROM leaves l 
       JOIN employees e ON l.employee_id = e.id 
       WHERE l.id = $1`,
      [id]
    );

    if (leaveCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Leave request not found.' });
    }

    const leave = leaveCheck.rows[0];

    // Update leave request
    const updateRes = await client.query(
      `UPDATE leaves 
       SET 
         status = $1,
         reviewed_by = $2,
         reviewer_comment = $3,
         reviewed_at = CURRENT_TIMESTAMP,
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [status.toUpperCase(), req.user.user_id, reviewer_comment || null, id]
    );
    const updatedLeave = updateRes.rows[0];

    // If APPROVED, mark attendance records as 'LEAVE' for that range
    if (status.toUpperCase() === 'APPROVED') {
      const datesRes = await client.query(
        `SELECT generate_series($1::date, $2::date, '1 day'::interval)::date AS leave_day`,
        [leave.start_date, leave.end_date]
      );

      for (const row of datesRes.rows) {
        await client.query(
          `INSERT INTO attendances (employee_id, date, check_in, check_out, working_hours, status)
           VALUES ($1, $2, NULL, NULL, 0.00, 'LEAVE')
           ON CONFLICT (employee_id, date) 
           DO UPDATE SET status = 'LEAVE', check_in = NULL, check_out = NULL, working_hours = 0.00, updated_at = CURRENT_TIMESTAMP`,
          [leave.employee_id, row.leave_day]
        );
      }
    }

    await client.query('COMMIT');

    // Audit log
    await logAudit({
      userId: req.user.user_id,
      action: status.toUpperCase() === 'APPROVED' ? 'APPROVE_LEAVE' : 'REJECT_LEAVE',
      entityType: 'LEAVE',
      entityId: id,
      details: {
        employee_code: leave.employee_code,
        status: status.toUpperCase(),
        comment: reviewer_comment,
      },
      ipAddress: req.ip,
    });

    // Notify employee of review outcome
    await sendNotification({
      userId: leave.user_id,
      title: `Leave Request ${status.toUpperCase() === 'APPROVED' ? 'Approved' : 'Rejected'}`,
      message: `Your ${leave.leave_type} leave (${leave.start_date} to ${leave.end_date}) was ${status.toLowerCase()}.${
        reviewer_comment ? ` Remarks: "${reviewer_comment}"` : ''
      }`,
    });

    res.json({
      success: true,
      message: `Leave request ${status.toLowerCase()} successfully.`,
      leave: updatedLeave,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

module.exports = {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  reviewLeave,
};
