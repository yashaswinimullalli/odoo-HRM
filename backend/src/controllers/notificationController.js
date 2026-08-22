const { pool } = require('../config/db');

/**
 * Get current user's notifications / alerts
 */
const getMyNotifications = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const { unread_only } = req.query;

    let query = `
      SELECT id, title, message, is_read, created_at
      FROM notifications
      WHERE user_id = $1
    `;
    const params = [userId];

    if (unread_only === 'true') {
      query += ' AND is_read = FALSE';
    }

    query += ' ORDER BY created_at DESC LIMIT 50';

    const result = await pool.query(query, params);

    // Count unread
    const unreadCountRes = await pool.query(
      'SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = FALSE',
      [userId]
    );

    res.json({
      success: true,
      unread_count: parseInt(unreadCountRes.rows[0].count, 10),
      count: result.rows.length,
      notifications: result.rows,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Mark a specific notification as read
 */
const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;

    const query = `
      UPDATE notifications 
      SET is_read = TRUE 
      WHERE id = $1 AND user_id = $2
      RETURNING id, title, is_read
    `;
    const result = await pool.query(query, [id, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }

    res.json({
      success: true,
      message: 'Notification marked as read.',
      notification: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Mark all notifications as read
 */
const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    await pool.query('UPDATE notifications SET is_read = TRUE WHERE user_id = $1', [userId]);

    res.json({
      success: true,
      message: 'All notifications marked as read.',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
};
