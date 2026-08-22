const { pool } = require('../config/db');

/**
 * List all departments with their associated designations
 */
const getDepartments = async (req, res, next) => {
  try {
    const deptQuery = `
      SELECT 
        d.id,
        d.name,
        d.description,
        COUNT(e.id) AS employee_count
      FROM departments d
      LEFT JOIN employees e ON d.id = e.department_id AND e.employment_status = 'ACTIVE'
      GROUP BY d.id, d.name, d.description
      ORDER BY d.id ASC
    `;
    const result = await pool.query(deptQuery);

    res.json({
      success: true,
      count: result.rows.length,
      departments: result.rows,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * List all designations (optionally filtered by department)
 */
const getDesignations = async (req, res, next) => {
  try {
    const { department_id } = req.query;

    let query = `
      SELECT 
        ds.id,
        ds.department_id,
        d.name AS department_name,
        ds.title,
        ds.description
      FROM designations ds
      LEFT JOIN departments d ON ds.department_id = d.id
      WHERE 1=1
    `;
    const params = [];

    if (department_id) {
      params.push(department_id);
      query += ` AND ds.department_id = $1`;
    }

    query += ` ORDER BY ds.department_id, ds.id ASC`;

    const result = await pool.query(query, params);

    res.json({
      success: true,
      count: result.rows.length,
      designations: result.rows,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDepartments,
  getDesignations,
};
