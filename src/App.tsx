import { RtsHud } from './components/RtsHud';
import { ThreeRtsScene } from './render/ThreeRtsScene';

export default function App() {
  return (
    <main id="app" data-ui-pass="puppy-frontier-rts">
      <ThreeRtsScene />
      <RtsHud />
    </main>
  );
}
