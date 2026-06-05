export type Phase = 'build' | 'raid' | 'victory' | 'defeat';
export type BlockType = 'wall' | 'trap';
export type Cell = { x: number; z: number };
export type Block = { type: BlockType; hp: number };
export type Raider = { id: string; cell: Cell; hp: number; speed: number; path: Cell[]; pathIndex: number; resolved?: boolean; attackCooldown: number };
export type GameState = { day: number; phase: Phase; paused: boolean; size: number; core: Cell; coreHp: number; maxCoreHp: number; resources: Record<BlockType, number>; selected: BlockType; blocks: Record<string, Block>; raiders: Raider[]; totalRaiders: number; message: string };
