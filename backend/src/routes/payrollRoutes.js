const express = require('express');
const router = express.Router();
const {
  getMyPayroll,
  getMySalaryStructure,
  getAllPayrolls,
  updateSalaryStructure,
  processMonthlyBatch,
  updatePayrollStatus,
} = require('../controllers/payrollController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Employee view own salary / payroll (READ-ONLY)
router.get('/my', authenticateToken, getMyPayroll);
router.get('/my/structure', authenticateToken, getMySalaryStructure);

// Admin view all and manage payroll
router.get('/', authenticateToken, authorizeRoles('ADMIN', 'HR'), getAllPayrolls);
router.put('/structure/:employeeId', authenticateToken, authorizeRoles('ADMIN'), updateSalaryStructure);
router.post('/process-batch', authenticateToken, authorizeRoles('ADMIN'), processMonthlyBatch);
router.put('/:id/status', authenticateToken, authorizeRoles('ADMIN'), updatePayrollStatus);

module.exports = router;
