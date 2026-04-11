// ============================================================
// Sales School Game Engine — Type Definitions
// Pure types, 0 runtime code (except const arrays)
// ============================================================

// --- 3.1 Base Types ---

export type Language = 'uz' | 'ru';
export type LocalizedText = Record<Language, string>;

export const SCORE_DIMENSIONS = [
  'empathy', 'rapport', 'timing', 'expertise',
  'persuasion', 'discovery', 'opportunity',
] as const;
export type ScoreDimension = (typeof SCORE_DIMENSIONS)[number];

export const RATINGS = ['S', 'A', 'B', 'C', 'D', 'F'] as const;
export type Rating = (typeof RATINGS)[number];

export type DayOutcome = 'success' | 'partial' | 'failure' | 'hidden_ending';

// --- 3.2 Multi-Character Positioning ---

export type CharacterPosition = 'left' | 'center' | 'right';

export interface CharacterOnScreen {
  id: string;
  emotion: string;
  position: CharacterPosition;
}

// --- 3.3 ScenarioNode (discriminated union, 7 variants) ---

export interface DialogueNode {
  id: string;
  type: 'dialogue';
  speaker: string;
  emotion: string | null;
  text: LocalizedText;
  background?: string;
  characters?: CharacterOnScreen[];
  effects?: Effect[];
  nextNodeId: string;
}

export interface ChoiceOption {
  id: string;
  text: LocalizedText;
  nextNodeId: string;
  effects: Effect[];
  condition?: Condition;
  feedbackText?: LocalizedText;
}

export interface ChoiceNode {
  id: string;
  type: 'choice';
  prompt: LocalizedText;
  choices: ChoiceOption[];
  timeLimit?: number;
  multiSelect?: { count: number };
  expireNodeId?: string;
}

export interface DayIntroNode {
  id: string;
  type: 'day_intro';
  background: string;
  title: LocalizedText;
  subtitle?: LocalizedText;
  nextNodeId: string;
}

export interface ConditionBranchNode {
  id: string;
  type: 'condition_branch';
  branches: Array<{ condition: Condition; nextNodeId: string }>;
  fallbackNodeId: string;
}

export interface ScoreNode {
  id: string;
  type: 'score';
  effects: Effect[];
  narrator?: LocalizedText;
  nextNodeId: string;
}

export interface TimerStartNode {
  id: string;
  type: 'timer_start';
  duration: number;
  expireNodeId: string;
  nextNodeId: string;
}

export interface EndNode {
  id: string;
  type: 'end';
  outcome: DayOutcome;
  effects: Effect[];
  dialogue?: {
    speaker: string;
    emotion: string | null;
    text: LocalizedText;
    /** Optional background override for the end scene. If omitted,
     * the previously-seen background is inherited (как у DialogueNode). */
    background?: string;
    characters?: CharacterOnScreen[];
  };
  nextDayTeaser?: LocalizedText;
}

export type ScenarioNode =
  | DialogueNode
  | ChoiceNode
  | DayIntroNode
  | ConditionBranchNode
  | ScoreNode
  | TimerStartNode
  | EndNode;

// --- 3.3 Condition (discriminated union, 10 variants) ---

export type Condition =
  | { type: 'score_gte'; value: number }
  | { type: 'score_lte'; value: number }
  | { type: 'flag'; flag: string }
  | { type: 'has_achievement'; achievementId: string }
  | { type: 'choice_was'; nodeId: string; choiceIndex: number }
  | { type: 'lives_gte'; value: number }
  | { type: 'level_gte'; value: number }
  | { type: 'and'; conditions: Condition[] }
  | { type: 'or'; conditions: Condition[] }
  | { type: 'not'; condition: Condition };

// --- 3.4 Effect (discriminated union, 9 variants) ---

export type Effect =
  | { type: 'add_score'; dimension: ScoreDimension; amount: number }
  | { type: 'lose_life' }
  | { type: 'gain_life' }
  | { type: 'set_flag'; flag: string }
  | { type: 'unlock_achievement'; id: string }
  | { type: 'add_xp'; amount: number }
  | { type: 'add_coins'; amount: number }
  | { type: 'add_bonus'; bonusType: string; multiplier: number }
  | { type: 'play_sound'; soundId: string };

// --- 3.5 GameEvent (discriminated union for EventBus) ---

export type GameEvent =
  | { type: 'score_changed'; dimension: ScoreDimension; amount: number; newTotal: number }
  | { type: 'life_lost'; remainingLives: number }
  | { type: 'life_gained'; remainingLives: number }
  | { type: 'achievement_unlocked'; achievementId: string; xpReward: number }
  | { type: 'combo_activated'; comboCount: number; multiplier: number }
  | { type: 'combo_reset' }
  | { type: 'day_completed'; dayIndex: number; score: number; rating: Rating; isHidden: boolean }
  | { type: 'game_over'; dayIndex: number; totalScore: number }
  | { type: 'near_miss'; currentRating: Rating; nextRating: Rating; pointsNeeded: number }
  | { type: 'timer_warning'; remaining: number }
  | { type: 'timer_expired'; nodeId: string }
  | { type: 'coins_changed'; amount: number; newTotal: number }
  | { type: 'sound_requested'; soundId: string };

// --- 3.5b NodeHistory (for back-step) ---

export interface NodeHistoryEntry {
  nodeId: string;
  sessionSnapshot: {
    score: { total: number; dimensions: DimensionScores };
    flags: Record<string, boolean>;
    lives: number;
    comboCount: number;
  };
}

// --- 3.6 State ---

export interface DimensionScores {
  empathy: number;
  rapport: number;
  timing: number;
  expertise: number;
  persuasion: number;
  discovery: number;
  opportunity: number;
}

export interface TimerState {
  startedAt: number;
  duration: number;
  pausedAt: number | null;
  remaining: number;
}

export interface DifficultyModifier {
  timerOffset: number;
  showHints: boolean;
  removeWorstChoice: boolean;
}

export interface GameSessionState {
  scenarioId: string;
  dayIndex: number;
  currentNodeId: string;
  score: {
    total: number;
    dimensions: DimensionScores;
  };
  lives: number;
  maxLives: number;
  flags: Record<string, boolean>;
  choiceHistory: Array<{
    nodeId: string;
    choiceIndex: number;
    timestamp: number;
  }>;
  nodeHistory: NodeHistoryEntry[];
  comboCount: number;
  timerState: TimerState | null;
  isReplay: boolean;
  isGameOverRestart: boolean;
  startTime: number;
  difficulty: DifficultyModifier;
}

export interface CompletedScenarioRecord {
  scenarioId: string;
  dayIndex: number;
  score: number;
  rating: Rating;
  timeTaken: number;
  isReplay: boolean;
  completedAt: number;
}

export interface PlayerState {
  id: string;
  phone: string;
  displayName: string;
  avatarId: 'male' | 'female';
  level: number;
  totalXp: number;
  totalScore: number;
  coins: number;
  achievements: string[];
  completedScenarios: CompletedScenarioRecord[];
}

// --- 3.7 Scenario & Day ---

export interface Day {
  id: string;
  dayNumber: number;
  title: LocalizedText;
  rootNodeId: string;
  nodes: Record<string, ScenarioNode>;
  targetScore: number;
  nextDayTeaser?: LocalizedText;
}

export interface Scenario {
  id: string;
  productId: string;
  title: LocalizedText;
  description: LocalizedText;
  days: Day[];
  requiredLevel: number;
}

// --- Helper: create empty dimension scores ---

export function createEmptyDimensionScores(): DimensionScores {
  return {
    empathy: 0, rapport: 0, timing: 0,
    expertise: 0, persuasion: 0, discovery: 0, opportunity: 0,
  };
}

// --- Helper: create initial game session ---

export function createInitialGameSession(
  scenarioId: string,
  dayIndex: number,
  rootNodeId: string,
): GameSessionState {
  return {
    scenarioId,
    dayIndex,
    currentNodeId: rootNodeId,
    score: { total: 0, dimensions: createEmptyDimensionScores() },
    lives: 3,
    maxLives: 5,
    flags: {},
    choiceHistory: [],
    nodeHistory: [],
    comboCount: 0,
    timerState: null,
    isReplay: false,
    isGameOverRestart: false,
    startTime: Date.now(),
    difficulty: { timerOffset: 0, showHints: false, removeWorstChoice: false },
  };
}
