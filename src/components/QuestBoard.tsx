import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { REALM_LIST } from "../game/config";
import type { Quest, RealmId } from "../game/types";
import { PaperButton, SketchArrow } from "./Bits";
import { QuestCard } from "./QuestCard";

type Tab = "active" | "memories";

interface Props {
  quests: Quest[];
  justCompleted: string | null;
  tape: string;
  pin: { emoji?: string; color?: string };
  paper: { bg: string; pattern?: string };
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onRestore: (id: string) => void;
  onNewQuest: () => void;
}

export function QuestBoard({
  quests,
  justCompleted,
  tape,
  pin,
  paper,
  onComplete,
  onDelete,
  onRestore,
  onNewQuest,
}: Props) {
  const [tab, setTab] = useState<Tab>("active");
  const [realmFilter, setRealmFilter] = useState<RealmId | "all">("all");

  const { active, memories } = useMemo(() => {
    const byRealm = (q: Quest) => realmFilter === "all" || q.realm === realmFilter;
    return {
      // a freshly-stamped quest lingers on the board so you can watch it get stamped
      active: quests.filter(
        (q) => byRealm(q) && (q.status === "active" || q.id === justCompleted),
      ),
      memories: quests
        .filter((q) => byRealm(q) && q.status === "completed" && q.id !== justCompleted)
        .sort((a, b) => (b.completedAt ?? "").localeCompare(a.completedAt ?? "")),
    };
  }, [quests, realmFilter, justCompleted]);

  const list = tab === "active" ? active : memories;
  const activeCount = quests.filter((q) => q.status === "active").length;
  const memoryCount = quests.filter((q) => q.status === "completed").length;

  const tabs: { id: Tab; label: string; count: number; tone: string }[] = [
    { id: "active", label: "Active Quests", count: activeCount, tone: "#f6e3bd" },
    { id: "memories", label: "Memories", count: memoryCount, tone: "#e6dcc9" },
  ];

  return (
    <section aria-labelledby="board-heading" className="relative">
      <h2 id="board-heading" className="sr-only">
        Quest board
      </h2>

      {/* ——— file-folder tabs ——— */}
      <div role="tablist" aria-label="Quest board tabs" className="flex flex-wrap items-end gap-2 pl-1">
        {tabs.map((t) => {
          const on = tab === t.id;
          return (
            <button
              key={t.id}
              id={`tab-${t.id}`}
              role="tab"
              aria-selected={on}
              aria-controls={`panel-${t.id}`}
              type="button"
              onClick={() => setTab(t.id)}
              className="relative -mb-[3px] px-4 pb-2.5 pt-2 font-print text-base transition-all sm:text-lg focus:outline-none focus:ring-2 focus:ring-amber-800 focus:ring-offset-2"
              style={{
                background: on ? t.tone : "rgba(246,238,218,.62)",
                color: on ? "#2f2822" : "#6a5d4e",
                borderRadius: "12px 16px 0 0",
                border: "2.5px solid #2f2822",
                borderBottom: on ? "3px solid " + t.tone : "2.5px solid #2f2822",
                transform: on ? "translateY(0) rotate(-.4deg)" : "translateY(4px) rotate(.5deg)",
                boxShadow: on ? "0 -3px 0 rgba(47,40,34,.08) inset" : "none",
                zIndex: on ? 5 : 1,
              }}
            >
              {t.label}
              <span className="ml-2 font-body text-xs font-black opacity-60">{t.count}</span>
            </button>
          );
        })}

        <div className="ml-auto hidden pb-2 sm:block">
          <PaperButton tone="gold" size="sm" onClick={onNewQuest} aria-label="Pin a new quest">
            <span className="inline-flex items-center gap-1.5">
              <Plus size={15} strokeWidth={3} /> New Quest
            </span>
          </PaperButton>
        </div>
      </div>

      {/* ——— the cork board ——— */}
      <div
        id={`panel-${tab}`}
        role="tabpanel"
        aria-labelledby={`tab-${tab}`}
        className="cork-board grain relative rounded-[6px] border-[3px] border-[#6f4f28] p-4 shadow-[inset_0_2px_18px_rgba(80,50,20,.45),4px_6px_0_rgba(47,40,34,.25)] sm:p-6"
      >
        {/* realm filter — little paper flags along the top of the board */}
        <div className="mb-5 flex flex-wrap items-center gap-1.5" role="toolbar" aria-label="Filter quests by realm">
          <span className="font-hand text-lg text-[#4a3113]/80">filter:</span>
          {(["all", ...REALM_LIST.map((r) => r.id)] as (RealmId | "all")[]).map((id) => {
            const realm = REALM_LIST.find((r) => r.id === id);
            const on = realmFilter === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setRealmFilter(id)}
                aria-pressed={on}
                aria-label={`Filter by ${realm ? realm.name : "all realms"}`}
                className="rounded-full border-2 border-ink/70 px-2.5 py-0.5 font-body text-[10px] font-black uppercase tracking-wider transition-transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-amber-800 focus:ring-offset-2"
                style={{
                  background: on ? (realm?.tint ?? "#fff8e6") : "rgba(255,252,242,.55)",
                  color: on ? (realm?.color ?? "#2f2822") : "#54452f",
                  boxShadow: on ? "2px 2px 0 rgba(47,40,34,.7)" : "none",
                  transform: `rotate(${on ? -2 : 0}deg)`,
                }}
              >
                {realm ? `${realm.emoji} ${realm.name.replace("The ", "")}` : "✦ Everything"}
              </button>
            );
          })}
        </div>

        <motion.div
          layout
          className="grid grid-cols-1 gap-x-5 gap-y-7 sm:grid-cols-2 2xl:grid-cols-3"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {list.map((q) => (
              <QuestCard
                key={q.id}
                quest={q}
                tape={tape}
                pin={pin}
                paper={paper}
                stamped={justCompleted === q.id}
                onComplete={onComplete}
                onDelete={onDelete}
                onRestore={onRestore}
              />
            ))}
          </AnimatePresence>
        </motion.div>

        {/* ——— empty states ——— */}
        {list.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mx-auto max-w-md py-10 text-center"
          >
            <div
              className="paper-card grain wobble-soft mx-auto -rotate-2 px-6 py-7"
              style={{ ["--card-bg" as string]: "#fffcf2" }}
            >
              <p className="font-marker text-xl text-ink">
                {tab === "active" ? "the board is bare" : "no memories yet"}
              </p>
              <p className="mt-2 font-hand text-xl leading-snug text-ink-soft">
                {tab === "active"
                  ? "Pin something small. A glass of water counts as a quest."
                  : "Finish a quest and it gets stamped, dated and filed here forever."}
              </p>
              {tab === "active" && (
                <div className="mt-4 flex items-center justify-center gap-2">
                  <PaperButton tone="gold" onClick={onNewQuest}>
                    <span className="inline-flex items-center gap-1.5">
                      <Plus size={16} strokeWidth={3} /> Write one
                    </span>
                  </PaperButton>
                  <SketchArrow className="h-8 w-14 -scale-x-100 text-clay" />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* mobile new-quest button */}
      <div className="mt-4 sm:hidden">
        <PaperButton tone="gold" size="lg" className="w-full" onClick={onNewQuest}>
          <span className="inline-flex items-center justify-center gap-2">
            <Plus size={18} strokeWidth={3} /> Pin a new quest
          </span>
        </PaperButton>
      </div>
    </section>
  );
}
