import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import {
  CheckSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Calendar,
  Flag,
  RefreshCw,
} from "lucide-react";
import {
  getUserTasksAPI,
  updateTaskAPI,
  handleApiError,
} from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import CustomSelect from "../../components/CustomSelect";

const POLL_INTERVAL_MS = 3000;

function AnimatedNumber({ value }: { value: number }) {
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => Math.round(v));
  const [n, setN] = useState(0);
  useEffect(() => {
    const c = animate(mv, value, { duration: 1, ease: "easeOut" });
    const u = rounded.on("change", setN);
    return () => {
      c.stop();
      u();
    };
  }, [value]);
  return <>{n}</>;
}

const priorityStyle: Record<string, string> = {
  high: "bg-red-50 text-red-700 border-red-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  low: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const STATUS_OPTS = [
  { value: "pending", label: "To Do", dot: "bg-amber-400" },
  { value: "in_progress", label: "In Progress", dot: "bg-blue-500" },
  { value: "completed", label: "Done", dot: "bg-emerald-500" },
];

const STATUS_TABS = [
  { key: "all", label: "All" },
  { key: "pending", label: "To Do" },
  { key: "in_progress", label: "In Progress" },
  { key: "completed", label: "Done" },
] as const;

const normalize = (s: string) =>
  s === "to_do" ? "pending" : s === "done" ? "completed" : s;

const statusLeftBorder: Record<string, string> = {
  pending: "from-amber-400 to-orange-400",
  in_progress: "from-blue-500 to-indigo-500",
  completed: "from-emerald-500 to-teal-500",
};

export default function MemberDashboard() {
  const { user } = useSelector((s: RootState) => s.auth);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [updating, setUpdating] = useState<number | null>(null);

  // Bumped on every fetch start; only the latest response is allowed to write state.
  const reqIdRef = useRef(0);
  const inFlightRef = useRef(false);

  const fetchTasks = useCallback(async (silent = false) => {
    // Skip if a request is already running — prevents stale-response overwrites.
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    const myReqId = ++reqIdRef.current;

    if (silent) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await getUserTasksAPI();
      // Drop the response if a newer fetch has already started/finished.
      if (myReqId !== reqIdRef.current) return;
      setTasks(res.data.tasks || []);
      setError("");
    } catch (err) {
      if (myReqId === reqIdRef.current) setError(handleApiError(err));
    } finally {
      inFlightRef.current = false;
      if (myReqId === reqIdRef.current) {
        if (silent) setRefreshing(false);
        else setLoading(false);
      }
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Auto-refresh on tab visibility / window focus / online — covers all the cases
  // where polling alone wouldn't catch a fresh assignment immediately.
  useEffect(() => {
    const onWake = () => {
      if (document.visibilityState === "visible") fetchTasks(true);
    };
    document.addEventListener("visibilitychange", onWake);
    window.addEventListener("focus", onWake);
    window.addEventListener("online", onWake);
    return () => {
      document.removeEventListener("visibilitychange", onWake);
      window.removeEventListener("focus", onWake);
      window.removeEventListener("online", onWake);
    };
  }, [fetchTasks]);

  // Cross-tab notification: when admin assigns a task in another tab, refetch immediately.
  useEffect(() => {
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel("task-assignments");
      bc.onmessage = (e) => {
        if (e.data?.type === "assignment-changed") fetchTasks(true);
      };
    } catch {
      /* unsupported — polling is the fallback */
    }
    return () => {
      bc?.close();
    };
  }, [fetchTasks]);

  // Poll while page is visible so admin assignments show up within a few seconds.
  // Pausing while hidden avoids burning requests in background tabs.
  useEffect(() => {
    let id: number | undefined;
    const start = () => {
      stop();
      id = window.setInterval(() => fetchTasks(true), POLL_INTERVAL_MS);
    };
    const stop = () => {
      if (id !== undefined) {
        clearInterval(id);
        id = undefined;
      }
    };
    const onVis = () => {
      if (document.visibilityState === "visible") start();
      else stop();
    };
    if (document.visibilityState === "visible") start();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [fetchTasks]);

  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return {
      total: tasks.length,
      pending: tasks.filter((t) => normalize(t.status) === "pending").length,
      inProgress: tasks.filter((t) => normalize(t.status) === "in_progress")
        .length,
      done: tasks.filter((t) => normalize(t.status) === "completed").length,
      overdue: tasks.filter((t) => {
        if (!t.due_date || normalize(t.status) === "completed") return false;
        return new Date(t.due_date) < today;
      }).length,
    };
  }, [tasks]);

  const filtered = useMemo(() => {
    if (filter === "all") return tasks;
    return tasks.filter((t) => normalize(t.status) === filter);
  }, [tasks, filter]);

  const handleStatusChange = async (taskId: number, newStatus: string) => {
    setUpdating(taskId);
    try {
      await updateTaskAPI(taskId, { status: newStatus });
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)),
      );
      // Notify admin view (same browser, different tab) to refetch
      try {
        const bc = new BroadcastChannel("task-status");
        bc.postMessage({
          type: "status-changed",
          taskId,
          newStatus,
          at: Date.now(),
        });
        bc.close();
      } catch {
        /* unsupported */
      }
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setUpdating(null);
    }
  };

  if (loading) return <LoadingSpinner />;

  const greeting = (() => {
    const h = new Date().getHours();
    if (h >= 5 && h < 12) return { text: "Good morning", emoji: "☀️" };
    if (h >= 12 && h < 17) return { text: "Good afternoon", emoji: "🌤️" };
    if (h >= 17 && h < 21) return { text: "Good evening", emoji: "🌆" };
    return { text: "Good night", emoji: "🌙" };
  })();

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const statCards = [
    {
      label: "Total Tasks",
      value: stats.total,
      icon: CheckSquare,
      gradient: "from-purple-500 to-fuchsia-500",
      bg: "from-purple-50 to-fuchsia-50",
      border: "border-purple-100",
    },
    {
      label: "Pending",
      value: stats.pending,
      icon: AlertCircle,
      gradient: "from-amber-500 to-orange-500",
      bg: "from-amber-50 to-orange-50",
      border: "border-amber-100",
    },
    {
      label: "In Progress",
      value: stats.inProgress,
      icon: Clock,
      gradient: "from-blue-500 to-indigo-500",
      bg: "from-blue-50 to-indigo-50",
      border: "border-blue-100",
    },
    {
      label: "Completed",
      value: stats.done,
      icon: CheckCircle2,
      gradient: "from-emerald-500 to-teal-500",
      bg: "from-emerald-50 to-teal-50",
      border: "border-emerald-100",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-purple-600 via-purple-700 to-fuchsia-600 shadow-[0_20px_60px_-15px_rgba(124,58,237,0.5)]"
      >
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-fuchsia-400/25 blur-3xl" />
        <div className="absolute -bottom-16 -left-10 w-60 h-60 rounded-full bg-violet-500/15 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />
        <div className="relative px-7 sm:px-10 py-8 sm:py-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/20 text-xs font-medium text-white/90">
              <Calendar size={11} className="text-white/70" /> {today}
            </div>
            <button
              onClick={() => fetchTasks(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 border border-white/20 text-xs font-medium text-white/90 hover:bg-white/25 transition disabled:opacity-50"
            >
              <RefreshCw
                size={11}
                className={refreshing ? "animate-spin" : ""}
              />
              {refreshing ? "Refreshing…" : "Refresh"}
            </button>
          </div>
          <div className="flex items-center gap-2.5 mb-2">
            <span className="text-xl">{greeting.emoji}</span>
            <p className="text-purple-200 text-sm font-semibold">
              {greeting.text}
            </p>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
            {user?.name?.split(" ")[0]}
            <span className="text-fuchsia-200"> — your tasks</span>
          </h1>
          <p className="text-purple-200/70 flex items-center gap-2 text-sm">
            <Sparkles size={13} className="text-fuchsia-300" />
            {stats.total > 0
              ? `${stats.inProgress} in progress · ${stats.done} done${stats.overdue > 0 ? ` · ${stats.overdue} overdue` : ""}`
              : "No tasks assigned yet — check back soon"}
          </p>
        </div>
      </motion.div>

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Stats */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {statCards.map(({ label, value, icon: Icon, gradient, bg, border }) => (
          <motion.div
            key={label}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className={`group relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br ${bg} border ${border} shadow-sm hover:shadow-xl hover:shadow-purple-500/10 transition-all`}
          >
            <div className="flex items-start justify-between mb-4">
              <p className="text-neutral-600 text-sm font-semibold">{label}</p>
              <div
                className={`p-2.5 rounded-xl bg-gradient-to-br ${gradient} text-white shadow-md`}
              >
                <Icon size={16} />
              </div>
            </div>
            <p className="text-4xl font-extrabold text-neutral-900 tracking-tight">
              <AnimatedNumber value={value} />
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* Filter pills */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_TABS.map(({ key, label }) => {
          const active = filter === key;
          const count =
            key === "all"
              ? tasks.length
              : tasks.filter((t) => normalize(t.status) === key).length;
          return (
            <motion.button
              key={key}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-xl font-semibold text-sm transition border ${active ? "bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white border-transparent shadow-md" : "bg-white text-neutral-700 border-neutral-200 hover:border-purple-300 hover:text-purple-700"}`}
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
        {filtered.length === 0 ? (
          <div className="text-center py-16 rounded-2xl bg-white/60 border border-dashed border-purple-200">
            <CheckSquare size={32} className="mx-auto text-purple-300 mb-2" />
            <p className="text-neutral-600 font-medium">No tasks here</p>
            <p className="text-neutral-400 text-sm mt-1">
              Your admin will assign tasks to you
            </p>
          </div>
        ) : (
          filtered.map((task, i) => {
            const ns = normalize(task.status);
            const borderGradient =
              statusLeftBorder[ns] || statusLeftBorder.pending;
            const isOverdue =
              task.due_date &&
              ns !== "completed" &&
              new Date(task.due_date) < new Date();
            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="group relative rounded-2xl bg-white border border-neutral-100 p-5 shadow-sm hover:shadow-lg hover:shadow-purple-500/10 hover:border-purple-200 transition-all"
              >
                {/* Left accent bar */}
                <div
                  className={`absolute inset-y-0 left-0 w-1 bg-gradient-to-b ${borderGradient} opacity-80 group-hover:opacity-100 transition-opacity`}
                />

                <div className="flex items-start gap-4 pl-2">
                  {/* Status dropdown — only action for members */}
                  <div className="flex-shrink-0 w-36">
                    <CustomSelect
                      value={ns}
                      onChange={(v) => handleStatusChange(task.id, v)}
                      options={STATUS_OPTS}
                      disabled={updating === task.id}
                      size="sm"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3
                      className={`font-bold text-neutral-900 text-sm ${ns === "completed" ? "line-through text-neutral-400" : ""}`}
                    >
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className="text-sm text-neutral-500 mt-0.5 line-clamp-2">
                        {task.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-3 items-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${priorityStyle[task.priority] || priorityStyle.medium}`}
                      >
                        <Flag size={9} />{" "}
                        {task.priority?.charAt(0).toUpperCase() +
                          task.priority?.slice(1)}
                      </span>
                      {task.due_date && (
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-medium ${isOverdue ? "text-red-600" : "text-neutral-500"}`}
                        >
                          <Calendar size={10} />
                          {new Date(task.due_date).toLocaleDateString(
                            undefined,
                            { month: "short", day: "numeric", year: "numeric" },
                          )}
                          {isOverdue && (
                            <span className="ml-0.5 text-red-500 font-bold">
                              · Overdue
                            </span>
                          )}
                        </span>
                      )}
                      {task.project_name && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold border border-purple-100">
                          {task.project_name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
