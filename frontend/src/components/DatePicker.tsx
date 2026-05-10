import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Calendar, X } from "lucide-react";

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

interface Props {
  value: string;
  onChange: (v: string) => void;
  min?: string;
  placeholder?: string;
  dropUp?: boolean;
  className?: string;
}

const PANEL_WIDTH = 288;
const PANEL_HEIGHT = 360;
const PADDING = 8;
const GUTTER = 8;

export default function DatePicker({
  value,
  onChange,
  min,
  placeholder = "Pick a date",
  dropUp,
  className,
}: Props) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [panelPos, setPanelPos] = useState<React.CSSProperties | null>(null);

  const todayDate = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const minDate = useMemo(() => {
    if (!min) return null;
    const d = new Date(min + "T00:00:00");
    d.setHours(0, 0, 0, 0);
    return d;
  }, [min]);

  const selectedDate = useMemo(() => {
    if (!value) return null;
    const d = new Date(value + "T00:00:00");
    d.setHours(0, 0, 0, 0);
    return d;
  }, [value]);

  const [viewYear, setViewYear] = useState(
    () => selectedDate?.getFullYear() ?? todayDate.getFullYear(),
  );
  const [viewMonth, setViewMonth] = useState(
    () => selectedDate?.getMonth() ?? todayDate.getMonth(),
  );

  useEffect(() => {
    if (selectedDate) {
      setViewYear(selectedDate.getFullYear());
      setViewMonth(selectedDate.getMonth());
    }
  }, [value]);

  // Compute panel position from current trigger rect (synchronous, no flash)
  const computePos = useCallback((): React.CSSProperties => {
    if (!containerRef.current) return {};
    const rect = containerRef.current.getBoundingClientRect();
    const spaceAbove = rect.top;
    const spaceBelow = window.innerHeight - rect.bottom;

    const placeAbove = dropUp
      ? spaceAbove >= PANEL_HEIGHT + PADDING || spaceAbove >= spaceBelow
      : !(spaceBelow >= PANEL_HEIGHT + PADDING) && spaceAbove > spaceBelow;

    const rightOffset = window.innerWidth - rect.right;
    const fitsRightAnchored = rect.right - PANEL_WIDTH >= GUTTER;
    const horiz: React.CSSProperties = fitsRightAnchored
      ? { right: Math.max(GUTTER, rightOffset) }
      : { left: Math.max(GUTTER, rect.left) };

    if (placeAbove) {
      return {
        position: "fixed",
        bottom: window.innerHeight - rect.top + PADDING,
        ...horiz,
        maxHeight: Math.max(160, spaceAbove - PADDING - GUTTER),
        zIndex: 9999,
      };
    }
    return {
      position: "fixed",
      top: rect.bottom + PADDING,
      ...horiz,
      maxHeight: Math.max(160, spaceBelow - PADDING - GUTTER),
      zIndex: 9999,
    };
  }, [dropUp]);

  // Toggle: pre-compute position BEFORE opening — eliminates first-paint flash
  const toggleOpen = () => {
    if (!open) setPanelPos(computePos());
    setOpen((v) => !v);
  };

  // Reposition while open (scroll/resize)
  useEffect(() => {
    if (!open) return;
    const update = () => setPanelPos(computePos());
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open, computePos]);

  // Outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        !(target as HTMLElement).closest?.("[data-datepicker-panel]")
      )
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const calCells = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return cells;
  }, [viewYear, viewMonth]);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
  };

  const isCellDisabled = (day: number) => {
    if (!minDate) return false;
    const d = new Date(viewYear, viewMonth, day);
    d.setHours(0, 0, 0, 0);
    return d < minDate;
  };
  const isCellSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getFullYear() === viewYear &&
      selectedDate.getMonth() === viewMonth &&
      selectedDate.getDate() === day
    );
  };
  const isCellToday = (day: number) => {
    return (
      todayDate.getFullYear() === viewYear &&
      todayDate.getMonth() === viewMonth &&
      todayDate.getDate() === day
    );
  };

  const selectDay = (day: number) => {
    if (isCellDisabled(day)) return;
    const y = viewYear;
    const m = String(viewMonth + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    onChange(`${y}-${m}-${d}`);
    setOpen(false);
  };

  const selectToday = useCallback(() => {
    const isTodayDisabled = minDate && todayDate < minDate;
    if (!isTodayDisabled) {
      const y = todayDate.getFullYear();
      const m = String(todayDate.getMonth() + 1).padStart(2, "0");
      const d = String(todayDate.getDate()).padStart(2, "0");
      onChange(`${y}-${m}-${d}`);
      setOpen(false);
    } else {
      setViewYear(todayDate.getFullYear());
      setViewMonth(todayDate.getMonth());
    }
  }, [todayDate, minDate, onChange]);

  const jumpToMonth = () => {
    setViewYear(todayDate.getFullYear());
    setViewMonth(todayDate.getMonth());
  };

  const displayLabel = selectedDate
    ? selectedDate.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <div ref={containerRef} className={`relative ${className ?? ""}`}>
      <button
        type="button"
        onClick={toggleOpen}
        className={`
          w-full flex items-center gap-2.5 px-3.5 py-2.5 bg-white border rounded-xl text-sm
          transition-all focus:outline-none focus:ring-4 focus:ring-purple-500/15 cursor-pointer
          ${open ? "border-purple-500 ring-4 ring-purple-500/15" : "border-neutral-200 hover:border-purple-300"}
        `}
      >
        <Calendar
          size={15}
          className={
            displayLabel
              ? "text-purple-500 flex-shrink-0"
              : "text-neutral-400 flex-shrink-0"
          }
        />
        <span
          className={`flex-1 text-left font-medium ${displayLabel ? "text-neutral-800" : "text-neutral-400"}`}
        >
          {displayLabel || placeholder}
        </span>
        {displayLabel && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
            }}
            className="p-0.5 rounded text-neutral-300 hover:text-neutral-600 transition flex-shrink-0"
          >
            <X size={13} />
          </button>
        )}
      </button>

      <AnimatePresence>
        {open && panelPos && (
          <motion.div
            data-datepicker-panel
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            style={{ ...panelPos, width: PANEL_WIDTH }}
            className="bg-white rounded-2xl border border-purple-100 shadow-2xl shadow-purple-500/20 overflow-y-auto"
          >
            <div className="flex items-center justify-between px-4 py-3.5 bg-gradient-to-r from-purple-600 to-fuchsia-600">
              <button
                type="button"
                onClick={prevMonth}
                className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/15 transition"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={jumpToMonth}
                className="text-sm font-bold text-white hover:text-fuchsia-200 transition"
              >
                {MONTHS[viewMonth]} {viewYear}
              </button>
              <button
                type="button"
                onClick={nextMonth}
                className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/15 transition"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="grid grid-cols-7 px-3 pt-3 pb-1 bg-purple-50/60">
              {DAYS.map((d) => (
                <div
                  key={d}
                  className="text-center text-[11px] font-bold text-purple-500 py-1"
                >
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 px-3 py-2 gap-y-1">
              {calCells.map((day, i) => {
                if (!day) return <div key={`_${i}`} />;
                const disabled = isCellDisabled(day);
                const selected = isCellSelected(day);
                const today = isCellToday(day);
                return (
                  <button
                    key={day}
                    type="button"
                    disabled={disabled}
                    onClick={() => selectDay(day)}
                    className={`
                      mx-auto w-8 h-8 rounded-full text-[13px] font-semibold transition-all flex items-center justify-center
                      ${
                        selected
                          ? "bg-gradient-to-br from-purple-600 to-fuchsia-500 text-white shadow-md shadow-purple-400/40"
                          : today
                            ? "border-2 border-purple-400 text-purple-700"
                            : disabled
                              ? "text-neutral-200 cursor-not-allowed"
                              : "text-neutral-700 hover:bg-purple-100 hover:text-purple-700 cursor-pointer"
                      }
                    `}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            <div className="border-t border-purple-100 px-4 py-2.5 flex items-center justify-between bg-purple-50/40">
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  setOpen(false);
                }}
                className="text-xs font-semibold text-neutral-400 hover:text-neutral-700 transition"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={selectToday}
                className="text-xs font-bold text-purple-600 hover:text-purple-800 transition"
              >
                Today
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
