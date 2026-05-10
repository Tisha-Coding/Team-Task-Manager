import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../store/store";
import {
  setLoading,
  setAuthSuccess,
  setAuthError,
  logout,
} from "../store/slices/authSlice";
import { signupAPI, loginAPI, handleApiError } from "../services/api";

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, token, isLoading, error, isAuthenticated } = useSelector(
    (state: RootState) => state.auth,
  );

  const signup = async (
    name: string,
    email: string,
    password: string,
    confirmPassword: string,
    role: "admin" | "member",
  ) => {
    try {
      dispatch(setLoading(true));
      const response = await signupAPI({
        name,
        email,
        password,
        confirmPassword,
        role,
      });
      dispatch(setLoading(false));

      if (response.data?.token) {
        return { success: true, email };
      }
      const msg = response.data?.message || "Signup failed";
      dispatch(setAuthError(msg));
      return { success: false, error: msg };
    } catch (err: any) {
      const errorMessage = handleApiError(err);
      dispatch(setAuthError(errorMessage));
      return { success: false, error: errorMessage };
    }
  };

  const login = async (email: string, password: string) => {
    try {
      dispatch(setLoading(true));
      const response = await loginAPI({ email, password });

      if (response.data?.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        dispatch(
          setAuthSuccess({
            token: response.data.token,
            user: response.data.user,
          }),
        );
        return { success: true, role: response.data.user.role as string };
      }
      const msg = response.data?.message || "Login failed";
      dispatch(setAuthError(msg));
      return { success: false, error: msg };
    } catch (err: any) {
      const errorMessage = handleApiError(err);
      dispatch(setAuthError(errorMessage));
      return { success: false, error: errorMessage };
    }
  };

  const logoutUser = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    dispatch(logout());
  };

  return {
    user,
    token,
    isLoading,
    error,
    isAuthenticated,
    signup,
    login,
    logout: logoutUser,
  };
};
