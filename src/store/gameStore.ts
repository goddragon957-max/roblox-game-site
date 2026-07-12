import { create } from 'zustand';
import {
  advance,
  canAfford,
  commandSmart,
  createInitialState,
  idleWorkerIds,
  matchScore,
  missionHint,
  nextBuildSlot,
  orderPreviews,
  placeBuilding,
  playerUnitIdsInRect,
  rallyPreviews,
  selectionSummary,
  setSelection,
  threatAlert,
  towerRangePreviews,
  towerShots,
  trainSoldier,
  waveForecast,
  waveTelegraph,
  workerCarrySummary
} from '../game/simulation';
import type {
  BuildableKind,
  GameState,
  MatchScore,
  MissionHint,
  OrderPreview,
  RallyPreview,
  RangePreview,
  SelectionSummary,
  SmartTarget,
  ThreatAlert,
  TowerShot,
  UnitKind,
  Vec2,
  WaveForecast,
  WaveTelegraph,
  WorkerCarrySummary
} from '../game/types';

export interface GameStore {
  sim: GameState;
  frame: number;
  tick: (dt: number) => void;
  select: (ids: string[]) => void;
  smart: (target: SmartTarget) => void;
  build: (kind: BuildableKind) => boolean;
  train: () => boolean;
  restart: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  sim: createInitialState(),
  frame: 0,
  tick: (dt) =>
    set((store) => {
      advance(store.sim, dt);
      return { frame: store.frame + 1 };
    }),
  select: (ids) =>
    set((store) => {
      setSelection(store.sim, ids);
      return { frame: store.frame + 1 };
    }),
  smart: (target) =>
    set((store) => {
      commandSmart(store.sim, store.sim.selectedIds, target);
      return { frame: store.frame + 1 };
    }),
  build: (kind) => {
    const built = placeBuilding(get().sim, kind) !== null;
    set((store) => ({ frame: store.frame + 1 }));
    return built;
  },
  train: () => {
    const queued = trainSoldier(get().sim);
    set((store) => ({ frame: store.frame + 1 }));
    return queued;
  },
  restart: () => set((store) => ({ sim: createInitialState(), frame: store.frame + 1 }))
}));

export function affordable(sim: GameState, kind: BuildableKind | 'soldier'): boolean {
  return canAfford(sim, kind);
}

function selectByKind(kind: UnitKind): string[] {
  const store = useGameStore.getState();
  const ids = store.sim.units.filter((unit) => unit.kind === kind && unit.faction === 'player').map((unit) => unit.id);
  store.select(ids);
  return ids;
}

declare global {
  interface Window {
    __rtsSmoke?: {
      getState: typeof useGameStore.getState;
      setState: typeof useGameStore.setState;
      command: {
        selectWorkers: () => string[];
        selectSoldiers: () => string[];
        selectIdleWorkers: () => string[];
        selectRect: (x1: number, z1: number, x2: number, z2: number) => string[];
        smart: (x: number, z: number, entityId?: string | null) => void;
        build: (kind: BuildableKind) => boolean;
        train: () => boolean;
        advanceSeconds: (seconds: number) => void;
        missionHint: () => MissionHint;
        matchScore: () => MatchScore;
        waveForecast: () => WaveForecast;
        waveTelegraph: () => WaveTelegraph;
        workerCarrySummary: () => WorkerCarrySummary;
        nextBuildSlot: () => Vec2 | null;
        selectionSummary: () => SelectionSummary;
        threatAlert: () => ThreatAlert;
        towerRanges: () => RangePreview[];
        towerShots: () => TowerShot[];
        rallyPoints: () => RallyPreview[];
        orderPreviews: () => OrderPreview[];
        restart: () => void;
      };
    };
  }
}

if (typeof window !== 'undefined') {
  window.__rtsSmoke = {
    getState: useGameStore.getState,
    setState: useGameStore.setState,
    command: {
      selectWorkers: () => selectByKind('worker'),
      selectSoldiers: () => selectByKind('soldier'),
      selectIdleWorkers: () => {
        const store = useGameStore.getState();
        const ids = idleWorkerIds(store.sim);
        store.select(ids);
        return ids;
      },
      selectRect: (x1, z1, x2, z2) => {
        const store = useGameStore.getState();
        const ids = playerUnitIdsInRect(store.sim, { x: x1, z: z1 }, { x: x2, z: z2 });
        store.select(ids);
        return ids;
      },
      smart: (x, z, entityId = null) => useGameStore.getState().smart({ point: { x, z }, entityId }),
      build: (kind) => useGameStore.getState().build(kind),
      train: () => useGameStore.getState().train(),
      advanceSeconds: (seconds) => useGameStore.getState().tick(Math.max(0, Math.min(180, seconds))),
      missionHint: () => missionHint(useGameStore.getState().sim),
      matchScore: () => matchScore(useGameStore.getState().sim),
      waveForecast: () => waveForecast(useGameStore.getState().sim),
      waveTelegraph: () => waveTelegraph(useGameStore.getState().sim),
      workerCarrySummary: () => workerCarrySummary(useGameStore.getState().sim),
      nextBuildSlot: () => nextBuildSlot(useGameStore.getState().sim),
      selectionSummary: () => selectionSummary(useGameStore.getState().sim),
      threatAlert: () => threatAlert(useGameStore.getState().sim),
      towerRanges: () => towerRangePreviews(useGameStore.getState().sim),
      towerShots: () => towerShots(useGameStore.getState().sim),
      rallyPoints: () => rallyPreviews(useGameStore.getState().sim),
      orderPreviews: () => orderPreviews(useGameStore.getState().sim),
      restart: () => useGameStore.getState().restart()
    }
  };
}
