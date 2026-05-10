import { Navigate, NavLink, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";
import { motion } from "framer-motion";
import {
  LayoutGrid,
  Users,
  FolderOpen,
  CheckSquare,
  Crown,
} from "lucide-react";

const adminLinks = [
  { to: "/admin", label: "Dashboard", icon: LayoutGrid, end: true },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/projects", label: "Projects", icon: FolderOpen },
  { to: "/admin/tasks", label: "Tasks", icon: CheckSquare },
];

export default function AdminRoute() {
  const { isAuthenticated, user } = useSelector((s: RootState) => s.auth);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== "admin") return <Navigate to="/dashboard" replace />;

  return (
    <>
      {/* Admin sub-nav strip */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-16 z-30 backdrop-blur-lg bg-white/80 border-b border-purple-100"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12">
            <div className="flex items-center gap-1 overflow-x-auto">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-700 mr-3 whitespace-nowrap">
                <Crown size={13} className="text-amber-500" />
                ADMIN
              </span>
              {adminLinks.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition whitespace-nowrap ${
                      isActive
                        ? "bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-semibold shadow-sm"
                        : "text-neutral-600 hover:text-purple-700 hover:bg-purple-50"
                    }`
                  }
                >
                  <Icon size={14} />
                  {label}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      <Outlet />
    </>
  );
}
