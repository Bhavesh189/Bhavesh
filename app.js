/* ============================================================
   Bhavesh's Training Journal — app logic (vanilla JS)
   - RIGHT NOW dashboard: live IST clock + current timetable block
   - Renders home timeline + day pages from data/days.json
   - Normal/Exam mode: official mode from data/mode.json,
     user override persisted in localStorage.
   ============================================================ */
"use strict";

const MODE_KEY = "bhavesh-mode-override"; // "normal" | "exam" | null
const BASELINE_DSA = 350; // LeetCode solved before training began (Day 0)

/* Full timetable, from ~/workspace/interview-training/timetable.md.
   Each block: [startMin, endMin, icon, title, description].
   Sleep (11 PM - 7 AM, Sun: till 12 PM) is handled separately. */
const TIMETABLE = {
  normal: {
    weekday: [ // Mon - Fri
      [420, 450, "☀️", "Wake up & get ready", "Fresh start. No phone scrolling."],
      [450, 960, "🎓", "College", "B.Tech classes — be present, take notes."],
      [960, 1020, "🌿", "Unwind / free time", "Rest, walk, recharge."],
      [1020, 1080, "🧩", "DSA Problem of the Day", "One interview-level problem. Struggle 30+ min, hints only, think aloud."],
      [1080, 1140, "🧱", "Full-Stack Depth", "JS → React → Node → databases. Wednesday = Zulip open source."],
      [1140, 1215, "💪", "Gym + dinner", "Train the body, fuel the brain."],
      [1215, 1275, "💻", "CS Fundamentals", "From absolute zero → interview depth. OS → DBMS → Networks → Linux."],
      [1275, 1305, "🎤", "English & STAR", "Explain in English. STAR stories. Rapid Q&A."],
      [1305, 1320, "📝", "Daily report", "Scorecard vs yesterday: logic, speed, concepts, English."],
      [1320, 1380, "📚", "College study", "Assignments, revision."]
    ],
    saturday: [
      [420, 450, "☀️", "Wake up & get ready", "Fresh start. No phone scrolling."],
      [450, 960, "🎓", "College", "B.Tech classes — be present, take notes."],
      [960, 1020, "🌿", "Unwind / free time", "Rest, walk, recharge."],
      [1020, 1080, "🧩", "DSA Problem of the Day", "One interview-level problem. Struggle 30+ min, hints only."],
      [1080, 1140, "🧱", "Full-Stack Depth", "JS → React → Node → DBs → System Design."],
      [1140, 1190, "💪", "Gym + dinner", "Compressed: train hard, eat fast."],
      [1195, 1295, "🏆", "Weekly Contest", "Timed contest. Speed under pressure."],
      [1295, 1310, "🎤", "English lightning", "Rapid Q&A in English. Fast and sharp."],
      [1310, 1320, "📝", "Weekly review", "Week's wins, gaps, next week's plan."],
      [1320, 1380, "🤝", "Zulip Open Source", "Good-first-issues → PRs. The GSoC road."]
    ],
    wednesday: [
      [420, 450, "☀️", "Wake up & get ready", "Fresh start. No phone scrolling."],
      [450, 960, "🎓", "College", "B.Tech classes — be present, take notes."],
      [960, 1020, "🌿", "Unwind / free time", "Rest, walk, recharge."],
      [1020, 1080, "🧩", "DSA Problem of the Day", "One interview-level problem. Struggle 30+ min, hints only, think aloud."],
      [1080, 1140, "🤝", "Zulip Open Source", "Good-first-issues → PRs. The GSoC road."],
      [1140, 1215, "💪", "Gym + dinner", "Train the body, fuel the brain."],
      [1215, 1275, "💻", "CS Fundamentals", "From absolute zero → interview depth. OS → DBMS → Networks → Linux."],
      [1275, 1305, "🎤", "English & STAR", "Explain in English. STAR stories. Rapid Q&A."],
      [1305, 1320, "📝", "Daily report", "Scorecard vs yesterday: logic, speed, concepts, English."],
      [1320, 1380, "📚", "College study", "Assignments, revision."]
    ],
    sunday: [
      [720, 750, "☀️", "Wake up & freshen up", "Sunday starts at noon."],
      [750, 930, "🎓", "College project files & assignments", "Get the college work done first."],
      [930, 990, "🌿", "Rest", "Recharge — stay fresh for the evening."],
      [990, 1050, "🧩", "DSA — mandatory", "The streak never breaks, even on Sunday."],
      [1050, 1080, "☕", "Gap", "Breathe. Stay fresh."],
      [1080, 1140, "🧱", "Light full-stack / revision", "Easy revision, no heavy lifting."],
      [1140, 1215, "💪", "Gym + dinner", "Train the body, fuel the brain."],
      [1215, 1305, "🎙️", "Mock interview", "Timed. Like the real thing."],
      [1305, 1335, "📝", "Feedback & fix plan", "What to fix next week."],
      [1335, 1380, "🌙", "Wind down", "Light evening, early night."]
    ]
  },
  exam: {
    weekday: [ // Mon - Sat in exam mode
      [420, 450, "☀️", "Wake up & get ready", "Fresh start."],
      [450, 960, "🎓", "College", "B.Tech classes as usual."],
      [960, 1020, "🌿", "Unwind / free time", "Rest, walk, recharge."],
      [1020, 1080, "🧩", "DSA — mandatory", "The streak never breaks, even in exams."],
      [1080, 1140, "📚", "College exam prep", "Exams have priority."],
      [1140, 1215, "💪", "Gym + dinner", "Train the body, fuel the brain."],
      [1215, 1380, "📚", "College exam prep", "Priority block — deep focus."]
    ],
    saturday: [ // same as exam weekday
      [420, 450, "☀️", "Wake up & get ready", "Fresh start."],
      [450, 960, "🎓", "College", "B.Tech classes as usual."],
      [960, 1020, "🌿", "Unwind / free time", "Rest, walk, recharge."],
      [1020, 1080, "🧩", "DSA — mandatory", "The streak never breaks, even in exams."],
      [1080, 1140, "📚", "College exam prep", "Exams have priority."],
      [1140, 1215, "💪", "Gym + dinner", "Train the body, fuel the brain."],
      [1215, 1380, "📚", "College exam prep", "Priority block — deep focus."]
    ],
    sunday: [ // mocks pause in exam mode
      [720, 750, "☀️", "Wake up & freshen up", "Sunday starts at noon."],
      [750, 990, "📚", "College exam prep", "Exams have priority."],
      [990, 1050, "🧩", "DSA — mandatory", "The streak never breaks, even on Sunday."],
      [1050, 1140, "📚", "College exam prep", "Keep going."],
      [1140, 1215, "💪", "Gym + dinner", "Train the body, fuel the brain."],
      [1215, 1380, "📚", "College exam prep", "Priority block — deep focus."],
      [1335, 1380, "🌙", "Wind down", "Light evening, early night."]
    ]
  }
};

function dayType(dayIdx) { // 0 = Sunday
  if (dayIdx === 0) return "sunday";
  if (dayIdx === 6) return "saturday";
  if (dayIdx === 3) return "wednesday"; // Zulip replaces full-stack depth
  return "weekday";
}

/* Overnight sleep block. Returns {start, end} in minutes; end may exceed 1440. */
function sleepRange(dayIdx) {
  if (dayIdx === 0) return { start: 1380, end: 720 + 1440 }; // Sun: 11 PM -> 12 PM
  return { start: 1380, end: 420 + 1440 }; // 11 PM -> 7 AM
}
function sleepBlock(dayIdx) {
  const r = sleepRange(dayIdx);
  return {
    start: r.start, end: r.end, icon: "😴",
    title: dayIdx === 0 ? "Sleep / rest" : "Sleep",
    desc: dayIdx === 0 ? "Recharge. Sunday starts at 12 PM." : "11 PM – 7 AM. Non-negotiable."
  };
}

function fmtTime(m) {
  m = ((m % 1440) + 1440) % 1440;
  let h = Math.floor(m / 60);
  const mm = m % 60;
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12; if (h === 0) h = 12;
  return h + ":" + String(mm).padStart(2, "0") + " " + ap;
}
function fmtRange(s, e) { return fmtTime(s) + " – " + fmtTime(e); }

/* Pure: given IST day index, minutes, and mode -> {current, next, blocks}. */
function computeNow(dayIdx, mins, mode) {
  const dayBlocks = TIMETABLE[mode][dayType(dayIdx)] || TIMETABLE[mode].weekday;
  const list = dayBlocks.map(b => ({
    start: b[0], end: b[1], icon: b[2], title: b[3], desc: b[4]
  }));
  const sleep = sleepBlock(dayIdx);
  const sr = sleepRange(dayIdx);
  let current = null;
  for (const b of list) {
    if (mins >= b.start && mins < b.end) { current = b; break; }
  }
  if (!current && (mins >= sr.start || mins < (sr.end % 1440))) current = sleep;
  if (!current) {
    current = { start: mins, end: mins, icon: "🌿", title: "Free moment", desc: "Between blocks — breathe." };
  }
  const upcoming = list.filter(b => b.start > mins).sort((a, b) => a.start - b.start);
  let next = upcoming.length ? upcoming[0] : null;
  if (!next) {
    if (mins < sr.start && current !== sleep) {
      next = sleep; // evening: sleep is next
    } else {
      next = { start: 0, end: 0, icon: "🌅", title: "Tomorrow's first block", desc: "Wake up and start again." };
    }
  }
  return { current, next, blocks: list.concat([sleep]) };
}

/* IST parts without any library. */
function istParts() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Calcutta", weekday: "short",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23"
  }).formatToParts(new Date());
  const o = {};
  for (const p of parts) o[p.type] = p.value;
  const dayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return { dayIdx: dayMap[o.weekday], mins: parseInt(o.hour, 10) * 60 + parseInt(o.minute, 10) };
}

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
function set(id, text) { const el = document.getElementById(id); if (el) el.textContent = text; }
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
  try {
    const override = localStorage.getItem(MODE_KEY);
    if (override === "normal" || override === "exam") return override;
  } catch (e) { /* storage unavailable */ }
  return officialMode;
}
function renderModeUI() {
  const mode = effectiveMode();
  const badge = document.getElementById("mode-badge");
  if (badge) {
    badge.classList.toggle("normal", mode === "normal");
    badge.classList.toggle("exam", mode === "exam");
  }
  set("mode-label", mode === "normal" ? "NORMAL MODE" : "EXAM MODE");
  const toggle = document.getElementById("mode-toggle");
  if (toggle) toggle.textContent = mode === "normal" ? "Switch to Exam Mode" : "Switch to Normal Mode";
}
function initModeToggle() {
  const toggle = document.getElementById("mode-toggle");
  if (!toggle) return;
  toggle.addEventListener("click", () => {
    const next = effectiveMode() === "normal" ? "exam" : "normal";
    try { localStorage.setItem(MODE_KEY, next); } catch (e) { /* ignore */ }
    renderModeUI();
    renderNow();
    renderPlan();
  });
}

/* ---------- RIGHT NOW dashboard ---------- */
function tickClock() {
  const now = new Date();
  try {
    set("clock-time", new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Calcutta", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true
    }).format(now));
    set("clock-date", new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Calcutta", weekday: "long", day: "numeric", month: "long", year: "numeric"
    }).format(now));
    set("mini-clock", new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Calcutta", hour: "2-digit", minute: "2-digit", hour12: true
    }).format(now));
  } catch (e) { /* Intl unavailable */ }
}

function renderNow() {
  if (!document.getElementById("now-title")) return;
  let p;
  try { p = istParts(); } catch (e) { return; }
  const { current, next } = computeNow(p.dayIdx, p.mins, effectiveMode());
  set("now-icon", current.icon);
  set("now-title", current.title);
  set("now-range", fmtRange(current.start, current.end));
  set("now-desc", current.desc);
  const total = current.end - current.start;
  const done = total > 0
    ? (p.mins >= current.start ? p.mins - current.start : p.mins + 1440 - current.start)
    : 0;
  const pct = total > 0 ? Math.max(0, Math.min(100, (done / total) * 100)) : 0;
  const bar = document.getElementById("now-progress");
  if (bar) bar.style.width = pct.toFixed(1) + "%";
  const nt = document.getElementById("next-text");
  if (nt) nt.textContent = next.icon + " " + next.title +
    (next.start || next.end ? " (" + fmtRange(next.start, next.end) + ")" : "");
}

function renderPlan() {
  const list = document.getElementById("plan-list");
  if (!list) return;
  let p;
  try { p = istParts(); } catch (e) { return; }
  const mode = effectiveMode();
  const { blocks } = computeNow(p.dayIdx, p.mins, mode);
  const dayName = new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Calcutta", weekday: "long" })
    .format(new Date());
  set("plan-day-tag", dayName.toUpperCase() + " · " + mode.toUpperCase() + " MODE");
  // Order: day blocks first, sleep last.
  const ordered = blocks.slice(0, -1).concat([blocks[blocks.length - 1]]);
  list.innerHTML = ordered.map(b => {
    const isNow = p.mins >= b.start && p.mins < Math.min(b.end, 1440) ||
      (b.end > 1440 && (p.mins >= b.start || p.mins < (b.end % 1440)));
    const isPast = !isNow && b.end <= p.mins && b.end <= 1440;
    return '<div class="plan-row' + (isNow ? " is-now" : isPast ? " is-past" : "") + '">' +
      '<div class="p-icon">' + esc(b.icon) + "</div>" +
      '<div><div class="p-time">' + esc(fmtRange(b.start, b.end)) + "</div>" +
      '<div class="p-title">' + esc(b.title) + "</div>" +
      (b.desc ? '<div class="p-desc">' + esc(b.desc) + "</div>" : "") + "</div></div>";
  }).join("");
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
  set("stat-days", String(done.length).padStart(2, "0"));
  set("stat-dsa", BASELINE_DSA + "+" + (done.length ? " (+" + done.length + ")" : ""));
  if (done.length) {
    const avg = done.reduce((s, d) =>
      s + (d.scores.logic + d.scores.speed + d.scores.concepts + d.scores.english) / 4, 0) / done.length;
    set("stat-score", avg.toFixed(1));
  } else {
    set("stat-score", "—");
  }
}
async function initHome() {
  try { officialMode = (await getJSON("data/mode.json")).mode || "normal"; }
  catch (e) { officialMode = "normal"; }
  let days = [];
  try { days = await getJSON("data/days.json"); } catch (e) { days = []; }
  renderModeUI(); initModeToggle();
  tickClock(); renderNow(); renderPlan();
  setInterval(tickClock, 1000);
  setInterval(() => { renderNow(); renderPlan(); }, 30000);
  renderTimeline(days); renderStats(days);
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
