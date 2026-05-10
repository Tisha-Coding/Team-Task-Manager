import { useEffect, useState } from "react";
import { useTasks } from "../hooks/useTasks";
import { useProjects } from "../hooks/useProjects";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckSquare,
  Plus,
  X,
  Trash2,
  CheckCircle2,
  Calendar,
  Sparkles,
  Flag,
  Pencil,
} from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";
import EditTaskModal from "../components/EditTaskModal";

const STATUS_TABS = [
  { key: "all", label: "All" },
  { key: "pending", label: "To Do" },
  { key: "in_progress", label: "In Progress" },
  { key: "completed", label: "Done" },
] as const;

const priorityStyle: Record<string, string> = {
  high: "bg-red-50 text-red-700 border-red-100",
  medium: "bg-amber-50 text-amber-700 border-amber-100",
  low: "bg-emerald-50 text-emerald-700 border-emerald-100",
};

const statusStyle: Record<string, string> = {
  pending: "bg-purple-50 text-purple-700 border-purple-100",
  in_progress: "bg-blue-50 text-blue-700 border-blue-100",
  completed: "bg-green-50 text-green-700 border-green-100",
};

export default function Tasks() {
  const {
    userTasks,
    fetchUserTasks,
    createNew,
    changeStatus,
    editTask,
    deleteOne,
    isLoading,
    error,
  } = useTasks();
  const [editing, setEditing] = useState<any>(null);
  const { projects, fetchProjects } = useProjects();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    projectId: "",
    priority: "medium",
    dueDate: "",
  });
  const [formError, setFormError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    fetchUserTasks();
    fetchProjects();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSuccessMsg("");

    if (!formData.title || !formData.description || !formData.projectId) {
      setFormError("Please fill all required fields");
      return;
    }

    const result = await createNew({
      title: formData.title,
      description: formData.description,
      projectId: parseInt(formData.projectId),
      priority: formData.priority,
      dueDate: formData.dueDate || undefined,
    });

    if (result?.success) {
      setFormData({
        title: "",
        description: "",
        projectId: "",
        priority: "medium",
        dueDate: "",
      });
      setShowForm(false);
      setSuccessMsg("Task created successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } else {
      setFormError(result?.error || "Failed to create task");
    }
  };

  const handleDelete = async (taskId: number) => {
    if (window.confirm("Delete this task?")) await deleteOne(taskId);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const filteredTasks = (userTasks || []).filter((task: any) =>
    filterStatus === "all" ? true : task.status === filterStatus,
  );

  const counts = (userTasks || []).reduce(
    (acc: Record<string, number>, t: any) => {
      acc.all = (acc.all || 0) + 1;
      acc[t.status] = (acc[t.status] || 0) + 1;
      return acc;
    },
    { all: 0 },
  );

  if (isLoading && (!userTasks || userTasks.length === 0))
    return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-600 to-fuchsia-500 shadow-lg shadow-purple-500/30">
            <CheckSquare size={26} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-neutral-900 via-purple-700 to-neutral-900 bg-clip-text text-transparent">
              My Tasks
            </h1>
            <p className="text-neutral-600 mt-1 inline-flex items-center gap-1.5">
              <Sparkles size={14} className="text-purple-500" /> View and manage
              your tasks
            </p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowForm(!showForm)}
          className="relative overflow-hidden inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-fuchsia-600 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-shadow group"
        >
          <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          <span className="relative inline-flex items-center gap-2">
            {showForm ? <X size={18} /> : <Plus size={18} />}
            {showForm ? "Cancel" : "New Task"}
          </span>
        </motion.button>
      </motion.div>

      {/* Toast */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 p-3.5 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm"
          >
            <CheckCircle2 size={18} className="text-green-600" />
            {successMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="overflow-hidden"
          >
            <div className="relative rounded-2xl bg-white/80 backdrop-blur-xl border border-purple-100 p-6 shadow-[0_10px_40px_-10px_rgba(124,58,237,0.25)]">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-500/60 to-transparent" />
              <h2 className="text-xl font-bold text-neutral-900 mb-5">
                Create New Task
              </h2>

              {(formError || error) && (
                <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                  ⚠️ {formError || error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-neutral-900 placeholder-neutral-400 shadow-sm focus:outline-none focus:ring-4 focus:ring-purple-500/15 focus:border-purple-500 transition"
                    placeholder="What needs to be done?"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-neutral-900 placeholder-neutral-400 shadow-sm focus:outline-none focus:ring-4 focus:ring-purple-500/15 focus:border-purple-500 transition resize-none"
                    placeholder="Task details..."
                    disabled={isLoading}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      Project *
                    </label>
                    <select
                      name="projectId"
                      value={formData.projectId}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-neutral-900 shadow-sm focus:outline-none focus:ring-4 focus:ring-purple-500/15 focus:border-purple-500 transition"
                      disabled={isLoading}
                    >
                      <option value="">Select a project</option>
                      {projects?.map((p: any) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      Priority
                    </label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-neutral-900 shadow-sm focus:outline-none focus:ring-4 focus:ring-purple-500/15 focus:border-purple-500 transition"
                      disabled={isLoading}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      Due Date
                    </label>
                    <input
                      type="date"
                      name="dueDate"
                      value={formData.dueDate}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-neutral-900 shadow-sm focus:outline-none focus:ring-4 focus:ring-purple-500/15 focus:border-purple-500 transition"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: isLoading ? 1 : 1.01 }}
                  whileTap={{ scale: isLoading ? 1 : 0.99 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-fuchsia-600 shadow-lg shadow-purple-500/30 hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed transition-shadow"
                >
                  {isLoading ? "Creating..." : "Create Task"}
                </motion.button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter pills */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_TABS.map(({ key, label }) => {
          const active = filterStatus === key;
          const count = counts[key] ?? 0;
          return (
            <motion.button
              key={key}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setFilterStatus(key)}
              className={`relative px-4 py-2 rounded-xl font-medium text-sm transition border ${
                active
                  ? "bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white border-transparent shadow-md shadow-purple-500/30"
                  : "bg-white text-neutral-700 border-neutral-200 hover:border-purple-300 hover:text-purple-700"
              }`}
            >
              <span className="inline-flex items-center gap-2">
                {label}
                <span
                  className={`px-1.5 py-0.5 text-xs rounded-md ${active ? "bg-white/20" : "bg-neutral-100"}`}
                >
                  {count}
                </span>
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Task list */}
      <div className="space-y-3">
        <AnimatePresence>
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task: any, i: number) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: i * 0.03 }}
                whileHover={{ x: 4 }}
                className="group relative rounded-2xl bg-white border border-neutral-100 p-5 shadow-sm hover:shadow-lg hover:shadow-purple-500/10 hover:border-purple-200 transition-all duration-200 overflow-hidden"
              >
                <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-purple-500 to-fuchsia-500 scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-300" />

                <div className="flex items-start gap-4">
                  <select
                    value={task.status}
                    onChange={(e) => changeStatus(task.id, e.target.value)}
                    className={`mt-0.5 px-3 py-1.5 rounded-lg text-xs font-medium border focus:outline-none focus:ring-2 focus:ring-purple-500/30 ${statusStyle[task.status] || "bg-neutral-50 text-neutral-700 border-neutral-200"}`}
                  >
                    <option value="pending">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Done</option>
                  </select>

                  <div className="flex-1 min-w-0">
                    <h3
                      className={`font-semibold text-neutral-900 ${task.status === "completed" ? "line-through text-neutral-400" : ""}`}
                    >
                      {task.title}
                    </h3>
                    <p className="text-sm text-neutral-600 mt-1 line-clamp-2">
                      {task.description}
                    </p>

                    <div className="flex flex-wrap gap-2 mt-3 items-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${priorityStyle[task.priority] || priorityStyle.medium}`}
                      >
                        <Flag size={11} />
                        {task.priority?.toUpperCase()}
                      </span>
                      {task.due_date && (
                        <span className="inline-flex items-center gap-1 text-xs text-neutral-500">
                          <Calendar size={12} />
                          {new Date(task.due_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => setEditing(task)}
                      className="p-2 rounded-lg text-neutral-500 hover:text-purple-700 hover:bg-purple-50 transition"
                      aria-label="Edit task"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="p-2 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition"
                      aria-label="Delete task"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 rounded-2xl bg-white/60 border border-dashed border-purple-200"
            >
              <div className="inline-flex p-4 rounded-2xl bg-purple-50 mb-4">
                <CheckSquare size={32} className="text-purple-500" />
              </div>
              <p className="text-neutral-700 font-medium mb-1">No tasks here</p>
              <p className="text-neutral-500 text-sm">
                Try a different filter or create a new task.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <EditTaskModal
        open={!!editing}
        initial={editing || {}}
        onClose={() => setEditing(null)}
        onSave={async (values) => {
          if (!editing) return { success: false };
          const r = await editTask(editing.id, values);
          if (r?.success) await fetchUserTasks();
          return r;
        }}
        title="Edit Task"
      />
    </div>
  );
}
