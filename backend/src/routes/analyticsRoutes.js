const express = require('express');
const router = express.Router();
const {
  getAttendanceAnalytics,
  getLeaveAnalytics,
  getPayrollAnalytics,
  getOverviewAnalytics,
} = require('../controllers/analyticsController');
const { authenticate, authorizeRole } = require('../middleware/auth');

// All analytics require authentication
router.use(authenticate);

// Role-aware endpoints (Employees see own metrics, Admin/HR see organization-wide)
router.get('/attendance', getAttendanceAnalytics);
router.get('/leaves', getLeaveAnalytics);

// Admin / HR only analytics
router.get('/payroll', authorizeRole(['ADMIN', 'HR']), getPayrollAnalytics);
router.get('/overview', authorizeRole(['ADMIN', 'HR']), getOverviewAnalytics);

module.exports = router;
