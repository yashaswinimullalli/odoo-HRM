const { pool } = require('../config/db');

/**
 * Attendance Analytics
 * Dynamic SQL aggregates for attendance rates, daily/monthly trends, and department breakdowns.
 * Role-aware: Employees see personal stats; Admins/HR see company-wide stats.
 */
const getAttendanceAnalytics = async (req, res, next) => {
  try {
    const userRole = req.user.role;
    const employeeId = req.user.employee_id;
    const { start_date, end_date, department_id, year } = req.query;

    const isAdminOrHR = ['ADMIN', 'HR'].includes(userRole);

    if (!isAdminOrHR) {
      // -------------------------------------------------------------
      // Employee Personal Attendance Analytics
      // -------------------------------------------------------------
      if (!employeeId) {
        return res.status(400).json({ success: false, message: 'No employee profile linked to user.' });
      }

      let dateFilter = `AND a.date >= DATE_TRUNC('year', CURRENT_DATE)`;
      const params = [employeeId];

      if (start_date && end_date) {
        params.push(start_date, end_date);
        dateFilter = `AND a.date BETWEEN $2 AND $3`;
      } else if (year) {
        params.push(year);
        dateFilter = `AND EXTRACT(YEAR FROM a.date) = $2`;
      }

      // 1. Overall Summary
      const summaryQuery = `
        SELECT 
          COUNT(*) AS total_recorded_days,
          COUNT(*) FILTER (WHERE a.status = 'PRESENT') AS present_days,
          COUNT(*) FILTER (WHERE a.status = 'HALF_DAY') AS half_days,
          COUNT(*) FILTER (WHERE a.status = 'LEAVE') AS leave_days,
          COUNT(*) FILTER (WHERE a.status = 'ABSENT') AS absent_days,
          COALESCE(SUM(a.working_hours), 0) AS total_hours_worked,
          COALESCE(ROUND(AVG(a.working_hours) FILTER (WHERE a.status IN ('PRESENT', 'HALF_DAY')), 2), 0) AS avg_daily_hours
        FROM attendances a
        WHERE a.employee_id = $1 ${dateFilter}
      `;
      const summaryRes = await pool.query(summaryQuery, params);
      const stats = summaryRes.rows[0];

      const present = parseInt(stats.present_days, 10) || 0;
      const half = parseInt(stats.half_days, 10) || 0;
      const total = parseInt(stats.total_recorded_days, 10) || 0;
      const attendancePercentage = total > 0 ? Math.round(((present + half * 0.5) / total) * 1000) / 10 : 0;

      // 2. Monthly breakdown
      const monthlyQuery = `
        SELECT 
          TO_CHAR(a.date, 'Mon') AS month_name,
          EXTRACT(MONTH FROM a.date) AS month_num,
          COUNT(*) FILTER (WHERE a.status = 'PRESENT') AS present,
          COUNT(*) FILTER (WHERE a.status = 'HALF_DAY') AS half_day,
          COUNT(*) FILTER (WHERE a.status = 'LEAVE') AS leave,
          COUNT(*) FILTER (WHERE a.status = 'ABSENT') AS absent,
          COALESCE(SUM(a.working_hours), 0) AS total_hours
        FROM attendances a
        WHERE a.employee_id = $1 ${dateFilter}
        GROUP BY TO_CHAR(a.date, 'Mon'), EXTRACT(MONTH FROM a.date)
        ORDER BY month_num ASC
      `;
      const monthlyRes = await pool.query(monthlyQuery, params);

      // 3. Recent 14-day timeline
      const timelineQuery = `
        SELECT a.date, TO_CHAR(a.date, 'Dy, DD Mon') AS formatted_date, a.status, a.working_hours, a.check_in, a.check_out
        FROM attendances a
        WHERE a.employee_id = $1
        ORDER BY a.date DESC
        LIMIT 14
      `;
      const timelineRes = await pool.query(timelineQuery, [employeeId]);

      return res.json({
        success: true,
        role: 'EMPLOYEE',
        summary: {
          ...stats,
          attendance_percentage: attendancePercentage,
        },
        monthly_trend: monthlyRes.rows,
        recent_timeline: timelineRes.rows,
      });
    }

    // -------------------------------------------------------------
    // Admin / HR Organization-wide Attendance Analytics
    // -------------------------------------------------------------
    const conditions = [];
    const params = [];

    if (start_date && end_date) {
      params.push(start_date, end_date);
      conditions.push(`a.date BETWEEN $${params.length - 1} AND $${params.length}`);
    } else if (year) {
      params.push(year);
      conditions.push(`EXTRACT(YEAR FROM a.date) = $${params.length}`);
    } else {
      // Default to last 30 days
      conditions.push(`a.date >= CURRENT_DATE - INTERVAL '30 days'`);
    }

    if (department_id) {
      params.push(department_id);
      conditions.push(`e.department_id = $${params.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // 1. Company-wide summary stats
    const summaryQuery = `
      SELECT 
        COUNT(*) AS total_records,
        COUNT(*) FILTER (WHERE a.status = 'PRESENT') AS total_present,
        COUNT(*) FILTER (WHERE a.status = 'HALF_DAY') AS total_half_day,
        COUNT(*) FILTER (WHERE a.status = 'LEAVE') AS total_leave,
        COUNT(*) FILTER (WHERE a.status = 'ABSENT') AS total_absent,
        COALESCE(ROUND(AVG(a.working_hours) FILTER (WHERE a.status IN ('PRESENT', 'HALF_DAY')), 2), 0) AS avg_working_hours,
        COALESCE(SUM(a.working_hours), 0) AS total_hours_worked
      FROM attendances a
      JOIN employees e ON a.employee_id = e.id
      ${whereClause}
    `;
    const summaryRes = await pool.query(summaryQuery, params);
    const orgStats = summaryRes.rows[0];

    const present = parseInt(orgStats.total_present, 10) || 0;
    const half = parseInt(orgStats.total_half_day, 10) || 0;
    const total = parseInt(orgStats.total_records, 10) || 0;
    const overallRate = total > 0 ? Math.round(((present + half * 0.5) / total) * 1000) / 10 : 0;

    // 2. Department Breakdown
    const deptQuery = `
      SELECT 
        d.id AS department_id,
        COALESCE(d.name, 'Unassigned') AS department_name,
        COUNT(a.id) AS total_records,
        COUNT(*) FILTER (WHERE a.status = 'PRESENT') AS present_count,
        COUNT(*) FILTER (WHERE a.status = 'HALF_DAY') AS half_day_count,
        COUNT(*) FILTER (WHERE a.status = 'ABSENT') AS absent_count,
        COUNT(*) FILTER (WHERE a.status = 'LEAVE') AS leave_count,
        ROUND(
          (COUNT(*) FILTER (WHERE a.status = 'PRESENT')::numeric + COUNT(*) FILTER (WHERE a.status = 'HALF_DAY')::numeric * 0.5) * 100.0 / NULLIF(COUNT(a.id), 0),
          1
        ) AS attendance_rate_pct
      FROM attendances a
      JOIN employees e ON a.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      ${whereClause}
      GROUP BY d.id, d.name
      ORDER BY attendance_rate_pct DESC NULLS LAST
    `;
    const deptRes = await pool.query(deptQuery, params);

    // 3. Daily Attendance Trend (Last 14 days in scope)
    const dailyTrendQuery = `
      SELECT 
        a.date,
        TO_CHAR(a.date, 'YYYY-MM-DD') AS date_str,
        TO_CHAR(a.date, 'Dy, DD Mon') AS label,
        COUNT(*) FILTER (WHERE a.status = 'PRESENT') AS present,
        COUNT(*) FILTER (WHERE a.status = 'HALF_DAY') AS half_day,
        COUNT(*) FILTER (WHERE a.status = 'LEAVE') AS on_leave,
        COUNT(*) FILTER (WHERE a.status = 'ABSENT') AS absent
      FROM attendances a
      JOIN employees e ON a.employee_id = e.id
      ${whereClause}
      GROUP BY a.date
      ORDER BY a.date DESC
      LIMIT 14
    `;
    const dailyTrendRes = await pool.query(dailyTrendQuery, params);

    res.json({
      success: true,
      role: userRole,
      summary: {
        ...orgStats,
        overall_attendance_rate: overallRate,
      },
      department_breakdown: deptRes.rows,
      daily_trend: dailyTrendRes.rows.reverse(),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Leaves Analytics
 * Aggregation of leave requests, approval ratios, leave types distribution, and department usage.
 */
const getLeaveAnalytics = async (req, res, next) => {
  try {
    const userRole = req.user.role;
    const employeeId = req.user.employee_id;
    const { year = new Date().getFullYear(), department_id } = req.query;

    const isAdminOrHR = ['ADMIN', 'HR'].includes(userRole);

    if (!isAdminOrHR) {
      // -------------------------------------------------------------
      // Employee Personal Leaves Analytics
      // -------------------------------------------------------------
      if (!employeeId) {
        return res.status(400).json({ success: false, message: 'No employee profile linked to user.' });
      }

      const summaryQuery = `
        SELECT 
          COUNT(*) AS total_requests,
          COUNT(*) FILTER (WHERE status = 'PENDING') AS pending_requests,
          COUNT(*) FILTER (WHERE status = 'APPROVED') AS approved_requests,
          COUNT(*) FILTER (WHERE status = 'REJECTED') AS rejected_requests,
          COUNT(*) FILTER (WHERE leave_type = 'PAID' AND status = 'APPROVED') AS paid_leaves_taken,
          COUNT(*) FILTER (WHERE leave_type = 'SICK' AND status = 'APPROVED') AS sick_leaves_taken,
          COUNT(*) FILTER (WHERE leave_type = 'UNPAID' AND status = 'APPROVED') AS unpaid_leaves_taken
        FROM leaves
        WHERE employee_id = $1 AND EXTRACT(YEAR FROM start_date) = $2
      `;
      const summaryRes = await pool.query(summaryQuery, [employeeId, year]);
      const stats = summaryRes.rows[0];

      // Standard policy calculation: 12 Paid, 10 Sick
      const paidTaken = parseInt(stats.paid_leaves_taken, 10) || 0;
      const sickTaken = parseInt(stats.sick_leaves_taken, 10) || 0;

      const balances = {
        paid_leave: { total: 12, used: paidTaken, remaining: Math.max(0, 12 - paidTaken) },
        sick_leave: { total: 10, used: sickTaken, remaining: Math.max(0, 10 - sickTaken) },
        unpaid_leave: { used: parseInt(stats.unpaid_leaves_taken, 10) || 0 },
      };

      // Monthly breakdown for employee
      const monthlyQuery = `
        SELECT 
          TO_CHAR(start_date, 'Mon') AS month_name,
          EXTRACT(MONTH FROM start_date) AS month_num,
          leave_type,
          status,
          COUNT(*) AS count
        FROM leaves
        WHERE employee_id = $1 AND EXTRACT(YEAR FROM start_date) = $2
        GROUP BY TO_CHAR(start_date, 'Mon'), EXTRACT(MONTH FROM start_date), leave_type, status
        ORDER BY month_num ASC
      `;
      const monthlyRes = await pool.query(monthlyQuery, [employeeId, year]);

      return res.json({
        success: true,
        role: 'EMPLOYEE',
        year: parseInt(year, 10),
        summary: stats,
        leave_balances: balances,
        monthly_breakdown: monthlyRes.rows,
      });
    }

    // -------------------------------------------------------------
    // Admin / HR Organization-wide Leaves Analytics
    // -------------------------------------------------------------
    const conditions = [`EXTRACT(YEAR FROM l.start_date) = $1`];
    const params = [year];

    if (department_id) {
      params.push(department_id);
      conditions.push(`e.department_id = $${params.length}`);
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    // 1. Company Leave Summary
    const summaryQuery = `
      SELECT 
        COUNT(*) AS total_requests,
        COUNT(*) FILTER (WHERE l.status = 'PENDING') AS pending_count,
        COUNT(*) FILTER (WHERE l.status = 'APPROVED') AS approved_count,
        COUNT(*) FILTER (WHERE l.status = 'REJECTED') AS rejected_count,
        COUNT(*) FILTER (WHERE l.leave_type = 'PAID') AS paid_leave_requests,
        COUNT(*) FILTER (WHERE l.leave_type = 'SICK') AS sick_leave_requests,
        COUNT(*) FILTER (WHERE l.leave_type = 'UNPAID') AS unpaid_leave_requests,
        ROUND(
          (COUNT(*) FILTER (WHERE l.status = 'APPROVED')::numeric * 100.0) / 
          NULLIF(COUNT(*) FILTER (WHERE l.status IN ('APPROVED', 'REJECTED')), 0),
          1
        ) AS approval_rate_pct
      FROM leaves l
      JOIN employees e ON l.employee_id = e.id
      ${whereClause}
    `;
    const summaryRes = await pool.query(summaryQuery, params);

    // 2. Type breakdown
    const typeQuery = `
      SELECT 
        l.leave_type,
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE l.status = 'APPROVED') AS approved,
        COUNT(*) FILTER (WHERE l.status = 'PENDING') AS pending,
        COUNT(*) FILTER (WHERE l.status = 'REJECTED') AS rejected
      FROM leaves l
      JOIN employees e ON l.employee_id = e.id
      ${whereClause}
      GROUP BY l.leave_type
    `;
    const typeRes = await pool.query(typeQuery, params);

    // 3. Department Leave Consumption
    const deptQuery = `
      SELECT 
        d.id AS department_id,
        COALESCE(d.name, 'Unassigned') AS department_name,
        COUNT(l.id) AS total_requests,
        COUNT(*) FILTER (WHERE l.status = 'APPROVED') AS approved_leaves,
        COUNT(*) FILTER (WHERE l.status = 'PENDING') AS pending_leaves
      FROM leaves l
      JOIN employees e ON l.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      ${whereClause}
      GROUP BY d.id, d.name
      ORDER BY total_requests DESC
    `;
    const deptRes = await pool.query(deptQuery, params);

    // 4. Monthly Trend
    const trendQuery = `
      SELECT 
        TO_CHAR(l.start_date, 'Mon') AS month_name,
        EXTRACT(MONTH FROM l.start_date) AS month_num,
        COUNT(*) AS total_applications,
        COUNT(*) FILTER (WHERE l.status = 'APPROVED') AS approved,
        COUNT(*) FILTER (WHERE l.status = 'REJECTED') AS rejected
      FROM leaves l
      JOIN employees e ON l.employee_id = e.id
      ${whereClause}
      GROUP BY TO_CHAR(l.start_date, 'Mon'), EXTRACT(MONTH FROM l.start_date)
      ORDER BY month_num ASC
    `;
    const trendRes = await pool.query(trendQuery, params);

    res.json({
      success: true,
      role: userRole,
      year: parseInt(year, 10),
      summary: summaryRes.rows[0],
      type_breakdown: typeRes.rows,
      department_breakdown: deptRes.rows,
      monthly_trend: trendRes.rows,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Payroll Analytics
 * Admin / HR Only: Comprehensive payroll metrics, average salary, department distribution, and financial trends.
 */
const getPayrollAnalytics = async (req, res, next) => {
  try {
    const { year = new Date().getFullYear(), month } = req.query;

    const conditions = [`p.year = $1`];
    const params = [year];

    if (month) {
      params.push(month);
      conditions.push(`p.month = $${params.length}`);
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    // 1. Financial Overview Summary
    const summaryQuery = `
      SELECT 
        COUNT(*) AS total_records,
        COALESCE(SUM(p.basic_salary), 0) AS total_basic_salary,
        COALESCE(SUM(p.hra), 0) AS total_hra,
        COALESCE(SUM(p.allowances), 0) AS total_allowances,
        COALESCE(SUM(p.deductions), 0) AS total_deductions,
        COALESCE(SUM(p.net_salary), 0) AS total_net_payout,
        COALESCE(ROUND(AVG(p.net_salary), 2), 0) AS avg_net_salary,
        COALESCE(MIN(p.net_salary), 0) AS min_net_salary,
        COALESCE(MAX(p.net_salary), 0) AS max_net_salary,
        COUNT(*) FILTER (WHERE p.payment_status = 'PAID') AS count_paid,
        COUNT(*) FILTER (WHERE p.payment_status = 'PROCESSED') AS count_processed,
        COUNT(*) FILTER (WHERE p.payment_status = 'PENDING') AS count_pending,
        COUNT(*) FILTER (WHERE p.payment_status = 'FAILED') AS count_failed
      FROM payrolls p
      ${whereClause}
    `;
    const summaryRes = await pool.query(summaryQuery, params);

    // 2. Department-wise Payroll Distribution
    const deptQuery = `
      SELECT 
        d.id AS department_id,
        COALESCE(d.name, 'Unassigned') AS department_name,
        COUNT(p.id) AS employee_count,
        COALESCE(SUM(p.net_salary), 0) AS total_dept_payout,
        COALESCE(ROUND(AVG(p.net_salary), 2), 0) AS avg_dept_salary,
        COALESCE(SUM(p.basic_salary), 0) AS basic_total,
        COALESCE(SUM(p.allowances), 0) AS allowances_total,
        COALESCE(SUM(p.deductions), 0) AS deductions_total
      FROM payrolls p
      JOIN employees e ON p.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      ${whereClause}
      GROUP BY d.id, d.name
      ORDER BY total_dept_payout DESC
    `;
    const deptRes = await pool.query(deptQuery, params);

    // 3. Monthly Payout Trend for the Year
    const monthlyTrendQuery = `
      SELECT 
        p.month,
        TO_CHAR(TO_DATE(p.month::text, 'MM'), 'Month') AS month_name,
        COUNT(p.id) AS count,
        COALESCE(SUM(p.net_salary), 0) AS total_disbursed,
        COALESCE(SUM(p.basic_salary), 0) AS basic_sum,
        COALESCE(SUM(p.deductions), 0) AS deductions_sum
      FROM payrolls p
      WHERE p.year = $1
      GROUP BY p.month
      ORDER BY p.month ASC
    `;
    const monthlyTrendRes = await pool.query(monthlyTrendQuery, [year]);

    // 4. Base Salary Structure Health
    const structureRes = await pool.query(`
      SELECT 
        COUNT(e.id) AS total_active_employees,
        COUNT(s.id) AS configured_structures,
        COALESCE(SUM(s.net_salary), 0) AS monthly_committed_payroll,
        COALESCE(ROUND(AVG(s.net_salary), 2), 0) AS avg_committed_salary
      FROM employees e
      LEFT JOIN salary_structures s ON e.id = s.employee_id
      WHERE e.employment_status = 'ACTIVE'
    `);

    res.json({
      success: true,
      year: parseInt(year, 10),
      summary: summaryRes.rows[0],
      structure_overview: structureRes.rows[0],
      department_distribution: deptRes.rows,
      monthly_trend: monthlyTrendRes.rows,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Company Overview Summary Analytics (Admin/HR Dashboard header cards)
 */
const getOverviewAnalytics = async (req, res, next) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];

    const overviewRes = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM employees WHERE employment_status = 'ACTIVE') AS active_employees,
        (SELECT COUNT(*) FROM departments) AS departments_count,
        (SELECT COUNT(*) FROM leaves WHERE status = 'PENDING') AS pending_leaves,
        (SELECT COUNT(*) FROM attendances WHERE date = CURRENT_DATE AND status = 'PRESENT') AS today_present,
        (SELECT COUNT(*) FROM attendances WHERE date = CURRENT_DATE AND status = 'ABSENT') AS today_absent,
        (SELECT COUNT(*) FROM attendances WHERE date = CURRENT_DATE AND status = 'LEAVE') AS today_on_leave,
        (SELECT COALESCE(SUM(net_salary), 0) FROM payrolls WHERE year = EXTRACT(YEAR FROM CURRENT_DATE)) AS ytd_payroll_disbursed,
        (SELECT COUNT(*) FROM payrolls WHERE payment_status = 'PROCESSED') AS pending_payout_payrolls
    `);

    res.json({
      success: true,
      data: overviewRes.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAttendanceAnalytics,
  getLeaveAnalytics,
  getPayrollAnalytics,
  getOverviewAnalytics,
};
