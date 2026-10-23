/**
 * OPD Saathi – scripts/test-routing.js
 *
 * Node.js automated test script for hospital routing & data logic.
 * Run with:  npm run test:routing
 *
 * Test coverage:
 *   1. All canonical places are mutually reachable (stairs allowed and stairs avoided)
 *   2. avoidStairs:true routes never include any usesStairs edges
 *   3. Ground-to-second floor navigation works with and without stairs
 *   4. Distance symmetry: dist(A,B) === dist(B,A)
 *   5. buildDirections(route, t) generates human steps with turn and door hints
 *   6. nearestOf(fromId, type) finds closest Help Desk and Toilets
 *   7. Departments & Patients data structure integrity
 */

import { places, edges } from '../src/data/hospital.js';
import { departments, DEPARTMENTS } from '../src/data/departments.js';
import { patients, PATIENTS } from '../src/data/patients.js';
import { findRoute, buildDirections, nearestOf } from '../src/lib/routing.js';
import { en } from '../src/i18n/en.js';
import { hi } from '../src/i18n/hi.js';

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

function dist(fromId, toId, avoidStairs = false) {
  const r = findRoute(fromId, toId, { avoidStairs });
  return r.found ? r.totalMetres : Infinity;
}

const stairEdgePairs = new Set(
  edges
    .filter(e => e.usesStairs)
    .flatMap(e => [`${e.from}|${e.to}`, `${e.to}|${e.from}`])
);

const placeIds = Object.keys(places);
console.log(`\n======================================================`);
console.log(` OPD Saathi – Routing & Data Logic Test Suite`);
console.log(` Graph: ${placeIds.length} places, ${edges.length} edges`);
console.log(`======================================================\n`);

// ─── TEST 1: All canonical places are mutually reachable ────────────────────
console.log('Test 1: All canonical places are mutually reachable');
let unreachableAllowed = [];
let unreachableAvoided = [];

for (const a of placeIds) {
  for (const b of placeIds) {
    if (a === b) continue;
    const r1 = findRoute(a, b, { avoidStairs: false });
    if (!r1.found) unreachableAllowed.push(`${a} → ${b}`);

    const r2 = findRoute(a, b, { avoidStairs: true });
    if (!r2.found) unreachableAvoided.push(`${a} → ${b}`);
  }
}

const totalPairs = placeIds.length * (placeIds.length - 1);
assert(
  `All ${totalPairs} directed pairs reachable (stairs allowed)`,
  unreachableAllowed.length === 0,
  unreachableAllowed.slice(0, 5).join(', ')
);
assert(
  `All ${totalPairs} directed pairs reachable with avoidStairs:true (100% accessible)`,
  unreachableAvoided.length === 0,
  unreachableAvoided.slice(0, 5).join(', ')
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
      if (stairEdgePairs.has(key) || seg.usesStairs) {
        stairViolations.push(`${a}→${b} via stair edge ${seg.from}↔${seg.to}`);
      }
    }
  }
}
assert(
  'No stair edges used across all routes when avoidStairs:true',
  stairViolations.length === 0,
  stairViolations.slice(0, 3).join('; ')
);

// ─── TEST 3: Ground to 2nd floor works with and without stairs ────────────────
console.log('\nTest 3: Ground to second floor navigation');
const g2w_normal = findRoute('g_entrance', 'f2_ward_4', { avoidStairs: false });
const g2w_avoid  = findRoute('g_entrance', 'f2_ward_4', { avoidStairs: true });

assert('Route g_entrance → f2_ward_4 found WITH stairs allowed', g2w_normal.found);
assert('Route g_entrance → f2_ward_4 found WITHOUT stairs (step-free)', g2w_avoid.found);
assert(
  'avoidStairs route has zero stair segments',
  !g2w_avoid.segments.some(s => s.usesStairs)
);

// Stairs vs Lift distance test starting from stairs landing
const stairsRoute = findRoute('g_stairs', 'f2_stairs', { avoidStairs: false });
const liftRoute   = findRoute('g_stairs', 'f2_stairs', { avoidStairs: true });
assert('Route g_stairs → f2_stairs with stairs allowed uses stairs (shorter)',
  stairsRoute.found && stairsRoute.segments.some(s => s.usesStairs) && stairsRoute.totalMetres === 30
);
assert('Route g_stairs → f2_stairs with avoidStairs:true takes lift path (no stairs)',
  liftRoute.found && !liftRoute.segments.some(s => s.usesStairs) && liftRoute.totalMetres > 30
);
console.log(`     g_stairs → f2_stairs (with stairs): ${stairsRoute.totalMetres}m`);
console.log(`     g_stairs → f2_stairs (avoid stairs): ${liftRoute.totalMetres}m`);

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
  ['g_wheelchair', 'f2_ward_6'],
];
for (const [a, b] of samplePairs) {
  const ab = dist(a, b);
  const ba = dist(b, a);
  if (ab !== ba) {
    asymmetric.push(`dist(${a},${b})=${ab} ≠ dist(${b},${a})=${ba}`);
  } else {
    console.log(`     dist(${a}, ${b}) = ${ab}m (symmetric) ✓`);
  }
}
assert(
  'All sampled place pairs are symmetric in distance',
  asymmetric.length === 0,
  asymmetric.join('; ')
);

// ─── TEST 5: buildDirections(route, t) human guidance ────────────────────────
console.log('\nTest 5: buildDirections(route, t) human steps');
const mockT = (key, vars = {}) => {
  let str = en[key] !== undefined ? en[key] : key;
  if (vars && typeof vars === 'object') {
    for (const [k, v] of Object.entries(vars)) {
      str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
    }
  }
  return str;
};

// Route from ground lift to room 3 (Children)
const routeToRoom3 = findRoute('g_lift', 'f1_room_3', { avoidStairs: true });
const directionsEN = buildDirections(routeToRoom3, mockT);
console.log('     Generated directions for g_lift → f1_room_3:');
directionsEN.forEach((s, idx) => console.log(`       [Step ${idx + 1}] ${s}`));

assert('Directions generated successfully', directionsEN.length >= 3);
assert(
  'Directions include vertical transition (take lift)',
  directionsEN.some(s => s.toLowerCase().includes('lift'))
);
assert(
  'Directions include turn and door hint for Room 3',
  directionsEN.some(s => s.toLowerCase().includes('third door') || s.toLowerCase().includes('blue chairs') || s.toLowerCase().includes('room 3'))
);
assert(
  'Directions include reassuring staff assistance tip',
  directionsEN.some(s => s.toLowerCase().includes('staff'))
);

// Also test Hindi translations
const mockTHindi = (key, vars = {}) => {
  let str = hi[key] !== undefined ? hi[key] : (en[key] !== undefined ? en[key] : key);
  if (vars && typeof vars === 'object') {
    for (const [k, v] of Object.entries(vars)) {
      str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
    }
  }
  return str;
};
const directionsHI = buildDirections(routeToRoom3, mockTHindi);
assert('Hindi directions generated successfully', directionsHI.length >= 3);
console.log(`       [Hindi Step 1] ${directionsHI[0]}`);
console.log(`       [Hindi Step 2] ${directionsHI[1]}`);

// ─── TEST 6: nearestOf(fromId, type) for help desk & toilets ─────────────────
console.log('\nTest 6: nearestOf(fromId, type)');
const nearHelpDesk = nearestOf('g_entrance', 'help_desk');
assert(
  'nearestOf(g_entrance, "help_desk") returns g_help_desk',
  nearHelpDesk && nearHelpDesk.id === 'g_help_desk'
);

const nearToiletFromG = nearestOf('g_entrance', 'toilet');
assert(
  'nearestOf(g_entrance, "toilet") returns g_toilets',
  nearToiletFromG && nearToiletFromG.id === 'g_toilets'
);

const nearToiletFromF1 = nearestOf('f1_room_3', 'toilet');
assert(
  'nearestOf(f1_room_3, "toilet") returns f1_toilets',
  nearToiletFromF1 && nearToiletFromF1.id === 'f1_toilets'
);

console.log(`     Nearest help desk from entrance: ${nearHelpDesk?.id}`);
console.log(`     Nearest toilet from entrance: ${nearToiletFromG?.id}`);
console.log(`     Nearest toilet from Room 3 (Floor 1): ${nearToiletFromF1?.id}`);

// ─── TEST 7: Departments & Patients Data Verification ────────────────────────
console.log('\nTest 7: Departments & Patients Data Verification');
const expectedDepts = [
  { id: 'medicine', prefix: 'MED', room: 'f1_room_1' },
  { id: 'children', prefix: 'CHI', room: 'f1_room_3' },
  { id: 'women',    prefix: 'WOM', room: 'f1_room_4' },
  { id: 'bones',    prefix: 'BON', room: 'f1_room_5' },
  { id: 'ent',      prefix: 'ENT', room: 'f1_room_6' },
  { id: 'eyes',     prefix: 'EYE', room: 'f1_room_7' },
  { id: 'skin',     prefix: 'SKN', room: 'f1_room_8' },
];

let deptErrors = [];
for (const exp of expectedDepts) {
  const d = departments.find(item => item.id === exp.id);
  if (!d) {
    deptErrors.push(`Missing dept ${exp.id}`);
  } else {
    if (d.tokenPrefix !== exp.prefix) deptErrors.push(`Dept ${exp.id} tokenPrefix expected ${exp.prefix}, got ${d.tokenPrefix}`);
    if (d.roomPlaceId !== exp.room) deptErrors.push(`Dept ${exp.id} roomPlaceId expected ${exp.room}, got ${d.roomPlaceId}`);
    if (!d.doctorName) deptErrors.push(`Dept ${exp.id} missing doctorName`);
    if (d.opdHours !== '9:00-14:00') deptErrors.push(`Dept ${exp.id} opdHours expected '9:00-14:00', got ${d.opdHours}`);
    if (typeof d.sampleAvgMinutes !== 'number') deptErrors.push(`Dept ${exp.id} invalid sampleAvgMinutes`);
    if (!d.descKey) deptErrors.push(`Dept ${exp.id} missing descKey`);
  }
}
assert('All 7 departments meet all requirements exactly', deptErrors.length === 0, deptErrors.join('; '));

assert('Patients array contains exactly 25 patients', patients.length === 25);
let patientErrors = [];
patients.forEach((p, idx) => {
  if (!p.firstName) patientErrors.push(`Patient #${idx} missing firstName`);
  if (typeof p.age !== 'number') patientErrors.push(`Patient #${idx} missing age`);
  if (!p.gender) patientErrors.push(`Patient #${idx} missing gender`);
  if (!p.department) patientErrors.push(`Patient #${idx} missing department`);
});
assert('All 25 patients have firstName, age, gender, department', patientErrors.length === 0, patientErrors.slice(0, 3).join('; '));

// ─── Summary ─────────────────────────────────────────────────────────────────
console.log(`\n======================================================`);
console.log(` Results: ${passed} passed, ${failed} failed`);
console.log(`======================================================\n`);

if (failed > 0) {
  process.exit(1);
}
