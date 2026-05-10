import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckSquare } from "lucide-react";
import CustomSelect from "./CustomSelect";
import DatePicker from "./DatePicker";

export type TaskFormValues = {
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string;
};

type Props = {
  open: boolean;
  initial: Partial<TaskFormValues>;
  onClose: () => void;
  onSave: (
    values: TaskFormValues,
  ) => Promise<{ success: boolean; error?: string } | void>;
  title?: string;
};

const STATUS_OPTIONS = [
  { value: "pending", label: "To Do", dot: "bg-amber-400" },
  { value: "in_progress", label: "In Progress", dot: "bg-blue-500" },
  { value: "completed", label: "Done", dot: "bg-emerald-500" },
];

const PRIORITY_OPTIONS = [
  { value: "low", label: "🟢  Low" },
  { value: "medium", label: "🟡  Medium" },
  { value: "high", label: "🔴  High" },
];

const TODAY = new Date().toISOString().split("T")[0];

const normalize = (s: string) =>
  s === "to_do" ? "pending" : s === "done" ? "completed" : s;

export default function EditTaskModal({
  open,
  initial,
  onClose,
  onSave,
  title = "Edit Task",
}: Props) {
  const [values, setValues] = useState<TaskFormValues>({
    title: "",
    description: "",
    status: "pending",
    priority: "medium",
    dueDate: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setValues({
      title: initial.title ?? "",
      description: initial.description ?? "",
      status: normalize(initial.status ?? "pending"),
      priority: initial.priority ?? "medium",
      dueDate: initial.dueDate ? initial.dueDate.slice(0, 10) : "",
    });
    setError("");
  }, [open, initial]);

  const set = (field: keyof TaskFormValues) => (v: string) =>
    setValues((p) => ({ ...p, [field]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!values.title.trim()) {
      setError("Title is required");
      return;
    }
    setSaving(true);
    setError("");
    const result = await onSave(values);
    setSaving(false);
    if (result && result.success === false)
      setError(result.error || "Failed to save");
    else onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-neutral-900/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            transition={{ type: "spring", damping: 22, stiffness: 280 }}
            className="relative w-full max-w-lg rounded-3xl bg-white border border-purple-100 shadow-2xl shadow-purple-500/20 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-purple-500 to-fuchsia-500" />

            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-purple-600 to-fuchsia-500 text-white shadow">
                  <CheckSquare size={16} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-neutral-900">
                    {title}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Update task details below
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                  ⚠️ {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
                  Title
                </label>
                <input
                  value={values.title}
                  onChange={(e) => set("title")(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:ring-4 focus:ring-purple-500/15 focus:border-purple-500 transition"
                  placeholder="Task title"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
                  Description
                </label>
                <textarea
                  value={values.description}
                  onChange={(e) => set("description")(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:ring-4 focus:ring-purple-500/15 focus:border-purple-500 transition resize-none"
                  placeholder="Task details…"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
                    Status
                  </label>
                  <CustomSelect
                    value={values.status}
                    onChange={set("status")}
                    options={STATUS_OPTIONS}
                    dropUp
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
                    Priority
                  </label>
                  <CustomSelect
                    value={values.priority}
                    onChange={set("priority")}
                    options={PRIORITY_OPTIONS}
                    dropUp
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
                    Due Date
                  </label>
                  <DatePicker
                    value={values.dueDate}
                    onChange={set("dueDate")}
                    min={TODAY}
                    placeholder="Pick date"
                    dropUp
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-neutral-700 font-semibold hover:bg-neutral-100 border border-neutral-200 transition text-sm"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: saving ? 1 : 1.02 }}
                  whileTap={{ scale: saving ? 1 : 0.98 }}
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl font-bold text-white text-sm bg-gradient-to-r from-purple-600 to-fuchsia-600 shadow-lg shadow-purple-500/30 hover:shadow-xl disabled:opacity-60 transition-shadow"
                >
                  {saving ? "Saving…" : "Save Changes"}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
