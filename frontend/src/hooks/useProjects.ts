import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../store/store";
import {
  setLoading,
  setProjects,
  setError,
  addProject,
  deleteProject,
  updateProject,
  removeMemberFromProject,
} from "../store/slices/projectSlice";
import {
  createProjectAPI,
  getProjectsAPI,
  updateProjectAPI,
  deleteProjectAPI,
  addProjectMemberAPI,
  removeProjectMemberAPI,
} from "../services/api";
import { handleApiError } from "../services/api";

export const useProjects = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { projects, isLoading, error } = useSelector(
    (state: RootState) => state.projects,
  );

  const fetchProjects = async () => {
    try {
      dispatch(setLoading(true));
      const response = await getProjectsAPI();
      dispatch(setProjects(response.data.projects || []));
      return { success: true };
    } catch (err: any) {
      const errorMessage = handleApiError(err);
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    }
  };

  const createNew = async (name: string, description: string) => {
    try {
      dispatch(setLoading(true));
      const response = await createProjectAPI({ name, description });
      if (response.data.project) dispatch(addProject(response.data.project));
      return { success: true, project: response.data.project };
    } catch (err: any) {
      const errorMessage = handleApiError(err);
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    }
  };

  const update = async (
    projectId: number,
    data: { name?: string; description?: string },
  ) => {
    try {
      dispatch(setLoading(true));
      await updateProjectAPI(projectId, data);
      dispatch(updateProject({ id: projectId, ...data } as any));
      return { success: true };
    } catch (err: any) {
      const errorMessage = handleApiError(err);
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    }
  };

  const deleteOne = async (projectId: number) => {
    try {
      dispatch(setLoading(true));
      await deleteProjectAPI(projectId);
      dispatch(deleteProject(projectId));
      return { success: true };
    } catch (err: any) {
      const errorMessage = handleApiError(err);
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    }
  };

  const addMember = async (projectId: number, userId: number) => {
    try {
      dispatch(setLoading(true));
      await addProjectMemberAPI(projectId, userId);
      return { success: true };
    } catch (err: any) {
      const errorMessage = handleApiError(err);
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    }
  };

  const removeMember = async (projectId: number, userId: number) => {
    try {
      dispatch(setLoading(true));
      await removeProjectMemberAPI(projectId, userId);
      dispatch(removeMemberFromProject({ projectId, userId }));
      return { success: true };
    } catch (err: any) {
      const errorMessage = handleApiError(err);
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    }
  };

  return {
    projects,
    isLoading,
    error,
    fetchProjects,
    createNew,
    update,
    deleteOne,
    addMember,
    removeMember,
  };
};
