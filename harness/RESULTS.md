# Round 2 — running results (assisted repair, all-four iterate-to-convergence)

Grading inputs: churn diff vs frozen r1 original · `probe.mjs` + `smoke.mjs` · source re-check of each
listed bug · (batch) live-play. Effort reported co-equally (not effort-equalized — see PLAN §B.3).
Fix-rate = of the build's own handed bug list, how many verified fixed.

| Build | Status | net game.html churn | Fix-rate | Regressions | Console/spec | Effort | Playability r1→r2 |
|---|---|---|---|---|---|---|---|
| **Opus-4.8** (Claude Code) | ✅ done | ~1% (20 diff-lines) | **5/5** actionable | none evident | 0 errors · spec-clean | **$6.66** · API 17m10s / wall 32m11s · 77.1k out tok (6.6M cache-read) · session edits 163+/14− incl docs | playable → **playable ✓** (live-confirmed "very playable") |
| **GPT-5.5** (Codex) | ✅ done | ~5% (137 diff-lines) | **7/7** (incl. caves → seeded noise, source-verified) | none evident | 0 errors · spec-clean | **238K used · 11.4M in · 49.5K out · ~21 min** | playable → **playable ✓** (live-confirmed; slow chunk loading) |
| **MiniMax-M3** (Pi) | ✅ done | ~7% | assigned bugs fixed (double-fire 2→1, save, fly, 9th block) | **YES, showstopper** — Fix #4a removed the cave-depth cap → caves carve through the surface → world riddled with holes/gaps | 0 console err | **17.75M tok · ~44 min** | unplayable → **STILL UNPLAYABLE** (live-play: fall through gapped surface — lateral: fixed double-fire, broke the world) |
| **MiniMax-2.7-highspeed** (Pi) | ✅ done | ~15% | assigned bugs fixed in code (textures wired, sparse save, place re-rays) | **YES, showstopper** — `pointerLocked` debug-getter → pointerlockchange reads stale value → real lock never registers | 0 console err | **7.43M tok · ~31 min** | playable → **UNPLAYABLE** (live-play: click-to-play stuck — REGRESSED from round 1) |

## ⚠️ REAL-PLAY CORRECTION (authoritative — supersedes the smoke harness)
Operator live-play (real browser, localhost) is ground truth and it OVERTURNED the smoke verdicts:
- **Opus — playable ✓.  GPT — playable ✓** (slow chunk loading).
- **M3 — UNPLAYABLE.** Double-fire genuinely fixed, but `Fix #4a` removed the cave-depth cap → caves carve
  through the surface → world full of holes/gaps → fall-through. Net: lateral (traded one showstopper for another).
- **2.7 — UNPLAYABLE, and REGRESSED from round 1** (was "flat but playable"): the `pointerLocked` debug-getter
  makes pointerlockchange read a stale value → real lock never registers → click-to-play never dismisses.
- **Why the harness missed it:** `smoke.mjs` *fakes* pointer lock (never exercised 2.7's real start) and never
  simulates gravity/time/meshing (never saw M3's holes). It graded the *assigned-bug fixes*, not *playability* —
  it's a screening tool, not a playability grader. Only real play is.
- **Honest Round-2 finding:** the two MiniMax builds fixed their checklists but introduced NEW showstopper
  regressions and couldn't catch them — they can't truly playtest. Only the two frontier builds (Opus, GPT)
  came out actually playable. *(Token framing corrected — see the effort-metric note below; it is NOT a 100× gap.)*

## Notes so far
- **Opus & GPT: both near-perfect surgical passes.** Tiny targeted diffs, no rewrites, clean
  commit-per-fix, docs updated honestly, zero console errors, every actionable listed bug fixed.
- **⚠️ Effort metrics are NOT directly comparable (correction):** MiniMax reports a lump `tokensUsed` =
  TOTAL throughput (context re-read each agentic turn + output): 2.7 = 7.43M, M3 = 17.75M. Sanity check:
  17.75M ÷ 2646 s ≈ 6,700 tok/s and 7.43M ÷ 1869 s ≈ 3,980 tok/s — far above any model's *output* rate
  (~50–150 tok/s), confirming these are total-throughput, not output. That's the same metric class as
  Opus's ~6.9M (6.6M cache-read) and Codex's 11.4M "in" — **not** the frontier OUTPUT counts (Opus 77k,
  GPT 49.5k out). On a like-for-like total basis, M3 (~17.75M) is the highest but only **~1.5–2.6× the
  others, NOT ~100×**; MiniMax never reported output-only, so no fair output-to-output comparison exists.
  The earlier "cheap grind burned ~100× the tokens" framing was an apples-to-oranges error and is **dropped**.
- Opus fixes verified: Esc→closeInv (re-lock), cave crust `<`→`<=` (no seabed breach), dead three/addons
  import removed, `<!DOCTYPE>` moved below manifest, audio noise-buffer reuse (Map).
- GPT fixes verified (7/7): water placeable, bounded caches (MAX 120k + LRU evict), `clamp01` water
  color, loadQueue → Set, in-scene sky-dome (replaces CSS gradient), dry-shore claim dropped, AND caves
  changed from hardcoded fixed-coordinate tunnels/caverns → seeded value-noise fields
  (`valueNoise3` chamber/ridge/strata). My first grade said 6/7 — a keyword-grep miss, not a real gap;
  source-verified to 7/7. (Lesson: grep the diff by *mechanism*, not just the bug's noun.)
- **M3 fixes verified: double-fire FIXED** — `smoke.mjs` (which caught breakRemoved=2 in round 1) now
  reports **breakRemoved=1 / placeAdded=1**, notes empty. Clean commit-per-fix: merged doBreak/doPlace +
  removed the duplicate `mousedown` listener (Fix #1); save skips `findSpawn` when a save exists, records
  all edits, replays edits into chunks streamed in after spawn (Fix #2 + polish, with its own Playwright
  test `round2/test-late-edit.mjs`); fly true no-clip + 9th placeable "Planks" (Fix #3); caves uncapped +
  per-corner AO + trimmed debug globals (Fix #4). **BUT `Fix #4a` (cave-uncap) is a showstopper regression**
  — caves now carve through the surface → holes → fall-through → live-play shows M3 STILL UNPLAYABLE. The
  smoke `breakRemoved=1` was real but only proves the verb fires once; it can't see a hole-riddled surface.

## Process / integrity notes
- **2.7 git pollution (cleanup pending):** the 2.7 run had no isolated `git init`, so it committed
  `4a965e0` into the **parent harness repo**, sweeping in all of `round2/` *including `node_modules/`* +
  the other fix dirs as gitlinks. **No email leak** (committed under a placeholder git identity, not the
  operator's real email — verified 0). Local cruft only (harness repo isn't published). Cleanup: **`git reset --mixed HEAD~1`** (= `4a965e0^`)
  to drop the commit while keeping files on disk, then confirm with `git log --oneline -1` + `git status --short`,
  and add `round2/node_modules/` to `.gitignore`. **NOT** bare `git reset --mixed` — HEAD *is* `4a965e0`, so that
  resets only the index and leaves the polluted commit (Codex caught this). Do after grading.
- `round2/test-late-edit.mjs` = **M3's own** save-across-streaming verification test (matches commit
  4b709ab), not a Codex-review artifact. Harmless; keep as evidence M3 self-verified its save fix.
- Opus & GPT used isolated `git init` in their fix dirs (clean). M3 too. Only 2.7 missed it.

## Adversarial review — full findings (Claude 4-reviewer workflow; 4 blockers · 6 majors · 10 minors)
Real-play failure modes the smoke harness can't see. Many are **NEW regressions from the round-2 fixes.**

**Opus-4.8 — playable, but:**
- [MAJOR] E opens inventory, then the start overlay paints over the inventory panel (both z40, overlay later in DOM) → can't select blocks. `openInv()→exitPointerLock()→pointerlockchange` shows startOverlay. (910-913,1119) — likely why you didn't hit it: you probably didn't press E.
- [minor, REGRESSION] dig/footstep sounds now identical every time — R2 cached+reused the noise buffer. (1144-1152)
- [minor] caves can still breach the surface on land at topY≥31 (R2 guard only covers topY≤SEA_LEVEL). (406-409)

**GPT-5.5 — playable but slow:**
- [MAJOR] 60–90s to stream in: skipModulo death-spiral (fps<52 → 1 chunk/8 frames; low fps self-sustains). Pre-existing (R1 too), not fixed. (686,1323)
- [minor, REGRESSION] right-click on a water top-face places the block INSIDE the water (place fix over-redirects). (1091-1105)
- [minor, REGRESSION] opaque canvas clear color hides the CSS sky gradient on the menu. (225-227)
- [minor, REGRESSION] cave geometry near spawn differs from R1 (seeded noise replaced hand-placed caves).

**MiniMax-M3 — UNPLAYABLE (2 blockers):**
- [BLOCKER] block-highlight wireframe inverted (`!startEl…hide`, line 2007) → never shows in real play. **NOT a regression — inverted in R1 too**; the R1 grade credited it from a screenshot that (like mine) hid the overlay the wrong way. **Honest correction to Round 1.**
- [BLOCKER, REGRESSION] cave-depth cap removed → caves carve through hillsides/surface → world shredded with holes → fall-through. (441)
- [MAJOR] save position-safety bump is dead (getBlock returns air before chunks generate). (1916-1944)
- [MAJOR] clicking the pause overlay to resume breaks/places a block (mousedown not guarded on pause). (1808)
- [minor] gravity/WASD run during start+pause; [minor] pause HUD shows 0,0,0.

**MiniMax-2.7-highspeed — UNPLAYABLE (2 blockers, both REGRESSIONS):**
- [BLOCKER, REGRESSION] `pointerLocked` debug-getter → pointerlockchange reads stale value → real lock never registers → click-to-play never dismisses. (1574-1580/1682)
- [BLOCKER, REGRESSION] save broken: loadGame() re-applies edits before chunks exist (setBlockAt bails) → all edits lost on reload. The sparse-save "fix" never restores. (1011-1016,1382,1642-1647)
- [MAJOR] pause overlay stacks over click-to-start (getter bug); [MAJOR] fly-mode stale-velocity drift.
- [minor] chunk-boundary z-fighting; [minor] wrong spawn-hash stride; [minor] spawn-hash recomputed every frame.

**Pattern (the headline):** every build that made non-trivial fixes introduced ≥1 NEW bug — **minor for the frontier models (Opus 1, GPT 3), SHOWSTOPPERS for the MiniMax builds (M3 + 2.7 each shipped blocker regressions).** Assisted self-repair fixed the assigned checklists but broke playability, and neither the agents nor the smoke harness caught it — none can truly playtest.

## Codex adversarial cross-check (`/codex:adversarial-review` — verdict: needs-attention)
Codex challenged the **review approach + repo state** rather than re-listing per-build defects (its mandate
was to question assumptions/tradeoffs). It did **NOT refute any of my 4 blockers** — they stand, read at the
same lines — and it added:
- **[NEW game bug · medium] M3 save-replay skips neighbor mesh invalidation** (`minimax-m3/game.html:399-403`):
  replay writes restored blocks but dirties only the replayed chunk, not adjacent ones → a saved *boundary*
  edit leaves the neighbor mesh stale → ghost/missing faces after save+reload. **My review missed this.**
- **[high] the `CODEX-ADVERSARIAL-R2.md` handoff isn't reproducible from tracked state** — `round2/fix/*` are
  mode-160000 gitlinks with no `.gitmodules`; the parent doesn't track the build HTML, so a clean checkout
  can't reproduce the target. **Publish implication: commit the round-2 builds as tracked files, not gitlinks.**
- **[high] my cleanup command was a no-op** (corrected above to `git reset --mixed HEAD~1`).
- **[medium] safety rail too weak** — top-level `git status` hides nested-repo changes.
