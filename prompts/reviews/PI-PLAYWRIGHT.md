# Giving Pi (MiniMax) browser self-verification

Goal: let the MiniMax/Pi agent **test its own build in a real browser** during Round 2 — the loop it
lacked in round 1 (and whose screenshot path tripped MiniMax's **error-1026 image moderation**).

**The golden rule:** MiniMax's moderation rejects *image inputs*. So the agent must consume browser
results as **TEXT** (DOM/accessibility/console/numbers), never as screenshots it has to *look at*.
Both options below are text-only by design.

Your stack already has what's needed: `pi-mcp-adapter@2.8.0` is installed, `pi-interactive-shell` is
installed, Node 26, and Chromium is cached (`~/Library/Caches/ms-playwright/chromium-1217`).

---

## Option A — `smoke.mjs` as a shell tool (recommended for the fix loop)
Simplest, zero-image, nothing new to install (Playwright is already set up in `round2/`). Pi can run a
shell command and read JSON back. Tell the agent, in its round-2 prompt:

> To test your build, run: `node round2/smoke.mjs <your-game.html>` and read the JSON
> (`consoleErrors`, `network.external`, `render.triangles`, `interaction.breakRemoved`/`placeAdded` —
> 2 means a verb double-fired, `notes`).

That's it — `pi-interactive-shell` lets MiniMax invoke it, and the output is pure text. This is the
loop that catches the exact round-1 failures (double-fire, console errors, non-spec fetches) without
any vision call. **Use this as the primary verifier.**

## Option B — full Playwright MCP (general browser control, text tools only)
For free-form browser driving, register the Playwright MCP with Pi's adapter.

1. Create **`~/.pi/agent/mcp.json`** (Pi global override the adapter reads) — or `.mcp.json` in the
   project dir:
   ```json
   {
     "mcpServers": {
       "playwright": {
         "command": "npx",
         "args": ["-y", "@playwright/mcp@latest", "--headless", "--browser", "chromium"]
       }
     }
   }
   ```
2. **Restart Pi.** Open `/mcp` to confirm the adapter picked it up (it proxies tools through one
   ~200-token tool, so it won't blow the context window).
3. **Steer MiniMax to the TEXT tools, ban the image one.** Put this in the round-2 prompt:
   > Use `browser_snapshot` (accessibility tree = text), `browser_evaluate` (returns JS values/numbers),
   > and `browser_console_messages` to verify. Do **NOT** call `browser_take_screenshot` — image inputs
   > are rejected by moderation. To check the core loop, `browser_evaluate` a script that counts solid
   > blocks before/after a simulated click (see `round2/smoke.mjs` for the pattern).

   `browser_snapshot` + `browser_evaluate` give the full DOM/HUD/console and let it script break/place
   checks — everything needed, all as text.

   *(Alternative server: `chrome-devtools-mcp@latest` — same idea, CDP-based, also text-capable. Either
   works through the adapter; pick one.)*

## Verify it works (either option)
- Option A: `node round2/smoke.mjs minimax-m3/game.html` → JSON with `interaction.breakRemoved: 2`.
- Option B: in Pi, ask it to `browser_navigate` to a served `game.html` then `browser_evaluate`
  `() => document.querySelector('canvas')?.width` → a number, no image.

## Fairness note (for the report)
Giving MiniMax this loop is the right *equalization* (Opus had Playwright, Codex had CDP in round 1),
but it means MiniMax **gains a tool it didn't have** — so Round-2 deltas are "self-repair under a
**standardized** harness," not pure model reasoning. State that next to the numbers ([[PLAN.md]] §B.2).
