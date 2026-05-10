import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
    }
    return Promise.reject(error);
  },
);

// Auth
export const signupAPI = (data: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: "admin" | "member";
}) => axiosInstance.post("/auth/signup", data);

export const loginAPI = (data: { email: string; password: string }) =>
  axiosInstance.post("/auth/login", data);

export const getCurrentUserAPI = () => axiosInstance.get("/auth/me");

// Users
export const listUsersAPI = () => axiosInstance.get("/users");
export const updateUserRoleAPI = (userId: number, role: "admin" | "member") =>
  axiosInstance.patch(`/users/${userId}/role`, { role });
export const deleteUserAPI = (userId: number) =>
  axiosInstance.delete(`/users/${userId}`);

// Admin
export const getAdminStatsAPI = () => axiosInstance.get("/admin/stats");
export const getAllProjectsAdminAPI = () =>
  axiosInstance.get("/admin/projects");
export const getAllTasksAdminAPI = () => axiosInstance.get("/admin/tasks");

// Projects
export const createProjectAPI = (data: { name: string; description: string }) =>
  axiosInstance.post("/projects", data);

export const getProjectsAPI = () => axiosInstance.get("/projects");
export const getProjectAPI = (projectId: number) =>
  axiosInstance.get(`/projects/${projectId}`);
export const updateProjectAPI = (
  projectId: number,
  data: {
    name?: string;
    description?: string;
  },
) => axiosInstance.put(`/projects/${projectId}`, data);
export const deleteProjectAPI = (projectId: number) =>
  axiosInstance.delete(`/projects/${projectId}`);
export const addProjectMemberAPI = (projectId: number, userId: number) =>
  axiosInstance.post(`/projects/${projectId}/members`, { userId });
export const removeProjectMemberAPI = (projectId: number, userId: number) =>
  axiosInstance.delete(`/projects/${projectId}/members/${userId}`);

// Tasks
export const createTaskAPI = (data: {
  title: string;
  description: string;
  projectId: number;
  priority?: string;
  dueDate?: string;
}) => axiosInstance.post("/tasks", data);

export const getTasksAPI = () => axiosInstance.get("/tasks");
export const getProjectTasksAPI = (
  projectId: number,
  filters?: {
    status?: string;
    priority?: string;
  },
) => {
  const params = new URLSearchParams();
  if (filters?.status) params.append("status", filters.status);
  if (filters?.priority) params.append("priority", filters.priority);
  return axiosInstance.get(`/tasks/project/${projectId}?${params.toString()}`);
};

export const getUserTasksAPI = () => axiosInstance.get("/tasks/user/tasks");
export const getTaskAPI = (taskId: number) =>
  axiosInstance.get(`/tasks/${taskId}`);
export const updateTaskAPI = (
  taskId: number,
  data: {
    title?: string;
    description?: string;
    status?: string;
    priority?: string;
    dueDate?: string;
  },
) => axiosInstance.put(`/tasks/${taskId}`, data);
export const deleteTaskAPI = (taskId: number) =>
  axiosInstance.delete(`/tasks/${taskId}`);
export const assignTaskAPI = (taskId: number, userId: number) =>
  axiosInstance.post(`/tasks/${taskId}/assign`, { userId });
export const unassignTaskAPI = (taskId: number, userId: number) =>
  axiosInstance.delete(`/tasks/${taskId}/assign/${userId}`);

export const handleApiError = (error: any): string => {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.message) return error.message;
  return "An error occurred";
};

export default axiosInstance;
