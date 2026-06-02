# Minecraft-Clone Benchmark — Grading Sheet (130 pts)

**You keep this; do NOT give it to the agents.** The prompt embeds the 100-pt quality rubric
so each agent optimizes for it; you grade with this full sheet.

## Run protocol (lock these BEFORE running — fairness depends on it)

- **Same everything:** one machine, one fixed browser + version, one fixed window size, one
  GPU/power state, same network state. Grade all four in one sitting.
- **Equal budget:** identical effort/turn/tool-tier budget and the same wall-clock cap per
  agent. Record the **exact run wrapper / flags** used for each (they differ by tool — that
  is expected — but log them) and **capture each run's transcript**.
- **Randomize order;** none told the others exist or shown another's output.
- **Timing:** start a wall-clock when you dispatch `PROMPT.md` to the agent; stop it when the
  agent declares completion / produces the final artifact. Record start + end for each.
- **FPS protocol:** with the HUD open, walk a fixed ~60-second path across loaded terrain and
  read the **average** FPS off the counter (never judge by feel).

## How to grade quality

Open each `game.html` directly (`file://`) and play it. Score each line **full / half / zero**
using its award test and the listed **method**:
`[play]` = visible while playing · `[HUD]` = read the F3 debug overlay · `[net/console]` =
check DevTools Network/Console · `[code]` = brief source inspection.
If the Deliverable Contract gate fails (not one inline `game.html`; loads anything other than
the pinned `three@0.160.0` graph; fetches any external asset or local module; requires a
build/server; or throws on load), record the gate failure and grade only what still runs.

## Quality — 100 pts (play `game.html`)

| ID | Item | Pts | Method | Full when… | Half |
|----|------|----:|--------|-----------|------|
| **WORLD** | | **22** | | | |
| W1 | Voxel chunk system | 3 | play/HUD | Block-based, chunked (HUD shows chunk count) | — |
| W2 | Seeded determinism (1337) | 4 | HUD | Spawn-area HUD hash identical on two reloads; terrain is noise, not flat | — |
| W3 | ≥6 block types | 4 | play | ≥6 distinguishable at play distance | 3–5 |
| W4 | ≥2 biomes | 3 | play | 2+ differ in surface/vegetation | subtle |
| W5 | Caves / hollows | 3 | play | Enterable carved hollows | — |
| W6 | Water body | 2 | play | Pooled, distinct from land | — |
| W7 | Trees | 3 | play | Trunk+canopy scattered | — |
| **PLAYER** | | **15** | | | |
| P1 | First-person camera | 2 | play | Eye-height FP | — |
| P2 | Pointer-lock look | 3 | play | Smooth, clamped pitch, no scroll | — |
| P3 | WASD + sprint | 2 | play | Relative move; Shift sprint | — |
| P4 | Gravity + jump | 3 | play | Falls/lands; Space jumps | — |
| P5 | AABB collision | 3 | play | No passing through solids | — |
| P6 | Fly/no-clip (F) | 2 | play | F off gravity+collision; vertical | — |
| **INTERACTION** | | **15** | | | |
| I1 | Raycast BREAK | 4 | play | LMB removes block; remeshes | — |
| I2 | Raycast PLACE | 4 | play | RMB places on correct face | — |
| I3 | Block highlight | 3 | play | Outline on aimed block | — |
| I4 | Hotbar | 2 | play | Types, active slot, 1–9/scroll | — |
| I5 | Inventory (E) | 2 | play | More types than hotbar | — |
| **RENDERING** | | **15** | | | |
| R1 | Procedural textures | 3 | play | Drawn; grass top ≠ sides | — |
| R2 | Sun + ambient light | 3 | play | Faces shade by orientation | — |
| R3 | Ambient occlusion | 2 | play+code | Corners darkened (confirm via AO mesh code if ambiguous) | flat only |
| R4 | Distance fog | 2 | play | Far fades to sky | — |
| R5 | Sky | 3 | play | Reads as sky, not blank | — |
| R6 | Transparent water | 2 | play | See-through, composited | — |
| **SCALE & PERF** | | **13** | | | |
| S1 | Chunk load+unload (≥8) | 4 | HUD | Fly out: HUD chunk count rises then falls (streaming) | partial |
| S2 | Face culling / greedy | 3 | HUD | HUD triangle/draw-call count ≪ naive cube-per-block | partial |
| S3 | FPS ≥50 walking | 3 | HUD | Avg FPS ≥50 on the grading machine (60s path) | 30–49 |
| S4 | HUD live FPS + coords | 3 | HUD | Live FPS AND coords (+chunk count/render dist) updating | one only |
| **ATMOSPHERE** | | **10** | | | |
| X1 | Day-night cycle | 2 | play | Sun/sky change; darker nights | — |
| X2 | Clouds | 2 | play | Present in sky | — |
| X3 | Web Audio SFX | 2 | play/net | Synth break/place/step; no audio files fetched | — |
| X4 | Wandering mob | 2 | play | ≥1 moving creature | — |
| X5 | localStorage save | 2 | play | Edits/position survive reload | — |
| **ENGINEERING** | | **10** | | | |
| E1 | Single-file contract | 3 | net/console | Network panel shows only the pinned three graph; no assets/local modules; offline after load | — |
| E2 | Zero console errors | 3 | console | None on load + play | — |
| E3 | Manifest honesty | 2 | play | Every manifest entry actually works | — |
| E4 | Crosshair + help overlay | 2 | play | Center crosshair + Esc help w/ controls+seed | — |
| | **QUALITY TOTAL** | **100** | | 22+15+15+15+13+10+10 | |

*(Code readability is a separate source-review note, not scored on E4.)*

## Documentation — 10 pts (open `docs.html` + read the subdir git log)

| Item | Pts | Full when… |
|------|----:|-----------|
| Exists & self-contained | 4 | Opens standalone (`file://`), no external assets, no console errors |
| Accurate to the build | 3 | Architecture + feature list match what `game.html` actually does (cross-check vs manifest) |
| Genuinely kept current | 3 | `git log -p docs.html` shows it changing **in the same commits as the code**, interleaved across the build — NOT one commit at the end. Faked/batched/backdated → 0 here. |

## Speed — 20 pts (operator wall-clock; git history is the integrity check)

- **Build time `T`** = operator wall-clock from prompt dispatch → final artifact, in minutes
  (recorded per the Run protocol). **Floor `T` at 1 minute.**
- **Integrity gate:** the subdir git history must corroborate `T` — multiple commits with
  monotonic, plausible timestamps spanning roughly `T`. If commits are too few to show
  progression, non-monotonic, backdated, or wildly inconsistent with the wall-clock,
  **score Speed = 0** and note "timing not corroborated".
- **Speed score** = `round(20 × T_fastest / T)` over the corroborated times (fastest = 20;
  2× slower = 10; 4× = 5). Record raw minutes.

## Leaderboards

Report **two** rankings:
- **Quality-only (0–100)** — pure build capability, speed-independent.
- **Overall (0–130)** = Quality + Documentation + Speed.

This benchmark measures **model + run-mode**, not pure model quality — note that a
latency-optimized mode (e.g. `minimax-m2.7-highspeed`) is structurally advantaged on the
Speed axis, which is exactly why the Capability board is reported alongside.

**Playability gate (headline rule).** The brief asked for a *playable* clone, so the headline
ranks **playable builds first**. A build whose **core loop — move + break + place + persist — is
unusable** ranks below *every* playable build regardless of its raw Capability points, with its
Capability shown only as context. (Applied here: MiniMax-M3 out-points 2.7 on Capability but its
duplicated `mousedown` handlers double-fire both verbs and its save never restores position — not
playable, so it ranks last.)

| Contestant | Capability /100 | Playable? | Docs /10 | T (min) | Speed /20 | Overall /130 | Efficiency (Q/min) |
|------------|----------------:|:---------:|---------:|--------:|----------:|-------------:|-------------------:|
| gpt-5.5 | 94.5 | ✓ | 10 | ~35 | 4† | **108.5†** | 2.7 |
| opus-4.8 | 96.5 | ✓ | 9 | ~68 | 2 | **107.5** | 1.4 |
| minimax-m2.7-highspeed | 60.0 | ✓ (flat) | 5 | ~7 | 20 | **85.0** | 8.6 |
| minimax-m3 | 65.0 | ✗ core loop broken | 5 | n/a* | n/a* | **last*** | — |

*† GPT-5.5 Speed uses ~35 min active labor; under strict elapsed timing Opus leads Overall.
\* M3 ranked last by the playability gate; Speed also unverifiable after the MiniMax image-moderation incident.*

**Tie-breakers (Overall ties):** fewer console warnings → more quality lines at *full* vs *half* → higher Efficiency.
