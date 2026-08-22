const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required. Please sign in.',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dayflow_hrms_super_secret_jwt_key_2026');

    // Fetch user and linked employee details
    const userQuery = `
      SELECT 
        u.id AS user_id,
        u.email,
        u.role,
        u.is_active,
        u.is_verified,
        e.id AS employee_id,
        e.employee_code,
        e.first_name,
        e.last_name,
        e.department_id,
        e.designation_id
      FROM users u
      LEFT JOIN employees e ON u.id = e.user_id
      WHERE u.id = $1
    `;
    const userRes = await pool.query(userQuery, [decoded.userId]);

    if (userRes.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'User account not found.' });
    }

    const user = userRes.rows[0];

    if (!user.is_active) {
      return res.status(403).json({ success: false, message: 'Account is deactivated. Contact HR.' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Session expired. Please sign in again.' });
    }
    return res.status(403).json({ success: false, message: 'Invalid or corrupted access token.' });
  }
};

const authorizeRoles = (...roles) => {
  const flattenedRoles = roles.flat();
  return (req, res, next) => {
    if (!req.user || !flattenedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. This action requires one of the following roles: ${flattenedRoles.join(', ')}`,
      });
    }
    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRoles,
  authenticate: authenticateToken,
  authorizeRole: authorizeRoles,
};
