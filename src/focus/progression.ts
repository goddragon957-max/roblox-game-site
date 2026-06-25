export type PlanetRarity = 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';

export type FocusPlanet = {
  id: string;
  name: string;
  rarity: PlanetRarity;
  color: string;
  accent: string;
  minutesRequired: number;
  orbitRadius: number;
};

export type FocusState = {
  currentPlanet: FocusPlanet;
  galaxy: FocusPlanet[];
  progress: number;
  isFocusing: boolean;
  energy: number;
  minutes: number;
  births: number;
};

export const PLANET_CATALOG: FocusPlanet[] = [
  { id: 'saturn-seed', name: '토성', rarity: 'Legendary', color: '#f7d889', accent: '#fff0be', minutesRequired: 21, orbitRadius: 8.5 },
  { id: 'orbis-azure', name: '오르비스', rarity: 'Epic', color: '#8ee7ff', accent: '#d8fbff', minutesRequired: 25, orbitRadius: 9.6 },
  { id: 'lania-violet', name: '라니아', rarity: 'Rare', color: '#d69cff', accent: '#f3ddff', minutesRequired: 18, orbitRadius: 7.7 },
  { id: 'lumen-ember', name: '루멘', rarity: 'Epic', color: '#ffae7a', accent: '#ffe1c9', minutesRequired: 32, orbitRadius: 10.4 },
  { id: 'asra-mint', name: '아스라', rarity: 'Mythic', color: '#baff9c', accent: '#efffde', minutesRequired: 45, orbitRadius: 11.5 },
  { id: 'nox-pearl', name: '녹스', rarity: 'Rare', color: '#f3f5ff', accent: '#aeb8ff', minutesRequired: 15, orbitRadius: 6.8 }
];

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const nextPlanet = (births: number) => PLANET_CATALOG[births % PLANET_CATALOG.length];

export function createInitialFocusState(): FocusState {
  return {
    currentPlanet: PLANET_CATALOG[0],
    galaxy: PLANET_CATALOG.slice(0, 3),
    progress: 0,
    isFocusing: false,
    energy: 120,
    minutes: 21,
    births: 3
  };
}

export function addFocusBurst(state: FocusState, amount = 0.18): FocusState {
  const safeAmount = Math.max(0, amount);
  return {
    ...state,
    progress: clamp01(state.progress + safeAmount),
    energy: state.energy + Math.max(1, Math.round(safeAmount * 80)),
    minutes: state.minutes + Math.max(1, Math.ceil(safeAmount * 6))
  };
}

export function tickFocus(state: FocusState, seconds: number): FocusState {
  if (!state.isFocusing || seconds <= 0) return state;

  return {
    ...state,
    progress: clamp01(state.progress + seconds * 0.023),
    energy: state.energy + seconds * 0.7,
    minutes: state.minutes + seconds / 60
  };
}

export function completeBirth(state: FocusState): FocusState {
  const births = state.births + 1;
  const born = nextPlanet(births);
  return {
    ...state,
    currentPlanet: born,
    galaxy: [...state.galaxy, born],
    progress: 0,
    isFocusing: false,
    energy: Math.round(state.energy + born.minutesRequired * 4),
    minutes: Math.round(state.minutes + born.minutesRequired),
    births
  };
}

export function formatMinutes(minutes: number): string {
  return `${Math.max(0, Math.round(minutes))}m`;
}

export function formatEnergy(energy: number): string {
  return `+${Math.max(0, Math.round(energy))}`;
}
