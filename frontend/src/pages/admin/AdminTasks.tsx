import { useEffect, useMemo, useState, memo } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckSquare,
  Search,
  Sparkles,
  Calendar,
  Flag,
  Plus,
  X,
  Pencil,
  Trash2,
  UserPlus,
} from "lucide-react";
import {
  getAllTasksAdminAPI,
  createTaskAPI,
  updateTaskAPI,
  deleteTaskAPI,
  assignTaskAPI,
  listUsersAPI,
  getAllProjectsAdminAPI,
  handleApiError,
} from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import CustomSelect, { type SelectOption } from "../../components/CustomSelect";
import DatePicker from "../../components/DatePicker";
import { searchFields } from "../../utils/search";

const statusLabel: Record<string, string> = {
  pending: "To Do",
  to_do: "To Do",
  in_progress: "In Progress",
  completed: "Done",
  done: "Done",
};
const statusStyle: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  to_do: "bg-amber-50 text-amber-700 border-amber-200",
  in_progress: "bg-blue-50 text-blue-700 border-blue-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  done: "bg-emerald-50 text-emerald-700 border-emerald-200",
};
const priorityStyle: Record<string, string> = {
  high: "bg-red-50 text-red-700 border-red-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  low: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const PRIORITY_OPTS: SelectOption[] = [
  { value: "low", label: "🟢  Low" },
  { value: "medium", label: "🟡  Medium" },
  { value: "high", label: "🔴  High" },
];

const FILTERS = [
  { key: "all", label: "All" },
  { key: "pending", label: "To Do" },
  { key: "in_progress", label: "In Progress" },
  { key: "completed", label: "Done" },
] as const;

const emptyForm = {
  title: "",
  description: "",
  projectId: "",
  priority: "medium",
  dueDate: "",
  assigneeId: "",
};

/* ─── Task Modal (outside to prevent re-mount flash) ─── */
interface ModalProps {
  isEdit: boolean;
  form: typeof emptyForm;
  setForm: React.Dispatch<React.SetStateAction<typeof emptyForm>>;
  formError: string;
  saving: boolean;
  projects: any[];
  members: any[];
  today: string;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

const TaskModal = memo(function TaskModal({
  isEdit,
  form,
  setForm,
  formError,
  saving,
  projects,
  members,
  today,
  onClose,
  onSubmit,
}: ModalProps) {
  const projectOpts: SelectOption[] = projects.map((p) => ({
    value: String(p.id),
    label: p.name,
  }));
  const assigneeOpts: SelectOption[] = [
    { value: "", label: "Unassigned" },
    ...members.map((u) => ({ value: String(u.id), label: u.name })),
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl p-8 overflow-hidden"
        style={{ maxHeight: "90vh", overflowY: "auto" }}
      >
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-purple-500 to-fuchsia-500" />

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-600 to-fuchsia-500 text-white shadow">
              <CheckSquare size={18} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-neutral-900">
                {isEdit ? "Edit Task" : "Create Task"}
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                {isEdit
                  ? "Update task details"
                  : "Add a new task to your project"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition"
          >
            <X size={18} />
          </button>
        </div>

        {formError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
            ⚠️ {formError}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
              Title *
            </label>
            <input
              value={form.title}
              onChange={(e) =>
                setForm((p) => ({ ...p, title: e.target.value }))
              }
              placeholder="Task title"
              className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-purple-500/15 focus:border-purple-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
              placeholder="Task details…"
              rows={3}
              className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-purple-500/15 focus:border-purple-500 transition resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
                Project *
              </label>
              <CustomSelect
                value={form.projectId}
                onChange={(v) => setForm((p) => ({ ...p, projectId: v }))}
                options={[
                  { value: "", label: "Select project" },
                  ...projectOpts,
                ]}
                disabled={isEdit}
                dropUp
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
                Assign To
              </label>
              <CustomSelect
                value={form.assigneeId}
                onChange={(v) => setForm((p) => ({ ...p, assigneeId: v }))}
                options={assigneeOpts}
                dropUp
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
                Priority
              </label>
              <CustomSelect
                value={form.priority}
                onChange={(v) => setForm((p) => ({ ...p, priority: v }))}
                options={PRIORITY_OPTS}
                dropUp
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
                Due Date
              </label>
              <DatePicker
                value={form.dueDate}
                onChange={(v) => setForm((p) => ({ ...p, dueDate: v }))}
                min={today}
                placeholder="Pick date"
                dropUp
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition"
            >
              Cancel
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white text-sm font-bold shadow-md shadow-purple-500/30 hover:shadow-xl disabled:opacity-60 transition-shadow"
            >
              {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Task"}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
});

/* ─── Main ─── */
export default function AdminTasks() {
  const { user } = useSelector((s: RootState) => s.auth);
  const [tasks, setTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [showCreate, setShowCreate] = useState(false);
  const [editTask, setEditTask] = useState<any>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  const loadAll = async () => {
    try {
      const [tasksRes, projRes, usersRes] = await Promise.all([
        getAllTasksAdminAPI(),
        getAllProjectsAdminAPI(),
        listUsersAPI(),
      ]);
      setTasks(tasksRes.data.tasks || []);
      setProjects(projRes.data.projects || []);
      setUsers(usersRes.data.users || []);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  // When a member updates task status from their dashboard (same browser, diff tab),
  // update our local tasks array immediately without a full reload.
  useEffect(() => {
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel("task-status");
      bc.onmessage = (e) => {
        if (e.data?.type === "status-changed") {
          const { taskId, newStatus } = e.data;
          setTasks((prev) =>
            prev.map((t) =>
              t.id === taskId ? { ...t, status: newStatus } : t,
            ),
          );
        }
      };
    } catch {
      /* unsupported */
    }
    return () => {
      bc?.close();
    };
  }, []);

  const myProjectIds = useMemo(
    () =>
      new Set(projects.filter((p) => p.admin_id === user?.id).map((p) => p.id)),
    [projects, user?.id],
  );
  const myProjects = useMemo(
    () => projects.filter((p) => p.admin_id === user?.id),
    [projects, user?.id],
  );
  const myTasks = useMemo(
    () => tasks.filter((t) => myProjectIds.has(t.project_id)),
    [tasks, myProjectIds],
  );
  const members = useMemo(
    () => users.filter((u) => u.role === "member"),
    [users],
  );

  const filtered = useMemo(
    () =>
      myTasks.filter((t) => {
        if (
          filter !== "all" &&
          t.status !== filter &&
          !(filter === "pending" && t.status === "to_do")
        )
          return false;
        return searchFields(search, t.title, t.project_name);
      }),
    [myTasks, filter, search],
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: myTasks.length };
    for (const t of myTasks) {
      const key =
        t.status === "to_do"
          ? "pending"
          : t.status === "done"
            ? "completed"
            : t.status;
      c[key] = (c[key] || 0) + 1;
    }
    return c;
  }, [myTasks]);

  const openCreate = () => {
    setForm({ ...emptyForm });
    setFormError("");
    setShowCreate(true);
  };
  const openEdit = (t: any) => {
    setEditTask(t);
    setForm({
      title: t.title || "",
      description: t.description || "",
      projectId: String(t.project_id || ""),
      priority: t.priority || "medium",
      dueDate: t.due_date ? t.due_date.split("T")[0] : "",
      assigneeId: t.assignees?.[0]?.id ? String(t.assignees[0].id) : "",
    });
    setFormError("");
  };
  const closeModal = () => {
    setShowCreate(false);
    setEditTask(null);
    setFormError("");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!form.title.trim() || !form.projectId) {
      setFormError("Title and project are required");
      return;
    }
    setSaving(true);
    try {
      let assignmentChanged = false;
      if (editTask) {
        await updateTaskAPI(editTask.id, {
          title: form.title,
          description: form.description,
          priority: form.priority,
          dueDate: form.dueDate || undefined,
        });
        if (
          form.assigneeId &&
          !editTask.assignees?.find(
            (a: any) => String(a.id) === form.assigneeId,
          )
        ) {
          await assignTaskAPI(editTask.id, parseInt(form.assigneeId));
          assignmentChanged = true;
        }
      } else {
        const res = await createTaskAPI({
          title: form.title,
          description: form.description,
          projectId: parseInt(form.projectId),
          priority: form.priority,
          dueDate: form.dueDate || undefined,
        });
        if (form.assigneeId) {
          await assignTaskAPI(res.data.task.id, parseInt(form.assigneeId));
          assignmentChanged = true;
        }
      }
      // Broadcast assignment change so any open Member dashboard refetches immediately.
      if (assignmentChanged) {
        try {
          const bc = new BroadcastChannel("task-assignments");
          bc.postMessage({ type: "assignment-changed", at: Date.now() });
          bc.close();
        } catch {
          /* BroadcastChannel unsupported — polling will catch it */
        }
      }
      closeModal();
      await loadAll();
    } catch (err) {
      setFormError(handleApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await deleteTaskAPI(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      setError(handleApiError(err));
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-600 to-fuchsia-500 shadow-lg shadow-purple-500/30">
            <CheckSquare size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-neutral-900 via-purple-700 to-neutral-900 bg-clip-text text-transparent">
              My Tasks
            </h1>
            <p className="text-neutral-500 mt-0.5 text-sm flex items-center gap-1.5">
              <Sparkles size={12} className="text-purple-400" />
              {myTasks.length} tasks across your {myProjects.length} project
              {myProjects.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="flex gap-3 flex-wrap">
          <div className="relative w-full sm:w-60">
            <Search
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks…"
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm shadow-sm focus:outline-none focus:ring-4 focus:ring-purple-500/15 focus:border-purple-500 transition placeholder-neutral-400"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-white text-sm bg-gradient-to-r from-purple-600 to-fuchsia-600 shadow-lg shadow-purple-500/30 hover:shadow-xl transition-shadow whitespace-nowrap"
          >
            <Plus size={16} /> New Task
          </motion.button>
        </div>
      </motion.div>

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Filter pills */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map(({ key, label }) => {
          const active = filter === key;
          return (
            <motion.button
              key={key}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-xl font-semibold text-sm transition border ${active ? "bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white border-transparent shadow-md shadow-purple-500/30" : "bg-white text-neutral-700 border-neutral-200 hover:border-purple-300 hover:text-purple-700"}`}
            >
              <span className="inline-flex items-center gap-2">
                {label}
                <span
                  className={`px-1.5 py-0.5 text-xs rounded-md ${active ? "bg-white/20" : "bg-neutral-100"}`}
                >
                  {counts[key] || 0}
                </span>
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-white border border-purple-100 overflow-hidden shadow-sm"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-purple-50 to-fuchsia-50 border-b border-purple-100">
              <tr>
                {[
                  "Task",
                  "Project",
                  "Status",
                  "Priority",
                  "Assignees",
                  "Due",
                  "Actions",
                ].map((h, i) => (
                  <th
                    key={h}
                    className={`px-5 py-3.5 text-xs font-bold text-purple-700 uppercase tracking-wider ${i === 6 ? "text-right" : "text-left"}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {filtered.map((t, i) => (
                <motion.tr
                  key={t.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="hover:bg-purple-50/30 transition group"
                >
                  <td className="px-5 py-4 max-w-xs">
                    <div className="font-semibold text-neutral-900 truncate">
                      {t.title}
                    </div>
                    {t.description && (
                      <div className="text-xs text-neutral-400 truncate mt-0.5">
                        {t.description}
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm text-neutral-700 font-medium truncate max-w-[130px] block">
                      {t.project_name}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${statusStyle[t.status] || "bg-neutral-50 border-neutral-200 text-neutral-700"}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${t.status === "completed" || t.status === "done" ? "bg-emerald-500" : t.status === "in_progress" ? "bg-blue-500" : "bg-amber-400"}`}
                      />
                      {statusLabel[t.status] || t.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-semibold ${priorityStyle[t.priority] || priorityStyle.medium}`}
                    >
                      <Flag size={9} />{" "}
                      {t.priority?.charAt(0).toUpperCase() +
                        t.priority?.slice(1)}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {Array.isArray(t.assignees) && t.assignees.length > 0 ? (
                      <div className="flex -space-x-2">
                        {t.assignees.slice(0, 3).map((a: any) => (
                          <div
                            key={a.id}
                            title={a.name}
                            className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-500 text-white flex items-center justify-center text-[11px] font-bold border-2 border-white shadow"
                          >
                            {a.name?.[0]?.toUpperCase()}
                          </div>
                        ))}
                        {t.assignees.length > 3 && (
                          <div className="w-7 h-7 rounded-full bg-neutral-200 text-neutral-600 flex items-center justify-center text-[11px] font-semibold border-2 border-white">
                            +{t.assignees.length - 3}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-neutral-400 inline-flex items-center gap-1">
                        <UserPlus size={11} /> Unassigned
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-xs">
                    {t.due_date ? (
                      <span className="inline-flex items-center gap-1 text-neutral-600 font-medium">
                        <Calendar size={11} />
                        {new Date(t.due_date).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    ) : (
                      <span className="text-neutral-300">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={() => openEdit(t)}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-purple-700 hover:bg-purple-50 transition"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center">
                    <CheckSquare
                      size={32}
                      className="mx-auto text-neutral-200 mb-2"
                    />
                    <p className="text-sm font-medium text-neutral-500">
                      No tasks match your filters
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      <AnimatePresence>
        {showCreate && (
          <TaskModal
            isEdit={false}
            form={form}
            setForm={setForm}
            formError={formError}
            saving={saving}
            projects={myProjects}
            members={members}
            today={today}
            onClose={closeModal}
            onSubmit={handleSave}
          />
        )}
        {editTask && (
          <TaskModal
            isEdit={true}
            form={form}
            setForm={setForm}
            formError={formError}
            saving={saving}
            projects={myProjects}
            members={members}
            today={today}
            onClose={closeModal}
            onSubmit={handleSave}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
