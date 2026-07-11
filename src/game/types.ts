export type Faction = 'player' | 'enemy';
export type UnitKind = 'worker' | 'soldier' | 'raider';
export type BuildingKind = 'base' | 'barracks' | 'tower' | 'enemyCamp';
export type BuildableKind = 'barracks' | 'tower';
export type ResourceType = 'gold' | 'wood';
export type GameStatus = 'playing' | 'won' | 'lost';

export interface Vec2 {
  x: number;
  z: number;
}

export type UnitOrder =
  | { type: 'idle' }
  | { type: 'move'; target: Vec2 }
  | { type: 'gather'; nodeId: string }
  | { type: 'deposit' }
  | { type: 'attack'; targetId: string }
  | { type: 'assault' };

export interface Unit {
  id: string;
  kind: UnitKind;
  faction: Faction;
  pos: Vec2;
  hp: number;
  maxHp: number;
  speed: number;
  attackDamage: number;
  attackRange: number;
  attackCooldown: number;
  cooldownLeft: number;
  order: UnitOrder;
  carry: { type: ResourceType; amount: number } | null;
  gatherProgress: number;
  lastGatherNodeId: string | null;
}

export interface Building {
  id: string;
  kind: BuildingKind;
  faction: Faction;
  pos: Vec2;
  hp: number;
  maxHp: number;
  attackDamage: number;
  attackRange: number;
  attackCooldown: number;
  cooldownLeft: number;
  trainQueue: number;
  trainProgress: number;
  rallyPoint: Vec2 | null;
  lastShotAt: number | null;
  lastShotTarget: Vec2 | null;
}

export interface ResourceNode {
  id: string;
  type: ResourceType;
  pos: Vec2;
  amountLeft: number;
  maxAmount: number;
}

export interface LogEntry {
  time: number;
  text: string;
}

export interface MatchStats {
  goldGathered: number;
  woodGathered: number;
  soldiersTrained: number;
  raidersDefeated: number;
  unitsLost: number;
}

export interface GameState {
  time: number;
  seq: number;
  gold: number;
  wood: number;
  units: Unit[];
  buildings: Building[];
  resources: ResourceNode[];
  selectedIds: string[];
  waveNumber: number;
  nextWaveAt: number;
  waveWarned: boolean;
  lastPlayerHitAt: number | null;
  lastPlayerHitPos: Vec2 | null;
  status: GameStatus;
  log: LogEntry[];
  stats: MatchStats;
}

export type MatchGrade = 'S' | 'A' | 'B' | 'C';

export interface MatchScore {
  score: number;
  grade: MatchGrade;
}

export interface MissionHint {
  step: number;
  total: number;
  title: string;
  detail: string;
}

export interface SmartTarget {
  point: Vec2;
  entityId: string | null;
}

export interface SelectionGroup {
  kind: UnitKind | BuildingKind;
  count: number;
  hp: number;
  maxHp: number;
}

export interface SelectionSummary {
  count: number;
  hp: number;
  maxHp: number;
  groups: SelectionGroup[];
}

export interface WaveForecast {
  waveNumber: number;
  size: number;
  secondsLeft: number;
  imminent: boolean;
}

export interface ThreatAlert {
  active: boolean;
  pos: Vec2 | null;
  secondsAgo: number | null;
}

export interface RangePreview {
  id: string;
  pos: Vec2;
  radius: number;
}

export interface RallyPreview {
  id: string;
  from: Vec2;
  point: Vec2;
}

export interface TowerShot {
  id: string;
  from: Vec2;
  to: Vec2;
  age: number;
}
