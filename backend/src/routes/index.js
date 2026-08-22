const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const employeeRoutes = require('./employeeRoutes');
const attendanceRoutes = require('./attendanceRoutes');
const leaveRoutes = require('./leaveRoutes');
const payrollRoutes = require('./payrollRoutes');
const documentRoutes = require('./documentRoutes');
const notificationRoutes = require('./notificationRoutes');
const auditRoutes = require('./auditRoutes');
const departmentRoutes = require('./departmentRoutes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/employees', employeeRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/leaves', leaveRoutes);
router.use('/payroll', payrollRoutes);
router.use('/documents', documentRoutes);
router.use('/notifications', notificationRoutes);
router.use('/audit-logs', auditRoutes);
router.use('/departments', departmentRoutes);

module.exports = router;
