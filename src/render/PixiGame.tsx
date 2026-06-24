import { useEffect, useRef } from 'react';
import { Application, Container, Graphics, Text } from 'pixi.js';
import type { Enemy, GameState, InputState, Pickup, Platform } from '../game/types';
import { useGameStore } from '../store/gameStore';

const VIEW_HEIGHT = 640;
const SKY = 0xb9ecff;
const INK = 0x233040;
const LEAF = 0x3f8f5f;
const GOLD = 0xffd15c;

export function PixiGame() {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;

    const app = new Application();
    let disposed = false;
    let cleanupListeners = () => {};
    const input: InputState = { left: false, right: false, jump: false, attack: false };

    void app.init({
      resizeTo: host,
      backgroundColor: SKY,
      antialias: true,
      autoDensity: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
    }).then(() => {
      if (disposed) {
        app.destroy(true);
        return;
      }

      app.canvas.dataset.gameCanvas = 'moonleaf-2d';
      app.canvas.setAttribute('data-game-canvas', 'moonleaf-2d');
      app.canvas.setAttribute('aria-label', 'Moonleaf Trail 2D action RPG canvas');
      host.appendChild(app.canvas);
      window.__moonleafSmoke = {
        getState: useGameStore.getState,
        setState: useGameStore.setState,
      };

      const scene = new Container();
      app.stage.addChild(scene);

      const onKey = (event: KeyboardEvent, down: boolean) => {
        const key = event.key.toLowerCase();
        if (['arrowleft', 'a'].includes(key)) input.left = down;
        if (['arrowright', 'd'].includes(key)) input.right = down;
        if (['arrowup', 'w', ' '].includes(key)) input.jump = down;
        if (['j', 'k', 'x'].includes(key)) input.attack = down;
        if (down && ['arrowleft', 'arrowright', 'arrowup', 'a', 'd', 'w', ' ', 'j', 'k', 'x'].includes(key)) {
          useGameStore.getState().start();
          event.preventDefault();
        }
      };
      const keyDown = (event: KeyboardEvent) => onKey(event, true);
      const keyUp = (event: KeyboardEvent) => onKey(event, false);
      window.addEventListener('keydown', keyDown);
      window.addEventListener('keyup', keyUp);

      app.ticker.add((ticker) => {
        const width = app.renderer.width / app.renderer.resolution;
        useGameStore.getState().step(input, ticker.deltaMS / 1000, width);
        draw(scene, useGameStore.getState(), width, VIEW_HEIGHT);
      });

      draw(scene, useGameStore.getState(), app.renderer.width / app.renderer.resolution, VIEW_HEIGHT);

      app.canvas.addEventListener('pointerdown', () => useGameStore.getState().start());
      app.canvas.tabIndex = 0;

      cleanupListeners = () => {
        window.removeEventListener('keydown', keyDown);
        window.removeEventListener('keyup', keyUp);
      };
      app.canvas.addEventListener('webglcontextlost', cleanupListeners, { once: true });
    });

    return () => {
      disposed = true;
      cleanupListeners();
      delete window.__moonleafSmoke;
      app.destroy(true, { children: true });
    };
  }, []);

  return <div ref={hostRef} className="game-canvas-host" data-game-root="moonleaf-trail" />;
}

function draw(scene: Container, state: GameState, viewWidth: number, viewHeight: number) {
  scene.removeChildren();
  const screen = new Graphics();
  scene.addChild(screen);

  drawSky(screen, viewWidth, viewHeight, state.time);

  const world = new Container();
  world.x = -state.cameraX;
  scene.addChild(world);
  const g = new Graphics();
  world.addChild(g);
  drawBackdrop(g, state);
  for (const platform of state.platforms) drawPlatform(g, platform);
  for (const pickup of state.pickups) if (!pickup.collected) drawPickup(g, pickup, state.time);
  for (const enemy of state.enemies) drawEnemy(g, enemy, state.time);
  drawHero(g, state);
  for (const spark of state.hitSparks) drawSpark(g, spark.x, spark.y, spark.radius, spark.life / spark.maxLife);

  for (const text of state.floatingTexts) {
    const label = new Text({
      text: text.text,
      style: {
        fill: text.color,
        fontFamily: 'Inter, ui-sans-serif, system-ui',
        fontSize: 18,
        fontWeight: '800',
        stroke: { color: INK, width: 3 },
      },
    });
    label.anchor.set(0.5);
    label.alpha = Math.max(0, text.life / text.maxLife);
    label.x = text.x - state.cameraX;
    label.y = text.y;
    scene.addChild(label);
  }
}

function drawSky(g: Graphics, width: number, height: number, time: number) {
  g.rect(0, 0, width, height).fill(SKY);
  g.circle(width - 118, 92, 46).fill(0xfff4a3);
  for (let i = 0; i < 8; i += 1) {
    const x = ((i * 211 - time * 18) % (width + 260)) - 80;
    const y = 72 + (i % 3) * 54;
    g.ellipse(x, y, 58, 20).fill({ color: 0xffffff, alpha: 0.7 });
    g.ellipse(x + 38, y + 8, 46, 16).fill({ color: 0xffffff, alpha: 0.6 });
  }
  g.rect(0, height - 92, width, 92).fill(0xa1d879);
}

function drawBackdrop(g: Graphics, state: GameState) {
  for (let i = 0; i < 9; i += 1) {
    const x = i * 270 + 80;
    const h = 150 + (i % 3) * 26;
    g.rect(x - 12, 394 - h * 0.12, 24, h).fill(0x7c583c);
    g.circle(x, 342 - h * 0.28, 72).fill({ color: 0x78bb69, alpha: 0.78 });
    g.circle(x - 42, 364 - h * 0.2, 52).fill({ color: 0x66a95d, alpha: 0.72 });
  }
  g.roundRect(40, 428, 190, 118, 14).fill(0xf6c66e).stroke({ color: 0x6f4d35, width: 4 });
  g.poly([56, 428, 136, 358, 226, 428], true).fill(0xe57b5c).stroke({ color: 0x6f4d35, width: 4 });
  g.roundRect(103, 482, 46, 64, 12).fill(0x6f4d35);
  g.roundRect(state.worldWidth - 260, 432, 180, 86, 18).fill(0x95dfb5).stroke({ color: 0x2c6f55, width: 4 });
}

function drawPlatform(g: Graphics, platform: Platform) {
  if (platform.kind === 'bridge') {
    g.roundRect(platform.x, platform.y, platform.width, platform.height, 8).fill(0x9c6b44).stroke({ color: 0x5a3827, width: 3 });
    for (let x = platform.x + 20; x < platform.x + platform.width; x += 38) {
      g.rect(x, platform.y + 2, 4, platform.height - 4).fill(0x67412d);
    }
    return;
  }
  if (platform.kind === 'stump') {
    g.roundRect(platform.x, platform.y, platform.width, platform.height, 12).fill(0xb77a45).stroke({ color: 0x684127, width: 3 });
    g.ellipse(platform.x + platform.width / 2, platform.y + 4, platform.width / 2 - 8, 10).fill(0xd99a5f);
    return;
  }
  g.roundRect(platform.x, platform.y, platform.width, platform.height, 18).fill(0x865a3c).stroke({ color: 0x4d3427, width: 4 });
  g.roundRect(platform.x, platform.y - 16, platform.width, 32, 18).fill(LEAF).stroke({ color: 0x2d6b4c, width: 4 });
  for (let x = platform.x + 18; x < platform.x + platform.width; x += 46) {
    g.circle(x, platform.y - 12, 8).fill(0x83d26b);
  }
}

function drawHero(g: Graphics, state: GameState) {
  const { hero, time } = state;
  const bob = Math.sin(time * 10) * (hero.onGround ? 2 : 0);
  const flip = hero.facing === 'right' ? 1 : -1;
  const x = hero.x;
  const y = hero.y + bob;
  const flash = time < hero.invulnerableUntil && Math.floor(time * 20) % 2 === 0;
  if (flash) return;

  if (time < hero.attackUntil) {
    const sx = hero.facing === 'right' ? x + 24 : x - 108;
    g.roundRect(sx, y - 78, 104, 44, 22).fill({ color: 0xffffff, alpha: 0.55 }).stroke({ color: GOLD, width: 5 });
  }

  g.roundRect(x - 20, y - 56, 40, 54, 15).fill(0x6bbf75).stroke({ color: INK, width: 4 });
  g.circle(x, y - 72, 27).fill(0xffd7ad).stroke({ color: INK, width: 4 });
  g.circle(x - 10 * flip, y - 78, 4).fill(INK);
  g.circle(x + 8 * flip, y - 78, 4).fill(INK);
  g.roundRect(x - 7, y - 68, 14, 4, 3).fill(0x9b4d45);
  g.poly([x - 22, y - 94, x - 4, y - 112, x + 21, y - 94], true).fill(0x4b9b61).stroke({ color: INK, width: 4 });
  g.roundRect(x - 29 * flip, y - 52, 14, 42, 7).fill(0xffd7ad).stroke({ color: INK, width: 3 });
  g.roundRect(x + 18 * flip, y - 52, 14, 42, 7).fill(0xffd7ad).stroke({ color: INK, width: 3 });
  g.roundRect(x - 16, y - 7, 12, 22, 6).fill(0x384a64);
  g.roundRect(x + 4, y - 7, 12, 22, 6).fill(0x384a64);
  g.roundRect(x + 22 * flip, y - 54, 46, 9, 5).fill(0xf6f0d1).stroke({ color: INK, width: 3 });
}

function drawEnemy(g: Graphics, enemy: Enemy, time: number) {
  if (enemy.defeated) return;
  const x = enemy.x;
  const y = enemy.y + Math.sin(time * 8 + enemy.x) * 3;
  const tint = time < enemy.hitUntil ? 0xffffff : null;
  const fill = tint ?? (enemy.kind === 'sproutling' ? 0x8bd36e : enemy.kind === 'mushroom' ? 0xdb6c77 : 0x8d7be9);
  g.roundRect(x - enemy.width / 2, y - enemy.height, enemy.width, enemy.height, 22).fill(fill).stroke({ color: INK, width: 4 });
  if (enemy.kind === 'mushroom') {
    g.ellipse(x, y - enemy.height + 8, enemy.width * 0.58, 24).fill(0xf08b8b).stroke({ color: INK, width: 3 });
    g.circle(x - 16, y - enemy.height + 2, 5).fill(0xfff4d1);
    g.circle(x + 12, y - enemy.height - 2, 4).fill(0xfff4d1);
  }
  if (enemy.kind === 'lantern') {
    g.circle(x, y - enemy.height - 10, 15).fill(GOLD).stroke({ color: INK, width: 3 });
    g.rect(x - 3, y - enemy.height - 34, 6, 16).fill(INK);
  }
  g.circle(x - 12, y - enemy.height * 0.58, 4).fill(INK);
  g.circle(x + 12, y - enemy.height * 0.58, 4).fill(INK);
  g.roundRect(x - 10, y - enemy.height * 0.42, 20, 5, 3).fill(INK);
  g.roundRect(x - enemy.width / 2, y - enemy.height - 12, enemy.width, 7, 4).fill(0x53353b);
  g.roundRect(x - enemy.width / 2, y - enemy.height - 12, enemy.width * (enemy.hp / enemy.maxHp), 7, 4).fill(0xff756b);
}

function drawPickup(g: Graphics, pickup: Pickup, time: number) {
  const y = pickup.y + Math.sin(time * 7 + pickup.x) * 4;
  if (pickup.kind === 'coin') {
    g.circle(pickup.x, y, 13).fill(GOLD).stroke({ color: 0x8b6125, width: 3 });
    g.circle(pickup.x, y, 5).fill(0xffef9e);
  } else if (pickup.kind === 'mana') {
    g.poly([pickup.x, y - 17, pickup.x + 13, y, pickup.x, y + 17, pickup.x - 13, y], true).fill(0x6fd5ff).stroke({ color: INK, width: 3 });
  } else {
    g.circle(pickup.x - 5, y, 10).fill(0xff677d).stroke({ color: INK, width: 3 });
    g.circle(pickup.x + 5, y, 10).fill(0xff677d).stroke({ color: INK, width: 3 });
    g.circle(pickup.x, y - 7, 8).fill(0xff8798);
  }
}

function drawSpark(g: Graphics, x: number, y: number, radius: number, alpha: number) {
  g.star(x, y, 7, radius, radius * 0.42).fill({ color: GOLD, alpha }).stroke({ color: 0xffffff, width: 3, alpha });
}
