import { create } from 'zustand';
import {
  addFocusBurst,
  completeBirth,
  createInitialFocusState,
  type FocusState,
  tickFocus
} from '../focus/progression';

type FocusActions = {
  toggleFocus: () => void;
  addBurst: (amount?: number) => void;
  tick: (seconds: number) => void;
  birthNow: () => void;
  reset: () => void;
};

export type FocusStore = FocusState & FocusActions;

function completeIfNeeded(state: FocusState): FocusState {
  return state.progress >= 1 ? completeBirth(state) : state;
}

export const useFocusStore = create<FocusStore>((set) => ({
  ...createInitialFocusState(),
  toggleFocus: () => set((state) => ({ isFocusing: !state.isFocusing })),
  addBurst: (amount = 0.2) => set((state) => completeIfNeeded(addFocusBurst(state, amount))),
  tick: (seconds: number) => set((state) => completeIfNeeded(tickFocus(state, seconds))),
  birthNow: () => set((state) => completeBirth({ ...state, progress: 1 })),
  reset: () => set(createInitialFocusState())
}));
