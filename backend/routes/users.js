const express = require("express");
const authMiddleware = require("../middleware/auth");
const { requireRole } = require("../middleware/role");
const {
  listUsers,
  getUserById,
  updateUserRole,
  deleteUser,
} = require("../controllers/userController");

const router = express.Router();

router.use(authMiddleware);

router.get("/", listUsers);
router.get("/:id", getUserById);
router.patch("/:id/role", requireRole("admin"), updateUserRole);
router.delete("/:id", requireRole("admin"), deleteUser);

module.exports = router;
