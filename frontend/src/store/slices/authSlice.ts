import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  } | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

const persistedUser = localStorage.getItem("user");
const initialState: AuthState = {
  user: persistedUser ? JSON.parse(persistedUser) : null,
  token: localStorage.getItem("token"),
  isLoading: false,
  error: null,
  isAuthenticated: !!localStorage.getItem("token"),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setAuthSuccess: (
      state,
      action: PayloadAction<{ token: string; user: any }>,
    ) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("user", JSON.stringify(action.payload.user));
    },
    setAuthError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { setLoading, setAuthSuccess, setAuthError, logout, clearError } =
  authSlice.actions;

export default authSlice.reducer;
