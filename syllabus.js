/* ============================================================
   Syllabus viewer — reads syllabus.xlsx via SheetJS and renders
   it as tappable topic cards with search + progress.
   ============================================================ */
"use strict";

const SHEET_ORDER = ["DSA", "OS", "DBMS", "Networks", "Linux",
  "Frontend-TS-React", "Backend-Node-Python", "PostgreSQL",
  "AI-Integration", "DevOps"];

let WORKBOOK = null;
let ACTIVE_SHEET = SHEET_ORDER[0];
let QUERY = "";

function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function statusPill(status) {
  const s = String(status || "Not started");
  const cls = s === "Done" ? "done" : s === "In progress" ? "progress"
    : s === "Skipped" ? "skipped" : "todo";
  return '<span class="pill ' + cls + '">' + esc(s) + "</span>";
}
function sheetRows(name) {
  const ws = WORKBOOK.Sheets[name];
  if (!ws) return [];
  // header row: # | Topic | Subtopics | Activity | Status | Est days | Done when | Why | Depends on
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
  return rows.slice(1).filter(r => r[1]).map(r => ({
    n: r[0], topic: r[1], subtopics: r[2], activity: r[3],
    status: r[4] || "Not started", days: r[5],
    doneWhen: r[6], why: r[7], dependsOn: r[8]
  }));
}
function counts(rows) {
  const done = rows.filter(r => r.status === "Done").length;
  return { done, total: rows.length };
}

function renderTabs() {
  const el = document.getElementById("syl-tabs");
  el.innerHTML = SHEET_ORDER.filter(n => WORKBOOK.Sheets[n]).map(n => {
    const c = counts(sheetRows(n));
    return '<button class="syl-tab' + (n === ACTIVE_SHEET ? " active" : "") +
      '" data-sheet="' + esc(n) + '">' + esc(n) +
      ' <span style="opacity:.65">' + c.done + "/" + c.total + "</span></button>";
  }).join("");
  el.querySelectorAll(".syl-tab").forEach(b =>
    b.addEventListener("click", () => { ACTIVE_SHEET = b.dataset.sheet; renderTabs(); renderList(); }));
}

function renderOverall() {
  let done = 0, total = 0;
  SHEET_ORDER.forEach(n => {
    if (!WORKBOOK.Sheets[n]) return;
    const c = counts(sheetRows(n));
    done += c.done; total += c.total;
  });
  const pct = total ? Math.round((done / total) * 100) : 0;
  document.getElementById("overall-label").textContent =
    done + " of " + total + " topics done (" + pct + "%) — " + (total - done) + " remaining";
  document.getElementById("overall-bar").style.width = pct + "%";
}

function renderList() {
  const list = document.getElementById("syl-list");
  let rows = sheetRows(ACTIVE_SHEET);
  if (QUERY) {
    const q = QUERY.toLowerCase();
    rows = rows.filter(r => (r.topic + " " + r.subtopics + " " + r.activity).toLowerCase().includes(q));
  }
  if (!rows.length) {
    list.innerHTML = '<p class="muted" style="padding:20px 0">No topics match.</p>';
    return;
  }
  list.innerHTML = rows.map(r =>
    '<div class="topic"><div class="topic-head">' +
    '<div class="topic-n">' + esc(r.n) + "</div>" +
    '<div class="topic-title">' + esc(r.topic) + "</div>" +
    statusPill(r.status) +
    '<span class="chev">▶</span>' +
    "</div>" +
    '<dl class="topic-body">' +
    (r.subtopics ? "<dt>WHAT TO LEARN</dt><dd>" + esc(r.subtopics) + "</dd>" : "") +
    (r.activity ? "<dt>DAY ACTIVITY</dt><dd>" + esc(r.activity) + "</dd>" : "") +
    (r.days ? "<dt>EST. DAYS</dt><dd>" + esc(r.days) + "</dd>" : "") +
    (r.doneWhen ? "<dt>DONE WHEN</dt><dd>" + esc(r.doneWhen) + "</dd>" : "") +
    (r.why ? "<dt>WHY IT MATTERS</dt><dd>" + esc(r.why) + "</dd>" : "") +
    (r.dependsOn ? "<dt>NEEDS FIRST</dt><dd>Topic " + esc(r.dependsOn) + "</dd>" : "") +
    "</dl></div>"
  ).join("");
  list.querySelectorAll(".topic-head").forEach(h =>
    h.addEventListener("click", () => h.parentElement.classList.toggle("open")));
}

async function init() {
  try {
    const res = await fetch("syllabus.xlsx");
    if (!res.ok) throw new Error("HTTP " + res.status);
    const buf = await res.arrayBuffer();
    WORKBOOK = XLSX.read(buf, { type: "array" });
  } catch (e) {
    document.getElementById("syl-list").innerHTML =
      '<p class="muted" style="padding:20px 0">Could not load the syllabus file. Check your connection and reload.</p>';
    return;
  }
  if (!WORKBOOK.Sheets[ACTIVE_SHEET]) {
    ACTIVE_SHEET = SHEET_ORDER.find(n => WORKBOOK.Sheets[n]) || Object.keys(WORKBOOK.Sheets)[0];
  }
  renderOverall();
  renderTabs();
  renderList();
  document.getElementById("syl-search").addEventListener("input", e => {
    QUERY = e.target.value.trim();
    renderList();
  });
}

document.addEventListener("DOMContentLoaded", init);
