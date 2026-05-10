import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface Task {
  id: number;
  title: string;
  description: string;
  project_id: number;
  created_by: number;
  status: "to_do" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  due_date: string | null;
  created_at: string;
  assignees?: Array<{
    id: number;
    name: string;
    email: string;
  }>;
}

interface TaskState {
  tasks: Task[];
  projectTasks: Task[];
  userTasks: Task[];
  selectedTask: Task | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: TaskState = {
  tasks: [],
  projectTasks: [],
  userTasks: [],
  selectedTask: null,
  isLoading: false,
  error: null,
};

const taskSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setTasks: (state, action: PayloadAction<Task[]>) => {
      state.tasks = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setProjectTasks: (state, action: PayloadAction<Task[]>) => {
      state.projectTasks = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setUserTasks: (state, action: PayloadAction<Task[]>) => {
      state.userTasks = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setSelectedTask: (state, action: PayloadAction<Task>) => {
      state.selectedTask = action.payload;
    },
    addTask: (state, action: PayloadAction<Task>) => {
      state.tasks.push(action.payload);
      state.projectTasks.push(action.payload);
      state.isLoading = false;
      state.error = null;
    },
    updateTask: (state, action: PayloadAction<Task>) => {
      const index = state.tasks.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
      const projectIndex = state.projectTasks.findIndex(
        (t) => t.id === action.payload.id,
      );
      if (projectIndex !== -1) {
        state.projectTasks[projectIndex] = action.payload;
      }
      state.isLoading = false;
    },
    deleteTask: (state, action: PayloadAction<number>) => {
      state.tasks = state.tasks.filter((t) => t.id !== action.payload);
      state.projectTasks = state.projectTasks.filter(
        (t) => t.id !== action.payload,
      );
      state.isLoading = false;
    },
    updateTaskStatus: (
      state,
      action: PayloadAction<{
        taskId: number;
        status: "to_do" | "in_progress" | "done";
      }>,
    ) => {
      const task = state.tasks.find((t) => t.id === action.payload.taskId);
      if (task) {
        task.status = action.payload.status;
      }
      const projectTask = state.projectTasks.find(
        (t) => t.id === action.payload.taskId,
      );
      if (projectTask) {
        projectTask.status = action.payload.status;
      }
    },
    assignTask: (
      state,
      action: PayloadAction<{ taskId: number; user: any }>,
    ) => {
      const task = state.tasks.find((t) => t.id === action.payload.taskId);
      if (task && task.assignees) {
        task.assignees.push(action.payload.user);
      }
    },
    unassignTask: (
      state,
      action: PayloadAction<{ taskId: number; userId: number }>,
    ) => {
      const task = state.tasks.find((t) => t.id === action.payload.taskId);
      if (task && task.assignees) {
        task.assignees = task.assignees.filter(
          (a) => a.id !== action.payload.userId,
        );
      }
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setTasks,
  setProjectTasks,
  setUserTasks,
  setSelectedTask,
  addTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  assignTask,
  unassignTask,
  setError,
  clearError,
} = taskSlice.actions;

export default taskSlice.reducer;
