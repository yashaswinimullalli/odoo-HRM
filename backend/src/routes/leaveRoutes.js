const express = require('express');
const router = express.Router();
const {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  reviewLeave,
} = require('../controllers/leaveController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Employee actions
router.post('/', authenticateToken, applyLeave);
router.get('/my', authenticateToken, getMyLeaves);

// Admin / HR actions
router.get('/', authenticateToken, authorizeRoles('ADMIN', 'HR'), getAllLeaves);
router.put('/:id/review', authenticateToken, authorizeRoles('ADMIN', 'HR'), reviewLeave);

module.exports = router;
