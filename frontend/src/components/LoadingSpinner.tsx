import { motion } from "framer-motion";

export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100">
      <div className="flex flex-col items-center gap-5">
        <div className="relative w-14 h-14">
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border-4 border-purple-200 border-t-purple-600 rounded-full"
          />
          <motion.span
            animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
            className="absolute inset-2 rounded-full bg-purple-500"
          />
        </div>
        <p className="text-neutral-600 font-medium tracking-wide">Loading...</p>
      </div>
    </div>
  );
}
