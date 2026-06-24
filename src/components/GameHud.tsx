import type { ReactNode } from 'react';
import { Heart, RotateCcw, Sparkles, Swords, Zap } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

export function GameHud() {
  const hero = useGameStore((state) => state.hero);
  const quest = useGameStore((state) => state.quest);
  const status = useGameStore((state) => state.status);
  const message = useGameStore((state) => state.message);
  const start = useGameStore((state) => state.start);
  const restart = useGameStore((state) => state.restart);
  const respawn = useGameStore((state) => state.respawn);

  const hp = Math.max(0, Math.round((hero.hp / hero.maxHp) * 100));
  const mp = Math.max(0, Math.round((hero.mp / hero.maxMp) * 100));
  const exp = Math.max(0, Math.round((hero.exp / hero.expToNext) * 100));

  return (
    <div className="hud-shell">
      <section className="hud-top" aria-label="Game status">
        <div className="hero-chip">
          <div className="portrait" aria-hidden="true">M</div>
          <div>
            <div className="hero-name">Miri</div>
            <div className="hero-sub">Lv {hero.level} Leafblade</div>
          </div>
        </div>

        <div className="bars">
          <Meter icon={<Heart size={16} />} label="HP" value={hp} text={`${Math.ceil(hero.hp)}/${hero.maxHp}`} tone="hp" />
          <Meter icon={<Zap size={16} />} label="MP" value={mp} text={`${Math.ceil(hero.mp)}/${hero.maxMp}`} tone="mp" />
          <Meter icon={<Sparkles size={16} />} label="EXP" value={exp} text={`${hero.exp}/${hero.expToNext}`} tone="exp" />
        </div>

        <div className="coin-box">
          <span className="coin-dot" />
          <strong>{hero.coins}</strong>
          <span>coins</span>
        </div>
      </section>

      <section className="quest-strip" aria-label="Current quest">
        <div>
          <div className="quest-title">{quest.title}</div>
          <div className="quest-copy">{message}</div>
        </div>
        <div className="quest-progress">{quest.defeated}/{quest.target}</div>
      </section>

      <section className="hud-bottom" aria-label="Controls">
        <div className="control-pills">
          <span>WASD / Arrows move</span>
          <span>Space / W jump</span>
          <span>J / K attack</span>
        </div>
        {status === 'ready' ? (
          <button className="primary-action" onClick={start}>
            <Swords size={18} /> Start Adventure
          </button>
        ) : status === 'defeated' ? (
          <button className="primary-action danger" onClick={respawn}>
            <RotateCcw size={18} /> Respawn
          </button>
        ) : status === 'won' ? (
          <button className="primary-action" onClick={restart}>
            <Sparkles size={18} /> Play Again
          </button>
        ) : null}
      </section>

      {status === 'won' ? <div className="center-banner">Quest Complete</div> : null}
      {status === 'defeated' ? <div className="center-banner danger">You Fainted</div> : null}
    </div>
  );
}

function Meter({ icon, label, value, text, tone }: { icon: ReactNode; label: string; value: number; text: string; tone: 'hp' | 'mp' | 'exp' }) {
  return (
    <div className={`meter ${tone}`}>
      <div className="meter-label">
        {icon}
        <span>{label}</span>
        <strong>{text}</strong>
      </div>
      <div className="meter-track">
        <div className="meter-fill" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
