import { useSelector } from "react-redux";
import type { RootState } from "../store/store";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Shield,
  Crown,
  Lock,
  Eye,
  Edit3,
  Trash2,
} from "lucide-react";

export default function Profile() {
  const { user } = useSelector((s: RootState) => s.auth);
  const isAdmin = user?.role === "admin";

  const permissions = isAdmin
    ? [
        { icon: Edit3, label: "Create & manage projects", allowed: true },
        { icon: Edit3, label: "Create, assign & delete tasks", allowed: true },
        { icon: Eye, label: "View all team members", allowed: true },
        { icon: Trash2, label: "Remove members from projects", allowed: true },
        { icon: Lock, label: "Delete users globally", allowed: false },
      ]
    : [
        { icon: Eye, label: "View assigned projects", allowed: true },
        { icon: Edit3, label: "Update status of your tasks", allowed: true },
        { icon: Eye, label: "View team members", allowed: true },
        { icon: Lock, label: "Create or manage projects", allowed: false },
        { icon: Lock, label: "Create or delete tasks", allowed: false },
      ];

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start gap-4 mb-8"
      >
        <div
          className={`p-3 rounded-2xl shadow-lg ${isAdmin ? "bg-gradient-to-br from-violet-700 to-indigo-600 shadow-violet-500/30" : "bg-gradient-to-br from-purple-600 to-fuchsia-500 shadow-purple-500/30"}`}
        >
          <User size={24} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-neutral-900 via-purple-700 to-neutral-900 bg-clip-text text-transparent">
            My Profile
          </h1>
          <p className="text-neutral-500 mt-0.5 text-sm">
            Your account details and access permissions
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative rounded-3xl bg-white border border-purple-100 overflow-hidden shadow-sm"
      >
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-purple-500 to-fuchsia-500" />

        {/* Avatar header */}
        <div className="px-8 pt-8 pb-6 border-b border-neutral-100">
          <div className="flex items-center gap-5">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className={`w-20 h-20 rounded-2xl flex items-center justify-center text-white text-3xl font-extrabold shadow-lg ${isAdmin ? "bg-gradient-to-br from-violet-700 to-indigo-600" : "bg-gradient-to-br from-purple-600 to-fuchsia-500"}`}
            >
              {user?.name?.[0]?.toUpperCase() || "?"}
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">
                {user?.name}
              </h2>
              <p className="text-sm text-neutral-500 mt-0.5">{user?.email}</p>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold mt-2 ${isAdmin ? "bg-amber-100 text-amber-700" : "bg-purple-100 text-purple-700"}`}
              >
                {isAdmin ? <Crown size={13} /> : <Shield size={13} />}
                {isAdmin ? "Administrator" : "Team Member"}
              </span>
            </div>
          </div>
        </div>

        {/* Info rows */}
        <div className="px-8 py-6 space-y-5 border-b border-neutral-100">
          {[
            { icon: User, label: "Full Name", value: user?.name || "—" },
            { icon: Mail, label: "Email Address", value: user?.email || "—" },
            {
              icon: isAdmin ? Crown : Shield,
              label: "Role",
              value: isAdmin ? "Administrator" : "Team Member",
            },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-4">
              <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                <Icon size={16} className="text-purple-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-0.5">
                  {label}
                </p>
                <p className="text-neutral-900 font-semibold">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Access level */}
        <div className="px-8 py-6">
          <div className="flex items-center gap-2 mb-4">
            <Lock size={14} className="text-purple-500" />
            <h3 className="text-sm font-bold text-neutral-700 uppercase tracking-wider">
              Access & Permissions
            </h3>
          </div>

          <div
            className={`p-4 rounded-2xl mb-4 ${isAdmin ? "bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100" : "bg-gradient-to-br from-purple-50 to-fuchsia-50 border border-purple-100"}`}
          >
            <p
              className={`text-sm font-semibold mb-1 ${isAdmin ? "text-amber-700" : "text-purple-700"}`}
            >
              {isAdmin ? "🛡️ Full System Access" : "👤 Member-Level Access"}
            </p>
            <p className="text-xs text-neutral-600 leading-relaxed">
              {isAdmin
                ? "As an administrator, you can create and oversee projects, assign tasks to team members, and manage project membership. Note: user accounts cannot be deleted globally."
                : "As a team member, you can view the projects you've been added to and update the status of tasks assigned to you. Contact your admin for project or task changes."}
            </p>
          </div>

          <div className="space-y-2">
            {permissions.map(({ icon: Icon, label, allowed }) => (
              <div
                key={label}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl ${allowed ? "bg-white border border-neutral-100" : "bg-neutral-50 border border-neutral-100 opacity-60"}`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${allowed ? "bg-emerald-100" : "bg-neutral-200"}`}
                >
                  {allowed ? (
                    <svg
                      className="w-3.5 h-3.5 text-emerald-600"
                      fill="none"
                      viewBox="0 0 12 12"
                    >
                      <path
                        d="M2 6l2.5 2.5L10 3"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-3 h-3 text-neutral-400"
                      fill="none"
                      viewBox="0 0 12 12"
                    >
                      <path
                        d="M3 3l6 6M9 3l-6 6"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    </svg>
                  )}
                </div>
                <Icon
                  size={13}
                  className={allowed ? "text-neutral-500" : "text-neutral-400"}
                />
                <span
                  className={`text-xs font-medium ${allowed ? "text-neutral-700" : "text-neutral-400"}`}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
