

https://github.com/user-attachments/assets/da8b6688-37f0-4a93-bc36-5b1ba3693be4



<div align="center">





<br /><br />

# 🗺️ Life RPG: The Everyday Quest Log

**Transform your boring to-do list into an epic handwritten adventure.**

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-rgp--project.onrender.com-8B4513?style=for-the-badge&logoColor=white)](https://rgp-project.onrender.com/)
[![License](https://img.shields.io/badge/License-Apache_2.0-D4A853?style=for-the-badge)](LICENSE)
[![Node](https://img.shields.io/badge/Node.js-≥20.0.0-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)

<br />

> *"Bind a fresh journal. Your quests will follow you to any device."*

<br />

**[🚀 Try It Live →](https://rgp-project.onrender.com/)** &nbsp;|&nbsp; **[📖 Docs](#-local-setup-instructions)** &nbsp;|&nbsp; **[🤝 Contribute](CONTRIBUTING.md)**

</div>

---

## ✨ What Is Life RPG?

Life RPG is a **full-stack gamified productivity web app** that turns your real-life tasks, habits, and errands into RPG-style quests — pinned to a cozy handwritten corkboard. Complete quests to earn **XP**, level up, collect **Gold**, and grow your attributes.

The entire UI is built around a **handcrafted scrapbook aesthetic**: polaroid cards, brass pushpins, torn paper edges, washi tape strips, coffee-ring stains, and rubber-stamp completions. It feels like journaling and playing a video game at the same time.

<br />

<div align="center">

| 🎯 Pin Quests | ⚡ Earn XP & Level Up | 🪙 Collect Gold | 🏪 Customize |
|:---:|:---:|:---:|:---:|
| Write real-life tasks as RPG missions across 4 magical realms | Complete quests to gain XP, watch a rubber stamp fire, and level your character | Spend gold in the Trinket Stall on washi tapes, pins & paper stocks | Equip cosmetics that change the look of every card on your board |

</div>

---

## 🌟 Feature Highlights

### 🏰 Scrapbook-First UI
- **Corkboard quest board** with polaroid-style cards, each with a unique tilt, washi tape, and brass pushpin
- **Torn paper edges** (`clip-path` CSS), **paper grain textures**, and **procedural coffee ring stains**
- **Rubber stamp "COMPLETED"** animation fires on quest completion with `canvas-confetti` particle burst
- **6 washi tape patterns**, **5 pin styles**, and **5 paper stocks** — all purchasable in the Trinket Stall

### ⚡ Optimistic-First Architecture
- **Instant UI feedback** — the rubber stamp fires and confetti pops *before* the network responds
- Follows a strict **3-beat mutation pattern**: (1) local state, (2) localStorage write, (3) API confirmation
- **Offline-resilient**: localStorage remains the source of truth when you lose connectivity

### 🔐 Secure Cloud Sync
- Email + password auth with **bcrypt** (cost factor 12) password hashing
- **MongoDB Atlas** cloud cluster with unique-indexed `users` and `profiles` collections
- Full game state syncs on every mutation — pick up on any device, anywhere

### 🎮 Deep RPG Mechanics
- **Exponential XP curve**: `NextLevelXP = 120 × 1.28^(level - 1)` with multi-level rollover
- **Daily streak system**: Consecutive days multiply gold bonuses; missing a day resets gently
- **4 Realms → 4 Attributes**: Library (Intellect), Iron Grove (Strength), Atelier (Creativity), Still Pond (Wisdom)
- **6 Difficulty Ranks** (E → S): Scale from "a small kindness" (25 XP) to "the stuff of legend" (420 XP)

### ♿ Production-Ready Accessibility
- **Keyboard-first**: `N` to pin a quest, `Esc` to close any modal, `Space`/`Enter` to stamp a card
- **Focus traps** inside every modal (Tab / Shift+Tab cycles)
- Full **ARIA** compliance: `role="dialog"`, `role="tablist"`, `role="article"`, `aria-live`, `aria-selected`
- **Skip-to-content** link, tactile amber focus rings everywhere

### 🪄 Polished Error Handling
- **Empty input guards**: Submit buttons disable when title is blank; handwritten `"Ink cannot be empty..."` cue appears
- **Torn sticky-note toasts**: Server errors appear as a red scrapbook note pinned with washi tape
- **Offline banner**: Surfaces automatically on network loss; auto-hides and syncs when back online

---

## 🛠️ Technology Stack

<div align="center">

### Frontend

| Technology | Version | Role |
|:---|:---:|:---|
| [React](https://react.dev/) | 19 | UI component framework |
| [TypeScript](https://www.typescriptlang.org/) | 5.9 (Strict) | Type-safe development |
| [Vite](https://vite.dev/) | 7.3 | Dev server & bundler (port `5181`) |
| [Tailwind CSS v4](https://tailwindcss.com/) | 4.1 | Utility styling with `@theme` design tokens |
| [Framer Motion](https://www.framer.com/motion/) | 13 | Spring physics animations |
| [canvas-confetti](https://www.npmjs.com/package/canvas-confetti) | 1.9 | Quest-completion particle bursts |
| [Lucide React](https://lucide.dev/) | 1.45 | Icon set |
| [vite-plugin-singlefile](https://github.com/richardtallent/vite-plugin-singlefile) | 2.3 | Inlines all assets into one `index.html` |
| **Google Fonts** | — | *Caveat*, *Patrick Hand*, *Permanent Marker*, *Lora*, *Plus Jakarta Sans* |

### Backend

| Technology | Version | Role |
|:---|:---:|:---|
| [Node.js](https://nodejs.org/) | ≥ 20 | Runtime |
| [Express](https://expressjs.com/) | 5 | REST API server |
| [MongoDB Native Driver](https://www.mongodb.com/docs/drivers/node/) | 7.6 | Database client |
| [MongoDB Atlas](https://www.mongodb.com/atlas) | Cloud | Hosted database cluster |
| [bcryptjs](https://www.npmjs.com/package/bcryptjs) | 3 | Password hashing (cost factor 12) |
| [dotenv](https://www.npmjs.com/package/dotenv) | 17 | Environment variable management |
| [cors](https://www.npmjs.com/package/cors) | 2.8 | Cross-origin request handling |

</div>

---

## 🎮 Game Engine Mechanics

### Experience & Levelling Curve

The XP required to reach the next level scales **exponentially**:

$$\text{NextLevelXP} = 120 \times 1.28^{(\text{level} - 1)}$$

- **Multi-level rollover**: surplus XP from a large quest automatically cascades through multiple level-ups in one action.
- **Un-stamp**: restoring a completed quest *refunds* XP and can drop you back across a level boundary.

### Difficulty Ranks

| Rank | Title | XP | Gold | Attr Gain |
|:---:|:---|:---:|:---:|:---:|
| **E** | A small kindness | 25 | 6 | +1 |
| **D** | An ordinary errand | 45 | 12 | +1 |
| **C** | A proper venture | 80 | 22 | +2 |
| **B** | A real trial | 140 | 40 | +3 |
| **A** | An odyssey | 240 | 72 | +4 |
| **S** | The stuff of legend | 420 | 130 | +6 |

### Realms & Attributes

| Realm | Emoji | Trains | Examples |
|:---|:---:|:---:|:---|
| **The Library** | 📖 | Intellect | Study, code, reading, learning |
| **The Iron Grove** | 🪓 | Strength | Gym, running, chores, the body |
| **The Atelier** | 🎨 | Creativity | Art, music, writing, crafting |
| **The Still Pond** | 🌿 | Wisdom | Rest, journaling, mindfulness |

### Daily Streak System

Streaks are tracked using your **local calendar date** (`YYYY-MM-DD`) — never UTC:

| Condition | Effect |
|:---|:---|
| First login ever | Day 1 · +10 Gold |
| Consecutive day (+1) | Streak grows · Bonus gold = `10 + min(streak, 14) × 2` |
| Missed day (gap > 1) | Gentle reset to Day 1 · +10 Gold |
| Same day | No change |

### Level Titles

| Level | Title |
|:---:|:---|
| 1 | Sleepy Sapling |
| 3 | Curious Wanderer |
| 5 | Keeper of Small Habits |
| 8 | Pocket Adventurer |
| 12 | Seasoned Daydreamer |
| 16 | Lantern Bearer |
| 21 | Chronicler of Ordinary Days |
| 27 | Quiet Legend |
| 35 | Mythic Human Being |

---

## 📡 REST API Reference

Base URL (local): `http://localhost:5000/api`  
Base URL (live): `https://rgp-project.onrender.com/api`

| Endpoint | Method | Description |
|:---|:---:|:---|
| `/health` | `GET` | Returns `{ ok: true, database: "life_rpg" }` |
| `/auth/signup` | `POST` | Registers account, bcrypt-hashes password (cost 12), seeds 4 starter quests |
| `/auth/signin` | `POST` | Authenticates email + password, returns user + full profile |
| `/user/:userId` | `GET` | Returns full game state (attributes, quests, cosmetics, stats) |
| `/user/:userId/sync` | `POST` | Atomically upserts the full profile (optimistic sync) |

---

## ⌨️ Keyboard Controls

| Key | Action |
|:---:|:---|
| **`N`** | Open the "New Quest" modal from anywhere on the desk |
| **`Esc`** | Close any open modal, overlay, or offline notice |
| **`Tab`** | Navigate sequentially through all interactive elements |
| **`Shift + Tab`** | Reverse navigation; traps inside active modal dialogs |
| **`Enter`** / **`Space`** | Complete (or restore) a focused quest card; activate buttons |

> All interactive elements use a unified **tactile amber focus ring**: `focus:ring-2 focus:ring-amber-800 focus:ring-offset-2`

---

## 🚀 Local Setup Instructions

### Prerequisites
- **Node.js** ≥ 20.0.0
- **npm** ≥ 10.0.0
- A **MongoDB Atlas** account (free tier works perfectly)

### Step 1 — Clone the Repository

```bash
git clone https://github.com/doluzar219-ux/RGP-PROJECT.git
cd RGP-PROJECT
```

### Step 2 — Configure Environment

Create a `.env` file in the root directory:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB=life_rpg
PORT=5000
VITE_API_URL=http://localhost:5000/api
```

### Step 3 — Install Dependencies

```bash
npm install
```

### Step 4 — Run the Application

Open **two terminals**:

```bash
# Terminal 1 — Backend API (Express + MongoDB)
npm run server
# → Listening on http://localhost:5000

# Terminal 2 — Frontend Dev Server (Vite + React)
npm run dev
# → Launches on http://localhost:5181
```

---

## 📦 Build & Verification Scripts

```bash
# Type-check all TypeScript without emitting files
npm run typecheck

# Run ESLint across the entire codebase
npm run lint

# Auto-fix all fixable ESLint issues
npm run lint:fix

# Build production bundle (single inlined dist/index.html)
npm run build

# Preview the production build locally
npm run preview

# Remove the dist/ directory
npm run clean
```

> **Production note**: `vite-plugin-singlefile` inlines all JS, CSS, and assets into a single `dist/index.html`. The Express server serves this file directly — zero CDN or additional static hosting required.

---

## 🗂️ Project Architecture

```
RGP-PROJECT/
├── assets/                   # Static preview images
├── src/
│   ├── components/           # React UI components (12 files)
│   │   ├── App.tsx           # Root shell — keyboard shortcuts, overlay orchestration
│   │   ├── QuestBoard.tsx    # Cork board — tablist, realm filters, empty states
│   │   ├── QuestCard.tsx     # Polaroid quest card — stamp, confetti, full ARIA
│   │   ├── NewQuestModal.tsx # Quest creation form — validation, focus trap
│   │   ├── AuthModal.tsx     # Sign-in / Sign-up — focus trap, inline errors
│   │   ├── UserProfile.tsx   # Sidebar card — doodle avatar, XP bar, attributes
│   │   ├── RewardShop.tsx    # Trinket stall — buy & equip cosmetics with gold
│   │   ├── ToastStack.tsx    # Scrapbook notification system
│   │   ├── StickyNoteToast.tsx   # Standalone error toast (torn red sticky-note)
│   │   ├── LevelUpOverlay.tsx    # Full-screen level-up celebration
│   │   ├── OfflineNotice.tsx     # Network status banner
│   │   ├── Chronicle.tsx     # Quest history journal log
│   │   └── Bits.tsx          # Shared primitives — WashiTape, Pin, PaperButton…
│   ├── game/
│   │   ├── config.ts         # Ranks, Realms, Attributes, Shop items, Level titles
│   │   ├── engine.ts         # Pure XP math, streak logic, quest factory, freshState
│   │   └── types.ts          # Shared TypeScript interfaces
│   ├── hooks/
│   │   └── useGameState.ts   # Central state machine — optimistic mutations (738 lines)
│   ├── services/
│   │   ├── apiService.ts     # Raw fetch layer — typed request() wrapper
│   │   ├── authService.ts    # Auth session management — sign in/up/out
│   │   └── apiRepository.ts  # High-level game operations — CRUD + subscriptions
│   ├── utils/
│   │   ├── confetti.ts       # paperBurst() — canvas-confetti wrapper
│   │   └── cn.ts             # clsx + tailwind-merge helper
│   ├── main.tsx
│   └── index.css             # Tailwind v4 @theme design tokens + component classes
├── server.js                 # Express 5 REST API — auth, sync, static SPA serving
├── index.html                # Entry point — 5 Google Fonts preloaded
├── vite.config.ts            # Vite config — singlefile plugin, port 5181
├── tsconfig.json             # TypeScript strict mode, ES2020
└── package.json              # Full-stack monorepo scripts
```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Read [`CONTRIBUTING.md`](CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create your feature branch: `git checkout -b feat/amazing-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to the branch: `git push origin feat/amazing-feature`
5. Open a Pull Request

---

## 📄 License

Distributed under the **Apache-2.0 License**. See [`LICENSE`](LICENSE) for full terms.

---

<div align="center">

**Built with ☕ and a lot of cork board.**

*"Pin something small. A glass of water counts as a quest."*

<br />

[![Live Demo](https://img.shields.io/badge/🌐_Try_It_Now-rgp--project.onrender.com-8B4513?style=for-the-badge)](https://rgp-project.onrender.com/)

</div>
