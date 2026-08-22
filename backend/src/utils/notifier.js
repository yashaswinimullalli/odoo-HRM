const { pool } = require('../config/db');

/**
 * Send an in-app notification to a user
 * @param {Object} params
 * @param {number} params.userId - Recipient User ID
 * @param {string} params.title - Notification title
 * @param {string} params.message - Notification message
 */
async function sendNotification({ userId, title, message }) {
  try {
    const query = `
      INSERT INTO notifications (user_id, title, message, is_read)
      VALUES ($1, $2, $3, FALSE)
      RETURNING id
    `;
    await pool.query(query, [userId, title, message]);
  } catch (err) {
    console.error('[Notifier Error] Failed to create notification:', err.message);
  }
}

module.exports = { sendNotification };
