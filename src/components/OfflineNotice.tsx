import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CloudOff, RefreshCw, X } from "lucide-react";
import { WashiTape } from "./Bits";

/**
 * The offline journal notice — a torn scrap of paper pinned to the top of the
 * desk. Shown whenever `navigator.onLine` reports no connection.
 */
export function OfflineNotice({
  show,
  onDismiss,
  onRetry,
}: {
  show: boolean;
  onDismiss: () => void;
  onRetry: () => void;
}) {
  useEffect(() => {
    if (!show) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [show, onDismiss]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: -70, opacity: 0, rotate: -3 }}
          animate={{ y: 0, opacity: 1, rotate: -0.8 }}
          exit={{ y: -60, opacity: 0, rotate: 2 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          role="status"
          aria-live="polite"
          className="fixed left-1/2 top-4 z-[58] w-[min(94vw,26rem)] -translate-x-1/2"
        >
          <div
            className="torn paper-noise relative px-5 pb-4 pt-5 shadow-[0_16px_34px_-14px_rgba(30,22,12,.75)]"
            style={{ ["--card-bg" as string]: "#f8eccc" }}
          >
            <WashiTape
              background="linear-gradient(135deg,#d9cba6,#bfae83)"
              rotate={-4}
              className="-top-3 left-1/2 h-5 w-24 -translate-x-1/2"
            />

            <div className="flex items-start gap-3">
              <motion.span
                animate={{ rotate: [-4, 4, -4] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="mt-0.5 shrink-0"
              >
                <CloudOff size={19} className="text-clay" strokeWidth={2.5} />
              </motion.span>

              <div className="min-w-0 flex-1">
                <p className="font-marker text-base leading-tight text-ink">
                  Offline journal mode active
                </p>
                <p className="mt-0.5 font-hand text-[17px] leading-snug text-ink-soft">
                  Changes will sync when online. Everything you do now is being
                  kept safely on this device.
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={onRetry}
                  aria-label="Try to reconnect"
                  className="rounded-full p-1 text-ink-faint transition hover:text-clay focus:outline-none focus:ring-2 focus:ring-amber-800 focus:ring-offset-2"
                >
                  <RefreshCw size={14} />
                </button>
                <button
                  type="button"
                  onClick={onDismiss}
                  aria-label="Dismiss offline notice"
                  className="rounded-full p-1 text-ink-faint transition hover:text-wine focus:outline-none focus:ring-2 focus:ring-amber-800 focus:ring-offset-2"
                >
                  <X size={14} strokeWidth={2.6} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
