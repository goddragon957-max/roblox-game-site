import type { BlockType, Cell, GameState, Raider } from './types';
import { inside, key, same } from './grid';
import { findPath, nearestWallTowardCore } from './pathfinding';

export function createInitialState(): GameState { return { day:1, phase:'build', paused:false, size:9, core:{x:4,z:4}, coreHp:100, maxCoreHp:100, resources:{wall:6, trap:3}, selected:'wall', blocks:{}, raiders:[], totalRaiders:0, message:'벽과 함정을 배치한 뒤 Start Raid를 누르세요.' }; }
export function placeBlock(state: GameState, cell: Cell, type = state.selected): GameState { if(state.phase!=='build'||!inside(state,cell)||same(cell,state.core)||state.blocks[key(cell)]||state.resources[type]<=0) return state; return {...state, resources:{...state.resources,[type]:state.resources[type]-1}, blocks:{...state.blocks,[key(cell)]:{type, hp:type==='wall'?3:1}}, message:`${type==='wall'?'Wall':'Trap'} placed`}; }
export function removeBlock(state: GameState, cell: Cell): GameState { if(state.phase!=='build') return state; const k=key(cell); const b=state.blocks[k]; if(!b) return state; const blocks={...state.blocks}; delete blocks[k]; return {...state, blocks, resources:{...state.resources,[b.type]:state.resources[b.type]+1}, message:'Block removed'}; }
function spawnRaiders(state: GameState): Raider[] { const count=2+state.day*3; return Array.from({length:count},(_,i)=>({id:`r${state.day}-${i}`, cell:{x:Math.max(0,Math.min(state.size-1,state.core.x+(i%3)-1)),z:0}, hp: i%4===0?3:2, speed:1, path:[], pathIndex:0, attackCooldown:0})); }
export function startRaid(state: GameState): GameState { if(state.phase!=='build') return state; const raiders=spawnRaiders(state).map(r=>({...r,path:findPath(state,r.cell)??[]})); return {...state, phase:'raid', raiders, totalRaiders:raiders.length, message:`Night raid: ${raiders.length} raiders incoming!`}; }
export function nextDay(state: GameState): GameState { return {...state, day:state.day+1, phase:'build', resources:{wall:6+state.day*2, trap:3+Math.floor(state.day/2)}, raiders:[], totalRaiders:0, selected:'wall', message:'승리! 다음 날 방어를 보강하세요.'}; }
export function restart(): GameState { return createInitialState(); }
export function tick(state: GameState): GameState { if(state.phase!=='raid'||state.paused) return state; let next: GameState={...state, blocks:{...state.blocks}, raiders:state.raiders.map(r=>({...r, cell:{...r.cell}, path:[...r.path]}))};
  next.raiders=next.raiders.map(r=>{ if(r.resolved||r.hp<=0) return {...r,resolved:true}; if(same(r.cell,next.core)){ next.coreHp=Math.max(0,next.coreHp-12); return {...r,resolved:true}; }
    let path=findPath(next,r.cell); if(!path){ const wallKey=nearestWallTowardCore(next,r.cell); if(wallKey&&next.blocks[wallKey]){ next.blocks[wallKey]={...next.blocks[wallKey], hp:next.blocks[wallKey].hp-1}; if(next.blocks[wallKey].hp<=0) delete next.blocks[wallKey]; return {...r, attackCooldown:1}; } next.coreHp=Math.max(0,next.coreHp-5); return {...r,resolved:true}; }
    const dest=path[1]??path[0]; const k=key(dest); let hp=r.hp; if(next.blocks[k]?.type==='trap'){ hp-=2; delete next.blocks[k]; }
    return hp<=0 ? {...r, hp:0, resolved:true, cell:dest, path} : {...r, hp, cell:dest, path}; });
  if(next.coreHp<=0) return {...next, phase:'defeat', message:'코어가 파괴되었습니다. Restart로 다시 도전하세요.'};
  if(next.raiders.every(r=>r.resolved||r.hp<=0)) return {...next, phase:'victory', message:'Raid cleared! Next Day로 진행하세요.'};
  const alive=next.raiders.filter(r=>!r.resolved&&r.hp>0).length; return {...next, message:`Raid in progress · ${alive}/${next.totalRaiders} raiders active`}; }
