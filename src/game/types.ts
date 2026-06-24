export type Facing = 'left' | 'right';
export type GameStatus = 'ready' | 'playing' | 'won' | 'defeated';
export type EnemyKind = 'sproutling' | 'mushroom' | 'lantern';

export type Vec2 = {
  x: number;
  y: number;
};

export type Hero = Vec2 & {
  vx: number;
  vy: number;
  width: number;
  height: number;
  facing: Facing;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  exp: number;
  expToNext: number;
  level: number;
  coins: number;
  onGround: boolean;
  invulnerableUntil: number;
  attackUntil: number;
  attackCooldownUntil: number;
};

export type Enemy = Vec2 & {
  id: string;
  kind: EnemyKind;
  vx: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  damage: number;
  exp: number;
  coins: number;
  patrolMin: number;
  patrolMax: number;
  hitUntil: number;
  defeated: boolean;
};

export type Platform = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  kind: 'grass' | 'bridge' | 'stump';
};

export type Pickup = Vec2 & {
  id: string;
  kind: 'coin' | 'mana' | 'berry';
  value: number;
  collected: boolean;
  vy: number;
};

export type FloatingText = Vec2 & {
  id: string;
  text: string;
  color: number;
  life: number;
  maxLife: number;
  vy: number;
};

export type HitSpark = Vec2 & {
  id: string;
  life: number;
  maxLife: number;
  radius: number;
};

export type GameState = {
  status: GameStatus;
  time: number;
  cameraX: number;
  worldWidth: number;
  hero: Hero;
  enemies: Enemy[];
  platforms: Platform[];
  pickups: Pickup[];
  floatingTexts: FloatingText[];
  hitSparks: HitSpark[];
  quest: {
    title: string;
    target: number;
    defeated: number;
  };
  message: string;
};

export type InputState = {
  left: boolean;
  right: boolean;
  jump: boolean;
  attack: boolean;
};
