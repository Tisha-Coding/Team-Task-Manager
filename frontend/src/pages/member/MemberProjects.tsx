import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FolderOpen,
  Users,
  CheckSquare,
  Calendar,
  Sparkles,
  Search,
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
  Flag,
} from "lucide-react";
import {
  getProjectsAPI,
  getProjectTasksAPI,
  handleApiError,
} from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import { searchFields } from "../../utils/search";

const statusStyle: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  to_do: "bg-amber-50 text-amber-700 border-amber-200",
  in_progress: "bg-blue-50 text-blue-700 border-blue-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  done: "bg-emerald-50 text-emerald-700 border-emerald-200",
};
const statusLabel: Record<string, string> = {
  pending: "To Do",
  to_do: "To Do",
  in_progress: "In Progress",
  completed: "Done",
  done: "Done",
};
const statusIcon: Record<string, React.ElementType> = {
  pending: AlertCircle,
  to_do: AlertCircle,
  in_progress: Clock,
  completed: CheckCircle2,
  done: CheckCircle2,
};
const priorityStyle: Record<string, string> = {
  high: "bg-red-50 text-red-700 border-red-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  low: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

function MemberAvatar({
  name,
  size = "md",
}: {
  name: string;
  size?: "sm" | "md";
}) {
  const cls = size === "sm" ? "w-6 h-6 text-[10px]" : "w-8 h-8 text-xs";
  return (
    <div
      title={name}
      className={`${cls} rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-500 text-white flex items-center justify-center font-bold border-2 border-white shadow-sm flex-shrink-0`}
    >
      {name?.[0]?.toUpperCase()}
    </div>
  );
}

interface Project {
  id: number;
  name: string;
  description: string;
  admin_id: number;
  admin_name?: string;
  created_at: string;
  member_count?: number;
  task_count?: number;
  members?: { id: number; name: string }[];
}

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  due_date?: string;
}

interface DetailState {
  project: Project;
  tasks: Task[];
  loading: boolean;
  error: string;
}

export default function MemberProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState<DetailState | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await getProjectsAPI();
        setProjects(res.data.projects || []);
      } catch (err) {
        setError(handleApiError(err));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const openDetail = async (project: Project) => {
    setDetail({ project, tasks: [], loading: true, error: "" });
    try {
      const res = await getProjectTasksAPI(project.id);
      setDetail((prev) =>
        prev ? { ...prev, tasks: res.data.tasks || [], loading: false } : null,
      );
    } catch (err) {
      setDetail((prev) =>
        prev ? { ...prev, loading: false, error: handleApiError(err) } : null,
      );
    }
  };

  const closeDetail = () => setDetail(null);

  if (loading) return <LoadingSpinner />;

  const filtered = projects.filter((p) =>
    searchFields(search, p.name, p.description),
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-600 to-fuchsia-500 shadow-lg shadow-purple-500/30">
            <FolderOpen size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-neutral-900 via-purple-700 to-neutral-900 bg-clip-text text-transparent">
              My Projects
            </h1>
            <p className="text-neutral-600 mt-0.5 text-sm inline-flex items-center gap-1.5">
              <Sparkles size={13} className="text-purple-500" />{" "}
              {projects.length} projects you're part of
            </p>
          </div>
        </div>
        <div className="relative w-full sm:w-64">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-neutral-200 rounded-xl text-sm shadow-sm focus:outline-none focus:ring-4 focus:ring-purple-500/15 focus:border-purple-500"
          />
        </div>
      </motion.div>

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Project cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((p, i) => {
          const members: { id: number; name: string }[] = Array.isArray(
            p.members,
          )
            ? p.members
            : [];
          const visibleMembers = members.slice(0, 4);
          const extraCount = members.length - visibleMembers.length;

          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4 }}
              onClick={() => openDetail(p)}
              className="group relative rounded-2xl bg-white border border-neutral-100 p-6 shadow-sm hover:shadow-xl hover:shadow-purple-500/10 hover:border-purple-200 transition-all duration-300 overflow-hidden cursor-pointer"
            >
              {/* Top accent on hover */}
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-purple-500 to-fuchsia-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />

              {/* Project name + admin */}
              <div className="flex items-start gap-3 mb-3">
                <div className="p-2.5 rounded-xl bg-purple-50 group-hover:bg-purple-100 transition flex-shrink-0">
                  <FolderOpen size={20} className="text-purple-600" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-neutral-900 truncate">
                    {p.name}
                  </h3>
                  {p.admin_name && (
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Admin: {p.admin_name}
                    </p>
                  )}
                </div>
              </div>

              <p className="text-sm text-neutral-600 line-clamp-2 min-h-[2.5rem] mb-4">
                {p.description || "No description provided"}
              </p>

              {/* Member avatars */}
              {members.length > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex -space-x-2">
                    {visibleMembers.map((m) => (
                      <MemberAvatar key={m.id} name={m.name} size="sm" />
                    ))}
                    {extraCount > 0 && (
                      <div className="w-6 h-6 rounded-full bg-neutral-200 text-neutral-600 flex items-center justify-center text-[10px] font-semibold border-2 border-white">
                        +{extraCount}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-neutral-500 font-medium">
                    {members
                      .map((m) => m.name)
                      .slice(0, 2)
                      .join(", ")}
                    {members.length > 2 ? ` +${members.length - 2} more` : ""}
                  </span>
                </div>
              )}

              {/* Stats row */}
              <div className="flex items-center justify-between pt-3 border-t border-neutral-100 text-xs">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-100 font-medium">
                  <Users size={10} /> {p.member_count ?? members.length} members
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100 font-medium">
                  <CheckSquare size={10} /> {p.task_count ?? "—"} tasks
                </span>
                <span className="inline-flex items-center gap-1 text-neutral-400">
                  <Calendar size={10} />{" "}
                  {new Date(p.created_at).toLocaleDateString()}
                </span>
              </div>

              {/* Click hint */}
              <p className="absolute bottom-3 right-4 text-[10px] text-purple-400 opacity-0 group-hover:opacity-100 transition font-medium">
                Click to view details →
              </p>
            </motion.div>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-full text-center py-16 rounded-2xl bg-white/60 border border-dashed border-purple-200">
            <FolderOpen size={32} className="mx-auto text-purple-400 mb-2" />
            <p className="text-neutral-600">
              You haven't been added to any projects yet.
            </p>
            <p className="text-sm text-neutral-500 mt-1">
              Ask your admin to add you to a project.
            </p>
          </div>
        )}
      </div>

      {/* Detail modal */}
      <AnimatePresence>
        {detail && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeDetail}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 24 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 24 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl overflow-hidden flex flex-col"
              style={{ maxHeight: "88vh" }}
            >
              {/* Gradient top bar */}
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-purple-500 to-fuchsia-500" />

              {/* Header */}
              <div className="px-7 pt-7 pb-4 flex items-start justify-between gap-4 flex-shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-600 to-fuchsia-500 text-white shadow flex-shrink-0">
                    <FolderOpen size={18} />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-xl font-bold text-neutral-900 truncate">
                      {detail.project.name}
                    </h2>
                    {detail.project.admin_name && (
                      <p className="text-xs text-neutral-500 mt-0.5">
                        Admin: {detail.project.admin_name}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={closeDetail}
                  className="p-2 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition flex-shrink-0"
                >
                  <X size={18} />
                </button>
              </div>

              {detail.project.description && (
                <p className="px-7 pb-4 text-sm text-neutral-600 flex-shrink-0">
                  {detail.project.description}
                </p>
              )}

              <div className="overflow-y-auto flex-1 px-7 pb-7 space-y-6">
                {detail.error && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                    ⚠️ {detail.error}
                  </div>
                )}

                {/* Members */}
                {(() => {
                  const members: { id: number; name: string }[] = Array.isArray(
                    detail.project.members,
                  )
                    ? detail.project.members
                    : [];
                  return members.length > 0 ? (
                    <section>
                      <h3 className="text-sm font-bold text-neutral-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Users size={14} className="text-purple-500" /> Members
                        ({members.length})
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {members.map((m) => (
                          <div
                            key={m.id}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 border border-purple-100 text-sm font-medium text-purple-800"
                          >
                            <MemberAvatar name={m.name} size="sm" />
                            {m.name}
                          </div>
                        ))}
                      </div>
                    </section>
                  ) : null;
                })()}

                {/* Tasks */}
                <section>
                  <h3 className="text-sm font-bold text-neutral-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <CheckSquare size={14} className="text-purple-500" />
                    Tasks ({detail.loading ? "…" : detail.tasks.length})
                  </h3>

                  {detail.loading ? (
                    <div className="flex items-center justify-center py-10">
                      <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
                    </div>
                  ) : detail.tasks.length === 0 ? (
                    <div className="text-center py-10 rounded-2xl bg-neutral-50 border border-dashed border-neutral-200">
                      <CheckSquare
                        size={28}
                        className="mx-auto text-neutral-300 mb-2"
                      />
                      <p className="text-sm text-neutral-500">
                        No tasks in this project yet
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {detail.tasks.map((task) => {
                        const StatusIcon =
                          statusIcon[task.status] || AlertCircle;
                        return (
                          <div
                            key={task.id}
                            className="flex items-start gap-3 p-4 rounded-xl bg-neutral-50 border border-neutral-100 hover:border-purple-200 transition"
                          >
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold flex-shrink-0 ${statusStyle[task.status] || statusStyle.pending}`}
                            >
                              <StatusIcon size={10} />
                              {statusLabel[task.status] || task.status}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p
                                className={`font-semibold text-sm text-neutral-900 ${task.status === "completed" || task.status === "done" ? "line-through text-neutral-400" : ""}`}
                              >
                                {task.title}
                              </p>
                              {task.description && (
                                <p className="text-xs text-neutral-500 mt-0.5 line-clamp-1">
                                  {task.description}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-semibold ${priorityStyle[task.priority] || priorityStyle.medium}`}
                              >
                                <Flag size={8} />{" "}
                                {task.priority?.charAt(0).toUpperCase() +
                                  task.priority?.slice(1)}
                              </span>
                              {task.due_date && (
                                <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                                  <Calendar size={9} />
                                  {new Date(task.due_date).toLocaleDateString(
                                    undefined,
                                    { month: "short", day: "numeric" },
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
