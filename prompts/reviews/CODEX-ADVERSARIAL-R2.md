# Codex adversarial review — Round-2 fixed builds (run `/codex:adversarial-review`, paste below)

Run in a fresh Codex session. It has shell — it should diff and read the actual files.

---

<task>
Adversarially review the four ROUND-2 "fixed" Minecraft-clone builds for **playability-breaking bugs that
automated/headless harnesses miss**. These builds passed a smoke harness AND each agent's own checks, yet
in real-browser play TWO are unplayable. Find why — and find anything else lurking. Be concrete, cite
file:line, default to skeptical. A build that "passes a faked-pointer-lock harness" can still be unplayable.
</task>

<safety_rail>
REVIEW ONLY — modify NO tracked file. Don't edit any build, harness, or doc. For any throwaway test,
use /tmp. Capture `git status --short` at start; it must be unchanged at the end. Report-only.
</safety_rail>

<context>
Round 2 = assisted repair: each agent was handed its own bug list and fixed its round-1 build in place.
Builds (FIXED vs round-1 ORIGINAL), under /Users/user/_capybara/minimax-m3-minecraft-bench/round2/fix/:
- opus-4.8/game.html        (live-play: PLAYABLE)              orig: ../../opus-4.8/game.html
- gpt-5.5/game.html         (live-play: PLAYABLE, slow chunks) orig: ../../gpt-5.5/game.html
- minimax-m3/game.html      (live-play: UNPLAYABLE)            orig: ../../minimax-m3/game.html
- minimax-m2.7-highspeed/game.html (live-play: UNPLAYABLE)     orig: ../../minimax-m2.7-highspeed/game.html
Two regressions already found in real play — CONFIRM each with file:line, then find EVERYTHING ELSE:
- M3: a fix removed the cave-depth cap (old `y <= WORLD_SEALEVEL-4`) so caves now carve through the
  surface → world riddled with holes/gaps → player falls through the floor.
- 2.7: a `pointerLocked` debug-getter makes the pointerlockchange handler read its own stale value
  instead of `document.pointerLockElement`, so real pointer lock never registers → click-to-play overlay
  never hides → can't start.
The smoke harness fakes pointer lock and never simulates gravity/time/meshing — so it gave false
"playable" on M3 and 2.7. Don't repeat that blind spot.
</context>

<review_targets>
For EACH build: `diff <orig> <fixed>` to see what changed, read the fixed source, and reason about REAL play —
1. POINTER-LOCK / START: does click-to-play acquire AND correctly detect real pointer lock and hide the
   overlay? Any debug/test hook that breaks real lock detection?
2. PHYSICS / COLLISION / SPAWN: can the player stand on the ground, or fall through (surface holes,
   unmeshed/ungenerated collision, bad spawn Y, gravity before spawn chunk ready, save restoring a bad pos)?
3. CHUNK MESHING / WORLD INTEGRITY: gaps between chunks, missing faces, holes through the surface.
4. CORE LOOP: one click = exactly one break/place on the correct target? double-fire / wrong target?
5. SAVE/LOAD, CONSOLE ERRORS during play, PERF (chunk-load stalls — esp. GPT).
6. REGRESSIONS: did a round-2 fix break something that worked in round 1?
</review_targets>

<grounding_rules>
Every finding cites file:line + the offending code (or a command + output). Reason about real-play behavior,
not what a faked-lock harness reports. Do NOT treat the build's own FEATURE MANIFEST / self-claims as evidence.
Label hypotheses as such.
</grounding_rules>

<structured_output_contract>
Per build: a one-line REAL-PLAY verdict (playable / unplayable / playable-with-issues), then findings —
each [blocker|major|minor] · area · player-facing symptom · root cause · evidence (file:line) · concrete fix ·
isRegressionFromRound1 (y/n). End with the single most impactful fix per unplayable build.
</structured_output_contract>
