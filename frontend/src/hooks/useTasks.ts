import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../store/store";
import {
  setLoading,
  setProjectTasks,
  setUserTasks,
  setError,
  addTask,
  deleteTask,
  updateTaskStatus,
  assignTask,
  unassignTask,
} from "../store/slices/tasksSlice";
import {
  createTaskAPI,
  getProjectTasksAPI,
  getUserTasksAPI,
  updateTaskAPI,
  deleteTaskAPI,
  assignTaskAPI,
  unassignTaskAPI,
} from "../services/api";
import { handleApiError } from "../services/api";

export const useTasks = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { projectTasks, userTasks, isLoading, error } = useSelector(
    (state: RootState) => state.tasks,
  );

  const fetchProjectTasks = async (
    projectId: number,
    filters?: { status?: string; priority?: string },
  ) => {
    try {
      dispatch(setLoading(true));
      const response = await getProjectTasksAPI(projectId, filters);
      dispatch(setProjectTasks(response.data.tasks || []));
      return { success: true };
    } catch (err: any) {
      const errorMessage = handleApiError(err);
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    }
  };

  const fetchUserTasks = async () => {
    try {
      dispatch(setLoading(true));
      const response = await getUserTasksAPI();
      dispatch(setUserTasks(response.data.tasks || []));
      return { success: true };
    } catch (err: any) {
      const errorMessage = handleApiError(err);
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    }
  };

  const createNew = async (data: {
    title: string;
    description: string;
    projectId: number;
    priority?: string;
    dueDate?: string;
  }) => {
    try {
      dispatch(setLoading(true));
      const response = await createTaskAPI(data);
      if (response.data.task) dispatch(addTask(response.data.task));
      return { success: true, task: response.data.task };
    } catch (err: any) {
      const errorMessage = handleApiError(err);
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    }
  };

  const changeStatus = async (taskId: number, status: string) => {
    try {
      dispatch(setLoading(true));
      await updateTaskAPI(taskId, { status });
      dispatch(updateTaskStatus({ taskId, status: status as any }));
      return { success: true };
    } catch (err: any) {
      const errorMessage = handleApiError(err);
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    }
  };

  const editTask = async (
    taskId: number,
    data: {
      title?: string;
      description?: string;
      status?: string;
      priority?: string;
      dueDate?: string;
    },
  ) => {
    try {
      dispatch(setLoading(true));
      const res = await updateTaskAPI(taskId, data);
      return { success: true, task: res.data.task };
    } catch (err: any) {
      const errorMessage = handleApiError(err);
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    }
  };

  const assign = async (taskId: number, userId: number) => {
    try {
      dispatch(setLoading(true));
      const response = await assignTaskAPI(taskId, userId);
      if (response.data.assignee) {
        dispatch(assignTask({ taskId, user: response.data.assignee }));
      }
      return { success: true };
    } catch (err: any) {
      const errorMessage = handleApiError(err);
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    }
  };

  const unassign = async (taskId: number, userId: number) => {
    try {
      dispatch(setLoading(true));
      await unassignTaskAPI(taskId, userId);
      dispatch(unassignTask({ taskId, userId }));
      return { success: true };
    } catch (err: any) {
      const errorMessage = handleApiError(err);
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    }
  };

  const deleteOne = async (taskId: number) => {
    try {
      dispatch(setLoading(true));
      await deleteTaskAPI(taskId);
      dispatch(deleteTask(taskId));
      return { success: true };
    } catch (err: any) {
      const errorMessage = handleApiError(err);
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    }
  };

  return {
    projectTasks,
    userTasks,
    isLoading,
    error,
    fetchProjectTasks,
    fetchUserTasks,
    createNew,
    changeStatus,
    editTask,
    assign,
    unassign,
    deleteOne,
  };
};
