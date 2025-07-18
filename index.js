const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const app = express();
app.use(express.json());

// --- Simple in-memory DB fallback, in case file isn't ready ---
const DATA_FILE = path.join(__dirname, 'data.json');
const ANALYTICS_FILE = path.join(__dirname, 'analytics.json');
const LOG_FILE = path.join(__dirname, 'service.log');

// --- Utility file-handling functions ---
function loadJson(file) {
  if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file));
  return {};
}
function saveJson(file, obj) {
  fs.writeFileSync(file, JSON.stringify(obj, null, 2));
}
function appendLog(line) {
  fs.appendFileSync(LOG_FILE, `[${new Date().toISOString()}] ${line}\n`);
}

// --- 1. URL Shortener Routes ---
app.post("/api/shorten", (req, res) => {
  const { url, validityMinutes } = req.body;
  if (!url) return res.status(400).json({ error: "URL required" });
  let data = loadJson(DATA_FILE);
  let short;
  do {
    short = crypto.randomBytes(5).toString('base64url').substring(0, 7);
  } while (data[short]);
  const createdAt = Date.now();
  const expiresAt = createdAt + 60000 * (validityMinutes || 30);
  data[short] = { url, createdAt, expiresAt, visitCount: 0 };
  saveJson(DATA_FILE, data);
  appendLog(`Shortened: ${short} -> ${url}`);
  res.json({ short, url, expiresAt });
});

app.get("/api/info/:short", (req, res) => {
  const { short } = req.params;
  let data = loadJson(DATA_FILE);
  const info = data[short];
  if (!info) return res.status(404).json({ error: "Not found" });
  res.json(info);
});

app.get("/s/:short", (req, res) => {
  let data = loadJson(DATA_FILE);
  let analytics = loadJson(ANALYTICS_FILE);
  const { short } = req.params;
  const info = data[short];
  if (!info || Date.now() > info.expiresAt)
    return res.status(404).send("Link expired or not found");
  // Analytics
  info.visitCount += 1;
  analytics[short] = analytics[short] ? analytics[short] + 1 : 1;
  saveJson(DATA_FILE, data);
  saveJson(ANALYTICS_FILE, analytics);
  appendLog(`Redirected: ${short}`);
  res.redirect(info.url);
});

// --- 2. Analytics Routes ---
app.get('/api/analytics/:short', (req, res) => {
  let analytics = loadJson(ANALYTICS_FILE);
  const { short } = req.params;
  res.json({ short, visits: analytics[short] || 0 });
});

// --- 3. Logger Route (View last 20 log lines) ---
app.get("/api/logs", (req, res) => {
  let content = "";
  try {
    content = fs.readFileSync(LOG_FILE, "utf-8");
  } catch {/** ignore */}
  let lines = content.split("\n").filter(Boolean);
  res.json({ lastLogs: lines.slice(-20).reverse() });
});

// --- Static files fallback for React frontend ---
app.use(express.static(path.join(__dirname, "../client/build")));
app.get("/*", (req, res) =>
  res.sendFile(path.join(__dirname, "../client/build/index.html"))
);

const PORT = 3000;
app.listen(PORT, () => {
  // Prepare storage files on startup
  for (const f of [DATA_FILE, ANALYTICS_FILE, LOG_FILE]) if (!fs.existsSync(f)) fs.writeFileSync(f, "{}");
  // Log
  appendLog("Server started");
  console.log("Backend running on:", PORT);
});
