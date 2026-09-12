import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ATTRIBUTES, REALMS, RANKS, shopItem, titleForLevel } from "../game/config";
import {
  applyXP,
  dateKey,
  freshState,
  makeQuest,
  removeXP,
  uid,
  type QuestDraft,
} from "../game/engine";
import {
  AuthServiceError,
  onAuthUpdate,
  signInUser,
  signOutUser,
  signUpUser,
  type ApiUser as AuthUser,
} from "../services/authService";
import {
  addQuestToApi,
  buyCosmeticViaApi,
  completeQuestViaApi,
  deleteQuestViaApi,
  equipCosmeticViaApi,
  fetchQuestsOnce,
  RepositoryError,
  resolveStreakViaApi,
  restoreQuestViaApi,
  subscribeToQuests,
  subscribeToUserData,
  updateDisplayNameViaApi,
} from "../services/apiRepository";
import type {
  ChronicleEntry,
  CompletionResult,
  GameState,
  Quest,
} from "../game/types";

export interface Toast {
  id: string;
  headline: string;
  lines: string[];
  tone: "xp" | "gold" | "streak" | "shop" | "info" | "error";
}

export interface LevelUpEvent {
  level: number;
  title: string;
  gained: number;
}

export type ConnectionMode = "cloud" | "local";

/* ================================================================== *
 *  useGameState
 *
 *  Architecture:
 *
 *    Local Auth     → who is this?
 *    localStorage   → what have they done?
 *    optimistic     → the UI never waits for the network
 *
 *  Every mutation follows the same three beats:
 *    1. apply the change locally so the rubber stamp fires immediately
  *    2. hand the write to localStorage
 *    3. the subscription then confirms with authoritative data
 * ================================================================== */
export function useGameState() {
  const [state, setState] = useState<GameState>(() => freshState());

  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);

  const [online, setOnline] = useState(true);
  const [showOfflineNotice, setShowOfflineNotice] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [levelUp, setLevelUp] = useState<LevelUpEvent | null>(null);
  const [justCompleted, setJustCompleted] = useState<string | null>(null);

  /** always-fresh mirrors so async callbacks never read stale state */
  const ref = useRef(state);
  ref.current = state;
  const userRef = useRef<AuthUser | null>(null);
  userRef.current = authUser;
  const onlineRef = useRef(true);

  const unsubUser = useRef<(() => void) | null>(null);
  const unsubQuests = useRef<(() => void) | null>(null);
  const levelUpShown = useRef<string>("");

  /* ---------------- helpers ---------------- */

  const commit = useCallback((next: GameState) => {
    ref.current = next;
    setState(next);
  }, []);

  const pushToast = useCallback((t: Omit<Toast, "id">) => {
    const toast: Toast = { ...t, id: uid() };
    setToasts((prev) => [...prev.slice(-3), toast]);
    window.setTimeout(
      () => setToasts((prev) => prev.filter((x) => x.id !== toast.id)),
      3500,
    );
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const note = (
    doc: GameState,
    text: string,
    kind: ChronicleEntry["kind"],
  ): ChronicleEntry[] =>
    [{ id: uid(), text, at: new Date().toISOString(), kind }, ...doc.chronicle].slice(
      0,
      24,
    );

  const reportError = useCallback(
    (err: unknown, fallback: string) => {
      const repoErr = err instanceof RepositoryError ? err : null;
      const authErr = err instanceof AuthServiceError ? err : null;
      const offline = repoErr?.offline || authErr?.offline || !onlineRef.current;

      if (offline) {
        // Local storage remains the source of truth while offline.
        setOnline(false);
        setShowOfflineNotice(true);
        return;
      }
      pushToast({
        headline: "Oops! The ink spilled (Server error).",
        lines: [repoErr?.message ?? authErr?.message ?? fallback],
        tone: "error",
      });
    },
    [pushToast],
  );

  /* ---------------- local persistence ---------------- */
  useEffect(() => {
    if (!authReady) return;
  }, [state, authReady]);

  /* ================================================================== *
   *  AUTH + REAL-TIME SUBSCRIPTIONS
   * ================================================================== */

  useEffect(() => {
    const stopAuth = onAuthUpdate((user) => {
      setAuthUser(user);
      setAuthReady(true);

      // Tear down the previous account's listeners before opening new ones.
      unsubUser.current?.();
      unsubQuests.current?.();
      unsubUser.current = null;
      unsubQuests.current = null;

      if (!user) {
        commit(freshState());
        return;
      }

      // ——— profile ———
      unsubUser.current = subscribeToUserData(
        user.id,
        (data) => {
          if (!data) return; // profile not provisioned yet
          const cur = ref.current;
          commit({
            ...cur,
            user: data.user,
            attributes: data.attributes,
            cosmetics: data.cosmetics,
            chronicle: cur.chronicle.length
              ? cur.chronicle
              : [
                  {
                    id: uid(),
                    text: `Opened the journal — ${data.user.name}.`,
                    at: new Date().toISOString(),
                    kind: "start",
                  },
                ],
          });
        },
        (err) => reportError(err, "Could not read your journal."),
      );

      // ——— quests ———
      unsubQuests.current = subscribeToQuests(
        user.id,
        (quests) => {
          commit({ ...ref.current, quests });
        },
        (err) => reportError(err, "Could not read your quest board."),
      );

      // ——— daily streak, exactly once per day, atomically ———
      resolveStreakViaApi(user.id, dateKey())
        .then((result) => {
          if (!result || result.outcome === "same-day") return;
          if (result.outcome === "continued") {
            pushToast({
              headline: `🔥 ${result.streak}-day streak!`,
              lines: ["The chain holds.", `+${result.bonusGold} gold for showing up`],
              tone: "streak",
            });
          } else if (result.outcome === "broken") {
            pushToast({
              headline: "🕯️ A fresh chain",
              lines: ["Day 1 starts now.", `+${result.bonusGold} gold`],
              tone: "streak",
            });
          } else {
            pushToast({
              headline: "🌱 A new journal",
              lines: ["Four starter quests are pinned", "welcome, wanderer"],
              tone: "info",
            });
          }
        })
        .catch((err) => reportError(err, "Could not update your streak."));
    });

    return () => {
      stopAuth();
      unsubUser.current?.();
      unsubQuests.current?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ================================================================== *
   *  OFFLINE / ONLINE
   * ================================================================== */

  useEffect(() => {
    const syncOnline = () => setOnline(navigator.onLine);
    syncOnline();

    const goOffline = () => {
      onlineRef.current = false;
      setOnline(false);
      setShowOfflineNotice(true);
    };
    const goOnline = () => {
      onlineRef.current = true;
      setOnline(true);
      setShowOfflineNotice(false);
      pushToast({
        headline: "Back online",
        lines: ["Syncing your journal with the cloud"],
        tone: "info",
      });
    };

    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    onlineRef.current = navigator.onLine;

    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, [pushToast]);

  /** Mirror `online` into a ref for use inside async callbacks. */
  useEffect(() => {
    onlineRef.current = online;
  }, [online]);

  /* ================================================================== *
   *  AUTH ACTIONS
   * ================================================================== */

  const signIn = useCallback(
    async (email: string, password: string): Promise<string | null> => {
      setAuthBusy(true);
      try {
        await signInUser(email, password);
        return null;
      } catch (err) {
        return err instanceof AuthServiceError
          ? err.message
          : "Opening that journal failed.";
      } finally {
        setAuthBusy(false);
      }
    },
    [],
  );

  const signUp = useCallback(
    async (email: string, password: string, username: string): Promise<string | null> => {
      setAuthBusy(true);
      try {
        await signUpUser(email, password, username);
        return null;
      } catch (err) {
        return err instanceof AuthServiceError
          ? err.message
          : "Binding that journal failed.";
      } finally {
        setAuthBusy(false);
      }
    },
    [],
  );

  const signOut = useCallback(async () => {
    try {
      await signOutUser();
    } catch (err) {
      reportError(err, "Signing out failed.");
    } finally {
      commit(freshState());
    }
  }, [commit, reportError]);

  const sync = useCallback(async () => {
    const user = userRef.current;
    if (!user) return;
    setSyncing(true);
    try {
      const quests = await fetchQuestsOnce(user.id);
      commit({ ...ref.current, quests });
      pushToast({ headline: "Synced", lines: ["Board refreshed"], tone: "info" });
    } catch (err) {
      reportError(err, "Sync failed.");
    } finally {
      setSyncing(false);
    }
  }, [commit, pushToast, reportError]);

  /* ================================================================== *
   *  QUESTS
   * ================================================================== */

  const addQuest = useCallback(
    (draft: QuestDraft) => {
      const doc = ref.current;
      const quest = makeQuest(draft);

      // ——— 1. optimistic: the card appears instantly ———
      commit({
        ...doc,
        quests: [quest, ...doc.quests],
        chronicle: note(doc, `Pinned “${quest.title}” to the board.`, "quest"),
      });
      pushToast({
        headline: "Pinned to the board",
        lines: [
          `“${quest.title}”`,
          `${RANKS[quest.rank].label} · ${REALMS[quest.realm].name}`,
        ],
        tone: "info",
      });

      // ——— 2. persist ———
      const user = userRef.current;
      if (user) {
        addQuestToApi(user.id, quest).catch((err) =>
          reportError(err, "Could not pin that quest."),
        );
      }
      return quest;
    },
    [commit, pushToast, reportError],
  );

  const completeQuest = useCallback(
    (id: string): CompletionResult | null => {
      const doc = ref.current;
      const quest = doc.quests.find((q) => q.id === id);
      if (!quest || quest.status === "completed") return null;

      const realm = REALMS[quest.realm];
      const attribute = realm.attribute;
      const attributeGain = RANKS[quest.rank].attr;

      // ——— 1. optimistic ———
      const xpRes = applyXP(doc.user.level, doc.user.currentXP, quest.rewardXP);
      const leveledUp = xpRes.levelsGained > 0;
      const stamped: Quest = {
        ...quest,
        status: "completed",
        completedAt: new Date().toISOString(),
      };

      let chronicle = note(doc, `Completed “${quest.title}” (+${quest.rewardXP} XP).`, "quest");
      if (leveledUp) {
        const levelNote: ChronicleEntry = {
          id: uid(),
          text: `Reached level ${xpRes.level} — ${titleForLevel(xpRes.level)}.`,
          at: new Date().toISOString(),
          kind: "level",
        };
        chronicle = [levelNote, ...chronicle].slice(0, 24);
      }

      commit({
        ...doc,
        user: {
          ...doc.user,
          level: xpRes.level,
          currentXP: xpRes.currentXP,
          maxXP: xpRes.maxXP,
          gold: doc.user.gold + quest.rewardGold,
          questsCompleted: doc.user.questsCompleted + 1,
          title: titleForLevel(xpRes.level),
        },
        attributes: {
          ...doc.attributes,
          [attribute]: doc.attributes[attribute] + attributeGain,
        },
        quests: doc.quests.map((q) => (q.id === id ? stamped : q)),
        chronicle,
      });

      // Tactile feedback + the floating +XP. These must not depend on the
      // network, or the rubber stamp would feel broken on a train.
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate?.(leveledUp ? [18, 40, 26] : 14);
      }
      setJustCompleted(id);
      window.setTimeout(
        () => setJustCompleted((cur) => (cur === id ? null : cur)),
        1500,
      );

      pushToast({
        headline: `+${quest.rewardXP} XP`,
        lines: [
          `+${quest.rewardGold} gold · ${ATTRIBUTES[attribute].label} +${attributeGain}`,
          `“${quest.title}” → Memories`,
        ],
        tone: "xp",
      });

      if (leveledUp && levelUpShown.current !== `${id}:${xpRes.level}`) {
        levelUpShown.current = `${id}:${xpRes.level}`;
        window.setTimeout(() => {
          setLevelUp({
            level: xpRes.level,
            title: titleForLevel(xpRes.level),
            gained: xpRes.levelsGained,
          });
        }, 520);
      }

      // ——— 2. persist atomically ———
      const user = userRef.current;
      if (user) {
        completeQuestViaApi(user.id, id, {
          xp: quest.rewardXP,
          gold: quest.rewardGold,
          attribute,
          attributeGain,
        }).catch((err) => reportError(err, "Could not save that completion."));
      }

      return {
        quest: stamped,
        xp: quest.rewardXP,
        gold: quest.rewardGold,
        attribute,
        attributeGain,
        leveledUp,
        newLevel: xpRes.level,
        levelsGained: xpRes.levelsGained,
      };
    },
    [commit, pushToast, reportError],
  );

  const restoreQuest = useCallback(
    (id: string) => {
      const doc = ref.current;
      const quest = doc.quests.find((q) => q.id === id);
      if (!quest || quest.status !== "completed") return;

      const attribute = REALMS[quest.realm].attribute;
      const attrGain = RANKS[quest.rank].attr;

      const xpRes = removeXP(doc.user.level, doc.user.currentXP, quest.rewardXP);

      commit({
        ...doc,
        user: {
          ...doc.user,
          level: xpRes.level,
          currentXP: xpRes.currentXP,
          maxXP: xpRes.maxXP,
          title: titleForLevel(xpRes.level),
          gold: Math.max(0, doc.user.gold - quest.rewardGold),
          questsCompleted: Math.max(0, doc.user.questsCompleted - 1),
        },
        attributes: {
          ...doc.attributes,
          [attribute]: Math.max(1, doc.attributes[attribute] - attrGain),
        },
        quests: doc.quests.map((q) =>
          q.id === id ? { ...q, status: "active", completedAt: undefined } : q,
        ),
        chronicle: note(doc, `Un-stamped “${quest.title}”. Back to the board.`, "quest"),
      });
      pushToast({
        headline: "Back on the board",
        lines: [`“${quest.title}” is active again`, "rewards returned"],
        tone: "info",
      });

      const user = userRef.current;
      if (user) {
        restoreQuestViaApi(user.id, id, {
          xp: quest.rewardXP,
          gold: quest.rewardGold,
          attribute,
          attributeGain: attrGain,
        }).catch((err) => reportError(err, "Could not un-stamp that quest."));
      }
    },
    [commit, pushToast, reportError],
  );

  const deleteQuest = useCallback(
    (id: string) => {
      const doc = ref.current;
      const quest = doc.quests.find((q) => q.id === id);
      if (!quest) return;

      commit({
        ...doc,
        quests: doc.quests.filter((q) => q.id !== id),
        chronicle: note(doc, `Tore “${quest.title}” off the board.`, "quest"),
      });

      const user = userRef.current;
      if (user) {
        deleteQuestViaApi(user.id, id).catch((err) =>
          reportError(err, "Could not tear that card off the board."),
        );
      }
    },
    [commit, reportError],
  );

  /* ================================================================== *
   *  SHOP
   * ================================================================== */

  const buyItem = useCallback(
    (itemId: string) => {
      const doc = ref.current;
      const item = shopItem(itemId);
      if (!item || doc.cosmetics.owned.includes(itemId)) return false;

      if (doc.user.gold < item.price) {
        pushToast({
          headline: "Not enough gold",
          lines: [`“${item.name}” costs ${item.price}`, "finish a quest or two"],
          tone: "info",
        });
        return false;
      }

      commit({
        ...doc,
        user: { ...doc.user, gold: doc.user.gold - item.price },
        cosmetics: {
          owned: [...doc.cosmetics.owned, itemId],
          equipped: { ...doc.cosmetics.equipped, [item.category]: itemId },
        },
        chronicle: note(doc, `Bought ${item.name} for ${item.price} gold.`, "shop"),
      });
      pushToast({
        headline: `Bought ${item.name}`,
        lines: [`−${item.price} gold`, "equipped to your board"],
        tone: "shop",
      });

      const user = userRef.current;
      if (user) {
        buyCosmeticViaApi(user.id, itemId, item.price, item.category).catch(
          (err) => reportError(err, "Could not buy that."),
        );
      }
      return true;
    },
    [commit, pushToast, reportError],
  );

  const equipItem = useCallback(
    (itemId: string) => {
      const doc = ref.current;
      const item = shopItem(itemId);
      if (!item || !doc.cosmetics.owned.includes(itemId)) return;

      commit({
        ...doc,
        cosmetics: {
          ...doc.cosmetics,
          equipped: { ...doc.cosmetics.equipped, [item.category]: itemId },
        },
      });

      const user = userRef.current;
      if (user) {
        equipCosmeticViaApi(user.id, item.category, itemId).catch((err) =>
          reportError(err, "Could not equip that."),
        );
      }
    },
    [commit, reportError],
  );

  /* ================================================================== *
   *  PROFILE
   * ================================================================== */

  const renameUser = useCallback(
    (name: string) => {
      const doc = ref.current;
      const clean = name.trim().slice(0, 22) || "Wanderer";
      commit({ ...doc, user: { ...doc.user, name: clean } });

      const user = userRef.current;
      if (user) {
        updateDisplayNameViaApi(user.id, clean).catch((err) =>
          reportError(err, "Could not save your name."),
        );
      }
    },
    [commit, reportError],
  );

  const resetGame = useCallback(() => {
    if (userRef.current) {
      pushToast({
        headline: "Not while synced",
        lines: ["Sign out first to start a local journal", "your cloud journal stays put"],
        tone: "info",
      });
      return;
    }
    commit(freshState(ref.current.user.name));
    pushToast({
      headline: "A blank page",
      lines: ["The journal has been re-bound", "everything starts again"],
      tone: "info",
    });
  }, [commit, pushToast]);

  /* ================================================================== *
   *  DERIVED
   * ================================================================== */

  const activeQuests = useMemo(
    () => state.quests.filter((q) => q.status === "active"),
    [state.quests],
  );
  const memories = useMemo(
    () =>
      state.quests
        .filter((q) => q.status === "completed")
        .sort((a, b) => (b.completedAt ?? "").localeCompare(a.completedAt ?? "")),
    [state.quests],
  );
  const xpPercent = Math.min(
    100,
    Math.round((state.user.currentXP / Math.max(1, state.user.maxXP)) * 100),
  );
  const power = useMemo(
    () => Object.values(state.attributes).reduce((a, b) => a + b, 0),
    [state.attributes],
  );

  const mode: ConnectionMode = authUser ? "cloud" : "local";
  const loading = !authReady;

  return {
    state,
    user: state.user,
    attributes: state.attributes,
    cosmetics: state.cosmetics,
    chronicle: state.chronicle,
    activeQuests,
    memories,
    xpPercent,
    power,

    // connection
    mode,
    loading,
    syncing,
    authBusy,
    online,
    showOfflineNotice,
    dismissOfflineNotice: () => setShowOfflineNotice(false),
    authUser,
    isAuthenticated: Boolean(authUser),
    displayName:
      authUser?.username ??
      state.user.name,

    // events
    toasts,
    dismissToast,
    levelUp,
    clearLevelUp: () => setLevelUp(null),
    justCompleted,

    // actions
    signIn,
    signUp,
    signOut,
    sync,
    addQuest,
    completeQuest,
    restoreQuest,
    deleteQuest,
    buyItem,
    equipItem,
    renameUser,
    resetGame,
  };
}

export type GameApi = ReturnType<typeof useGameState>;
