const { pool } = require('../config/db');
const { sendEmail } = require('../services/emailService');

/**
 * Send an in-app notification to a specific user and optionally send email alert
 * 
 * @param {Object} params
 * @param {number|string} params.userId - Recipient User ID
 * @param {string} params.title - Notification title
 * @param {string} params.message - Notification body
 * @param {boolean} [params.sendEmailAlert=true] - Whether to also dispatch an email alert
 * @param {string} [params.emailHtml] - Custom HTML content for email alert
 */
async function sendNotification({
  userId,
  title,
  message,
  sendEmailAlert = true,
  emailHtml = null,
}) {
  try {
    const query = `
      INSERT INTO notifications (user_id, title, message, is_read)
      VALUES ($1, $2, $3, FALSE)
      RETURNING id, user_id, title, message, is_read, created_at
    `;
    const result = await pool.query(query, [
      userId,
      title,
      message,
    ]);

    // Send email alert asynchronously
    if (sendEmailAlert && userId) {
      // Lookup user email
      pool.query('SELECT email FROM users WHERE id = $1', [userId])
        .then((userRes) => {
          if (userRes.rows.length > 0 && userRes.rows[0].email) {
            sendEmail({
              to: userRes.rows[0].email,
              subject: `[Dayflow HRMS] ${title}`,
              text: message,
              html: emailHtml,
            }).catch((err) => console.error('[Notifier] Email alert error:', err.message));
          }
        })
        .catch((err) => console.error('[Notifier] User email lookup error:', err.message));
    }

    return result.rows[0];
  } catch (err) {
    console.error('[Notifier Error] Failed to create notification:', err.message);
    return null;
  }
}

/**
 * Notify all users belonging to specific role(s) (e.g., 'ADMIN', 'HR')
 */
async function notifyRoles(roles, { title, message, emailHtml }) {
  try {
    const rolesArray = Array.isArray(roles) ? roles : [roles];
    const res = await pool.query(
      'SELECT id, email FROM users WHERE role = ANY($1::text[])',
      [rolesArray]
    );

    const notifications = [];
    for (const user of res.rows) {
      const notif = await sendNotification({
        userId: user.id,
        title,
        message,
        sendEmailAlert: true,
        emailHtml,
      });
      if (notif) notifications.push(notif);
    }
    return notifications;
  } catch (err) {
    console.error('[Notifier Error] Failed to notify roles:', err.message);
    return [];
  }
}

module.exports = {
  sendNotification,
  notifyRoles,
};
