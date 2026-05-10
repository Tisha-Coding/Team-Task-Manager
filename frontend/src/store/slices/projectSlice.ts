import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface Project {
  id: number;
  name: string;
  description: string;
  admin_id: number;
  created_at: string;
  members?: Array<{
    id: number;
    name: string;
    email: string;
    role: string;
  }>;
}

interface ProjectState {
  projects: Project[];
  selectedProject: Project | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ProjectState = {
  projects: [],
  selectedProject: null,
  isLoading: false,
  error: null,
};

const projectSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setProjects: (state, action: PayloadAction<Project[]>) => {
      state.projects = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setSelectedProject: (state, action: PayloadAction<Project>) => {
      state.selectedProject = action.payload;
    },
    addProject: (state, action: PayloadAction<Project>) => {
      state.projects.push(action.payload);
      state.isLoading = false;
      state.error = null;
    },
    updateProject: (state, action: PayloadAction<Project>) => {
      const index = state.projects.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state.projects[index] = action.payload;
      }
      state.isLoading = false;
    },
    deleteProject: (state, action: PayloadAction<number>) => {
      state.projects = state.projects.filter((p) => p.id !== action.payload);
      state.isLoading = false;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    addMemberToProject: (
      state,
      action: PayloadAction<{ projectId: number; member: any }>,
    ) => {
      const project = state.projects.find(
        (p) => p.id === action.payload.projectId,
      );
      if (project && project.members) {
        project.members.push(action.payload.member);
      }
    },
    removeMemberFromProject: (
      state,
      action: PayloadAction<{ projectId: number; userId: number }>,
    ) => {
      const project = state.projects.find(
        (p) => p.id === action.payload.projectId,
      );
      if (project && project.members) {
        project.members = project.members.filter(
          (m) => m.id !== action.payload.userId,
        );
      }
    },
  },
});

export const {
  setLoading,
  setProjects,
  setSelectedProject,
  addProject,
  updateProject,
  deleteProject,
  setError,
  clearError,
  addMemberToProject,
  removeMemberFromProject,
} = projectSlice.actions;

export default projectSlice.reducer;
