import { motion } from "framer-motion";
import { Check, Coins, RotateCcw, Sparkles, X } from "lucide-react";
import { ATTRIBUTES, RANKS, REALMS } from "../game/config";
import { prettyDate } from "../game/engine";
import type { Quest } from "../game/types";
import { paperBurst } from "../utils/confetti";
import { Pin, WashiTape } from "./Bits";

interface Props {
  /** React 19 passes refs as props — AnimatePresence popLayout needs this one. */
  ref?: React.Ref<HTMLElement>;
  quest: Quest;
  tape: string;
  pin: { emoji?: string; color?: string };
  paper: { bg: string; pattern?: string };
  stamped: boolean;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onRestore: (id: string) => void;
}

export function QuestCard({
  ref,
  quest,
  tape,
  pin,
  paper,
  stamped,
  onComplete,
  onDelete,
  onRestore,
}: Props) {
  const realm = REALMS[quest.realm];
  const rank = RANKS[quest.rank];
  const attr = ATTRIBUTES[realm.attribute];
  const RealmIcon = realm.icon;

  const tilt = ((quest.seed % 5) - 2) * 0.9; // -1.8deg … 1.8deg
  const pinShift = (quest.seed % 30) - 15;
  const done = quest.status === "completed";

  return (
    <motion.article
      ref={ref}
      role="article"
      aria-label={`Quest card: ${quest.title}. Rank ${rank.id}, ${realm.name}. Status: ${done ? "completed" : "active"}`}
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          if (event.target === event.currentTarget) {
            event.preventDefault();
            if (!done) {
              onComplete(quest.id);
            } else {
              onRestore(quest.id);
            }
          }
        }
      }}
      layout
      initial={{ opacity: 0, y: 24, rotate: tilt - 4, scale: 0.94 }}
      animate={{ opacity: done && !stamped ? 0.96 : 1, y: 0, rotate: tilt, scale: 1 }}
      exit={{
        opacity: 0,
        scale: 0.82,
        y: -30,
        rotate: tilt + 9,
        transition: { duration: 0.32 },
      }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      whileHover={{ rotate: tilt * 0.3, y: -5, scale: 1.015, zIndex: 20 }}
      className="paper-card grain group relative flex min-h-[15rem] flex-col rounded-[3px] p-4 pt-7 focus:outline-none focus:ring-2 focus:ring-amber-800 focus:ring-offset-2"
      style={{
        // @ts-expect-error custom property
        "--card-bg": paper.bg,
        backgroundImage: paper.pattern,
        filter: done ? "saturate(.72)" : undefined,
      }}
    >
      {/* tape + pin */}
      <WashiTape
        background={tape}
        rotate={-8 + (quest.seed % 7)}
        className="-top-3 left-3 h-5 w-20"
      />
      <WashiTape
        background={tape}
        rotate={-8 + (quest.seed % 5)}
        className="-bottom-2.5 -right-2 h-5 w-16"
      />
      <span
        className="absolute -top-3 z-10"
        style={{ left: `calc(50% + ${pinShift}px)` }}
      >
        <Pin emoji={pin.emoji} color={pin.color} size={pin.emoji ? 20 : 22} />
      </span>

      {/* tear-off */}
      <button
        type="button"
        onClick={() => onDelete(quest.id)}
        aria-label={`Tear “${quest.title}” off the board`}
            className="absolute right-1.5 top-1.5 z-10 rounded-full p-1 text-ink-faint opacity-0 transition hover:scale-125 hover:text-wine focus:outline-none focus:ring-2 focus:ring-amber-800 focus:ring-offset-2 focus-visible:opacity-100 group-hover:opacity-100"
      >
        <X size={14} strokeWidth={2.6} />
      </button>

      {/* realm + rank */}
      <header className="mb-1.5 flex items-start justify-between gap-2">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-body text-[10px] font-bold uppercase tracking-[0.13em]"
          style={{ background: realm.tint, color: realm.color }}
        >
          <RealmIcon size={11} strokeWidth={2.6} />
          {realm.name}
        </span>
        <span
          className="grid h-7 w-7 shrink-0 place-items-center rounded-full border-[2.5px] font-marker text-sm leading-none"
          style={{ borderColor: rank.color, color: rank.color, transform: "rotate(7deg)" }}
          title={`Rank ${rank.id} — ${rank.label}`}
        >
          {rank.id}
        </span>
      </header>

      {/* title + check */}
      <div className="flex items-start gap-2">
        {!done ? (
          <motion.button
            type="button"
            role="button"
            aria-label={`Complete quest: ${quest.title}`}
            onClick={(e) => {
              // confetti is impure → only ever called from an event handler
              const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
              paperBurst(
                (r.left + r.width / 2) / window.innerWidth,
                (r.top + r.height / 2) / window.innerHeight,
              );
              onComplete(quest.id);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
                paperBurst(
                  (r.left + r.width / 2) / window.innerWidth,
                  (r.top + r.height / 2) / window.innerHeight,
                );
                onComplete(quest.id);
              }
            }}
            whileTap={{ scale: 0.78, rotate: -8 }}
            whileHover={{ scale: 1.12, rotate: 3 }}
            transition={{ type: "spring", stiffness: 520, damping: 14 }}
            className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-[7px] border-[2.5px] border-ink bg-white/70 text-transparent shadow-[2px_2px_0_rgba(47,40,34,.8)] transition-colors hover:text-sage/80 focus:outline-none focus:ring-2 focus:ring-amber-800 focus:ring-offset-2 focus-visible:text-sage/80"
          >
            <Check size={17} strokeWidth={4} className="transition-colors" />
          </motion.button>
        ) : (
          <span className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-[7px] border-[2.5px] border-ink/60 bg-white/40 text-sage">
            <Check size={17} strokeWidth={4} />
          </span>
        )}

        <h3
          className={`font-hand text-[1.6rem] leading-[1.1] text-ink ${
            done ? "line-through decoration-wine/60 decoration-2" : ""
          }`}
        >
          {quest.title}
        </h3>
      </div>

      {quest.details && (
        <p className="mt-2 pl-9 font-serif text-[0.8rem] italic leading-relaxed text-ink-soft">
          {quest.details}
        </p>
      )}

      {/* rewards footer */}
      <footer className="mt-auto pt-4">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t-2 border-dotted border-ink/25 pt-2 font-body text-[0.72rem] font-bold text-ink-soft">
          <span className="inline-flex items-center gap-1 text-ink">
            <Sparkles size={12} className="text-marigold" />
            {quest.rewardXP} XP
          </span>
          <span className="inline-flex items-center gap-1">
            <Coins size={12} className="text-marigold" />
            {quest.rewardGold}
          </span>
          <span className="inline-flex items-center gap-1" style={{ color: attr.color }}>
            +{rank.attr} {attr.short}
          </span>
          <span className="ml-auto font-hand text-sm font-normal text-ink-faint">
            {done && quest.completedAt
              ? `done ${prettyDate(quest.completedAt)}`
              : prettyDate(quest.date)}
          </span>
        </div>
      </footer>

      {/* floating reward burst */}
      {stamped && (
        <motion.span
          aria-hidden
          initial={{ y: 10, opacity: 0, scale: 0.6 }}
          animate={{ y: -74, opacity: [0, 1, 1, 0], scale: 1.1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="pointer-events-none absolute left-1/2 top-1/2 z-30 -translate-x-1/2 whitespace-nowrap font-marker text-2xl text-marigold drop-shadow-[1px_2px_0_rgba(47,40,34,.55)]"
        >
          +{quest.rewardXP} xp
        </motion.span>
      )}

      {/* the rubber stamp */}
      {done && (
        <motion.div
          initial={stamped ? { scale: 3, opacity: 0, rotate: -32 } : false}
          animate={{ scale: 1, opacity: 1, rotate: -14 }}
          transition={{ type: "spring", stiffness: 420, damping: 13 }}
          className="pointer-events-none absolute inset-0 grid place-items-center"
        >
          <span className="stamp rounded-md px-3 py-1 font-marker text-xl text-wine">
            completed
          </span>
        </motion.div>
      )}

      {done && (
        <button
          type="button"
          onClick={() => onRestore(quest.id)}
          className="absolute bottom-1 left-1.5 z-10 inline-flex items-center gap-1 rounded-full px-1.5 py-1 font-body text-[10px] font-bold text-ink-faint opacity-0 transition hover:text-clay focus:outline-none focus:ring-2 focus:ring-amber-800 focus:ring-offset-2 focus-visible:opacity-100 group-hover:opacity-100"
          aria-label={`Move “${quest.title}” back to active quests`}
        >
          <RotateCcw size={11} /> un-stamp
        </button>
      )}
    </motion.article>
  );
}
