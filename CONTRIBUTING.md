# Contributing to Life RPG

Thanks for wanting to help — this is a small, cosy project, and the bar is
"would this make the scrapbook feel nicer?", not "is this enterprise-grade?".

## Getting set up

```bash
git clone https://github.com/your-username/life-rpg.git
cd life-rpg
npm install
npm run dev
```

You need Node.js ≥ 20 and npm ≥ 10.

## Before you open a pull request

All three of these must pass, with **zero** ESLint errors or warnings:

```bash
npm run lint
npm run typecheck
npm run build
```

CI runs the same commands on every push, so a red check locally means a red check on GitHub.

## Branch naming

```
feat/<short-slug>      feat/washi-tape-picker
fix/<short-slug>       fix/streak-utc-off-by-one
docs/<short-slug>      docs/update-readme-tables
chore/<short-slug>     chore/upgrade-vite
```

## Commit message convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <imperative summary>

feat(shop): add carnival-stripe washi tape
fix(engine): carry XP remainder across multiple level-ups
docs(readme): correct the rank reward table
refactor(hooks): derive memories with useMemo
style(board): tighten cork board texture contrast
test(engine): cover streak reset at a 2-day gap
chore(deps): bump tailwindcss to 4.1.17
```

Keep the summary under 72 characters, lowercase, no trailing full stop.

## Where things live

| I want to change…                          | Go to                                    |
| ------------------------------------------ | ---------------------------------------- |
| XP curve, ranks, realms, shop items        | `src/game/config.ts`                     |
| Level-up maths, streak logic, quest factory| `src/game/engine.ts`                     |
| Supabase client configuration              | `src/config/supabase.ts`                  |
| Auth, sign-up provisioning, error copy     | `src/services/authService.ts`             |
| Supabase reads/writes & real-time sync     | `src/services/supabaseRepository.ts`      |
| How the device-only journal is stored       | `src/game/storage.ts`                     |
| State shape and actions                    | `src/game/types.ts`, `src/hooks/useGameState.ts` |
| Paper / cork / tape / stamp styling        | `src/index.css`                          |
| A single card or widget                    | `src/components/*.tsx`                   |

## Design ground rules

These keep the app from drifting into generic dashboard territory:

1. **No component libraries.** Buttons, modals and tabs are built from the custom
   Tailwind theme in `src/index.css`.
2. **Everything tilts a little.** Real paper is never perfectly straight — use
   `rotate-1`, `-rotate-2`, or the `seed` on a quest for deterministic tilt.
3. **Fonts have jobs.** `font-marker` for titles and stamps, `font-hand` for
   handwritten voice, `font-print` for casual labels, `font-serif` for quest notes,
   `font-body` for UI text. Don't mix them up.
4. **Motion must be tactile and short.** Springs over tweens, under 400 ms, and
   gated behind `MotionConfig reducedMotion="user"`.
5. **Accessibility is not optional.** Every icon-only button needs an `aria-label`,
   every modal needs focus trapping and an `Esc` handler, every new colour contrast
   pair must pass WCAG AA.

## Rules of the road

- **Never commit `.env`.** Only `.env.example` is tracked.
- **Keep the offline journal working.** The app must stay usable with no network
   and no Supabase credentials. `VITE_SKIP_SUPABASE=true` must produce a fully
  functional device-only journal.
- **Write rewards through Supabase updates.** Keep reward mutations asynchronous
   and preserve optimistic local updates so the board remains responsive offline.
- **Pure logic stays pure.** `src/game/` must not import React or touch the DOM —
  it is the part we can unit-test without a browser.
- **Impure functions live outside render.** `Math.random()` and `canvas-confetti`
  belong in event handlers and effects, never in a component body — the
  `react-hooks/purity` rule enforces this.

## Reporting a bug

Please include:

1. What you did, what you expected, what happened.
2. Your browser and OS.
3. The contents of the `life-rpg::player` key from devtools → Application →
   Local Storage (it has no personal data beyond what you typed in).
