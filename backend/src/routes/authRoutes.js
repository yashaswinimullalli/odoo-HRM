const express = require('express');
const router = express.Router();
const { register, login, getMe, verifyEmail } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticateToken, getMe);
router.post('/verify-email', authenticateToken, verifyEmail);

module.exports = router;
