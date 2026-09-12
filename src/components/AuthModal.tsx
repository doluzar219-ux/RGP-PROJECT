import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, LogIn, UserPlus, X } from "lucide-react";
import { PaperButton, SketchStar, WashiTape } from "./Bits";

/* ------------------------------------------------------------------ *
 *  AuthModal — the cover of the notebook.
 *
 *  Wired straight to the local auth service so validation errors arrive here
 *  as a scrapbook-flavoured line.
 * ------------------------------------------------------------------ */

interface Props {
  open: boolean;
  busy: boolean;
  onClose: () => void;
  onSignIn: (email: string, password: string) => Promise<string | null>;
  onSignUp: (email: string, password: string, username: string) => Promise<string | null>;
}

type Mode = "sign-in" | "sign-up";

export function AuthModal({ open, busy, onClose, onSignIn, onSignUp }: Props) {
  const [mode, setMode] = useState<Mode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    const t = window.setTimeout(() => firstFieldRef.current?.focus(), 120);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
        'button, input, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, mode, onClose]);

  if (!open) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim().includes("@")) {
      setError("That address doesn't look quite right.");
      return;
    }
    if (password.length < 6) {
      setError("A secret word needs at least 6 characters to be worth anything.");
      return;
    }
    if (mode === "sign-up" && username.trim().length < 2) {
      setError("Every journal needs a name — two characters will do.");
      return;
    }

    try {
      const message =
        mode === "sign-up"
          ? await onSignUp(email, password, username)
          : await onSignIn(email, password);

      // A null return means success — the parent closes the modal.
      if (message) setError(message);
    } catch (err) {
      console.error("Auth form error:", err);
      setError("We couldn't open that journal. Please try again.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[65] flex items-start justify-center overflow-y-auto bg-[#2f2822]/60 p-4 py-8 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-label={mode === "sign-up" ? "Bind a new journal" : "Open your journal"}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.form
        ref={dialogRef}
        onSubmit={submit}
        initial={{ y: -26, rotate: -4, scale: 0.94, opacity: 0 }}
        animate={{ y: 0, rotate: -1, scale: 1, opacity: 1 }}
        exit={{ y: 20, rotate: 3, opacity: 0 }}
        transition={{ type: "spring", stiffness: 240, damping: 20 }}
        className="torn paper-noise relative my-6 w-full max-w-md px-7 py-9 shadow-[0_24px_50px_-18px_rgba(30,22,12,.8)] focus:outline-none focus:ring-2 focus:ring-amber-800 focus:ring-offset-2"
        style={{ ["--card-bg" as string]: "#fffdf6" }}
      >
        <WashiTape
          background="linear-gradient(135deg,#f6c9ce,#e5a1aa)"
          rotate={-9}
          className="-top-3 left-8 h-6 w-28"
        />
        <WashiTape
          background="linear-gradient(135deg,#f6c9ce,#e5a1aa)"
          rotate={7}
          className="-top-3 right-7 h-6 w-20"
        />
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute right-3 top-3 z-10 rounded-full p-1.5 text-ink-soft transition hover:rotate-90 hover:text-wine focus:outline-none focus:ring-2 focus:ring-amber-800 focus:ring-offset-2"
        >
          <X size={18} strokeWidth={2.6} />
        </button>
        <SketchStar className="absolute right-6 top-16 h-5 w-5 text-marigold" />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-4 w-px bg-[#d79aa0]/70"
        />

        <h2 className="font-marker text-[1.9rem] leading-[0.95] text-ink">
          the everyday
          <br />
          <span className="text-clay">quest log</span>
        </h2>
        <p className="mt-2 font-hand text-xl leading-tight text-ink-soft">
          {mode === "sign-up"
            ? "Bind a fresh journal. Your quests will follow you to any device."
            : "Welcome back. Open your journal and pick up the thread."}
        </p>

        <div className="mt-6 space-y-4">
          {mode === "sign-up" && (
            <label className="block">
              <span className="font-body text-[10px] font-black uppercase tracking-[0.16em] text-ink-soft">
                Your name
              </span>
              <input
                ref={firstFieldRef}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                maxLength={22}
                autoComplete="nickname"
                placeholder="wandering scribe"
                className="ink-field mt-1 font-hand text-2xl focus:outline-none focus:ring-2 focus:ring-amber-800 focus:ring-offset-2"
              />
            </label>
          )}

          <label className="block">
            <span className="font-body text-[10px] font-black uppercase tracking-[0.16em] text-ink-soft">
              Address
            </span>
            <input
              ref={mode === "sign-in" ? firstFieldRef : undefined}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="you@somewhere.quiet"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "auth-error" : undefined}
              className="ink-field mt-1 font-hand text-2xl focus:outline-none focus:ring-2 focus:ring-amber-800 focus:ring-offset-2"
            />
          </label>

          <label className="block">
            <span className="font-body text-[10px] font-black uppercase tracking-[0.16em] text-ink-soft">
              Secret word{" "}
              <span className="font-normal lowercase">(6+ characters)</span>
            </span>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
              placeholder="••••••••"
              className="ink-field mt-1 font-hand text-2xl focus:outline-none focus:ring-2 focus:ring-amber-800 focus:ring-offset-2"
            />
          </label>

          {error && (
            <motion.p
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              id="auth-error"
              role="alert"
              className="font-hand text-lg leading-snug text-wine"
            >
              {error}
            </motion.p>
          )}

          {((mode === "sign-up" && (!email.trim() || !password.trim() || !username.trim())) ||
            (mode === "sign-in" && (!email.trim() || !password.trim()))) && (
            <p className="font-hand text-sm text-wine/80">
              Ink cannot be empty... please fill out all fields.
            </p>
          )}

          <PaperButton
            tone="gold"
            size="lg"
            type="submit"
            disabled={
              busy ||
              (mode === "sign-up"
                ? !email.trim() || !password.trim() || !username.trim()
                : !email.trim() || !password.trim())
            }
            aria-disabled={
              busy ||
              (mode === "sign-up"
                ? !email.trim() || !password.trim() || !username.trim()
                : !email.trim() || !password.trim())
            }
            className="w-full"
          >
            <span className="inline-flex items-center justify-center gap-2">
              {busy ? (
                <Loader2 size={18} className="animate-spin" />
              ) : mode === "sign-up" ? (
                <UserPlus size={18} strokeWidth={2.6} />
              ) : (
                <LogIn size={18} strokeWidth={2.6} />
              )}
              {busy
                ? "one moment…"
                : mode === "sign-up"
                  ? "Bind my journal"
                  : "Open my journal"}
            </span>
          </PaperButton>
        </div>

        <button
          type="button"
          onClick={() => {
            setMode((m) => (m === "sign-in" ? "sign-up" : "sign-in"));
            setError(null);
          }}
          className="mt-4 w-full font-hand text-lg text-ink-soft underline decoration-dotted underline-offset-4 transition hover:text-clay focus:outline-none focus:ring-2 focus:ring-amber-800 focus:ring-offset-2"
        >
          {mode === "sign-up"
            ? "I already have a journal — open it"
            : "I'm new here — start a fresh journal"}
        </button>

      </motion.form>
    </div>
  );
}
