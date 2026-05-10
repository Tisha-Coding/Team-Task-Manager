const pool = require("../config/db");

const createProject = async (name, description, adminId) => {
  const query = `
    INSERT INTO projects (name, description, admin_id)
    VALUES ($1, $2, $3)
    RETURNING id, name, description, admin_id, created_at;
  `;
  const result = await pool.query(query, [name, description, adminId]);
  return result.rows[0];
};

const getUserProjects = async (userId) => {
  const query = `
    WITH my_projects AS (
      SELECT DISTINCT p.id
      FROM projects p
      LEFT JOIN project_members pm ON p.id = pm.project_id
      WHERE p.admin_id = $1 OR pm.user_id = $1
    )
    SELECT
      p.id, p.name, p.description, p.admin_id, p.created_at, p.updated_at,
      u.name                          AS admin_name,
      COUNT(DISTINCT pm.user_id)      AS member_count,
      COUNT(DISTINCT t.id)            AS task_count,
      COALESCE(
        json_agg(
          DISTINCT jsonb_build_object('id', mu.id, 'name', mu.name)
        ) FILTER (WHERE mu.id IS NOT NULL),
        '[]'
      )                               AS members
    FROM projects p
    JOIN my_projects mp ON p.id = mp.id
    LEFT JOIN users u  ON p.admin_id = u.id
    LEFT JOIN project_members pm ON p.id = pm.project_id
    LEFT JOIN users mu ON pm.user_id = mu.id
    LEFT JOIN tasks t  ON p.id = t.project_id
    GROUP BY p.id, p.name, p.description, p.admin_id, p.created_at, p.updated_at, u.name
    ORDER BY p.created_at DESC;
  `;
  const result = await pool.query(query, [userId]);
  return result.rows;
};

const getProjectById = async (projectId) => {
  const projectQuery = `
    SELECT id, name, description, admin_id, created_at, updated_at
    FROM projects
    WHERE id = $1;
  `;
  const membersQuery = `
    SELECT u.id, u.name, u.email, pm.role
    FROM project_members pm
    JOIN users u ON pm.user_id = u.id
    WHERE pm.project_id = $1;
  `;

  const projectResult = await pool.query(projectQuery, [projectId]);
  if (projectResult.rows.length === 0) return null;

  const membersResult = await pool.query(membersQuery, [projectId]);
  const project = projectResult.rows[0];
  project.members = membersResult.rows;

  return project;
};

const updateProject = async (projectId, name, description) => {
  const query = `
    UPDATE projects
    SET name = $1, description = $2, updated_at = CURRENT_TIMESTAMP
    WHERE id = $3
    RETURNING id, name, description, admin_id, created_at, updated_at;
  `;
  const result = await pool.query(query, [name, description, projectId]);
  return result.rows[0];
};

const deleteProject = async (projectId) => {
  const query = "DELETE FROM projects WHERE id = $1 RETURNING id;";
  const result = await pool.query(query, [projectId]);
  return result.rows[0];
};

const addProjectMember = async (projectId, userId, role = "member") => {
  const query = `
    INSERT INTO project_members (project_id, user_id, role)
    VALUES ($1, $2, $3)
    ON CONFLICT (project_id, user_id) DO NOTHING
    RETURNING id, project_id, user_id, role;
  `;
  const result = await pool.query(query, [projectId, userId, role]);
  return result.rows[0];
};

const removeProjectMember = async (projectId, userId) => {
  const query =
    "DELETE FROM project_members WHERE project_id = $1 AND user_id = $2 RETURNING id;";
  const result = await pool.query(query, [projectId, userId]);
  return result.rows[0];
};

module.exports = {
  createProject,
  getUserProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addProjectMember,
  removeProjectMember,
};
