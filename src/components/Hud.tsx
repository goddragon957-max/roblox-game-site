import { Play, RotateCcw, StepForward, Shield, Pause, Skull, Coins, HeartPulse } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { getRaidPlan } from '../game/simulation';

export function Hud() {
  const s = useGameStore();
  const alive = s.raiders.filter((r) => !r.resolved && r.hp > 0).length;
  const hpPct = Math.max(0, Math.round((s.coreHp / s.maxCoreHp) * 100));
  const plan = getRaidPlan(s.day);
  const nextReward = plan.rewardPreview;
  return (
    <section className="hud">
      <p className="eyebrow">Reference: Build to Survive × Tower Defense Simulator × Orcs Must Die</p>
      <h1>Blockhold Siege</h1>
      <p className="message">{s.message}</p>
      <div className="core-meter" aria-label={`Core health ${hpPct}%`}>
        <span style={{ width: `${hpPct}%` }} />
      </div>
      <div className="status-grid">
        <b><HeartPulse size={15} /> Core {s.coreHp}/{s.maxCoreHp}</b>
        <b><Skull size={15} /> Raiders {alive}/{s.totalRaiders || '-'}</b>
        <b><Coins size={15} /> Kills {s.kills}</b>
        <b>Day {s.day} · {s.phase.toUpperCase()}</b>
      </div>
      {s.phase === 'build' && (
        <div className="raid-preview" aria-label={`Next raid forecast: ${plan.total} raiders, danger lane ${plan.dangerLane}`}>
          <strong>Next Raid Forecast</strong>
          <span>Lane X{plan.dangerLane} 집중 · {plan.total}명</span>
          <em>Grunt {plan.mix.grunt} · Runner {plan.mix.runner} · Brute {plan.mix.brute}</em>
          <small>Clear 보급: Wall {nextReward.wall} · Trap {nextReward.trap} · Tower {nextReward.turret} · Frost {nextReward.frost}</small>
        </div>
      )}
      <div className="combat-log" aria-label="Recent combat feedback">
        <strong>Combat Feedback</strong>
        {s.combatLog.map((event, index) => <span key={`${event}-${index}`}>{event}</span>)}
      </div>
      <div className="actions">
        {s.phase === 'build' && <button onClick={s.start}><Play size={16} />Start Raid</button>}
        {s.phase === 'victory' && <button onClick={s.next}><StepForward size={16} />Next Day</button>}
        {s.phase === 'defeat' && <button onClick={s.restartGame}><RotateCcw size={16} />Restart</button>}
        {s.phase === 'raid' && <button onClick={s.togglePause}><Pause size={16} />{s.paused ? 'Resume' : 'Pause'}</button>}
      </div>
      <p className="hint"><Shield size={14} /> 좌클릭 배치 · 우클릭 회수 · 1 벽 · 2 스파이크 · 3 타워 · 4 얼음 · Space 일시정지</p>
    </section>
  );
}
