const express = require("express");
const {
  create,
  getAll,
  getById,
  update,
  deleteProj,
  addMember,
  removeMember,
} = require("../controllers/projectController");
const authMiddleware = require("../middleware/auth");
const { requireRole } = require("../middleware/role");

const router = express.Router();

router.use(authMiddleware);

router.post("/", requireRole("admin"), create);
router.get("/", getAll);
router.get("/:id", getById);
router.put("/:id", requireRole("admin"), update);
router.delete("/:id", requireRole("admin"), deleteProj);
router.post("/:id/members", requireRole("admin"), addMember);
router.delete("/:id/members/:userId", requireRole("admin"), removeMember);

module.exports = router;
