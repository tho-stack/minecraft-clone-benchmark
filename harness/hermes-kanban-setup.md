# MiniMax-M3 · Hermes (kanban) — harness setup

The 6th contestant in the build-a-Minecraft-clone benchmark: **MiniMax-M3 driven by Hermes Agent**
(Nous Research, `hermes` CLI v0.15.1 / desktop) in **multi-agent Kanban** orchestration — the honest
parallel to M3 · MiniMax-Code's `/team` (multi-agent) and distinct from M3 · Pi (single-agent).

Reproduce the whole config with [`setup-hermes-kanban.sh`](./setup-hermes-kanban.sh). What it sets up:

## Model
All agents run **MiniMax-M3** via the `minimax` provider (`api.minimax.io/anthropic`, `MINIMAX_API_KEY`).
Hermes's default is deepseek — the script switches it; revert after the run.

## Playwright MCP (live in-browser verification)
Added to `~/.hermes/config.yaml` (and every worker profile) right after `credential_pool_strategies: {}`:

```yaml
mcp_servers:
  playwright:
    command: "npx"
    args: ["-y", "@playwright/mcp"]
    timeout: 120
    connect_timeout: 60
```

This gives the agents a real browser (navigate/screenshot/evaluate/console) — the vision pass Opus
(Playwright MCP) and Codex (CDP) had in round 1, which Pi's M3 never got.

## Roster (5 agents, all MiniMax-M3, self-decompose)

| Profile | Role |
|---|---|
| `default` | **orchestrator** — decomposes the rubric into dependency-ordered cards + routes; writes no code |
| `m3-builder-1`, `m3-builder-2` | **builders** — implement feature cards in the shared `game.html` |
| `m3-verifier` | **QA** — plays each build in a real browser (Playwright MCP), files bug/fix cards |
| `m3-synth` | **integrator** — keeps the single file coherent, makes the final consolidated commit |

Each profile carries a role **description** (used by the kanban decomposer to route by role). Workers are
clones of the M3 default, so they inherit the model + the Playwright MCP. This is **self-decompose**
(the orchestrator splits the rubric itself — parity with the M3·MiniMax-Code `/team` choice); the
verifier/synthesizer are *process* roles, not a human rubric-split.

## Board
A dedicated board **`minecraft-m3`** bound to the build dir as a **shared `dir:` workspace**, so all
workers commit to one `game.html` / one git repo. Cards are dependency-ordered so no two workers edit
the single file at once (mostly-sequential; parallel only on independent sections).

## Launch
1. `hermes desktop --cwd <build-dir>` — opens the orchestrator (default profile = M3)
2. Paste the orchestrator prompt → [`../prompts/round1/goal-hermes-m3-kanban.txt`](../prompts/round1/goal-hermes-m3-kanban.txt)
3. `hermes kanban daemon --interval 30 --verbose` — spawns the workers (without a dispatcher, cards sit in `ready` forever)
4. Watch: `hermes kanban list` · `stats` · `watch` · `tail <task-id>`

The single-agent variant (no kanban) uses [`../prompts/round1/goal-hermes-m3.txt`](../prompts/round1/goal-hermes-m3.txt).

## Effort metrics (record when done)
Wall-clock = first→last commit in the build dir. Tokens via `hermes insights` / `~/.hermes` sessions.

## Revert
`hermes config set model.default deepseek/deepseek-v4-flash:thinking` (or restore
`~/.hermes/config.yaml.bak.pre-m3-kanban`). The `m3-*` profiles can stay for reuse or
`hermes profile delete <name>`.
