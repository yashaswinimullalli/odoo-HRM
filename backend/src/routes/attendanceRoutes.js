const express = require('express');
const router = express.Router();
const {
  checkIn,
  checkOut,
  getMyAttendance,
  getAllAttendance,
  regularizeAttendance,
} = require('../controllers/attendanceController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Employee attendance actions
router.post('/check-in', authenticateToken, checkIn);
router.post('/check-out', authenticateToken, checkOut);
router.get('/my', authenticateToken, getMyAttendance);

// Admin / HR attendance management
router.get('/all', authenticateToken, authorizeRoles('ADMIN', 'HR'), getAllAttendance);
router.put('/:id', authenticateToken, authorizeRoles('ADMIN', 'HR'), regularizeAttendance);

module.exports = router;
