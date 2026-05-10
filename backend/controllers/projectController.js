const {
  createProject,
  getUserProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addProjectMember,
  removeProjectMember,
} = require("../models/projectModel");

const create = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const userId = req.user.userId;

    if (!name) {
      return res.status(400).json({ message: "Project name is required" });
    }

    const project = await createProject(name, description || "", userId);
    await addProjectMember(project.id, userId, "admin");

    res.status(201).json({
      message: "Project created successfully",
      project,
    });
  } catch (error) {
    next(error);
  }
};

const getAll = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const projects = await getUserProjects(userId);

    res.json({
      message: "Projects retrieved successfully",
      projects,
    });
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const project = await getProjectById(id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json({
      message: "Project retrieved successfully",
      project,
    });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const userId = req.user.userId;

    const project = await getProjectById(id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.admin_id !== userId) {
      return res.status(403).json({ message: "Only admin can update project" });
    }

    const updatedProject = await updateProject(id, name, description);

    res.json({
      message: "Project updated successfully",
      project: updatedProject,
    });
  } catch (error) {
    next(error);
  }
};

const deleteProj = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const project = await getProjectById(id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.admin_id !== userId) {
      return res.status(403).json({ message: "Only admin can delete project" });
    }

    await deleteProject(id);

    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    next(error);
  }
};

const addMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const currentUserId = req.user.userId;

    const project = await getProjectById(id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.admin_id !== currentUserId) {
      return res.status(403).json({ message: "Only admin can add members" });
    }

    const member = await addProjectMember(id, userId, "member");

    res.status(201).json({
      message: "Member added successfully",
      member,
    });
  } catch (error) {
    next(error);
  }
};

const removeMember = async (req, res, next) => {
  try {
    const { id, userId } = req.params;
    const currentUserId = req.user.userId;

    const project = await getProjectById(id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.admin_id !== currentUserId) {
      return res.status(403).json({ message: "Only admin can remove members" });
    }

    await removeProjectMember(id, userId);

    res.json({ message: "Member removed successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  create,
  getAll,
  getById,
  update,
  deleteProj,
  addMember,
  removeMember,
};
