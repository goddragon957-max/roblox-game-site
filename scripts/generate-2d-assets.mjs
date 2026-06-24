import fs from 'node:fs';
import path from 'node:path';

const outDir = path.join(process.cwd(), 'public', 'assets', '2d');
fs.mkdirSync(outDir, { recursive: true });

const manifest = {
  generatedAt: new Date().toISOString(),
  direction: 'original 2D side-scrolling action RPG',
  renderer: 'Pixi.js shape/vector sprites',
  copyrightNote: 'All primary game visuals are drawn from original vector/canvas primitives in src/render/PixiGame.tsx.',
  palette: {
    leaf: '#3f8f5f',
    sky: '#b9ecff',
    moonGold: '#ffd15c',
    ember: '#ff7d66',
    ink: '#233040',
  },
};

fs.writeFileSync(path.join(outDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
console.log('Generated original 2D asset manifest at public/assets/2d/manifest.json');
