const { pool } = require('../config/db');

/**
 * Helper to convert array of objects into RFC 4180 compliant CSV string
 */
function convertToCSV(data, columnMapping) {
  if (!data || data.length === 0) {
    return Object.values(columnMapping).map(h => `"${h}"`).join(',') + '\n';
  }

  const keys = Object.keys(columnMapping);
  const headerRow = keys.map(k => `"${columnMapping[k]}"`).join(',');

  const rows = data.map(row => {
    return keys
      .map(k => {
        let val = row[k];
        if (val === null || val === undefined) val = '';
        if (val instanceof Date) val = val.toISOString().split('T')[0];
        val = String(val).replace(/"/g, '""'); // Escape double quotes
        return `"${val}"`;
      })
      .join(',');
  });

  return [headerRow, ...rows].join('\r\n');
}

/**
 * Convert number into words for Indian Rupee format (Standard for payroll slips)
 */
function numberToWordsINR(num) {
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const n = ('000000000' + Math.floor(num)).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return '';
  let str = '';
  str += (Number(n[1]) !== 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
  str += (Number(n[2]) !== 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
  str += (Number(n[3]) !== 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
  str += (Number(n[4]) !== 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
  str += (Number(n[5]) !== 0) ? ((str !== '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + 'Rupees Only' : 'Rupees Only';
  return str.trim();
}

/**
 * Attendance Report (JSON & CSV Export)
 */
const getAttendanceReport = async (req, res, next) => {
  try {
    const userRole = req.user.role;
    const employeeId = req.user.employee_id;
    const { start_date, end_date, department_id, employee_id, status, format = 'json' } = req.query;

    const isAdminOrHR = ['ADMIN', 'HR'].includes(userRole);

    let query = `
      SELECT 
        a.id,
        a.date,
        TO_CHAR(a.date, 'YYYY-MM-DD') AS attendance_date,
        TO_CHAR(a.date, 'Day') AS day_of_week,
        e.employee_code,
        e.first_name || ' ' || e.last_name AS employee_name,
        d.name AS department_name,
        ds.title AS designation_title,
        TO_CHAR(a.check_in, 'HH24:MI:SS') AS check_in_time,
        TO_CHAR(a.check_out, 'HH24:MI:SS') AS check_out_time,
        COALESCE(a.working_hours, 0) AS working_hours,
        a.status
      FROM attendances a
      JOIN employees e ON a.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN designations ds ON e.designation_id = ds.id
      WHERE 1=1
    `;
    const params = [];

    if (!isAdminOrHR) {
      // Strictly restrict employee to their own attendance
      params.push(employeeId);
      query += ` AND a.employee_id = $${params.length}`;
    } else {
      if (employee_id) {
        params.push(employee_id);
        query += ` AND a.employee_id = $${params.length}`;
      }
      if (department_id) {
        params.push(department_id);
        query += ` AND e.department_id = $${params.length}`;
      }
    }

    if (start_date && end_date) {
      params.push(start_date, end_date);
      query += ` AND a.date BETWEEN $${params.length - 1} AND $${params.length}`;
    }

    if (status) {
      params.push(status.toUpperCase());
      query += ` AND a.status = $${params.length}`;
    }

    query += ` ORDER BY a.date DESC, e.employee_code ASC`;

    const result = await pool.query(query, params);

    if (format.toLowerCase() === 'csv') {
      const columnMapping = {
        attendance_date: 'Date',
        day_of_week: 'Day',
        employee_code: 'Employee Code',
        employee_name: 'Employee Name',
        department_name: 'Department',
        designation_title: 'Designation',
        check_in_time: 'Check In',
        check_out_time: 'Check Out',
        working_hours: 'Working Hours',
        status: 'Status',
      };

      const csvData = convertToCSV(result.rows, columnMapping);
      const filename = `attendance_report_${new Date().toISOString().split('T')[0]}.csv`;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.status(200).send(csvData);
    }

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
 * Leave Report (JSON & CSV Export)
 */
const getLeaveReport = async (req, res, next) => {
  try {
    const userRole = req.user.role;
    const employeeId = req.user.employee_id;
    const { start_date, end_date, department_id, employee_id, leave_type, status, format = 'json' } = req.query;

    const isAdminOrHR = ['ADMIN', 'HR'].includes(userRole);

    let query = `
      SELECT 
        l.id,
        e.employee_code,
        e.first_name || ' ' || e.last_name AS employee_name,
        d.name AS department_name,
        l.leave_type,
        TO_CHAR(l.start_date, 'YYYY-MM-DD') AS start_date,
        TO_CHAR(l.end_date, 'YYYY-MM-DD') AS end_date,
        (l.end_date - l.start_date + 1) AS total_days,
        l.reason,
        l.status,
        ru.email AS reviewed_by_email,
        l.reviewer_comment,
        TO_CHAR(l.reviewed_at, 'YYYY-MM-DD HH24:MI') AS reviewed_at,
        TO_CHAR(l.created_at, 'YYYY-MM-DD HH24:MI') AS requested_at
      FROM leaves l
      JOIN employees e ON l.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN users ru ON l.reviewed_by = ru.id
      WHERE 1=1
    `;
    const params = [];

    if (!isAdminOrHR) {
      params.push(employeeId);
      query += ` AND l.employee_id = $${params.length}`;
    } else {
      if (employee_id) {
        params.push(employee_id);
        query += ` AND l.employee_id = $${params.length}`;
      }
      if (department_id) {
        params.push(department_id);
        query += ` AND e.department_id = $${params.length}`;
      }
    }

    if (start_date && end_date) {
      params.push(start_date, end_date);
      query += ` AND l.start_date >= $${params.length - 1} AND l.end_date <= $${params.length}`;
    }

    if (leave_type) {
      params.push(leave_type.toUpperCase());
      query += ` AND l.leave_type = $${params.length}`;
    }

    if (status) {
      params.push(status.toUpperCase());
      query += ` AND l.status = $${params.length}`;
    }

    query += ` ORDER BY l.created_at DESC`;

    const result = await pool.query(query, params);

    if (format.toLowerCase() === 'csv') {
      const columnMapping = {
        employee_code: 'Employee Code',
        employee_name: 'Employee Name',
        department_name: 'Department',
        leave_type: 'Leave Type',
        start_date: 'Start Date',
        end_date: 'End Date',
        total_days: 'Days',
        reason: 'Reason',
        status: 'Status',
        reviewed_by_email: 'Reviewed By',
        reviewer_comment: 'Remarks',
        requested_at: 'Requested On',
      };

      const csvData = convertToCSV(result.rows, columnMapping);
      const filename = `leaves_report_${new Date().toISOString().split('T')[0]}.csv`;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.status(200).send(csvData);
    }

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
 * Payroll Report (Admin / HR JSON & CSV Export)
 */
const getPayrollReport = async (req, res, next) => {
  try {
    const { month, year, department_id, payment_status, employee_id, format = 'json' } = req.query;

    let query = `
      SELECT 
        p.id,
        e.employee_code,
        e.first_name || ' ' || e.last_name AS employee_name,
        d.name AS department_name,
        ds.title AS designation_title,
        p.month,
        p.year,
        TO_CHAR(TO_DATE(p.month::text, 'MM'), 'Month') AS month_name,
        p.basic_salary,
        p.hra,
        p.allowances,
        (p.basic_salary + p.hra + p.allowances) AS gross_salary,
        p.deductions,
        p.net_salary,
        p.payment_status,
        TO_CHAR(p.payment_date, 'YYYY-MM-DD') AS payment_date,
        p.remarks
      FROM payrolls p
      JOIN employees e ON p.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN designations ds ON e.designation_id = ds.id
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

    if (department_id) {
      params.push(department_id);
      query += ` AND e.department_id = $${params.length}`;
    }

    if (employee_id) {
      params.push(employee_id);
      query += ` AND p.employee_id = $${params.length}`;
    }

    if (payment_status) {
      params.push(payment_status.toUpperCase());
      query += ` AND p.payment_status = $${params.length}`;
    }

    query += ` ORDER BY p.year DESC, p.month DESC, e.employee_code ASC`;

    const result = await pool.query(query, params);

    if (format.toLowerCase() === 'csv') {
      const columnMapping = {
        employee_code: 'Employee Code',
        employee_name: 'Employee Name',
        department_name: 'Department',
        designation_title: 'Designation',
        month: 'Month',
        year: 'Year',
        basic_salary: 'Basic Salary (INR)',
        hra: 'HRA (INR)',
        allowances: 'Allowances (INR)',
        gross_salary: 'Gross Salary (INR)',
        deductions: 'Deductions (INR)',
        net_salary: 'Net Salary (INR)',
        payment_status: 'Payment Status',
        payment_date: 'Payment Date',
        remarks: 'Remarks',
      };

      const csvData = convertToCSV(result.rows, columnMapping);
      const filename = `payroll_report_${year || 'all'}_${month || 'all'}.csv`;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.status(200).send(csvData);
    }

    // Compute totals
    const totals = result.rows.reduce(
      (acc, r) => ({
        total_basic: acc.total_basic + parseFloat(r.basic_salary || 0),
        total_hra: acc.total_hra + parseFloat(r.hra || 0),
        total_allowances: acc.total_allowances + parseFloat(r.allowances || 0),
        total_deductions: acc.total_deductions + parseFloat(r.deductions || 0),
        total_net: acc.total_net + parseFloat(r.net_salary || 0),
      }),
      { total_basic: 0, total_hra: 0, total_allowances: 0, total_deductions: 0, total_net: 0 }
    );

    res.json({
      success: true,
      count: result.rows.length,
      totals,
      payrolls: result.rows,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Generate Structured Salary Slip
 * Strict RBAC: Employee can only view their own slip; Admin/HR can view any employee's slip.
 */
const getSalarySlip = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const { month, year } = req.query;
    const userRole = req.user.role;
    const authEmployeeId = req.user.employee_id;

    // RBAC validation
    const isAdminOrHR = ['ADMIN', 'HR'].includes(userRole);
    if (!isAdminOrHR && String(authEmployeeId) !== String(employeeId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only view your own salary slip.',
      });
    }

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: 'Please provide month (1-12) and year query parameters.',
      });
    }

    // 1. Fetch employee details with department and designation
    const employeeQuery = `
      SELECT 
        e.id,
        e.employee_code,
        e.first_name || ' ' || e.last_name AS employee_name,
        e.email,
        e.phone_number,
        e.joining_date,
        e.pan_number,
        e.bank_account_number,
        e.bank_name,
        e.bank_ifsc_code,
        d.name AS department_name,
        ds.title AS designation_title
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN designations ds ON e.designation_id = ds.id
      WHERE e.id = $1
    `;
    const empRes = await pool.query(employeeQuery, [employeeId]);
    if (empRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }
    const emp = empRes.rows[0];

    // 2. Fetch payroll record for requested month and year
    const payrollQuery = `
      SELECT 
        id,
        month,
        year,
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
      WHERE employee_id = $1 AND month = $2 AND year = $3
    `;
    const payRes = await pool.query(payrollQuery, [employeeId, month, year]);

    if (payRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Salary slip record not found for ${month}/${year}.`,
      });
    }
    const payroll = payRes.rows[0];

    // 3. Attendance summary for the salary slip month
    const attendanceStatsQuery = `
      SELECT 
        COUNT(*) FILTER (WHERE status = 'PRESENT') AS present_days,
        COUNT(*) FILTER (WHERE status = 'HALF_DAY') AS half_days,
        COUNT(*) FILTER (WHERE status = 'LEAVE') AS leave_days,
        COUNT(*) FILTER (WHERE status = 'ABSENT') AS absent_days
      FROM attendances
      WHERE employee_id = $1 
        AND EXTRACT(MONTH FROM date) = $2 
        AND EXTRACT(YEAR FROM date) = $3
    `;
    const attStatsRes = await pool.query(attendanceStatsQuery, [employeeId, month, year]);
    const attendanceSummary = attStatsRes.rows[0] || { present_days: 0, half_days: 0, leave_days: 0, absent_days: 0 };

    const basic = parseFloat(payroll.basic_salary);
    const hra = parseFloat(payroll.hra);
    const allowances = parseFloat(payroll.allowances);
    const grossEarnings = basic + hra + allowances;
    const deductions = parseFloat(payroll.deductions);
    const netSalary = parseFloat(payroll.net_salary);

    const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const payPeriodName = `${monthNames[parseInt(month, 10)] || month} ${year}`;

    const salarySlip = {
      slip_number: `SLIP-${year}-${String(month).padStart(2, '0')}-${emp.employee_code}`,
      pay_period: payPeriodName,
      generated_at: new Date().toISOString(),
      company: {
        name: 'Dayflow HRMS Technologies Pvt. Ltd.',
        address: 'Tower 4, Embassy TechVillage, Outer Ring Road, Bangalore - 560103',
        tax_id: 'GSTIN29AABCT1332L1ZV',
        email: 'finance@dayflow.demo',
      },
      employee: {
        id: emp.id,
        code: emp.employee_code,
        name: emp.employee_name,
        email: emp.email,
        phone: emp.phone_number,
        department: emp.department_name || 'General',
        designation: emp.designation_title || 'Specialist',
        joining_date: emp.joining_date,
        bank_details: {
          bank_name: emp.bank_name || 'HDFC Bank',
          account_number: emp.bank_account_number ? `XXXX-XXXX-${emp.bank_account_number.slice(-4)}` : 'XXXX-XXXX-8921',
          ifsc: emp.bank_ifsc_code || 'HDFC0001234',
          pan: emp.pan_number || 'ABCDE1234F',
        },
      },
      attendance: attendanceSummary,
      earnings: [
        { item: 'Basic Salary', amount: basic },
        { item: 'House Rent Allowance (HRA)', amount: hra },
        { item: 'Special & Conveyance Allowances', amount: allowances },
      ],
      total_gross_earnings: grossEarnings,
      deductions: [
        { item: 'Provident Fund / Statutory Deductions', amount: deductions },
      ],
      total_deductions: deductions,
      net_salary: netSalary,
      net_salary_in_words: numberToWordsINR(netSalary),
      payment_status: payroll.payment_status,
      payment_date: payroll.payment_date,
      remarks: payroll.remarks || 'Standard monthly compensation.',
    };

    res.json({
      success: true,
      data: salarySlip,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAttendanceReport,
  getLeaveReport,
  getPayrollReport,
  getSalarySlip,
};
