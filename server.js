import "dotenv/config";
import express from "express";
import cors from "cors";
import { MongoClient, ObjectId } from "mongodb";
import bcrypt from "bcryptjs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT || 5000);
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
const databaseName = process.env.MONGODB_DB || "life_rpg";

if (!mongoUri) {
  throw new Error("MONGODB_URI (or MONGO_URI) is required. Put the Atlas URI in the server environment.");
}

const client = new MongoClient(mongoUri);
let users;
let profiles;

const starterQuests = [
  { title: "Drink a glass of water", details: "The lowest-effort win there is. Start the chain somewhere.", realm: "pond", rank: "E", rewardXP: 25, rewardGold: 6 },
  { title: "Read 10 pages of anything", details: "Paper, screen, cereal box. Ten pages counts.", realm: "library", rank: "D", rewardXP: 45, rewardGold: 12 },
  { title: "Twenty minutes of moving", details: "A walk around the block is a legitimate expedition.", realm: "grove", rank: "C", rewardXP: 80, rewardGold: 22 },
  { title: "Make one small ugly thing", details: "A doodle, four bars of a song, a bad poem. Finished > good.", realm: "atelier", rank: "D", rewardXP: 45, rewardGold: 12 },
];

app.use(cors());
app.use(express.json({ limit: "1mb" }));

function idFor(value) {
  return ObjectId.isValid(value) ? new ObjectId(value) : value;
}

function publicUser(user) {
  return { id: String(user._id), email: user.email, username: user.username };
}

function publicProfile(profile) {
  if (!profile) return null;
  return { ...profile, _id: undefined, userId: String(profile.userId) };
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, database: databaseName });
});

app.post("/api/auth/signup", async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const username = String(req.body.username || "").trim().slice(0, 22);
    const password = String(req.body.password || "");
    if (!email || !username || password.length < 6) {
      return res.status(400).json({ message: "Email, username, and a 6-character password are required." });
    }
    const existing = await users.findOne({ email });
    if (existing) return res.status(409).json({ message: "User already exists" });

    const user = { email, username, passwordHash: await bcrypt.hash(password, 12), createdAt: new Date() };
    const result = await users.insertOne(user);
    const userId = result.insertedId;
    const profile = {
      userId,
      email,
      username,
      name: username,
      title: "Sleepy Sapling",
      level: 1,
      xp: 0,
      currentXP: 0,
      maxXP: 120,
      gold: 100,
      streak: 1,
      bestStreak: 1,
      lastLogin: "",
      questsCompleted: 0,
      attributes: { intellect: 1, strength: 1, creativity: 1, wisdom: 1 },
      cosmetics: { owned: ["tape-sakura", "pin-brass", "paper-cream"], equipped: { tape: "tape-sakura", pin: "pin-brass", paper: "paper-cream" } },
      quests: starterQuests.map((quest, index) => ({
        id: `quest-${userId}-${index}`,
        ...quest,
        status: "active",
        date: new Date().toISOString(),
        completedAt: undefined,
        seed: Math.floor(Math.random() * 1000),
      })),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await profiles.insertOne(profile);
    return res.status(201).json({ user: publicUser({ ...user, _id: userId }), profile: publicProfile(profile) });
  } catch (error) {
    console.error("Mongo signup error:", error);
    return res.status(500).json({ message: "Could not create the account." });
  }
});

app.post("/api/auth/signin", async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    const user = await users.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const profile = await profiles.findOne({ userId: user._id });
    return res.json({ user: publicUser(user), profile: publicProfile(profile) });
  } catch (error) {
    console.error("Mongo signin error:", error);
    return res.status(500).json({ message: "Could not sign in." });
  }
});

app.get("/api/user/:userId", async (req, res) => {
  try {
    const profile = await profiles.findOne({ userId: idFor(req.params.userId) });
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    return res.json({ profile: publicProfile(profile) });
  } catch (error) {
    console.error("Mongo profile read error:", error);
    return res.status(500).json({ message: "Could not load profile." });
  }
});

app.post("/api/user/:userId/sync", async (req, res) => {
  try {
    const userId = idFor(req.params.userId);
    const gameData = req.body || {};
    const update = {
      ...gameData,
      userId,
      updatedAt: new Date(),
    };
    delete update._id;
    await profiles.updateOne({ userId }, { $set: update }, { upsert: true });
    const profile = await profiles.findOne({ userId });
    return res.json({ profile: publicProfile(profile) });
  } catch (error) {
    console.error("Mongo sync error:", error);
    return res.status(500).json({ message: "Could not sync game data." });
  }
});

const distPath = path.join(__dirname, "dist");
app.use(express.static(distPath));

// Express 5 SPA fallback
app.use((req, res, next) => {
  if (req.method === "GET" && !req.path.startsWith("/api")) {
    return res.sendFile(path.join(distPath, "index.html"));
  }
  next();
});

async function start() {
  await client.connect();
  const database = client.db(databaseName);
  users = database.collection("users");
  profiles = database.collection("profiles");
  await users.createIndex({ email: 1 }, { unique: true });
  await profiles.createIndex({ userId: 1 }, { unique: true });
  app.listen(port, () => console.log(`Life RPG API listening on http://localhost:${port}`));
}

start().catch((error) => {
  console.error("MongoDB startup error:", error);
  process.exitCode = 1;
});
