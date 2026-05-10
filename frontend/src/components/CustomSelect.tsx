import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
  dot?: string; // tailwind bg-* color class for a dot indicator
}

interface Props {
  value: string;
  onChange: (v: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  size?: "sm" | "md";
  dropUp?: boolean;
  className?: string;
}

export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "Select…",
  disabled,
  size = "md",
  dropUp,
  className,
}: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const isSm = size === "sm";

  return (
    <div ref={ref} className={`relative ${className ?? ""}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        className={`
          w-full flex items-center gap-2 bg-white border rounded-xl font-medium transition-all
          focus:outline-none focus:ring-4 focus:ring-purple-500/15
          ${isSm ? "px-2.5 py-1.5 text-xs" : "px-3.5 py-2.5 text-sm"}
          ${open ? "border-purple-500 ring-4 ring-purple-500/15" : "border-neutral-200 hover:border-purple-300"}
          ${disabled ? "bg-neutral-50 cursor-not-allowed opacity-60" : "cursor-pointer"}
        `}
      >
        {selected?.dot && (
          <span
            className={`w-2 h-2 rounded-full flex-shrink-0 ${selected.dot}`}
          />
        )}
        <span
          className={`flex-1 text-left ${selected ? "text-neutral-800" : "text-neutral-400"}`}
        >
          {selected?.label ?? placeholder}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown
            size={isSm ? 12 : 14}
            className="text-neutral-400 flex-shrink-0"
          />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: dropUp ? 4 : -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: dropUp ? 4 : -4, scale: 0.97 }}
            transition={{ duration: 0.13 }}
            className={`
              absolute left-0 z-[200] min-w-full bg-white rounded-xl border border-purple-100
              shadow-xl shadow-purple-500/15 overflow-hidden
              ${dropUp ? "bottom-full mb-1.5" : "top-full mt-1.5"}
            `}
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`
                  w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm font-medium transition-colors text-left
                  ${
                    opt.value === value
                      ? "bg-gradient-to-r from-purple-50 to-fuchsia-50 text-purple-700"
                      : "text-neutral-700 hover:bg-purple-50/60 hover:text-purple-700"
                  }
                `}
              >
                {opt.dot && (
                  <span
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${opt.dot}`}
                  />
                )}
                <span className="flex-1">{opt.label}</span>
                {opt.value === value && (
                  <Check size={13} className="text-purple-600 flex-shrink-0" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
