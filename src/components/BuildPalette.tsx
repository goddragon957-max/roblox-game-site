import { Banknote, Hammer, PackagePlus, Sparkles } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { getPlacementHint, getSpendRecommendation, SUPPLY_OPTIONS, UPGRADE_OPTIONS } from '../game/simulation';
import type { BlockType, UpgradeChoice } from '../game/types';

const blocks: Array<{ type: BlockType; hotkey: string; name: string; desc: string }> = [
  { type: 'wall', hotkey: '1', name: 'Stone Wall', desc: 'Turns lanes and buys time' },
  { type: 'trap', hotkey: '2', name: 'Spike Trap', desc: 'Burst damage, one use' },
  { type: 'turret', hotkey: '3', name: 'Bolt Tower', desc: 'Auto-fires nearby raiders' },
  { type: 'frost', hotkey: '4', name: 'Frost Rune', desc: 'Slows enemies in the kill zone' },
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

  return (
    <aside className="build-panel" aria-label="Build controls">
      <div className="panel-title">
        <span><Hammer size={15} /> Build Kit</span>
        <b><Banknote size={15} /> {s.coins}</b>
      </div>

      <div className="palette">
        {blocks.map((block) => (
          <button key={block.type} className={s.selected === block.type ? 'active' : ''} onClick={() => s.select(block.type)}>
            <span>{block.hotkey}</span>
            <strong>{block.name}</strong>
            <em>{block.desc}</em>
            <b>{s.resources[block.type]}</b>
          </button>
        ))}
      </div>

      {s.phase === 'build' && (
        <div className="placement-hint" aria-label={`Placement coach: ${placementHint.title}`}>
          <strong>Placement · {placementHint.title}</strong>
          <span>{placementHint.reason}</span>
          <div>
            {placementHint.cells.map((cell) => (
              <small key={`${cell.x}-${cell.z}`} className={cell.occupied ? 'occupied' : 'open'}>
                X{cell.x} Z{cell.z}
              </small>
            ))}
          </div>
        </div>
      )}

      <div className="shop-stack">
        <section className="coin-shop" aria-label="Build phase coin shop">
          <div className="shop-head">
            <strong><PackagePlus size={14} /> Coin Shop</strong>
            <span>{spendCoach.kind === 'supply' ? spendCoach.label : 'Add supply'}</span>
          </div>
          <em>{spendCoach.kind === 'supply' ? spendCoach.reason : 'Buy extra blocks before the raid starts.'}</em>
          {SUPPLY_OPTIONS.map((supply) => (
            <button key={supply.id} className={spendCoach.kind === 'supply' && spendCoach.id === supply.id ? 'recommended' : ''} disabled={s.phase !== 'build' || s.coins < supply.cost} onClick={() => s.buy(supply.id)}>
              <b>{supply.title}{spendCoach.kind === 'supply' && spendCoach.id === supply.id ? ' · Best' : ''}</b>
              <small>{supply.cost} coins</small>
              <em>{supply.description}</em>
            </button>
          ))}
        </section>

        <section className="upgrade-shop" aria-label="Permanent kill zone upgrades">
          <div className="shop-head">
            <strong><Sparkles size={14} /> Upgrade Bench</strong>
            <span>{spendCoach.kind === 'upgrade' ? spendCoach.label : 'Permanent'}</span>
          </div>
          <em>{spendCoach.kind === 'upgrade' ? spendCoach.reason : 'Spend coins on lasting kill-zone power.'}</em>
          {UPGRADE_OPTIONS.map((upgrade) => {
            const level = s.upgrades[upgradeLevelKey[upgrade.id]];
            const maxed = level >= upgrade.maxLevel;
            return (
              <button key={upgrade.id} className={spendCoach.kind === 'upgrade' && spendCoach.id === upgrade.id ? 'recommended' : ''} disabled={s.phase !== 'build' || maxed || s.coins < upgrade.cost} onClick={() => s.upgrade(upgrade.id)}>
                <b>{upgrade.title}{spendCoach.kind === 'upgrade' && spendCoach.id === upgrade.id ? ' · Best' : ''}</b>
                <small>Lv {level}/{upgrade.maxLevel} · {maxed ? 'MAX' : `${upgrade.cost} coins`}</small>
                <em>{upgrade.description}</em>
              </button>
            );
          })}
        </section>
      </div>
    </aside>
  );
}
