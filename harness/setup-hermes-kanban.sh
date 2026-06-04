#!/usr/bin/env bash
# Reproduce the "MiniMax-M3 · Hermes (kanban)" benchmark harness setup.
#
# Configures Hermes Agent so a 5-agent kanban squad (orchestrator + 2 builders +
# verifier + synthesizer), ALL on MiniMax-M3, builds the Minecraft clone in a shared
# directory with live in-browser verification via Playwright MCP.
#
# Usage:  ./setup-hermes-kanban.sh [BUILD_DIR]
#         BUILD_DIR defaults to ./hermes-m3 (the shared single-file game.html workspace).
#
# Idempotent-ish: safe to re-run (profile/board creates are tolerated if they exist).
# Requires: hermes CLI on PATH (or ~/.local/bin/hermes), MINIMAX_API_KEY set.
set -uo pipefail

H="$(command -v hermes || echo "$HOME/.local/bin/hermes")"
BUILD_DIR="${1:-$PWD/hermes-m3}"
BOARD="minecraft-m3"

echo "==> 1. Model: all agents on MiniMax-M3 via the minimax-oauth provider"
# NOTE: the working provider is 'minimax-oauth' (OAuth via `hermes login minimax-oauth`),
# NOT the API-key 'minimax' provider. base_url is left empty — the oauth provider supplies it.
"$H" config set model.default   MiniMax-M3
"$H" config set model.provider  minimax-oauth
"$H" config set model.base_url  ""
"$H" config set model.api_mode  anthropic_messages

echo "==> 2. Playwright MCP (live in-browser verification) into the default config"
python3 - "$HOME/.hermes/config.yaml" <<'PY'
import sys, re, pathlib
block = ('mcp_servers:\n'
         '  playwright:\n'
         '    command: "npx"\n'
         '    args: ["-y", "@playwright/mcp"]\n'
         '    timeout: 120\n'
         '    connect_timeout: 60\n')
p = pathlib.Path(sys.argv[1]); t = p.read_text()
if 'mcp_servers' in t:
    print("   default config already has mcp_servers")
else:
    m = re.search(r'(?m)^toolsets:', t) or re.search(r'(?m)^credential_pool_strategies:.*\n', t)
    i = m.start() if m and m.re.pattern.startswith('^toolsets') else (m.end() if m else len(t))
    p.write_text(t[:i] + block + t[i:]); print("   inserted mcp_servers into default config")
PY

echo "==> 3. Roster: clone 4 workers from the (now M3 + MCP) default, then describe roles"
for name in m3-builder-1 m3-builder-2 m3-verifier m3-synth; do
  "$H" profile create "$name" --clone 2>/dev/null && echo "   created $name" || echo "   $name exists (skipped)"
done
"$H" profile describe m3-builder-1 --text "Builder. Implements ONE feature / rubric section at a time directly in the shared single-file Three.js game.html, runs it, and commits (docs.html updated in the same commit). Does not redesign others' work."
"$H" profile describe m3-builder-2 --text "Builder. Same role as m3-builder-1 — picks up the next ready feature card and implements it in the shared game.html."
"$H" profile describe m3-verifier  --text "QA verifier. Loads game.html in a REAL browser via the Playwright MCP, plays it (move, break/place one block, save+reload), screenshots, checks the console, and files precise bug/fix cards for anything broken, stubbed, or not actually wired. Writes NO feature code."
"$H" profile describe m3-synth     --text "Integrator/synthesizer. Keeps the single game.html coherent — resolves duplication/conflicts across feature cards, wires loose pieces together, and makes the final consolidated commit once the rubric is verified. Edits for integration, not new features."

echo "==> 4. Board '$BOARD' bound to the shared build dir: $BUILD_DIR"
"$H" kanban init
"$H" kanban boards create "$BOARD" 2>/dev/null || true
"$H" kanban boards set-default-workdir "$BOARD" "$BUILD_DIR"
"$H" kanban boards switch "$BOARD"

echo
echo "Done. Roster:"; "$H" profile list 2>&1 | grep -E 'default|m3-'
echo
echo "Launch:"
echo "  1) hermes desktop --cwd $BUILD_DIR        # orchestrator (default profile = M3)"
echo "  2) paste prompts/round1/goal-hermes-m3-kanban.txt into the chat"
echo "  3) hermes kanban daemon --interval 30 --verbose   # spawns the workers"
echo
echo "Revert model default afterward:  hermes config set model.default deepseek/deepseek-v4-flash:thinking"
echo "(a pre-change backup was saved at ~/.hermes/config.yaml.bak.pre-m3-kanban)"
