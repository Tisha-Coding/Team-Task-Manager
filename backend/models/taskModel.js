const pool = require("../config/db");

const createTask = async (
  title,
  description,
  projectId,
  createdBy,
  dueDate,
  priority,
) => {
  const query = `
    INSERT INTO tasks (title, description, project_id, created_by, due_date, priority)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, title, description, project_id, created_by, status, priority, due_date, created_at;
  `;
  const result = await pool.query(query, [
    title,
    description,
    projectId,
    createdBy,
    dueDate,
    priority,
  ]);
  return result.rows[0];
};

const getProjectTasks = async (projectId, filters = {}) => {
  let query = `
    SELECT t.id, t.title, t.description, t.project_id, t.created_by, t.status, t.priority, t.due_date, t.created_at,
           u.name as created_by_name
    FROM tasks t
    JOIN users u ON t.created_by = u.id
    WHERE t.project_id = $1
  `;
  const params = [projectId];

  if (filters.status) {
    query += ` AND t.status = $${params.length + 1}`;
    params.push(filters.status);
  }

  if (filters.priority) {
    query += ` AND t.priority = $${params.length + 1}`;
    params.push(filters.priority);
  }

  query += ` ORDER BY t.created_at DESC;`;
  const result = await pool.query(query, params);
  return result.rows;
};

const getTaskById = async (taskId) => {
  const taskQuery = `
    SELECT t.id, t.title, t.description, t.project_id, t.created_by, t.status, t.priority, t.due_date, t.created_at,
           u.name as created_by_name
    FROM tasks t
    JOIN users u ON t.created_by = u.id
    WHERE t.id = $1;
  `;
  const assigneesQuery = `
    SELECT u.id, u.name, u.email
    FROM task_assignments ta
    JOIN users u ON ta.user_id = u.id
    WHERE ta.task_id = $1;
  `;

  const taskResult = await pool.query(taskQuery, [taskId]);
  if (taskResult.rows.length === 0) return null;

  const assigneesResult = await pool.query(assigneesQuery, [taskId]);
  const task = taskResult.rows[0];
  task.assignees = assigneesResult.rows;

  return task;
};

const updateTask = async (
  taskId,
  title,
  description,
  status,
  priority,
  dueDate,
) => {
  const query = `
    UPDATE tasks
    SET title = COALESCE($1, title),
        description = COALESCE($2, description),
        status = COALESCE($3, status),
        priority = COALESCE($4, priority),
        due_date = COALESCE($5, due_date),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $6
    RETURNING id, title, description, project_id, created_by, status, priority, due_date, created_at, updated_at;
  `;
  const result = await pool.query(query, [
    title,
    description,
    status,
    priority,
    dueDate,
    taskId,
  ]);
  return result.rows[0];
};

const deleteTask = async (taskId) => {
  const query = "DELETE FROM tasks WHERE id = $1 RETURNING id;";
  const result = await pool.query(query, [taskId]);
  return result.rows[0];
};

const assignTask = async (taskId, userId) => {
  const query = `
    INSERT INTO task_assignments (task_id, user_id)
    VALUES ($1, $2)
    ON CONFLICT (task_id, user_id) DO NOTHING
    RETURNING id, task_id, user_id, assigned_at;
  `;
  const result = await pool.query(query, [taskId, userId]);
  return result.rows[0];
};

const unassignTask = async (taskId, userId) => {
  const query =
    "DELETE FROM task_assignments WHERE task_id = $1 AND user_id = $2 RETURNING id;";
  const result = await pool.query(query, [taskId, userId]);
  return result.rows[0];
};

const getUserTasks = async (userId) => {
  const query = `
    SELECT t.id, t.title, t.description, t.project_id, t.status, t.priority, t.due_date, t.created_at,
           p.name AS project_name
    FROM tasks t
    JOIN task_assignments ta ON t.id = ta.task_id
    LEFT JOIN projects p ON t.project_id = p.id
    WHERE ta.user_id = $1
    ORDER BY t.due_date ASC NULLS LAST, t.created_at DESC;
  `;
  const result = await pool.query(query, [userId]);
  return result.rows;
};

module.exports = {
  createTask,
  getProjectTasks,
  getTaskById,
  updateTask,
  deleteTask,
  assignTask,
  unassignTask,
  getUserTasks,
};
