import { Play, RotateCcw, StepForward, Shield, Pause, Skull, Coins, HeartPulse } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { getBuildReadiness, getRaidBreakdown, getRaidPlan, getRaidPressure, getRewardRecommendation, REWARD_OPTIONS } from '../game/simulation';

export function Hud() {
  const s = useGameStore();
  const raidBreakdown = getRaidBreakdown(s);
  const alive = raidBreakdown.alive;
  const cleared = raidBreakdown.cleared;
  const progressPct = s.totalRaiders ? Math.round((cleared / s.totalRaiders) * 100) : 0;
  const hpPct = Math.max(0, Math.round((s.coreHp / s.maxCoreHp) * 100));
  const plan = getRaidPlan(s.day);
  const nextReward = plan.rewardPreview;
  const readiness = getBuildReadiness(s);
  const raidPressure = getRaidPressure(s);
  const rewardRecommendation = getRewardRecommendation(s);
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
        <b><Coins size={15} /> Coins {s.coins} · Kills {s.kills}</b>
        <b>Day {s.day} · {s.phase.toUpperCase()}</b>
      </div>
      <div className="actions primary-actions">
        {s.phase === 'build' && <button onClick={s.start}><Play size={16} />Start Raid</button>}
        {s.phase === 'victory' && <button onClick={() => s.next()}><StepForward size={16} />Next Day: Core Patch</button>}
        {s.phase === 'defeat' && <button onClick={s.restartGame}><RotateCcw size={16} />Restart</button>}
        {s.phase === 'raid' && <button onClick={s.togglePause}><Pause size={16} />{s.paused ? 'Resume' : 'Pause'}</button>}
      </div>
      {s.phase === 'raid' && (
        <div className="wave-progress" aria-label={`Raid progress ${cleared} of ${s.totalRaiders} raiders cleared, ${s.coreHits} core hits`}>
          <div>
            <strong>Raid Progress</strong>
            <span>{cleared}/{s.totalRaiders} cleared · Core hits {s.coreHits}</span>
          </div>
          <div className="wave-meter"><span style={{ width: `${progressPct}%` }} /></div>
          <div className="alive-mix" aria-label={`Alive raid mix: ${raidBreakdown.mix.grunt} grunts, ${raidBreakdown.mix.runner} runners, ${raidBreakdown.mix.brute} brutes`}>
            <b>Alive Mix</b>
            <span>Grunt {raidBreakdown.mix.grunt}</span>
            <span>Runner {raidBreakdown.mix.runner}</span>
            <span>Brute {raidBreakdown.mix.brute}</span>
          </div>
          <div className={`breach-alert ${raidPressure.level}`} aria-label={`Breach alert: ${raidPressure.label}`}>
            <b>{raidPressure.label}</b>
            <span>{raidPressure.nearestDistance === null ? 'No active raiders' : `${raidPressure.nearestKind?.toUpperCase()} · ${raidPressure.nearestDistance} tiles from core`}</span>
            <em>{raidPressure.advice}</em>
          </div>
          {raidBreakdown.mostThreatening && <small>Focus call: {raidBreakdown.mostThreatening.toUpperCase()} pressure is still on the board.</small>}
          <small>Combo x{Math.max(1, s.combo)} · every 3-kill streak pays +1 bonus coin</small>
        </div>
      )}
      {s.phase === 'build' && (
        <div className="raid-preview" aria-label={`Next raid forecast: ${plan.total} raiders, danger lane ${plan.dangerLane}`}>
          <strong>Next Raid Forecast</strong>
          <span>Lane X{plan.dangerLane} 집중 · {plan.total}명 · {plan.threat.label} threat</span>
          <div className="threat-meter" aria-label={`Threat score ${plan.threat.score}`}>
            <i style={{ width: `${Math.min(100, plan.threat.score * 3)}%` }} />
          </div>
          <em>보드의 주황색 줄이 이번 빌드에서 우선 막아야 할 예상 주공 루트입니다.</em>
          <em>{plan.threat.advice}</em>
          <em>Grunt {plan.mix.grunt} · Runner {plan.mix.runner} · Brute {plan.mix.brute}</em>
          <small>Base 보급: Wall {nextReward.wall} · Trap {nextReward.trap} · Tower {nextReward.turret} · Frost {nextReward.frost}</small>
        </div>
      )}
      {s.phase === 'build' && (
        <div className={`build-readiness ${readiness.ready ? 'ready' : 'warning'}`} aria-label={`Build coach: ${readiness.label}`}>
          <strong>Build Coach · {readiness.label}</strong>
          <span>{readiness.advice}</span>
          <small>
            추천 최소치 Wall {readiness.recommended.wall} · Trap {readiness.recommended.trap} · Tower {readiness.recommended.turret} · Frost {readiness.recommended.frost}
          </small>
          {Object.keys(readiness.missing).length > 0 && (
            <em>
              부족: {Object.entries(readiness.missing).map(([type, amount]) => `${type} +${amount}`).join(' · ')}
            </em>
          )}
        </div>
      )}
      <div className="combat-log" aria-label="Recent combat feedback">
        <strong>Combat Feedback</strong>
        {s.combatLog.map((event, index) => <span key={`${event}-${index}`}>{event}</span>)}
      </div>
      {s.phase === 'victory' && (
        <div className="reward-choices" aria-label="Choose next day reward">
          {s.lastClearGrade && (
            <div className="clear-grade" aria-label={`${s.lastClearGrade.stars} star clear rating`}>
              <strong>{'★'.repeat(s.lastClearGrade.stars)}{'☆'.repeat(3 - s.lastClearGrade.stars)} {s.lastClearGrade.label}</strong>
              <span>Core hits {s.coreHits} · Bonus +{s.lastClearGrade.bonusCoins} coins</span>
            </div>
          )}
          <strong>Choose Clear Reward</strong>
          <span>다음 Day 보급 방향을 하나 고르세요.</span>
          <div className="reward-coach" aria-label={`Recommended reward: ${rewardRecommendation.label}`}>
            <b>{rewardRecommendation.label}</b>
            <em>{rewardRecommendation.reason}</em>
          </div>
          <div>
            {REWARD_OPTIONS.map((reward) => (
              <button key={reward.id} className={reward.id === rewardRecommendation.id ? 'recommended' : ''} onClick={() => s.next(reward.id)}>
                <b>{reward.title}{reward.id === rewardRecommendation.id ? ' · Recommended' : ''}</b>
                <small>{reward.description}</small>
              </button>
            ))}
          </div>
        </div>
      )}
      <p className="hint"><Shield size={14} /> 마우스 위치에 선택 블록 고스트 미리보기 · 좌클릭 배치 · 우클릭 회수 · 1 벽 · 2 스파이크 · 3 타워 · 4 얼음 · Space 일시정지</p>
    </section>
  );
}
