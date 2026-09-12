import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, X } from "lucide-react";
import { WashiTape } from "./Bits";

export interface StickyNoteToastProps {
  show?: boolean;
  message?: string;
  lines?: string[];
  duration?: number;
  onDismiss?: () => void;
  className?: string;
}

/**
 * Scrapbook Sticky-Note Toast
 * Simulates a torn red sticky-note paper pinned to the desk with tactile washi tape.
 * Displays "Oops! The ink spilled (Server error)." and smoothly dismisses after 3.5s.
 */
export function StickyNoteToast({
  show = true,
  message = "Oops! The ink spilled (Server error).",
  lines = [],
  duration = 3500,
  onDismiss,
  className = "",
}: StickyNoteToastProps) {
  const [visible, setVisible] = useState(show);

  useEffect(() => {
    setVisible(show);
  }, [show]);

  useEffect(() => {
    if (!visible || !duration) return;
    const timer = window.setTimeout(() => {
      setVisible(false);
      onDismiss?.();
    }, duration);
    return () => window.clearTimeout(timer);
  }, [visible, duration, onDismiss]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.aside
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
          initial={{ opacity: 0, y: 25, rotate: 6, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, rotate: 1, scale: 1 }}
          exit={{
            opacity: 0,
            y: 15,
            scale: 0.92,
            transition: { duration: 0.35, ease: "easeInOut" },
          }}
          transition={{ type: "spring", stiffness: 280, damping: 20 }}
          className={`fixed bottom-4 right-4 z-[70] w-[min(92vw,22rem)] sm:bottom-6 sm:right-6 ${className}`}
        >
          <div
            className="torn paper-noise relative rounded-[3px] border border-red-200 bg-red-50 p-4 pt-5 text-red-900 shadow-md rotate-1 transition-all duration-300"
            style={{
              ["--card-bg" as string]: "#fef2f2",
            }}
          >
            {/* Washi tape strip pinning the sticky note */}
            <WashiTape
              background="linear-gradient(135deg,#fca5a5,#f87171)"
              rotate={-3}
              className="-top-3 left-1/2 h-4 w-20 -translate-x-1/2 shadow-sm"
            />

            <div className="flex items-start gap-2.5">
              <span className="mt-0.5 shrink-0 text-red-700" aria-hidden="true">
                <AlertCircle size={18} strokeWidth={2.5} />
              </span>

              <div className="min-w-0 flex-1">
                <p className="font-marker text-base leading-snug tracking-tight text-red-950">
                  {message}
                </p>
                {lines.length > 0 && (
                  <div className="mt-1 space-y-0.5">
                    {lines.map((line, idx) => (
                      <p
                        key={idx}
                        className="font-hand text-[15px] leading-tight text-red-800"
                      >
                        {line}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              {onDismiss && (
                <button
                  type="button"
                  onClick={() => {
                    setVisible(false);
                    onDismiss();
                  }}
                  aria-label="Dismiss error notice"
                  className="shrink-0 rounded-full p-1 text-red-600 transition hover:bg-red-100 hover:text-red-900 focus:outline-none focus:ring-2 focus:ring-amber-800 focus:ring-offset-2"
                >
                  <X size={15} strokeWidth={2.6} />
                </button>
              )}
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
