import { getUserApi, syncUserData, type ApiProfile } from "./apiService";
import { DEFAULT_COSMETICS, titleForLevel } from "../game/config";
import { applyXP, removeXP, resolveStreak, xpForLevel } from "../game/engine";
import type { AttributeId, Attributes, Cosmetics, Quest, UserDoc } from "../game/types";

export interface UserDataSnapshot { user: UserDoc; attributes: Attributes; cosmetics: Cosmetics; }
export interface CompletionRewards { xp: number; gold: number; attribute: AttributeId; attributeGain: number; }
export class RepositoryError extends Error { offline = false; constructor(message: string) { super(message); this.name = "RepositoryError"; } }
const num = (v: unknown, fallback = 0) => typeof v === "number" && Number.isFinite(v) ? v : fallback;
const str = (v: unknown, fallback = "") => typeof v === "string" ? v : fallback;

export function toUserData(data: ApiProfile): UserDataSnapshot {
  const level = Math.max(1, num(data.level, 1));
  const attrs = data.attributes || {};
  const equipped = data.cosmetics?.equipped || { tape: "tape-sakura", pin: "pin-brass", paper: "paper-cream" };
  return {
    user: {
      name: str(data.name || data.username, "Wanderer"), title: str(data.title, titleForLevel(level)), level,
      currentXP: num(data.currentXP ?? data.xp), maxXP: num(data.maxXP, xpForLevel(level)) || xpForLevel(level),
      gold: num(data.gold, 100), streak: num(data.streak), bestStreak: num(data.bestStreak), lastLogin: str(data.lastLogin),
      createdAt: new Date().toISOString(), questsCompleted: num(data.questsCompleted),
    },
    attributes: { intellect: num(attrs.intellect, 1), strength: num(attrs.strength, 1), creativity: num(attrs.creativity, 1), wisdom: num(attrs.wisdom, 1) },
    cosmetics: { owned: Array.from(new Set([...(data.cosmetics?.owned || []), ...DEFAULT_COSMETICS.owned])), equipped },
  };
}

function profilePayload(snapshot: UserDataSnapshot, quests: Quest[]) {
  return {
    ...snapshot.user,
    currentXP: snapshot.user.currentXP,
    maxXP: snapshot.user.maxXP,
    questsCompleted: snapshot.user.questsCompleted,
    attributes: snapshot.attributes,
    cosmetics: snapshot.cosmetics,
    quests,
  };
}

async function load(userId: string): Promise<{ profile: ApiProfile; state: UserDataSnapshot; quests: Quest[] }> {
  const { profile } = await getUserApi(userId);
  const quests = (profile.quests || []).map((quest) => ({ ...quest, date: quest.date || new Date().toISOString() }));
  return { profile, state: toUserData(profile), quests };
}

export function subscribeToUserData(userId: string, callback: (data: UserDataSnapshot | null) => void, onError?: (err: RepositoryError) => void): () => void {
  let active = true;
  void load(userId).then(({ state }) => { if (active) callback(state); }).catch((error) => onError?.(new RepositoryError(error instanceof Error ? error.message : "Could not load profile.")));
  return () => { active = false; };
}

export function subscribeToQuests(userId: string, callback: (quests: Quest[]) => void, onError?: (err: RepositoryError) => void): () => void {
  let active = true;
  void load(userId).then(({ quests }) => { if (active) callback(quests); }).catch((error) => onError?.(new RepositoryError(error instanceof Error ? error.message : "Could not load quests.")));
  return () => { active = false; };
}

export async function fetchQuestsOnce(userId: string): Promise<Quest[]> { return (await load(userId)).quests; }

async function sync(userId: string, state: UserDataSnapshot, quests: Quest[]): Promise<void> {
  await syncUserData(userId, profilePayload(state, quests));
}

export async function addQuestToApi(userId: string, quest: Quest): Promise<void> {
  const loaded = await load(userId);
  await sync(userId, loaded.state, [quest, ...loaded.quests]);
}

export async function completeQuestViaApi(userId: string, questId: string, rewards: CompletionRewards): Promise<{ applied: boolean; level: number }> {
  const loaded = await load(userId);
  const quest = loaded.quests.find((item) => item.id === questId);
  if (!quest || quest.status === "completed") return { applied: false, level: loaded.state.user.level };
  const result = applyXP(loaded.state.user.level, loaded.state.user.currentXP, rewards.xp);
  const state: UserDataSnapshot = { ...loaded.state, user: { ...loaded.state.user, level: result.level, currentXP: result.currentXP, maxXP: result.maxXP, title: titleForLevel(result.level), gold: loaded.state.user.gold + rewards.gold, questsCompleted: loaded.state.user.questsCompleted + 1 }, attributes: { ...loaded.state.attributes, [rewards.attribute]: loaded.state.attributes[rewards.attribute] + rewards.attributeGain } };
  await sync(userId, state, loaded.quests.map((item) => item.id === questId ? { ...item, status: "completed", completedAt: new Date().toISOString() } : item));
  return { applied: true, level: result.level };
}

export async function restoreQuestViaApi(userId: string, questId: string, rewards: CompletionRewards): Promise<void> {
  const loaded = await load(userId);
  const result = removeXP(loaded.state.user.level, loaded.state.user.currentXP, rewards.xp);
  const state: UserDataSnapshot = { ...loaded.state, user: { ...loaded.state.user, level: result.level, currentXP: result.currentXP, maxXP: result.maxXP, title: titleForLevel(result.level), gold: Math.max(0, loaded.state.user.gold - rewards.gold), questsCompleted: Math.max(0, loaded.state.user.questsCompleted - 1) }, attributes: { ...loaded.state.attributes, [rewards.attribute]: Math.max(1, loaded.state.attributes[rewards.attribute] - rewards.attributeGain) } };
  await sync(userId, state, loaded.quests.map((item) => item.id === questId ? { ...item, status: "active", completedAt: undefined } : item));
}

export async function deleteQuestViaApi(userId: string, questId: string): Promise<void> { const loaded = await load(userId); await sync(userId, loaded.state, loaded.quests.filter((quest) => quest.id !== questId)); }

export async function buyCosmeticViaApi(userId: string, itemId: string, price: number, category: "tape" | "pin" | "paper"): Promise<void> { const loaded = await load(userId); if (loaded.state.cosmetics.owned.includes(itemId)) return; if (loaded.state.user.gold < price) throw new RepositoryError(`That costs ${price} gold and you have ${loaded.state.user.gold}.`); await sync(userId, { ...loaded.state, user: { ...loaded.state.user, gold: loaded.state.user.gold - price }, cosmetics: { owned: [...loaded.state.cosmetics.owned, itemId], equipped: { ...loaded.state.cosmetics.equipped, [category]: itemId } } }, loaded.quests); }
export async function equipCosmeticViaApi(userId: string, slot: "tape" | "pin" | "paper", itemId: string): Promise<void> { const loaded = await load(userId); await sync(userId, { ...loaded.state, cosmetics: { ...loaded.state.cosmetics, equipped: { ...loaded.state.cosmetics.equipped, [slot]: itemId } } }, loaded.quests); }
export async function updateDisplayNameViaApi(userId: string, name: string): Promise<void> { const loaded = await load(userId); await sync(userId, { ...loaded.state, user: { ...loaded.state.user, name: name.slice(0, 22) } }, loaded.quests); }

export interface StreakOutcomeResult { outcome: "first" | "continued" | "broken" | "same-day"; bonusGold: number; streak: number; }
export async function resolveStreakViaApi(userId: string, today: string): Promise<StreakOutcomeResult | null> { const loaded = await load(userId); const result = resolveStreak(loaded.state.user, today); if (result.outcome === "same-day") return { outcome: result.outcome, bonusGold: 0, streak: loaded.state.user.streak }; await sync(userId, { ...loaded.state, user: { ...loaded.state.user, ...result.user } }, loaded.quests); return { outcome: result.outcome, bonusGold: result.bonusGold, streak: result.user.streak }; }
export async function clearAllQuests(userId: string): Promise<void> { const loaded = await load(userId); await sync(userId, loaded.state, []); }

