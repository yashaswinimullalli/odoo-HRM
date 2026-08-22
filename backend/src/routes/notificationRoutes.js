const express = require('express');
const router = express.Router();
const {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
} = require('../controllers/notificationController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, getMyNotifications);
router.put('/:id/read', authenticateToken, markAsRead);
router.put('/mark-all-read', authenticateToken, markAllAsRead);

module.exports = router;
