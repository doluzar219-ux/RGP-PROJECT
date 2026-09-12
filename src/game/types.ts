/* ------------------------------------------------------------------ *
 *  Data contracts
 *
 *  The domain contracts stay independent from storage row shapes so the
 *  UI only deals with the game's typed state.
 *
 *  Local equivalent:  life_rpg_profile_{id} + life_rpg_quests_{id} -> GameState
 * ------------------------------------------------------------------ */

export type AttributeId = "intellect" | "strength" | "creativity" | "wisdom";

/** A Realm is the *category* of a quest; each realm trains one attribute. */
export type RealmId = "library" | "grove" | "atelier" | "pond";

/** Difficulty. Higher rank = fatter rewards. */
export type RankId = "E" | "D" | "C" | "B" | "A" | "S";

export type QuestStatus = "active" | "completed";

export interface Quest {
  id: string;
  title: string;
  details: string;
  realm: RealmId;
  rank: RankId;
  rewardXP: number;
  rewardGold: number;
  status: QuestStatus;
  /** ISO string — when the quest was pinned to the board */
  date: string;
  /** ISO string — when it was stamped complete */
  completedAt?: string;
  /** cosmetic seed so each card keeps its own tilt / pin position */
  seed: number;
}

export interface UserDoc {
  name: string;
  title: string;
  level: number;
  currentXP: number;
  maxXP: number;
  gold: number;
  streak: number;
  bestStreak: number;
  /** YYYY-MM-DD (local) */
  lastLogin: string;
  createdAt: string;
  questsCompleted: number;
}

export type Attributes = Record<AttributeId, number>;

export interface Cosmetics {
  owned: string[];
  equipped: {
    tape: string;
    pin: string;
    paper: string;
  };
}

export interface GameState {
  schema: number;
  user: UserDoc;
  attributes: Attributes;
  quests: Quest[];
  cosmetics: Cosmetics;
  /** short human-readable history for the "chronicle" strip */
  chronicle: ChronicleEntry[];
}

export interface ChronicleEntry {
  id: string;
  text: string;
  at: string;
  kind: "quest" | "level" | "streak" | "shop" | "start";
}

/** What a completion hands back to the UI so it can celebrate. */
export interface CompletionResult {
  quest: Quest;
  xp: number;
  gold: number;
  attribute: AttributeId;
  attributeGain: number;
  leveledUp: boolean;
  newLevel: number;
  levelsGained: number;
}
