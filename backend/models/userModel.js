const pool = require("../config/db");

const createUser = async (name, email, hashedPassword, role = "member") => {
  const validRoles = ["admin", "member"];
  const safeRole = validRoles.includes(role) ? role : "member";
  const query = `
    INSERT INTO users (name, email, password, role)
    VALUES ($1, $2, $3, $4)
    RETURNING id, name, email, role, created_at;
  `;
  const result = await pool.query(query, [
    name,
    email,
    hashedPassword,
    safeRole,
  ]);
  return result.rows[0];
};

const findUserByEmail = async (email) => {
  const query = "SELECT * FROM users WHERE email = $1;";
  const result = await pool.query(query, [email]);
  return result.rows[0];
};

const findUserById = async (userId) => {
  const query =
    "SELECT id, name, email, role, created_at FROM users WHERE id = $1;";
  const result = await pool.query(query, [userId]);
  return result.rows[0];
};

const updateUser = async (userId, name, email) => {
  const query = `
    UPDATE users
    SET name = $1, email = $2, updated_at = CURRENT_TIMESTAMP
    WHERE id = $3
    RETURNING id, name, email, role, created_at, updated_at;
  `;
  const result = await pool.query(query, [name, email, userId]);
  return result.rows[0];
};

const getAllUsers = async () => {
  const query =
    "SELECT id, name, email, role, created_at FROM users ORDER BY name;";
  const result = await pool.query(query);
  return result.rows;
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  updateUser,
  getAllUsers,
};
