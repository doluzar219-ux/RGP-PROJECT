# 🗺️ Life RPG: The Everyday Quest Log

> *"Bind a fresh journal. Your quests will follow you to any device."*

Life RPG is an immersive, scrapbook-aesthetic life management and habit-tracking web application. By blending handwritten typography, washi tape graphics, torn paper textures, and Polaroid photo cards, it transforms daily task management into a cozy role-playing experience.

---

## ✨ Core Architecture & Features

- **Scrapbook Aesthetics**: Custom UI layouts mimicking physical journals, polaroids, and stamps with procedural paper grain textures, brass pushpins, washi tapes, and vintage coffee rings.
- **Full-Stack Cloud Persistence**: Secured via Node.js, Express, and a cloud MongoDB Atlas cluster with bcrypt-hashed credentials and indexed collections.
- **Optimistic UI**: Instant local state updates paired with background REST API synchronization, providing instantaneous visual feedback (such as tactile rubber-stamp completions and particle confetti) without network latency.
- **Robust Error Handling**: Real-time empty input guards preventing blank submissions and paper-themed "Oops! The ink spilled" sticky-note toast alerts with automatic 3.5-second dismissal.
- **Full Accessibility**: Keyboard-first navigation (`Tab`, `Space`, `Enter`, `Esc`) with custom tactile focus rings (`focus:outline-none focus:ring-2 focus:ring-amber-800 focus:ring-offset-2`) and complete ARIA support (`role="dialog"`, `role="tablist"`, `role="tab"`, `role="article"`, `aria-selected`, `aria-label`).

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: [React 19](https://react.dev/) & [React DOM](https://reactjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict mode, ES2020 target)
- **Bundler & Tooling**: [Vite](https://vite.dev/) (locked to port `5181`) with `vite-plugin-singlefile`
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with `@theme` design tokens
- **Motion & Physics**: [Framer Motion](https://www.framer.com/motion/) & [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Typography**: Google Fonts (*Caveat*, *Patrick Hand*, *Permanent Marker*, *Lora*, *Plus Jakarta Sans*)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/) (>= 20.0.0)
- **Server**: [Express 5](https://expressjs.com/)
- **Security**: [bcryptjs](https://www.npmjs.com/package/bcryptjs) password hashing & CORS
- **Database Driver**: [MongoDB Native Driver](https://www.mongodb.com/docs/drivers/node/current/)

### Database
- **Provider**: [MongoDB Atlas](https://www.mongodb.com/atlas) Cloud Cluster
- **Collections**: `users` (unique email index) & `profiles` (unique userId index)

---

## 🚀 Local Setup Instructions

### 1. Configure Environment
Create a `.env` file in the root directory and specify your MongoDB Atlas connection URI:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB=life_rpg
PORT=5000
VITE_API_URL=http://localhost:5000/api
```

### 2. Install Packages
Install the dependencies using npm:

```bash
npm install
```

### 3. Run Application
Run the backend API server and the Vite frontend client:

* **Start the Backend API Server:**
  ```bash
  node server.js
  # Or via npm script:
  npm run server
  ```
  *The Express API will start listening on `http://localhost:5000`.*

* **Start the Vite Frontend Client:**
  ```bash
  npm run dev
  ```
  *The Vite dev server will launch on `http://localhost:5181`.*

---

## ⌨️ Accessibility & Keyboard Controls

Life RPG is engineered with keyboard-first navigation and inclusive ARIA compliance:

| Key Binding | Action & Context |
| :--- | :--- |
| **`Tab`** | Sequential, logical DOM navigation through interactive elements (skip links, folder tabs, filter tags, quest cards, buttons, inputs). |
| **`Shift + Tab`** | Reverse sequential navigation; traps focus inside active modal dialogs. |
| **`Space`** / **`Enter`** | Trigger quest completion and stamp effects on focused cards or completion checkboxes; activates paper buttons and switches. |
| **`Esc`** | Dismisses active modal dialogs (New Quest Modal, Auth Modal, Level Up Overlay, and Offline Notices) immediately. |
| **`N`** | Global shortcut on the desk to write and pin a new quest. |

### Tactile Focus Ring
All interactive elements (Polaroid cards, buttons, checkboxes, input fields, and modal containers) adhere to a unified tactile focus design:
```css
focus:outline-none focus:ring-2 focus:ring-amber-800 focus:ring-offset-2
```

---

## 🎮 Game Engine Mechanics

### 1. Experience & Leveling Curve
The required experience points (XP) to advance to the next level scales exponentially:
$$\text{NextLevelXP} = \text{BASE\_XP} \times (\text{XP\_MULTIPLIER}^{\text{level} - 1})$$
* **$\text{BASE\_XP}$**: $120$
* **$\text{XP\_MULTIPLIER}$**: $1.28$
* *Multi-level rollover*: Surplus XP earned from a large quest automatically cascades into subsequent levels.

### 2. Difficulty Ranks
Quests are rated across 6 difficulty tiers, determining the rewards:

| Rank | Title | XP Reward | Gold Reward | Attribute Gain | Ink Color |
| :---: | :--- | :---: | :---: | :---: | :---: |
| **E** | A small kindness | 25 XP | 6 Gold | +1 | `#9aa39a` |
| **D** | An ordinary errand | 45 XP | 12 Gold | +1 | `#8fae86` |
| **C** | A proper venture | 80 XP | 22 Gold | +2 | `#85aecb` |
| **B** | A real trial | 140 XP | 40 Gold | +3 | `#b39cd0` |
| **A** | An odyssey | 240 XP | 72 Gold | +4 | `#e0a63c` |
| **S** | The stuff of legend | 420 XP | 130 Gold | +6 | `#9c3d43` |

### 3. Realms & Attributes
Each quest belongs to a realm that fosters a specific human attribute:
- 📖 **The Library** $\to$ **Intellect** (*study, code, reading, learning*)
- 🪓 **The Iron Grove** $\to$ **Strength** (*gym, running, chores, the body*)
- 🎨 **The Atelier** $\to$ **Creativity** (*art, music, writing, crafting*)
- 🌿 **The Still Pond** $\to$ **Wisdom** (*rest, community, mindfulness, journaling*)

### 4. Local Calendar Streaks
Streaks are calculated based on the user's local date (`YYYY-MM-DD`):
- **Consecutive Day (+1 day)**: Extends streak and awards bonus gold ($10 + \min(\text{streak}, 14) \times 2$).
- **Missed Day (> 1 day)**: Resets streak to Day 1, giving players a gentle fresh start.

---

## 📡 REST API Reference

| Endpoint | Method | Description |
| :--- | :---: | :--- |
| `/api/health` | `GET` | Health check endpoint returning database connectivity status. |
| `/api/auth/signup` | `POST` | Registers a new account, hashes password via bcrypt, and seeds 4 starter quests. |
| `/api/auth/signin` | `POST` | Authenticates email & password, returning user and profile data. |
| `/api/user/:userId` | `GET` | Retrieves full game state (attributes, quests, cosmetics, stats). |
| `/api/user/:userId/sync` | `POST` | Atomically updates profile progress, completed quests, and cosmetics inventory. |

---

## 📦 Build & Verification Scripts

```bash
# Typecheck TypeScript definitions
npm run typecheck

# Run ESLint validation
npm run lint

# Build production bundle (bundled into single dist/index.html)
npm run build

# Preview production build locally
npm run preview
```

---

## 📄 License
This project is licensed under the [Apache-2.0 License](LICENSE).
