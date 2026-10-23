/**
 * OPD Saathi – src/lib/routing.js
 *
 * Exports three public functions:
 *   findRoute(fromId, toId, options)  → route object
 *   buildDirections(route, t)         → array of human-readable step strings
 *   nearestOf(fromId, type)           → place object or null
 *
 * Designed to work in both browser (ESM) and Node.js (for test-routing.js).
 */

import { places, edges } from '../data/hospital.js';

// ─── Internal helpers ───────────────────────────────────────────────────────

/**
 * Build a bidirectional adjacency list from edges.
 * When avoidStairs is true, any edge with usesStairs === true is ignored.
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
 * Returns { dist, prev } where dist[id] is the shortest distance from `src`
 * and prev[id] is the previous node ID on the shortest path.
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
 * Reconstruct path array from prev map.
 */
function reconstructPath(prev, dest) {
  const path = [];
  let cur = dest;
  while (cur !== undefined) {
    path.unshift(cur);
    cur = prev[cur];
  }
  return path;
}

/**
 * Find the edge connecting two adjacent place IDs.
 */
function findEdge(fromId, toId) {
  return edges.find(
    e => (e.from === fromId && e.to === toId) || (e.from === toId && e.to === fromId)
  ) || null;
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * findRoute(fromId, toId, { avoidStairs })
 *
 * Runs Dijkstra from `fromId` to `toId`.
 *
 * Returns:
 *   {
 *     found:        boolean,
 *     steps:        string[],          // ordered place IDs
 *     totalMetres:  number,
 *     floorsVisited: number[],
 *     segments:     EdgeSegment[],     // edges on the path
 *   }
 *
 * If `avoidStairs` is true, edges with usesStairs === true are excluded.
 */
export function findRoute(fromId, toId, { avoidStairs = false } = {}) {
  const NOT_FOUND = { found: false, steps: [], totalMetres: 0, floorsVisited: [], segments: [] };

  if (!places[fromId] || !places[toId]) return NOT_FOUND;
  if (fromId === toId) {
    return { found: true, steps: [fromId], totalMetres: 0, floorsVisited: [places[fromId].floor], segments: [] };
  }

  const adj = buildAdj(avoidStairs);
  const { dist, prev } = dijkstra(fromId, adj);

  if (!isFinite(dist[toId])) return NOT_FOUND;

  const steps = reconstructPath(prev, toId);

  // Build segments (edge metadata for each hop)
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

  return { found: true, steps, totalMetres, floorsVisited, segments };
}

/**
 * buildDirections(route, t)
 *
 * Converts a route object (from findRoute) into an array of human-readable
 * direction strings using the i18n `t(key, vars)` function.
 *
 * Returns string[].
 */
export function buildDirections(route, t) {
  if (!route.found || route.steps.length === 0) return [];

  const directions = [];

  // Step 0: starting point
  const startPlace = places[route.steps[0]];
  if (startPlace) {
    directions.push(t('dir.startAt', { from: t(startPlace.nameKey) }));
  }

  for (let i = 1; i < route.steps.length; i++) {
    const prevId = route.steps[i - 1];
    const currId = route.steps[i];
    const curr   = places[currId];
    const prev   = places[prevId];
    const seg    = route.segments[i - 1];

    if (!curr || !seg) continue;

    const floorName =
      curr.floor === 0
        ? t('hospital.floor_0_name')
        : curr.floor === 1
          ? t('hospital.floor_1_name')
          : t('hospital.floor_2_name');

    const destName = t(curr.nameKey);

    if (seg.kind === 'lift' && curr.floor !== prev?.floor) {
      directions.push(t('dir.takeLift', { floor: floorName }));
    } else if (seg.kind === 'ramp' && curr.floor !== prev?.floor) {
      directions.push(t('dir.takeRamp', { floor: floorName }));
    } else if (seg.usesStairs && curr.floor !== prev?.floor) {
      directions.push(t('dir.takeStairs', { floor: floorName }));
    } else if (i === route.steps.length - 1) {
      directions.push(t('dir.arrive', { dest: destName }));
    } else {
      const turnKey =
        seg.turn === 'left'       ? 'dir.turnLeft'
        : seg.turn === 'right'    ? 'dir.turnRight'
        : 'dir.walkStraight';
      directions.push(t(turnKey, { to: destName, dist: seg.metres }));
    }
  }

  // Comfort tip at the end
  directions.push(t('dir.askStaff'));

  return directions;
}

/**
 * nearestOf(fromId, type, { avoidStairs })
 *
 * Finds the nearest place of the given `type` (e.g. 'toilet', 'lift', 'desk')
 * reachable from `fromId`.
 *
 * Returns the place object or null if none found.
 */
export function nearestOf(fromId, type, { avoidStairs = false } = {}) {
  if (!places[fromId]) return null;

  const adj = buildAdj(avoidStairs);
  const { dist } = dijkstra(fromId, adj);

  let best     = null;
  let bestDist = Infinity;

  for (const [id, place] of Object.entries(places)) {
    if (id === fromId) continue;
    if (place.type !== type) continue;
    const d = dist[id];
    if (isFinite(d) && d < bestDist) {
      bestDist = d;
      best     = place;
    }
  }

  return best;
}
