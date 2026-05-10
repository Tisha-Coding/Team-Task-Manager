import { motion } from "framer-motion";
import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glass?: boolean;
}

export default function Card({
  children,
  className = "",
  hover = true,
  glass = false,
}: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover={hover ? { y: -4 } : {}}
      className={`
        rounded-2xl border transition-all duration-300
        ${
          glass
            ? "bg-white/80 backdrop-blur-xl border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.18)] hover:shadow-[0_12px_40px_0_rgba(31,38,135,0.25)] hover:border-purple-200"
            : "bg-white border-neutral-100 shadow-md hover:shadow-lg hover:border-neutral-200"
        }
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}
