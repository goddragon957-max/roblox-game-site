import type { Enemy, FloatingText, GameState, HitSpark, InputState, Pickup, Platform } from './types';

const GRAVITY = 2100;
const MOVE_SPEED = 260;
const JUMP_SPEED = 760;
const HERO_START = { x: 120, y: 440 };
const ATTACK_RANGE = 86;
const ATTACK_HEIGHT = 70;

const platforms: Platform[] = [
  { id: 'ground-start', x: 0, y: 548, width: 760, height: 72, kind: 'grass' },
  { id: 'ground-mid', x: 760, y: 586, width: 520, height: 78, kind: 'grass' },
  { id: 'ground-end', x: 1280, y: 542, width: 820, height: 78, kind: 'grass' },
  { id: 'bridge-1', x: 360, y: 426, width: 230, height: 22, kind: 'bridge' },
  { id: 'stump-1', x: 690, y: 482, width: 132, height: 24, kind: 'stump' },
  { id: 'bridge-2', x: 1080, y: 446, width: 260, height: 24, kind: 'bridge' },
  { id: 'stump-2', x: 1460, y: 398, width: 154, height: 26, kind: 'stump' },
];

function makeEnemies(): Enemy[] {
  return [
    makeEnemy('sprout-1', 'sproutling', 520, 498, 420, 650),
    makeEnemy('mushroom-1', 'mushroom', 1010, 536, 910, 1190),
    makeEnemy('lantern-1', 'lantern', 1540, 492, 1390, 1760),
  ];
}

function makeEnemy(id: string, kind: Enemy['kind'], x: number, y: number, patrolMin: number, patrolMax: number): Enemy {
  const stats = {
    sproutling: { width: 50, height: 54, hp: 28, damage: 8, exp: 18, coins: 3, vx: 60 },
    mushroom: { width: 62, height: 58, hp: 42, damage: 10, exp: 25, coins: 4, vx: -48 },
    lantern: { width: 56, height: 68, hp: 54, damage: 12, exp: 35, coins: 6, vx: 54 },
  }[kind];
  return { id, kind, x, y, patrolMin, patrolMax, maxHp: stats.hp, hitUntil: 0, defeated: false, ...stats };
}

export function createInitialState(): GameState {
  return {
    status: 'ready',
    time: 0,
    cameraX: 0,
    worldWidth: 2100,
    hero: {
      ...HERO_START,
      vx: 0,
      vy: 0,
      width: 44,
      height: 66,
      facing: 'right',
      hp: 100,
      maxHp: 100,
      mp: 54,
      maxMp: 54,
      exp: 0,
      expToNext: 60,
      level: 1,
      coins: 0,
      onGround: false,
      invulnerableUntil: 0,
      attackUntil: 0,
      attackCooldownUntil: 0,
    },
    enemies: makeEnemies(),
    platforms,
    pickups: [
      { id: 'coin-path-1', kind: 'coin', x: 414, y: 386, value: 1, collected: false, vy: 0 },
      { id: 'mana-path-1', kind: 'mana', x: 1168, y: 406, value: 14, collected: false, vy: 0 },
      { id: 'berry-path-1', kind: 'berry', x: 1518, y: 358, value: 18, collected: false, vy: 0 },
    ],
    floatingTexts: [],
    hitSparks: [],
    quest: { title: 'Clear the Moonleaf Trail', target: 3, defeated: 0 },
    message: 'Press Start or move to begin.',
  };
}

export function startGame(state: GameState): GameState {
  if (state.status === 'playing') return state;
  if (state.status === 'won' || state.status === 'defeated') return createInitialState();
  return { ...state, status: 'playing', message: 'Defeat 3 forest pests and collect trail coins.' };
}

export function respawn(state: GameState): GameState {
  return {
    ...state,
    status: 'playing',
    hero: {
      ...state.hero,
      ...HERO_START,
      vx: 0,
      vy: 0,
      hp: state.hero.maxHp,
      mp: state.hero.maxMp,
      invulnerableUntil: state.time + 1.5,
      attackUntil: 0,
      attackCooldownUntil: 0,
    },
    message: 'Respawned at Moonleaf Village. Try the jump platform route.',
  };
}

export function stepGame(state: GameState, input: InputState, rawDt: number, viewportWidth = 960): GameState {
  const dt = Math.min(rawDt, 1 / 30);
  const time = state.time + dt;
  if (state.status !== 'playing') return { ...state, time };

  let hero = { ...state.hero };
  let enemies = state.enemies.map((enemy) => ({ ...enemy }));
  let pickups = state.pickups.map((pickup) => ({ ...pickup }));
  let floatingTexts = state.floatingTexts.map((text) => ({ ...text, y: text.y + text.vy * dt, life: text.life - dt }));
  let hitSparks = state.hitSparks.map((spark) => ({ ...spark, life: spark.life - dt, radius: spark.radius + 90 * dt }));
  let defeated = state.quest.defeated;
  let message = state.message;

  const move = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  hero.vx = move * MOVE_SPEED;
  if (move < 0) hero.facing = 'left';
  if (move > 0) hero.facing = 'right';
  if (input.jump && hero.onGround) {
    hero.vy = -JUMP_SPEED;
    hero.onGround = false;
  }

  if (input.attack && time >= hero.attackCooldownUntil && hero.mp >= 6) {
    hero.attackUntil = time + 0.18;
    hero.attackCooldownUntil = time + 0.42;
    hero.mp -= 6;
    const attackLeft = hero.facing === 'right' ? hero.x + hero.width * 0.35 : hero.x - ATTACK_RANGE;
    const attackRight = hero.facing === 'right' ? hero.x + hero.width * 0.35 + ATTACK_RANGE : hero.x + hero.width * 0.35;
    const attackTop = hero.y - hero.height * 0.9;
    const attackBottom = attackTop + ATTACK_HEIGHT;
    let hitAny = false;
    enemies = enemies.map((enemy) => {
      if (enemy.defeated) return enemy;
      const enemyLeft = enemy.x - enemy.width / 2;
      const enemyRight = enemy.x + enemy.width / 2;
      const enemyTop = enemy.y - enemy.height;
      const enemyBottom = enemy.y;
      const overlaps = enemyRight >= attackLeft && enemyLeft <= attackRight && enemyBottom >= attackTop && enemyTop <= attackBottom;
      if (!overlaps) return enemy;
      hitAny = true;
      const damage = 18 + hero.level * 4;
      const hp = Math.max(0, enemy.hp - damage);
      floatingTexts.push(makeText(`-${damage}`, enemy.x, enemy.y - enemy.height - 18, 0xfff4a3, time));
      hitSparks.push(makeSpark(enemy.x + (hero.facing === 'right' ? -8 : 8), enemy.y - enemy.height * 0.52, time));
      if (hp <= 0) {
        defeated += 1;
        hero.exp += enemy.exp;
        hero.coins += enemy.coins;
        pickups.push({ id: `coin-${enemy.id}-${time}`, kind: 'coin', x: enemy.x, y: enemy.y - 34, value: enemy.coins, collected: false, vy: -180 });
        floatingTexts.push(makeText(`+${enemy.exp} EXP`, enemy.x, enemy.y - enemy.height - 44, 0x83f7b1, time));
        return { ...enemy, hp: 0, defeated: true, hitUntil: time + 0.16 };
      }
      return { ...enemy, hp, hitUntil: time + 0.16, vx: enemy.vx + (hero.facing === 'right' ? 80 : -80) };
    });
    if (!hitAny) floatingTexts.push(makeText('swish', hero.x + (hero.facing === 'right' ? 56 : -28), hero.y - 82, 0xbfe6ff, time));
  }

  if (hero.exp >= hero.expToNext) {
    hero.exp -= hero.expToNext;
    hero.level += 1;
    hero.expToNext += 35;
    hero.maxHp += 12;
    hero.maxMp += 8;
    hero.hp = hero.maxHp;
    hero.mp = hero.maxMp;
    floatingTexts.push(makeText('LEVEL UP', hero.x, hero.y - 116, 0xffdf5d, time));
  }

  hero.mp = Math.min(hero.maxMp, hero.mp + 8 * dt);
  hero.x += hero.vx * dt;
  hero.vy += GRAVITY * dt;
  hero.y += hero.vy * dt;
  hero.x = clamp(hero.x, 42, state.worldWidth - 56);
  hero = resolvePlatforms(hero, state.platforms);

  enemies = enemies.map((enemy) => updateEnemy(enemy, dt));
  for (const enemy of enemies) {
    if (enemy.defeated || time < hero.invulnerableUntil) continue;
    if (rectsOverlap(hero.x - hero.width / 2, hero.y - hero.height, hero.width, hero.height, enemy.x - enemy.width / 2, enemy.y - enemy.height, enemy.width, enemy.height)) {
      hero.hp = Math.max(0, hero.hp - enemy.damage);
      hero.invulnerableUntil = time + 1.0;
      hero.vx = enemy.x > hero.x ? -220 : 220;
      hero.vy = -430;
      floatingTexts.push(makeText(`-${enemy.damage}`, hero.x, hero.y - hero.height - 16, 0xff8c7a, time));
      message = 'Ouch. Enemy contact hurts, but invulnerability gives you a counterattack window.';
    }
  }

  pickups = pickups.map((pickup) => {
    if (pickup.collected) return pickup;
    const vy = pickup.vy + GRAVITY * 0.42 * dt;
    const y = Math.min(pickup.y + vy * dt, 522);
    return { ...pickup, y, vy: y >= 522 ? 0 : vy };
  });
  pickups = pickups.map((pickup) => {
    if (pickup.collected) return pickup;
    if (!rectsOverlap(hero.x - hero.width / 2, hero.y - hero.height, hero.width, hero.height, pickup.x - 13, pickup.y - 13, 26, 26)) return pickup;
    if (pickup.kind === 'coin') {
      hero.coins += pickup.value;
      floatingTexts.push(makeText(`+${pickup.value} coin`, pickup.x, pickup.y - 20, 0xffd15c, time));
    } else if (pickup.kind === 'mana') {
      hero.mp = Math.min(hero.maxMp, hero.mp + pickup.value);
      floatingTexts.push(makeText('+MP', pickup.x, pickup.y - 20, 0x80d8ff, time));
    } else {
      hero.hp = Math.min(hero.maxHp, hero.hp + pickup.value);
      floatingTexts.push(makeText('+HP', pickup.x, pickup.y - 20, 0x8ef7a2, time));
    }
    return { ...pickup, collected: true };
  });

  let status: GameState['status'] = state.status;
  if (hero.hp <= 0) {
    status = 'defeated';
    message = 'You fainted. Press Respawn to retry from the village gate.';
  } else if (defeated >= state.quest.target) {
    status = 'won';
    message = 'Trail cleared. Moonleaf Village is safe for the night.';
  }

  floatingTexts = floatingTexts.filter((text) => text.life > 0);
  hitSparks = hitSparks.filter((spark) => spark.life > 0);
  const cameraX = clamp(hero.x - viewportWidth * 0.42, 0, Math.max(0, state.worldWidth - viewportWidth));

  return {
    ...state,
    status,
    time,
    cameraX,
    hero,
    enemies,
    pickups,
    floatingTexts,
    hitSparks,
    quest: { ...state.quest, defeated },
    message,
  };
}

function updateEnemy(enemy: Enemy, dt: number): Enemy {
  if (enemy.defeated) return enemy;
  let x = enemy.x + enemy.vx * dt;
  let vx = enemy.vx * 0.985;
  if (Math.abs(vx) < 28) vx = vx < 0 ? -28 : 28;
  if (x < enemy.patrolMin) {
    x = enemy.patrolMin;
    vx = Math.abs(vx);
  }
  if (x > enemy.patrolMax) {
    x = enemy.patrolMax;
    vx = -Math.abs(vx);
  }
  return { ...enemy, x, vx };
}

function resolvePlatforms(hero: GameState['hero'], landings: Platform[]): GameState['hero'] {
  let next = { ...hero, onGround: false };
  for (const platform of landings) {
    const left = platform.x;
    const right = platform.x + platform.width;
    const top = platform.y;
    const heroBottom = next.y;
    const previousBottom = next.y - next.vy * (1 / 60);
    const horizontal = next.x + next.width / 2 > left && next.x - next.width / 2 < right;
    if (next.vy >= 0 && horizontal && previousBottom <= top && heroBottom >= top && heroBottom <= top + Math.max(42, platform.height)) {
      next.y = top;
      next.vy = 0;
      next.onGround = true;
    }
  }
  if (next.y > 720) {
    next.x = HERO_START.x;
    next.y = HERO_START.y;
    next.vx = 0;
    next.vy = 0;
  }
  return next;
}

function makeText(text: string, x: number, y: number, color: number, time: number): FloatingText {
  return { id: `text-${time}-${Math.random()}`, text, x, y, color, life: 0.85, maxLife: 0.85, vy: -58 };
}

function makeSpark(x: number, y: number, time: number): HitSpark {
  return { id: `spark-${time}-${Math.random()}`, x, y, life: 0.24, maxLife: 0.24, radius: 10 };
}

function rectsOverlap(ax: number, ay: number, aw: number, ah: number, bx: number, by: number, bw: number, bh: number): boolean {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
