#!/usr/bin/env node
// Round-2 variance pre-study — static playability probe.
// Auto-classifies a Minecraft-clone game.html for the round-1 failure signatures,
// so N resamples can be triaged without hand-grading every one.
//
// Usage:   node probe.mjs <path-to-game.html> [more.html ...]
//          node probe.mjs samples/m3/*.html
// Output:  one JSON verdict per file (+ a summary line). Exit 0 always.
//
// HEURISTIC, by design: it flags the *signatures* we documented in round 1
// (M3 double-fire mousedown; 2.7 stale-place + textures-defined-but-not-wired).
// A "playable?" of `suspect`/`broken` is a strong prompt for a runtime confirm,
// not a final grade. Runtime confirmation = load it in the browser and check
// "one left-click removes exactly one block".

import { readFileSync } from 'node:fs';

const reCount = (s, re) => (s.match(re) || []).length;

function analyze(file) {
  let html;
  try { html = readFileSync(file, 'utf8'); }
  catch (e) { return { file, error: String(e.message || e) }; }

  const notes = [];
  const script = html; // single-file builds inline everything; scan whole doc

  // ---- core-loop input handlers -------------------------------------------
  const mousedownAdds   = reCount(script, /addEventListener\(\s*['"]mousedown['"]/g);
  const pointerdownAdds = reCount(script, /addEventListener\(\s*['"]pointerdown['"]/g);
  const clickActionAdds = reCount(script, /addEventListener\(\s*['"]click['"]/g);
  // a removeEventListener only cancels an add if it passes the SAME function ref;
  // an inline arrow/function literal removes nothing (the round-1 M3 bug at :1858).
  const removeNoop = reCount(script, /removeEventListener\(\s*['"](?:mouse|pointer)down['"]\s*,\s*(?:\(\s*\)\s*=>|function)/g);
  const removeMaybeReal = reCount(script, /removeEventListener\(\s*['"](?:mouse|pointer)down['"]\s*,\s*[A-Za-z_$][\w$]*\s*\)/g);

  const downAdds = mousedownAdds + pointerdownAdds;
  // does the click path break/place? (button 0 / button 2 → break/place verbs)
  const hasBreakVerb = /\b(doBreak|breakBlock|removeBlock|destroyBlock)\b/.test(script)
                     || /setBlock\([^)]*?,\s*(0|B_AIR|AIR|BLOCK_AIR)\s*\)/.test(script);
  const hasPlaceVerb = /\b(doPlace|placeBlock|addBlock)\b/.test(script);

  // DOUBLE-FIRE signature: >1 live down-listener that act on clicks, and no real removal.
  const doubleFireSuspected = (downAdds >= 2) && (removeMaybeReal < (downAdds - 1)) && (hasBreakVerb || hasPlaceVerb);
  if (doubleFireSuspected)
    notes.push(`DOUBLE-FIRE suspected: ${downAdds} mouse/pointer-down listeners, only ${removeMaybeReal} possibly-real removeEventListener(s)` + (removeNoop ? `, ${removeNoop} no-op removal(s)` : '') + ' → one click likely triggers the verb twice (the round-1 M3 bug).');

  // ---- place freshness (2.7 signature: place uses a cached/stale target) ----
  // crude: does a place handler re-run a raycast, or read a stored target field?
  const placeReRaycasts = /(?:doPlace|placeBlock|onPlace|button\s*===?\s*2)[\s\S]{0,400}?(raycast|Raycaster|intersect|castRay|pickBlock)/i.test(script);
  const placeUsesCachedTarget = /(targetedBlock|targetBlock|currentTarget|hovered)\s*\.\s*(place|adj|normal|prev)/.test(script);
  if (hasPlaceVerb && !placeReRaycasts && placeUsesCachedTarget)
    notes.push('PLACE may read a cached target (no re-raycast in the place path) — the round-1 2.7 "stale targetedBlock.place" risk; confirm RMB places on the correct face.');

  // ---- textures wired into the mesh? (2.7 signature: built but unused) ------
  const buildsAtlas = /(CanvasTexture|DataTexture|new\s+THREE\.Texture|getContext\(\s*['"]2d['"]\s*\)[\s\S]{0,400}?(drawImage|fillRect|putImageData))/.test(script);
  const materialUsesMap = /new\s+THREE\.[A-Za-z]*Material\([^)]*\bmap\s*:/.test(script) || /\.map\s*=\s*(tex|atlas|texture)/i.test(script);
  const materialUsesVertexColors = /vertexColors\s*:\s*(true|THREE\.VertexColors)/.test(script);
  const texturesWired = buildsAtlas && materialUsesMap;
  if (buildsAtlas && !materialUsesMap)
    notes.push('TEXTURES defined but no material `map:` found' + (materialUsesVertexColors ? ' (materials use vertexColors)' : '') + ' → likely renders flat, unwired (the round-1 2.7 signature).');

  // ---- save / restore sanity ------------------------------------------------
  const usesLocalStorage = /localStorage\.(setItem|getItem)/.test(script);
  const savesWholeChunks = /JSON\.stringify\([^)]*\b(chunks?|voxels?|blocks)\b/.test(script);
  if (savesWholeChunks) notes.push('SAVE may serialize whole chunk arrays → localStorage quota risk (round-1 2.7 QuotaExceeded signature).');
  const overwritesSpawnOnLoad = /(findSpawn|computeSpawn|getSpawn)\s*\([\s\S]{0,200}?(player\.pos|player\.position)\s*=/.test(script)
                              || /load[\s\S]{0,300}?findSpawn/i.test(script);
  if (usesLocalStorage && overwritesSpawnOnLoad)
    notes.push('SAVE/RESTORE risk: spawn recomputed on load — may overwrite the restored position (round-1 M3 signature). Confirm position survives reload.');

  // ---- spec gates -----------------------------------------------------------
  const cdnThree = reCount(script, /three@0\.160\.0/g) > 0;
  const externalAssets = (script.match(/https?:\/\/[^\s"')]+/g) || []).filter(u => !/three@0\.160\.0/.test(u));
  if (externalAssets.length) notes.push(`Non-three external URL(s) present (${externalAssets.length}) — spec wants zero external assets: ${externalAssets.slice(0,3).join(', ')}`);

  // ---- classification -------------------------------------------------------
  let playable;
  if (doubleFireSuspected) playable = 'broken (core loop double-fires)';
  else if (hasPlaceVerb && !placeReRaycasts && placeUsesCachedTarget) playable = 'suspect (place may be stale)';
  else if (!hasBreakVerb && !hasPlaceVerb) playable = 'suspect (no break/place verb found)';
  else playable = 'plausibly-playable (confirm at runtime)';

  return {
    file,
    inputHandlers: { mousedownAdds, pointerdownAdds, clickActionAdds, removeNoop, removeMaybeReal },
    coreLoop: { hasBreakVerb, hasPlaceVerb, doubleFireSuspected, placeReRaycasts, placeUsesCachedTarget },
    rendering: { buildsAtlas, materialUsesMap, materialUsesVertexColors, texturesWired },
    persistence: { usesLocalStorage, savesWholeChunks, overwritesSpawnOnLoad },
    spec: { cdnThree, externalAssetCount: externalAssets.length, sizeKB: Math.round(html.length / 1024) },
    playable,
    notes,
  };
}

const files = process.argv.slice(2);
if (!files.length) { console.error('usage: node probe.mjs <game.html> [...]'); process.exit(0); }
const results = files.map(analyze);
for (const r of results) console.log(JSON.stringify(r, null, 2));
const tally = results.reduce((m, r) => (m[r.playable || 'error'] = (m[r.playable || 'error'] || 0) + 1, m), {});
console.log('\n=== SUMMARY ===');
console.log(`${results.length} build(s):`, JSON.stringify(tally));
console.log('double-fire suspected in:', results.filter(r => r.coreLoop?.doubleFireSuspected).map(r => r.file).join(', ') || 'none');
