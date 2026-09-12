import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Coins, Flame, Pencil, Trophy } from "lucide-react";
import { ATTRIBUTE_LIST } from "../game/config";
import type { Attributes, UserDoc } from "../game/types";
import { WashiTape } from "./Bits";

/* ------------------------------------------------------------------ *
 *  A doodled self-portrait that gains accessories as you level up.
 * ------------------------------------------------------------------ */
function DoodleAvatar({ level }: { level: number }) {
  return (
    <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden>
      <rect width="120" height="120" fill="#fdf4de" />
      <circle cx="60" cy="74" r="46" fill="#f7e2c0" opacity=".7" />
      {/* head */}
      <path
        d="M60 22c17 0 27 12 27 29 0 19-12 31-27 31s-27-12-27-31c0-17 10-29 27-29Z"
        fill="#f6dcc0"
        stroke="#2f2822"
        strokeWidth="2.6"
      />
      {/* hair scribble */}
      <path
        d="M33 47c2-16 13-25 27-25s25 9 27 24c-6-6-13-9-20-6-6 3-12 4-18 1-5-2-11-1-16 6Z"
        fill="#4b3a2c"
        stroke="#2f2822"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      {/* eyes */}
      <path d="M48 55c2.5-3 6-3 8 0" stroke="#2f2822" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <path d="M64 55c2.5-3 6-3 8 0" stroke="#2f2822" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      {/* smile */}
      <path d="M52 67c4 4.5 12 4.5 16 0" stroke="#2f2822" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      {/* blush */}
      <ellipse cx="45" cy="63" rx="4.5" ry="2.6" fill="#e79aa1" opacity=".65" />
      <ellipse cx="75" cy="63" rx="4.5" ry="2.6" fill="#e79aa1" opacity=".65" />
      {/* scarf */}
      <path
        d="M35 88c8 7 42 7 50 0 7 4 11 12 12 24H23c1-12 5-20 12-24Z"
        fill="#cf7a4e"
        stroke="#2f2822"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* level 5+ : paper crown */}
      {level >= 5 && (
        <path
          d="M38 28 44 14l8 9 8-12 8 12 8-9 6 14Z"
          fill="#e8bb52"
          stroke="#2f2822"
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
      )}
      {/* level 10+ : a little star sticker */}
      {level >= 10 && (
        <path
          d="M98 30l3 8 8 3-8 3-3 8-3-8-8-3 8-3z"
          fill="#e8bb52"
          stroke="#2f2822"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

/* ------------------------------------------------------------------ *
 *  Hand-drawn XP meter
 * ------------------------------------------------------------------ */
function XPBar({ percent, current, max }: { percent: number; current: number; max: number }) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between font-body text-[10px] font-black uppercase tracking-[0.14em] text-ink-soft">
        <span>experience</span>
        <span className="font-hand text-base font-normal normal-case tracking-normal text-ink">
          {current} / {max}
        </span>
      </div>
      <div className="relative h-5 rounded-full border-[2.5px] border-ink bg-[#efe4cd] shadow-[inset_2px_2px_4px_rgba(47,40,34,.28)]">
        <motion.div
          initial={false}
          animate={{ width: `${percent}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 18 }}
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            backgroundImage:
              "repeating-linear-gradient(115deg,#e8bb52 0 7px,#d9a63c 7px 13px)",
            boxShadow: "inset 0 -3px 0 rgba(140,96,20,.25)",
            minWidth: percent > 0 ? 12 : 0,
          }}
        />
        <span className="absolute inset-0 grid place-items-center font-body text-[9px] font-black tracking-widest text-ink/70">
          {percent}%
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  Attributes, drawn as tally-ish meters
 * ------------------------------------------------------------------ */
function AttributeRow({
  label,
  short,
  color,
  value,
  max,
}: {
  label: string;
  short: string;
  color: string;
  value: number;
  max: number;
}) {
  const pct = Math.max(6, Math.round((value / Math.max(1, max)) * 100));
  return (
    <li className="flex items-center gap-2">
      <span
        className="grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 border-ink font-body text-[8px] font-black"
        style={{ background: color + "33", color }}
        aria-hidden
      >
        {short}
      </span>
      <span className="w-[4.6rem] shrink-0 font-print text-sm text-ink">{label}</span>
      <span className="relative h-2.5 flex-1 rounded-full border-2 border-ink/70 bg-[#f0e6d0]">
        <motion.span
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 140, damping: 18 }}
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ background: color }}
        />
      </span>
      <motion.span
        key={value}
        initial={{ scale: 1.5, color: color }}
        animate={{ scale: 1, color: "#2f2822" }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
        className="w-6 text-right font-hand text-lg leading-none"
      >
        {value}
      </motion.span>
    </li>
  );
}

/* ------------------------------------------------------------------ *
 *  The profile card
 * ------------------------------------------------------------------ */
export function UserProfile({
  user,
  attributes,
  xpPercent,
  power,
  tape,
  onRename,
}: {
  user: UserDoc;
  attributes: Attributes;
  xpPercent: number;
  power: number;
  tape: string;
  onRename: (name: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(user.name);
  const [renameError, setRenameError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  const save = () => {
    if (!draft.trim()) {
      setRenameError(true);
      return;
    }
    setRenameError(false);
    onRename(draft.trim());
    setEditing(false);
  };

  const maxAttr = Math.max(10, ...Object.values(attributes));

  return (
    <aside className="relative">
      <div
        className="paper-card grain relative rounded-[4px] px-5 pb-5 pt-8"
        style={{ ["--card-bg" as string]: "#fffdf6", transform: "rotate(-.6deg)" }}
      >
        <WashiTape background={tape} rotate={-7} className="-top-3 left-6 h-6 w-28" />
        <WashiTape background={tape} rotate={5} className="-top-3 right-5 h-6 w-20" />

        {/* polaroid */}
        <div className="flex items-start gap-4">
          <motion.div
            tabIndex={0}
            role="img"
            aria-label={`Doodled self-portrait, level ${user.level}`}
            whileHover={{ rotate: 0, scale: 1.04 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            className="shrink-0 rotate-[-3deg] bg-white p-1.5 pb-5 shadow-[3px_4px_0_rgba(47,40,34,.2)] rounded-[2px] focus:outline-none focus:ring-2 focus:ring-amber-800 focus:ring-offset-2"
          >
            <div className="h-[74px] w-[74px] overflow-hidden border border-black/10">
              <DoodleAvatar level={user.level} />
            </div>
            <p className="mt-1 text-center font-hand text-[11px] leading-none text-ink-soft">
              that's me
            </p>
          </motion.div>

          <div className="min-w-0 flex-1">
            {editing ? (
              <div className="relative">
                <input
                  ref={inputRef}
                  value={draft}
                  maxLength={22}
                  onChange={(e) => {
                    setDraft(e.target.value);
                    if (renameError && e.target.value.trim().length > 0) {
                      setRenameError(false);
                    }
                  }}
                  onBlur={save}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") save();
                    if (e.key === "Escape") {
                      setDraft(user.name);
                      setRenameError(false);
                      setEditing(false);
                    }
                  }}
                  className="ink-field font-hand text-[1.7rem] leading-tight focus:outline-none focus:ring-2 focus:ring-amber-800 focus:ring-offset-2"
                  aria-label="Your name"
                  aria-invalid={renameError}
                />
                {renameError && (
                  <span className="block font-hand text-sm text-wine">
                    Ink cannot be empty...
                  </span>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setDraft(user.name);
                  setRenameError(false);
                  setEditing(true);
                }}
                className="group flex w-full items-center gap-1.5 text-left rounded focus:outline-none focus:ring-2 focus:ring-amber-800 focus:ring-offset-2"
                aria-label={`Your name: ${user.name}. Click or press Enter to rename.`}
              >
                <span className="truncate font-hand text-[1.7rem] leading-tight text-ink">
                  {user.name}
                </span>
                <Pencil
                  size={13}
                  className="shrink-0 text-ink-faint opacity-0 transition group-hover:opacity-100"
                />
              </button>
            )}

            <p className="scribble-underline -mt-1 inline-block font-print text-sm text-clay">
              {user.title}
            </p>

            <div className="mt-2 flex items-center gap-2">
              <motion.span
                key={user.level}
                initial={{ scale: 1.6, rotate: -12 }}
                animate={{ scale: 1, rotate: -4 }}
                transition={{ type: "spring", stiffness: 300, damping: 12 }}
                className="grid h-11 w-11 place-items-center rounded-full border-[3px] border-ink bg-[#f6e3bd] font-marker text-lg leading-none shadow-[2px_2px_0_rgba(47,40,34,.8)]"
              >
                {user.level}
              </motion.span>
              <span className="font-body text-[10px] font-black uppercase leading-tight tracking-[0.12em] text-ink-soft">
                level
                <br />
                <span className="font-hand text-sm font-normal normal-case tracking-normal">
                  power {power}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* xp */}
        <div className="mt-4">
          <XPBar percent={xpPercent} current={user.currentXP} max={user.maxXP} />
        </div>

        {/* gold + streak */}
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <div className="ink-box wobble-soft flex items-center gap-2 bg-[#fdf3d8] px-2.5 py-2">
            <Coins size={18} className="shrink-0 text-marigold" strokeWidth={2.4} />
            <span className="min-w-0">
              <motion.span
                key={user.gold}
                initial={{ y: -6, opacity: 0.4 }}
                animate={{ y: 0, opacity: 1 }}
                className="block font-hand text-xl leading-none text-ink"
              >
                {user.gold}
              </motion.span>
              <span className="font-body text-[9px] font-black uppercase tracking-widest text-ink-soft">
                gold
              </span>
            </span>
          </div>

          <div className="ink-box wobble-soft flex items-center gap-2 bg-[#fbe4d8] px-2.5 py-2">
            <motion.span
              animate={{ scale: [1, 1.16, 1], rotate: [-4, 4, -4] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              className="shrink-0"
            >
              <Flame size={18} className="text-clay" strokeWidth={2.4} />
            </motion.span>
            <span className="min-w-0">
              <span className="block font-hand text-xl leading-none text-ink">
                {user.streak} {user.streak === 1 ? "day" : "days"}
              </span>
              <span className="font-body text-[9px] font-black uppercase tracking-widest text-ink-soft">
                streak
              </span>
            </span>
          </div>
        </div>

        {/* attributes */}
        <div className="mt-5">
          <h3 className="mb-2 flex items-center gap-2 font-marker text-base tracking-wide text-ink">
            attributes
            <span className="h-[2px] flex-1 bg-ink/20" />
          </h3>
          <ul className="space-y-2">
            {ATTRIBUTE_LIST.map((a) => (
              <AttributeRow
                key={a.id}
                label={a.label}
                short={a.short}
                color={a.color}
                value={attributes[a.id]}
                max={maxAttr}
              />
            ))}
          </ul>
        </div>

        {/* little stats footnote */}
        <p className="mt-4 flex items-center gap-1.5 font-hand text-base text-ink-soft">
          <Trophy size={14} className="text-marigold" />
          {user.questsCompleted} quests finished · best chain {user.bestStreak}
        </p>
      </div>
    </aside>
  );
}
