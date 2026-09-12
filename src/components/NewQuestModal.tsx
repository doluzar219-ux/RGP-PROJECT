import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Coins, Sparkles, X } from "lucide-react";
import { RANK_LIST, REALM_LIST } from "../game/config";
import { RANKS } from "../game/config";
import type { QuestDraft } from "../game/engine";
import type { RankId, RealmId } from "../game/types";
import { PaperButton, WashiTape } from "./Bits";

interface Props {
  open: boolean;
  tape: string;
  onClose: () => void;
  onSubmit: (draft: QuestDraft) => void;
}

const PROMPTS = [
  "walk somewhere with no destination",
  "finish the thing you keep re-opening",
  "call the person you keep meaning to call",
  "45 minutes on the side project",
  "tidy one single drawer",
  "learn one weird fact on purpose",
];

export function NewQuestModal({ open, tape, onClose, onSubmit }: Props) {
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [realm, setRealm] = useState<RealmId>("library");
  const [rank, setRank] = useState<RankId>("D");
  const [error, setError] = useState(false);
  const [placeholder, setPlaceholder] = useState(PROMPTS[0]);
  const titleRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    // picking at random is impure, so it happens here in an effect —
    // and it re-rolls every time the sheet is pulled off the pad.
    setPlaceholder(PROMPTS[Math.floor(Math.random() * PROMPTS.length)]);
    const t = window.setTimeout(() => titleRef.current?.focus(), 120);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, input, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      window.clearTimeout(t);
    };
  }, [open, onClose]);

  const submit = () => {
    if (!title.trim()) {
      setError(true);
      titleRef.current?.focus();
      return;
    }
    onSubmit({ title, details, realm, rank });
    setTitle("");
    setDetails("");
    setRank("D");
    setError(false);
    onClose();
  };

  const r = RANKS[rank];
  const isTitleEmpty = !title.trim();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#2f2822]/55 p-4 py-10 backdrop-blur-[2px]"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label="Write a new quest"
            tabIndex={-1}
            initial={{ y: -40, rotate: -4, scale: 0.9, opacity: 0 }}
            animate={{ y: 0, rotate: -0.8, scale: 1, opacity: 1 }}
            exit={{ y: 30, rotate: 3, scale: 0.92, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="torn paper-noise relative my-6 w-full max-w-lg px-6 py-7 shadow-[0_24px_50px_-18px_rgba(30,22,12,.8)] sm:px-9"
            style={{ ["--card-bg" as string]: "#fffbf0" }}
          >
            <WashiTape background={tape} rotate={-8} className="-top-5 left-8 h-7 w-32" />

            {/* red margin line, like real notebook paper */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-4 w-px bg-[#d79aa0]/70 sm:left-6"
            />

            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-3 top-3 rounded-full p-1.5 text-ink-soft transition hover:rotate-90 hover:text-wine focus:outline-none focus:ring-2 focus:ring-amber-800 focus:ring-offset-2"
            >
              <X size={18} strokeWidth={2.6} />
            </button>

            <h2 className="font-marker text-2xl leading-tight text-ink sm:text-[1.7rem]">
              a new quest
            </h2>
            <p className="mb-5 font-hand text-lg text-ink-soft">
              write it down and it becomes real. that's the whole trick.
            </p>

            {/* title */}
            <label className="block">
              <span className="font-body text-[10px] font-black uppercase tracking-[0.16em] text-ink-soft">
                Quest title
              </span>
              <input
                ref={titleRef}
                value={title}
                maxLength={70}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (error && e.target.value.trim().length > 0) setError(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (!isTitleEmpty) submit();
                    else setError(true);
                  }
                }}
                placeholder={placeholder}
                aria-invalid={error || (title.length > 0 && isTitleEmpty)}
                aria-describedby={error || (title.length > 0 && isTitleEmpty) ? "quest-title-error" : undefined}
                className="ink-field mt-1 font-hand text-2xl focus:outline-none focus:ring-2 focus:ring-amber-800 focus:ring-offset-2"
                style={error || (title.length > 0 && isTitleEmpty) ? { borderBottomColor: "#9c3d43", borderBottomStyle: "solid" } : undefined}
              />
              {(error || (title.length > 0 && isTitleEmpty)) && (
                <span id="quest-title-error" className="mt-1 block font-hand text-base text-wine transition-opacity">
                  Ink cannot be empty... a quest needs a name, wanderer
                </span>
              )}
            </label>

            {/* details */}
            <label className="mt-4 block">
              <span className="font-body text-[10px] font-black uppercase tracking-[0.16em] text-ink-soft">
                Notes to self <span className="font-normal lowercase">(optional)</span>
              </span>
              <textarea
                value={details}
                maxLength={180}
                rows={2}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="why it matters, or how you'll start…"
                className="ink-field ruled mt-1 resize-none font-serif text-[0.95rem] italic leading-[28px] focus:outline-none focus:ring-2 focus:ring-amber-800 focus:ring-offset-2"
              />
            </label>

            {/* realm */}
            <fieldset className="mt-5">
              <legend className="font-body text-[10px] font-black uppercase tracking-[0.16em] text-ink-soft">
                Realm
              </legend>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {REALM_LIST.map((rl) => {
                  const on = realm === rl.id;
                  const Icon = rl.icon;
                  return (
                    <button
                      key={rl.id}
                      type="button"
                      onClick={() => setRealm(rl.id)}
                      aria-pressed={on}
                      className="paper-btn wobble-soft flex items-center gap-2 px-2.5 py-2 text-left focus:outline-none focus:ring-2 focus:ring-amber-800 focus:ring-offset-2"
                      style={{
                        ["--btn-bg" as string]: on ? rl.tint : "#fffcf2",
                        transform: on ? "translate(2px,2px)" : undefined,
                        boxShadow: on
                          ? "inset 2px 3px 6px rgba(47,40,34,.25)"
                          : undefined,
                      }}
                    >
                      <Icon size={17} style={{ color: rl.color }} strokeWidth={2.4} />
                      <span className="min-w-0">
                        <span className="block truncate font-print text-sm leading-tight text-ink">
                          {rl.name}
                        </span>
                        <span className="block truncate font-body text-[9px] font-bold uppercase tracking-wider text-ink-faint">
                          {rl.blurb}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            {/* rank */}
            <fieldset className="mt-5">
              <legend className="font-body text-[10px] font-black uppercase tracking-[0.16em] text-ink-soft">
                Rank — how big is this?
              </legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {RANK_LIST.map((rk) => {
                  const on = rank === rk.id;
                  return (
                    <button
                      key={rk.id}
                      type="button"
                      onClick={() => setRank(rk.id)}
                      aria-pressed={on}
                      aria-label={`Rank ${rk.id}, ${rk.label}`}
                      className="grid h-10 w-10 place-items-center rounded-full border-[3px] font-marker text-lg transition-transform focus:outline-none focus:ring-2 focus:ring-amber-800 focus:ring-offset-2"
                      style={{
                        borderColor: rk.color,
                        color: on ? "#fffcf2" : rk.color,
                        background: on ? rk.color : "transparent",
                        transform: on ? "rotate(-8deg) scale(1.1)" : "rotate(3deg)",
                        boxShadow: on ? "2px 2px 0 rgba(47,40,34,.6)" : "none",
                      }}
                    >
                      {rk.id}
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 font-hand text-lg text-ink-soft">
                “{r.label}” →{" "}
                <span className="inline-flex items-center gap-1 text-ink">
                  <Sparkles size={13} className="text-marigold" /> {r.xp} XP
                </span>
                {"  "}
                <span className="inline-flex items-center gap-1 text-ink">
                  <Coins size={13} className="text-marigold" /> {r.gold} gold
                </span>
              </p>
            </fieldset>

            <div className="mt-7 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="font-hand text-lg text-ink-faint underline decoration-dotted underline-offset-4 transition hover:text-ink focus:outline-none focus:ring-2 focus:ring-amber-800 focus:ring-offset-2"
              >
                never mind
              </button>
              <PaperButton
                tone="gold"
                size="lg"
                onClick={submit}
                disabled={isTitleEmpty}
                aria-disabled={isTitleEmpty}
                aria-label="Pin quest to board"
              >
                📌 Pin to Board
              </PaperButton>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
