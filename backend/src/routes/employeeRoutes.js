const express = require('express');
const router = express.Router();
const {
  listEmployees,
  getEmployeeById,
  createEmployee,
  updateMyProfile,
  updateEmployeeByAdmin,
} = require('../controllers/employeeController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// List all employees (Admin / HR)
router.get('/', authenticateToken, authorizeRoles('ADMIN', 'HR'), listEmployees);

// Create new employee with auto-generated Login ID & temporary password (Admin / HR)
router.post('/', authenticateToken, authorizeRoles('ADMIN', 'HR'), createEmployee);

// Update own profile (Employee: phone, address, avatar)
router.put('/me', authenticateToken, updateMyProfile);

// Get single employee details
router.get('/:id', authenticateToken, getEmployeeById);

// Admin/HR update all employee details
router.put('/:id', authenticateToken, authorizeRoles('ADMIN', 'HR'), updateEmployeeByAdmin);

module.exports = router;
