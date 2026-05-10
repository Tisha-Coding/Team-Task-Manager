import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  Shield,
  Users,
  CheckCircle2,
} from "lucide-react";

const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
const passwordRegex =
  /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

export default function Signup() {
  const navigate = useNavigate();
  const { signup, isLoading } = useAuth();
  const [role, setRole] = useState<"member" | "admin">("member");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [formError, setFormError] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!formError) return;
    const t = setTimeout(() => setFormError(""), 4000);
    return () => {
      clearTimeout(t);
      setFormError("");
    };
  }, [formError]);

  useEffect(() => {
    return () => setFormError("");
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setFormError("Please fill all fields");
      return;
    }
    if (!emailRegex.test(formData.email)) {
      setFormError("Email must be a valid Gmail address (e.g. you@gmail.com)");
      return;
    }
    if (!passwordRegex.test(formData.password)) {
      setFormError(
        "Password must be at least 8 characters and include letters, numbers & special characters",
      );
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setFormError("Passwords do not match");
      return;
    }

    const result = await signup(
      formData.name,
      formData.email,
      formData.password,
      formData.confirmPassword,
      role,
    );
    if (result?.success) {
      setToast("Account created successfully! Redirecting to login...");
      setTimeout(() => {
        navigate("/login", {
          state: { signupSuccess: true, email: formData.email },
        });
      }, 1800);
    } else {
      setFormError(result?.error || "Signup failed");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const fields = [
    {
      name: "name",
      label: "Full Name",
      type: "text",
      placeholder: "John Doe",
      Icon: User,
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      placeholder: "you@gmail.com",
      Icon: Mail,
    },
    {
      name: "password",
      label: "Password",
      type: "password",
      placeholder: "••••••••",
      Icon: Lock,
    },
    {
      name: "confirmPassword",
      label: "Confirm Password",
      type: "password",
      placeholder: "••••••••",
      Icon: Lock,
    },
  ] as const;

  return (
    <>
      {/* Floating toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -70, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -70, scale: 0.85 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-purple-600 to-fuchsia-600 text-white shadow-2xl shadow-purple-500/50 border border-white/20 backdrop-blur-sm"
          >
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 size={16} className="text-white" />
            </div>
            <span className="font-semibold text-sm whitespace-nowrap">
              {toast}
            </span>
            <motion.div
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 1.8, ease: "linear" }}
              className="absolute bottom-0 left-0 h-0.5 bg-white/40 rounded-b-2xl"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="min-h-screen relative flex items-center justify-center px-4 py-10 overflow-hidden bg-white">
        <div
          className="absolute inset-0 opacity-[0.3] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, #c4b5fd 1px, transparent 1px)",
            backgroundSize: "22px 22px",
            maskImage:
              "radial-gradient(ellipse at center, black 40%, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at center, black 40%, transparent 75%)",
          }}
        />
        <motion.div
          animate={{ x: [0, 60, 0], y: [0, -40, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-32 -left-32 w-[28rem] h-[28rem] rounded-full bg-gradient-to-br from-purple-400 to-fuchsia-300 opacity-35 blur-3xl pointer-events-none"
        />
        <motion.div
          animate={{ x: [0, -50, 0], y: [0, 50, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-32 -right-32 w-[30rem] h-[30rem] rounded-full bg-gradient-to-br from-violet-300 to-purple-500 opacity-35 blur-3xl pointer-events-none"
        />

        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 w-full max-w-md"
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                delay: 0.2,
                type: "spring",
                stiffness: 200,
                damping: 15,
              }}
              className="relative inline-flex items-center justify-center w-16 h-16 mb-5 rounded-2xl bg-gradient-to-br from-purple-600 via-purple-500 to-fuchsia-500 shadow-lg shadow-purple-500/40"
            >
              <span className="text-3xl">📋</span>
              <motion.span
                animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="absolute inset-0 rounded-2xl bg-purple-500"
              />
            </motion.div>
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-neutral-900 via-purple-700 to-neutral-900 bg-clip-text text-transparent mb-2">
              Create account
            </h1>
            <p className="text-neutral-600 inline-flex items-center gap-1.5">
              <Sparkles size={14} className="text-purple-500" /> Join TaskHub
              today
            </p>
          </div>

          <motion.div className="relative rounded-3xl bg-white/70 backdrop-blur-2xl border border-white/60 p-8 shadow-[0_20px_60px_-15px_rgba(124,58,237,0.35)] overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-500/60 to-transparent" />

            {/* Role selector */}
            <div className="mb-6">
              <p className="text-sm font-semibold text-neutral-700 mb-3">
                Select your role
              </p>
              <div className="grid grid-cols-2 gap-3">
                {(
                  [
                    {
                      key: "member",
                      label: "Member",
                      sublabel: "Team collaborator",
                      Icon: Users,
                    },
                    {
                      key: "admin",
                      label: "Admin",
                      sublabel: "System administrator",
                      Icon: Shield,
                    },
                  ] as const
                ).map(({ key, label, sublabel, Icon }) => {
                  const active = role === key;
                  return (
                    <motion.button
                      key={key}
                      type="button"
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setRole(key)}
                      className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl transition-all duration-200 cursor-pointer text-center ${
                        active
                          ? "bg-gradient-to-br from-purple-50 to-fuchsia-50 shadow-lg shadow-purple-500/20 ring-2 ring-purple-500"
                          : "bg-white border border-neutral-200 hover:border-purple-300 hover:shadow-md"
                      }`}
                    >
                      <div
                        className={`p-2.5 rounded-xl transition-all ${active ? "bg-gradient-to-br from-purple-600 to-fuchsia-500 text-white shadow-md shadow-purple-500/30" : "bg-neutral-100 text-neutral-400"}`}
                      >
                        <Icon size={20} />
                      </div>
                      <div>
                        <p
                          className={`text-sm font-bold ${active ? "text-purple-700" : "text-neutral-700"}`}
                        >
                          {label}
                        </p>
                        <p className="text-[11px] text-neutral-500 leading-tight mt-0.5">
                          {sublabel}
                        </p>
                      </div>
                      {active && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center shadow-sm"
                        >
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            viewBox="0 0 12 12"
                          >
                            <path
                              d="M2.5 6l2.5 2.5L9.5 3.5"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            <AnimatePresence>
              {formError && (
                <motion.div
                  initial={{ opacity: 0, y: -8, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -8, height: 0 }}
                  className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-start gap-2"
                >
                  <span>⚠️</span>
                  <span>{formError}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4">
              {fields.map((f, i) => {
                const isFocused = focusedField === f.name;
                return (
                  <motion.div
                    key={f.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.06 }}
                  >
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      {f.label}
                    </label>
                    <div className="relative">
                      <motion.div
                        animate={{ color: isFocused ? "#9333ea" : "#9ca3af" }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                      >
                        <f.Icon size={18} />
                      </motion.div>
                      <input
                        type={f.type}
                        name={f.name}
                        value={formData[f.name as keyof typeof formData]}
                        onChange={handleChange}
                        onFocus={() => setFocusedField(f.name)}
                        onBlur={() => setFocusedField(null)}
                        placeholder={f.placeholder}
                        disabled={isLoading || !!toast}
                        className="w-full pl-12 pr-4 py-3 bg-white/80 border border-neutral-200 rounded-xl text-neutral-900 placeholder-neutral-400 shadow-sm focus:outline-none focus:ring-4 focus:ring-purple-500/15 focus:border-purple-500 transition-all disabled:bg-neutral-100"
                      />
                    </div>
                    {f.name === "password" && (
                      <p className="mt-1 text-[11px] text-neutral-400">
                        Min 8 chars · letters + numbers + special characters
                      </p>
                    )}
                  </motion.div>
                );
              })}

              <motion.button
                type="submit"
                disabled={isLoading || !!toast}
                whileHover={{ scale: isLoading || !!toast ? 1 : 1.02 }}
                whileTap={{ scale: isLoading || !!toast ? 1 : 0.98 }}
                className="relative w-full mt-2 py-3.5 px-4 rounded-xl font-semibold text-white overflow-hidden bg-gradient-to-r from-purple-600 via-purple-600 to-fuchsia-600 shadow-lg shadow-purple-500/40 hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed group"
              >
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                <span className="relative flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full"
                      />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create {role === "admin" ? "Admin" : "Member"} Account
                      <motion.span
                        animate={{ x: [0, 4, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <ArrowRight size={18} />
                      </motion.span>
                    </>
                  )}
                </span>
              </motion.button>
            </form>

            <div className="my-6 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white/70 backdrop-blur text-neutral-500">
                  Already have an account?
                </span>
              </div>
            </div>

            <Link
              to="/login"
              className="block w-full text-center py-3 px-4 rounded-xl font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 hover:border-purple-300 transition-all"
            >
              Sign in instead
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
}
