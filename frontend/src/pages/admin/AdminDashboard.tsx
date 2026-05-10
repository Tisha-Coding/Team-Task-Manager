import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import {
  Users,
  CheckSquare,
  AlertCircle,
  TrendingUp,
  Sparkles,
  Calendar,
  Crown,
  CheckCircle2,
  Clock,
  ListTodo,
} from "lucide-react";
import { getAdminStatsAPI, handleApiError } from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";

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

function getGreeting(): { text: string; emoji: string; sub: string } {
  const h = new Date().getHours();
  if (h >= 5 && h < 12)
    return { text: "Good morning", emoji: "☀️", sub: "Start your day strong" };
  if (h >= 12 && h < 17)
    return {
      text: "Good afternoon",
      emoji: "🌤️",
      sub: "Keep the momentum going",
    };
  if (h >= 17 && h < 21)
    return { text: "Good evening", emoji: "🌆", sub: "Wrapping up the day" };
  return { text: "Good night", emoji: "🌙", sub: "Late hours, great work" };
}

export default function AdminDashboard() {
  const { user } = useSelector((s: RootState) => s.auth);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const greeting = getGreeting();

  useEffect(() => {
    (async () => {
      try {
        const res = await getAdminStatsAPI();
        setStats(res.data.stats);
      } catch (err) {
        setError(handleApiError(err));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <LoadingSpinner />;

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const byStatus = stats?.byStatus || {};
  const completed = (byStatus["completed"] || 0) + (byStatus["done"] || 0);
  const inProgress = byStatus["in_progress"] || 0;
  const pending = (byStatus["pending"] || 0) + (byStatus["to_do"] || 0);
  const overdue = stats?.overdue || 0;
  const totalTasks = stats?.totalTasks || 0;
  const tasksPerUser: any[] = stats?.tasksPerUser || [];
  const maxTasks = Math.max(1, ...tasksPerUser.map((u: any) => u.task_count));

  const cards = [
    {
      label: "Total Tasks",
      value: totalTasks,
      icon: CheckSquare,
      gradient: "from-purple-500 to-fuchsia-500",
      bg: "from-purple-50 to-fuchsia-50",
      border: "border-purple-100",
    },
    {
      label: "Completed",
      value: completed,
      icon: CheckCircle2,
      gradient: "from-emerald-500 to-teal-500",
      bg: "from-emerald-50 to-teal-50",
      border: "border-emerald-100",
    },
    {
      label: "In Progress",
      value: inProgress,
      icon: Clock,
      gradient: "from-blue-500 to-indigo-500",
      bg: "from-blue-50 to-indigo-50",
      border: "border-blue-100",
    },
    {
      label: "Pending",
      value: pending,
      icon: ListTodo,
      gradient: "from-amber-500 to-orange-500",
      bg: "from-amber-50 to-orange-50",
      border: "border-amber-100",
    },
    {
      label: "Overdue",
      value: overdue,
      icon: AlertCircle,
      gradient: "from-rose-500 to-red-500",
      bg: "from-rose-50 to-red-50",
      border: "border-rose-100",
    },
    {
      label: "My Projects",
      value: stats?.totalProjects || 0,
      icon: Users,
      gradient: "from-violet-500 to-purple-600",
      bg: "from-violet-50 to-purple-50",
      border: "border-violet-100",
    },
  ];

  const statusBars = [
    {
      key: "completed",
      label: "Completed",
      count: completed,
      dot: "bg-emerald-500",
      bar: "from-emerald-400 to-teal-500",
      pill: "bg-emerald-50 border-emerald-200 text-emerald-700",
    },
    {
      key: "in_progress",
      label: "In Progress",
      count: inProgress,
      dot: "bg-blue-500",
      bar: "from-blue-500 to-indigo-500",
      pill: "bg-blue-50 border-blue-200 text-blue-700",
    },
    {
      key: "pending",
      label: "To Do",
      count: pending,
      dot: "bg-amber-400",
      bar: "from-amber-400 to-orange-400",
      pill: "bg-amber-50 border-amber-200 text-amber-700",
    },
    {
      key: "overdue",
      label: "Overdue",
      count: overdue,
      dot: "bg-rose-500",
      bar: "from-rose-500 to-red-500",
      pill: "bg-rose-50 border-rose-200 text-rose-700",
    },
  ];

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 overflow-hidden">
      <motion.div
        animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-32 -right-20 w-[28rem] h-[28rem] rounded-full bg-gradient-to-br from-purple-300 to-fuchsia-200 opacity-20 blur-3xl pointer-events-none"
      />

      {/* Hero banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 rounded-3xl overflow-hidden bg-gradient-to-br from-purple-600 via-purple-700 to-fuchsia-600 shadow-[0_20px_60px_-15px_rgba(124,58,237,0.5)]"
      >
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-fuchsia-400/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-12 w-72 h-72 rounded-full bg-violet-500/15 blur-3xl pointer-events-none" />
        <div
          className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative px-7 sm:px-10 py-8 sm:py-10">
          {/* Top row */}
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur border border-white/20 text-xs font-medium text-white/90">
              <Calendar size={12} className="text-white/70" />
              {today}
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-300/20 border border-amber-300/30 text-xs font-semibold text-amber-100">
              <Crown size={11} className="text-amber-300" />
              Admin Console
            </div>
          </div>

          {/* Main content */}
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5 mb-3">
                <span className="text-2xl" role="img" aria-label="greeting">
                  {greeting.emoji}
                </span>
                <div>
                  <p className="text-purple-200 text-sm font-semibold leading-none">
                    {greeting.text}
                  </p>
                  <p className="text-purple-300/60 text-xs mt-0.5">
                    {greeting.sub}
                  </p>
                </div>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2 leading-tight">
                {user?.name?.split(" ")[0]}
                <span className="text-fuchsia-200"> &mdash; </span>
                <span className="text-white/70 text-2xl font-semibold">
                  welcome back
                </span>
              </h1>
              <p className="text-purple-200/70 text-sm flex items-center gap-1.5">
                <Sparkles
                  size={13}
                  className="text-fuchsia-300 flex-shrink-0"
                />
                Here's your system overview for today
              </p>
            </div>

            {/* Quick-look stat pills */}
            <div className="hidden sm:flex gap-3 flex-shrink-0">
              {[
                {
                  label: "Total Tasks",
                  val: totalTasks,
                  sub: `${completed} done`,
                  color: "text-fuchsia-100",
                },
                {
                  label: "My Projects",
                  val: stats?.totalProjects || 0,
                  sub: "active projects",
                  color: "text-amber-100",
                },
              ].map(({ label, val, sub, color }) => (
                <div
                  key={label}
                  className="text-center px-5 py-3.5 rounded-2xl bg-white/10 backdrop-blur border border-white/15"
                >
                  <p
                    className={`text-2xl font-extrabold ${color} leading-none`}
                  >
                    {val}
                  </p>
                  <p className="text-white/50 text-[11px] mt-1 font-medium">
                    {label}
                  </p>
                  <p className="text-white/35 text-[10px]">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* 6 stat cards */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
        className="relative z-10 grid grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {cards.map(({ label, value, icon: Icon, gradient, bg, border }) => (
          <motion.div
            key={label}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className={`group relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br ${bg} border ${border} shadow-sm hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300`}
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-white/30 to-transparent rounded-2xl" />
            <div className="relative flex items-start justify-between mb-4">
              <p className="text-neutral-600 text-sm font-semibold leading-tight">
                {label}
              </p>
              <motion.div
                whileHover={{ rotate: 12, scale: 1.1 }}
                className={`p-2.5 rounded-xl bg-gradient-to-br ${gradient} text-white shadow-md flex-shrink-0`}
              >
                <Icon size={16} />
              </motion.div>
            </div>
            <p className="text-4xl font-extrabold text-neutral-900 tracking-tight">
              <AnimatedNumber value={value} />
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
        {/* Tasks by status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl bg-white border border-purple-100 p-6 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-500 text-white shadow-md">
              <CheckSquare size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900">
                Tasks by Status
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                {totalTasks} tasks in your projects
              </p>
            </div>
          </div>

          {totalTasks === 0 ? (
            <div className="text-center py-8 text-sm text-neutral-400">
              No tasks created yet
            </div>
          ) : (
            <div className="space-y-5">
              {statusBars.map(({ key, label, count, dot, bar, pill }) => {
                const pct =
                  totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dot}`}
                        />
                        <span className="text-sm font-semibold text-neutral-700">
                          {label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${pill}`}
                        >
                          {count}
                        </span>
                        <span className="text-xs text-neutral-400 tabular-nums w-8 text-right">
                          {pct}%
                        </span>
                      </div>
                    </div>
                    <div className="h-2.5 rounded-full bg-neutral-100 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{
                          duration: 1.1,
                          ease: "easeOut",
                          delay: 0.3,
                        }}
                        className={`h-full rounded-full bg-gradient-to-r ${bar}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Tasks per member */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl bg-white border border-purple-100 p-6 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-md">
              <TrendingUp size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900">
                Tasks per Member
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                {tasksPerUser.length} member
                {tasksPerUser.length !== 1 ? "s" : ""} with assigned tasks
              </p>
            </div>
          </div>

          {tasksPerUser.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-3 shadow-sm">
                <Users size={24} className="text-blue-400" />
              </div>
              <p className="text-sm font-semibold text-neutral-600">
                No members assigned yet
              </p>
              <p className="text-xs text-neutral-400 mt-1 max-w-[200px]">
                Assign tasks to team members to see workload distribution here
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {tasksPerUser.slice(0, 8).map((u: any, i: number) => (
                <motion.div
                  key={u.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + i * 0.05 }}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-purple-50/60 transition group"
                >
                  <span className="w-6 text-center text-sm flex-shrink-0">
                    {i === 0 ? (
                      "🥇"
                    ) : i === 1 ? (
                      "🥈"
                    ) : i === 2 ? (
                      "🥉"
                    ) : (
                      <span className="text-xs font-bold text-neutral-400">
                        {i + 1}
                      </span>
                    )}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-500 text-white flex items-center justify-center text-xs font-bold shadow flex-shrink-0">
                    {u.name?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-sm font-semibold text-neutral-900 truncate">
                        {u.name}
                      </span>
                      <span className="text-xs font-bold text-purple-700 ml-2 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100 flex-shrink-0">
                        {u.task_count} task{u.task_count !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-neutral-100 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${(u.task_count / maxTasks) * 100}%`,
                        }}
                        transition={{
                          duration: 1,
                          ease: "easeOut",
                          delay: 0.4 + i * 0.05,
                        }}
                        className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-full"
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
