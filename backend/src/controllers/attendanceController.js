const { pool } = require('../config/db');
const { logAudit } = require('../utils/auditLogger');
const { sendNotification } = require('../utils/notifier');

/**
 * Check-in for current employee today
 */
const checkIn = async (req, res, next) => {
  try {
    const employeeId = req.user.employee_id;
    if (!employeeId) {
      return res.status(400).json({ success: false, message: 'No employee profile linked to this user.' });
    }

    const todayStr = new Date().toISOString().split('T')[0];

    // Check if record exists for today
    const existingRes = await pool.query(
      'SELECT id, check_in, check_out, status FROM attendances WHERE employee_id = $1 AND date = $2',
      [employeeId, todayStr]
    );

    if (existingRes.rows.length > 0) {
      const record = existingRes.rows[0];
      if (record.check_in) {
        return res.status(400).json({
          success: false,
          message: 'You have already checked in today.',
          attendance: record,
        });
      }
    }

    const query = `
      INSERT INTO attendances (employee_id, date, check_in, status)
      VALUES ($1, $2, CURRENT_TIMESTAMP, 'PRESENT')
      ON CONFLICT (employee_id, date) 
      DO UPDATE SET check_in = CURRENT_TIMESTAMP, status = 'PRESENT', updated_at = CURRENT_TIMESTAMP
      RETURNING id, employee_id, date, check_in, check_out, working_hours, status
    `;
    const result = await pool.query(query, [employeeId, todayStr]);

    await logAudit({
      userId: req.user.user_id,
      action: 'ATTENDANCE_CHECK_IN',
      entityType: 'ATTENDANCE',
      entityId: result.rows[0].id,
      details: { date: todayStr, check_in: result.rows[0].check_in },
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Checked in successfully!',
      attendance: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Check-out for current employee today
 */
const checkOut = async (req, res, next) => {
  try {
    const employeeId = req.user.employee_id;
    if (!employeeId) {
      return res.status(400).json({ success: false, message: 'No employee profile linked to this user.' });
    }

    const todayStr = new Date().toISOString().split('T')[0];

    // Check if already checked in
    const existingRes = await pool.query(
      'SELECT id, check_in, check_out FROM attendances WHERE employee_id = $1 AND date = $2',
      [employeeId, todayStr]
    );

    if (existingRes.rows.length === 0 || !existingRes.rows[0].check_in) {
      return res.status(400).json({
        success: false,
        message: 'You must check in first before checking out.',
      });
    }

    const checkInTime = new Date(existingRes.rows[0].check_in);
    const checkOutTime = new Date();
    const durationMs = checkOutTime - checkInTime;
    const workingHours = Math.round((durationMs / (1000 * 60 * 60)) * 100) / 100;

    // If working hours < 5 hours, mark as HALF_DAY, otherwise PRESENT
    const calculatedStatus = workingHours >= 5.0 ? 'PRESENT' : 'HALF_DAY';

    const updateQuery = `
      UPDATE attendances 
      SET 
        check_out = CURRENT_TIMESTAMP,
        working_hours = $1,
        status = $2,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING id, employee_id, date, check_in, check_out, working_hours, status
    `;
    const result = await pool.query(updateQuery, [
      workingHours,
      calculatedStatus,
      existingRes.rows[0].id,
    ]);

    await logAudit({
      userId: req.user.user_id,
      action: 'ATTENDANCE_CHECK_OUT',
      entityType: 'ATTENDANCE',
      entityId: result.rows[0].id,
      details: { date: todayStr, working_hours: workingHours, status: calculatedStatus },
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Checked out successfully!',
      attendance: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get current employee's attendance history (daily view, weekly view, date ranges)
 */
const getMyAttendance = async (req, res, next) => {
  try {
    const employeeId = req.user.employee_id;
    if (!employeeId) {
      return res.status(400).json({ success: false, message: 'No employee profile linked to user.' });
    }

    const { start_date, end_date, view = 'daily' } = req.query;

    let query = `
      SELECT 
        id,
        date,
        TO_CHAR(date, 'Dy, DD Mon YYYY') AS formatted_date,
        TO_CHAR(date, 'Dy') AS day_name,
        check_in,
        check_out,
        working_hours,
        status
      FROM attendances 
      WHERE employee_id = $1
    `;
    const params = [employeeId];

    if (start_date && end_date) {
      params.push(start_date, end_date);
      query += ` AND date BETWEEN $2 AND $3`;
    } else if (view === 'weekly') {
      // Default to current week (Monday to Sunday)
      query += ` AND date >= DATE_TRUNC('week', CURRENT_DATE) AND date <= DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '6 days'`;
    } else if (view === 'monthly') {
      // Default to current month
      query += ` AND date >= DATE_TRUNC('month', CURRENT_DATE)`;
    }
    // If view === 'all' or default, return complete history (ordered by date DESC)

    query += ` ORDER BY date DESC LIMIT 100`;

    const result = await pool.query(query, params);

    res.json({
      success: true,
      count: result.rows.length,
      view,
      attendance: result.rows,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Admin / HR view all employee attendance records with filters
 */
const getAllAttendance = async (req, res, next) => {
  try {
    const { date, start_date, end_date, department_id, employee_id, status, limit = 100, offset = 0 } = req.query;

    let query = `
      SELECT 
        a.id,
        a.date,
        TO_CHAR(a.date, 'Dy, DD Mon YYYY') AS formatted_date,
        a.employee_id,
        e.employee_code,
        e.first_name || ' ' || e.last_name AS employee_name,
        d.name AS department_name,
        ds.title AS designation_title,
        a.check_in,
        a.check_out,
        a.working_hours,
        a.status
      FROM attendances a
      JOIN employees e ON a.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN designations ds ON e.designation_id = ds.id
      WHERE 1=1
    `;
    const params = [];

    if (date) {
      params.push(date);
      query += ` AND a.date = $${params.length}`;
    } else if (start_date && end_date) {
      params.push(start_date, end_date);
      query += ` AND a.date BETWEEN $${params.length - 1} AND $${params.length}`;
    }

    if (department_id) {
      params.push(department_id);
      query += ` AND e.department_id = $${params.length}`;
    }

    if (employee_id) {
      params.push(employee_id);
      query += ` AND a.employee_id = $${params.length}`;
    }

    if (status) {
      params.push(status);
      query += ` AND a.status = $${params.length}`;
    }

    query += ` ORDER BY a.date DESC, e.id ASC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.json({
      success: true,
      count: result.rows.length,
      attendance: result.rows,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Admin / HR regularize or modify an attendance record
 */
const regularizeAttendance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { check_in, check_out, working_hours, status, remarks } = req.body;

    const query = `
      UPDATE attendances 
      SET 
        check_in = COALESCE($1, check_in),
        check_out = COALESCE($2, check_out),
        working_hours = COALESCE($3, working_hours),
        status = COALESCE($4, status),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *
    `;
    const result = await pool.query(query, [check_in, check_out, working_hours, status, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Attendance record not found.' });
    }

    await logAudit({
      userId: req.user.user_id,
      action: 'MODIFY_ATTENDANCE',
      entityType: 'ATTENDANCE',
      entityId: id,
      details: { modified_by: req.user.email, new_status: status, remarks },
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Attendance record regularized successfully.',
      attendance: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  checkIn,
  checkOut,
  getMyAttendance,
  getAllAttendance,
  regularizeAttendance,
};
