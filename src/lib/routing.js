/**
 * OPD Saathi – src/lib/routing.js
 *
 * Hospital routing logic & navigation engine:
 *   1. findRoute(fromId, toId, { avoidStairs })  → Dijkstra shortest path route object
 *   2. buildDirections(route, t)                 → Rich human-readable step-by-step directions
 *   3. nearestOf(fromId, type, { avoidStairs })  → Nearest facility / place lookup
 *
 * Works in both browser (ESM) and Node.js environments.
 */

import { places, edges } from '../data/hospital.js';
import { en } from '../i18n/en.js';

// Legacy ID mapping for backward compatibility
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

/**
 * Resolve node ID (canonical or legacy) to canonical place ID.
 */
function resolveId(id) {
  if (!id) return null;
  if (places[id]) return id;
  if (LEGACY_ID_MAP[id] && places[LEGACY_ID_MAP[id]]) return LEGACY_ID_MAP[id];
  return id;
}

/**
 * Build undirected adjacency list from edges.
 * If avoidStairs is true, any edge where usesStairs === true is skipped.
 */
function buildAdj(avoidStairs) {
  const adj = {};
  for (const edge of edges) {
    if (avoidStairs && edge.usesStairs) continue;
    if (!adj[edge.from]) adj[edge.from] = [];
    if (!adj[edge.to])   adj[edge.to]   = [];
    adj[edge.from].push({ id: edge.to,   edge });
    adj[edge.to].push(  { id: edge.from, edge });
  }
  return adj;
}

/**
 * Dijkstra's algorithm over the hospital graph.
 * Returns { dist, prev } mapping where dist[id] is distance from src
 * and prev[id] is previous place ID along shortest path.
 */
function dijkstra(src, adj) {
  const dist    = {};
  const prev    = {};
  const visited = new Set();

  for (const id of Object.keys(places)) dist[id] = Infinity;
  dist[src] = 0;

  const queue = [{ id: src, cost: 0 }];

  while (queue.length) {
    queue.sort((a, b) => a.cost - b.cost);
    const { id: u } = queue.shift();
    if (visited.has(u)) continue;
    visited.add(u);

    for (const { id: v, edge } of (adj[u] || [])) {
      if (visited.has(v)) continue;
      const alt = dist[u] + edge.metres;
      if (alt < dist[v]) {
        dist[v] = alt;
        prev[v] = u;
        queue.push({ id: v, cost: alt });
      }
    }
  }

  return { dist, prev };
}

/**
 * Find the connecting edge between two adjacent places.
 */
function findEdge(fromId, toId) {
  return edges.find(
    e => (e.from === fromId && e.to === toId) || (e.from === toId && e.to === fromId)
  ) || null;
}

/**
 * findRoute(fromId, toId, { avoidStairs })
 *
 * Runs Dijkstra's algorithm to compute the shortest accessible route.
 *
 * @param {string} fromId - Starting place ID (e.g. 'g_entrance')
 * @param {string} toId - Destination place ID (e.g. 'f1_room_3')
 * @param {Object} options - Routing options { avoidStairs: boolean }
 * @returns {Object} Route result:
 *   {
 *     found: boolean,
 *     steps: string[],        // Ordered place IDs
 *     totalMetres: number,    // Sum of edge metres
 *     floorsVisited: number[],// Unique floor levels visited
 *     segments: Object[]      // Edge objects traversed
 *   }
 */
export function findRoute(fromId, toId, { avoidStairs = false } = {}) {
  const NOT_FOUND = { found: false, steps: [], totalMetres: 0, floorsVisited: [], segments: [] };

  const src = resolveId(fromId);
  const dst = resolveId(toId);

  if (!src || !dst || !places[src] || !places[dst]) return NOT_FOUND;

  if (src === dst) {
    return {
      found: true,
      steps: [src],
      totalMetres: 0,
      floorsVisited: [places[src].floor],
      segments: [],
    };
  }

  const adj = buildAdj(avoidStairs);
  const { dist, prev } = dijkstra(src, adj);

  if (!isFinite(dist[dst])) return NOT_FOUND;

  // Reconstruct path array
  const steps = [];
  let cur = dst;
  while (cur !== undefined) {
    steps.unshift(cur);
    cur = prev[cur];
  }

  // Build traversed edge segments
  const segments = [];
  let totalMetres = 0;
  for (let i = 0; i < steps.length - 1; i++) {
    const edge = findEdge(steps[i], steps[i + 1]);
    if (edge) {
      segments.push(edge);
      totalMetres += edge.metres;
    }
  }

  const floorsVisited = [...new Set(steps.map(id => places[id]?.floor).filter(f => f !== undefined))];

  return {
    found: true,
    steps,
    totalMetres,
    floorsVisited,
    segments,
  };
}

/**
 * Default fallback translation helper if t is omitted or not provided.
 */
function defaultT(key, vars = {}) {
  let str = en[key] !== undefined ? en[key] : key;
  if (vars && typeof vars === 'object') {
    for (const [k, v] of Object.entries(vars)) {
      str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
    }
  }
  return str;
}

/**
 * buildDirections(route, t)
 *
 * Converts a route object from findRoute into human-readable, landmark-rich
 * directions using i18n templates and per-edge turn & door hints stored in hospital.js.
 *
 * Example:
 *   "Take the lift to the first floor. Turn right into Waiting Hall A.
 *    OPD Room 3 is the third door on your left, opposite the blue chairs."
 *
 * @param {Object} route - Route returned by findRoute
 * @param {Function} [t] - Translation function t(key, vars)
 * @returns {string[]} Ordered human navigation steps
 */
export function buildDirections(route, t = defaultT) {
  if (!route || !route.found || !route.steps || route.steps.length === 0) {
    return [];
  }

  const safeT = typeof t === 'function' ? t : defaultT;
  const directions = [];

  // Step 0: Starting location
  const startPlace = places[route.steps[0]];
  if (startPlace) {
    const startName = safeT(startPlace.nameKey) || startPlace.id;
    directions.push(safeT('dir.startAt', { from: startName }));
  }

  for (let i = 1; i < route.steps.length; i++) {
    const prevId = route.steps[i - 1];
    const currId = route.steps[i];
    const curr   = places[currId];
    const prev   = places[prevId];
    const seg    = route.segments[i - 1];

    if (!curr || !seg) continue;

    const floorKey = `hospital.floor_${curr.floor}_name`;
    const floorName = safeT(floorKey);
    const destName  = safeT(curr.nameKey);

    // Resolve edge hint: use i18n landmarkKey if available and translated, otherwise edge doorHint
    let hint = '';
    if (seg.landmarkKey) {
      const translated = safeT(seg.landmarkKey);
      if (translated && translated !== seg.landmarkKey) {
        hint = translated;
      }
    }
    if (!hint && seg.doorHint) {
      hint = seg.doorHint;
    }

    const isFinalDestination = (i === route.steps.length - 1);

    // Vertical transitions between different floors
    if (curr.floor !== prev?.floor) {
      if (seg.kind === 'lift') {
        directions.push(safeT('dir.takeLift', { floor: floorName }));
      } else if (seg.kind === 'ramp') {
        directions.push(safeT('dir.takeRamp', { floor: floorName }));
      } else {
        directions.push(safeT('dir.takeStairs', { floor: floorName }));
      }
      continue;
    }

    // Destination step (final hop on the route)
    if (isFinalDestination) {
      if (hint) {
        const text = safeT('dir.arriveWithHint', { dest: destName, hint });
        // If template returned key without variable replacement, format directly
        directions.push(text.includes('{dest}') ? `${destName} is ${hint}.` : text);
      } else {
        directions.push(safeT('dir.arrive', { dest: destName }));
      }
      continue;
    }

    // Intermediate horizontal steps along corridors or junctions
    if (hint) {
      if (seg.turn === 'left' || seg.turn === 'slight_left') {
        const text = safeT('dir.turnLeftWithHint', { to: destName, hint, dist: seg.metres });
        directions.push(text.includes('{to}') ? `Turn left towards ${destName} - ${hint}.` : text);
      } else if (seg.turn === 'right' || seg.turn === 'slight_right') {
        const text = safeT('dir.turnRightWithHint', { to: destName, hint, dist: seg.metres });
        directions.push(text.includes('{to}') ? `Turn right towards ${destName} - ${hint}.` : text);
      } else {
        const text = safeT('dir.walkWithHint', { to: destName, hint, dist: seg.metres });
        directions.push(text.includes('{to}') ? `Walk straight towards ${destName} - ${hint} (${seg.metres}m).` : text);
      }
    } else {
      if (seg.turn === 'left' || seg.turn === 'slight_left') {
        directions.push(safeT('dir.turnLeft', { to: destName, dist: seg.metres }));
      } else if (seg.turn === 'right' || seg.turn === 'slight_right') {
        directions.push(safeT('dir.turnRight', { to: destName, dist: seg.metres }));
      } else {
        directions.push(safeT('dir.walkStraight', { to: destName, dist: seg.metres }));
      }
    }
  }

  // Comforting safety guidance at the end
  directions.push(safeT('dir.askStaff'));

  return directions;
}

/**
 * nearestOf(fromId, type, { avoidStairs })
 *
 * Finds the closest accessible place of the given type (e.g. 'help_desk', 'toilet')
 * using Dijkstra on walking distance.
 *
 * @param {string} fromId - Starting place ID
 * @param {string} type - Facility type or keyword (e.g. 'toilet', 'help_desk', 'water', 'lift')
 * @param {Object} [options] - Options { avoidStairs: boolean }
 * @returns {Object|null} Matching place object or null
 */
export function nearestOf(fromId, type, { avoidStairs = false } = {}) {
  const src = resolveId(fromId);
  if (!src || !places[src]) return null;

  const adj = buildAdj(avoidStairs);
  const { dist } = dijkstra(src, adj);

  const query = String(type || '').toLowerCase().trim();

  let best = null;
  let bestDist = Infinity;

  for (const [id, place] of Object.entries(places)) {
    if (id === src) continue;

    let isMatch = false;

    // Direct type match
    if (place.type === query) {
      isMatch = true;
    }
    // Specific help desk queries
    else if (query === 'help_desk' || query === 'helpdesk') {
      isMatch = (place.id === 'g_help_desk' || place.type === 'help_desk');
    }
    // Toilet queries
    else if (query === 'toilet' || query === 'toilets' || query === 'washroom') {
      isMatch = (place.type === 'toilet' || place.id.includes('toilet'));
    }
    // Water queries
    else if (query === 'water' || query === 'drinking_water') {
      isMatch = (place.type === 'water' || place.id.includes('water'));
    }
    // Emergency / Casualty queries
    else if (query === 'emergency' || query === 'casualty') {
      isMatch = (place.type === 'emergency' || place.id.includes('casualty'));
    }
    // General desk queries
    else if (query === 'desk') {
      isMatch = (place.type === 'desk');
    }
    // General lift queries
    else if (query === 'lift' || query === 'elevator') {
      isMatch = (place.type === 'lift');
    }
    // General stairs queries
    else if (query === 'stairs') {
      isMatch = (place.type === 'stairs');
    }
    // Fallback: place id match
    else if (place.id === query) {
      isMatch = true;
    }

    if (isMatch) {
      const d = dist[id];
      if (isFinite(d) && d < bestDist) {
        bestDist = d;
        best = place;
      }
    }
  }

  return best;
}
