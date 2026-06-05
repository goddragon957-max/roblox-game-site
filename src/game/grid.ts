import type { Cell, GameState } from './types';
export const key = (c: Cell) => `${c.x},${c.z}`;
export const same = (a: Cell, b: Cell) => a.x === b.x && a.z === b.z;
export const inside = (s: GameState | {size:number}, c: Cell) => c.x >= 0 && c.z >= 0 && c.x < s.size && c.z < s.size;
export const neighbors = (s: GameState | {size:number}, c: Cell) => [{x:c.x+1,z:c.z},{x:c.x-1,z:c.z},{x:c.x,z:c.z+1},{x:c.x,z:c.z-1}].filter(n=>inside(s,n));
