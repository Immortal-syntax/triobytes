/**
 * OPD Saathi – scripts/test-store.js
 *
 * Unit tests for hospital state layer, wait estimation, queue moves,
 * simulated clock multiplier, and persistence.
 *
 * Run with: npm run test:store
 */

import { hospitalStore, estimateWait, normalizeDept, getDeptPrefix, STORAGE_KEY, storageAdapter } from '../src/lib/store.js';

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

console.log(`\n======================================================`);
console.log(` OPD Saathi – Hospital Store & Wait Estimation Tests`);
console.log(`======================================================\n`);

// Reset store to pristine initial state
hospitalStore.resetAll();
let state = hospitalStore.getState();

// ─── TEST 1: Initial Store State Integrity ─────────────────────────────────
console.log('Test 1: Initial State Structure');
assert('Store has patients array', Array.isArray(state.patients) && state.patients.length >= 25);
assert('Store has queueOrder per department', state.queueOrder && Array.isArray(state.queueOrder.bones) && Array.isArray(state.queueOrder.medicine));
assert('Store has counters per prefix', state.counters && typeof state.counters.MED === 'number' && typeof state.counters.BON === 'number');
assert('Store has doctorStatus per department', state.doctorStatus && state.doctorStatus.bones === 'available');
assert('Store has consultHistory per department', state.consultHistory && Array.isArray(state.consultHistory.bones));
assert('Initial simSpeed is 1', state.simSpeed === 1);
assert('SMS inbox initialized', Array.isArray(state.smsInbox));

// ─── TEST 2: Wait Estimation Calculation ───────────────────────────────────
console.log('\nTest 2: Wait Estimation (estimateWait)');

// Case A: First patient currently in room has 0 wait
const inroomPatient = hospitalStore.getState().patients.find(p => p.dept === 'medicine' && p.status === 'inroom');
const estInroom = estimateWait(inroomPatient?.token || 'MED-21');
console.log(`     Inroom patient ${inroomPatient?.token}: ${estInroom.text} (peopleAhead: ${estInroom.peopleAhead})`);
assert('Currently in-consultation patient has 0 wait', estInroom.minutes === 0 && estInroom.peopleAhead === 0);

// Case B: First waiting patient in Medicine
const firstWaiting = hospitalStore.getState().patients.find(p => p.dept === 'medicine' && p.status === 'waiting');
const estWaiting1 = estimateWait(firstWaiting?.token || 'MED-22');
console.log(`     Waiting patient ${firstWaiting?.token}: ${estWaiting1.text} (peopleAhead: ${estWaiting1.peopleAhead}, avg: ${estWaiting1.avgConsultTime}m)`);
assert('estimateWait returns valid structure with minutes, peopleAhead, and formatted text',
  typeof estWaiting1.minutes === 'number' && typeof estWaiting1.peopleAhead === 'number' && estWaiting1.text.startsWith('about')
);
assert('Wait estimate rounds to 5-minute increments', estWaiting1.minutes % 5 === 0);
assert('First waiting patient has 1 person ahead (the inroom patient)', estWaiting1.peopleAhead === 1);

// Case C: Register a new patient at end of queue
const newMedPatient = hospitalStore.registerPatient({
  firstName: 'Pooja Test',
  age: 28,
  gender: 'female',
  mobile: '9876500001',
  dept: 'medicine',
});
const estNew = estimateWait(newMedPatient.token);
console.log(`     Newly registered patient ${newMedPatient.token}: ${estNew.text} (peopleAhead: ${estNew.peopleAhead})`);
assert('Newly registered patient has wait estimate proportional to queue length',
  estNew.peopleAhead > estWaiting1.peopleAhead && estNew.minutes > estWaiting1.minutes
);

// Case D: Doctor delay added to wait estimate (late by 15 minutes)
const waitBeforeDelay = estimateWait(newMedPatient.token).minutes;
hospitalStore.setDoctorStatus('medicine', 'late by 15 minutes');
const estWithDelay = estimateWait(newMedPatient.token);
console.log(`     Patient ${newMedPatient.token} with doctor late by 15m: ${estWithDelay.text} (delay: ${estWithDelay.doctorDelay}m)`);
assert('Doctor delay is added to estimated wait time',
  estWithDelay.doctorDelay === 15 && estWithDelay.minutes === waitBeforeDelay + 15
);

// Case E: Doctor on break until future hour
const simDate = hospitalStore.getSimDate();
const targetHour = (simDate.getHours() + 1) % 24;
const breakStr = `break until ${String(targetHour).padStart(2, '0')}:00`;
hospitalStore.setDoctorStatus('medicine', breakStr);
const estBreak = estimateWait(newMedPatient.token);
console.log(`     Patient ${newMedPatient.token} with doctor '${breakStr}': delay=${estBreak.doctorDelay}m, wait=${estBreak.text}`);
assert('Doctor break delay is calculated and added to wait estimate', estBreak.doctorDelay > 0 && estBreak.minutes > 0);

// Reset doctor status back to available
hospitalStore.setDoctorStatus('medicine', 'available');

// ─── TEST 3: Queue Moves & Patient Statuses ─────────────────────────────────
console.log('\nTest 3: Queue Moves & State Transitions');

// Action 1: callNext
const prevWaitingCount = hospitalStore.getState().patients.filter(p => p.dept === 'medicine' && p.status === 'waiting').length;
const called = hospitalStore.callNext('medicine');
assert('callNext transitions next waiting patient to inroom/called',
  called && (called.status === 'inroom' || called.status === 'called') && called.calledAt !== null
);
console.log(`     Called patient: ${called.token} (${called.firstName}), status: ${called.status}`);

const newWaitingCount = hospitalStore.getState().patients.filter(p => p.dept === 'medicine' && p.status === 'waiting').length;
assert('Waiting count decrements when patient is called', newWaitingCount === prevWaitingCount - 1);

// Verify wait estimate for patient behind decreases
const estAfterCall = estimateWait(newMedPatient.token);
assert('Wait estimate recomputes and decreases when patient ahead is called',
  estAfterCall.peopleAhead < estNew.peopleAhead
);

// Action 2: sendToEnd on a patient in the middle of the queue
const queueBeforeSend = [...hospitalStore.getState().queueOrder.medicine];
const targetToSend = queueBeforeSend[1]; // patient near front
hospitalStore.sendToEnd(targetToSend);
const queueAfterSend = hospitalStore.getState().queueOrder.medicine;

assert('sendToEnd moves patient token to the end of department queueOrder',
  queueAfterSend[queueAfterSend.length - 1] === targetToSend &&
  queueAfterSend[1] !== targetToSend
);
console.log(`     sendToEnd(${targetToSend}): was position 1, now last position ${queueAfterSend.length - 1}`);

// Action 3: markNoShow
hospitalStore.markNoShow(targetToSend);
const noShowPatient = hospitalStore.getState().patients.find(p => p.token === targetToSend);
assert('markNoShow marks patient status as noshow', noShowPatient && noShowPatient.status === 'noshow');
console.log(`     Marked ${targetToSend} as noshow, status: ${noShowPatient.status}`);

// Action 4: moveToDept
const transferToken = newMedPatient.token;
hospitalStore.moveToDept(transferToken, 'bones');
const transferredPatient = hospitalStore.getState().patients.find(p => p.token === transferToken);
assert('moveToDept updates patient department and transfers token across queueOrders',
  transferredPatient.dept === 'bones' &&
  hospitalStore.getState().queueOrder.bones.includes(transferToken) &&
  !hospitalStore.getState().queueOrder.medicine.includes(transferToken)
);
console.log(`     moveToDept(${transferToken}, bones): new dept is ${transferredPatient.dept}`);

// Action 5: completeConsult
hospitalStore.completeConsult(called.token);
const completedPatient = hospitalStore.getState().patients.find(p => p.token === called.token);
assert('completeConsult marks patient as done with finishedAt timestamp',
  completedPatient.status === 'done' && completedPatient.finishedAt !== null
);
console.log(`     completeConsult(${called.token}): status=${completedPatient.status}`);

// ─── TEST 4: Simulated Clock Multiplier ──────────────────────────────────────
console.log('\nTest 4: Simulated Clock (1x vs 10x speed)');
const t1Sim = hospitalStore.getSimTime();

// Set speed to 10x
hospitalStore.setSpeed(10);
assert('setSpeed(10) updates store simSpeed to 10', hospitalStore.getState().simSpeed === 10);

// Wait a tiny synchronous delay (50ms)
const startWait = Date.now();
while (Date.now() - startWait < 50) {}

const t2Sim = hospitalStore.getSimTime();
const elapsedSim = t2Sim - t1Sim;
console.log(`     Real elapsed ~50ms, Simulated elapsed: ${Math.round(elapsedSim)}ms (speedup factor ~${Math.round(elapsedSim / 50)}x)`);
assert('Simulated clock advances at 10x speed multiplier', elapsedSim >= 400);

// Reset speed to 1
hospitalStore.setSpeed(1);
assert('setSpeed(1) returns multiplier to 1', hospitalStore.getState().simSpeed === 1);

// ─── TEST 5: Urgent Flags & SMS Inbox ────────────────────────────────────────
console.log('\nTest 5: Urgent Flags & SMS Inbox');
const flag = hospitalStore.raiseFlag({ from: 'Waiting Hall A', reason: 'Dizziness and severe headache' });
assert('raiseFlag creates urgent flag with seen: false', flag && flag.seen === false && flag.from === 'Waiting Hall A');
assert('Store records active urgent flag in urgentFlags list', hospitalStore.getState().urgentFlags.some(f => f.id === flag.id && !f.seen));

hospitalStore.markFlagSeen(flag.id);
assert('markFlagSeen updates flag seen property to true', hospitalStore.getState().urgentFlags.find(f => f.id === flag.id)?.seen === true);
console.log(`     Urgent flag ${flag.id}: seen=${hospitalStore.getState().urgentFlags.find(f => f.id === flag.id)?.seen}`);

assert('SMS inbox contains registered, transferred, and call SMS notices',
  hospitalStore.getState().smsInbox.length >= 3 &&
  hospitalStore.getState().smsInbox.some(s => s.message.includes('OPD Saathi'))
);
console.log(`     Latest SMS: "${hospitalStore.getState().smsInbox[0]?.message}"`);

// ─── TEST 6: Persistence & Hydration ────────────────────────────────────────
console.log('\nTest 6: Persistence & Reload Survival');
const savedRaw = storageAdapter.getItem(STORAGE_KEY);
assert('Whole state is serialized to localStorage under STORAGE_KEY', Boolean(savedRaw));
const parsed = JSON.parse(savedRaw);
assert('Saved state contains patients, queueOrder, counters, doctorStatus, simSpeed',
  Array.isArray(parsed.patients) &&
  typeof parsed.counters === 'object' &&
  typeof parsed.doctorStatus === 'object' &&
  typeof parsed.simSpeed === 'number'
);

// ─── Summary ─────────────────────────────────────────────────────────────────
console.log(`\n======================================================`);
console.log(` Results: ${passed} passed, ${failed} failed`);
console.log(`======================================================\n`);

if (failed > 0) {
  process.exit(1);
}
