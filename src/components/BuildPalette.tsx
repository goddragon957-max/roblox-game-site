import { Coins, Hammer, PackagePlus, Shield, Snowflake, Sparkles, Swords, TowerControl } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { getPlacementHint, getSpendRecommendation, SUPPLY_OPTIONS, UPGRADE_OPTIONS } from '../game/simulation';
import type { BlockType, UpgradeChoice } from '../game/types';

const blocks: Array<{ type: BlockType; hotkey: string; name: string; icon: typeof Shield }> = [
  { type: 'wall', hotkey: '1', name: 'Wall', icon: Shield },
  { type: 'trap', hotkey: '2', name: 'Spikes', icon: Swords },
  { type: 'turret', hotkey: '3', name: 'Pup Tower', icon: TowerControl },
  { type: 'frost', hotkey: '4', name: 'Frost', icon: Snowflake },
];

const upgradeLevelKey: Record<UpgradeChoice, 'towerDamage' | 'trapDamage' | 'frostDuration'> = {
  'tower-damage': 'towerDamage',
  'trap-damage': 'trapDamage',
  'frost-duration': 'frostDuration',
};

export function BuildPalette() {
  const s = useGameStore();
  const spendCoach = getSpendRecommendation(s);
  const placementHint = getPlacementHint(s);

  if (s.phase === 'raid') {
    return (
      <aside className="build-panel raid-locked" aria-label="Build controls locked during raid">
        <div className="build-title">
          <span><Hammer size={15} /> Raid running</span>
          <b><Coins size={15} /> {s.coins}</b>
        </div>
        <p>Build kit locked · watch the blobs push the lane.</p>
      </aside>
    );
  }

  return (
    <aside className="build-panel" aria-label="Build controls">
      <div className="build-title">
        <span><Hammer size={15} /> Build</span>
        <b><Coins size={15} /> {s.coins}</b>
      </div>

      <div className="palette">
        {blocks.map((block) => {
          const Icon = block.icon;
          return (
            <button key={block.type} className={s.selected === block.type ? 'active' : ''} onClick={() => s.select(block.type)}>
              <small>{block.hotkey}</small>
              <Icon size={22} />
              <strong>{block.name}</strong>
              <b>{s.resources[block.type]}</b>
            </button>
          );
        })}
      </div>

      {s.phase === 'build' && (
        <div className="placement-hint" aria-label={`Placement hint: ${placementHint.title}`}>
          <strong>{placementHint.title}</strong>
          <div>
            {placementHint.cells.map((cell) => (
              <small key={`${cell.x}-${cell.z}`} className={cell.occupied ? 'occupied' : 'open'}>
                {cell.x},{cell.z}
              </small>
            ))}
          </div>
        </div>
      )}

      <details className="shop-drawer">
        <summary><PackagePlus size={15} /> Shop <span>{spendCoach.label.replace('Spend Coach: ', '')}</span></summary>
        <div className="shop-stack">
          <section className="coin-shop" aria-label="Supply shop">
            <strong>Supplies</strong>
            {SUPPLY_OPTIONS.map((supply) => (
              <button key={supply.id} className={spendCoach.kind === 'supply' && spendCoach.id === supply.id ? 'recommended' : ''} disabled={s.phase !== 'build' || s.coins < supply.cost} onClick={() => s.buy(supply.id)}>
                <b>{supply.title}</b>
                <small>{supply.cost} coins</small>
              </button>
            ))}
          </section>

          <section className="upgrade-shop" aria-label="Upgrade shop">
            <strong><Sparkles size={14} /> Upgrades</strong>
            {UPGRADE_OPTIONS.map((upgrade) => {
              const level = s.upgrades[upgradeLevelKey[upgrade.id]];
              const maxed = level >= upgrade.maxLevel;
              return (
                <button key={upgrade.id} className={spendCoach.kind === 'upgrade' && spendCoach.id === upgrade.id ? 'recommended' : ''} disabled={s.phase !== 'build' || maxed || s.coins < upgrade.cost} onClick={() => s.upgrade(upgrade.id)}>
                  <b>{upgrade.title}</b>
                  <small>{maxed ? 'MAX' : `${upgrade.cost}c`} · Lv {level}/{upgrade.maxLevel}</small>
                </button>
              );
            })}
          </section>
        </div>
      </details>
    </aside>
  );
}
