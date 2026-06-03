# Round 2 — fix-round prompts (assisted repair, per harness)

Each agent edits its **existing** round-1 `game.html` in place. No rebuild, no new features, no
regressions; keep the contract (single inline game.html, three@0.160.0 import map only, zero external
assets, seed 1337, zero console errors, F3 HUD); update docs.html to match. Verify with the text
smoke harness — **never screenshots** (MiniMax moderation).

## Protocol (per build)
1. The work dirs are **already prepared** at `round2/fix/<model>/` (frozen copies of each build; originals
   hashed in `round2/r1-hashes.txt`). Nothing to copy.
2. Open the harness, set the **model**, `cd round2/fix/<model>/`, **start a FRESH session — do NOT
   fork/resume the round-1 session** (a resumed session carries round-1 context → "continue building"
   instead of clean self-repair; if Pi offers to fork, answer **N**). Paste the prompt.
3. The agent tests via `node /Users/user/_capybara/minimax-m3-minecraft-bench/round2/smoke.mjs game.html`
   (text JSON: `consoleErrors`=0, `interaction.breakRemoved`/`placeAdded`=1 not 2, `network.external`=[]).
   MiniMax: that command, or `browser_evaluate`/`browser_snapshot` — **not** `browser_take_screenshot`.
4. One bounded pass, commit per fix. When done, tell me — I re-grade r1 vs r2 (probe + smoke + live play)
   and report fix-rate / regressions / playability-gate transition.

SHA-256 the frozen originals first (`shasum -a 256 */game.html > round2/r1-hashes.txt`) so the diff is auditable.

---

## MiniMax-M3 — Pi (model: MiniMax-M3)
```
/goal You built this voxel game (game.html + docs.html in this directory). It runs but has real bugs found in review. FIX them in place — do NOT rewrite from scratch, do NOT add new features, do NOT break anything that works. Keep the contract exactly: one self-contained game.html (inline JS/CSS), three@0.160.0 via the import map only, zero external assets, seed 1337, F3 HUD, zero uncaught console errors. Update docs.html to match the fixed behavior. Iterate to convergence: after each fix, re-run the smoke harness and keep going through fix→verify cycles until the build is clean OR 2–3 cycles pass with no further improvement (plateau) — don't stop at a first attempt; spend the iterations. Use the dynamic workflow, and verify each fix by actually running the game: run `node /Users/user/_capybara/minimax-m3-minecraft-bench/round2/smoke.mjs game.html` and read the JSON (you may also use browser_evaluate/browser_snapshot — do NOT use screenshots). Commit per fix.

Bugs to fix (verified in review):
1. [CRITICAL] Core verbs double-fire. There are TWO live `mousedown` listeners (~lines 1743 and 1860); the `removeEventListener` near 1858 is passed a fresh anonymous function so it removes nothing. Result: one left-click breaks TWO blocks and one right-click places TWO (second offset). Make one click = exactly one action.
2. [CRITICAL] Save/restore broken. Only the second ("tracked") edit reaches `editLog`, and `findSpawn()` overwrites the restored player position on load. Persist ALL edits and restore the saved position when a save exists.
3. [HIGH] Fly is collision-aware, not true no-clip (docs claim no-clip): make fly true no-clip, or correct the docs. Manifest dishonesty: docs claim 9 distinct placeables but the hotbar has 9 slots with only 8 distinct blocks — make it truthful (add a 9th distinct block or fix the count).
4. [MED] Caves are capped at y<=14 (none above sea level) — allow higher caves; AO offset directions are fixed per-face (always the +tangent axes) instead of varying toward each corner → asymmetric/incorrect corner AO; the spawn-hash is recomputed every frame (cache it); remove leftover debug globals.

Success = smoke.mjs shows breakRemoved=1 and placeAdded=1, zero console errors, and every listed bug resolved without regressions.
```

## MiniMax-2.7-highspeed — Pi (switch model to MiniMax-2.7-highspeed)
```
/goal You built this voxel game (game.html + docs.html in this directory). It runs but has real bugs found in review. FIX them in place — do NOT rewrite from scratch, do NOT add new features, do NOT break anything that works. Keep the contract exactly: one self-contained game.html (inline JS/CSS), three@0.160.0 via the import map only, zero external assets, seed 1337, F3 HUD, zero uncaught console errors. Update docs.html to match. You have a LARGE budget — iterate aggressively: after each fix, re-run the smoke harness and keep going through as many fix→verify cycles as it takes until the build is fully clean (placeAdded=1, textures wired, zero console errors, save survives reload, every bug below resolved) OR you plateau (2–3 cycles with no further improvement). Do NOT stop at a first attempt; spend the iterations. Use the dynamic workflow, and verify each fix by actually running the game: run `node /Users/user/_capybara/minimax-m3-minecraft-bench/round2/smoke.mjs game.html` and read the JSON (you may also use browser_evaluate/browser_snapshot — do NOT use screenshots). Commit per fix.

Bugs to fix (verified in review):
1. [CRITICAL] Right-click PLACE is fully broken — it reads a stale `targetedBlock.place` that's always undefined. Fix placement (re-raycast on place and place on the correct adjacent face).
2. [CRITICAL] Procedural textures and AO are defined but never wired into the mesh — terrain renders flat vertex-colors only. Wire the texture atlas + ambient-occlusion into the block materials (use `map` + the AO attribute) so textures actually show.
3. [CRITICAL] `saveGame()` serializes ~200 chunks into ~5 MB localStorage → guaranteed QuotaExceededError. Save only a sparse edit log + player position, not whole chunks. Also the HUD is hidden on load until F3 — show it by default (or persist the toggle).
4. [HIGH] Inventory == hotbar (add more block types than the hotbar); both biomes share one surface block (differentiate them); FPS is computed from a single last-frame dt (smooth it); textures use an unseeded RNG (seed from 1337 for determinism).
5. [MED] No compliant top-of-file HTML FEATURE MANIFEST — the manifest is JS comments inside the module. Add the required manifest block at the top of game.html.

Success = smoke.mjs shows textures wired (no flat-only), placeAdded=1 (place works), zero console errors, save survives reload, and every listed bug resolved without regressions.
```

## GPT-5.5 — Codex
```
/goal You built this voxel game (game.html + docs.html in this directory). It runs cleanly but has a few real bugs found in review. FIX them in place — do NOT rewrite, do NOT add features, do NOT regress. Keep the contract exactly: one self-contained game.html (inline JS/CSS), three@0.160.0 via the import map only, zero external assets, seed 1337, F3 HUD, zero uncaught console errors. Update docs.html to match. Iterate to convergence: after each fix, re-run the smoke harness and keep going through fix→verify cycles until the build is clean OR 2–3 cycles pass with no further improvement (plateau) — don't stop at a first attempt; spend the iterations. Use $codex-dynamic-workflows, and verify each fix by actually running the game: run `node /Users/user/_capybara/minimax-m3-minecraft-bench/round2/smoke.mjs game.html` and read the JSON. Commit per fix.

Bugs to fix (verified in review):
1. [HIGH] Cannot place blocks into water cells — allow placing into water. `columnCache` and `treeCache` grow unbounded (never evicted) — cap/evict them.
2. [MED] Water blue channel can exceed 1.0 (clipped) — clamp it; the "dry-shore" biome is just sand — make it a real biome or drop the claim; `loadQueue.includes` is O(n) per edit — use a Set.
3. [LOW] Sky is a CSS body gradient that mismatches the in-scene horizon — render the sky in-scene; caves are largely hardcoded — make them more procedural.

Success = smoke.mjs zero console errors, placement works in water, no unbounded caches, every listed bug resolved without regressions.
```

## Opus-4.8 — Claude Code
```
/goal You built this voxel game (game.html + docs.html in this directory). It runs cleanly but has a few real bugs found in review. FIX them in place — do NOT rewrite, do NOT add features, do NOT regress. Keep the contract exactly: one self-contained game.html (inline JS/CSS), three@0.160.0 via the import map only, zero external assets, seed 1337, F3 HUD, zero uncaught console errors. Update docs.html to match. Iterate to convergence: after each fix, re-run the smoke harness and keep going through fix→verify cycles until the build is clean OR 2–3 cycles pass with no further improvement (plateau) — don't stop at a first attempt; spend the iterations. Use the dynamic workflow, and verify each fix by actually running the game: run `node /Users/user/_capybara/minimax-m3-minecraft-bench/round2/smoke.mjs game.html` and read the JSON. Commit per fix.

Bugs to fix (verified in review):
1. [HIGH] Esc while the inventory is open hides it but skips `requestLock()`, leaving the player without pointer lock — re-acquire pointer lock (or handle Esc so the player isn't stranded).
2. [MED] Caves carve to the surface in sea-level columns (seabed holes) — cap cave carving below the sea floor; remove the dead `three/addons/` import-map entry; the FEATURE MANIFEST sits after `<!DOCTYPE>` — place it per spec.
3. [LOW] Per-call audio buffer allocation — reuse buffers; mob uses random (spec-permitted, optional to seed).

Success = smoke.mjs zero console errors, no pointer-lock stranding, no seabed holes, every listed bug resolved without regressions.
```
