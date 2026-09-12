import {
  BookOpen,
  Dumbbell,
  Palette,
  Sprout,
  type LucideIcon,
} from "lucide-react";
import type { AttributeId, RankId, RealmId } from "./types";

/* ------------------------------------------------------------------ *
 *  LEVELLING ENGINE CONSTANTS
 *  NextLevelXP = BASE_XP * (MULTIPLIER ^ (level - 1))
 * ------------------------------------------------------------------ */
export const BASE_XP = 120;
export const XP_MULTIPLIER = 1.28;

/* ------------------------------------------------------------------ *
 *  REALMS — a quest's category. Each realm trains exactly one attribute.
 * ------------------------------------------------------------------ */
export interface RealmDef {
  id: RealmId;
  name: string;
  blurb: string;
  attribute: AttributeId;
  icon: LucideIcon;
  emoji: string;
  /** ink colour used for chips, pins and accents */
  color: string;
  tint: string;
}

export const REALMS: Record<RealmId, RealmDef> = {
  library: {
    id: "library",
    name: "The Library",
    blurb: "study · code · reading · learning",
    attribute: "intellect",
    icon: BookOpen,
    emoji: "📖",
    color: "#5e87a8",
    tint: "#e3eef6",
  },
  grove: {
    id: "grove",
    name: "The Iron Grove",
    blurb: "gym · running · chores · the body",
    attribute: "strength",
    icon: Dumbbell,
    emoji: "🪓",
    color: "#c06a3e",
    tint: "#fbe7dc",
  },
  atelier: {
    id: "atelier",
    name: "The Atelier",
    blurb: "art · music · writing · making things",
    attribute: "creativity",
    icon: Palette,
    emoji: "🎨",
    color: "#8f6cb0",
    tint: "#efe7f8",
  },
  pond: {
    id: "pond",
    name: "The Still Pond",
    blurb: "rest · people · journaling · the soul",
    attribute: "wisdom",
    icon: Sprout,
    emoji: "🌿",
    color: "#6b8f61",
    tint: "#e8f1e4",
  },
};

export const REALM_LIST = Object.values(REALMS);

/* ------------------------------------------------------------------ *
 *  ATTRIBUTES
 * ------------------------------------------------------------------ */
export const ATTRIBUTES: Record<
  AttributeId,
  { id: AttributeId; label: string; short: string; color: string; realm: RealmId }
> = {
  intellect: { id: "intellect", label: "Intellect", short: "INT", color: "#5e87a8", realm: "library" },
  strength: { id: "strength", label: "Strength", short: "STR", color: "#c06a3e", realm: "grove" },
  creativity: { id: "creativity", label: "Creativity", short: "CRE", color: "#8f6cb0", realm: "atelier" },
  wisdom: { id: "wisdom", label: "Wisdom", short: "WIS", color: "#6b8f61", realm: "pond" },
};

export const ATTRIBUTE_LIST = Object.values(ATTRIBUTES);

/* ------------------------------------------------------------------ *
 *  RANKS — difficulty → rewards
 * ------------------------------------------------------------------ */
export interface RankDef {
  id: RankId;
  label: string;
  xp: number;
  gold: number;
  attr: number;
  color: string;
}

export const RANKS: Record<RankId, RankDef> = {
  E: { id: "E", label: "a small kindness", xp: 25, gold: 6, attr: 1, color: "#9aa39a" },
  D: { id: "D", label: "an ordinary errand", xp: 45, gold: 12, attr: 1, color: "#8fae86" },
  C: { id: "C", label: "a proper venture", xp: 80, gold: 22, attr: 2, color: "#85aecb" },
  B: { id: "B", label: "a real trial", xp: 140, gold: 40, attr: 3, color: "#b39cd0" },
  A: { id: "A", label: "an odyssey", xp: 240, gold: 72, attr: 4, color: "#e0a63c" },
  S: { id: "S", label: "the stuff of legend", xp: 420, gold: 130, attr: 6, color: "#9c3d43" },
};

export const RANK_LIST = Object.values(RANKS);

/* ------------------------------------------------------------------ *
 *  LEVEL TITLES — flavour for the profile card
 * ------------------------------------------------------------------ */
const TITLES: [number, string][] = [
  [1, "Sleepy Sapling"],
  [3, "Curious Wanderer"],
  [5, "Keeper of Small Habits"],
  [8, "Pocket Adventurer"],
  [12, "Seasoned Daydreamer"],
  [16, "Lantern Bearer"],
  [21, "Chronicler of Ordinary Days"],
  [27, "Quiet Legend"],
  [35, "Mythic Human Being"],
];

export function titleForLevel(level: number): string {
  let title = TITLES[0][1];
  for (const [lvl, name] of TITLES) if (level >= lvl) title = name;
  return title;
}

/* ------------------------------------------------------------------ *
 *  THE REWARD SHOP — cosmetics bought with gold
 * ------------------------------------------------------------------ */
export type ShopCategory = "tape" | "pin" | "paper";

export interface ShopItem {
  id: string;
  name: string;
  blurb: string;
  price: number;
  category: ShopCategory;
  /** css background for washi tape */
  tape?: string;
  /** emoji or dot colour for the pin */
  pin?: { emoji?: string; color?: string };
  /** card paper look */
  paper?: { bg: string; pattern?: string; ink?: string };
}

export const SHOP_ITEMS: ShopItem[] = [
  // ——— WASHI TAPE ———
  {
    id: "tape-sakura",
    name: "Sakura Pink",
    blurb: "the roll you started with",
    price: 0,
    category: "tape",
    tape: "linear-gradient(135deg,#f6c9ce,#e5a1aa)",
  },
  {
    id: "tape-seaglass",
    name: "Sea Glass",
    blurb: "found on a cold beach",
    price: 60,
    category: "tape",
    tape: "linear-gradient(135deg,#b6ded8,#7fb8b4)",
  },
  {
    id: "tape-marigold",
    name: "Marigold",
    blurb: "smells faintly of autumn",
    price: 120,
    category: "tape",
    tape: "linear-gradient(135deg,#f7dda4,#e2ac4d)",
  },
  {
    id: "tape-lilac",
    name: "Lilac Fog",
    blurb: "soft, slightly translucent",
    price: 180,
    category: "tape",
    tape: "linear-gradient(135deg,#ddcef2,#b39cd0)",
  },
  {
    id: "tape-midnight",
    name: "Midnight Ink",
    blurb: "for very serious quests",
    price: 320,
    category: "tape",
    tape: "linear-gradient(135deg,#7d8cbb,#414d78)",
  },
  {
    id: "tape-carnival",
    name: "Carnival Stripe",
    blurb: "impractical. wonderful.",
    price: 480,
    category: "tape",
    tape: "repeating-linear-gradient(115deg,#f2b8a2 0 9px,#9cc4b8 9px 18px,#f0d79a 18px 27px)",
  },

  // ——— PINS & STICKERS ———
  {
    id: "pin-brass",
    name: "Brass Pushpin",
    blurb: "honest and dependable",
    price: 0,
    category: "pin",
    pin: { color: "#c8913f" },
  },
  {
    id: "pin-cherry",
    name: "Cherry Pin",
    blurb: "a tiny red full stop",
    price: 40,
    category: "pin",
    pin: { color: "#c8494f" },
  },
  {
    id: "pin-star",
    name: "Gold Star Sticker",
    blurb: "you were a good student",
    price: 150,
    category: "pin",
    pin: { emoji: "⭐" },
  },
  {
    id: "pin-clover",
    name: "Four-Leaf Clover",
    blurb: "pressed flat in a book",
    price: 260,
    category: "pin",
    pin: { emoji: "🍀" },
  },
  {
    id: "pin-moon",
    name: "Paper Moon",
    blurb: "for the night-owl quests",
    price: 340,
    category: "pin",
    pin: { emoji: "🌙" },
  },

  // ——— PAPER STOCK ———
  {
    id: "paper-cream",
    name: "Cream Index Card",
    blurb: "the classic. slightly toothy.",
    price: 0,
    category: "paper",
    paper: { bg: "#fffcf2" },
  },
  {
    id: "paper-aged",
    name: "Aged Parchment",
    blurb: "rescued from an attic",
    price: 200,
    category: "paper",
    paper: {
      bg: "#f4e4c4",
      pattern:
        "radial-gradient(circle at 12% 18%, rgba(170,128,68,.18), transparent 38%), radial-gradient(circle at 86% 76%, rgba(150,110,56,.18), transparent 42%)",
    },
  },
  {
    id: "paper-mint",
    name: "Mint Notebook",
    blurb: "ruled, faintly minty",
    price: 280,
    category: "paper",
    paper: {
      bg: "#eef8f0",
      pattern:
        "repeating-linear-gradient(to bottom, transparent 0 25px, rgba(120,168,140,.28) 25px 26px)",
    },
  },
  {
    id: "paper-blueprint",
    name: "Blueprint Grid",
    blurb: "for the planners",
    price: 380,
    category: "paper",
    paper: {
      bg: "#e2edf7",
      pattern:
        "repeating-linear-gradient(to bottom, transparent 0 19px, rgba(94,135,168,.3) 19px 20px), repeating-linear-gradient(to right, transparent 0 19px, rgba(94,135,168,.3) 19px 20px)",
    },
  },
  {
    id: "paper-dusk",
    name: "Dusk Card",
    blurb: "plum paper, silver light",
    price: 520,
    category: "paper",
    paper: {
      bg: "#e8e0f2",
      pattern:
        "radial-gradient(circle at 80% 10%, rgba(143,108,176,.22), transparent 45%), radial-gradient(circle at 10% 90%, rgba(120,96,150,.18), transparent 40%)",
    },
  },
];

export const DEFAULT_COSMETICS = {
  owned: ["tape-sakura", "pin-brass", "paper-cream"],
  equipped: { tape: "tape-sakura", pin: "pin-brass", paper: "paper-cream" },
};

export function shopItem(id: string): ShopItem | undefined {
  return SHOP_ITEMS.find((i) => i.id === id);
}
