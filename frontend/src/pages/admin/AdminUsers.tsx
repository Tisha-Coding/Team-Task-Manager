import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users as UsersIcon,
  Search,
  Trash2,
  Crown,
  ShieldOff,
  Shield,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import {
  listUsersAPI,
  updateUserRoleAPI,
  deleteUserAPI,
  handleApiError,
} from "../../services/api";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import LoadingSpinner from "../../components/LoadingSpinner";
import { searchFields } from "../../utils/search";

export default function AdminUsers() {
  const { user: me } = useSelector((s: RootState) => s.auth);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const res = await listUsersAPI();
      setUsers(res.data.users || []);
      setError("");
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const flash = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(""), 2500);
  };

  const handleToggleRole = async (u: any) => {
    const next = u.role === "admin" ? "member" : "admin";
    try {
      await updateUserRoleAPI(u.id, next);
      setUsers((prev) =>
        prev.map((x) => (x.id === u.id ? { ...x, role: next } : x)),
      );
      flash(`Role updated to ${next}`);
    } catch (err) {
      setError(handleApiError(err));
    }
  };

  const handleDelete = async (u: any) => {
    if (u.id === me?.id) {
      setError("You cannot delete yourself");
      return;
    }
    if (!window.confirm(`Delete user ${u.name}? This cannot be undone.`))
      return;
    try {
      await deleteUserAPI(u.id);
      setUsers((prev) => prev.filter((x) => x.id !== u.id));
      flash("User deleted");
    } catch (err) {
      setError(handleApiError(err));
    }
  };

  const filtered = users.filter((u) => searchFields(search, u.name, u.email));

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-600 to-fuchsia-500 shadow-lg shadow-purple-500/30">
            <UsersIcon size={26} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-neutral-900 via-purple-700 to-neutral-900 bg-clip-text text-transparent">
              Manage Users
            </h1>
            <p className="text-neutral-600 mt-1 inline-flex items-center gap-1.5">
              <Sparkles size={14} className="text-purple-500" /> Manage roles
              and access
            </p>
          </div>
        </div>

        <div className="relative w-full sm:w-72">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm shadow-sm focus:outline-none focus:ring-4 focus:ring-purple-500/15 focus:border-purple-500"
          />
        </div>
      </motion.div>

      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 p-3.5 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm"
          >
            <CheckCircle2 size={18} /> {success}
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          ⚠️ {error}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-white border border-purple-100 overflow-hidden shadow-sm"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-purple-50 to-fuchsia-50 border-b border-purple-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-purple-700 uppercase tracking-wider">
                  User
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-purple-700 uppercase tracking-wider">
                  Email
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-purple-700 uppercase tracking-wider">
                  Role
                </th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-purple-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filtered.map((u, i) => (
                <motion.tr
                  key={u.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="hover:bg-purple-50/30 transition group"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-500 text-white flex items-center justify-center text-sm font-semibold shadow">
                        {u.name?.[0]?.toUpperCase() || "?"}
                      </div>
                      <div className="font-semibold text-neutral-900 inline-flex items-center gap-1.5">
                        {u.name}
                        {u.id === me?.id && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 font-medium">
                            YOU
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-neutral-600">
                    {u.email}
                  </td>
                  <td className="px-5 py-4">
                    {u.role === "admin" ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-medium">
                        <Crown size={12} /> Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-xs font-medium">
                        Member
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggleRole(u)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                          u.role === "admin"
                            ? "text-neutral-700 hover:bg-neutral-100 border border-neutral-200"
                            : "text-amber-700 hover:bg-amber-50 border border-amber-200"
                        }`}
                      >
                        {u.role === "admin" ? (
                          <>
                            <ShieldOff size={12} /> Demote
                          </>
                        ) : (
                          <>
                            <Shield size={12} /> Promote
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(u)}
                        disabled={u.id === me?.id}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition disabled:opacity-30 disabled:cursor-not-allowed"
                        aria-label="Delete user"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-12 text-center text-sm text-neutral-500"
                  >
                    No users match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
