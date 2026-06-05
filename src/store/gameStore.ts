import { create } from 'zustand';
import type { BlockType, Cell, GameState, RewardChoice } from '../game/types';
import { createInitialState, nextDay, placeBlock, removeBlock, restart, startRaid, tick } from '../game/simulation';

type Store = GameState & { select:(b:BlockType)=>void; place:(c:Cell)=>void; remove:(c:Cell)=>void; start:()=>void; step:()=>void; next:(reward?:RewardChoice)=>void; restartGame:()=>void; togglePause:()=>void };
export const useGameStore = create<Store>((set,get)=>({ ...createInitialState(), select:(selected)=>set({selected}), place:(c)=>set(placeBlock(get(),c)), remove:(c)=>set(removeBlock(get(),c)), start:()=>set(startRaid(get())), step:()=>set(tick(get())), next:(reward)=>set(nextDay(get(),reward)), restartGame:()=>set(restart()), togglePause:()=>set({paused:!get().paused}) }));
