import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { LevelUpEvent } from "../hooks/useGameState";
import { levelUpBurst } from "../utils/confetti";
import { PaperButton, SketchStar, WashiTape } from "./Bits";

export function LevelUpOverlay({
  event,
  tape,
  onClose,
}: {
  event: LevelUpEvent | null;
  tape: string;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!event) return;
    // Confetti is impure, so it only ever fires from inside an effect.
    levelUpBurst();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [event, onClose]);

  return (
    <AnimatePresence>
      {event && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={onClose}
          className="fixed inset-0 z-[60] grid place-items-center overflow-hidden bg-[#2f2822]/60 p-5 backdrop-blur-[2px]"
          role="alertdialog"
          aria-modal="true"
          aria-label={`Level ${event.level} reached`}
        >
          <motion.div
            initial={{ scale: 0.6, rotate: -9, y: 40, opacity: 0 }}
            animate={{ scale: 1, rotate: -1.5, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, rotate: 6, opacity: 0, y: 25 }}
            transition={{ type: "spring", stiffness: 240, damping: 17 }}
            onMouseDown={(e) => e.stopPropagation()}
            className="paper-card grain relative w-full max-w-sm rounded-[4px] px-7 py-9 text-center shadow-[0_28px_60px_-20px_rgba(20,14,6,.9)]"
            style={{ ["--card-bg" as string]: "#fffbef" }}
          >
            <WashiTape background={tape} rotate={-24} className="-left-5 -top-4 h-6 w-24" />
            <WashiTape background={tape} rotate={-24} className="-bottom-4 -right-5 h-6 w-24" />

            <SketchStar className="absolute left-4 top-5 h-6 w-6 text-marigold" />
            <SketchStar className="absolute right-5 top-10 h-4 w-4 text-clay" />

            <p className="font-body text-[11px] font-black uppercase tracking-[0.35em] text-ink-soft">
              level up
            </p>

            <motion.div
              initial={{ scale: 0.3, rotate: -25 }}
              animate={{ scale: 1, rotate: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 12, delay: 0.12 }}
              className="mx-auto my-4 grid h-28 w-28 place-items-center rounded-full border-[5px] border-ink bg-[#f6e3bd] shadow-[4px_5px_0_rgba(47,40,34,.85)]"
            >
              <span className="font-marker text-5xl leading-none text-ink">{event.level}</span>
            </motion.div>

            <h2 className="font-marker text-2xl leading-tight text-clay">{event.title}</h2>
            <p className="mx-auto mt-3 max-w-[22rem] font-hand text-xl leading-snug text-ink-soft">
              {event.gained > 1
                ? `${event.gained} levels in one go. Who even are you.`
                : "Something small got done, and it added up. That's literally the whole game."}
            </p>

            <div className="mt-6">
              <PaperButton tone="gold" size="lg" onClick={onClose} autoFocus>
                onwards →
              </PaperButton>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
