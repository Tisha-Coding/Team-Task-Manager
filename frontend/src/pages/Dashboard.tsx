import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useProjects } from "../hooks/useProjects";
import { useTasks } from "../hooks/useTasks";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import {
  Zap,
  CheckCircle2,
  Clock,
  AlertCircle,
  FolderOpen,
  CheckSquare,
  Plus,
  ArrowUpRight,
  Sparkles,
  TrendingUp,
  Calendar,
} from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";

function AnimatedNumber({ value }: { value: number }) {
  const motionVal = useMotionValue(0);
  const rounded = useTransform(motionVal, (v) => Math.round(v));
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(motionVal, value, {
      duration: 1,
      ease: "easeOut",
    });
    const unsub = rounded.on("change", (v) => setDisplay(v));
    return () => {
      controls.stop();
      unsub();
    };
  }, [value]);

  return <>{display}</>;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return { text: "Good morning", emoji: "☀️" };
  if (hour < 17) return { text: "Good afternoon", emoji: "🌤️" };
  if (hour < 21) return { text: "Good evening", emoji: "🌆" };
  return { text: "Good night", emoji: "🌙" };
}

export default function Dashboard() {
  const { projects, fetchProjects, isLoading: projectsLoading } = useProjects();
  const { userTasks, fetchUserTasks, isLoading: tasksLoading } = useTasks();
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    fetchProjects();
    fetchUserTasks();
  }, []);

  const stats = useMemo(() => {
    const list = userTasks || [];
    const todo = list.filter((t: any) => t.status === "pending").length;
    const inProgress = list.filter(
      (t: any) => t.status === "in_progress",
    ).length;
    const done = list.filter((t: any) => t.status === "completed").length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const overdue = list.filter((t: any) => {
      if (!t.due_date || t.status === "completed") return false;
      const d = new Date(t.due_date);
      d.setHours(0, 0, 0, 0);
      return d < today;
    }).length;

    const completion = list.length ? Math.round((done / list.length) * 100) : 0;
    return { total: list.length, todo, inProgress, done, overdue, completion };
  }, [userTasks]);

  const isLoading = projectsLoading || tasksLoading;
  if (
    isLoading &&
    (!userTasks || userTasks.length === 0) &&
    (!projects || projects.length === 0)
  ) {
    return <LoadingSpinner />;
  }

  const greeting = getGreeting();
  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const statCards = [
    {
      label: "Total Tasks",
      value: stats.total,
      icon: Zap,
      gradient: "from-purple-500 to-fuchsia-500",
      bg: "from-purple-50 to-fuchsia-50",
    },
    {
      label: "In Progress",
      value: stats.inProgress,
      icon: Clock,
      gradient: "from-blue-500 to-indigo-500",
      bg: "from-blue-50 to-indigo-50",
    },
    {
      label: "Completed",
      value: stats.done,
      icon: CheckCircle2,
      gradient: "from-emerald-500 to-teal-500",
      bg: "from-emerald-50 to-teal-50",
    },
    {
      label: "Overdue",
      value: stats.overdue,
      icon: AlertCircle,
      gradient: "from-rose-500 to-red-500",
      bg: "from-rose-50 to-red-50",
    },
  ];

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 overflow-hidden">
      {/* Background orbs */}
      <motion.div
        animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-32 -right-20 w-[28rem] h-[28rem] rounded-full bg-gradient-to-br from-purple-300 to-fuchsia-200 opacity-30 blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{ x: [0, -40, 0], y: [0, 30, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 -left-32 w-[26rem] h-[26rem] rounded-full bg-gradient-to-br from-violet-200 to-purple-300 opacity-25 blur-3xl pointer-events-none"
      />

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 rounded-3xl overflow-hidden bg-gradient-to-br from-purple-600 via-purple-700 to-fuchsia-600 p-8 sm:p-10 shadow-[0_20px_60px_-15px_rgba(124,58,237,0.5)]"
      >
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-fuchsia-400 blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 rounded-full bg-violet-400 blur-3xl translate-y-1/2" />
        </div>
        <div
          className="absolute inset-0 opacity-[0.08] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />

        <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div className="text-white">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-medium mb-4"
            >
              <Calendar size={12} />
              {today}
            </motion.div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-3">
              {greeting.text}, {user?.name?.split(" ")[0] || "there"}{" "}
              {greeting.emoji}
            </h1>
            <p className="text-purple-100/90 text-lg max-w-xl flex items-center flex-wrap gap-2">
              <Sparkles size={16} className="text-white/80" />
              You have{" "}
              <span className="font-semibold text-white">
                {stats.todo + stats.inProgress}
              </span>{" "}
              active tasks
              {stats.overdue > 0 && (
                <>
                  —{" "}
                  <span className="font-semibold text-rose-200">
                    {stats.overdue} overdue
                  </span>
                </>
              )}
            </p>

            <div className="flex flex-wrap gap-2 mt-6">
              <Link to="/tasks">
                <motion.div
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-purple-700 font-semibold text-sm shadow-lg shadow-purple-900/20 hover:shadow-xl transition"
                >
                  <Plus size={16} /> New Task
                </motion.div>
              </Link>
              <Link to="/projects">
                <motion.div
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/15 backdrop-blur-md border border-white/25 text-white font-semibold text-sm hover:bg-white/25 transition"
                >
                  <FolderOpen size={16} /> View Projects
                </motion.div>
              </Link>
            </div>
          </div>

          {/* Completion ring */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: 0.3,
              type: "spring",
              stiffness: 200,
              damping: 18,
            }}
            className="relative flex items-center justify-center"
          >
            <svg className="w-36 h-36 -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="8"
                fill="none"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="42"
                stroke="white"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 42}
                initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                animate={{
                  strokeDashoffset:
                    2 * Math.PI * 42 * (1 - stats.completion / 100),
                }}
                transition={{ duration: 1.4, ease: "easeOut", delay: 0.4 }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              <span className="text-3xl font-bold">
                <AnimatedNumber value={stats.completion} />%
              </span>
              <span className="text-xs uppercase tracking-wider text-purple-100/80 mt-0.5">
                Completed
              </span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
        className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
      >
        {statCards.map(({ label, value, icon: Icon, gradient, bg }) => (
          <motion.div
            key={label}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            whileHover={{ y: -4 }}
            className={`group relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br ${bg} border border-white/60 shadow-sm hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300`}
          >
            <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/40 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex items-start justify-between mb-4">
              <p className="text-neutral-600 text-sm font-medium">{label}</p>
              <motion.div
                whileHover={{ rotate: 12, scale: 1.1 }}
                className={`p-2 rounded-xl bg-gradient-to-br ${gradient} text-white shadow-md`}
              >
                <Icon size={18} />
              </motion.div>
            </div>
            <p className="relative text-4xl font-bold text-neutral-900 tracking-tight">
              <AnimatedNumber value={value} />
            </p>
            <div className="relative h-1 mt-4 rounded-full bg-white/60 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: stats.total
                    ? `${Math.min(100, (value / Math.max(1, stats.total)) * 100)}%`
                    : "0%",
                }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-full bg-gradient-to-r ${gradient}`}
              />
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Split */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projects */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl bg-white/80 backdrop-blur-xl border border-purple-100 p-6 shadow-sm hover:shadow-lg transition"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-500 text-white shadow-md">
                <FolderOpen size={18} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-neutral-900">Projects</h2>
                <p className="text-xs text-neutral-500">
                  {projects?.length || 0} active
                </p>
              </div>
            </div>
            <Link
              to="/projects"
              className="inline-flex items-center gap-1 text-sm font-medium text-purple-700 hover:text-purple-800 group"
            >
              View all
              <ArrowUpRight
                size={14}
                className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
              />
            </Link>
          </div>

          {projects && projects.length > 0 ? (
            <div className="space-y-2">
              {projects.slice(0, 5).map((p: any, i: number) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + i * 0.05 }}
                  whileHover={{ x: 4 }}
                  className="group flex items-start justify-between gap-3 p-3 rounded-xl hover:bg-purple-50/60 transition cursor-pointer border border-transparent hover:border-purple-100"
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-500 mt-2 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="font-semibold text-neutral-900 group-hover:text-purple-700 transition truncate">
                        {p.name}
                      </p>
                      <p className="text-xs text-neutral-500 truncate">
                        {p.description}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-100 whitespace-nowrap">
                    Active
                  </span>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 rounded-xl border border-dashed border-purple-200 bg-purple-50/30">
              <FolderOpen size={28} className="mx-auto text-purple-400 mb-2" />
              <p className="text-sm text-neutral-600">No projects yet</p>
            </div>
          )}
        </motion.div>

        {/* Tasks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl bg-white/80 backdrop-blur-xl border border-purple-100 p-6 shadow-sm hover:shadow-lg transition"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-md">
                <CheckSquare size={18} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-neutral-900">
                  Recent Tasks
                </h2>
                <p className="text-xs text-neutral-500 inline-flex items-center gap-1">
                  <TrendingUp size={11} />
                  {userTasks?.length || 0} assigned
                </p>
              </div>
            </div>
            <Link
              to="/tasks"
              className="inline-flex items-center gap-1 text-sm font-medium text-purple-700 hover:text-purple-800 group"
            >
              View all
              <ArrowUpRight
                size={14}
                className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
              />
            </Link>
          </div>

          {userTasks && userTasks.length > 0 ? (
            <div className="space-y-2">
              {userTasks.slice(0, 5).map((task: any, i: number) => {
                const statusMap: Record<
                  string,
                  { label: string; cls: string }
                > = {
                  pending: {
                    label: "To Do",
                    cls: "bg-purple-50 text-purple-700 border-purple-100",
                  },
                  in_progress: {
                    label: "In Progress",
                    cls: "bg-blue-50 text-blue-700 border-blue-100",
                  },
                  completed: {
                    label: "Done",
                    cls: "bg-green-50 text-green-700 border-green-100",
                  },
                };
                const s = statusMap[task.status] || statusMap.pending;
                return (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 + i * 0.05 }}
                    whileHover={{ x: 4 }}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-purple-50/60 transition border border-transparent hover:border-purple-100"
                  >
                    <input
                      type="checkbox"
                      checked={task.status === "completed"}
                      readOnly
                      className="mt-1 w-4 h-4 rounded accent-purple-600 cursor-not-allowed"
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className={`font-medium truncate ${task.status === "completed" ? "line-through text-neutral-400" : "text-neutral-900"}`}
                      >
                        {task.title}
                      </p>
                      <p className="text-xs text-neutral-500 truncate">
                        {task.description}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full border whitespace-nowrap ${s.cls}`}
                    >
                      {s.label}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 rounded-xl border border-dashed border-purple-200 bg-purple-50/30">
              <CheckSquare size={28} className="mx-auto text-purple-400 mb-2" />
              <p className="text-sm text-neutral-600">No tasks assigned yet</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
