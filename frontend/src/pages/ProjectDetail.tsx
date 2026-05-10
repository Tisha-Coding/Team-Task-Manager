import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  FolderOpen,
  Users,
  Plus,
  Trash2,
  UserPlus,
  Pencil,
  CheckSquare,
  Calendar,
  Flag,
  X,
  Crown,
} from "lucide-react";
import {
  getProjectAPI,
  updateProjectAPI,
  addProjectMemberAPI,
  removeProjectMemberAPI,
  getProjectTasksAPI,
  assignTaskAPI,
  unassignTaskAPI,
  handleApiError,
} from "../services/api";
import { useTasks } from "../hooks/useTasks";
import { useUsers } from "../hooks/useUsers";
import LoadingSpinner from "../components/LoadingSpinner";
import EditTaskModal from "../components/EditTaskModal";
import CustomSelect, { type SelectOption } from "../components/CustomSelect";
import DatePicker from "../components/DatePicker";

const priorityStyle: Record<string, string> = {
  high: "bg-red-50 text-red-700 border-red-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  low: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const STATUS_OPTS: SelectOption[] = [
  { value: "pending", label: "To Do", dot: "bg-amber-400" },
  { value: "in_progress", label: "In Progress", dot: "bg-blue-500" },
  { value: "completed", label: "Done", dot: "bg-emerald-500" },
];

const PRIORITY_OPTS: SelectOption[] = [
  { value: "low", label: "🟢  Low" },
  { value: "medium", label: "🟡  Medium" },
  { value: "high", label: "🔴  High" },
];

const normalize = (s: string) =>
  s === "to_do" ? "pending" : s === "done" ? "completed" : s;

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { createNew, changeStatus, deleteOne, editTask } = useTasks();
  const { users } = useUsers();

  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [editingProject, setEditingProject] = useState(false);
  const [pForm, setPForm] = useState({ name: "", description: "" });
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [tForm, setTForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    dueDate: "",
  });
  const [editingTask, setEditingTask] = useState<any>(null);
  const [showAddMember, setShowAddMember] = useState(false);
  const [memberToAdd, setMemberToAdd] = useState<string>("");
  const [assignTaskId, setAssignTaskId] = useState<number | null>(null);
  const [assigneePick, setAssigneePick] = useState<string>("");

  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  const loadAll = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [pRes, tRes] = await Promise.all([
        getProjectAPI(Number(id)),
        getProjectTasksAPI(Number(id)),
      ]);
      setProject(pRes.data.project);
      setTasks(tRes.data.tasks || []);
      setError("");
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, [id]);

  const isAdmin = useMemo(
    () => project && user && project.admin_id === user.id,
    [project, user],
  );
  const memberIds = useMemo(
    () => new Set((project?.members || []).map((m: any) => m.id)),
    [project],
  );
  const availableUsersToAdd = users.filter((u: any) => !memberIds.has(u.id));

  const flash = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };
  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(""), 4000);
    return () => clearTimeout(t);
  }, [error]);

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;
    try {
      const res = await updateProjectAPI(project.id, pForm);
      setProject((p: any) => ({ ...p, ...res.data.project }));
      setEditingProject(false);
      flash("Project updated");
    } catch (err) {
      setError(handleApiError(err));
    }
  };

  const handleAddMember = async () => {
    if (!project || !memberToAdd) return;
    try {
      await addProjectMemberAPI(project.id, Number(memberToAdd));
      await loadAll();
      setMemberToAdd("");
      setShowAddMember(false);
      flash("Member added");
    } catch (err) {
      setError(handleApiError(err));
    }
  };

  const handleRemoveMember = async (userId: number) => {
    if (!project || userId === project.admin_id) return;
    if (!window.confirm("Remove this member from the project?")) return;
    try {
      await removeProjectMemberAPI(project.id, userId);
      await loadAll();
      flash("Member removed");
    } catch (err) {
      setError(handleApiError(err));
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !tForm.title) return;
    const result = await createNew({
      title: tForm.title,
      description: tForm.description,
      projectId: project.id,
      priority: tForm.priority,
      dueDate: tForm.dueDate || undefined,
    });
    if (result?.success) {
      setTForm({ title: "", description: "", priority: "medium", dueDate: "" });
      setShowTaskForm(false);
      await loadAll();
      flash("Task created");
    }
  };

  const handleStatusChange = async (taskId: number, status: string) => {
    await changeStatus(taskId, status);
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status } : t)),
    );
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!window.confirm("Delete this task?")) return;
    await deleteOne(taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const handleSaveEdit = async (values: any) => {
    if (!editingTask) return { success: false, error: "No task" };
    const res = await editTask(editingTask.id, values);
    if (res?.success) {
      await loadAll();
      flash("Task updated");
    }
    return res;
  };

  const broadcastAssignmentChange = () => {
    try {
      const bc = new BroadcastChannel("task-assignments");
      bc.postMessage({ type: "assignment-changed", at: Date.now() });
      bc.close();
    } catch {
      /* unsupported — member polling is the fallback */
    }
  };

  const handleAssign = async (taskId: number) => {
    if (!assigneePick) return;
    try {
      await assignTaskAPI(taskId, Number(assigneePick));
      broadcastAssignmentChange();
      await loadAll();
      setAssignTaskId(null);
      setAssigneePick("");
      flash("Task assigned");
    } catch (err) {
      setError(handleApiError(err));
    }
  };

  const handleUnassign = async (taskId: number, userId: number) => {
    try {
      await unassignTaskAPI(taskId, userId);
      broadcastAssignmentChange();
      await loadAll();
    } catch (err) {
      setError(handleApiError(err));
    }
  };

  if (loading && !project) return <LoadingSpinner />;
  if (!project) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <p className="text-neutral-700 font-medium mb-4">Project not found.</p>
        <Link to="/admin/projects" className="text-purple-700 hover:underline">
          ← Back to projects
        </Link>
      </div>
    );
  }

  const assigneesByTask: Record<number, any[]> = {};
  for (const t of tasks) assigneesByTask[t.id] = t.assignees || [];
  const completedCount = tasks.filter(
    (t) => normalize(t.status) === "completed",
  ).length;
  const progressPct =
    tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate("/admin/projects")}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-500 hover:text-purple-700 transition"
      >
        <ArrowLeft size={15} /> Back to projects
      </motion.button>

      {/* Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-purple-700 to-fuchsia-600 shadow-[0_20px_60px_-15px_rgba(124,58,237,0.5)]"
      >
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-fuchsia-400/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-12 w-72 h-72 rounded-full bg-violet-500/15 blur-3xl pointer-events-none" />
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="relative px-8 sm:px-10 py-8 sm:py-10">
          <div className="flex items-center gap-3 mb-5 flex-wrap">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/20 text-xs font-medium text-white/90">
              <Calendar size={11} className="text-white/70" />
              Created{" "}
              {new Date(project.created_at).toLocaleDateString(undefined, {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </div>
            {isAdmin && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-purple-700 text-xs font-bold shadow-md">
                <Crown size={11} className="text-amber-500" /> You're the Admin
              </div>
            )}
          </div>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="flex items-start gap-4 min-w-0 flex-1">
              <div className="p-3.5 rounded-2xl bg-white/15 backdrop-blur border border-white/20 flex-shrink-0">
                <FolderOpen size={26} className="text-white" />
              </div>
              <div className="min-w-0 flex-1">
                {editingProject ? (
                  <form onSubmit={handleSaveProject} className="space-y-2">
                    <input
                      value={pForm.name}
                      onChange={(e) =>
                        setPForm((p) => ({ ...p, name: e.target.value }))
                      }
                      className="w-full px-3 py-2 rounded-xl bg-white/15 border border-white/30 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-white/40"
                      placeholder="Project name"
                    />
                    <textarea
                      value={pForm.description}
                      onChange={(e) =>
                        setPForm((p) => ({ ...p, description: e.target.value }))
                      }
                      className="w-full px-3 py-2 rounded-xl bg-white/15 border border-white/30 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-white/40 resize-none"
                      rows={2}
                      placeholder="Description"
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-lg bg-white text-purple-700 font-bold text-sm shadow"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingProject(false)}
                        className="px-4 py-1.5 rounded-lg bg-white/15 border border-white/25 text-white text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2 truncate">
                      {project.name}
                    </h1>
                    <p className="text-purple-200/80 text-sm max-w-2xl leading-relaxed">
                      {project.description || "No description provided"}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 border border-white/20 text-xs font-medium text-white">
                        <Users size={12} /> {project.members?.length || 0}{" "}
                        member{(project.members?.length || 0) !== 1 ? "s" : ""}
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 border border-white/20 text-xs font-medium text-white">
                        <CheckSquare size={12} /> {tasks.length} task
                        {tasks.length !== 1 ? "s" : ""}
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-400/20 border border-emerald-300/30 text-xs font-medium text-emerald-100">
                        {progressPct}% complete
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
            {!editingProject && (
              <div className="flex flex-col items-end gap-3 flex-shrink-0">
                <div className="hidden sm:flex flex-col items-center gap-1 px-5 py-3 rounded-2xl bg-white/10 backdrop-blur border border-white/15">
                  <p className="text-2xl font-extrabold text-white leading-none">
                    {completedCount}
                  </p>
                  <p className="text-white/50 text-[11px]">
                    of {tasks.length} done
                  </p>
                  <div className="w-16 h-1.5 rounded-full bg-white/20 overflow-hidden mt-1">
                    <div
                      className="h-full bg-emerald-400 rounded-full"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>
                {isAdmin && (
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => {
                      setPForm({
                        name: project.name,
                        description: project.description || "",
                      });
                      setEditingProject(true);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/15 backdrop-blur border border-white/25 text-white text-sm font-semibold hover:bg-white/25 transition"
                  >
                    <Pencil size={15} /> Edit project
                  </motion.button>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Flash messages */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2.5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm font-medium"
          >
            <CheckSquare size={15} className="text-emerald-600" /> {successMsg}
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm"
          >
            ⚠️ {error}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Members ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1 rounded-2xl bg-white border border-purple-100 p-6 shadow-sm h-fit"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-500 text-white shadow-md">
                <Users size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-neutral-900">
                  Members
                </h2>
                <p className="text-xs text-neutral-500">
                  {project.members?.length || 0} people
                </p>
              </div>
            </div>
            {isAdmin && availableUsersToAdd.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddMember((v) => !v)}
                className="p-2 rounded-xl text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition"
              >
                <UserPlus size={16} />
              </motion.button>
            )}
          </div>

          <AnimatePresence>
            {isAdmin && showAddMember && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="mb-4"
              >
                <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-100 space-y-2.5">
                  <CustomSelect
                    value={memberToAdd}
                    onChange={setMemberToAdd}
                    options={[
                      { value: "", label: "Select member to add…" },
                      ...availableUsersToAdd.map((u: any) => ({
                        value: String(u.id),
                        label: `${u.name} — ${u.email}`,
                      })),
                    ]}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddMember}
                      disabled={!memberToAdd}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-purple-600 text-white text-sm font-semibold disabled:opacity-50 hover:bg-purple-700 transition"
                    >
                      Add Member
                    </button>
                    <button
                      onClick={() => setShowAddMember(false)}
                      className="px-3 py-1.5 rounded-lg bg-white border border-neutral-200 text-sm text-neutral-600 hover:bg-neutral-50 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-1.5">
            {(project.members || []).map((m: any) => (
              <motion.div
                key={m.id}
                whileHover={{ x: 2 }}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-purple-50/60 transition group"
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shadow flex-shrink-0 ${m.id === project.admin_id ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white" : "bg-gradient-to-br from-purple-500 to-fuchsia-500 text-white"}`}
                >
                  {m.name?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-neutral-900 truncate flex items-center gap-1.5">
                    {m.name}
                    {m.id === project.admin_id && (
                      <Crown
                        size={11}
                        className="text-amber-500 flex-shrink-0"
                      />
                    )}
                  </p>
                  {/* Enhanced email display */}
                  <p className="text-xs text-neutral-400 truncate mt-0.5 flex items-center gap-1">
                    <span className="text-purple-400 font-bold">@</span>
                    <span className="font-mono">{m.email?.split("@")[0]}</span>
                    <span className="text-neutral-300">·</span>
                    <span className="text-neutral-400">
                      {m.email?.split("@")[1]}
                    </span>
                  </p>
                </div>
                {isAdmin && m.id !== project.admin_id && (
                  <button
                    onClick={() => handleRemoveMember(m.id)}
                    className="p-1.5 rounded-lg text-neutral-300 hover:text-red-600 hover:bg-red-50 transition opacity-0 group-hover:opacity-100"
                  >
                    <X size={13} />
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── Tasks ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 rounded-2xl bg-white border border-purple-100 p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-md">
                <CheckSquare size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-neutral-900">Tasks</h2>
                <p className="text-xs text-neutral-500">
                  {tasks.length} task{tasks.length !== 1 ? "s" : ""} ·{" "}
                  {completedCount} done
                </p>
              </div>
            </div>
            {isAdmin && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowTaskForm((v) => !v)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-fuchsia-600 shadow-md shadow-purple-500/30 transition"
              >
                {showTaskForm ? <X size={14} /> : <Plus size={14} />}
                {showTaskForm ? "Cancel" : "New Task"}
              </motion.button>
            )}
          </div>

          {/* Create task form */}
          <AnimatePresence>
            {showTaskForm && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleCreateTask}
                className="overflow-hidden mb-5"
              >
                <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-fuchsia-50 border border-purple-100 space-y-3">
                  <input
                    placeholder="Task title *"
                    value={tForm.title}
                    onChange={(e) =>
                      setTForm((p) => ({ ...p, title: e.target.value }))
                    }
                    className="w-full px-3.5 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition"
                  />
                  <textarea
                    placeholder="Description (optional)"
                    value={tForm.description}
                    onChange={(e) =>
                      setTForm((p) => ({ ...p, description: e.target.value }))
                    }
                    rows={2}
                    className="w-full px-3.5 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition resize-none"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <CustomSelect
                      value={tForm.priority}
                      onChange={(v) => setTForm((p) => ({ ...p, priority: v }))}
                      options={PRIORITY_OPTS}
                    />
                    <DatePicker
                      value={tForm.dueDate}
                      onChange={(v) => setTForm((p) => ({ ...p, dueDate: v }))}
                      min={today}
                      placeholder="Due date"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white text-sm font-bold shadow-md shadow-purple-500/20 hover:shadow-lg transition"
                  >
                    Create Task
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Task list */}
          {tasks.length === 0 ? (
            <div className="text-center py-12 rounded-xl border border-dashed border-purple-200 bg-purple-50/30">
              <CheckSquare size={30} className="mx-auto text-purple-300 mb-2" />
              <p className="text-sm font-semibold text-neutral-600">
                No tasks yet
              </p>
              <p className="text-xs text-neutral-400 mt-1">
                Create a task to start tracking work
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task: any) => {
                const ns = normalize(task.status);
                const barColor =
                  statusLeftBorder[task.status] || statusLeftBorder.pending;
                const assignees = assigneesByTask[task.id] || [];
                const memberOpts: SelectOption[] = [
                  { value: "", label: "Pick member…" },
                  ...(project.members || [])
                    .filter(
                      (m: any) => !assignees.some((a: any) => a.id === m.id),
                    )
                    .map((m: any) => ({ value: String(m.id), label: m.name })),
                ];

                return (
                  <motion.div
                    key={task.id}
                    layout
                    whileHover={{ x: 2 }}
                    className="group relative rounded-2xl border border-neutral-100 hover:border-purple-200 hover:shadow-md transition-all duration-200 bg-white"
                  >
                    {/* Status color bar */}
                    <div
                      className={`absolute left-0 inset-y-0 w-1 ${barColor} group-hover:w-1.5 transition-all duration-200`}
                    />

                    <div className="pl-4 pr-4 py-4">
                      {/* Top row: status select + title + actions */}
                      <div className="flex items-start gap-3">
                        <div className="w-32 flex-shrink-0 mt-0.5">
                          <CustomSelect
                            value={ns}
                            onChange={(v) => handleStatusChange(task.id, v)}
                            options={STATUS_OPTS}
                            size="sm"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3
                            className={`font-bold text-neutral-900 text-sm leading-snug ${ns === "completed" ? "line-through text-neutral-400" : ""}`}
                          >
                            {task.title}
                          </h3>
                          {task.description && (
                            <p className="text-xs text-neutral-500 mt-0.5 line-clamp-2">
                              {task.description}
                            </p>
                          )}

                          {/* Badges */}
                          <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${priorityStyle[task.priority] || priorityStyle.medium}`}
                            >
                              <Flag size={9} />{" "}
                              {task.priority?.charAt(0).toUpperCase() +
                                task.priority?.slice(1)}
                            </span>
                            {task.due_date && (
                              <span className="inline-flex items-center gap-1 text-xs text-neutral-500 font-medium">
                                <Calendar size={9} />
                                {new Date(task.due_date).toLocaleDateString(
                                  undefined,
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  },
                                )}
                              </span>
                            )}
                          </div>

                          {/* Assignees */}
                          <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                            {assignees.map((a: any) => (
                              <span
                                key={a.id}
                                className="inline-flex items-center gap-1 pl-1.5 pr-1 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-100 text-xs font-semibold"
                              >
                                <span className="w-4 h-4 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-500 text-white flex items-center justify-center text-[9px] font-bold flex-shrink-0">
                                  {a.name?.[0]?.toUpperCase()}
                                </span>
                                {a.name}
                                <button
                                  onClick={() => handleUnassign(task.id, a.id)}
                                  className="hover:text-red-600 transition ml-0.5 p-0.5 rounded"
                                >
                                  <X size={9} />
                                </button>
                              </span>
                            ))}

                            {assignTaskId === task.id ? (
                              <div className="flex items-center gap-1.5">
                                <div className="w-40">
                                  <CustomSelect
                                    value={assigneePick}
                                    onChange={setAssigneePick}
                                    options={memberOpts}
                                    size="sm"
                                  />
                                </div>
                                <button
                                  onClick={() => handleAssign(task.id)}
                                  disabled={!assigneePick}
                                  className="px-2.5 py-1 rounded-lg bg-purple-600 text-white text-xs font-bold disabled:opacity-50 hover:bg-purple-700 transition"
                                >
                                  Add
                                </button>
                                <button
                                  onClick={() => {
                                    setAssignTaskId(null);
                                    setAssigneePick("");
                                  }}
                                  className="p-1 rounded-lg text-neutral-400 hover:bg-neutral-100 transition"
                                >
                                  <X size={11} />
                                </button>
                              </div>
                            ) : (
                              isAdmin && (
                                <button
                                  onClick={() => setAssignTaskId(task.id)}
                                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs text-purple-600 font-semibold hover:bg-purple-50 border border-dashed border-purple-300 transition"
                                >
                                  <UserPlus size={9} /> Assign
                                </button>
                              )
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        {isAdmin && (
                          <div className="flex items-start gap-1 opacity-0 group-hover:opacity-100 transition flex-shrink-0">
                            <button
                              onClick={() => setEditingTask(task)}
                              className="p-1.5 rounded-lg text-neutral-400 hover:text-purple-700 hover:bg-purple-50 transition"
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      <EditTaskModal
        open={!!editingTask}
        initial={editingTask || {}}
        onClose={() => setEditingTask(null)}
        onSave={handleSaveEdit}
        title="Edit Task"
      />
    </div>
  );
}

// Local map for the left bar color (using Tailwind class names, not the CSS variable approach)
const statusLeftBorder: Record<string, string> = {
  pending: "bg-amber-400",
  to_do: "bg-amber-400",
  in_progress: "bg-blue-500",
  completed: "bg-emerald-500",
  done: "bg-emerald-500",
};
