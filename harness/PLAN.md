# Round 2 — "fix your own build" — plan (EMBARGOED, not for the public repo)

Round 1 measured *cold-start build capability*. Round 2 measures **best-effort assisted repair**:
given your own flawed round-1 build **plus the reviewers' findings** and a fixed budget, can the
agent ship the best fixed build it can — without regressing? Headline = the **playability-gate
transition** (did M3 become playable / leapfrog 2.7?) + a **severity-weighted fix-rate** (of *your*
own documented bugs, what fraction got resolved — symmetric across agents). Within-agent.

> **Operator decision (overrides the panel's air-gap recommendation):** do NOT air-gap; give every
> agent the **best chance possible**, even if that means it benefits from what Claude/Codex found.
> This deliberately trades away the *self-diagnosis* signal and makes the *raw delta*
> headroom-confounded (we documented the weak builds more), so the headline shifts to **fix-rate +
> playability transition**, and the run is labeled **"assisted repair," not "blind self-repair."**

## Decisions locked (operator)
1. **Sequence:** variance pre-study FIRST (§A), then the assisted fix round (§B).
2. **No air-gap; web allowed.** Best chance for every agent. (Contamination is no longer a concern —
   it's intentional. §C is therefore moot as a *gate*; kept only as a what-we're-accepting note.)
3. **Harness:** equalize-UP to one shared **text** verifier (§B.2), **named as the variable**.
4. **Feedback:** **hand each agent its OWN bug list** (equal format, from the Claude+Codex+fact-check
   reviews). Explicit + equal + reproducible beats hoping each one *searches and finds* our public
   report (random, asymmetric). Web may also be on; it just stops mattering.

## §A. Variance pre-study (do this first — de-risks the whole thing)
The entire "M3 not playable" premise is **N=1**. Confirm it's a real capability finding, not a
stochastic generation artifact, before investing in Round 2.
- **What:** re-run **M3 (and 2.7)** on the *verbatim* `PROMPT.md`, seed 1337, **3–5 fresh samples**
  each, each in a clean dir, **web off**, same launch (`/goal` + dynamic workflow). *(Operator runs
  these — the MiniMax/Pi agent can't be driven from here.)*
- **Triage:** drop each `game.html` in `round2/samples/m3/` etc.; run `node round2/probe.mjs
  round2/samples/m3/*.html`. The probe auto-flags the **double-fire signature** + stale-place +
  textures-unwired + save-overwrite. `broken`/`suspect` → confirm at runtime (load it, check "one
  left-click removes exactly one block").
- **Decision rule:** if the double-fire (or unplayability) recurs in ~all samples → baseline is real,
  proceed to §B. If it's a coin-flip → the round-1 headline is an artifact; report *that* instead.
- (Optional, quota permitting: also resample Opus/GPT to measure full ranking stability + CIs.)

## §B. Controlled fix round
0. **Pre-register & freeze:** the analysis (headline = gate-transition + drift-corrected delta),
   the contract (PROMPT.md verbatim, seed 1337, single inline game.html+docs.html, three@0.160.0
   only, zero external assets, zero uncaught console errors), the rubric, the grading pipeline.
   **SHA-256** each round-1 build as the frozen start. Pre-register the **incident policy**:
   rate-limit / moderation(1026) / 5xx → **void & re-run from the identical snapshot, no budget spent.**
1. **Set up the dir (no air-gap):** clean working dir with that agent's own game.html+docs.html, the
   re-embedded `PROMPT.md`, and **its own bug list** (§B.4). Do **not** include competitor builds (keep
   it about repairing *its* work). **Fresh `git init`** (round-1 builds are single squashed commits —
   judge integrity by file-diff/churn, not commits). Web may be on; we are intentionally not blocking
   the public report (operator decision — every agent gets the best chance).
   **FRESH session per build — never fork/resume the round-1 session.** A resumed session carries
   round-1 context + memory, turning the run into "continue building" rather than clean self-repair from
   the frozen build + bug list (which is what Round 2 measures). If Pi offers "fork this session?", answer
   **N**. The dir's `AGENTS.md`/`CLAUDE.md` still loads for the operating guide — that's fine and intended.
2. **Equalize-up harness (incl. MiniMax):** every agent gets the *same* minimal loadout —
   filesystem RW on its own files, a shell, and **one shared headless-browser smoke harness**.
   **CRITICAL — the verifier returns STRUCTURED TEXT, not screenshots:** "1 LMB → N blocks changed",
   "1 RMB → N blocks placed", console error list, HUD metrics (FPS/chunks/tris/spawn-hash), gate
   checks. This gives MiniMax the self-test loop it lacked in round 1 **without** feeding it rendered
   images (which is what tripped the 1026 image-moderation incident). No web, no agent-specific plugins.
   Frame results as **"self-repair under a standardized harness"** — agents with a weaker round-1
   loadout (MiniMax) partly absorb the equalization gain; say so.
3. **Budget — regime-natural, NOT equal-tokens (operator choice):** an equal-token cap would neutralize
   MiniMax-2.7-highspeed's core advantage (cheap, abundant tokens — it's *built* to grind), so we don't
   cap on tokens. Instead each agent runs **iterate-to-convergence**: keep fixing + re-running `smoke.mjs`
   until the build is clean OR it plateaus (≥N consecutive cycles with no smoke improvement), under a
   generous safety ceiling. 2.7 is explicitly told to grind. **No wall-clock cap.** Anchor cross-model
   fairness on **equal $ / compute** (not equal tokens), and **report effort like-for-like**: use only the
   metrics every platform reports — **total tokens (throughput) + wall-clock**. Output-only tokens and $ are
   NOT available for the MiniMax runs, so we publish **no efficiency ratio** (an output-vs-total comparison
   would be apples-to-oranges — the trap that produced a bogus "100×" draft). Label results **"best per
   model+run-mode in its own cost regime,"** not effort-equalized. **Scope (operator chose): ALL FOUR iterate-to-convergence** — nobody held back,
   the cheap-model iteration edge emerges naturally. Expect Opus/GPT to run long (= higher $); the stop is
   **clean OR plateau (2–3 no-improvement cycles)** + a generous hard ceiling, so it can't run away.
4. **Feedback (own bug list, equal format):** hand the agent a curated list of **its own** documented
   defects (from the Claude live-play + Codex source + fact-check passes), in one consistent template
   (symptom · where · expected behavior). Instruction: *"Here is your round-1 build, the original
   prompt, and a review of this build's bugs. Using the provided smoke harness to test, fix every
   listed issue plus anything else broken/missing/unwired, without regressions. One pass, fixed
   budget."* Edit in place from the frozen snapshot. Each agent sees **only its own** list — fix-rate
   is scored against that list. (This is the "best chance" feedback; it measures fix-execution, not
   self-diagnosis.)
5. **Anti-gaming:** churn guard ≈ **≤25%** of file, targeted edits w/ shared structural landmarks. A
   near-total rewrite → moved to a separate **"rebuild" exhibit**, OFF the delta board (it re-tests
   build capability). Net-new features score **0** toward the delta (can only lower it via regressions).
6. **Re-grade blind, same sitting:** re-grade all four **unchanged round-1** builds fresh on the
   round-2 machine/browser, blind to round + randomized order → measures grader/machine **drift**;
   subtract it. **Do not** reuse the published 96.5/94.5/65/60 as the statistical baseline (carries
   drift + the errors the fact-check overturned). Then grade round-2 builds under the same instrument.

## Reporting (attribution, not a bare delta leaderboard)
- **Headline:** playability-gate transition (became-playable / stayed / regressed) + **severity-weighted
  fix-rate** = of the agent's own listed bugs (crit/high/med/low), what fraction it resolved — *symmetric*
  across agents regardless of list length. A bug counts "fixed" only if live-play *or* source re-check
  confirms — never self-claim.
- **Secondary (with caveat):** raw drift-corrected Capability delta + headroom-normalized `Δ/(100−r1)`.
  Flag plainly that **raw delta is headroom-confounded** — the weak builds (M3/2.7) got longer fix lists,
  so a bigger delta does not mean better repair skill.
- **Companion:** **regression count** vs a held-out suite the agent never saw (report NET delta beside
  gross fix-rate so "fixed 3, broke 2" can't hide); off-list improvements; churn ratio; budget
  efficiency; docs/manifest-honesty delta; hard-gate preservation (seed 1337, three@0.160.0-only,
  zero console errors). *(Self-diagnosis rate is N/A — we hand the list. No contamination audit — web allowed.)*
- **Speed:** NOT re-scored (would double-count / reward stalling); timing kept only as integrity gate.
- **Label honestly:** this is **"assisted repair under a standardized harness, agents given their own
  reviews"** — not blind self-repair. Keep round-2 fix diffs lightly embargoed (a ready-made patch set
  for any future round).

## §C. Air-gap — DECLINED (operator choice)
We are **not** air-gapping; every agent gets the best chance, including the reviewers' findings. What
that buys/costs is handled above (assisted-repair framing + fix-rate headline). The checklist below is
retained only (a) if you later want a clean *blind* self-repair side-arm, and (b) item 4, which is just
good grading hygiene regardless. For reference, per agent:
- [ ] Can it run with **outbound network disabled**? (OS firewall / sandbox / `--offline` flag?)
- [ ] If not fully air-gappable, can outbound be **allowlisted to the three@0.160.0 CDN only**, with a
      captured per-run network log? (else exclude that agent from the comparable delta board.)
- [ ] Vendor specifics to check: **Claude Code** (local, can air-gap) · **Codex** CLI (offline mode?) ·
      **Pi / MiniMax** (the model call itself goes to MiniMax's API — the *model endpoint* can't be
      air-gapped, but the agent's **tool/web access** can; ensure no `web`/search/browse tool can reach
      github/Pages during the pass). The point is to block *retrieval of our report*, not the model API.
- [ ] Vendor three.js locally so **grading** is offline/reproducible (no CDN dependency at grade time).
- [ ] Canary check on every transcript: grep for `1743`, `1858`, `targetedBlock.place`, `QuotaExceeded`,
      `double-fire`, repo URL → any hit voids the run.

## Tooling status
- `round2/probe.mjs` — static signature analyzer (double-fire / stale-place / textures-unwired /
  save-overwrite / spec gates). Built + validated.
- `round2/smoke.mjs` — structured-text runtime harness (console errors, non-spec network, render,
  pointer-lock gating, best-effort break/place). Built + validated. **Role: a SCREENING tool + the
  agents' self-test loop + a grading INPUT — NOT the sole grader.** Authoritative grading of a fix is
  still **live-play + source re-check** (line 87 / §B.6). Coverage limit (Codex-confirmed by running it):
  the interaction (break/place) auto-test only works where the build exposes debug hooks (`getBlock()` +
  player) — true for M3, but GPT/2.7 return `interaction.autoTestable=false` and Opus showed
  `breakRemoved=0`. Whenever `autoTestable=false` or region sampling is inconclusive, that build's core
  loop **must** be graded by live-play + source, not by the smoke `interaction` field. Console / network /
  render / gating signals are reliable across all builds.
