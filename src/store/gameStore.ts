import { create } from 'zustand';
import type { GameState, InputState } from '../game/types';
import { createInitialState, respawn, startGame, stepGame } from '../game/simulation';

type Store = GameState & {
  start: () => void;
  restart: () => void;
  respawn: () => void;
  step: (input: InputState, dt: number, viewportWidth?: number) => void;
};

export const useGameStore = create<Store>((set, get) => ({
  ...createInitialState(),
  start: () => set(startGame(get())),
  restart: () => set(createInitialState()),
  respawn: () => set(respawn(get())),
  step: (input, dt, viewportWidth) => set(stepGame(get(), input, dt, viewportWidth)),
}));
