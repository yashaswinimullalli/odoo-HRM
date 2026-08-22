const { pool } = require('../config/db');
const { logAudit } = require('../utils/auditLogger');

/**
 * Get current employee's documents
 */
const getMyDocuments = async (req, res, next) => {
  try {
    const employeeId = req.user.employee_id;
    if (!employeeId) {
      return res.status(400).json({ success: false, message: 'No employee profile linked to user.' });
    }

    const query = `
      SELECT id, document_name, document_type, document_url, uploaded_at, created_at
      FROM documents
      WHERE employee_id = $1
      ORDER BY uploaded_at DESC
    `;
    const result = await pool.query(query, [employeeId]);

    res.json({
      success: true,
      count: result.rows.length,
      documents: result.rows,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Admin / HR get documents for any employee
 */
const getEmployeeDocuments = async (req, res, next) => {
  try {
    const { employeeId } = req.params;

    const query = `
      SELECT id, employee_id, document_name, document_type, document_url, uploaded_at, created_at
      FROM documents
      WHERE employee_id = $1
      ORDER BY uploaded_at DESC
    `;
    const result = await pool.query(query, [employeeId]);

    res.json({
      success: true,
      count: result.rows.length,
      documents: result.rows,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Add / upload a document record
 * Body: { employee_id, document_name, document_type, document_url }
 */
const addDocument = async (req, res, next) => {
  try {
    let targetEmployeeId = req.user.employee_id;

    // If Admin/HR specified employee_id in body, use that
    if (['ADMIN', 'HR'].includes(req.user.role) && req.body.employee_id) {
      targetEmployeeId = req.body.employee_id;
    }

    if (!targetEmployeeId) {
      return res.status(400).json({ success: false, message: 'Target employee ID is required.' });
    }

    const { document_name, document_type, document_url } = req.body;

    if (!document_name || !document_url) {
      return res.status(400).json({
        success: false,
        message: 'document_name and document_url are required.',
      });
    }

    const query = `
      INSERT INTO documents (employee_id, document_name, document_type, document_url)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await pool.query(query, [
      targetEmployeeId,
      document_name.trim(),
      document_type || 'GENERAL',
      document_url.trim(),
    ]);

    await logAudit({
      userId: req.user.user_id,
      action: 'UPLOAD_DOCUMENT',
      entityType: 'DOCUMENT',
      entityId: result.rows[0].id,
      details: { document_name, document_type },
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: 'Document saved successfully.',
      document: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete a document
 */
const deleteDocument = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verify ownership or admin privileges
    let query = 'DELETE FROM documents WHERE id = $1';
    const params = [id];

    if (req.user.role === 'EMPLOYEE') {
      query += ' AND employee_id = $2';
      params.push(req.user.employee_id);
    }

    query += ' RETURNING *';
    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Document not found or access denied.' });
    }

    res.json({
      success: true,
      message: 'Document deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMyDocuments,
  getEmployeeDocuments,
  addDocument,
  deleteDocument,
};
