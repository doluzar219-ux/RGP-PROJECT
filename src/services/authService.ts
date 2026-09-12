import { signInApi, signUpApi } from "./apiService";
import type { Quest } from "../game/types";

const SESSION_KEY = "life_rpg_session";

export interface RemoteUser { id: string; email: string; username: string; }
export interface AuthResult { user: RemoteUser; seeded: boolean; }

export class AuthServiceError extends Error {
  code: string;
  offline: boolean;
  configuration = false;
  constructor(message: string, code = "api-error", offline = false) {
    super(message);
    this.name = "AuthServiceError";
    this.code = code;
    this.offline = offline;
  }
}

const listeners = new Set<(user: RemoteUser | null) => void>();
function notify(user: RemoteUser | null): void { listeners.forEach((listener) => listener(user)); }
function toAuthError(error: unknown): AuthServiceError {
  const message = error instanceof Error ? error.message : "Authentication failed.";
  const offline = message.includes("reach") || message.includes("network") || message.includes("fetch");
  return new AuthServiceError(message, "api-error", offline);
}

export function getCurrentUser(): RemoteUser | null {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) as RemoteUser : null;
  } catch { return null; }
}

export async function signUpUser(email: string, password: string, username: string): Promise<AuthResult> {
  try {
    const result = await signUpApi(username.trim(), email.trim(), password);
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(result.user));
    notify(result.user);
    return { user: result.user, seeded: true };
  } catch (error) {
    console.error("API signup error:", error);
    throw toAuthError(error);
  }
}

export async function signInUser(email: string, password: string): Promise<RemoteUser> {
  try {
    const result = await signInApi(email.trim(), password);
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(result.user));
    notify(result.user);
    return result.user;
  } catch (error) {
    console.error("API signin error:", error);
    throw toAuthError(error);
  }
}

export const signUp = signUpUser;
export const signIn = signInUser;

export async function signOutUser(): Promise<void> {
  window.localStorage.removeItem(SESSION_KEY);
  notify(null);
}
export const signOut = signOutUser;

export function onAuthUpdate(callback: (user: RemoteUser | null) => void): () => void {
  listeners.add(callback);
  callback(getCurrentUser());
  return () => listeners.delete(callback);
}

export function starterQuestsFor(): Array<Pick<Quest, "title" | "details" | "realm" | "rank">> { return []; }
export type ApiUser = RemoteUser;
