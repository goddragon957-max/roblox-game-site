import { Coins, Heart, Pause, Play, RotateCcw, StepForward, Target, Trophy } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { getPhaseObjective, getRaidBreakdown, getRaidPlan, getRewardRecommendation, REWARD_OPTIONS } from '../game/simulation';

const phaseLabel = {
  build: 'Build',
  raid: 'Raid',
  victory: 'Clear',
  defeat: 'Defeat',
} as const;

export function Hud() {
  const s = useGameStore();
  const plan = getRaidPlan(s.day);
  const objective = getPhaseObjective(s);
  const raid = getRaidBreakdown(s);
  const rewardRecommendation = getRewardRecommendation(s);
  const hpPct = Math.max(0, Math.round((s.coreHp / s.maxCoreHp) * 100));
  const cleared = s.totalRaiders ? s.totalRaiders - raid.alive : 0;
  const progressPct = s.totalRaiders ? Math.round((cleared / s.totalRaiders) * 100) : 0;

  return (
    <section className="hud" aria-label="Puppy Guard game HUD">
      <div className="brand-row">
        <div>
          <span>Puppy Guard</span>
          <h1>Crystal Siege</h1>
        </div>
        <b className={`phase-chip ${s.phase}`}>{phaseLabel[s.phase]}</b>
      </div>

      <div className="hud-stats" aria-label={`Day ${s.day}, core ${s.coreHp}, coins ${s.coins}`}>
        <span><Heart size={17} /> {s.coreHp}</span>
        <span><Target size={17} /> {s.phase === 'raid' ? `${cleared}/${s.totalRaiders}` : `Wave ${s.day}`}</span>
        <span><Coins size={17} /> {s.coins}</span>
      </div>

      <div className="tiny-meter" aria-label={`Core health ${hpPct}%`}>
        <i style={{ width: `${hpPct}%` }} />
      </div>

      <p className="hud-toast" role="status">{s.message}</p>

      <div className="hud-actions">
        {s.phase === 'build' && <button className="primary-game-button" onClick={s.start}><Play size={18} /> Start Raid</button>}
        {s.phase === 'raid' && <button className="primary-game-button" onClick={s.togglePause}><Pause size={18} /> {s.paused ? 'Resume' : 'Pause'}</button>}
        {s.phase === 'victory' && <button className="primary-game-button" onClick={() => s.next()}><StepForward size={18} /> Next Day</button>}
        {s.phase === 'defeat' && <button className="primary-game-button danger" onClick={s.restartGame}><RotateCcw size={18} /> Restart</button>}
      </div>

      <div className="mini-objective" aria-label={objective.label}>
        <strong>{s.phase === 'build' ? `Protect lane X${plan.dangerLane}` : objective.label}</strong>
        <span>{s.phase === 'build' ? `${plan.total} cute blobs incoming` : objective.primary}</span>
      </div>

      {s.phase === 'raid' && (
        <div className="raid-chip-panel" aria-label={`Raid progress ${cleared} of ${s.totalRaiders}`}>
          <div className="wave-meter"><i style={{ width: `${progressPct}%` }} /></div>
          <span>Alive {raid.alive}</span>
          <span>Combo x{Math.max(1, s.combo)}</span>
          <span>Kills {s.kills}</span>
        </div>
      )}

      {s.phase === 'victory' && (
        <div className="reward-choices" aria-label="Choose next day reward">
          {s.lastClearGrade && (
            <div className="clear-grade">
              <Trophy size={16} />
              <b>{'★'.repeat(s.lastClearGrade.stars)}{'☆'.repeat(3 - s.lastClearGrade.stars)} {s.lastClearGrade.label}</b>
              <span>+{s.lastClearGrade.bonusCoins} coins</span>
            </div>
          )}
          <strong>{rewardRecommendation.label}</strong>
          <div className="reward-grid">
            {REWARD_OPTIONS.map((reward) => (
              <button key={reward.id} className={reward.id === rewardRecommendation.id ? 'recommended' : ''} onClick={() => s.next(reward.id)}>
                <b>{reward.title}</b>
                <small>{reward.description}</small>
              </button>
            ))}
          </div>
        </div>
      )}

      <p className="hint">Click place · right click remove · 1-4 build · Space pause · R camera</p>
    </section>
  );
}
