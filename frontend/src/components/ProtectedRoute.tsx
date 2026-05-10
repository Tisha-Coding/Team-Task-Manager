import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";
import Navbar from "./Navbar";
import { motion } from "framer-motion";

export default function ProtectedRoute() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="bg-gradient-to-br from-neutral-50 via-white to-purple-50 min-h-screen">
      <Navbar />
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="pt-16"
      >
        <Outlet />
      </motion.main>
    </div>
  );
}
