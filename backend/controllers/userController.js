const pool = require("../config/db");
const { getAllUsers, findUserById } = require("../models/userModel");

const listUsers = async (req, res, next) => {
  try {
    const users = await getAllUsers();
    res.json({ users });
  } catch (err) {
    next(err);
  }
};

const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!["admin", "member"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }
    const result = await pool.query(
      `UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2
       RETURNING id, name, email, role, created_at, updated_at;`,
      [role, id],
    );
    if (result.rowCount === 0)
      return res.status(404).json({ message: "User not found" });
    res.json({ user: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (Number(id) === Number(req.user.userId)) {
      return res.status(400).json({ message: "You cannot delete yourself" });
    }
    const result = await pool.query(
      "DELETE FROM users WHERE id = $1 RETURNING id;",
      [id],
    );
    if (result.rowCount === 0)
      return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted" });
  } catch (err) {
    next(err);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await findUserById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

module.exports = { listUsers, updateUserRole, deleteUser, getUserById };
