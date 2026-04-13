// ============================================================
// Character Definitions — Car Dealership Scenario
// Pure TS, no React
// ============================================================

export interface CharacterDefinition {
  id: string;
  name: { uz: string; ru: string };
  role: string;
  emotions: string[];
  assetPath: (emotion: string) => string;
  /** Native sprite dimensions for next/image sizing. */
  dimensions: { width: number; height: number };
}

function makeAssetPath(id: string) {
  return (emotion: string) =>
    `/assets/scenarios/car-dealership/characters/chr_${id}_${emotion}.webp`;
}

// --- Team Characters ---

const DEFAULT_DIMS = { width: 765, height: 1024 };

const rustam: CharacterDefinition = {
  id: 'rustam',
  name: { uz: 'Rustam', ru: 'Rustam' },
  role: 'manager',
  emotions: ['friendly', 'serious', 'proud', 'disappointed', 'neutral'],
  assetPath: makeAssetPath('rustam'),
  dimensions: DEFAULT_DIMS,
};

const dilnoza: CharacterDefinition = {
  id: 'dilnoza',
  name: { uz: 'Dilnoza', ru: 'Dilnoza' },
  role: 'mentor',
  emotions: ['neutral', 'smirk', 'helpful', 'explaining', 'proud'],
  assetPath: makeAssetPath('dilnoza'),
  dimensions: DEFAULT_DIMS,
};

const anvar: CharacterDefinition = {
  id: 'anvar',
  name: { uz: 'Anvar', ru: 'Anvar' },
  role: 'colleague',
  emotions: ['nervous', 'eager', 'embarrassed', 'worried'],
  assetPath: makeAssetPath('anvar'),
  dimensions: DEFAULT_DIMS,
};

// --- Client Characters ---

const bobur: CharacterDefinition = {
  id: 'bobur',
  name: { uz: 'Bobur', ru: 'Bobur' },
  role: 'client',
  emotions: ['neutral', 'thoughtful', 'interested', 'happy', 'surprised'],
  assetPath: makeAssetPath('bobur'),
  dimensions: DEFAULT_DIMS,
};

const kamola: CharacterDefinition = {
  id: 'kamola',
  name: { uz: 'Kamola', ru: 'Kamola' },
  role: 'client',
  emotions: ['confident', 'skeptical', 'impressed', 'checking', 'neutral', 'approving'],
  assetPath: makeAssetPath('kamola'),
  dimensions: DEFAULT_DIMS,
};

const javlon: CharacterDefinition = {
  id: 'javlon',
  name: { uz: 'Javlon', ru: 'Javlon' },
  role: 'client',
  emotions: ['stubborn', 'thinking', 'touched', 'neutral', 'softened'],
  assetPath: makeAssetPath('javlon'),
  dimensions: DEFAULT_DIMS,
};

const nilufar: CharacterDefinition = {
  id: 'nilufar',
  name: { uz: 'Nilufar', ru: 'Nilufar' },
  role: 'client',
  emotions: ['worried', 'thoughtful', 'happy', 'caring'],
  assetPath: makeAssetPath('nilufar'),
  dimensions: DEFAULT_DIMS,
};

const abdullaev: CharacterDefinition = {
  id: 'abdullaev',
  name: { uz: 'Abdullayev', ru: 'Abdullayev' },
  role: 'client',
  emotions: ['impatient', 'neutral', 'impressed', 'poker', 'evaluating'],
  assetPath: makeAssetPath('abdullaev'),
  dimensions: DEFAULT_DIMS,
};

const sardor: CharacterDefinition = {
  id: 'sardor',
  name: { uz: 'Sardor', ru: 'Sardor' },
  role: 'client',
  emotions: [
    'neutral',
    'testing',
    'revealing',
    'impressed',
    'satisfied',
    'testing_notes',
    'observing',
    'neutral_alt',
    'measured',
  ],
  assetPath: makeAssetPath('sardor'),
  dimensions: DEFAULT_DIMS,
};

// --- Registry ---

export const CHARACTERS: Record<string, CharacterDefinition> = {
  rustam,
  dilnoza,
  anvar,
  bobur,
  kamola,
  javlon,
  nilufar,
  abdullaev,
  sardor,
};

export const TEAM_IDS = ['rustam', 'dilnoza', 'anvar'] as const;
export const CLIENT_IDS = [
  'bobur',
  'kamola',
  'javlon',
  'nilufar',
  'abdullaev',
  'sardor',
] as const;

export function getCharacter(id: string): CharacterDefinition | undefined {
  return CHARACTERS[id];
}

export function getAllCharacters(): CharacterDefinition[] {
  return Object.values(CHARACTERS);
}
