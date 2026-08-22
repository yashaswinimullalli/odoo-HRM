const express = require('express');
const router = express.Router();
const {
  getEmployeeDashboard,
  getAdminDashboard,
  getAdminActionItems,
  getRecentActivities,
} = require('../controllers/dashboardController');
const { authenticate, authorizeRole } = require('../middleware/auth');

// All dashboard routes require authentication
router.use(authenticate);

// Employee Dashboard
router.get('/employee', getEmployeeDashboard);

// Admin Dashboard & Action items
router.get('/admin', authorizeRole(['ADMIN', 'HR']), getAdminDashboard);
router.get('/admin/action-items', authorizeRole(['ADMIN', 'HR']), getAdminActionItems);

// Recent activity feed
router.get('/activity', getRecentActivities);

module.exports = router;
