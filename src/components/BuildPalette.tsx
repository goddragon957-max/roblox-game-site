import { useGameStore } from '../store/gameStore';
import type { BlockType } from '../game/types';

const blocks: Array<{ type: BlockType; hotkey: string; name: string; desc: string }> = [
  { type: 'wall', hotkey: '1', name: 'Stone Wall', desc: '길을 꺾고 시간을 버는 방벽' },
  { type: 'trap', hotkey: '2', name: 'Spike Trap', desc: '밟으면 큰 피해, 1회용' },
  { type: 'turret', hotkey: '3', name: 'Bolt Tower', desc: '주변 적을 자동 사격' },
  { type: 'frost', hotkey: '4', name: 'Frost Rune', desc: '피해 + 둔화로 킬존 고정' },
];

export function BuildPalette() {
  const s = useGameStore();
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
      <small>참조 방향: Roblox Build to Survive처럼 짓고, Bloons/Orcs Must Die처럼 킬존으로 막는 구조.</small>
    </aside>
  );
}
