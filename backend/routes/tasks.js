const express = require("express");
const {
  create,
  getProjectTasksList,
  getById,
  update,
  deleteTaskCtrl,
  assignTaskToUser,
  unassignTaskFromUser,
  getUserTasksList,
} = require("../controllers/taskController");
const authMiddleware = require("../middleware/auth");
const { requireRole } = require("../middleware/role");

const router = express.Router();

router.use(authMiddleware);

router.post("/", requireRole("admin"), create);
router.post("/:id/assign", requireRole("admin"), assignTaskToUser);
router.delete(
  "/:id/assign/:userId",
  requireRole("admin"),
  unassignTaskFromUser,
);
router.delete("/:id", requireRole("admin"), deleteTaskCtrl);
router.get("/user/tasks", getUserTasksList);
router.get("/project/:projectId", getProjectTasksList);
router.get("/:id", getById);
router.put("/:id", update);

module.exports = router;
