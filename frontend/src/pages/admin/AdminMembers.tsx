import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users as UsersIcon, Search, Crown, Info } from "lucide-react";
import { listUsersAPI, handleApiError } from "../../services/api";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import LoadingSpinner from "../../components/LoadingSpinner";
import { searchFields } from "../../utils/search";

export default function AdminMembers() {
  const { user: me } = useSelector((s: RootState) => s.auth);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await listUsersAPI();
        setUsers(res.data.users || []);
      } catch (err) {
        setError(handleApiError(err));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = users.filter((u) => searchFields(search, u.name, u.email));

  const admins = filtered.filter((u) => u.role === "admin");
  const members = filtered.filter((u) => u.role === "member");

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-600 to-fuchsia-500 shadow-lg shadow-purple-500/30">
            <UsersIcon size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-neutral-900 via-purple-700 to-neutral-900 bg-clip-text text-transparent">
              Team Directory
            </h1>
            <p className="text-neutral-500 mt-0.5 text-sm">
              {users.length} people &mdash;{" "}
              {users.filter((u) => u.role === "admin").length} admin
              {users.filter((u) => u.role === "admin").length !== 1 ? "s" : ""},{" "}
              {users.filter((u) => u.role === "member").length} member
              {users.filter((u) => u.role === "member").length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm shadow-sm focus:outline-none focus:ring-4 focus:ring-purple-500/15 focus:border-purple-500 transition placeholder-neutral-400"
          />
        </div>
      </motion.div>

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Info note */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-start gap-3 p-4 rounded-2xl bg-blue-50 border border-blue-100 text-blue-700"
      >
        <Info size={16} className="flex-shrink-0 mt-0.5" />
        <p className="text-sm leading-relaxed">
          <span className="font-semibold">
            Member management is project-scoped.
          </span>{" "}
          To add or remove a member from a project, open that project and use
          the Members panel. Users cannot be deleted globally.
        </p>
      </motion.div>

      {/* Users table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-2xl bg-white border border-purple-100 overflow-hidden shadow-sm"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-purple-50 to-fuchsia-50 border-b border-purple-100">
              <tr>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-purple-700 uppercase tracking-wider">
                  Member
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-purple-700 uppercase tracking-wider">
                  Email
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-purple-700 uppercase tracking-wider">
                  Role
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-purple-700 uppercase tracking-wider">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {/* Admins first */}
              {admins.length > 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-2 bg-amber-50/50 border-b border-amber-100/60"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 flex items-center gap-1.5">
                      <Crown size={10} /> Administrators ({admins.length})
                    </span>
                  </td>
                </tr>
              )}
              {admins.map((u, i) => (
                <UserRow key={u.id} u={u} i={i} isMe={u.id === me?.id} />
              ))}

              {/* Members */}
              {members.length > 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-2 bg-purple-50/50 border-b border-purple-100/60"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-widest text-purple-600 flex items-center gap-1.5">
                      <UsersIcon size={10} /> Team Members ({members.length})
                    </span>
                  </td>
                </tr>
              )}
              {members.map((u, i) => (
                <UserRow key={u.id} u={u} i={i} isMe={u.id === me?.id} />
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-14 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Search size={28} className="text-neutral-300" />
                      <p className="text-sm font-medium text-neutral-500">
                        No users match your search
                      </p>
                      <p className="text-xs text-neutral-400">
                        Try a different name or email
                      </p>
                    </div>
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

function UserRow({ u, i, isMe }: { u: any; i: number; isMe: boolean }) {
  const isAdmin = u.role === "admin";
  const joinDate = u.created_at
    ? new Date(u.created_at).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  return (
    <motion.tr
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: i * 0.025 }}
      className="hover:bg-purple-50/30 transition group"
    >
      {/* Name + avatar */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shadow flex-shrink-0 ${isAdmin ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white" : "bg-gradient-to-br from-purple-500 to-fuchsia-500 text-white"}`}
          >
            {u.name?.[0]?.toUpperCase() || "?"}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-neutral-900 text-sm flex items-center gap-1.5">
              {u.name}
              {isMe && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700 font-bold">
                  YOU
                </span>
              )}
            </p>
          </div>
        </div>
      </td>

      {/* Email - styled as monospace chip */}
      <td className="px-5 py-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-50 border border-neutral-200 font-mono text-xs text-neutral-700 tracking-tight">
          {u.email}
        </span>
      </td>

      {/* Role badge */}
      <td className="px-5 py-4">
        {isAdmin ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold">
            <Crown size={11} /> Admin
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-xs font-semibold">
            <UsersIcon size={11} /> Member
          </span>
        )}
      </td>

      {/* Joined date */}
      <td className="px-5 py-4">
        <span className="text-xs text-neutral-500 font-medium">{joinDate}</span>
      </td>
    </motion.tr>
  );
}
