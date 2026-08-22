const { pool } = require('../config/db');

/**
 * Record an action in the audit_logs table
 * @param {Object} params
 * @param {number|null} params.userId - User ID who triggered the action
 * @param {string} params.action - e.g. 'USER_LOGIN', 'APPROVE_LEAVE', 'UPDATE_SALARY'
 * @param {string} params.entityType - e.g. 'USER', 'EMPLOYEE', 'LEAVE', 'PAYROLL'
 * @param {string|number} params.entityId - Primary identifier of the affected entity
 * @param {Object} [params.details] - Metadata payload
 * @param {string} [params.ipAddress] - Request IP
 */
async function logAudit({ userId, action, entityType, entityId, details = {}, ipAddress = null }) {
  try {
    const query = `
      INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `;
    await pool.query(query, [
      userId || null,
      action,
      entityType,
      entityId ? String(entityId) : null,
      JSON.stringify(details),
      ipAddress || null,
    ]);
  } catch (err) {
    console.error('[Audit Logger Error] Failed to write audit log:', err.message);
  }
}

module.exports = { logAudit };
