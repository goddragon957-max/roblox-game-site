import { Axe, BellRing, Castle, Coins, Dog, Flag, Hammer, RotateCcw, Shield, ShieldAlert, Swords, TreePine } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
  COSTS,
  MAP_HALF,
  TERRAIN,
  TRAIN_TIME,
  idleWorkerIds,
  matchScore,
  missionHint,
  nextBuildSlot,
  orderPreviews,
  rallyPreviews,
  selectionSummary,
  threatAlert,
  towerRangePreviews,
  towerShots,
  waveForecast,
  waveTelegraph
} from '../game/simulation';
import type { Building, BuildingKind, GameState, Unit, UnitKind } from '../game/types';
import { affordable, useGameStore } from '../store/gameStore';

const UNIT_NAMES: Record<Unit['kind'], string> = {
  worker: '일꾼 퍼피',
  soldier: '병사 퍼피',
  raider: '라쿤 습격자'
};

const BUILDING_NAMES: Record<Building['kind'], string> = {
  base: '프론티어 본부',
  barracks: '막사',
  tower: '방어 타워',
  enemyCamp: '라쿤 캠프'
};

const ORDER_LABELS: Record<Unit['order']['type'], string> = {
  idle: '대기',
  move: '이동 중',
  gather: '채집 중',
  deposit: '자원 운반 중',
  attack: '공격 중',
  assault: '진격 중'
};

function entityName(kind: UnitKind | BuildingKind): string {
  if (kind === 'worker' || kind === 'soldier' || kind === 'raider') return UNIT_NAMES[kind];
  return BUILDING_NAMES[kind];
}

function ResourceChip({ icon: Icon, resource, value }: { icon: LucideIcon; resource: string; value: number }) {
  const prev = useRef(value);
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    if (value > prev.current) setPulse((count) => count + 1);
    prev.current = value;
  }, [value]);

  return (
    <div className="hud-chip resource">
      <Icon size={15} />
      {/* Remounting on each delivery restarts the gain-pop animation. */}
      <b data-resource={resource} key={pulse} className={pulse > 0 ? 'gain-pop' : ''}>
        {value}
      </b>
    </div>
  );
}

function Minimap() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    const size = canvas.width;
    const toPx = (value: number) => ((value + MAP_HALF) / (MAP_HALF * 2)) * size;

    function draw(sim: GameState) {
      if (!context) return;
      context.fillStyle = '#5f9a49';
      context.fillRect(0, 0, size, size);

      context.fillStyle = '#468cc4';
      const riverLeft = toPx(TERRAIN.river.centerX - TERRAIN.river.width / 2);
      const riverRight = toPx(TERRAIN.river.centerX + TERRAIN.river.width / 2);
      context.fillRect(riverLeft, 0, riverRight - riverLeft, size);
      context.fillStyle = '#c9a36a';
      const bridgeTop = toPx(TERRAIN.bridge.centerZ - TERRAIN.bridge.length / 2);
      const bridgeBottom = toPx(TERRAIN.bridge.centerZ + TERRAIN.bridge.length / 2);
      context.fillRect(riverLeft - 2, bridgeTop, riverRight - riverLeft + 4, bridgeBottom - bridgeTop);

      for (const node of sim.resources) {
        if (node.amountLeft <= 0) continue;
        context.fillStyle = node.type === 'gold' ? '#f5c542' : '#2f7a3d';
        context.beginPath();
        context.arc(toPx(node.pos.x), toPx(node.pos.z), 2.4, 0, Math.PI * 2);
        context.fill();
      }

      for (const building of sim.buildings) {
        context.fillStyle = building.faction === 'player' ? '#5ff08b' : '#ff8a5c';
        const px = toPx(building.pos.x);
        const py = toPx(building.pos.z);
        context.fillRect(px - 3.5, py - 3.5, 7, 7);
      }

      for (const unit of sim.units) {
        context.fillStyle = unit.faction === 'player' ? '#d7ffe6' : '#ffb08c';
        context.beginPath();
        context.arc(toPx(unit.pos.x), toPx(unit.pos.z), 1.8, 0, Math.PI * 2);
        context.fill();
      }

      for (const order of orderPreviews(sim)) {
        context.strokeStyle =
          order.kind === 'attack'
            ? 'rgba(255, 111, 97, 0.85)'
            : order.kind === 'move'
              ? 'rgba(255, 255, 255, 0.75)'
              : 'rgba(245, 197, 66, 0.85)';
        context.lineWidth = 1;
        context.setLineDash([2, 2]);
        context.beginPath();
        context.moveTo(toPx(order.from.x), toPx(order.from.z));
        context.lineTo(toPx(order.to.x), toPx(order.to.z));
        context.stroke();
        context.setLineDash([]);
      }

      for (const rally of rallyPreviews(sim)) {
        context.strokeStyle = 'rgba(95, 240, 139, 0.8)';
        context.lineWidth = 1;
        context.setLineDash([3, 3]);
        context.beginPath();
        context.moveTo(toPx(rally.from.x), toPx(rally.from.z));
        context.lineTo(toPx(rally.point.x), toPx(rally.point.z));
        context.stroke();
        context.setLineDash([]);
        context.fillStyle = '#5ff08b';
        context.beginPath();
        context.arc(toPx(rally.point.x), toPx(rally.point.z), 2.6, 0, Math.PI * 2);
        context.fill();
      }

      for (const preview of towerRangePreviews(sim)) {
        context.strokeStyle = 'rgba(95, 240, 139, 0.85)';
        context.lineWidth = 1.5;
        context.beginPath();
        context.arc(toPx(preview.pos.x), toPx(preview.pos.z), (preview.radius / (MAP_HALF * 2)) * size, 0, Math.PI * 2);
        context.stroke();
      }

      for (const shot of towerShots(sim)) {
        context.strokeStyle = 'rgba(245, 197, 66, 0.9)';
        context.lineWidth = 1.5;
        context.beginPath();
        context.moveTo(toPx(shot.from.x), toPx(shot.from.z));
        context.lineTo(toPx(shot.to.x), toPx(shot.to.z));
        context.stroke();
      }

      const buildSlot = nextBuildSlot(sim);
      if (sim.status === 'playing' && buildSlot) {
        const px = toPx(buildSlot.x);
        const py = toPx(buildSlot.z);
        context.strokeStyle = 'rgba(95, 240, 139, 0.9)';
        context.fillStyle = 'rgba(95, 240, 139, 0.18)';
        context.lineWidth = 1.5;
        context.setLineDash([3, 2]);
        context.strokeRect(px - 4.5, py - 4.5, 9, 9);
        context.setLineDash([]);
        context.beginPath();
        context.arc(px, py, 2.2, 0, Math.PI * 2);
        context.fill();
      }

      // Enemy-orange "incoming" pulse at the spawn ground, distinct from the
      // red "being hit" threat pulse below.
      const telegraph = waveTelegraph(sim);
      if (telegraph.active && telegraph.pos) {
        const wavePhase = (sim.time % 0.9) / 0.9;
        context.strokeStyle = `rgba(255, 138, 92, ${1 - wavePhase * 0.6})`;
        context.lineWidth = 2;
        context.beginPath();
        context.arc(toPx(telegraph.pos.x), toPx(telegraph.pos.z), 3 + wavePhase * 6, 0, Math.PI * 2);
        context.stroke();
      }

      const threat = threatAlert(sim);
      if (threat.active && threat.pos) {
        const phase = (sim.time % 1) / 1;
        context.strokeStyle = `rgba(255, 77, 61, ${1 - phase * 0.7})`;
        context.lineWidth = 2;
        context.beginPath();
        context.arc(toPx(threat.pos.x), toPx(threat.pos.z), 4 + phase * 7, 0, Math.PI * 2);
        context.stroke();
      }
    }

    draw(useGameStore.getState().sim);
    const interval = window.setInterval(() => draw(useGameStore.getState().sim), 220);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="minimap" aria-label="tactical minimap">
      <canvas ref={canvasRef} width={148} height={148} data-minimap="rts" />
      <span className="minimap-label">전술 지도</span>
    </div>
  );
}

function SelectionPanel({ sim }: { sim: GameState }) {
  const selectedId = sim.selectedIds[0];
  const unit = sim.units.find((entry) => entry.id === selectedId);
  const building = sim.buildings.find((entry) => entry.id === selectedId);
  const summary = selectionSummary(sim);

  if (!unit && !building) {
    return (
      <div className="selection-panel empty">
        <Dog size={16} />
        <span>유닛/건물을 좌클릭으로 선택하세요</span>
      </div>
    );
  }

  const name = summary.count > 1 ? '선택 부대' : unit ? UNIT_NAMES[unit.kind] : BUILDING_NAMES[(building as Building).kind];
  const hp = summary.count > 1 ? summary.hp : unit ? unit.hp : (building as Building).hp;
  const maxHp = summary.count > 1 ? summary.maxHp : unit ? unit.maxHp : (building as Building).maxHp;
  const ratio = Math.max(0, Math.min(1, hp / maxHp));
  const count = summary.count;

  return (
    <div className="selection-panel" data-selection-count={count} data-selection-hp={Math.max(0, Math.ceil(hp))}>
      <div className="selection-title">
        {unit ? unit.kind === 'raider' ? <Swords size={15} /> : <Dog size={15} /> : <Castle size={15} />}
        <strong>{name}</strong>
        {count > 1 && <span className="selection-count">×{count}</span>}
      </div>
      <div className="hp-row">
        <div className="hp-track">
          <div className={`hp-fill ${ratio <= 0.45 ? 'low' : ''}`} style={{ width: `${Math.round(ratio * 100)}%` }} />
        </div>
        <span className="hp-text">
          {Math.max(0, Math.ceil(hp))}/{maxHp}
        </span>
      </div>
      {summary.count > 1 && (
        <div className="selection-groups" aria-label="selection composition">
          {summary.groups.map((group) => (
            <span key={group.kind} className="selection-group" data-selection-kind={group.kind}>
              {entityName(group.kind)} ×{group.count} · {Math.max(0, Math.ceil(group.hp))}/{group.maxHp}
            </span>
          ))}
        </div>
      )}
      {unit && (
        <p className="selection-note">
          {ORDER_LABELS[unit.order.type]}
          {unit.carry ? ` · ${unit.carry.type === 'gold' ? '골드' : '나무'} ${unit.carry.amount} 운반` : ''}
        </p>
      )}
      {building && building.kind === 'barracks' && building.trainQueue > 0 && (
        <p className="selection-note">훈련 대기 {building.trainQueue} · 진행 {Math.round((building.trainProgress / TRAIN_TIME) * 100)}%</p>
      )}
      {building && building.kind === 'barracks' && (
        <p
          className="selection-note"
          data-rally-point={building.rallyPoint ? `${Math.round(building.rallyPoint.x)},${Math.round(building.rallyPoint.z)}` : 'none'}
        >
          {building.rallyPoint
            ? `집결 지점 (${Math.round(building.rallyPoint.x)}, ${Math.round(building.rallyPoint.z)}) — 새 병사가 이동`
            : '우클릭으로 병사 집결 지점을 지정하세요'}
        </p>
      )}
      {building && building.kind === 'tower' && (
        <p className="selection-note" data-tower-range={building.attackRange}>
          사거리 {building.attackRange} · 범위 안 라쿤 자동 공격
        </p>
      )}
    </div>
  );
}

export function RtsHud() {
  useGameStore((store) => store.frame);
  const sim = useGameStore((store) => store.sim);
  const build = useGameStore((store) => store.build);
  const train = useGameStore((store) => store.train);
  const restart = useGameStore((store) => store.restart);
  const select = useGameStore((store) => store.select);

  const camp = sim.buildings.find((building) => building.kind === 'enemyCamp');
  const hasBarracks = sim.buildings.some((building) => building.kind === 'barracks' && building.faction === 'player');
  const workerCount = sim.units.filter((unit) => unit.kind === 'worker' && unit.faction === 'player').length;
  const soldierCount = sim.units.filter((unit) => unit.kind === 'soldier').length;
  const forecast = waveForecast(sim);
  const hint = missionHint(sim);
  const training = sim.buildings.find(
    (building) => building.kind === 'barracks' && building.faction === 'player' && building.trainQueue > 0
  );
  const recentLog = sim.log.slice(-3).reverse();
  const rating = sim.status !== 'playing' ? matchScore(sim) : null;
  const threat = threatAlert(sim);
  const idleWorkers = idleWorkerIds(sim);
  const buildSlot = nextBuildSlot(sim);

  return (
    <div className="hud">
      <header className="hud-top">
        <div className="hud-chip title-chip">
          <Dog size={15} />
          <span>Puppy Frontier RTS</span>
        </div>
        <ResourceChip icon={Coins} resource="gold" value={sim.gold} />
        <ResourceChip icon={TreePine} resource="wood" value={sim.wood} />
        <div className="hud-chip">
          <Dog size={15} />
          <span>
            일꾼 {workerCount} · 병사 {soldierCount}
          </span>
        </div>
        <div className={`hud-chip wave${forecast.imminent ? ' alarm' : ''}`} data-next-wave-size={forecast.size}>
          <Swords size={15} />
          <span>
            {forecast.imminent
              ? `습격 임박! ${forecast.secondsLeft}s · 라쿤 ${forecast.size}기`
              : `${sim.waveNumber === 0 ? '첫 습격까지' : `웨이브 ${sim.waveNumber} · 다음까지`} ${forecast.secondsLeft}s · 라쿤 ${forecast.size}기`}
          </span>
        </div>
        {threat.active && (
          <div className="hud-chip threat alarm" data-threat-alert>
            <ShieldAlert size={15} />
            <span>피격 경보! 미니맵을 확인하세요</span>
          </div>
        )}
        {sim.status === 'playing' && idleWorkers.length > 0 && (
          <button
            type="button"
            className="hud-chip idle-workers"
            data-idle-workers={idleWorkers.length}
            onClick={() => select(idleWorkers)}
            title="클릭하면 쉬는 일꾼을 모두 선택합니다"
          >
            <BellRing size={15} />
            <span>쉬는 일꾼 {idleWorkers.length} · 클릭해 선택</span>
          </button>
        )}
        <div className="hud-chip objective">
          <Flag size={15} />
          <span>목표: 라쿤 캠프 파괴 {camp ? `(${Math.max(0, Math.round((camp.hp / camp.maxHp) * 100))}%)` : '(완료)'}</span>
        </div>
      </header>

      {sim.status === 'playing' && (
        <div className="mission-panel" data-mission-step={hint.step} aria-label="mission hint">
          <Flag size={14} />
          <div className="mission-body">
            <p className="mission-title">
              임무 {hint.step}/{hint.total} · {hint.title}
            </p>
            <p className="mission-detail">{hint.detail}</p>
          </div>
        </div>
      )}

      <aside className="hud-log" aria-label="objective log">
        {recentLog.map((entry, index) => (
          <p key={`${entry.time}-${index}`} className={index === 0 ? 'fresh' : ''}>
            <span className="log-time">{Math.floor(entry.time / 60)}:{String(Math.floor(entry.time % 60)).padStart(2, '0')}</span>
            {entry.text}
          </p>
        ))}
      </aside>

      <footer className="hud-bottom">
        <SelectionPanel sim={sim} />

        <div className="command-card" aria-label="build and production commands">
          {buildSlot && (
            <div className="build-slot-note" data-next-build-slot={`${Math.round(buildSlot.x)},${Math.round(buildSlot.z)}`}>
              다음 건설 위치 {Math.round(buildSlot.x)}, {Math.round(buildSlot.z)}
            </div>
          )}
          <button
            type="button"
            className="command-button"
            disabled={sim.status !== 'playing' || !affordable(sim, 'barracks')}
            onClick={() => build('barracks')}
          >
            <Hammer size={16} />
            <span>막사 건설</span>
            <span className="cost">
              {COSTS.barracks.gold}g · {COSTS.barracks.wood}w
            </span>
          </button>
          <button
            type="button"
            className="command-button"
            disabled={sim.status !== 'playing' || !affordable(sim, 'tower')}
            onClick={() => build('tower')}
          >
            <Shield size={16} />
            <span>타워 건설</span>
            <span className="cost">
              {COSTS.tower.gold}g · {COSTS.tower.wood}w
            </span>
          </button>
          <button
            type="button"
            className="command-button"
            disabled={sim.status !== 'playing' || !hasBarracks || !affordable(sim, 'soldier')}
            onClick={() => train()}
            title={hasBarracks ? undefined : '막사가 필요합니다'}
          >
            <Swords size={16} />
            <span>병사 훈련</span>
            <span className="cost">
              {COSTS.soldier.gold}g{training ? ` · 대기 ${training.trainQueue}` : ''}
            </span>
            {training && (
              <span className="train-progress" aria-hidden="true">
                <span style={{ width: `${Math.round((training.trainProgress / TRAIN_TIME) * 100)}%` }} />
              </span>
            )}
          </button>
        </div>

        <Minimap />
      </footer>

      <p className="hud-hint">
        <Axe size={13} /> 좌클릭 선택 · 드래그 부대 선택 · 우클릭 이동/채집/공격/집결 · WASD/방향키 카메라
      </p>

      {sim.status !== 'playing' && (
        <div className={`endgame ${sim.status}`} role="dialog" aria-label="game result">
          <h2>{sim.status === 'won' ? 'Victory!' : 'Defeat'}</h2>
          <p>{sim.status === 'won' ? '라쿤 캠프를 파괴하고 프론티어를 지켜냈습니다.' : '본부가 파괴되었습니다. 다시 도전하세요.'}</p>
          {rating && (
            <div className="endgame-grade" data-endgame-grade={rating.grade} aria-label="match grade">
              <span className="grade-letter">{rating.grade}</span>
              <span className="grade-label">전투 평가</span>
            </div>
          )}
          <dl className="endgame-stats" data-endgame-stats aria-label="match summary">
            <div>
              <dt>생존 시간</dt>
              <dd data-endstat="time">
                {Math.floor(sim.time / 60)}:{String(Math.floor(sim.time % 60)).padStart(2, '0')}
              </dd>
            </div>
            <div>
              <dt>웨이브 도달</dt>
              <dd data-endstat="waves">{sim.waveNumber}</dd>
            </div>
            <div>
              <dt>골드 채집</dt>
              <dd data-endstat="gold">{sim.stats.goldGathered}</dd>
            </div>
            <div>
              <dt>나무 채집</dt>
              <dd data-endstat="wood">{sim.stats.woodGathered}</dd>
            </div>
            <div>
              <dt>병사 훈련</dt>
              <dd data-endstat="soldiers">{sim.stats.soldiersTrained}</dd>
            </div>
            <div>
              <dt>라쿤 격퇴</dt>
              <dd data-endstat="raiders">{sim.stats.raidersDefeated}</dd>
            </div>
            <div>
              <dt>유닛 손실</dt>
              <dd data-endstat="losses">{sim.stats.unitsLost}</dd>
            </div>
            <div>
              <dt>종합 점수</dt>
              <dd data-endstat="score">{rating ? rating.score : 0}</dd>
            </div>
          </dl>
          <button type="button" onClick={restart}>
            <RotateCcw size={16} /> 다시 시작
          </button>
        </div>
      )}
    </div>
  );
}
