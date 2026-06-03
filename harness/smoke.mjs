#!/usr/bin/env node
// Round-2 structured-TEXT smoke harness.
// Loads a Minecraft-clone game.html in headless Chromium, exercises it, and prints a
// JSON report — NEVER an image. Safe for MiniMax (no screenshot → no 1026 moderation).
//
// Use as a grader/triage tool, OR expose it to a coding agent as a shell tool:
//     node round2/smoke.mjs <path-to-game.html>
//     node round2/smoke.mjs round2/samples/m3/run1.html ...
//
// Setup (once):  cd round2 && npm init -y && npm i playwright && npx playwright install chromium
// (Chromium is already cached at ~/Library/Caches/ms-playwright, so install is near-instant.)

import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { dirname, basename, resolve, extname } from 'node:path';

const MIME = { '.html':'text/html', '.js':'text/javascript', '.mjs':'text/javascript', '.css':'text/css', '.json':'application/json', '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.svg':'image/svg+xml', '.wasm':'application/wasm' };

function serveDir(rootDir) {
  return new Promise((res) => {
    const srv = createServer(async (req, rq) => {
      try {
        const p = decodeURIComponent(req.url.split('?')[0]);
        const fp = resolve(rootDir, '.' + p);
        if (!fp.startsWith(resolve(rootDir))) { rq.writeHead(403).end(); return; }
        const body = await readFile(fp);
        rq.writeHead(200, { 'Content-Type': MIME[extname(fp)] || 'application/octet-stream' }).end(body);
      } catch { rq.writeHead(404).end('not found'); }
    });
    srv.listen(0, '127.0.0.1', () => res({ srv, port: srv.address().port }));
  });
}

async function smoke(file) {
  const out = { file, consoleErrors: [], consoleWarnings: [], network: { external: [] }, render: {}, gating: {}, interaction: {}, hud: null, notes: [] };
  const dir = dirname(resolve(file));
  const name = basename(file);
  const { srv, port } = await serveDir(dir);
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  page.on('console', m => { if (m.type() === 'error') out.consoleErrors.push(m.text().slice(0,300)); else if (m.type() === 'warning') out.consoleWarnings.push(m.text().slice(0,200)); });
  page.on('pageerror', e => out.consoleErrors.push('PAGEERROR: ' + String(e.message || e).slice(0,300)));
  page.on('request', req => {
    const u = req.url();
    if (/^https?:\/\//.test(u) && !u.startsWith(`http://127.0.0.1:${port}`)) {
      const okThree = /cdn\.jsdelivr\.net\/npm\/three@0\.160\.0/.test(u);
      if (!okThree) out.network.external.push(u.slice(0, 120));
    }
  });

  try {
    await page.goto(`http://127.0.0.1:${port}/${name}`, { waitUntil: 'load', timeout: 30000 });
  } catch (e) { out.notes.push('NAV FAIL: ' + String(e.message || e).slice(0,160)); }

  // settle: let chunks mesh / RAF run
  await page.waitForTimeout(2500);

  // --- render OK? canvas present + non-zero size, and (if a tri/HUD count exists) > 0
  out.render = await page.evaluate(() => {
    const c = document.querySelector('canvas');
    const txt = (document.body.innerText || '').replace(/\s+/g, ' ');
    const triM = txt.match(/(?:tri(?:angles)?)[:\s]*([\d,]{2,})/i);
    return { hasCanvas: !!c, w: c?.width || 0, h: c?.height || 0, triangles: triM ? +triM[1].replace(/,/g,'') : null, bodyTextLen: txt.length };
  });

  // --- pointer-lock gating: does anything advance over ~1.2s WITHOUT lock? (2.7 signature)
  const hud1 = await page.evaluate(() => (document.body.innerText||'').replace(/\s+/g,' ').slice(0,260));
  await page.waitForTimeout(1200);
  const hud2 = await page.evaluate(() => (document.body.innerText||'').replace(/\s+/g,' ').slice(0,260));
  out.gating.advancesWithoutLock = hud1 !== hud2;
  if (!out.gating.advancesWithoutLock) out.notes.push('Sim appears frozen without pointer lock (HUD unchanged over 1.2s) — likely gated on pointerlock (round-1 2.7 signature). Will fake-lock for interaction test.');
  out.hud = hud2;

  // --- fake pointer lock so loop+input run, then best-effort interaction test
  out.interaction = await page.evaluate(async () => {
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    const el = document.querySelector('canvas') || document.body;
    try { Object.defineProperty(document, 'pointerLockElement', { configurable: true, get: () => el }); } catch {}
    document.dispatchEvent(new Event('pointerlockchange'));
    // dismiss common start/pause overlays so a click reaches the break/place path
    document.querySelectorAll('#start,#startOverlay,#click-to-start,#menu,#instructions,#pause,.overlay')
      .forEach(o => { if (o.id !== 'inv' && o.id !== 'hud') { o.style.display = 'none'; o.classList.add('hide','hidden'); } });
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    // find a debug surface with block read + player
    const V = window.__voxel || window.__game || window.game || window.world || null;
    if (!V) return { autoTestable: false, why: 'no debug hooks (window.__voxel/__game/game/world) — confirm break/place manually' };
    const getB = V.getBlock || V.getVoxel;
    const player = V.player || V.cam || V.camera || (V.controls && V.controls.object);
    if (typeof getB !== 'function') return { autoTestable: false, why: 'debug obj present but no getBlock()' , debugKeys: Object.keys(V).slice(0,30) };
    // count solid blocks in a region around the player (sample DOWN to catch ground) before/after clicks
    const ppos = (player && (player.position || player.pos)) || { x: 0, y: 40, z: 0 };
    const region = () => { let n=0; try { const p = (player && (player.position || player.pos)) || ppos; const bx=Math.floor(p.x),by=Math.floor(p.y),bz=Math.floor(p.z); for (let dx=-4;dx<=4;dx++) for (let dy=-8;dy<=3;dy++) for (let dz=-4;dz<=4;dz++){ const b=getB(bx+dx,by+dy,bz+dz); if (b && b!==0 && b!=='air') n++; } } catch{} return n; };
    const before = region();
    el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button: 0 })); // break
    await sleep(120);
    const afterBreak = region();
    el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button: 2 })); // place
    el.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true }));
    await sleep(120);
    const afterPlace = region();
    return { autoTestable: true, solidBefore: before, afterBreak, afterPlace,
      breakRemoved: before - afterBreak, placeAdded: afterPlace - afterBreak,
      note: 'one LMB should remove ~1 block, one RMB add ~1; ~2 = double-fire' };
  }).catch(e => ({ autoTestable: false, why: 'eval error: ' + String(e.message||e).slice(0,120) }));

  // classify
  if (out.interaction.autoTestable) {
    const b = out.interaction.breakRemoved, p = out.interaction.placeAdded;
    if (b >= 2 || p >= 2) out.notes.push(`DOUBLE-FIRE at runtime: one click changed ${Math.max(b,p)} blocks.`);
    else if (b <= 0) out.notes.push('Break removed 0 blocks (may need aim/target — confirm manually).');
  }
  if (out.network.external.length) out.notes.push(`External (non-three) fetches: ${out.network.external.length} — spec wants zero external assets.`);
  if (out.consoleErrors.length) out.notes.push(`${out.consoleErrors.length} console error(s) on load/play (spec wants zero).`);

  await browser.close(); srv.close();
  return out;
}

const files = process.argv.slice(2);
if (!files.length) { console.error('usage: node smoke.mjs <game.html> [...]'); process.exit(0); }
for (const f of files) {
  try { console.log(JSON.stringify(await smoke(f), null, 2)); }
  catch (e) { console.log(JSON.stringify({ file: f, fatal: String(e.message || e) }, null, 2)); }
}
