# Codex adversarial review — Round 2 fix-round (run in a fresh Codex session, before executing Round 2)

Paste everything below the line into Codex. It has shell access — it should actually RUN the harness.

---

<task>
Adversarially review a benchmark "Round 2" before we spend real budget running it. Round 2 takes four
existing AI-built Three.js Minecraft clones and has each agent FIX its own bugs (assisted repair:
each agent is handed its own bug list), then we re-grade the round1→round2 delta. Your job: find what
would make Round 2 produce a WRONG or GAMEABLE result. Be concrete; cite file:line; default to
skeptical. All files are under /Users/user/_capybara/minimax-m3-minecraft-bench/round2/.
</task>

<safety_rail>
REVIEW ONLY — modify NO tracked file. Do not edit `round2/fix/*`, `smoke.mjs`, `probe.mjs`, or any build.
To construct adversarial cases that try to fool the harness, COPY into `/tmp/round2-review-fixtures/` and
work there. At start, capture `git status --short` as the baseline. Before finishing, confirm fixtures are
pristine by running `(cd round2/fix && shasum -a 256 -c ../r1-hashes.txt)`, then show `git status --short`
again and explicitly state whether the review created any repo changes beyond the baseline.
</safety_rail>

<context>
- 4 builds (frozen copies) in round2/fix/{opus-4.8,gpt-5.5,minimax-m3,minimax-m2.7-highspeed}/game.html.
- Round-1 verdicts (STARTING HYPOTHESES from prior review — verify against source, don't assume):
  M3 unplayable (duplicate mousedown → break/place double-fire; save doesn't restore),
  2.7 flat (textures/AO never wired) + place dead + save QuotaExceeded; Opus/GPT near-clean.
- round2/probe.mjs = static signature analyzer. round2/smoke.mjs = runtime text harness (loads a build
  headless, exercises it, prints JSON: consoleErrors, network.external, render, gating, interaction
  breakRemoved/placeAdded). These tools are the agents' self-test loop + a grading INPUT; the
  authoritative fix-grade is live-play + source re-check (PLAN.md line 87). Their correctness still
  strongly shapes Round 2, so audit them hard.
- round2/FIX-PROMPTS.md = the four prompts (one per build, embedding that build's bug list), iterate-to-
  convergence, "no rewrite / no new features / no regressions / keep the contract".
- round2/PLAN.md = methodology: capability vs playability gate, fix-rate vs a private answer key,
  regression count, effort reported (regime-natural budget, not equal-tokens).
- Reference: the bug lists derive from /Users/user/_capybara/minecraft-clone-benchmark/docs/index.html
  (the published report) + GRADING.md.
</context>

<review_targets>
1. GRADING HARNESS (highest priority — it scores the round). FIRST confirm fixtures are pristine:
   `(cd round2/fix && shasum -a 256 -c ../r1-hashes.txt)`. Then actually RUN it:
   `cd round2 && node smoke.mjs fix/minimax-m3/game.html fix/gpt-5.5/game.html fix/opus-4.8/game.html fix/minimax-m2.7-highspeed/game.html`
   and `node probe.mjs fix/*/game.html`. Find: false negatives/positives in the double-fire and
   break/place detection; brittleness (player.pos vs .position, debug-hook assumptions, region sampling,
   pointer-lock faking); builds it would silently MIS-classify; whether a "fixed" build could pass the
   smoke checks while still broken, or a good build fail them. KNOWN COVERAGE GAP to stress-test: smoke's
   interaction auto-test needs debug hooks (`getBlock()` + player) — on GPT and 2.7 `autoTestable=false`,
   and Opus showed `breakRemoved=0`; whenever `autoTestable=false` or sampling is inconclusive the harness
   CANNOT auto-grade that build's core loop, so confirm Round-2 grading correctly falls back to live-play +
   source there (PLAN.md §B.6), and flag any path that would silently score it from the smoke field anyway.
   Propose concrete hardening.
2. FIX PROMPTS (round2/FIX-PROMPTS.md). Gaming surface: can an agent score a higher delta by rewriting
   from scratch, adding net-new features, or claiming fixes the smoke harness can't actually verify? Are
   the constraints (no-rewrite, no-regress, contract) enforceable/measurable? Any leakage or bias that
   pre-determines the outcome? Missing instructions?
3. SCORING & EFFORT METHODOLOGY (round2/PLAN.md). Does fix-rate (vs a private bug list) + regression
   count + headroom-normalized delta + reported effort actually yield an interpretable, hard-to-game
   result? Where can it mislead? Is "all four iterate-to-convergence, report effort" sound?
4. BUG-LIST ACCURACY. Spot-check each build's handed bug list (in FIX-PROMPTS.md) against the actual
   game.html source — are the claimed bugs real and fairly stated, or any wrong/misleading (a wrong bug
   would send an agent fixing a non-bug)?
</review_targets>

<grounding_rules>
Every finding cites file:line or a command + its observed output. Run the harness/builds rather than
reasoning from the docs. Do not treat the plan's or report's own claims as evidence — verify against
source. If something is a hypothesis, label it.
</grounding_rules>

<structured_output_contract>
Start with a one-line GO / GO-WITH-FIXES / NO-GO verdict on running Round 2 as designed.
Then findings grouped by the 4 targets, each: [severity blocker|major|minor] · what · evidence (file:line
or cmd+output) · concrete fix. Then the single most likely way this Round 2 yields a misleading result,
and the cheapest mitigation. FINALLY a COVERAGE MATRIX — rows {harness, fix prompts, scoring, bug-list
accuracy} × status {checked | partial | not-checked}, with the commands/files used per row — so
unaudited areas are explicit even when a target has zero findings.
</structured_output_contract>

<dig_deeper_nudge>
Spend most effort on target 1 (the harness) — a grader bug silently corrupts every number. Try hard to
construct a build that fools smoke.mjs in each direction.
</dig_deeper_nudge>
