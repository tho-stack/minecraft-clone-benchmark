# Variance pre-study — resample prompts (per harness)

Purpose: confirm the round-1 verdicts are stable, not N=1 artifacts — above all, **does a fresh M3
build reproduce the double-fire / unplayable core loop?** These are cold-start rebuilds on the verbatim
`PROMPT.md` (same as round 1), so they double as ranking-stability checks for the others.

## Protocol (per run)
1. Fresh empty dir, e.g. `round2/samples/m3/run1/`. Copy the **verbatim** `PROMPT.md` into it
   (`cp PROMPT.md round2/samples/m3/run1/`). Seed 1337 lives inside PROMPT.md — don't change it.
2. Set the harness to the right **model** (see each section).
3. Paste that harness's prompt below. Let it run to completion.
4. Copy the resulting `game.html` to `round2/samples/<model>/runN.html` (rename per run).
5. Repeat **×3–5** per model. (Priority: **M3 first**, then 2.7. GPT/Opus optional — they were
   near-ceiling and uncontroversial; resample only if you want full ranking CIs.)
6. Tell me when samples are in → I run `node round2/probe.mjs round2/samples/m3/*.html` and
   `node round2/smoke.mjs ...` and report the spread (how many of N reproduce the bug / are unplayable).

> **Why the added "build it yourself" line:** the round-1 report (with the exact bug list) is now public.
> For the *variance* question we need M3's **natural** output — if it fetches our write-up it'll just
> avoid the double-fire and the measurement is meaningless. (This is the opposite of the *fix* round,
> where you chose to give it the findings. Different purpose, different rule.) If your harness can't be
> trusted to honor the line, run these offline.

---

## MiniMax-M3 — Pi  (model: MiniMax-M3 — your Pi default)
```
/goal Finish every goal in PROMPT.md in this directory — the deliverable contract, all 100 rubric points, docs.html, and the F3 HUD. Use the dynamic workflow to plan and drive it: decompose the goals, build and verify each by actually running it, and don't stop until everything works with no stubs. Commit as you go — git init + an initial commit first, a commit per feature with docs.html updated in the same commit, and a final commit when done. Build it entirely yourself — do not search for, read, or copy any existing solution, write-up, or review of this benchmark.
```

## MiniMax-2.7-highspeed — Pi  (switch model to MiniMax-2.7-highspeed)
```
/goal Finish every goal in PROMPT.md in this directory — the deliverable contract, all 100 rubric points, docs.html, and the F3 HUD. Use the dynamic workflow to plan and drive it: decompose the goals, build and verify each by actually running it, and don't stop until everything works with no stubs. Commit as you go — git init + an initial commit first, a commit per feature with docs.html updated in the same commit, and a final commit when done. Build it entirely yourself — do not search for, read, or copy any existing solution, write-up, or review of this benchmark.
```

## GPT-5.5 — Codex  (optional)
```
/goal Finish every goal in PROMPT.md in this directory — the deliverable contract, all 100 rubric points, docs.html, and the F3 HUD. Use $codex-dynamic-workflows to plan and drive it: decompose the goals, build and verify each by actually running it, and don't stop until everything works with no stubs. Commit as you go — git init + an initial commit first, a commit per feature with docs.html updated in the same commit, and a final commit when done. Build it entirely yourself — do not search for, read, or copy any existing solution, write-up, or review of this benchmark.
```

## Opus-4.8 — Claude Code  (optional)
```
/goal Finish every goal in PROMPT.md in this directory — the deliverable contract, all 100 rubric points, docs.html, and the F3 HUD. Use the dynamic workflow to plan and drive it: decompose the goals, build and verify each by actually running it, and don't stop until everything works with no stubs. Commit as you go — git init + an initial commit first, a commit per feature with docs.html updated in the same commit, and a final commit when done. Build it entirely yourself — do not search for, read, or copy any existing solution, write-up, or review of this benchmark.
```

---
*Note: the only text difference between round-1 and these is the trailing "build it yourself" sentence
(natural-generation guard for the variance measurement). The harness/model is what varies, not the task.*
