/**
 * OPD Saathi – scripts/test-routing.js
 *
 * Node.js automated routing tests (ESM).
 * Run with:  node --experimental-vm-modules scripts/test-routing.js
 * Or via:    npm run test:routing
 *
 * Tests:
 *   1. All canonical place IDs are mutually reachable (without avoidStairs)
 *   2. avoidStairs:true never traverses a usesStairs edge
 *   3. Ground-to-2nd-floor (g_entrance → f2_ward_4) works with and without stairs
 *   4. Distance symmetry: dist(A,B) === dist(B,A)
 */

import { places, edges } from '../src/data/hospital.js';
import { findRoute } from '../src/lib/routing.js';

let passed = 0;
let failed = 0;

function assert(label, condition, extra = '') {
  if (condition) {
    console.log(`  ✓  ${label}`);
    passed++;
  } else {
    console.error(`  ✗  FAIL: ${label}${extra ? ' — ' + extra : ''}`);
    failed++;
  }
}

// ─── Helper: compute totalMetres for a pair ─────────────────────────────────
function dist(fromId, toId, avoidStairs = false) {
  const r = findRoute(fromId, toId, { avoidStairs });
  return r.found ? r.totalMetres : Infinity;
}

// ─── Build edge lookup set (usesStairs edges) ────────────────────────────────
const stairEdgePairs = new Set(
  edges
    .filter(e => e.usesStairs)
    .flatMap(e => [`${e.from}|${e.to}`, `${e.to}|${e.from}`])
);

const placeIds = Object.keys(places);
console.log(`\n OPD Saathi – Routing Tests`);
console.log(`  Graph: ${placeIds.length} places, ${edges.length} edges\n`);

// ─── TEST 1: All pairs reachable (no avoidStairs) ────────────────────────────
console.log('Test 1: All canonical places are mutually reachable');
let unreachable = [];
for (const a of placeIds) {
  for (const b of placeIds) {
    if (a === b) continue;
    const r = findRoute(a, b, { avoidStairs: false });
    if (!r.found) unreachable.push(`${a} → ${b}`);
  }
}
assert(
  `All ${placeIds.length * (placeIds.length - 1)} directed pairs reachable`,
  unreachable.length === 0,
  unreachable.slice(0, 5).join(', ') + (unreachable.length > 5 ? '…' : '')
);

// ─── TEST 2: avoidStairs never uses stairs ───────────────────────────────────
console.log('\nTest 2: avoidStairs:true never uses stair edges');
let stairViolations = [];
for (const a of placeIds) {
  for (const b of placeIds) {
    if (a === b) continue;
    const r = findRoute(a, b, { avoidStairs: true });
    if (!r.found) continue;
    for (const seg of r.segments) {
      const key = `${seg.from}|${seg.to}`;
      if (stairEdgePairs.has(key)) {
        stairViolations.push(`${a}→${b} via stair edge ${seg.from}↔${seg.to}`);
      }
    }
  }
}
assert(
  'No stair edges used when avoidStairs:true',
  stairViolations.length === 0,
  stairViolations.slice(0, 3).join('; ')
);

// ─── TEST 3: Ground to 2nd floor both modes ──────────────────────────────────
console.log('\nTest 3: g_entrance → f2_ward_4 (ground to second floor)');
const routeWithStairs    = findRoute('g_entrance', 'f2_ward_4', { avoidStairs: false });
const routeWithoutStairs = findRoute('g_entrance', 'f2_ward_4', { avoidStairs: true });

assert('Route found WITH stairs allowed',    routeWithStairs.found);
assert('Route found WITHOUT stairs (lift path)', routeWithoutStairs.found);

if (routeWithStairs.found) {
  const usedStairs = routeWithStairs.segments.some(s => s.usesStairs);
  console.log(`     With stairs: ${routeWithStairs.totalMetres}m, uses stairs: ${usedStairs}`);
}
if (routeWithoutStairs.found) {
  const usedStairs = routeWithoutStairs.segments.some(s => s.usesStairs);
  assert('No stairs in avoidStairs route', !usedStairs);
  console.log(`     Without stairs: ${routeWithoutStairs.totalMetres}m`);
}

// ─── TEST 4: Distance symmetry ───────────────────────────────────────────────
console.log('\nTest 4: Distance symmetry dist(A,B) === dist(B,A)');
let asymmetric = [];
const samplePairs = [
  ['g_entrance', 'f1_room_5'],
  ['g_entrance', 'f2_ward_4'],
  ['g_lift', 'f2_lift'],
  ['f1_waiting_a', 'f1_room_8'],
  ['g_toilets', 'g_lab'],
  ['f1_lift', 'f1_room_3'],
  ['g_entrance', 'f1_toilets'],
];
for (const [a, b] of samplePairs) {
  const ab = dist(a, b);
  const ba = dist(b, a);
  if (ab !== ba) asymmetric.push(`dist(${a},${b})=${ab} ≠ dist(${b},${a})=${ba}`);
  else console.log(`     dist(${a}, ${b}) = ${ab}m ✓`);
}
assert(
  'All sampled pairs are symmetric',
  asymmetric.length === 0,
  asymmetric.join('; ')
);

// ─── Summary ────────────────────────────────────────────────────────────────
console.log(`\n  Results: ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
