const express = require('express');
const router = express.Router();
const { getDepartments, getDesignations } = require('../controllers/departmentController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, getDepartments);
router.get('/designations', authenticateToken, getDesignations);

module.exports = router;
