import type { Cell, GameState } from './types';
import { key, neighbors, same } from './grid';
export function findPath(state: GameState, start: Cell, goal = state.core): Cell[] | null {
  const q: Cell[] = [start]; const seen = new Set([key(start)]); const prev = new Map<string, Cell>();
  while (q.length) { const cur = q.shift()!; if (same(cur, goal)) { const out=[cur]; let k=key(cur); while(prev.has(k)){ const p=prev.get(k)!; out.unshift(p); k=key(p);} return out; }
    for (const n of neighbors(state, cur)) { const nk=key(n); if (seen.has(nk) || state.blocks[nk]?.type === 'wall') continue; seen.add(nk); prev.set(nk, cur); q.push(n); }
  }
  return null;
}
export function nearestWallTowardCore(state: GameState, from: Cell): string | null {
  let best: string | null = null; let bestD = Infinity;
  for (const [k,b] of Object.entries(state.blocks)) if (b.type === 'wall') { const [x,z]=k.split(',').map(Number); const d=Math.abs(x-from.x)+Math.abs(z-from.z)+Math.abs(x-state.core.x)+Math.abs(z-state.core.z); if(d<bestD){bestD=d; best=k;} }
  return best;
}
