/**
 * OPD Saathi - City District Hospital Data
 * Fictional Government Hospital with 3 floors
 */

export const HOSPITAL_INFO = {
  id: 'city-district-hospital',
  nameKey: 'hospital.name',
  taglineKey: 'hospital.tagline',
  addressKey: 'hospital.address',
  emergencyNumber: '112',
  ambulanceNumber: '108',
  helpdeskNumber: '011-23456789',
  opdHours: '08:00 AM - 01:00 PM',
  floorsCount: 3,
};

export const FLOORS = [
  {
    level: 0,
    nameKey: 'floors.ground.name',
    shortKey: 'floors.ground.short',
    descKey: 'floors.ground.desc',
    rooms: ['E1', 'R1', 'R2', 'R3', 'REG-1', 'PHARM-1'],
  },
  {
    level: 1,
    nameKey: 'floors.first.name',
    shortKey: 'floors.first.short',
    descKey: 'floors.first.desc',
    rooms: ['R101', 'R102', 'R103', 'R104', 'R105', 'R106'],
  },
  {
    level: 2,
    nameKey: 'floors.second.name',
    shortKey: 'floors.second.short',
    descKey: 'floors.second.desc',
    rooms: ['R201', 'R202', 'R203', 'R204', 'R205', 'R206'],
  },
];

export const MAP_NODES = {
  // Ground Floor (Level 0)
  'gate_1': { id: 'gate_1', floor: 0, x: 200, y: 360, type: 'entrance', nameKey: 'landmarks.gate1' },
  'g_lobby': { id: 'g_lobby', floor: 0, x: 200, y: 280, type: 'corridor', nameKey: 'landmarks.g_lobby' },
  'casualty': { id: 'casualty', floor: 0, x: 80, y: 280, type: 'emergency', nameKey: 'landmarks.casualty', room: 'E1' },
  'reg_desk': { id: 'reg_desk', floor: 0, x: 320, y: 280, type: 'service', nameKey: 'landmarks.reg_desk', room: 'REG-1' },
  'g_junction': { id: 'g_junction', floor: 0, x: 200, y: 200, type: 'junction', nameKey: 'landmarks.g_junction' },
  'g_water': { id: 'g_water', floor: 0, x: 130, y: 200, type: 'facility', nameKey: 'landmarks.water_cooler' },
  'g_washroom': { id: 'g_washroom', floor: 0, x: 270, y: 200, type: 'facility', nameKey: 'landmarks.washroom' },
  'g_lift': { id: 'g_lift', floor: 0, x: 150, y: 130, type: 'elevator', nameKey: 'landmarks.elevator' },
  'g_ramp': { id: 'g_ramp', floor: 0, x: 250, y: 130, type: 'ramp', nameKey: 'landmarks.ramp' },
  'g_stairs': { id: 'g_stairs', floor: 0, x: 340, y: 130, type: 'stairs', nameKey: 'landmarks.stairs' },
  'g_med_1': { id: 'g_med_1', floor: 0, x: 80, y: 80, type: 'opd', nameKey: 'landmarks.room_1', room: 'R1' },
  'g_med_2': { id: 'g_med_2', floor: 0, x: 200, y: 70, type: 'opd', nameKey: 'landmarks.room_2', room: 'R2' },
  'pharmacy': { id: 'pharmacy', floor: 0, x: 320, y: 70, type: 'pharmacy', nameKey: 'landmarks.pharmacy', room: 'PHARM-1' },

  // First Floor (Level 1)
  'f1_junction': { id: 'f1_junction', floor: 1, x: 200, y: 200, type: 'junction', nameKey: 'landmarks.f1_junction' },
  'f1_lift': { id: 'f1_lift', floor: 1, x: 150, y: 130, type: 'elevator', nameKey: 'landmarks.elevator' },
  'f1_ramp': { id: 'f1_ramp', floor: 1, x: 250, y: 130, type: 'ramp', nameKey: 'landmarks.ramp' },
  'f1_stairs': { id: 'f1_stairs', floor: 1, x: 340, y: 130, type: 'stairs', nameKey: 'landmarks.stairs' },
  'f1_waiting': { id: 'f1_waiting', floor: 1, x: 200, y: 280, type: 'corridor', nameKey: 'landmarks.f1_waiting' },
  'f1_water': { id: 'f1_water', floor: 1, x: 130, y: 280, type: 'facility', nameKey: 'landmarks.water_cooler' },
  'f1_washroom': { id: 'f1_washroom', floor: 1, x: 270, y: 280, type: 'facility', nameKey: 'landmarks.washroom' },
  'ortho_101': { id: 'ortho_101', floor: 1, x: 80, y: 80, type: 'opd', nameKey: 'landmarks.room_101', room: 'R101' },
  'ortho_102': { id: 'ortho_102', floor: 1, x: 80, y: 160, type: 'opd', nameKey: 'landmarks.room_102', room: 'R102' },
  'eye_103': { id: 'eye_103', floor: 1, x: 200, y: 70, type: 'opd', nameKey: 'landmarks.room_103', room: 'R103' },
  'ent_104': { id: 'ent_104', floor: 1, x: 320, y: 70, type: 'opd', nameKey: 'landmarks.room_104', room: 'R104' },
  'paed_105': { id: 'paed_105', floor: 1, x: 320, y: 160, type: 'opd', nameKey: 'landmarks.room_105', room: 'R105' },

  // Second Floor (Level 2)
  'f2_junction': { id: 'f2_junction', floor: 2, x: 200, y: 200, type: 'junction', nameKey: 'landmarks.f2_junction' },
  'f2_lift': { id: 'f2_lift', floor: 2, x: 150, y: 130, type: 'elevator', nameKey: 'landmarks.elevator' },
  'f2_ramp': { id: 'f2_ramp', floor: 2, x: 250, y: 130, type: 'ramp', nameKey: 'landmarks.ramp' },
  'f2_stairs': { id: 'f2_stairs', floor: 2, x: 340, y: 130, type: 'stairs', nameKey: 'landmarks.stairs' },
  'f2_waiting': { id: 'f2_waiting', floor: 2, x: 200, y: 280, type: 'corridor', nameKey: 'landmarks.f2_waiting' },
  'gynae_201': { id: 'gynae_201', floor: 2, x: 80, y: 80, type: 'opd', nameKey: 'landmarks.room_201', room: 'R201' },
  'skin_203': { id: 'skin_203', floor: 2, x: 200, y: 70, type: 'opd', nameKey: 'landmarks.room_203', room: 'R203' },
  'dental_204': { id: 'dental_204', floor: 2, x: 320, y: 70, type: 'opd', nameKey: 'landmarks.room_204', room: 'R204' },
  'lab_205': { id: 'lab_205', floor: 2, x: 320, y: 160, type: 'service', nameKey: 'landmarks.room_205', room: 'R205' },
};

export const MAP_EDGES = [
  // Ground Floor Connections
  { from: 'gate_1', to: 'g_lobby', distance: 10, accessible: true },
  { from: 'g_lobby', to: 'casualty', distance: 12, accessible: true, isEmergencyRoute: true },
  { from: 'g_lobby', to: 'reg_desk', distance: 12, accessible: true },
  { from: 'g_lobby', to: 'g_junction', distance: 10, accessible: true },
  { from: 'g_junction', to: 'g_water', distance: 7, accessible: true },
  { from: 'g_junction', to: 'g_washroom', distance: 7, accessible: true },
  { from: 'g_junction', to: 'g_lift', distance: 10, accessible: true, isElevator: true },
  { from: 'g_junction', to: 'g_ramp', distance: 12, accessible: true, isRamp: true },
  { from: 'g_junction', to: 'g_stairs', distance: 15, accessible: false, isStairs: true },
  { from: 'g_lift', to: 'g_med_1', distance: 10, accessible: true },
  { from: 'g_junction', to: 'g_med_2', distance: 14, accessible: true },
  { from: 'g_ramp', to: 'pharmacy', distance: 12, accessible: true },

  // Vertical Floor Transitions (Elevator connects all 3 floors)
  { from: 'g_lift', to: 'f1_lift', distance: 15, accessible: true, isElevator: true, floorChange: 1 },
  { from: 'f1_lift', to: 'f2_lift', distance: 15, accessible: true, isElevator: true, floorChange: 1 },

  // Vertical Transitions (Ramp connects all 3 floors with gentle slope)
  { from: 'g_ramp', to: 'f1_ramp', distance: 25, accessible: true, isRamp: true, floorChange: 1 },
  { from: 'f1_ramp', to: 'f2_ramp', distance: 25, accessible: true, isRamp: true, floorChange: 1 },

  // Vertical Transitions (Stairs - NOT suitable for Kamla / avoid stairs)
  { from: 'g_stairs', to: 'f1_stairs', distance: 18, accessible: false, isStairs: true, floorChange: 1 },
  { from: 'f1_stairs', to: 'f2_stairs', distance: 18, accessible: false, isStairs: true, floorChange: 1 },

  // Floor 1 Connections
  { from: 'f1_lift', to: 'f1_junction', distance: 10, accessible: true },
  { from: 'f1_ramp', to: 'f1_junction', distance: 10, accessible: true },
  { from: 'f1_stairs', to: 'f1_junction', distance: 12, accessible: false, isStairs: true },
  { from: 'f1_junction', to: 'f1_waiting', distance: 10, accessible: true },
  { from: 'f1_waiting', to: 'f1_water', distance: 6, accessible: true },
  { from: 'f1_waiting', to: 'f1_washroom', distance: 6, accessible: true },
  { from: 'f1_junction', to: 'ortho_101', distance: 14, accessible: true },
  { from: 'f1_junction', to: 'ortho_102', distance: 12, accessible: true },
  { from: 'f1_junction', to: 'eye_103', distance: 13, accessible: true },
  { from: 'f1_junction', to: 'ent_104', distance: 14, accessible: true },
  { from: 'f1_junction', to: 'paed_105', distance: 15, accessible: true },

  // Floor 2 Connections
  { from: 'f2_lift', to: 'f2_junction', distance: 10, accessible: true },
  { from: 'f2_ramp', to: 'f2_junction', distance: 10, accessible: true },
  { from: 'f2_stairs', to: 'f2_junction', distance: 12, accessible: false, isStairs: true },
  { from: 'f2_junction', to: 'f2_waiting', distance: 10, accessible: true },
  { from: 'f2_junction', to: 'gynae_201', distance: 14, accessible: true },
  { from: 'f2_junction', to: 'skin_203', distance: 13, accessible: true },
  { from: 'f2_junction', to: 'dental_204', distance: 14, accessible: true },
  { from: 'f2_junction', to: 'lab_205', distance: 15, accessible: true },
];

/**
 * Find shortest path using Dijkstra algorithm
 * @param {string} startNodeId 
 * @param {string} endNodeId 
 * @param {boolean} avoidStairs - if true, eliminates or heavily penalizes stairs
 * @returns {Array<string>} list of node ids in path
 */
export function findPath(startNodeId, endNodeId, avoidStairs = true) {
  if (!MAP_NODES[startNodeId] || !MAP_NODES[endNodeId]) return [];
  if (startNodeId === endNodeId) return [startNodeId];

  // Build adjacency graph
  const graph = {};
  for (const nodeId of Object.keys(MAP_NODES)) {
    graph[nodeId] = [];
  }

  for (const edge of MAP_EDGES) {
    let weight = edge.distance;
    if (edge.isStairs) {
      if (avoidStairs) {
        // High penalty so ramps/lifts are strictly chosen
        weight += 10000;
      }
    } else if (edge.isElevator) {
      // Preference for elevator when avoiding stairs for elderly
      weight = Math.min(weight, 8);
    }

    graph[edge.from].push({ node: edge.to, weight, edge });
    graph[edge.to].push({ node: edge.from, weight, edge });
  }

  const distances = {};
  const previous = {};
  const unvisited = new Set(Object.keys(MAP_NODES));

  for (const nodeId of Object.keys(MAP_NODES)) {
    distances[nodeId] = Infinity;
  }
  distances[startNodeId] = 0;

  while (unvisited.size > 0) {
    let closestNode = null;
    let shortestDist = Infinity;

    for (const nodeId of unvisited) {
      if (distances[nodeId] < shortestDist) {
        shortestDist = distances[nodeId];
        closestNode = nodeId;
      }
    }

    if (!closestNode || distances[closestNode] === Infinity) break;
    if (closestNode === endNodeId) break;

    unvisited.delete(closestNode);

    for (const neighbor of graph[closestNode]) {
      if (!unvisited.has(neighbor.node)) continue;
      const alt = distances[closestNode] + neighbor.weight;
      if (alt < distances[neighbor.node]) {
        distances[neighbor.node] = alt;
        previous[neighbor.node] = closestNode;
      }
    }
  }

  const path = [];
  let curr = endNodeId;
  while (curr) {
    path.unshift(curr);
    curr = previous[curr];
  }

  return path[0] === startNodeId ? path : [];
}

/**
 * Return emergency route from any node (defaults to main entrance Gate 1)
 */
export function getEmergencyRoute(fromNodeId = 'gate_1') {
  return findPath(fromNodeId, 'casualty', true);
}
