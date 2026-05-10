const pool = require("../config/db");
const {
  createTask,
  getProjectTasks,
  getTaskById,
  updateTask,
  deleteTask,
  assignTask,
  unassignTask,
  getUserTasks,
} = require("../models/taskModel");
const { getProjectById } = require("../models/projectModel");

const create = async (req, res, next) => {
  try {
    const { title, description, projectId, dueDate, priority } = req.body;
    const userId = req.user.userId;

    if (!title || !projectId) {
      return res
        .status(400)
        .json({ message: "Title and project ID are required" });
    }

    const project = await getProjectById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const task = await createTask(
      title,
      description || "",
      projectId,
      userId,
      dueDate || null,
      priority || "medium",
    );

    res.status(201).json({
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    next(error);
  }
};

const getProjectTasksList = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { status, priority } = req.query;

    const tasks = await getProjectTasks(projectId, { status, priority });

    res.json({
      message: "Tasks retrieved successfully",
      tasks,
    });
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const task = await getTaskById(id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({
      message: "Task retrieved successfully",
      task,
    });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userRole = req.user.role;
    const userId = req.user.userId;

    if (userRole === "member") {
      const { status } = req.body;
      const validStatuses = [
        "pending",
        "in_progress",
        "completed",
        "to_do",
        "done",
      ];
      if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({ message: "A valid status is required" });
      }
      const check = await pool.query(
        "SELECT 1 FROM task_assignments WHERE task_id = $1 AND user_id = $2",
        [id, userId],
      );
      if (check.rows.length === 0) {
        return res
          .status(403)
          .json({ message: "You can only update tasks assigned to you" });
      }
      const updatedTask = await updateTask(
        id,
        undefined,
        undefined,
        status,
        undefined,
        undefined,
      );
      return res.json({ message: "Task status updated", task: updatedTask });
    }

    const { title, description, status, priority, dueDate } = req.body;
    const updatedTask = await updateTask(
      id,
      title,
      description,
      status,
      priority,
      dueDate,
    );

    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ message: "Task updated successfully", task: updatedTask });
  } catch (error) {
    next(error);
  }
};

const deleteTaskCtrl = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deletedTask = await deleteTask(id);

    if (!deletedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    next(error);
  }
};

const assignTaskToUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const assignment = await assignTask(id, userId);

    res.status(201).json({
      message: "Task assigned successfully",
      assignment,
    });
  } catch (error) {
    next(error);
  }
};

const unassignTaskFromUser = async (req, res, next) => {
  try {
    const { id, userId } = req.params;

    const assignment = await unassignTask(id, userId);

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    res.json({ message: "Task unassigned successfully" });
  } catch (error) {
    next(error);
  }
};

const getUserTasksList = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const tasks = await getUserTasks(userId);

    res.json({
      message: "User tasks retrieved successfully",
      tasks,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  create,
  getProjectTasksList,
  getById,
  update,
  deleteTaskCtrl,
  assignTaskToUser,
  unassignTaskFromUser,
  getUserTasksList,
};
