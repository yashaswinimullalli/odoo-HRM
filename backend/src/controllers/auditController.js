const { pool } = require('../config/db');

/**
 * Admin / HR get system audit and activity logs
 */
const getAuditLogs = async (req, res, next) => {
  try {
    const { action, entity_type, user_id, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT 
        a.id,
        a.user_id,
        u.email AS user_email,
        u.role AS user_role,
        a.action,
        a.entity_type,
        a.entity_id,
        a.details,
        a.ip_address,
        a.created_at
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (action) {
      params.push(action);
      query += ` AND a.action = $${params.length}`;
    }

    if (entity_type) {
      params.push(entity_type);
      query += ` AND a.entity_type = $${params.length}`;
    }

    if (user_id) {
      params.push(user_id);
      query += ` AND a.user_id = $${params.length}`;
    }

    query += ` ORDER BY a.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.json({
      success: true,
      count: result.rows.length,
      audit_logs: result.rows,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAuditLogs };
