import { useGameStore } from '../store/gameStore';
import { getPlacementHint, getSpendRecommendation, SUPPLY_OPTIONS, UPGRADE_OPTIONS } from '../game/simulation';
import type { BlockType, UpgradeChoice } from '../game/types';

const blocks: Array<{ type: BlockType; hotkey: string; name: string; desc: string }> = [
  { type: 'wall', hotkey: '1', name: 'Stone Wall', desc: '길을 꺾고 시간을 버는 방벽' },
  { type: 'trap', hotkey: '2', name: 'Spike Trap', desc: '밟으면 큰 피해, 1회용' },
  { type: 'turret', hotkey: '3', name: 'Bolt Tower', desc: '주변 적을 자동 사격' },
  { type: 'frost', hotkey: '4', name: 'Frost Rune', desc: '피해 + 둔화로 킬존 고정' },
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
    <aside className="build-panel">
      <span>Build Kit</span>
      <div className="palette">
        {blocks.map((block) => (
          <button key={block.type} className={s.selected === block.type ? 'active' : ''} onClick={() => s.select(block.type)}>
            <strong>{block.hotkey} {block.name}</strong>
            <em>{block.desc}</em>
            <b>{s.resources[block.type]}</b>
          </button>
        ))}
      </div>
      {s.phase === 'build' && (
        <div className="placement-hint" aria-label={`Placement coach: ${placementHint.title}`}>
          <strong>Placement Coach · {placementHint.title}</strong>
          <span>{placementHint.reason}</span>
          <div>
            {placementHint.cells.map((cell) => (
              <small key={`${cell.x}-${cell.z}`} className={cell.occupied ? 'occupied' : 'open'}>
                X{cell.x} Z{cell.z} · {cell.occupied ? 'blocked' : 'open'}
              </small>
            ))}
          </div>
        </div>
      )}
      <div className="coin-shop" aria-label="Build phase coin shop">
        <strong>Coin Shop</strong>
        <span>승리 보너스/킬 코인을 다음 웨이브 보급으로 즉시 전환하세요.</span>
        <div className={`spend-coach ${spendCoach.kind}`} aria-label={`Coin spend recommendation: ${spendCoach.label}`}>
          <b>{spendCoach.label}</b>
          <em>{spendCoach.reason}</em>
        </div>
        {SUPPLY_OPTIONS.map((supply) => (
          <button key={supply.id} className={spendCoach.kind === 'supply' && spendCoach.id === supply.id ? 'recommended' : ''} disabled={s.phase !== 'build' || s.coins < supply.cost} onClick={() => s.buy(supply.id)}>
            <b>{supply.title}{spendCoach.kind === 'supply' && spendCoach.id === supply.id ? ' · Recommended' : ''}</b>
            <em>{supply.description}</em>
            <small>{supply.cost} coins</small>
          </button>
        ))}
      </div>
      <div className="upgrade-shop" aria-label="Permanent kill zone upgrades">
        <strong>Upgrade Bench</strong>
        <span>코인을 즉시 소모해 타워/함정/빙결 성능을 영구 강화합니다.</span>
        {UPGRADE_OPTIONS.map((upgrade) => {
          const level = s.upgrades[upgradeLevelKey[upgrade.id]];
          const maxed = level >= upgrade.maxLevel;
          return (
            <button key={upgrade.id} className={spendCoach.kind === 'upgrade' && spendCoach.id === upgrade.id ? 'recommended' : ''} disabled={s.phase !== 'build' || maxed || s.coins < upgrade.cost} onClick={() => s.upgrade(upgrade.id)}>
              <b>{upgrade.title}{spendCoach.kind === 'upgrade' && spendCoach.id === upgrade.id ? ' · Recommended' : ''}</b>
              <small>Lv {level}/{upgrade.maxLevel} · {maxed ? 'MAX' : `${upgrade.cost} coins`}</small>
              <em>{upgrade.description}</em>
            </button>
          );
        })}
      </div>
      <small>참조 방향: Roblox Build to Survive처럼 짓고, Bloons/Orcs Must Die처럼 킬존으로 막는 구조.</small>
    </aside>
  );
}
