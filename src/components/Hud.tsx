import {
  Activity,
  Coins,
  HeartPulse,
  Pause,
  Play,
  Radio,
  RotateCcw,
  Shield,
  Skull,
  StepForward,
  Target,
} from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import {
  getBuildReadiness,
  getKillZoneCoverage,
  getPhaseObjective,
  getRaiderScout,
  getRaidBreakdown,
  getRaidPlan,
  getRaidPressure,
  getRaidQueuePreview,
  getRewardRecommendation,
  REWARD_OPTIONS,
} from '../game/simulation';

const phaseLabel = {
  build: 'Build',
  raid: 'Raid',
  victory: 'Victory',
  defeat: 'Defeat',
} as const;

export function Hud() {
  const s = useGameStore();
  const raidBreakdown = getRaidBreakdown(s);
  const alive = raidBreakdown.alive;
  const cleared = raidBreakdown.cleared;
  const progressPct = s.totalRaiders ? Math.round((cleared / s.totalRaiders) * 100) : 0;
  const hpPct = Math.max(0, Math.round((s.coreHp / s.maxCoreHp) * 100));
  const plan = getRaidPlan(s.day);
  const queuePreview = getRaidQueuePreview(s.day);
  const scout = getRaiderScout(s.day);
  const nextReward = plan.rewardPreview;
  const readiness = getBuildReadiness(s);
  const raidPressure = getRaidPressure(s);
  const rewardRecommendation = getRewardRecommendation(s);
  const killZoneCoverage = getKillZoneCoverage(s);
  const objective = getPhaseObjective(s);

  return (
    <section className="hud" aria-label="Blockhold Siege command HUD">
      <div className="hud-topline">
        <div>
          <span className="system-label">StyleSeed Tactical HUD</span>
          <h1>Blockhold Siege</h1>
        </div>
        <span className={`phase-chip ${s.phase}`}>{phaseLabel[s.phase]}</span>
      </div>

      <div className="hud-message" role="status">
        <Radio size={15} />
        <span>{s.message}</span>
      </div>

      <div className="core-strip" aria-label={`Core health ${hpPct}%`}>
        <div>
          <HeartPulse size={16} />
          <b>Core</b>
          <span>{s.coreHp}/{s.maxCoreHp}</span>
        </div>
        <div className="core-meter"><span style={{ width: `${hpPct}%` }} /></div>
      </div>

      <div className="status-row">
        <b><Skull size={15} /> {alive}/{s.totalRaiders || '-'} Raiders</b>
        <b><Coins size={15} /> {s.coins} Coins</b>
        <b><Target size={15} /> {s.kills} Kills</b>
        <b>Day {s.day}</b>
      </div>

      <div className="objective-card" aria-label={`Current objective: ${objective.label}`}>
        <div>
          <strong>{objective.label}</strong>
          <span>{objective.primary}</span>
        </div>
        <em>{objective.bonus}</em>
        <div className="check-list">
          {objective.checklist.map((item) => <small key={item}>{item}</small>)}
        </div>
      </div>

      <div className="actions primary-actions">
        {s.phase === 'build' && <button onClick={s.start}><Play size={17} />Start Raid</button>}
        {s.phase === 'victory' && <button onClick={() => s.next()}><StepForward size={17} />Next Day</button>}
        {s.phase === 'defeat' && <button onClick={s.restartGame}><RotateCcw size={17} />Restart</button>}
        {s.phase === 'raid' && <button onClick={s.togglePause}><Pause size={17} />{s.paused ? 'Resume' : 'Pause'}</button>}
      </div>

      {s.phase === 'raid' && (
        <div className="phase-panel raid-panel" aria-label={`Raid progress ${cleared} of ${s.totalRaiders} raiders cleared, ${s.coreHits} core hits`}>
          <div className="panel-head">
            <strong>Raid Pressure</strong>
            <span>{cleared}/{s.totalRaiders} cleared · Core hits {s.coreHits}</span>
          </div>
          <div className="wave-meter"><span style={{ width: `${progressPct}%` }} /></div>
          <div className={`breach-alert ${raidPressure.level}`} aria-label={`Breach alert: ${raidPressure.label}`}>
            <b>{raidPressure.label}</b>
            <span>{raidPressure.nearestDistance === null ? 'No active raiders' : `${raidPressure.nearestKind?.toUpperCase()} · ${raidPressure.nearestDistance} tiles from core`}</span>
            <em>{raidPressure.advice}</em>
          </div>
          <div className="alive-mix" aria-label={`Alive raid mix: ${raidBreakdown.mix.grunt} grunts, ${raidBreakdown.mix.runner} runners, ${raidBreakdown.mix.brute} brutes`}>
            <b>Alive Mix</b>
            <span>Grunt {raidBreakdown.mix.grunt}</span>
            <span>Runner {raidBreakdown.mix.runner}</span>
            <span>Brute {raidBreakdown.mix.brute}</span>
          </div>
          {raidBreakdown.mostThreatening && <small>Focus: {raidBreakdown.mostThreatening.toUpperCase()} pressure remains.</small>}
          <small>Combo x{Math.max(1, s.combo)} · every 3-kill streak pays +1 bonus coin</small>
        </div>
      )}

      {s.phase === 'build' && (
        <div className="phase-panel forecast-panel" aria-label={`Next raid forecast: ${plan.total} raiders, danger lane ${plan.dangerLane}`}>
          <div className="panel-head">
            <strong>Next Raid</strong>
            <span>Lane X{plan.dangerLane} · {plan.total} raiders · {plan.threat.label}</span>
          </div>
          <div className="threat-meter" aria-label={`Threat score ${plan.threat.score}`}>
            <i style={{ width: `${Math.min(100, plan.threat.score * 3)}%` }} />
          </div>
          <p>{plan.threat.advice}</p>
          <div className="raid-queue" aria-label={`Raid queue preview: ${queuePreview.firstSix.join(', ')}`}>
            <b>Spawn Queue</b>
            {queuePreview.firstSix.map((kind, index) => <span key={`${kind}-${index}`} className={kind}>{index + 1}. {kind}</span>)}
          </div>
          <div className="enemy-scout" aria-label="Enemy scouting report">
            {scout.map((enemy) => (
              <span key={enemy.kind} className={enemy.kind}>
                <strong>{enemy.label} x{enemy.count}</strong>
                <small>HP {enemy.hp} · Speed {enemy.speed} · +{enemy.bounty}c</small>
              </span>
            ))}
          </div>
          <small>{queuePreview.callout}</small>
          <small>Base supply: Wall {nextReward.wall} · Trap {nextReward.trap} · Tower {nextReward.turret} · Frost {nextReward.frost}</small>
        </div>
      )}

      {s.phase === 'build' && (
        <div className="coach-grid">
          <div className={`build-readiness ${readiness.ready ? 'ready' : 'warning'}`} aria-label={`Build coach: ${readiness.label}`}>
            <strong>{readiness.label}</strong>
            <span>{readiness.advice}</span>
            {Object.keys(readiness.missing).length > 0 && (
              <em>
                Need {Object.entries(readiness.missing).map(([type, amount]) => `${type} +${amount}`).join(' · ')}
              </em>
            )}
          </div>
          <div className={`kill-zone-coach ${killZoneCoverage.label === 'Kill Zone Ready' ? 'ready' : killZoneCoverage.label === 'Partial Choke' ? 'partial' : 'open'}`} aria-label={`Kill zone coverage: ${killZoneCoverage.label}`}>
            <strong>{killZoneCoverage.label}</strong>
            <span>Lane X{killZoneCoverage.lane} score {killZoneCoverage.score}</span>
            <em>W{killZoneCoverage.counts.wall} · T{killZoneCoverage.counts.trap} · B{killZoneCoverage.counts.turret} · F{killZoneCoverage.counts.frost}</em>
          </div>
        </div>
      )}

      <div className="combat-log" aria-label="Recent combat feedback">
        <strong><Activity size={14} /> Combat Log</strong>
        {s.combatLog.slice(0, 4).map((event, index) => <span key={`${event}-${index}`}>{event}</span>)}
      </div>

      {s.phase === 'victory' && (
        <div className="reward-choices" aria-label="Choose next day reward">
          {s.lastClearGrade && (
            <div className="clear-grade" aria-label={`${s.lastClearGrade.stars} star clear rating`}>
              <strong>{'★'.repeat(s.lastClearGrade.stars)}{'☆'.repeat(3 - s.lastClearGrade.stars)} {s.lastClearGrade.label}</strong>
              <span>Core hits {s.coreHits} · Bonus +{s.lastClearGrade.bonusCoins} coins</span>
            </div>
          )}
          <div className="panel-head">
            <strong>Choose Clear Reward</strong>
            <span>{rewardRecommendation.label}</span>
          </div>
          <em>{rewardRecommendation.reason}</em>
          <div className="reward-grid">
            {REWARD_OPTIONS.map((reward) => (
              <button key={reward.id} className={reward.id === rewardRecommendation.id ? 'recommended' : ''} onClick={() => s.next(reward.id)}>
                <b>{reward.title}{reward.id === rewardRecommendation.id ? ' · Recommended' : ''}</b>
                <small>{reward.description}</small>
              </button>
            ))}
          </div>
        </div>
      )}

      <p className="hint"><Shield size={14} /> Left click place · right click remove · 1-4 select · Space pause · R camera</p>
    </section>
  );
}
