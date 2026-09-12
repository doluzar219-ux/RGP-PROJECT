import { motion } from "framer-motion";
import { Eraser } from "lucide-react";
import type { ChronicleEntry } from "../game/types";

const DOT: Record<ChronicleEntry["kind"], string> = {
  quest: "#8fae86",
  level: "#e0a63c",
  streak: "#cf7a4e",
  shop: "#b39cd0",
  start: "#85aecb",
};

function ago(iso: string) {
  const then = new Date(iso).getTime();
  const mins = Math.round((Date.now() - then) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  return `${days}d ago`;
}

function Paperclip() {
  return (
    <svg
      viewBox="0 0 40 64"
      aria-hidden
      className="absolute -top-4 left-5 h-11 w-7 drop-shadow-[1px_2px_1px_rgba(47,40,34,.3)]"
    >
      <path
        d="M27 12v34c0 7-5 12-11.5 12S4 53 4 46V14C4 8 8 4 13.5 4S23 8 23 14v31c0 3-2 5-4.5 5S14 48 14 45V16"
        fill="none"
        stroke="#9aa0a6"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Chronicle({
  entries,
  onReset,
}: {
  entries: ChronicleEntry[];
  onReset: () => void;
}) {
  return (
    <section
      aria-labelledby="chronicle-heading"
      className="paper-card grain relative rounded-[3px] px-4 pb-4 pt-7"
      style={{ ["--card-bg" as string]: "#fdf6e4", transform: "rotate(.7deg)" }}
    >
      <Paperclip />
      <h3
        id="chronicle-heading"
        className="mb-2 pl-8 font-marker text-lg leading-none text-ink"
      >
        the chronicle
      </h3>

      <ul className="max-h-56 space-y-1.5 overflow-y-auto pr-1">
        {entries.slice(0, 12).map((e) => (
          <motion.li
            key={e.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex gap-2 border-b border-dotted border-ink/15 pb-1.5"
          >
            <span
              className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ background: DOT[e.kind] }}
              aria-hidden
            />
            <span className="min-w-0 flex-1">
              <span className="block font-print text-[13px] leading-snug text-ink">{e.text}</span>
              <span className="font-body text-[9px] font-bold uppercase tracking-wider text-ink-faint">
                {ago(e.at)}
              </span>
            </span>
          </motion.li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => {
          if (
            window.confirm(
              "Re-bind the log? Every quest, level and coin is erased. This cannot be undone.",
            )
          )
            onReset();
        }}
        className="mt-3 inline-flex items-center gap-1.5 font-hand text-base text-ink-faint underline decoration-dotted underline-offset-4 transition hover:text-wine focus:outline-none focus:ring-2 focus:ring-amber-800 focus:ring-offset-2 rounded"
      >
        <Eraser size={13} /> start a brand-new log
      </button>
    </section>
  );
}
