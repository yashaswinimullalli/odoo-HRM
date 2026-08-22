const express = require('express');
const router = express.Router();
const {
  getMyDocuments,
  getEmployeeDocuments,
  addDocument,
  deleteDocument,
} = require('../controllers/documentController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.get('/my', authenticateToken, getMyDocuments);
router.get('/employee/:employeeId', authenticateToken, authorizeRoles('ADMIN', 'HR'), getEmployeeDocuments);
router.post('/', authenticateToken, addDocument);
router.delete('/:id', authenticateToken, deleteDocument);

module.exports = router;
