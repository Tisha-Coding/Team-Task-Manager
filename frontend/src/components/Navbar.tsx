import { motion } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";
import { useAuth } from "../hooks/useAuth";
import {
  Menu,
  LogOut,
  User,
  LayoutGrid,
  CheckSquare,
  FolderOpen,
  Shield,
} from "lucide-react";
import { useState } from "react";
import Button from "./Button";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isAdmin = user?.role === "admin";
  const navLinks = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutGrid },
    { path: "/projects", label: "Projects", icon: FolderOpen },
    { path: "/tasks", label: "Tasks", icon: CheckSquare },
    ...(isAdmin ? [{ path: "/admin", label: "Admin", icon: Shield }] : []),
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 w-full z-50 backdrop-blur-lg bg-white/70 border-b border-neutral-100"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="p-2 bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg text-white"
            >
              <LayoutGrid size={20} />
            </motion.div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
              TaskHub
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ path, label, icon: Icon }) => {
              const active =
                location.pathname === path ||
                location.pathname.startsWith(path + "/");
              const isAdminLink = path === "/admin";
              return (
                <Link key={path} to={path}>
                  <motion.div
                    whileHover={{ x: 2 }}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 ${
                      active
                        ? isAdminLink
                          ? "bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-semibold shadow-md shadow-purple-500/30"
                          : "bg-purple-50 text-purple-600 font-medium"
                        : isAdminLink
                          ? "text-purple-700 hover:bg-purple-50 font-medium"
                          : "text-neutral-600 hover:bg-neutral-50"
                    }`}
                  >
                    <Icon size={18} />
                    {label}
                  </motion.div>
                </Link>
              );
            })}
          </div>

          {/* User Section */}
          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-neutral-100 rounded-lg"
            >
              <User size={16} className="text-neutral-600" />
              <div>
                <p className="text-sm font-medium text-neutral-900">
                  {user?.name}
                </p>
                <p className="text-xs text-neutral-500">{user?.email}</p>
              </div>
            </motion.div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="hidden sm:flex items-center gap-2"
            >
              <LogOut size={18} />
              Logout
            </Button>

            {/* Mobile Menu */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 hover:bg-neutral-100 rounded-lg transition"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden border-t border-neutral-100 py-4 space-y-2"
          >
            {navLinks.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                  location.pathname === path
                    ? "bg-purple-50 text-purple-600"
                    : "text-neutral-600 hover:bg-neutral-50"
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            ))}
            <Button
              variant="ghost"
              size="md"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 mt-4"
            >
              <LogOut size={18} />
              Logout
            </Button>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
}
