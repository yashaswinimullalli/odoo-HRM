const { pool } = require('../config/db');

/**
 * Generate Company Prefix from Company Name (e.g. "Odoo India" -> "OI", "Dayflow" -> "DF")
 */
function getCompanyPrefix(companyName = 'Dayflow') {
  const words = companyName.trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  const clean = companyName.replace(/[^a-zA-Z]/g, '').toUpperCase();
  return (clean.substring(0, 2) || 'DF').padEnd(2, 'X');
}

/**
 * Generate Employee Login ID / Employee Code
 * Format: [CompanyPrefix][First2First][First2Last][Year][4DigitSerial]
 * Example: OIJODO20220001
 * 
 * @param {Object} params
 * @param {string} params.companyName - Name of the company
 * @param {string} params.firstName - Employee's first name
 * @param {string} params.lastName - Employee's last name
 * @param {string|number|Date} [params.joiningDate] - Date or Year of joining
 * @returns {Promise<string>} Auto-generated unique Login ID
 */
async function generateLoginId({ companyName = 'Odoo India', firstName = 'User', lastName = '', joiningDate = new Date() }) {
  try {
    const prefix = getCompanyPrefix(companyName);

    // First 2 letters of first name
    const fClean = (firstName || 'US').replace(/[^a-zA-Z]/g, '').toUpperCase();
    const f2 = (fClean.substring(0, 2) || 'US').padEnd(2, 'X');

    // First 2 letters of last name
    const lClean = (lastName || '').replace(/[^a-zA-Z]/g, '').toUpperCase();
    const l2 = lClean.length >= 2 ? lClean.substring(0, 2) : (lClean.length === 1 ? lClean + 'X' : 'XX');

    // Year of joining
    let year = new Date().getFullYear();
    if (joiningDate) {
      const parsedDate = new Date(joiningDate);
      if (!isNaN(parsedDate.getFullYear())) {
        year = parsedDate.getFullYear();
      }
    }

    const basePrefix = `${prefix}${f2}${l2}${year}`;

    // Get current maximum serial for this pattern in DB
    const res = await pool.query(
      `SELECT employee_code FROM employees WHERE employee_code LIKE $1 ORDER BY employee_code DESC LIMIT 1`,
      [`${prefix}%${year}%`]
    );

    let nextSerial = 1;
    if (res.rows.length > 0) {
      const lastCode = res.rows[0].employee_code;
      // Extract last 4 digits
      const match = lastCode.match(/(\d{4})$/);
      if (match) {
        nextSerial = parseInt(match[1], 10) + 1;
      }
    }

    const serialStr = String(nextSerial).padStart(4, '0');
    return `${basePrefix}${serialStr}`;
  } catch (err) {
    console.error('[ID Generator Error]', err);
    // Fallback in case of error
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `OI${(firstName.substring(0, 2) || 'EM').toUpperCase()}${(lastName.substring(0, 2) || 'PL').toUpperCase()}${new Date().getFullYear()}${rand}`;
  }
}

/**
 * Generate secure initial temporary password for newly created employee
 * Example: Dayflow@8492
 */
function generateTemporaryPassword() {
  const digits = Math.floor(1000 + Math.random() * 9000);
  return `Dayflow@${digits}`;
}

module.exports = {
  getCompanyPrefix,
  generateLoginId,
  generateTemporaryPassword,
};
