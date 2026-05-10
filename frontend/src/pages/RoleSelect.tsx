import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, User, ArrowRight, Sparkles, CheckCircle } from "lucide-react";

const roles = [
  {
    key: "user",
    label: "Continue as User",
    sublabel: "Team Member Portal",
    icon: User,
    gradient: "from-purple-600 via-purple-500 to-fuchsia-500",
    shadow: "shadow-purple-500/40",
    border: "border-purple-200",
    hoverBorder: "hover:border-purple-400",
    bg: "from-purple-50 to-fuchsia-50",
    badge: "bg-purple-100 text-purple-700",
    perks: [
      "Manage your tasks",
      "Join & create projects",
      "Collaborate with team",
    ],
  },
  {
    key: "admin",
    label: "Continue as Admin",
    sublabel: "Administrator Portal",
    icon: Shield,
    gradient: "from-violet-700 via-purple-700 to-indigo-600",
    shadow: "shadow-violet-500/40",
    border: "border-violet-200",
    hoverBorder: "hover:border-violet-400",
    bg: "from-violet-50 to-indigo-50",
    badge: "bg-violet-100 text-violet-700",
    perks: ["Full system oversight", "User management", "Analytics & stats"],
  },
] as const;

export default function RoleSelect() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center px-4 py-10 overflow-hidden bg-white">
      {/* Animated background blobs */}
      <div
        className="absolute inset-0 opacity-[0.3] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, #c4b5fd 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          maskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />
      <motion.div
        animate={{ x: [0, 60, 0], y: [0, -40, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-40 -left-40 w-[32rem] h-[32rem] rounded-full bg-gradient-to-br from-purple-400 to-fuchsia-300 opacity-35 blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{ x: [0, -50, 0], y: [0, 50, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-40 -right-40 w-[36rem] h-[36rem] rounded-full bg-gradient-to-br from-violet-300 to-indigo-400 opacity-35 blur-3xl pointer-events-none"
      />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 text-center mb-12"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            delay: 0.1,
            type: "spring",
            stiffness: 200,
            damping: 15,
          }}
          className="relative inline-flex items-center justify-center w-20 h-20 mb-6 rounded-3xl bg-gradient-to-br from-purple-600 via-purple-500 to-fuchsia-500 shadow-2xl shadow-purple-500/40"
        >
          <span className="text-4xl">📋</span>
          <motion.span
            animate={{ scale: [1, 1.6, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut" }}
            className="absolute inset-0 rounded-3xl bg-purple-500"
          />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-r from-neutral-900 via-purple-700 to-neutral-900 bg-clip-text text-transparent mb-3"
        >
          TaskHub
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="text-neutral-600 text-lg inline-flex items-center gap-2"
        >
          <Sparkles size={16} className="text-purple-500" />
          Select your portal to continue
        </motion.p>
      </motion.div>

      {/* Role cards */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
        {roles.map((role, i) => {
          const Icon = role.icon;
          return (
            <motion.button
              key={role.key}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.4 + i * 0.1,
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1],
              }}
              whileHover={{
                y: -6,
                transition: { type: "spring", stiffness: 300, damping: 20 },
              }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/login", { state: { role: role.key } })}
              className={`group relative text-left rounded-3xl bg-white border-2 ${role.border} ${role.hoverBorder} p-7 shadow-sm hover:shadow-2xl ${role.shadow} transition-all duration-300 overflow-hidden cursor-pointer`}
            >
              {/* Gradient top bar */}
              <div
                className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${role.gradient} scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300`}
              />

              {/* Background gradient on hover */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${role.bg} opacity-0 group-hover:opacity-60 transition-opacity duration-300`}
              />

              <div className="relative">
                {/* Icon + Badge */}
                <div className="flex items-start justify-between mb-5">
                  <motion.div
                    whileHover={{ rotate: [0, -8, 8, 0] }}
                    transition={{ duration: 0.4 }}
                    className={`p-3.5 rounded-2xl bg-gradient-to-br ${role.gradient} shadow-lg ${role.shadow}`}
                  >
                    <Icon size={28} className="text-white" />
                  </motion.div>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${role.badge}`}
                  >
                    {role.sublabel}
                  </span>
                </div>

                {/* Title */}
                <h2 className="text-xl font-bold text-neutral-900 mb-1">
                  {role.label}
                </h2>

                {/* Perks */}
                <ul className="space-y-1.5 mt-4 mb-6">
                  {role.perks.map((perk) => (
                    <li
                      key={perk}
                      className="flex items-center gap-2 text-sm text-neutral-600"
                    >
                      <CheckCircle
                        size={14}
                        className="text-purple-500 flex-shrink-0"
                      />
                      {perk}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <div
                  className={`inline-flex items-center gap-2 font-semibold text-sm bg-gradient-to-r ${role.gradient} bg-clip-text text-transparent`}
                >
                  Get started
                  <motion.span
                    animate={{ x: [0, 4, 0] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <ArrowRight size={16} className="text-purple-600" />
                  </motion.span>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="relative z-10 mt-10 text-sm text-neutral-500"
      >
        Don't have an account?{" "}
        <button
          onClick={() => navigate("/signup")}
          className="text-purple-600 font-semibold hover:text-purple-700 underline underline-offset-2"
        >
          Sign up for free
        </button>
      </motion.p>
    </div>
  );
}
