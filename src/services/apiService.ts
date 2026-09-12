import type { Quest } from "../game/types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

export interface ApiUser {
  id: string;
  email: string;
  username: string;
}

export interface ApiProfile {
  userId: string;
  email: string;
  username: string;
  name: string;
  title: string;
  level: number;
  xp?: number;
  currentXP?: number;
  maxXP: number;
  gold: number;
  streak: number;
  bestStreak: number;
  lastLogin: string;
  questsCompleted: number;
  attributes: Record<string, number>;
  cosmetics: { owned: string[]; equipped: { tape: string; pin: string; paper: string } };
  quests: Quest[];
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    });
  } catch {
    throw new Error("Could not reach the Life RPG server. Start `npm run server` and check MongoDB configuration.");
  }
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message || `Request failed (${response.status})`);
  return body as T;
}

export function signUpApi(username: string, email: string, password: string) {
  return request<{ user: ApiUser; profile: ApiProfile }>("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ username, email, password }),
  });
}

export function signInApi(email: string, password: string) {
  return request<{ user: ApiUser; profile: ApiProfile }>("/auth/signin", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function getUserApi(userId: string) {
  return request<{ profile: ApiProfile }>(`/user/${encodeURIComponent(userId)}`);
}

export function syncUserData(userId: string, gameData: Record<string, unknown>) {
  return request<{ profile: ApiProfile }>(`/user/${encodeURIComponent(userId)}/sync`, {
    method: "POST",
    body: JSON.stringify(gameData),
  });
}
