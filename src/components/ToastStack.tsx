import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import type { Toast } from "../hooks/useGameState";
import { WashiTape } from "./Bits";
export { StickyNoteToast } from "./StickyNoteToast";

const TONE_BG: Record<Toast["tone"], string> = {
  xp: "#fdf3d8",
  gold: "#fdf3d8",
  streak: "#fbe4d8",
  shop: "#efe7f8",
  info: "#fffcf2",
  error: "#fef2f2",
};

export function ToastStack({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div
      className="pointer-events-none fixed bottom-4 right-3 z-[65] flex w-[18rem] flex-col items-end gap-2.5 sm:bottom-6 sm:right-6"
      aria-live="polite"
      aria-atomic="false"
    >
      <AnimatePresence initial={false}>
        {toasts.map((t, i) => {
          const isError = t.tone === "error";
          return (
            <motion.button
              key={t.id}
              type="button"
              layout
              role={isError ? "alert" : "status"}
              aria-live={isError ? "assertive" : "polite"}
              aria-label={t.headline}
              initial={{ opacity: 0, x: 90, rotate: 8, scale: 0.85 }}
              animate={{ opacity: 1, x: 0, rotate: isError ? 1 : i % 2 ? 1.6 : -1.8, scale: 1 }}
              exit={{ opacity: 0, x: 40, y: 12, scale: 0.9, transition: { duration: 0.25 } }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
              onClick={() => onDismiss(t.id)}
              className={`paper-card grain pointer-events-auto w-full rounded-[3px] p-4 text-left transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-amber-800 focus:ring-offset-2 ${
                isError
                  ? "torn paper-noise border border-red-200 bg-red-50 text-red-900 shadow-md rotate-1"
                  : "border border-ink/10 shadow-sm"
              }`}
              style={{ ["--card-bg" as string]: TONE_BG[t.tone] }}
            >
              <WashiTape
                background={
                  isError
                    ? "linear-gradient(135deg,#fca5a5,#f87171)"
                    : "linear-gradient(135deg,#f0e2c0,#ddc79b)"
                }
                rotate={isError ? -3 : -6}
                className="-top-2.5 left-1/2 h-4 w-16 -translate-x-1/2"
              />

              <div className="flex items-start gap-2">
                {isError && (
                  <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-700" aria-hidden="true" />
                )}
                <div className="min-w-0 flex-1">
                  <p className={`font-marker text-base leading-tight ${isError ? "text-red-950" : "text-ink"}`}>
                    {t.headline}
                  </p>
                  {t.lines.map((line, idx) => (
                    <p
                      key={idx}
                      className={`font-hand text-[15px] leading-tight ${
                        isError ? "text-red-800" : "text-ink-soft"
                      }`}
                    >
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            </motion.button>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
