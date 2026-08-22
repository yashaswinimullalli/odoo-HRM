const express = require('express');
const router = express.Router();
const {
  getAttendanceReport,
  getLeaveReport,
  getPayrollReport,
  getSalarySlip,
} = require('../controllers/reportController');
const { authenticate, authorizeRole } = require('../middleware/auth');

// All report routes require authentication
router.use(authenticate);

// Role-aware reports (JSON / CSV export)
router.get('/attendance', getAttendanceReport);
router.get('/leaves', getLeaveReport);

// Admin / HR only payroll reports
router.get('/payroll', authorizeRole(['ADMIN', 'HR']), getPayrollReport);

// Salary Slip endpoint (RBAC enforced in controller)
router.get('/payroll/:employeeId/slip', getSalarySlip);

module.exports = router;
