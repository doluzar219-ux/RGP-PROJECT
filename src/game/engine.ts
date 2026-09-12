import { BASE_XP, DEFAULT_COSMETICS, RANKS, XP_MULTIPLIER, titleForLevel } from "./config";
import type { GameState, Quest, RankId, RealmId, UserDoc } from "./types";

/* ------------------------------------------------------------------ *
 *  ids & dates
 * ------------------------------------------------------------------ */
export const uid = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

/** local YYYY-MM-DD (never UTC — streaks must feel like *your* midnight) */
export function dateKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function keyToDate(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

/** whole days from a → b (positive when b is later) */
export function daysBetween(a: string, b: string): number {
  const ms = keyToDate(b).getTime() - keyToDate(a).getTime();
  return Math.round(ms / 86_400_000);
}

export function prettyDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function longDate(d: Date = new Date()): string {
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

/* ------------------------------------------------------------------ *
 *  THE LEVELLING ENGINE
 *  NextLevelXP = BASE_XP * (MULTIPLIER ^ (level - 1))
 * ------------------------------------------------------------------ */
export function xpForLevel(level: number): number {
  return Math.round(BASE_XP * Math.pow(XP_MULTIPLIER, Math.max(0, level - 1)));
}

export interface XPResult {
  level: number;
  currentXP: number;
  maxXP: number;
  levelsGained: number;
}

/** Adds XP, rolling over any remainder into the next level(s). */
export function applyXP(level: number, currentXP: number, gain: number): XPResult {
  let lvl = level;
  let xp = currentXP + Math.max(0, Math.round(gain));
  let threshold = xpForLevel(lvl);
  let levelsGained = 0;

  // guard against silly numbers freezing the loop
  while (xp >= threshold && levelsGained < 100) {
    xp -= threshold; // carry over the remainder
    lvl += 1;
    levelsGained += 1;
    threshold = xpForLevel(lvl);
  }

  return { level: lvl, currentXP: xp, maxXP: threshold, levelsGained };
}

/**
 * Walks XP backwards — used when a completed quest is un-stamped, so the
 * refund can drop the player back across a level boundary.
 */
export function removeXP(level: number, currentXP: number, loss: number): XPResult {
  let lvl = Math.max(1, level);
  let xp = currentXP - Math.max(0, Math.round(loss));
  while (xp < 0 && lvl > 1) {
    lvl -= 1;
    xp += xpForLevel(lvl);
  }
  if (xp < 0) xp = 0;
  return { level: lvl, currentXP: xp, maxXP: xpForLevel(lvl), levelsGained: 0 };
}

/* ------------------------------------------------------------------ *
 *  DAILY STREAK
 *  - same day        → nothing happens
 *  - exactly +1 day  → streak grows
 *  - a gap           → streak resets (today becomes day 1 again)
 * ------------------------------------------------------------------ */
export type StreakOutcome = "same-day" | "continued" | "broken" | "first";

export function resolveStreak(
  user: UserDoc,
  today = dateKey(),
): { user: UserDoc; outcome: StreakOutcome; bonusGold: number } {
  if (!user.lastLogin) {
    return {
      user: {
        ...user,
        lastLogin: today,
        streak: 1,
        bestStreak: Math.max(1, user.bestStreak),
        gold: user.gold + 10,
      },
      outcome: "first",
      bonusGold: 10,
    };
  }

  const gap = daysBetween(user.lastLogin, today);

  if (gap <= 0) return { user, outcome: "same-day", bonusGold: 0 };

  if (gap === 1) {
    const streak = user.streak + 1;
    const bonusGold = 10 + Math.min(streak, 14) * 2;
    return {
      user: {
        ...user,
        streak,
        bestStreak: Math.max(streak, user.bestStreak),
        lastLogin: today,
        gold: user.gold + bonusGold,
      },
      outcome: "continued",
      bonusGold,
    };
  }

  // gap > 1 → the chain is broken. Reset to 0, then today counts as day 1.
  const streak = 0 + 1;
  return {
    user: { ...user, streak, lastLogin: today, gold: user.gold + 10 },
    outcome: "broken",
    bonusGold: 10,
  };
}

/* ------------------------------------------------------------------ *
 *  Quest factory
 * ------------------------------------------------------------------ */
export interface QuestDraft {
  title: string;
  details?: string;
  realm: RealmId;
  rank: RankId;
}

export function makeQuest(draft: QuestDraft): Quest {
  const rank = RANKS[draft.rank];
  return {
    id: uid(),
    title: draft.title.trim(),
    details: (draft.details ?? "").trim(),
    realm: draft.realm,
    rank: draft.rank,
    rewardXP: rank.xp,
    rewardGold: rank.gold,
    status: "active",
    date: new Date().toISOString(),
    seed: Math.floor(Math.random() * 1000),
  };
}

/* ------------------------------------------------------------------ *
 *  A fresh save file (with a few starter cards so the board isn't bare)
 * ------------------------------------------------------------------ */
export function freshState(name = "Wanderer"): GameState {
  const now = new Date();
  const iso = now.toISOString();
  const starters: Quest[] = [
    {
      ...makeQuest({
        title: "Drink a glass of water",
        details: "The lowest-effort win there is. Start the chain somewhere.",
        realm: "pond",
        rank: "E",
      }),
      seed: 120,
    },
    {
      ...makeQuest({
        title: "Read 10 pages of anything",
        details: "Paper, screen, cereal box. Ten pages counts.",
        realm: "library",
        rank: "D",
      }),
      seed: 430,
    },
    {
      ...makeQuest({
        title: "Twenty minutes of moving",
        details: "A walk around the block is a legitimate expedition.",
        realm: "grove",
        rank: "C",
      }),
      seed: 770,
    },
    {
      ...makeQuest({
        title: "Make one small ugly thing",
        details: "A doodle, four bars of a song, a bad poem. Finished > good.",
        realm: "atelier",
        rank: "D",
      }),
      seed: 910,
    },
  ];

  return {
    schema: 1,
    user: {
      name,
      title: titleForLevel(1),
      level: 1,
      currentXP: 0,
      maxXP: xpForLevel(1),
      gold: 45,
      streak: 0,
      bestStreak: 0,
      // left blank on purpose: the first streak check will greet you
      lastLogin: "",
      createdAt: iso,
      questsCompleted: 0,
    },
    attributes: { intellect: 1, strength: 1, creativity: 1, wisdom: 1 },
    quests: starters,
    cosmetics: { ...DEFAULT_COSMETICS, owned: [...DEFAULT_COSMETICS.owned] },
    chronicle: [
      {
        id: uid(),
        text: "Opened a brand-new quest log. The first page always smells best.",
        at: iso,
        kind: "start",
      },
    ],
  };
}
