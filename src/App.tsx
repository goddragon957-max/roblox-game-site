import { GameHud } from './components/GameHud';
import { PixiGame } from './render/PixiGame';

export default function App() {
  return (
    <main id="app" data-ui-pass="moonleaf-2d-action-rpg">
      <PixiGame />
      <GameHud />
    </main>
  );
}
