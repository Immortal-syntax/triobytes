/**
 * OPD Saathi - Hospital Floor & Place Data
 * Three floors with precise 360x240 coordinates and graph connectivity.
 */

export const floors = [
  {
    level: 0,
    nameKey: 'hospital.floor_0_name',
    shortKey: 'hospital.floor_0_short',
    descKey: 'hospital.floor_0_desc',
  },
  {
    level: 1,
    nameKey: 'hospital.floor_1_name',
    shortKey: 'hospital.floor_1_short',
    descKey: 'hospital.floor_1_desc',
  },
  {
    level: 2,
    nameKey: 'hospital.floor_2_name',
    shortKey: 'hospital.floor_2_short',
    descKey: 'hospital.floor_2_desc',
  },
];

/**
 * Places dictionary on a 360x240 plan.
 * Each place has: id, floor, x, y, nameKey, landmarkKey, type
 */
export const places = {
  // ================= GROUND FLOOR (Level 0) =================
  'g_entrance': {
    id: 'g_entrance',
    floor: 0,
    x: 180,
    y: 220,
    nameKey: 'hospital.place_g_entrance_name',
    landmarkKey: 'hospital.place_g_entrance_landmark',
    type: 'entrance',
  },
  'g_wheelchair': {
    id: 'g_wheelchair',
    floor: 0,
    x: 130,
    y: 220,
    nameKey: 'hospital.place_g_wheelchair_name',
    landmarkKey: 'hospital.place_g_wheelchair_landmark',
    type: 'facility',
  },
  'g_ramp': {
    id: 'g_ramp',
    floor: 0,
    x: 140,
    y: 180,
    nameKey: 'hospital.place_g_ramp_name',
    landmarkKey: 'hospital.place_g_ramp_landmark',
    type: 'ramp',
  },
  'g_lobby': {
    id: 'g_lobby',
    floor: 0,
    x: 180,
    y: 180,
    nameKey: 'hospital.place_g_lobby_name',
    landmarkKey: 'hospital.place_g_lobby_landmark',
    type: 'junction',
  },
  'g_help_desk': {
    id: 'g_help_desk',
    floor: 0,
    x: 240,
    y: 210,
    nameKey: 'hospital.place_g_help_desk_name',
    landmarkKey: 'hospital.place_g_help_desk_landmark',
    type: 'desk',
  },
  'g_reg_counters': {
    id: 'g_reg_counters',
    floor: 0,
    x: 250,
    y: 180,
    nameKey: 'hospital.place_g_reg_counters_name',
    landmarkKey: 'hospital.place_g_reg_counters_landmark',
    type: 'desk',
  },
  'g_casualty': {
    id: 'g_casualty',
    floor: 0,
    x: 50,
    y: 180,
    nameKey: 'hospital.place_g_casualty_name',
    landmarkKey: 'hospital.place_g_casualty_landmark',
    type: 'emergency',
  },
  'g_pharmacy': {
    id: 'g_pharmacy',
    floor: 0,
    x: 310,
    y: 150,
    nameKey: 'hospital.place_g_pharmacy_name',
    landmarkKey: 'hospital.place_g_pharmacy_landmark',
    type: 'pharmacy',
  },
  'g_water': {
    id: 'g_water',
    floor: 0,
    x: 180,
    y: 140,
    nameKey: 'hospital.place_g_water_name',
    landmarkKey: 'hospital.place_g_water_landmark',
    type: 'water',
  },
  'g_lift': {
    id: 'g_lift',
    floor: 0,
    x: 130,
    y: 110,
    nameKey: 'hospital.place_g_lift_name',
    landmarkKey: 'hospital.place_g_lift_landmark',
    type: 'lift',
  },
  'g_stairs': {
    id: 'g_stairs',
    floor: 0,
    x: 230,
    y: 110,
    nameKey: 'hospital.place_g_stairs_name',
    landmarkKey: 'hospital.place_g_stairs_landmark',
    type: 'stairs',
  },
  'g_toilets': {
    id: 'g_toilets',
    floor: 0,
    x: 50,
    y: 110,
    nameKey: 'hospital.place_g_toilets_name',
    landmarkKey: 'hospital.place_g_toilets_landmark',
    type: 'toilet',
  },
  'g_lab': {
    id: 'g_lab',
    floor: 0,
    x: 60,
    y: 50,
    nameKey: 'hospital.place_g_lab_name',
    landmarkKey: 'hospital.place_g_lab_landmark',
    type: 'room',
  },
  'g_xray': {
    id: 'g_xray',
    floor: 0,
    x: 300,
    y: 50,
    nameKey: 'hospital.place_g_xray_name',
    landmarkKey: 'hospital.place_g_xray_landmark',
    type: 'room',
  },

  // ================= FIRST FLOOR (Level 1) =================
  'f1_lift': {
    id: 'f1_lift',
    floor: 1,
    x: 130,
    y: 110,
    nameKey: 'hospital.place_f1_lift_name',
    landmarkKey: 'hospital.place_f1_lift_landmark',
    type: 'lift',
  },
  'f1_stairs': {
    id: 'f1_stairs',
    floor: 1,
    x: 230,
    y: 110,
    nameKey: 'hospital.place_f1_stairs_name',
    landmarkKey: 'hospital.place_f1_stairs_landmark',
    type: 'stairs',
  },
  'f1_waiting_a': {
    id: 'f1_waiting_a',
    floor: 1,
    x: 180,
    y: 120,
    nameKey: 'hospital.place_f1_waiting_a_name',
    landmarkKey: 'hospital.place_f1_waiting_a_landmark',
    type: 'hall',
  },
  'f1_toilets': {
    id: 'f1_toilets',
    floor: 1,
    x: 50,
    y: 110,
    nameKey: 'hospital.place_f1_toilets_name',
    landmarkKey: 'hospital.place_f1_toilets_landmark',
    type: 'toilet',
  },
  'f1_room_1': {
    id: 'f1_room_1',
    floor: 1,
    x: 50,
    y: 50,
    nameKey: 'hospital.place_f1_room_1_name',
    landmarkKey: 'hospital.place_f1_room_1_landmark',
    type: 'room',
  },
  'f1_room_2': {
    id: 'f1_room_2',
    floor: 1,
    x: 110,
    y: 50,
    nameKey: 'hospital.place_f1_room_2_name',
    landmarkKey: 'hospital.place_f1_room_2_landmark',
    type: 'room',
  },
  'f1_room_3': {
    id: 'f1_room_3',
    floor: 1,
    x: 170,
    y: 50,
    nameKey: 'hospital.place_f1_room_3_name',
    landmarkKey: 'hospital.place_f1_room_3_landmark',
    type: 'room',
  },
  'f1_room_4': {
    id: 'f1_room_4',
    floor: 1,
    x: 230,
    y: 50,
    nameKey: 'hospital.place_f1_room_4_name',
    landmarkKey: 'hospital.place_f1_room_4_landmark',
    type: 'room',
  },
  'f1_room_5': {
    id: 'f1_room_5',
    floor: 1,
    x: 290,
    y: 50,
    nameKey: 'hospital.place_f1_room_5_name',
    landmarkKey: 'hospital.place_f1_room_5_landmark',
    type: 'room',
  },
  'f1_room_6': {
    id: 'f1_room_6',
    floor: 1,
    x: 290,
    y: 190,
    nameKey: 'hospital.place_f1_room_6_name',
    landmarkKey: 'hospital.place_f1_room_6_landmark',
    type: 'room',
  },
  'f1_room_7': {
    id: 'f1_room_7',
    floor: 1,
    x: 210,
    y: 190,
    nameKey: 'hospital.place_f1_room_7_name',
    landmarkKey: 'hospital.place_f1_room_7_landmark',
    type: 'room',
  },
  'f1_room_8': {
    id: 'f1_room_8',
    floor: 1,
    x: 110,
    y: 190,
    nameKey: 'hospital.place_f1_room_8_name',
    landmarkKey: 'hospital.place_f1_room_8_landmark',
    type: 'room',
  },

  // ================= SECOND FLOOR (Level 2) =================
  'f2_lift': {
    id: 'f2_lift',
    floor: 2,
    x: 130,
    y: 110,
    nameKey: 'hospital.place_f2_lift_name',
    landmarkKey: 'hospital.place_f2_lift_landmark',
    type: 'lift',
  },
  'f2_stairs': {
    id: 'f2_stairs',
    floor: 2,
    x: 230,
    y: 110,
    nameKey: 'hospital.place_f2_stairs_name',
    landmarkKey: 'hospital.place_f2_stairs_landmark',
    type: 'stairs',
  },
  'f2_nurse_station': {
    id: 'f2_nurse_station',
    floor: 2,
    x: 180,
    y: 120,
    nameKey: 'hospital.place_f2_nurse_station_name',
    landmarkKey: 'hospital.place_f2_nurse_station_landmark',
    type: 'desk',
  },
  'f2_ward_4': {
    id: 'f2_ward_4',
    floor: 2,
    x: 70,
    y: 60,
    nameKey: 'hospital.place_f2_ward_4_name',
    landmarkKey: 'hospital.place_f2_ward_4_landmark',
    type: 'room',
  },
  'f2_ward_5': {
    id: 'f2_ward_5',
    floor: 2,
    x: 290,
    y: 60,
    nameKey: 'hospital.place_f2_ward_5_name',
    landmarkKey: 'hospital.place_f2_ward_5_landmark',
    type: 'room',
  },
  'f2_ward_6': {
    id: 'f2_ward_6',
    floor: 2,
    x: 180,
    y: 190,
    nameKey: 'hospital.place_f2_ward_6_name',
    landmarkKey: 'hospital.place_f2_ward_6_landmark',
    type: 'room',
  },
};

/**
 * Undirected graph edges with distance, stairs flag, kind, turn & door hints.
 * Each edge: { from, to, metres, usesStairs, kind, turn, doorHint, landmarkKey }
 */
export const edges = [
  // --- Ground Floor (Level 0) Connections ---
  {
    from: 'g_entrance',
    to: 'g_wheelchair',
    metres: 5,
    usesStairs: false,
    kind: 'corridor',
    turn: 'left',
    doorHint: 'right beside Gate 1 security',
    landmarkKey: 'hospital.edge_entrance_wheelchair',
  },
  {
    from: 'g_entrance',
    to: 'g_help_desk',
    metres: 6,
    usesStairs: false,
    kind: 'corridor',
    turn: 'right',
    doorHint: 'first counter on your right',
    landmarkKey: 'hospital.edge_entrance_help_desk',
  },
  {
    from: 'g_entrance',
    to: 'g_lobby',
    metres: 8,
    usesStairs: false,
    kind: 'corridor',
    turn: 'straight',
    doorHint: 'through the main glass doors',
    landmarkKey: 'hospital.edge_entrance_lobby',
  },
  {
    from: 'g_entrance',
    to: 'g_ramp',
    metres: 7,
    usesStairs: false,
    kind: 'ramp',
    turn: 'slight_left',
    doorHint: 'gentle step-free incline towards the lift',
    landmarkKey: 'hospital.edge_entrance_ramp',
  },
  {
    from: 'g_ramp',
    to: 'g_lift',
    metres: 10,
    usesStairs: false,
    kind: 'ramp',
    turn: 'straight',
    doorHint: 'step-free path directly to the lift doors',
    landmarkKey: 'hospital.edge_ramp_lift',
  },
  {
    from: 'g_lobby',
    to: 'g_casualty',
    metres: 15,
    usesStairs: false,
    kind: 'corridor',
    turn: 'left',
    doorHint: 'follow the red emergency floor tape to Room E1',
    landmarkKey: 'hospital.edge_lobby_casualty',
  },
  {
    from: 'g_lobby',
    to: 'g_reg_counters',
    metres: 8,
    usesStairs: false,
    kind: 'corridor',
    turn: 'right',
    doorHint: 'Counter 1 through 4 under the blue board',
    landmarkKey: 'hospital.edge_lobby_reg',
  },
  {
    from: 'g_reg_counters',
    to: 'g_pharmacy',
    metres: 12,
    usesStairs: false,
    kind: 'corridor',
    turn: 'straight',
    doorHint: 'past counter 4 to medicine dispensary window',
    landmarkKey: 'hospital.edge_reg_pharmacy',
  },
  {
    from: 'g_lobby',
    to: 'g_water',
    metres: 6,
    usesStairs: false,
    kind: 'corridor',
    turn: 'straight',
    doorHint: 'beside the central corridor notice board',
    landmarkKey: 'hospital.edge_lobby_water',
  },
  {
    from: 'g_water',
    to: 'g_lift',
    metres: 7,
    usesStairs: false,
    kind: 'corridor',
    turn: 'slight_left',
    doorHint: 'doors with braille buttons and audio chime',
    landmarkKey: 'hospital.edge_water_lift',
  },
  {
    from: 'g_water',
    to: 'g_stairs',
    metres: 8,
    usesStairs: false, // access corridor to stairs
    kind: 'corridor',
    turn: 'slight_right',
    doorHint: 'wide staircase with yellow step edges',
    landmarkKey: 'hospital.edge_water_stairs',
  },
  {
    from: 'g_lobby',
    to: 'g_toilets',
    metres: 16,
    usesStairs: false,
    kind: 'corridor',
    turn: 'left',
    doorHint: 'marked with accessible wheelchair and gender symbols',
    landmarkKey: 'hospital.edge_lobby_toilets',
  },
  {
    from: 'g_toilets',
    to: 'g_lab',
    metres: 12,
    usesStairs: false,
    kind: 'corridor',
    turn: 'right',
    doorHint: 'door on your left marked Blood Collection / Pathology',
    landmarkKey: 'hospital.edge_toilets_lab',
  },
  {
    from: 'g_pharmacy',
    to: 'g_xray',
    metres: 14,
    usesStairs: false,
    kind: 'corridor',
    turn: 'straight',
    doorHint: 'heavy shielded door with radiation warning sign',
    landmarkKey: 'hospital.edge_pharmacy_xray',
  },
  {
    from: 'g_stairs',
    to: 'g_xray',
    metres: 15,
    usesStairs: false,
    kind: 'corridor',
    turn: 'right',
    doorHint: 'end of the east corridor',
    landmarkKey: 'hospital.edge_stairs_xray',
  },
  {
    from: 'g_lift',
    to: 'g_lab',
    metres: 14,
    usesStairs: false,
    kind: 'corridor',
    turn: 'left',
    doorHint: 'down the west corridor towards the lab',
    landmarkKey: 'hospital.edge_lift_lab',
  },

  // --- Vertical Transitions Between Floors ---
  // Lifts connect adjacent floors (usesStairs: false)
  {
    from: 'g_lift',
    to: 'f1_lift',
    metres: 10,
    usesStairs: false,
    kind: 'lift',
    turn: 'straight',
    doorHint: 'exit the lift doors onto the first floor lobby',
    landmarkKey: 'hospital.edge_lift_g_f1',
  },
  {
    from: 'f1_lift',
    to: 'f2_lift',
    metres: 10,
    usesStairs: false,
    kind: 'lift',
    turn: 'straight',
    doorHint: 'exit the lift doors onto the second floor lobby',
    landmarkKey: 'hospital.edge_lift_f1_f2',
  },

  // Stairs connect adjacent floors (usesStairs: true)
  {
    from: 'g_stairs',
    to: 'f1_stairs',
    metres: 15,
    usesStairs: true,
    kind: 'stairs',
    turn: 'straight',
    doorHint: 'climb 22 steps to the first floor landing',
    landmarkKey: 'hospital.edge_stairs_g_f1',
  },
  {
    from: 'f1_stairs',
    to: 'f2_stairs',
    metres: 15,
    usesStairs: true,
    kind: 'stairs',
    turn: 'straight',
    doorHint: 'climb 22 steps to the second floor landing',
    landmarkKey: 'hospital.edge_stairs_f1_f2',
  },

  // --- First Floor (Level 1) Connections ---
  {
    from: 'f1_lift',
    to: 'f1_waiting_a',
    metres: 6,
    usesStairs: false,
    kind: 'corridor',
    turn: 'right',
    doorHint: 'into Waiting Hall A with rows of blue chairs',
    landmarkKey: 'hospital.edge_f1_lift_waiting',
  },
  {
    from: 'f1_stairs',
    to: 'f1_waiting_a',
    metres: 7,
    usesStairs: false,
    kind: 'corridor',
    turn: 'left',
    doorHint: 'from stairs landing into central waiting area',
    landmarkKey: 'hospital.edge_f1_stairs_waiting',
  },
  {
    from: 'f1_waiting_a',
    to: 'f1_toilets',
    metres: 15,
    usesStairs: false,
    kind: 'corridor',
    turn: 'left',
    doorHint: 'at the far west end of the corridor',
    landmarkKey: 'hospital.edge_f1_waiting_toilets',
  },
  {
    from: 'f1_waiting_a',
    to: 'f1_room_1',
    metres: 16,
    usesStairs: false,
    kind: 'corridor',
    turn: 'left',
    doorHint: 'first door on your left, marked General Medicine 1',
    landmarkKey: 'hospital.edge_f1_waiting_r1',
  },
  {
    from: 'f1_waiting_a',
    to: 'f1_room_2',
    metres: 12,
    usesStairs: false,
    kind: 'corridor',
    turn: 'slight_left',
    doorHint: 'second door on your left, marked General Medicine 2',
    landmarkKey: 'hospital.edge_f1_waiting_r2',
  },
  {
    from: 'f1_waiting_a',
    to: 'f1_room_3',
    metres: 9,
    usesStairs: false,
    kind: 'corridor',
    turn: 'straight',
    doorHint: 'third door on your left, opposite the blue chairs (Children)',
    landmarkKey: 'hospital.edge_f1_waiting_r3',
  },
  {
    from: 'f1_waiting_a',
    to: 'f1_room_4',
    metres: 9,
    usesStairs: false,
    kind: 'corridor',
    turn: 'straight',
    doorHint: 'fourth door on your right, marked Women and Pregnancy',
    landmarkKey: 'hospital.edge_f1_waiting_r4',
  },
  {
    from: 'f1_waiting_a',
    to: 'f1_room_5',
    metres: 14,
    usesStairs: false,
    kind: 'corridor',
    turn: 'right',
    doorHint: 'fifth door at north-east end, marked Bones and Joints (Orthopaedics)',
    landmarkKey: 'hospital.edge_f1_waiting_r5',
  },
  {
    from: 'f1_waiting_a',
    to: 'f1_room_6',
    metres: 15,
    usesStairs: false,
    kind: 'corridor',
    turn: 'slight_right',
    doorHint: 'south-east corner door, marked Ear, Nose & Throat',
    landmarkKey: 'hospital.edge_f1_waiting_r6',
  },
  {
    from: 'f1_waiting_a',
    to: 'f1_room_7',
    metres: 11,
    usesStairs: false,
    kind: 'corridor',
    turn: 'right',
    doorHint: 'south corridor door, marked Eyes (Ophthalmology)',
    landmarkKey: 'hospital.edge_f1_waiting_r7',
  },
  {
    from: 'f1_waiting_a',
    to: 'f1_room_8',
    metres: 11,
    usesStairs: false,
    kind: 'corridor',
    turn: 'left',
    doorHint: 'south-west corridor door, marked Skin Clinic',
    landmarkKey: 'hospital.edge_f1_waiting_r8',
  },
  // Floor 1 inter-room corridor connections for realistic navigation
  {
    from: 'f1_room_1',
    to: 'f1_room_2',
    metres: 6,
    usesStairs: false,
    kind: 'corridor',
    turn: 'straight',
    doorHint: 'next door along the north corridor',
    landmarkKey: 'hospital.edge_f1_r1_r2',
  },
  {
    from: 'f1_room_2',
    to: 'f1_room_3',
    metres: 6,
    usesStairs: false,
    kind: 'corridor',
    turn: 'straight',
    doorHint: 'next door along the north corridor',
    landmarkKey: 'hospital.edge_f1_r2_r3',
  },
  {
    from: 'f1_room_3',
    to: 'f1_room_4',
    metres: 6,
    usesStairs: false,
    kind: 'corridor',
    turn: 'straight',
    doorHint: 'next door along the north corridor',
    landmarkKey: 'hospital.edge_f1_r3_r4',
  },
  {
    from: 'f1_room_4',
    to: 'f1_room_5',
    metres: 6,
    usesStairs: false,
    kind: 'corridor',
    turn: 'straight',
    doorHint: 'next door along the north corridor',
    landmarkKey: 'hospital.edge_f1_r4_r5',
  },
  {
    from: 'f1_room_6',
    to: 'f1_room_7',
    metres: 8,
    usesStairs: false,
    kind: 'corridor',
    turn: 'straight',
    doorHint: 'next door along the south corridor',
    landmarkKey: 'hospital.edge_f1_r6_r7',
  },
  {
    from: 'f1_room_7',
    to: 'f1_room_8',
    metres: 10,
    usesStairs: false,
    kind: 'corridor',
    turn: 'straight',
    doorHint: 'next door along the south corridor',
    landmarkKey: 'hospital.edge_f1_r7_r8',
  },

  // --- Second Floor (Level 2) Connections ---
  {
    from: 'f2_lift',
    to: 'f2_nurse_station',
    metres: 6,
    usesStairs: false,
    kind: 'corridor',
    turn: 'right',
    doorHint: 'open curved counter with staff and monitoring displays',
    landmarkKey: 'hospital.edge_f2_lift_nurse',
  },
  {
    from: 'f2_stairs',
    to: 'f2_nurse_station',
    metres: 7,
    usesStairs: false,
    kind: 'corridor',
    turn: 'left',
    doorHint: 'into the central second floor reception',
    landmarkKey: 'hospital.edge_f2_stairs_nurse',
  },
  {
    from: 'f2_nurse_station',
    to: 'f2_ward_4',
    metres: 15,
    usesStairs: false,
    kind: 'corridor',
    turn: 'left',
    doorHint: 'double swinging doors marked Ward 4 (Medicine)',
    landmarkKey: 'hospital.edge_f2_nurse_w4',
  },
  {
    from: 'f2_nurse_station',
    to: 'f2_ward_5',
    metres: 15,
    usesStairs: false,
    kind: 'corridor',
    turn: 'right',
    doorHint: 'double swinging doors marked Ward 5 (Surgery)',
    landmarkKey: 'hospital.edge_f2_nurse_w5',
  },
  {
    from: 'f2_nurse_station',
    to: 'f2_ward_6',
    metres: 10,
    usesStairs: false,
    kind: 'corridor',
    turn: 'straight',
    doorHint: 'doors with colorful animal illustrations, Ward 6 (Children)',
    landmarkKey: 'hospital.edge_f2_nurse_w6',
  },
];

// =============================================================================
// BACKWARD-COMPAT ALIASES
// Pages import { FLOORS, MAP_NODES, MAP_EDGES, findPath } from hospital.js
// =============================================================================

export const FLOORS = floors;

const LEGACY_ID_MAP = {
  gate_1:      'g_entrance',
  casualty:    'g_casualty',
  reg_desk:    'g_reg_counters',
  g_med_1:     'g_lobby',
  g_med_2:     'g_water',
  pharmacy:    'g_pharmacy',
  g_water:     'g_water',
  g_washroom:  'g_toilets',
  g_lift:      'g_lift',
  ortho_101:   'f1_room_5',
  ortho_102:   'f1_room_5',
  eye_103:     'f1_room_7',
  ent_104:     'f1_room_6',
  paed_105:    'f1_room_3',
  f1_water:    'f1_waiting_a',
  f1_washroom: 'f1_toilets',
  f1_lift:     'f1_lift',
  gynae_201:   'f2_nurse_station',
  skin_203:    'f2_nurse_station',
  dental_204:  'f2_nurse_station',
  lab_205:     'f2_nurse_station',
};

export const MAP_NODES = (() => {
  const nodes = {};
  for (const [id, place] of Object.entries(places)) {
    nodes[id] = place;
  }
  for (const [legacyId, canonicalId] of Object.entries(LEGACY_ID_MAP)) {
    if (places[canonicalId] && !nodes[legacyId]) {
      nodes[legacyId] = { ...places[canonicalId], id: legacyId };
    }
  }
  return nodes;
})();

// MAP_EDGES adds legacy shape fields: distance, isElevator, isRamp, isStairs
export const MAP_EDGES = edges.map(e => ({
  ...e,
  distance:   e.metres,
  isElevator: e.kind === 'lift',
  isRamp:     e.kind === 'ramp',
  isStairs:   e.usesStairs,
}));

// findPath – Dijkstra, resolves legacy IDs, returns ordered node-ID array
export function findPath(startId, destId, avoidStairs = false) {
  const resolveId = id => (MAP_NODES[id] ? id : (LEGACY_ID_MAP[id] || id));
  const from = resolveId(startId);
  const to   = resolveId(destId);
  if (from === to) return [from];

  const adj = {};
  for (const edge of MAP_EDGES) {
    if (avoidStairs && edge.usesStairs) continue;
    if (!adj[edge.from]) adj[edge.from] = [];
    if (!adj[edge.to])   adj[edge.to]   = [];
    adj[edge.from].push({ id: edge.to,   cost: edge.metres });
    adj[edge.to].push(  { id: edge.from, cost: edge.metres });
  }

  const dist    = {};
  const prev    = {};
  const visited = new Set();
  for (const id of Object.keys(MAP_NODES)) dist[id] = Infinity;
  dist[from] = 0;

  const queue = [{ id: from, cost: 0 }];
  while (queue.length) {
    queue.sort((a, b) => a.cost - b.cost);
    const { id: u } = queue.shift();
    if (visited.has(u)) continue;
    visited.add(u);
    if (u === to) break;
    for (const { id: v, cost } of (adj[u] || [])) {
      if (visited.has(v)) continue;
      const alt = dist[u] + cost;
      if (alt < (dist[v] ?? Infinity)) {
        dist[v] = alt;
        prev[v] = u;
        queue.push({ id: v, cost: alt });
      }
    }
  }

  if (!isFinite(dist[to])) return [from];
  const path = [];
  let cur = to;
  while (cur !== undefined) { path.unshift(cur); cur = prev[cur]; }
  return path;
}
