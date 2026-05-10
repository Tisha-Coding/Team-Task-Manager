import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import { motion, AnimatePresence } from "framer-motion";
import {
  FolderOpen,
  Search,
  Sparkles,
  Users,
  CheckSquare,
  Calendar,
  Crown,
  Plus,
  X,
  ChevronDown,
} from "lucide-react";
import {
  getAllProjectsAdminAPI,
  createProjectAPI,
  handleApiError,
} from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import { searchFields } from "../../utils/search";

// Palette of accent colors for project cards (cycles)
const CARD_ACCENTS = [
  {
    bar: "from-purple-500 to-fuchsia-500",
    icon: "bg-purple-100 text-purple-600",
    dot: "bg-purple-500",
  },
  {
    bar: "from-blue-500 to-indigo-500",
    icon: "bg-blue-100 text-blue-600",
    dot: "bg-blue-500",
  },
  {
    bar: "from-emerald-500 to-teal-500",
    icon: "bg-emerald-100 text-emerald-600",
    dot: "bg-emerald-500",
  },
  {
    bar: "from-amber-500 to-orange-400",
    icon: "bg-amber-100 text-amber-600",
    dot: "bg-amber-500",
  },
  {
    bar: "from-rose-500 to-pink-500",
    icon: "bg-rose-100 text-rose-600",
    dot: "bg-rose-500",
  },
  {
    bar: "from-violet-500 to-purple-600",
    icon: "bg-violet-100 text-violet-600",
    dot: "bg-violet-500",
  },
];

export default function AdminProjects() {
  const navigate = useNavigate();
  const { user } = useSelector((s: RootState) => s.auth);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const res = await getAllProjectsAdminAPI();
      setProjects(res.data.projects || []);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!form.name.trim()) {
      setFormError("Project name is required");
      return;
    }
    setSaving(true);
    try {
      await createProjectAPI({
        name: form.name.trim(),
        description: form.description.trim(),
      });
      setShowModal(false);
      setForm({ name: "", description: "" });
      await load();
    } catch (err) {
      setFormError(handleApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setFormError("");
    setForm({ name: "", description: "" });
  };

  if (loading) return <LoadingSpinner />;

  // Only show projects this admin owns
  const myProjects = projects.filter((p) => p.admin_id === user?.id);
  const filtered = myProjects.filter((p) =>
    searchFields(search, p.name, p.description),
  );

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
            <FolderOpen size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-neutral-900 via-purple-700 to-neutral-900 bg-clip-text text-transparent">
              My Projects
            </h1>
            <p className="text-neutral-500 mt-0.5 text-sm flex items-center gap-1.5">
              <Sparkles size={12} className="text-purple-400" />
              {myProjects.length} project{myProjects.length !== 1 ? "s" : ""}{" "}
              you manage
            </p>
          </div>
        </div>

        <div className="flex gap-3 flex-wrap">
          {/* Search */}
          <div className="relative w-full sm:w-60">
            <Search
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects…"
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm shadow-sm focus:outline-none focus:ring-4 focus:ring-purple-500/15 focus:border-purple-500 transition placeholder-neutral-400"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-white text-sm bg-gradient-to-r from-purple-600 to-fuchsia-600 shadow-lg shadow-purple-500/30 hover:shadow-xl transition-shadow whitespace-nowrap"
          >
            <Plus size={16} /> New Project
          </motion.button>
        </div>
      </motion.div>

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Create Project Modal */}
      <AnimatePresence>
        {showModal && (
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
              className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl p-8 overflow-hidden"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-purple-500 to-fuchsia-500" />
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-600 to-fuchsia-500 text-white shadow">
                    <FolderOpen size={18} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-neutral-900">
                      Create Project
                    </h2>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      You'll be set as the admin
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
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

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
                    Project Name *
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, name: e.target.value }))
                    }
                    placeholder="e.g. Website Redesign"
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
                    placeholder="What is this project about?"
                    rows={3}
                    className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-purple-500/15 focus:border-purple-500 transition resize-none"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 py-2.5 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white text-sm font-semibold shadow-md shadow-purple-500/30 hover:shadow-xl disabled:opacity-60 transition-shadow"
                  >
                    {saving ? "Creating…" : "Create Project"}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Project grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((p, i) => {
          const accent = CARD_ACCENTS[i % CARD_ACCENTS.length];
          const created = new Date(p.created_at).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          });
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              onClick={() => navigate(`/admin/projects/${p.id}`)}
              className="group relative rounded-2xl bg-white border border-neutral-100 hover:border-purple-200 shadow-sm hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 overflow-hidden cursor-pointer flex flex-col"
            >
              {/* Color accent bar */}
              <div
                className={`h-1 bg-gradient-to-r ${accent.bar} opacity-80 group-hover:opacity-100 transition-opacity`}
              />

              <div className="p-6 flex flex-col flex-1">
                {/* Title row */}
                <div className="flex items-start gap-3 mb-3">
                  <div
                    className={`p-2 rounded-xl flex-shrink-0 transition ${accent.icon}`}
                  >
                    <FolderOpen size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-neutral-900 truncate group-hover:text-purple-700 transition">
                      {p.name}
                    </h3>
                    <p className="text-xs text-neutral-500 mt-0.5 line-clamp-2">
                      {p.description || "No description provided"}
                    </p>
                  </div>
                </div>

                {/* Admin badge */}
                <div className="flex items-center gap-1.5 mb-4">
                  <Crown size={11} className="text-amber-500 flex-shrink-0" />
                  <span className="text-xs text-neutral-500">
                    Managed by{" "}
                    <span className="font-semibold text-neutral-700">
                      {p.admin_name || "you"}
                    </span>
                  </span>
                </div>

                {/* Stats row */}
                <div className="mt-auto pt-4 border-t border-neutral-100 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-600">
                      <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center">
                        <Users size={10} className="text-purple-600" />
                      </div>
                      {p.member_count ?? 0} member
                      {(p.member_count ?? 0) !== 1 ? "s" : ""}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-600">
                      <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                        <CheckSquare size={10} className="text-blue-600" />
                      </div>
                      {p.task_count ?? 0} task
                      {(p.task_count ?? 0) !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] text-neutral-400">
                    <Calendar size={9} /> {created}
                  </span>
                </div>
              </div>

              {/* Hover arrow */}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronDown size={14} className="text-purple-400 -rotate-90" />
              </div>
            </motion.div>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-full text-center py-20 rounded-2xl bg-white/60 border border-dashed border-purple-200">
            <FolderOpen size={36} className="mx-auto text-purple-300 mb-3" />
            <p className="text-neutral-600 font-semibold mb-1">
              {search ? "No projects match your search" : "No projects yet"}
            </p>
            <p className="text-neutral-400 text-sm mb-4">
              {search
                ? "Try a different keyword"
                : "Create your first project to get started"}
            </p>
            {!search && (
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition"
              >
                <Plus size={15} /> Create project
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
