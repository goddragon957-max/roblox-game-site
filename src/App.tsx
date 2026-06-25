import { Pause, Play, Plus, RotateCcw, Sparkles } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { formatEnergy, formatMinutes } from './focus/progression';
import { SpaceFocusScene } from './render/SpaceFocusScene';
import { useFocusStore } from './store/focusStore';

export default function App() {
  const currentPlanet = useFocusStore((state) => state.currentPlanet);
  const galaxy = useFocusStore((state) => state.galaxy);
  const progress = useFocusStore((state) => state.progress);
  const isFocusing = useFocusStore((state) => state.isFocusing);
  const energy = useFocusStore((state) => state.energy);
  const minutes = useFocusStore((state) => state.minutes);
  const births = useFocusStore((state) => state.births);
  const toggleFocus = useFocusStore((state) => state.toggleFocus);
  const addBurst = useFocusStore((state) => state.addBurst);
  const reset = useFocusStore((state) => state.reset);
  const tick = useFocusStore((state) => state.tick);
  const lastFrame = useRef<number | null>(null);

  useEffect(() => {
    let raf = 0;
    const loop = (time: number) => {
      if (lastFrame.current !== null) {
        tick(Math.min(0.12, (time - lastFrame.current) / 1000));
      }
      lastFrame.current = time;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [tick]);

  const progressPct = Math.round(progress * 100);
  const nextReward = Math.max(1, Math.round(currentPlanet.minutesRequired * (1 - progress)));

  return (
    <main id="app" data-ui-pass="orbit-bloom-focus-app">
      <section className="phone-shell" aria-label="Orbit Bloom focus app">
        <SpaceFocusScene
          progress={progress}
          isFocusing={isFocusing}
          births={births}
          currentPlanet={currentPlanet}
          galaxyCount={galaxy.length}
        />
        <div className="grain" />
        <div className="ring-shine" />
        <div className="vignette" />

        <header className="status-bar" aria-label="app status">
          <span>00:34</span>
          <span className="signal-dots" aria-hidden="true"><i /><i /><i /></span>
          <span className="battery">100%</span>
        </header>

        <section className="hero-copy">
          <p className="eyebrow">Deep focus creates gravity</p>
          <h1>ORBIT<br />BLOOM</h1>
          <p className="subtitle">집중 시간이 쌓일수록 행성이 탄생하고, 나만의 은하가 조용히 성장합니다.</p>
        </section>

        <aside className="side-note">No feeds · no noise · only one orbit to protect</aside>

        <section className="focus-panel" aria-label="focus controls">
          <div className="planet-label">
            <strong>{currentPlanet.name}</strong>
            <span className="rarity"><Sparkles size={12} /> {currentPlanet.rarity}</span>
            <div className="metrics">
              <span>{formatMinutes(minutes)}</span>
              <span className="metric-star">✦</span>
              <b>{formatEnergy(energy)}</b>
            </div>
          </div>

          <div className="glass-card">
            <div className="progress-row">
              <span>Focus</span>
              <div className="progress-track" aria-label="focus progress"><div className="progress-bar" style={{ width: `${progressPct}%` }} /></div>
              <span>{progressPct}%</span>
            </div>
            <div className="reward-row">
              <span>다음 탄생까지 약 {nextReward}분</span>
              <span>{galaxy.length} planets</span>
            </div>
            <div className="actions">
              <button className="primary-action" type="button" onClick={toggleFocus}>
                {isFocusing ? <Pause size={18} /> : <Play size={18} />}
                {isFocusing ? 'Focusing… tap to pause' : 'Start focus'}
              </button>
              <button className="icon-action" type="button" aria-label="add focus energy" onClick={() => addBurst(0.24)}>
                <Plus size={20} />
              </button>
            </div>
          </div>

          <div className="galaxy-strip" aria-label="born planets">
            {galaxy.slice(-5).map((planet, index) => (
              <div
                className="mini-planet"
                key={`${planet.id}-${index}`}
                style={{ '--planet': planet.color, '--ring': planet.accent, '--tilt': `${index % 2 ? 12 : -14}deg` } as React.CSSProperties}
                title={planet.name}
              />
            ))}
            {Array.from({ length: Math.max(0, 5 - Math.min(5, galaxy.length)) }).map((_, index) => (
              <div className="mini-planet locked" key={`locked-${index}`} />
            ))}
          </div>
        </section>

        <button className="reset-button" type="button" onClick={reset} aria-label="reset focus galaxy">
          <RotateCcw size={16} />
        </button>
      </section>
    </main>
  );
}
