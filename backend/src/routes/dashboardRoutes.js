const express = require('express');
const router = express.Router();
const { getEmployeeDashboard, getAdminDashboard } = require('../controllers/dashboardController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.get('/employee', authenticateToken, getEmployeeDashboard);
router.get('/admin', authenticateToken, authorizeRoles('ADMIN', 'HR'), getAdminDashboard);

module.exports = router;
