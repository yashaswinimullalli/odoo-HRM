const express = require('express');
const router = express.Router();
const {
  listEmployees,
  getEmployeeById,
  updateMyProfile,
  updateEmployeeByAdmin,
} = require('../controllers/employeeController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// List all employees (Admin / HR)
router.get('/', authenticateToken, authorizeRoles('ADMIN', 'HR'), listEmployees);

// Update own profile (Employee: phone, address, avatar)
router.put('/me', authenticateToken, updateMyProfile);

// Get single employee details
router.get('/:id', authenticateToken, getEmployeeById);

// Admin/HR update all employee details
router.put('/:id', authenticateToken, authorizeRoles('ADMIN', 'HR'), updateEmployeeByAdmin);

module.exports = router;
