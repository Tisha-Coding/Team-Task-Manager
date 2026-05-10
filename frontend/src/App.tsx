import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Provider, useSelector } from "react-redux";
import store from "./store/store";
import type { RootState } from "./store/store";
import "./App.css";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminLayout from "./layouts/AdminLayout";
import MemberLayout from "./layouts/MemberLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProjects from "./pages/admin/AdminProjects";
import AdminTasks from "./pages/admin/AdminTasks";
import AdminMembers from "./pages/admin/AdminMembers";
import ProjectDetail from "./pages/ProjectDetail";
import MemberDashboard from "./pages/member/MemberDashboard";
import MemberProjects from "./pages/member/MemberProjects";
import Profile from "./pages/Profile";

function RootRedirect() {
  const { isAuthenticated, user } = useSelector((s: RootState) => s.auth);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return (
    <Navigate
      to={user?.role === "admin" ? "/admin/dashboard" : "/member/dashboard"}
      replace
    />
  );
}

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/projects" element={<AdminProjects />} />
            <Route path="/admin/projects/:id" element={<ProjectDetail />} />
            <Route path="/admin/tasks" element={<AdminTasks />} />
            <Route path="/admin/members" element={<AdminMembers />} />
            <Route path="/admin/profile" element={<Profile />} />
          </Route>

          <Route element={<MemberLayout />}>
            <Route path="/member/dashboard" element={<MemberDashboard />} />
            <Route path="/member/projects" element={<MemberProjects />} />
            <Route path="/member/profile" element={<Profile />} />
          </Route>

          <Route path="/" element={<RootRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
