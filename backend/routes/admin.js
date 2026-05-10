const express = require("express");
const authMiddleware = require("../middleware/auth");
const { requireRole } = require("../middleware/role");
const {
  getStats,
  getAllProjects,
  getAllTasks,
} = require("../controllers/adminController");

const router = express.Router();

router.use(authMiddleware, requireRole("admin"));

router.get("/stats", getStats);
router.get("/projects", getAllProjects);
router.get("/tasks", getAllTasks);

module.exports = router;
