import { describe, expect, it } from 'vitest';
import { createInitialState, nextDay, placeBlock, startRaid, tick } from '../simulation';
import { findPath } from '../pathfinding';

describe('Blockhold game logic',()=>{
 it('placing wall consumes resource and updates grid',()=>{const s=placeBlock(createInitialState(),{x:1,z:1},'wall'); expect(s.resources.wall).toBe(5); expect(s.blocks['1,1'].type).toBe('wall')});
 it('cannot place outside bounds, on core, or without resource',()=>{let s=createInitialState(); expect(placeBlock(s,{x:-1,z:0},'wall')).toBe(s); expect(placeBlock(s,s.core,'wall')).toBe(s); s={...s,resources:{...s.resources,wall:0}}; expect(placeBlock(s,{x:1,z:1},'wall')).toBe(s)});
 it('BFS returns a path when open',()=>{const s=createInitialState(); expect(findPath(s,{x:4,z:0})?.at(-1)).toEqual(s.core)});
 it('trap damages raider when crossed',()=>{let s=placeBlock(createInitialState(),{x:4,z:1},'trap'); s=startRaid(s); s=tick(s); const damagedOrDead=s.raiders.some(r=>r.hp<2||r.resolved); expect(damagedOrDead).toBe(true)});
 it('no-path case breaches a wall instead of freezing',()=>{let s=createInitialState(); [{x:4,z:3},{x:4,z:5},{x:3,z:4},{x:5,z:4}].forEach(c=>{s={...s,resources:{...s.resources,wall:99}}; s=placeBlock(s,c,'wall')}); s=startRaid(s); const before=Object.values(s.blocks).reduce((a,b)=>a+b.hp,0); s=tick(s); const after=Object.values(s.blocks).reduce((a,b)=>a+b.hp,0); expect(after).toBeLessThan(before)});
 it('victory when all raiders are resolved and core survives',()=>{let s=startRaid(createInitialState()); s={...s,raiders:s.raiders.map(r=>({...r,resolved:true}))}; expect(tick(s).phase).toBe('victory')});
 it('defeat when core HP reaches 0',()=>{let s=startRaid(createInitialState()); s={...s,coreHp:1,raiders:[{...s.raiders[0],cell:s.core,resolved:false}]}; expect(tick(s).phase).toBe('defeat')});
 it('next day grants resources and increases raid pressure',()=>{let s=nextDay({...createInitialState(),phase:'victory'}); expect(s.day).toBe(2); expect(s.resources.wall).toBeGreaterThan(6); expect(startRaid(s).totalRaiders).toBeGreaterThan(5)});
});
