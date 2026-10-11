/* ============================================================
   Bhavesh's Training Journal — app logic (vanilla JS)
   - Renders home timeline + day pages from data/days.json
   - Normal/Exam mode: official mode from data/mode.json,
     user override persisted in localStorage.
   ============================================================ */
"use strict";

const MODE_KEY = "bhavesh-mode-override"; // "normal" | "exam" | null
const BASELINE_DSA = 350; // LeetCode solved before training began (Day 0)

/* Block schedules, from ~/workspace/interview-training/timetable.md */
const SCHEDULE = {
  normal: {
    label: "NORMAL MODE",
    desc: "Full training day: DSA + full-stack depth + CS fundamentals from zero + English + daily scorecard. Sunday = mock interview day.",
    blocks: [
      ["5:00 – 6:00 PM", "DSA Problem of the Day", "Interview-level, pattern-based. Solve alone 30+ min, hints only."],
      ["6:00 – 7:00 PM", "Full-Stack Depth (Wed: Zulip)", "JS → React → Node → DBs → System Design. Wed = Zulip open-source."],
      ["8:15 – 9:15 PM", "CS Fundamentals", "From absolute zero → interview depth. OS → DBMS → Networks → Linux."],
      ["9:15 – 9:45 PM", "English Communication", "Explain in English. STAR stories. Rapid Q&A."],
      ["9:45 – 10:00 PM", "Daily Report", "Scorecard vs yesterday: logic, speed, concepts, English."]
    ]
  },
  exam: {
    label: "EXAM MODE",
    desc: "College exams have priority. Training shrinks — but the DSA streak never breaks. Sunday mocks pause.",
    blocks: [
      ["5:00 – 6:00 PM", "DSA Problem of the Day", "MANDATORY — the streak never breaks."],
      ["6:00 – 7:00 PM", "College exam prep", ""],
      ["8:15 – 11:00 PM", "College exam prep", "Priority block."]
    ]
  }
};

/* ---------- helpers ---------- */
async function getJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error("HTTP " + res.status + " for " + path);
  return res.json();
}
async function getText(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error("HTTP " + res.status + " for " + path);
  return res.text();
}
function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
/* Lines starting with an emoji become section headers. */
function renderTxt(txt) {
  const lines = txt.replace(/\r/g, "").split("\n");
  let html = "";
  const emojiStart = /^(\p{Extended_Pictographic}|\p{Emoji_Presentation})/u;
  for (const line of lines) {
    const t = line.trimEnd();
    if (!t.trim()) { html += "\n"; continue; }
    if (emojiStart.test(t.trim())) {
      html += '<div class="h">' + esc(t) + "</div>\n";
    } else {
      html += esc(t) + "\n";
    }
  }
  return html;
}
function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

/* ---------- mode ---------- */
let officialMode = "normal";
function effectiveMode() {
  const override = localStorage.getItem(MODE_KEY);
  if (override === "normal" || override === "exam") return override;
  return officialMode;
}
function renderModeUI() {
  const mode = effectiveMode();
  const override = localStorage.getItem(MODE_KEY);
  document.querySelectorAll(".badge").forEach(b => {
    b.classList.toggle("normal", mode === "normal");
    b.classList.toggle("exam", mode === "exam");
    b.innerHTML = '<span class="dot"></span>' +
      (mode === "normal" ? "NORMAL MODE" : "EXAM MODE") +
      (override ? "" : ' <span class="small muted">· official</span>');
  });
  document.querySelectorAll(".mode-banner").forEach(el => {
    el.classList.toggle("exam", mode === "exam");
    el.querySelector("p").textContent = SCHEDULE[mode].desc;
    el.querySelector("strong").textContent = SCHEDULE[mode].label;
  });
  const toggle = document.getElementById("mode-toggle");
  if (toggle) toggle.textContent = mode === "normal" ? "Switch to Exam Mode" : "Switch to Normal Mode";
  const focusBlocks = document.getElementById("focus-blocks");
  if (focusBlocks) {
    focusBlocks.innerHTML = SCHEDULE[mode].blocks.map(b =>
      '<div class="program-item"><h4>' + esc(b[0]) + " — " + esc(b[1]) + "</h4>" +
      (b[2] ? '<p>' + esc(b[2]) + "</p>" : "") + "</div>"
    ).join("");
  }
}
function initModeToggle() {
  const toggle = document.getElementById("mode-toggle");
  if (!toggle) return;
  toggle.addEventListener("click", () => {
    const next = effectiveMode() === "normal" ? "exam" : "normal";
    localStorage.setItem(MODE_KEY, next);
    renderModeUI();
  });
}

/* ---------- home page ---------- */
function scoreDots(scores) {
  if (!scores || scores.logic == null) return '<span class="tag pending">upcoming</span>';
  const avg = (scores.logic + scores.speed + scores.concepts + scores.english) / 4;
  return '<span class="tag">avg ' + avg.toFixed(1) + " / 5</span>";
}
function renderTimeline(days) {
  const el = document.getElementById("timeline");
  if (!el) return;
  const sorted = [...days].sort((a, b) => a.id.localeCompare(b.id));
  el.innerHTML = sorted.map(d =>
    '<a class="day-card" href="day.html?day=' + encodeURIComponent(d.id) + '">' +
    '<div class="day-id">' + esc(d.id.toUpperCase().replace("-", " ")) + "</div>" +
    "<h3>" + esc(d.title) + "</h3>" +
    '<div class="date">' + esc(d.date) + "</div>" +
    (d.dsa_pattern ? '<span class="tag">' + esc(d.dsa_pattern) + "</span>" : "") +
    "<br>" + scoreDots(d.scores) +
    "</a>"
  ).join("");
}
function renderStats(days) {
  const done = days.filter(d => d.scores && d.scores.logic != null);
  const set = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
  set("stat-days", String(done.length).padStart(2, "0"));
  set("stat-dsa", BASELINE_DSA + "+" + (done.length ? " / +" + done.length : ""));
  set("stat-phase", "Week 1");
  if (done.length) {
    const avg = done.reduce((s, d) =>
      s + (d.scores.logic + d.scores.speed + d.scores.concepts + d.scores.english) / 4, 0) / done.length;
    set("stat-score", avg.toFixed(1));
  } else {
    set("stat-score", "—");
  }
}
function renderFocus(days) {
  const el = document.getElementById("focus-day");
  if (!el || !days.length) return;
  const latest = [...days].sort((a, b) => a.id.localeCompare(b.id)).pop();
  el.innerHTML =
    '<div class="day-id" style="color:var(--accent-2);font-weight:700;letter-spacing:.12em;font-size:.8rem;">' +
    esc(latest.id.toUpperCase().replace("-", " ")) + " · " + esc(latest.date) + "</div>" +
    "<h3 style='margin:6px 0'>" + esc(latest.title) + "</h3>" +
    '<p class="muted small">' + esc(latest.highlight || "") + "</p>";
}
async function initHome() {
  try { officialMode = (await getJSON("data/mode.json")).mode || "normal"; }
  catch (e) { officialMode = "normal"; }
  let days = [];
  try { days = await getJSON("data/days.json"); } catch (e) { days = []; }
  renderModeUI(); initModeToggle();
  renderTimeline(days); renderStats(days); renderFocus(days);
}

/* ---------- day page ---------- */
const DAY_FILES = [
  ["DSA.txt", "dsa", "🧩 Data Structures & Algorithms"],
  ["FULLSTACK.txt", "fullstack", "🧱 Full-Stack Depth"],
  ["CS-FUNDAMENTALS.txt", "cs", "💻 CS Fundamentals"],
  ["COMMUNICATION.txt", "comm", "🎤 Communication"],
  ["REPORT.txt", "report", "📊 Daily Report"]
];
function renderScorecard(scores) {
  if (!scores || scores.logic == null) {
    return '<p class="muted">Scorecard pending — published with the 9:45 PM daily report.</p>';
  }
  const dims = [["logic", "Logic"], ["speed", "Speed"], ["concepts", "Concepts"], ["english", "English"]];
  return '<div class="scores">' + dims.map(([k, label]) => {
    const v = scores[k];
    let segs = "";
    for (let i = 1; i <= 5; i++) segs += '<span class="seg' + (i <= v ? " on" : "") + '"></span>';
    return '<div class="score-row"><span class="name">' + label + '</span>' +
      '<span class="segs">' + segs + "</span>" +
      '<span class="val">' + v + "/5</span></div>";
  }).join("") + "</div>";
}
async function initDay() {
  const dayId = getParam("day") || "day-01";
  let days = [];
  try { days = await getJSON("data/days.json"); } catch (e) { days = []; }
  const meta = days.find(d => d.id === dayId);
  const head = document.getElementById("day-head");
  if (meta && head) {
    head.innerHTML =
      '<div class="day-id">' + esc(meta.id.toUpperCase().replace("-", " ")) + "</div>" +
      "<h1>" + esc(meta.title) + "</h1>" +
      '<div class="date">' + esc(meta.date) +
      (meta.dsa_pattern ? " · " + esc(meta.dsa_pattern) : "") + "</div>";
  }
  const sc = document.getElementById("scorecard");
  if (sc) sc.innerHTML = "<h2><span class='emoji'>📊</span> Scorecard</h2>" + renderScorecard(meta && meta.scores);
  const filesEl = document.getElementById("day-files");
  if (!filesEl) return;
  const sections = await Promise.all(DAY_FILES.map(async ([file, key, title]) => {
    try {
      const txt = await getText("days/" + dayId + "/" + file);
      return '<div class="section"><div class="file-label">' + esc(file) + "</div>" +
        "<h3 class='sec-title'>" + esc(title) + "</h3>" +
        '<pre class="file-block">' + renderTxt(txt) + "</pre></div>";
    } catch (e) {
      return '<div class="section"><div class="file-label">' + esc(file) + "</div>" +
        "<h3 class='sec-title'>" + esc(title) + "</h3>" +
        '<p class="muted small">Not published yet — this file appears after the day\u2019s session.</p></div>';
    }
  }));
  filesEl.innerHTML = sections.join("");
}

/* ---------- boot ---------- */
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("timeline")) initHome();
  if (document.getElementById("day-files")) initDay();
});
