import { useCallback, useEffect, useState } from "react";
import { MotionConfig, motion } from "framer-motion";
import {
  CloudOff,
  Loader2,
  LogIn,
  LogOut,
  Plus,
  Sparkles,
} from "lucide-react";
import { AuthModal } from "./components/AuthModal";
import { Chronicle } from "./components/Chronicle";
import { LevelUpOverlay } from "./components/LevelUpOverlay";
import { NewQuestModal } from "./components/NewQuestModal";
import { OfflineNotice } from "./components/OfflineNotice";
import { PaperButton, StickyNote, WashiTape, CoffeeRing } from "./components/Bits";
import { QuestBoard } from "./components/QuestBoard";
import { RewardShop } from "./components/RewardShop";
import { ToastStack } from "./components/ToastStack";
import { UserProfile } from "./components/UserProfile";
import { shopItem } from "./game/config";
import { longDate } from "./game/engine";
import { useGameState } from "./hooks/useGameState";

export default function App() {
  const game = useGameState();
  const [modalOpen, setModalOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  /* equipped cosmetics ------------------------------------------------ */
  const tape =
    shopItem(game.cosmetics.equipped.tape)?.tape ?? "linear-gradient(135deg,#f6c9ce,#e5a1aa)";
  const pin = shopItem(game.cosmetics.equipped.pin)?.pin ?? { color: "#c8913f" };
  const paper = shopItem(game.cosmetics.equipped.paper)?.paper ?? { bg: "#fffcf2" };

  /* keyboard shortcut: N pins a new quest, Escape closes modals -------- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setModalOpen(false);
        setAuthOpen(false);
        return;
      }
      const el = document.activeElement as HTMLElement | null;
      const typing =
        el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
      if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key.toLowerCase() === "n") {
        e.preventDefault();
        setModalOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const openModal = useCallback(() => setModalOpen(true), []);

  /* ——— boot: local session resolves immediately ——— */
  if (game.loading) {
    return (
      <div className="desk grain grid min-h-screen place-items-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-3"
        >
          <Loader2 size={30} className="animate-spin text-clay" />
          <p className="font-hand text-2xl text-ink-soft">opening your journal…</p>
        </motion.div>
      </div>
    );
  }

  /* ——— cover page: sign in, or keep the journal on this device ——— */
  if (!game.isAuthenticated) {
    return (
      <>
        <div className="desk grain relative grid min-h-screen place-items-center p-5">
          <motion.div
            initial={{ y: 26, opacity: 0, rotate: -3 }}
            animate={{ y: 0, opacity: 1, rotate: -1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="paper-card grain relative w-full max-w-md rounded-[4px] px-8 py-10"
            style={{ ["--card-bg" as string]: "#fffdf6" }}
          >
            <WashiTape background={tape} rotate={-9} className="-top-3 left-8 h-6 w-28" />
            <WashiTape background={tape} rotate={7} className="-top-3 right-7 h-6 w-20" />

            <h1 className="font-marker text-[2.1rem] leading-[0.95] text-ink">
              the everyday
              <br />
              <span className="text-clay">quest log</span>
            </h1>
            <p className="mt-3 font-hand text-xl leading-snug text-ink-soft">
              A paper scrapbook for turning very ordinary days into a slightly
              heroic adventure. Bind it to an address and it follows you
              everywhere.
            </p>

            <div className="mt-7">
              <PaperButton
                tone="gold"
                size="lg"
                className="w-full"
                onClick={() => setAuthOpen(true)}
              >
                <span className="inline-flex items-center justify-center gap-2">
                  <LogIn size={18} strokeWidth={2.8} /> Open or bind a journal
                </span>
              </PaperButton>
            </div>

          </motion.div>
        </div>

        <AuthModal
          open={authOpen}
          busy={game.authBusy}
          onClose={() => setAuthOpen(false)}
          onSignIn={game.signIn}
          onSignUp={game.signUp}
        />
      </>
    );
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="desk grain relative min-h-screen pb-14">
        <a
          href="#board-heading"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[70] focus:rounded-md focus:bg-card focus:px-3 focus:py-2 focus:font-print focus:outline-none focus:ring-2 focus:ring-amber-800 focus:ring-offset-2"
        >
          Skip to the quest board
        </a>

        {/* coffee rings someone carelessly left on the desk */}
        <CoffeeRing className="right-[6%] top-[7rem] hidden rotate-12 xl:block" size={150} />
        <CoffeeRing className="left-[2%] top-[62%] hidden -rotate-6 2xl:block" size={110} />

        {/* ——————————————————— HEADER ——————————————————— */}
        <header className="relative z-10 mx-auto max-w-[1500px] px-4 pt-7 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <motion.div
              initial={{ y: -26, opacity: 0, rotate: -3 }}
              animate={{ y: 0, opacity: 1, rotate: -1.2 }}
              transition={{ type: "spring", stiffness: 180, damping: 18 }}
              className="relative"
            >
              <WashiTape background={tape} rotate={-14} className="-left-4 -top-3 h-6 w-24" />
              <h1 className="font-marker text-[2rem] leading-[0.95] text-ink sm:text-[2.8rem]">
                the everyday
                <br />
                <span className="text-clay">quest log</span>
              </h1>
              <p className="mt-1.5 max-w-md font-hand text-xl leading-tight text-ink-soft">
                a paper scrapbook for turning very ordinary days into a slightly heroic
                adventure.
              </p>
            </motion.div>

            <motion.div
              initial={{ y: -14, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.12 }}
              className="flex flex-wrap items-end gap-3"
            >
              {/* where the journal lives */}
              <div
                className="paper-card grain flex -rotate-1 items-center gap-2 rounded-[2px] px-3 py-2"
                style={{ ["--card-bg" as string]: "#fffdf6" }}
              >
                <CloudOff size={16} className="shrink-0 text-ink-faint" strokeWidth={2.6} />
                <span className="leading-none">
                  <span className="block font-body text-[9px] font-black uppercase tracking-[0.18em] text-ink-faint">
                    {game.mode === "cloud" ? "MongoDB cloud" : "not signed in"}
                  </span>
                  <span className="block font-hand text-base text-ink">
                    {game.isAuthenticated ? game.displayName : "sign in to sync"}
                  </span>
                </span>

                {game.isAuthenticated && (
                  <button
                    type="button"
                    onClick={game.signOut}
                    aria-label="Sign out"
                    className="rounded-full p-1 text-ink-faint transition hover:text-wine focus:outline-none focus:ring-2 focus:ring-amber-800 focus:ring-offset-2"
                  >
                    <LogOut size={14} />
                  </button>
                )}
                {!game.isAuthenticated && (
                  <button
                    type="button"
                    onClick={() => setAuthOpen(true)}
                    aria-label="Sign in to sync this journal"
                    className="rounded-full p-1 text-ink-faint transition hover:text-clay focus:outline-none focus:ring-2 focus:ring-amber-800 focus:ring-offset-2"
                  >
                    <LogIn size={14} />
                  </button>
                )}
              </div>

              {/* torn date ticket */}
              <div
                className="paper-card grain hidden rotate-[1.6deg] rounded-[2px] px-3 py-2 text-center lg:block"
                style={{ ["--card-bg" as string]: "#fffdf6" }}
              >
                <span className="block font-body text-[9px] font-black uppercase tracking-[0.2em] text-ink-faint">
                  today
                </span>
                <span className="block font-hand text-lg leading-tight text-ink">
                  {longDate()}
                </span>
              </div>

              <PaperButton tone="clay" size="lg" onClick={openModal} className="shrink-0">
                <span className="inline-flex items-center gap-2">
                  <Plus size={18} strokeWidth={3} /> New quest
                  <kbd className="hidden rounded border border-ink/40 px-1 font-body text-[10px] font-black sm:inline">
                    N
                  </kbd>
                </span>
              </PaperButton>
            </motion.div>
          </div>

          {/* hand-drawn divider */}
          <svg
            viewBox="0 0 1200 12"
            preserveAspectRatio="none"
            className="mt-5 h-3 w-full text-ink/35"
            aria-hidden
          >
            <path
              d="M2 7c120-5 240 4 360-1S600 2 720 6s240 5 478-2"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </svg>
        </header>

        {/* ——————————————————— BODY ——————————————————— */}
        <main className="mx-auto mt-6 grid max-w-[1500px] grid-cols-1 gap-6 px-4 sm:px-6 lg:grid-cols-[minmax(17rem,21rem)_minmax(0,1fr)] lg:gap-8 lg:px-8">
          <div>
            <div className="flex flex-col gap-6 lg:sticky lg:top-6">
              <UserProfile
                user={game.user}
                attributes={game.attributes}
                xpPercent={game.xpPercent}
                power={game.power}
                tape={tape}
                onRename={game.renameUser}
              />
              <div className="hidden lg:block">
                <Chronicle entries={game.chronicle} onReset={game.resetGame} />
              </div>
              <StickyNote className="hidden lg:block" rotate={-2.4}>
                <span className="font-marker text-base">tip</span> — rank{" "}
                <span className="font-marker">S</span> is for the big scary thing you
                keep avoiding. One a month is plenty. 🖇️
              </StickyNote>
            </div>
          </div>

          <div className="flex flex-col gap-8">
            <QuestBoard
              quests={game.state.quests}
              justCompleted={game.justCompleted}
              tape={tape}
              pin={pin}
              paper={paper}
              onComplete={game.completeQuest}
              onDelete={game.deleteQuest}
              onRestore={game.restoreQuest}
              onNewQuest={openModal}
            />

            <RewardShop
              gold={game.user.gold}
              cosmetics={game.cosmetics}
              onBuy={game.buyItem}
              onEquip={game.equipItem}
            />

            <div className="lg:hidden">
              <Chronicle entries={game.chronicle} onReset={game.resetGame} />
            </div>
          </div>
        </main>

        {/* ——————————————————— FOOTER ——————————————————— */}
        <footer className="mx-auto mt-12 max-w-[1500px] px-4 sm:px-6 lg:px-8">
          <p className="flex flex-wrap items-center justify-center gap-2 text-center font-hand text-lg text-ink-soft">
            <Sparkles size={15} className="text-marigold" />
            "Your journal is stored securely in this browser and updates instantly."
            <span className="text-ink-faint">Press</span>
            <kbd className="rounded border-2 border-ink/40 px-1.5 font-body text-[10px] font-black">
              N
            </kbd>
            <span className="text-ink-faint">to pin a quest · Tab + Enter to finish one.</span>
          </p>
        </footer>

        {/* ——————————————————— OVERLAYS ——————————————————— */}
        <NewQuestModal
          open={modalOpen}
          tape={tape}
          onClose={() => setModalOpen(false)}
          onSubmit={game.addQuest}
        />
        <AuthModal
          open={authOpen}
          busy={game.authBusy}
          onClose={() => setAuthOpen(false)}
          onSignIn={game.signIn}
          onSignUp={game.signUp}
        />
        <LevelUpOverlay event={game.levelUp} tape={tape} onClose={game.clearLevelUp} />
        <ToastStack toasts={game.toasts} onDismiss={game.dismissToast} />
        <OfflineNotice
          show={game.showOfflineNotice && !game.online}
          onDismiss={game.dismissOfflineNotice}
          onRetry={game.sync}
        />
      </div>
    </MotionConfig>
  );
}
