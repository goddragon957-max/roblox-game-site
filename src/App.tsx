import { Hud } from './components/Hud';
import { BuildPalette } from './components/BuildPalette';
import { BlockholdScene } from './render/BlockholdScene';

export default function App() {
  return (
    <main id="app" data-ui-pass="puppy-guard-toy-island">
      <BlockholdScene />
      <div className="scene-frame" aria-hidden="true" />
      <Hud />
      <BuildPalette />
    </main>
  );
}
