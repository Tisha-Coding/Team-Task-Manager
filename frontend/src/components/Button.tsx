import { motion } from "framer-motion";
import React from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
}

const variantStyles = {
  primary:
    "bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 shadow-lg hover:shadow-purple-500/40",
  secondary:
    "bg-white border border-neutral-200 text-neutral-900 hover:bg-neutral-50 hover:border-neutral-300",
  ghost: "bg-transparent text-neutral-700 hover:bg-neutral-100",
  danger:
    "bg-red-500 text-white hover:bg-red-600 shadow-lg hover:shadow-red-500/40",
};

const sizeStyles = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  className = "",
  type = "button",
  onClick,
}: ButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={`
        rounded-lg font-medium transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <motion.div
            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity }}
          />
          Loading...
        </span>
      ) : (
        children
      )}
    </motion.button>
  );
}
