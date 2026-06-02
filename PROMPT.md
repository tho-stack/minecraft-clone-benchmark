Build a Minecraft-style voxel sandbox game. This is a scored build challenge: an identical copy of this prompt is given to several independent builders, and every submission is graded by a person who opens the game in a browser and plays it. Make it as complete and faithful as you can. Implement as many rubric items below as possible -- do not stop early, and ship NO TODOs, placeholders, stubs, dead buttons, commented-out "features," or "left as an exercise" gaps. A half-finished feature scores less than a complete smaller one, so finish what you start. Every feature you list must actually work when the file is opened.

==================================================
DELIVERABLES (exact file names)
==================================================
- `game.html` -- the playable game. The single-file / pinned-CDN / no-external-asset rules in the DELIVERABLE CONTRACT below apply to THIS file; it is the artifact graded on the 100-point rubric.
- `docs.html` -- living documentation, kept up to date the WHOLE time you build (see LIVING DOCUMENTATION). It is NOT the game and is exempt from the "one file" rule, but it must also be self-contained (no external assets). Produce no other files in the deliverable.

==================================================
DELIVERABLE CONTRACT for `game.html` (PASS/FAIL GATE -- violating any item can make the entry non-runnable and forfeit large parts of the score)
==================================================
1. `game.html` is EXACTLY ONE self-contained file. All HTML, CSS, and JavaScript live inline inside it. It must run by opening that single file directly in a current desktop version of Chrome, Edge, or Firefox (the file:// protocol) -- no build step, no bundler, no transpile, no package install, and no local web server or command line of any kind. Do NOT load any LOCAL script or module: no `<script src="...local...">`, no `import './x.js'`, no relative/local module specifiers. (A local module fetched from file:// is blocked by the browser as a CORS/origin-null error -- the one real file:// failure mode -- so everything except the Three.js import below must be inline.)
2. The ONLY network requests allowed are the Three.js library at this EXACT pinned version, and the modules it/you import from that same pinned version:
   - core: https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js
   - optional addons: https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/...
   Load nothing else -- no other library, framework, font, analytics, CSS, or helper from any other URL, origin, or version. Once that Three.js module graph has loaded, the page must make ZERO further network calls and run fully offline.
3. MANDATORY IMPORT MAP. Because Three.js addons import the bare specifier "three", you MUST declare an import map so module resolution never fails. Include this exact block in the <head>, before any module script, even if you do not use addons:
   <script type="importmap">
   {"imports":{
     "three":"https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js",
     "three/addons/":"https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/"
   }}
   </script>
   Then load your game logic with an INLINE <script type="module"> and import Three.js as: import * as THREE from 'three';
4. ZERO external asset files of ANY kind. No .png, .jpg, .jpeg, .gif, .svg, .glb, .gltf, .obj, .fbx, .mp3, .ogg, .wav, .json, .bin, .ttf, .woff, or any other fetched file. Every texture, sound, font, icon, and piece of data must be generated procedurally in code (e.g. drawn into a canvas, vertex colors, shaders), synthesized at runtime (e.g. the Web Audio API), or embedded inline as a data-URI string inside the one file. A missing image or sound must be IMPOSSIBLE because none is ever fetched.
5. Vanilla JavaScript and standard browser APIs only (ES modules, Canvas2D, WebGL via Three.js, Web Audio, Pointer Lock, localStorage). No TypeScript that needs compiling, no JSX, no CSS framework.
6. ZERO uncaught errors or exceptions in the browser console on load and during normal play. A brief "click to play / start" overlay to acquire pointer lock is allowed and expected. If any resource is ever unavailable, the game must still run without throwing.

==================================================
REQUIRED HUD / DEBUG OVERLAY (graded instrumentation -- toggle with F3)
==================================================
Several rubric items cannot be judged by eye alone, so `game.html` MUST include a debug overlay, toggled with F3 (on by default is fine), that displays live: FPS; player coordinates (x,y,z); number of currently loaded/meshed chunks; current render distance (in chunks); and an approximate draw-call or triangle/face count for the rendered scene. ALSO display a short hash/checksum of the block data in the spawn-area chunks (so reload-determinism can be verified: the hash must be identical on every reload with the default seed). This overlay is how a grader confirms chunk streaming, face culling, performance, and determinism without reading your source.

==================================================
BUILD PROCESS & TIMING (how you WORK -- SPEED IS SCORED)
==================================================
- Before writing any code, run `git init` in your working directory and make an INITIAL commit immediately (an empty scaffold is fine).
- Commit frequently with clear, imperative messages -- at minimum after each rubric section -- and update `docs.html` in the SAME commits as the code it documents (not in a batch at the end). Do not squash, amend, rewrite history, or set fake commit dates. Non-monotonic timestamps, backdated commits, or too few commits to show real progression will forfeit your Speed score.
- Your build is TIMED and Speed is scored. The authoritative clock is the operator's wall-clock from when this prompt is dispatched to when you announce completion / produce the final artifact; your commit history is corroborating evidence that must be consistent with it. Keep a steady pace and don't stall -- but quality is primary: do not drop working rubric features to finish faster, and do not gold-plate beyond the rubric.
- These git steps describe how you build; they do NOT relax the Deliverable Contract -- its "no build step / no command line" rule governs only how the finished `game.html` is opened and graded.

==================================================
LIVING DOCUMENTATION -- `docs.html` (REQUIRED, kept current the whole time, SCORED 10 pts)
==================================================
Maintain a self-contained `docs.html` and keep it UP TO DATE AS YOU BUILD -- updated in the same commits as the code, not written only at the end (the commit history must show docs and code changing together). It must open standalone in a browser with no external assets and cover: an architecture overview, a feature list mirroring the FEATURE MANIFEST (implemented / not), key technical decisions, and a running dev-log with timestamps. Do NOT write any point values or self-assessed scores in it.

==================================================
DETERMINISM & FIXED VIEW
==================================================
- Generate the world from the FIXED hard-coded integer seed 1337 using seeded procedural noise. This guarantees PER-AGENT reproducibility: YOUR world must be byte-for-byte identical on every reload (verifiable via the spawn-area hash in the HUD), so a grader always sees the same thing. It does NOT need to match any other submission's terrain -- you choose your own generation algorithm. Do NOT use Math.random() for terrain shape; randomness for clouds/mobs/ambient detail is fine. You may offer a seed input, but the default must be 1337.
- The player must SPAWN at a fixed position and facing every load, and that spawn must be within ~40 blocks of clearly observable water, at least one tree, a biome transition, and a cave entrance or opening -- so a grader can find these features quickly. Surface the seed and player coordinates on screen (HUD).
- The canvas must fill the browser window and use a fixed vertical field of view of 70 degrees.

==================================================
CONTROLS (implement EXACTLY this scheme so "feel" is identical across submissions)
==================================================
- Click the canvas to capture the mouse via Pointer Lock; mouse movement looks around in first person (yaw + pitch, pitch clamped). Esc releases the pointer and shows the pause/help overlay.
- W / A / S / D move horizontally relative to look direction. Space jumps (when walking). Shift sprints when walking.
- F toggles fly / no-clip mode (gravity and collision off). While flying, Space ascends and Shift descends.
- F3 toggles the HUD / debug overlay (see above).
- Left mouse BREAKS the targeted block. Right mouse PLACES the selected block against the targeted face.
- Number keys 1-9 and the mouse scroll wheel select the active hotbar slot. E toggles an inventory / expanded block-palette overlay.
- The block under the crosshair (within reach) shows a visible wireframe/outline highlight.
- A pause/help overlay (Esc) lists the full control scheme and the seed.
- Physics should feel natural: player ~1.8 blocks tall, jump ~1.25 blocks high, walk ~4.3 blocks/sec, block reach ~4-6 blocks. Collision uses axis-aligned bounding-box (AABB) checks so the player cannot pass through solid blocks.

==================================================
QUANTITATIVE TARGETS (so scale and feel are comparable)
==================================================
- Target a steady 60 FPS; the HUD FPS counter must read at least 50 while walking across loaded terrain ON THE GRADING MACHINE at the default render distance and window size, and must never collapse into a slideshow. (The grader fixes the machine, window size, and a sampling walk path; see the grading protocol.)
- Render distance: at least 8 chunks in every horizontal direction, with chunks generating/loading as the player moves and unloading/freeing when far away (both observable via the HUD chunk count).
- Chunks are 16x16 columns and at least 64 blocks tall. The world must feel large and explorable -- effectively endless via chunk streaming -- NOT a tiny fixed box.
- At least 6 visually distinct, selectable block types usable from the hotbar/inventory.

==================================================
TOP OF `game.html` -- FEATURE MANIFEST (required)
==================================================
The very first thing in `game.html` must be an HTML comment block titled `FEATURE MANIFEST`. List each rubric item below by its ID and short name, grouped under its category, and mark it [x] implemented or [ ] not implemented, with a few words on how it works for implemented items (e.g. "W5 Caves -- 3D noise threshold carves air pockets below surface").
Rules: List ONLY items that genuinely work when the file is run. Do NOT write any point values, scores, or self-assessed totals anywhere in the file. Listing an item you did not actually implement (or that throws/does nothing when tested) counts against you, because every manifest entry is verified.

==================================================
SCORING & ANTI-GAMING GROUND RULES
==================================================
- The grader awards points ONLY for behavior that is verifiably working: visible while playing, observable in the HUD overlay or the browser console/network panel, or (for a few lines) confirmed by source inspection. Code that is commented out, stubbed, behind an unreachable branch, or marked TODO/placeholder earns ZERO.
- Procedurally generated "placeholder-style" art counts fully as long as it is generated as specified and actually renders; a blank/missing/untextured surface does not count.
- Each rubric line is scored full / half / zero only.
- A feature that throws an error when used earns 0 for its line and jeopardizes the engineering lines.

==================================================
SUCCESS RUBRIC -- 100 POINTS (game quality; your primary specification)
==================================================
WORLD (22)
- [W1] (3) Voxel chunk system: world built from discrete cubic blocks organized into independently meshed chunks.
- [W2] (4) Procedural terrain from seeded noise (seed 1337): rolling hills/valleys; the spawn-area HUD hash is identical across reloads. Full if the hash is stable on two reloads.
- [W3] (4) At least 6 visually distinct block types, distinguishable at play distance. Half if 3-5.
- [W4] (3) At least 2 biomes that visibly differ in surface blocks and/or vegetation. Half if subtle/single-block.
- [W5] (3) Caves or underground hollows carved below the surface, enterable by the player.
- [W6] (2) A water body at a sea level, filling low areas and visually distinct from land.
- [W7] (3) Trees (trunk + leaf canopy) generated and scattered on the surface.

PLAYER (15)
- [P1] (2) First-person camera at eye height.
- [P2] (3) Pointer-lock mouse-look, smooth, clamped pitch, no page scroll.
- [P3] (2) WASD movement relative to facing; sprint with Shift works.
- [P4] (3) Gravity + jump (Space): the player falls and lands back on the ground.
- [P5] (3) AABB collision: the player cannot walk or fall through solid blocks.
- [P6] (2) Fly / no-clip toggle on F; Space/Shift move vertically while flying.

INTERACTION (15)
- [I1] (4) Raycast BREAK: left click removes the targeted block and the chunk remeshes.
- [I2] (4) Raycast PLACE: right click adds a block against the correct adjacent face.
- [I3] (3) Targeted-block highlight: visible wireframe/outline on the block under the crosshair.
- [I4] (2) Hotbar with multiple selectable block types and a clear active slot; 1-9/scroll switch.
- [I5] (2) Inventory / expanded palette (E) exposing more placeable types than the hotbar.

RENDERING (15)
- [R1] (3) Per-face procedural textures drawn in code (canvas/data-URI), not flat single colors; grass top differs from sides.
- [R2] (3) Directional "sun" light plus ambient light; faces shade differently by orientation.
- [R3] (2) Ambient occlusion: block corners/crevices visibly darkened (verified by playing AND, if ambiguous, by source inspection of the AO mesh code). Half if only flat per-face shading.
- [R4] (2) Distance fog fading far terrain into the sky color.
- [R5] (3) Sky with a color/gradient or skybox that reads as a sky (not blank black).
- [R6] (2) Transparent water you can see through, composited correctly.

SCALE & PERFORMANCE (13)
- [S1] (4) Chunks load AND unload by render distance (>=8): fly outward and watch the HUD chunk count rise with new terrain and fall as distant terrain frees. (HUD-observable; not "all-at-once".)
- [S2] (3) Hidden interior faces between solid blocks not drawn (face culling) and/or greedy meshing: HUD triangle/draw-call count is far below naive cube-per-block (sanity-check the order of magnitude). Half if partial.
- [S3] (3) HUD FPS reads >=50 while walking across loaded terrain on the grading machine. Half if 30-49.
- [S4] (3) HUD shows live FPS AND player coordinates (plus chunk count / render distance), updating in real time.

ATMOSPHERE & EXTRAS (10)
- [X1] (2) Day-night cycle: sun position and sky/light color change; nights darker.
- [X2] (2) Clouds in the sky.
- [X3] (2) Sound effects synthesized in code via Web Audio (break/place/footstep) -- no audio files.
- [X4] (2) At least one simple wandering mob/creature that is visible and moves.
- [X5] (2) Save/load of world edits and/or player position via localStorage surviving a reload.

ENGINEERING (10)
- [E1] (3) `game.html` honors the deliverable contract (one inline file, only the pinned Three.js graph fetched, import map present, no external assets, no local modules, runs offline) -- verified via the browser network panel.
- [E2] (3) Zero uncaught console errors/exceptions on load and during normal play -- verified via the console.
- [E3] (2) Manifest honesty: every feature listed in the FEATURE MANIFEST actually works when tested.
- [E4] (2) On-screen crosshair at center AND a pause/help overlay (Esc) listing controls and seed (play-observable). (Code readability is judged separately as a source-review note, not on this line.)

==================================================
BEYOND THE 100-POINT GAME RUBRIC -- two more scored axes (Overall = 130)
==================================================
- DOCUMENTATION (10): `docs.html` is self-contained, accurately reflects the actual build, and was demonstrably kept up to date THROUGHOUT -- judged by your commit history showing docs.html changing in the same commits as the code, not added at the end.
- SPEED (20): your build time (operator wall-clock, corroborated by your commit history) is scored relative to the field; faster is higher. Quality is primary -- never trade away working features for speed -- and tampered/implausible timing forfeits this axis.
Results are reported on BOTH a Quality-only (0-100) leaderboard and an Overall (0-130) leaderboard.

==================================================
PRIORITIES
==================================================
1) Make `game.html` RUN FLAWLESSLY first -- the Deliverable Contract is absolute. 2) Then go WIDE: maximize the number of rubric items that fully and verifiably work -- breadth beats one over-engineered feature; build the HUD overlay early so the instrumented lines (S1/S2/S3/S4/W2) are gradable. 3) Keep `docs.html` current and commit often as you go. 4) Then polish feel and performance. Keep the world deterministic (seed 1337), the spawn fixed and feature-rich, and controls exactly as specified. When unsure of a detail, choose the option closest to classic Minecraft behavior. Deliver `game.html` and `docs.html` complete, with nothing stubbed.
