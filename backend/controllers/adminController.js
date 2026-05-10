const pool = require("../config/db");

const getStats = async (req, res, next) => {
  try {
    const adminId = req.user.userId;

    const [projectsRes, tasksRes, statusRes, overdueRes, perUserRes] =
      await Promise.all([
        pool.query(
          "SELECT COUNT(*)::int AS count FROM projects WHERE admin_id = $1;",
          [adminId],
        ),
        pool.query(
          "SELECT COUNT(*)::int AS count FROM tasks t JOIN projects p ON t.project_id = p.id WHERE p.admin_id = $1;",
          [adminId],
        ),
        pool.query(
          `SELECT status, COUNT(*)::int AS count FROM tasks t
                  JOIN projects p ON t.project_id = p.id
                  WHERE p.admin_id = $1
                  GROUP BY status;`,
          [adminId],
        ),
        pool.query(
          `SELECT COUNT(*)::int AS count FROM tasks t
                  JOIN projects p ON t.project_id = p.id
                  WHERE p.admin_id = $1
                    AND due_date IS NOT NULL AND due_date < CURRENT_DATE
                    AND status NOT IN ('done', 'completed');`,
          [adminId],
        ),
        pool.query(
          `SELECT u.id, u.name, u.email,
                         COUNT(DISTINCT ta.task_id)::int AS task_count
                  FROM users u
                  LEFT JOIN task_assignments ta ON ta.user_id = u.id
                  LEFT JOIN tasks t ON ta.task_id = t.id
                  LEFT JOIN projects p ON t.project_id = p.id
                  WHERE p.admin_id = $1 OR p.admin_id IS NULL
                  GROUP BY u.id, u.name, u.email
                  ORDER BY task_count DESC;`,
          [adminId],
        ),
      ]);

    const byStatus = {};
    for (const row of statusRes.rows) byStatus[row.status] = row.count;

    res.json({
      stats: {
        totalProjects: projectsRes.rows[0].count,
        totalTasks: tasksRes.rows[0].count,
        overdue: overdueRes.rows[0].count,
        byStatus,
        tasksPerUser: perUserRes.rows,
      },
    });
  } catch (err) {
    next(err);
  }
};

const getAllProjects = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT p.id, p.name, p.description, p.admin_id, p.created_at,
             u.name AS admin_name, u.email AS admin_email,
             (SELECT COUNT(*)::int FROM project_members pm WHERE pm.project_id = p.id) AS member_count,
             (SELECT COUNT(*)::int FROM tasks t WHERE t.project_id = p.id) AS task_count
      FROM projects p
      JOIN users u ON p.admin_id = u.id
      ORDER BY p.created_at DESC;
    `);
    res.json({ projects: result.rows });
  } catch (err) {
    next(err);
  }
};

const getAllTasks = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT t.id, t.title, t.description, t.status, t.priority, t.due_date,
             t.created_at, t.project_id,
             p.name AS project_name,
             u.name AS created_by_name,
             COALESCE(json_agg(json_build_object('id', au.id, 'name', au.name, 'email', au.email))
                      FILTER (WHERE au.id IS NOT NULL), '[]') AS assignees
      FROM tasks t
      JOIN projects p ON t.project_id = p.id
      JOIN users u ON t.created_by = u.id
      LEFT JOIN task_assignments ta ON ta.task_id = t.id
      LEFT JOIN users au ON ta.user_id = au.id
      GROUP BY t.id, p.name, u.name
      ORDER BY t.created_at DESC;
    `);
    res.json({ tasks: result.rows });
  } catch (err) {
    next(err);
  }
};

module.exports = { getStats, getAllProjects, getAllTasks };
