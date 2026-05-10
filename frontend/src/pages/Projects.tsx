import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useProjects } from "../hooks/useProjects";
import { motion, AnimatePresence } from "framer-motion";
import {
  FolderOpen,
  Plus,
  Trash2,
  X,
  CheckCircle2,
  Sparkles,
  Calendar,
  ArrowUpRight,
} from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";

export default function Projects() {
  const { projects, fetchProjects, createNew, deleteOne, isLoading, error } =
    useProjects();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [formError, setFormError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSuccessMsg("");

    if (!formData.name || !formData.description) {
      setFormError("Please fill all fields");
      return;
    }

    const result = await createNew(formData.name, formData.description);
    if (result?.success) {
      setFormData({ name: "", description: "" });
      setShowForm(false);
      setSuccessMsg("Project created successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } else {
      setFormError(result?.error || "Failed to create project");
    }
  };

  const handleDelete = async (projectId: number) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      const result = await deleteOne(projectId);
      if (result?.success) {
        setSuccessMsg("Project deleted successfully!");
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (isLoading && (!projects || projects.length === 0))
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
            <FolderOpen size={26} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-neutral-900 via-purple-700 to-neutral-900 bg-clip-text text-transparent">
              Projects
            </h1>
            <p className="text-neutral-600 mt-1 inline-flex items-center gap-1.5">
              <Sparkles size={14} className="text-purple-500" /> Create and
              manage your projects
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
            {showForm ? "Cancel" : "New Project"}
          </span>
        </motion.button>
      </motion.div>

      {/* Success toast */}
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
                Create New Project
              </h2>

              {(formError || error) && (
                <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                  ⚠️ {formError || error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Project Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-neutral-900 placeholder-neutral-400 shadow-sm focus:outline-none focus:ring-4 focus:ring-purple-500/15 focus:border-purple-500 transition"
                    placeholder="e.g., Website Redesign"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-neutral-900 placeholder-neutral-400 shadow-sm focus:outline-none focus:ring-4 focus:ring-purple-500/15 focus:border-purple-500 transition resize-none"
                    placeholder="Describe your project..."
                    disabled={isLoading}
                  />
                </div>
                <motion.button
                  whileHover={{ scale: isLoading ? 1 : 1.01 }}
                  whileTap={{ scale: isLoading ? 1 : 0.99 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-fuchsia-600 shadow-lg shadow-purple-500/30 hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed transition-shadow"
                >
                  {isLoading ? "Creating..." : "Create Project"}
                </motion.button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Project Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects && projects.length > 0 ? (
          projects.map((project: any, i: number) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4 }}
              className="group relative rounded-2xl bg-white border border-neutral-100 shadow-sm hover:shadow-xl hover:shadow-purple-500/10 hover:border-purple-200 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-purple-500 to-fuchsia-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />

              <Link to={`/projects/${project.id}`} className="block p-6 pb-3">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-xl bg-purple-50 group-hover:bg-purple-100 transition-colors flex-shrink-0">
                      <FolderOpen size={20} className="text-purple-600" />
                    </div>
                    <h3 className="text-lg font-bold text-neutral-900 group-hover:text-purple-700 transition-colors truncate">
                      {project.name}
                    </h3>
                  </div>
                  <ArrowUpRight
                    size={16}
                    className="text-neutral-400 group-hover:text-purple-600 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition flex-shrink-0"
                  />
                </div>

                <p className="text-neutral-600 text-sm line-clamp-2 min-h-[2.5rem]">
                  {project.description}
                </p>
              </Link>

              <div className="flex items-center justify-between px-6 pb-4 text-xs">
                <span className="inline-flex items-center gap-1.5 text-neutral-500">
                  <Calendar size={12} />
                  {new Date(project.created_at).toLocaleDateString()}
                </span>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-purple-50 text-purple-700 font-medium rounded-full border border-purple-100">
                    Active
                  </span>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition opacity-0 group-hover:opacity-100"
                    aria-label="Delete project"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full text-center py-16 rounded-2xl bg-white/60 border border-dashed border-purple-200"
          >
            <div className="inline-flex p-4 rounded-2xl bg-purple-50 mb-4">
              <FolderOpen size={32} className="text-purple-500" />
            </div>
            <p className="text-neutral-700 font-medium mb-1">No projects yet</p>
            <p className="text-neutral-500 text-sm">
              Create your first project to get started!
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
