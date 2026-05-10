import { useState } from "react";
import { NavLink, Outlet, Navigate, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAuth } from "../hooks/useAuth";
import type { RootState } from "../store/store";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckSquare,
  FolderOpen,
  User,
  LogOut,
  Menu,
  ChevronRight,
} from "lucide-react";

const navItems = [
  { to: "/member/dashboard", label: "My Tasks", icon: CheckSquare },
  { to: "/member/projects", label: "My Projects", icon: FolderOpen },
  { to: "/member/profile", label: "Profile", icon: User },
];

export default function MemberLayout() {
  const { isAuthenticated, user } = useSelector((s: RootState) => s.auth);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== "member")
    return <Navigate to="/admin/dashboard" replace />;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-purple-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-fuchsia-500 flex items-center justify-center shadow-md shadow-purple-500/30 flex-shrink-0">
            <span className="text-lg">📋</span>
          </div>
          <div>
            <h1 className="text-base font-bold text-neutral-900 leading-none">
              TaskHub
            </h1>
            <p className="text-[11px] text-purple-600 font-medium mt-0.5">
              Member Portal
            </p>
          </div>
        </div>
      </div>

      {/* User card */}
      <div className="px-4 py-4 mx-3 mt-4 rounded-2xl bg-gradient-to-br from-purple-50 to-fuchsia-50 border border-purple-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-fuchsia-500 flex items-center justify-center text-white font-bold text-sm shadow flex-shrink-0">
            {user?.name?.[0]?.toUpperCase() || "M"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-neutral-900 truncate">
              {user?.name}
            </p>
            <p className="text-[11px] text-neutral-500 truncate">
              {user?.email}
            </p>
          </div>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-bold flex-shrink-0">
            Member
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
          Navigation
        </p>
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/member/dashboard"}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-md shadow-purple-500/30"
                  : "text-neutral-600 hover:bg-purple-50 hover:text-purple-700"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={17}
                  className={
                    isActive
                      ? "text-white"
                      : "text-neutral-400 group-hover:text-purple-600"
                  }
                />
                <span className="flex-1">{label}</span>
                {!isActive && (
                  <ChevronRight
                    size={13}
                    className="opacity-0 group-hover:opacity-40 transition-opacity"
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-6">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-neutral-600 hover:bg-red-50 hover:text-red-600 transition-all group"
        >
          <LogOut
            size={17}
            className="text-neutral-400 group-hover:text-red-500 transition-colors"
          />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-neutral-50 overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-purple-100 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 w-64 bg-white border-r border-purple-100 z-50 flex flex-col lg:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile topbar */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-purple-100">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg text-neutral-600 hover:bg-purple-50 hover:text-purple-700 transition"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-600 to-fuchsia-500 flex items-center justify-center">
              <span className="text-sm">📋</span>
            </div>
            <span className="font-bold text-neutral-900 text-sm">TaskHub</span>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
