# ∞ Bhavesh's Training Journal

A public, frontend-only daily training journal for **Bhavesh Sharma** (2nd-year B.Tech CS,
Bikaner Technical University) — the road to becoming an **AI-augmented full-stack engineer**:
infinity-level, irreplaceable by AI.

**Live at:** `daily.thebhavesh.online` (via `CNAME`)
**Training started:** Monday, Oct 12, 2026

## What this site tracks

Every training day publishes:
- 🧩 **DSA** — the interview-level problem of the day, its pattern, the approach, and the result
- 🧱 **Full-stack depth** — frontend → backend → databases → distributed systems, taught from basics
- 💻 **CS fundamentals** — from absolute zero → interview depth (OS → DBMS → Networks → Linux)
- 🎤 **Communication** — daily English practice, STAR stories, Q&A
- 📊 **Daily scorecard** — Logic · Speed · Concepts · English, each scored 1–5 vs the previous day

Plus: a **Normal / Exam mode** toggle (exam mode shrinks training to DSA + college prep),
a training timeline, stats (day streak, DSA solved, average score), and the full program overview.

## How daily updates work

A daily automation adds one new day at a time. The format is deliberately simple so a script
can replicate it:

1. Create `days/day-NN/` with exactly these five files (same names, same section template):
   - `DSA.txt` — sections: 🧩 PROBLEM, 🏷️ PATTERN, 🧠 MY APPROACH, ⏱️ RESULT
   - `FULLSTACK.txt` — sections: 🎯 WHY THIS MATTERS, 📖 CORE CONCEPT, 🔬 BEYOND YOUTUBE, 💼 INTERVIEW LENS, ❓ QUIZ, 🙋 DOUBTS
   - `CS-FUNDAMENTALS.txt` — same six sections as FULLSTACK.txt
   - `COMMUNICATION.txt` — sections: 🎤 ENGLISH PRACTICE, 💬 STAR STORY / Q&A, 📈 NOTES
   - `REPORT.txt` — sections: 📊 SCORECARD, 📌 BASELINE/HIGHLIGHT, 📈 TREND, 🎯 TOMORROW'S FOCUS
   - Rule for the site renderer: any line starting with an emoji becomes a section header.
2. Append one entry to `data/days.json`:
   ```json
   {
     "id": "day-02",
     "date": "2026-10-13",
     "title": "Day 2 — <short title>",
     "dsa_problem": "<problem name>",
     "dsa_pattern": "<pattern>",
     "scores": { "logic": 4, "speed": 3, "concepts": 4, "english": 3 },
     "highlight": "<one-line highlight>"
   }
   ```
   Use `null` scores while the day is still in progress.
3. To flip the official site mode, edit `data/mode.json` (`"normal"` or `"exam"`).
   Visitors can also override it locally with the toggle (saved in their browser only).

No build step. No backend. Just push to the repo — GitHub Pages serves it.

## Progress

| Day | Date | DSA pattern | Avg score |
|-----|------|-------------|-----------|
| day-01 | 2026-10-12 | Arrays | 3.25 |
| day-02 | 2026-10-13 | Two pointers | 3.25 |
| day-03 | 2026-10-14 | Sliding window | 3.5 |
| day-06 | 2026-10-17 | Recursion | 4.67 (English pending) |
| day-07 | 2026-10-18 | Recursion | 4.67 (English pending) |
| day-08 | 2026-10-21 | Backtracking | 4.67 (English pending) |
| day-09 | 2026-10-22 | Trees | 4.17 (speed not reported) |
| day-10 | 2026-10-23 | Heaps | 5.0 (speed + English pending) |
| day-11 | 2026-10-24 | Intervals | not scored (no scores reported) |
| day-12 | 2026-10-25 | Intervals | not scored (no scores reported) |
| day-13 | 2026-10-26 | Graphs | 4.17 (speed not reported) |

*Baseline (Day 0, Oct 11, 2026): 455 LeetCode solved (176E/247M/32H) · CGPA 9.20/10 ·
Go backend @ Obfinity · Web Dev Intern @ Squarecell · CS fundamentals from zero.*
