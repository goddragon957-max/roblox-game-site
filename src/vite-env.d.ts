/// <reference types="vite/client" />

interface Window {
  __moonleafSmoke?: {
    getState: typeof import('./store/gameStore').useGameStore.getState;
    setState: typeof import('./store/gameStore').useGameStore.setState;
  };
}
