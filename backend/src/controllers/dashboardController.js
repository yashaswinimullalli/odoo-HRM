const { pool } = require('../config/db');

/**
 * Employee Dashboard
 * Displays: quick profile summary, today's attendance status, recent leaves, unread alerts, recent activities
 */
const getEmployeeDashboard = async (req, res, next) => {
  try {
    const employeeId = req.user.employee_id;
    const userId = req.user.user_id;

    if (!employeeId) {
      return res.status(400).json({ success: false, message: 'No employee profile linked to user.' });
    }

    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Today's attendance
    const attendanceTodayRes = await pool.query(
      `SELECT id, date, check_in, check_out, working_hours, status 
       FROM attendances 
       WHERE employee_id = $1 AND date = $2`,
      [employeeId, todayStr]
    );

    // 2. Attendance metrics this month
    const attendanceStatsRes = await pool.query(
      `SELECT 
        COUNT(*) FILTER (WHERE status = 'PRESENT') AS days_present,
        COUNT(*) FILTER (WHERE status = 'HALF_DAY') AS half_days,
        COUNT(*) FILTER (WHERE status = 'LEAVE') AS leave_days,
        COUNT(*) FILTER (WHERE status = 'ABSENT') AS absent_days,
        COALESCE(SUM(working_hours), 0) AS total_hours_worked
       FROM attendances 
       WHERE employee_id = $1 AND date >= DATE_TRUNC('month', CURRENT_DATE)`,
      [employeeId]
    );

    // 3. Recent Leave Requests (latest 5)
    const recentLeavesRes = await pool.query(
      `SELECT id, leave_type, start_date, end_date, reason, status, reviewer_comment, created_at 
       FROM leaves 
       WHERE employee_id = $1 
       ORDER BY created_at DESC 
       LIMIT 5`,
      [employeeId]
    );

    // 4. Latest Payroll Status
    const latestPayrollRes = await pool.query(
      `SELECT month, year, net_salary, payment_status, payment_date, remarks 
       FROM payrolls 
       WHERE employee_id = $1 
       ORDER BY year DESC, month DESC 
       LIMIT 1`,
      [employeeId]
    );

    // 5. Unread Notifications / Alerts
    const notificationsRes = await pool.query(
      `SELECT id, title, message, notification_type, is_read, created_at 
       FROM notifications 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 5`,
      [userId]
    );

    // 6. Recent Activity Log for this user
    const recentActivitiesRes = await pool.query(
      `SELECT id, action, entity_type, details, created_at 
       FROM audit_logs 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 5`,
      [userId]
    );

    res.json({
      success: true,
      data: {
        today_attendance: attendanceTodayRes.rows[0] || { status: 'NOT_CHECKED_IN' },
        attendance_stats: attendanceStatsRes.rows[0],
        recent_leaves: recentLeavesRes.rows,
        latest_payroll: latestPayrollRes.rows[0] || null,
        alerts: notificationsRes.rows,
        recent_activities: recentActivitiesRes.rows,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Admin / HR Dashboard
 * Displays: Total employees, department count, today's attendance summary, pending leave approvals,
 * payroll summary, recent system activities.
 */
const getAdminDashboard = async (req, res, next) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];

    // 1. High-level metric counts
    const countsRes = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM employees WHERE employment_status = 'ACTIVE') AS total_active_employees,
        (SELECT COUNT(*) FROM departments) AS total_departments,
        (SELECT COUNT(*) FROM leaves WHERE status = 'PENDING') AS pending_leave_requests,
        (SELECT COUNT(*) FROM payrolls WHERE payment_status = 'PROCESSED') AS processed_payrolls_pending_payout
    `);

    // 2. Today's Attendance overview across company
    const attendanceTodayRes = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'PRESENT') AS present_count,
        COUNT(*) FILTER (WHERE status = 'HALF_DAY') AS half_day_count,
        COUNT(*) FILTER (WHERE status = 'LEAVE') AS on_leave_count,
        COUNT(*) FILTER (WHERE status = 'ABSENT') AS absent_count
      FROM attendances 
      WHERE date = CURRENT_DATE
    `);

    // 3. Pending leave requests requiring review
    const pendingLeavesRes = await pool.query(`
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
        l.created_at
      FROM leaves l
      JOIN employees e ON l.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE l.status = 'PENDING'
      ORDER BY l.created_at ASC
      LIMIT 10
    `);

    // 4. Recent Employee List preview
    const recentEmployeesRes = await pool.query(`
      SELECT 
        e.id,
        e.employee_code,
        e.first_name || ' ' || e.last_name AS full_name,
        d.name AS department,
        ds.title AS designation,
        e.joining_date,
        e.employment_status
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN designations ds ON e.designation_id = ds.id
      ORDER BY e.created_at DESC
      LIMIT 5
    `);

    // 5. Recent System-wide Audit Activities
    const recentSystemActivityRes = await pool.query(`
      SELECT 
        a.id,
        u.email AS user_email,
        u.role AS user_role,
        a.action,
        a.entity_type,
        a.entity_id,
        a.details,
        a.created_at
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY a.created_at DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      data: {
        summary: countsRes.rows[0],
        today_attendance: attendanceTodayRes.rows[0],
        pending_leaves: pendingLeavesRes.rows,
        recent_employees: recentEmployeesRes.rows,
        recent_system_activities: recentSystemActivityRes.rows,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Admin / HR Action Items Feed
 * Aggregates urgent pending decisions across HR operations (Leaves, Absences, Incomplete Profiles, Unprocessed Payrolls)
 */
const getAdminActionItems = async (req, res, next) => {
  try {
    // 1. Pending Leave Approvals
    const pendingLeavesRes = await pool.query(`
      SELECT 
        l.id,
        l.employee_id,
        e.employee_code,
        e.first_name || ' ' || e.last_name AS employee_name,
        d.name AS department_name,
        l.leave_type,
        l.start_date,
        l.end_date,
        (l.end_date - l.start_date + 1) AS total_days,
        l.reason,
        l.created_at,
        'LEAVE_APPROVAL' AS item_type,
        'HIGH' AS priority
      FROM leaves l
      JOIN employees e ON l.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE l.status = 'PENDING'
      ORDER BY l.created_at ASC
    `);

    // 2. Unexplained Absences Today
    const todayAbsencesRes = await pool.query(`
      SELECT 
        a.id AS attendance_id,
        e.id AS employee_id,
        e.employee_code,
        e.first_name || ' ' || e.last_name AS employee_name,
        d.name AS department_name,
        a.date,
        'UNEXPLAINED_ABSENCE' AS item_type,
        'MEDIUM' AS priority
      FROM attendances a
      JOIN employees e ON a.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE a.date = CURRENT_DATE AND a.status = 'ABSENT'
    `);

    // 3. Incomplete Employee Profiles (Missing bank info or PAN or emergency contact)
    const incompleteProfilesRes = await pool.query(`
      SELECT 
        e.id AS employee_id,
        e.employee_code,
        e.first_name || ' ' || e.last_name AS employee_name,
        d.name AS department_name,
        CASE 
          WHEN e.bank_account_number IS NULL OR e.bank_account_number = '' THEN 'Missing Bank Account'
          WHEN e.pan_number IS NULL OR e.pan_number = '' THEN 'Missing PAN Card'
          WHEN e.emergency_contact_phone IS NULL OR e.emergency_contact_phone = '' THEN 'Missing Emergency Contact'
          ELSE 'Incomplete Profile'
        END AS missing_detail,
        'PROFILE_COMPLIANCE' AS item_type,
        'LOW' AS priority
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE e.employment_status = 'ACTIVE' 
        AND (e.bank_account_number IS NULL OR e.pan_number IS NULL OR e.emergency_contact_phone IS NULL)
      LIMIT 10
    `);

    // 4. Unconfigured Salary Structures
    const unconfiguredSalariesRes = await pool.query(`
      SELECT 
        e.id AS employee_id,
        e.employee_code,
        e.first_name || ' ' || e.last_name AS employee_name,
        d.name AS department_name,
        'SALARY_SETUP' AS item_type,
        'HIGH' AS priority
      FROM employees e
      LEFT JOIN salary_structures s ON e.id = s.employee_id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE e.employment_status = 'ACTIVE' AND s.id IS NULL
    `);

    const totalActionItems =
      pendingLeavesRes.rows.length +
      todayAbsencesRes.rows.length +
      incompleteProfilesRes.rows.length +
      unconfiguredSalariesRes.rows.length;

    res.json({
      success: true,
      total_action_items: totalActionItems,
      action_items: {
        pending_leaves: pendingLeavesRes.rows,
        today_absences: todayAbsencesRes.rows,
        incomplete_profiles: incompleteProfilesRes.rows,
        unconfigured_salaries: unconfiguredSalariesRes.rows,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Recent Activity Feed
 */
const getRecentActivities = async (req, res, next) => {
  try {
    const { limit = 20, offset = 0 } = req.query;

    const query = `
      SELECT 
        a.id,
        a.user_id,
        u.email AS user_email,
        u.role AS user_role,
        a.action,
        a.entity_type,
        a.entity_id,
        a.details,
        a.ip_address,
        a.created_at
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY a.created_at DESC
      LIMIT $1 OFFSET $2
    `;
    const result = await pool.query(query, [parseInt(limit, 10), parseInt(offset, 10)]);

    res.json({
      success: true,
      count: result.rows.length,
      activities: result.rows,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getEmployeeDashboard,
  getAdminDashboard,
  getAdminActionItems,
  getRecentActivities,
};
