export type Phase = 'build' | 'raid' | 'victory' | 'defeat';
export type BlockType = 'wall' | 'trap' | 'turret' | 'frost';
export type RaiderKind = 'grunt' | 'runner' | 'brute';
export type RewardChoice = 'repair' | 'turret' | 'frost';
export type SupplyChoice = 'wall-pack' | 'trap-bundle' | 'tower-kit' | 'frost-kit';
export type UpgradeChoice = 'tower-damage' | 'trap-damage' | 'frost-duration';
export type ClearGrade = { stars: 1 | 2 | 3; label: string; bonusCoins: number };
export type Cell = { x: number; z: number };
export type CombatMarkerKind = 'hit' | 'kill' | 'core';
export type CombatMarker = { id: string; kind: CombatMarkerKind; cell: Cell; ticks: number; label: string };
export type RaidPlan = {
  day: number;
  total: number;
  dangerLane: number;
  mix: Record<RaiderKind, number>;
  threat: {
    score: number;
    label: string;
    advice: string;
  };
  rewardPreview: Resources;
};
export type BuildReadiness = {
  ready: boolean;
  label: string;
  advice: string;
  recommended: Resources;
  missing: Partial<Resources>;
};
export type Block = { type: BlockType; hp: number; cooldown?: number };
export type Raider = {
  id: string;
  kind: RaiderKind;
  cell: Cell;
  hp: number;
  maxHp: number;
  speed: number;
  bounty: number;
  slowed?: number;
  path: Cell[];
  pathIndex: number;
  resolved?: boolean;
  attackCooldown: number;
};
export type Resources = Record<BlockType, number>;
export type RewardOption = {
  id: RewardChoice;
  title: string;
  description: string;
  resources: Partial<Resources>;
  coreRepair: number;
};
export type SupplyOption = {
  id: SupplyChoice;
  title: string;
  description: string;
  cost: number;
  resources: Partial<Resources>;
};
export type Upgrades = {
  towerDamage: number;
  trapDamage: number;
  frostDuration: number;
};
export type UpgradeOption = {
  id: UpgradeChoice;
  title: string;
  description: string;
  cost: number;
  maxLevel: number;
};
export type GameState = {
  day: number;
  phase: Phase;
  paused: boolean;
  size: number;
  core: Cell;
  coreHp: number;
  maxCoreHp: number;
  resources: Resources;
  selected: BlockType;
  blocks: Record<string, Block>;
  raiders: Raider[];
  totalRaiders: number;
  coins: number;
  upgrades: Upgrades;
  kills: number;
  coreHits: number;
  combo: number;
  lastClearGrade?: ClearGrade;
  combatMarkers: CombatMarker[];
  combatLog: string[];
  dangerLane: number;
  message: string;
};
