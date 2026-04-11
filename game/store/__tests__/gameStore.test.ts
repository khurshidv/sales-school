import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../gameStore';
import type { Day, PlayerState, ScenarioNode } from '@/game/engine/types';

// --- Minimal test day fixture ---

function createTestDay(overrides?: Partial<Day>): Day {
  const nodes: Record<string, ScenarioNode> = {
    intro: {
      id: 'intro',
      type: 'day_intro',
      background: 'bg.jpg',
      title: { uz: 'Kirish', ru: 'Вступление' },
      nextNodeId: 'dialogue1',
    },
    dialogue1: {
      id: 'dialogue1',
      type: 'dialogue',
      speaker: 'manager',
      emotion: null,
      text: { uz: 'Salom!', ru: 'Привет!' },
      nextNodeId: 'choice1',
    },
    choice1: {
      id: 'choice1',
      type: 'choice',
      prompt: { uz: 'Tanlang', ru: 'Выберите' },
      choices: [
        {
          id: 'c1a',
          text: { uz: 'A', ru: 'A' },
          nextNodeId: 'after_choice',
          effects: [{ type: 'add_score', dimension: 'empathy', amount: 10 }],
        },
        {
          id: 'c1b',
          text: { uz: 'B', ru: 'B' },
          nextNodeId: 'after_choice',
          effects: [{ type: 'lose_life' }],
        },
      ],
      timeLimit: 15,
      expireNodeId: 'timeout_node',
    },
    after_choice: {
      id: 'after_choice',
      type: 'dialogue',
      speaker: 'manager',
      emotion: 'happy',
      text: { uz: 'Yaxshi!', ru: 'Хорошо!' },
      nextNodeId: 'end1',
    },
    timeout_node: {
      id: 'timeout_node',
      type: 'dialogue',
      speaker: 'narrator',
      emotion: null,
      text: { uz: 'Vaqt tugadi', ru: 'Время вышло' },
      nextNodeId: 'end1',
    },
    condition1: {
      id: 'condition1',
      type: 'condition_branch',
      branches: [
        { condition: { type: 'score_gte', value: 10 }, nextNodeId: 'after_choice' },
      ],
      fallbackNodeId: 'timeout_node',
    },
    end1: {
      id: 'end1',
      type: 'end',
      outcome: 'success',
      effects: [],
    },
    multi_choice: {
      id: 'multi_choice',
      type: 'choice',
      prompt: { uz: 'Tanlang 2 ta', ru: 'Выберите 2' },
      multiSelect: { count: 2 },
      choices: [
        {
          id: 'mc1',
          text: { uz: 'X', ru: 'X' },
          nextNodeId: 'after_choice',
          effects: [{ type: 'add_score', dimension: 'rapport', amount: 5 }],
        },
        {
          id: 'mc2',
          text: { uz: 'Y', ru: 'Y' },
          nextNodeId: 'after_choice',
          effects: [{ type: 'add_score', dimension: 'timing', amount: 5 }],
        },
        {
          id: 'mc3',
          text: { uz: 'Z', ru: 'Z' },
          nextNodeId: 'after_choice',
          effects: [{ type: 'add_score', dimension: 'expertise', amount: 5 }],
        },
      ],
    },
  };

  return {
    id: 'test-day-1',
    dayNumber: 1,
    title: { uz: '1-kun', ru: 'День 1' },
    rootNodeId: 'intro',
    nodes,
    targetScore: 30,
    ...overrides,
  };
}

describe('gameStore', () => {
  beforeEach(() => {
    useGameStore.setState({
      session: null,
      currentDay: null,
      currentNode: null,
    });
  });

  it('session is null before startDay', () => {
    const { session } = useGameStore.getState();
    expect(session).toBeNull();
  });

  it('startDay creates session with correct defaults', () => {
    const day = createTestDay();
    useGameStore.getState().startDay('car-dealership', day);

    const { session } = useGameStore.getState();
    expect(session).not.toBeNull();
    expect(session!.scenarioId).toBe('car-dealership');
    expect(session!.dayIndex).toBe(0);
    expect(session!.lives).toBe(3);
    expect(session!.score.total).toBe(0);
    expect(session!.choiceHistory).toEqual([]);
    expect(session!.flags).toEqual({});
  });

  it('startDay sets currentNode to root node', () => {
    const day = createTestDay();
    useGameStore.getState().startDay('car-dealership', day);

    const { currentNode } = useGameStore.getState();
    expect(currentNode).not.toBeNull();
    expect(currentNode!.id).toBe('intro');
    expect(currentNode!.type).toBe('day_intro');
  });

  it('advanceDialogue on dialogue node moves to next node', () => {
    const day = createTestDay();
    useGameStore.getState().startDay('car-dealership', day);

    // Advance past day_intro
    useGameStore.getState().advanceDialogue();
    const { currentNode } = useGameStore.getState();
    expect(currentNode!.id).toBe('dialogue1');

    // Advance past dialogue1
    useGameStore.getState().advanceDialogue();
    const { currentNode: next } = useGameStore.getState();
    expect(next!.id).toBe('choice1');
  });

  it('advanceDialogue auto-advances through condition_branch', () => {
    // Create a day where dialogue leads to condition_branch
    const day = createTestDay();
    // Manually set up: after dialogue1 -> condition1 (which checks score_gte 10)
    (day.nodes['dialogue1'] as any).nextNodeId = 'condition1';

    useGameStore.getState().startDay('car-dealership', day);

    // Advance past intro to dialogue1
    useGameStore.getState().advanceDialogue();
    expect(useGameStore.getState().currentNode!.id).toBe('dialogue1');

    // Advance past dialogue1 -> condition1 (score is 0, so fallback to timeout_node)
    useGameStore.getState().advanceDialogue();
    expect(useGameStore.getState().currentNode!.id).toBe('timeout_node');
  });

  it('selectChoice applies effects and moves to next node', () => {
    const day = createTestDay();
    useGameStore.getState().startDay('car-dealership', day);

    // Navigate to choice node
    useGameStore.getState().advanceDialogue(); // intro -> dialogue1
    useGameStore.getState().advanceDialogue(); // dialogue1 -> choice1

    expect(useGameStore.getState().currentNode!.id).toBe('choice1');

    // Select choice 0 (adds 10 empathy)
    useGameStore.getState().selectChoice(0);

    const { session, currentNode } = useGameStore.getState();
    expect(session!.score.total).toBe(10);
    expect(session!.score.dimensions.empathy).toBe(10);
    expect(currentNode!.id).toBe('after_choice');
  });

  it('selectChoice updates choiceHistory', () => {
    const day = createTestDay();
    useGameStore.getState().startDay('car-dealership', day);

    // Navigate to choice node
    useGameStore.getState().advanceDialogue();
    useGameStore.getState().advanceDialogue();

    useGameStore.getState().selectChoice(0);

    const { session } = useGameStore.getState();
    expect(session!.choiceHistory).toHaveLength(1);
    expect(session!.choiceHistory[0].nodeId).toBe('choice1');
    expect(session!.choiceHistory[0].choiceIndex).toBe(0);
  });

  it('selectMultiChoices applies all effects', () => {
    const day = createTestDay();
    // Set currentNode to multi_choice directly
    useGameStore.getState().startDay('car-dealership', day);

    // Manually set to multi_choice node
    useGameStore.setState({
      currentNode: day.nodes['multi_choice'],
      session: {
        ...useGameStore.getState().session!,
        currentNodeId: 'multi_choice',
      },
    });

    useGameStore.getState().selectMultiChoices([0, 1]);

    const { session } = useGameStore.getState();
    expect(session!.score.dimensions.rapport).toBe(5);
    expect(session!.score.dimensions.timing).toBe(5);
    expect(session!.score.total).toBe(10);
  });

  it('timerExpired transitions to expireNodeId', () => {
    const day = createTestDay();
    useGameStore.getState().startDay('car-dealership', day);

    // Navigate to choice node with expireNodeId
    useGameStore.getState().advanceDialogue();
    useGameStore.getState().advanceDialogue();
    expect(useGameStore.getState().currentNode!.id).toBe('choice1');

    useGameStore.getState().timerExpired();

    const { currentNode, session } = useGameStore.getState();
    expect(currentNode!.id).toBe('timeout_node');
    expect(session!.currentNodeId).toBe('timeout_node');
  });

  it('resetDay clears score/flags but keeps lives', () => {
    const day = createTestDay();
    useGameStore.getState().startDay('car-dealership', day);

    // Navigate and make a choice to add score and modify state
    useGameStore.getState().advanceDialogue();
    useGameStore.getState().advanceDialogue();
    useGameStore.getState().selectChoice(0);

    // Verify score was added
    expect(useGameStore.getState().session!.score.total).toBe(10);

    // Manually reduce lives to test preservation
    useGameStore.setState({
      session: { ...useGameStore.getState().session!, lives: 2 },
    });

    useGameStore.getState().resetDay(day);

    const { session, currentNode } = useGameStore.getState();
    expect(session!.score.total).toBe(0);
    expect(session!.flags).toEqual({});
    expect(session!.lives).toBe(2);
    expect(currentNode!.id).toBe('intro');
  });

  // ==========================================================
  // Choice timer lifecycle — regression coverage for the bug
  // where entering a timed choice never populated timerState,
  // leaving the visible progress bar forever hidden.
  // ==========================================================

  describe('choice timer lifecycle', () => {
    it('entering a timed choice starts timerState', () => {
      const day = createTestDay();
      useGameStore.getState().startDay('car-dealership', day);

      // intro -> dialogue1 — no timer yet
      useGameStore.getState().advanceDialogue();
      expect(useGameStore.getState().session!.timerState).toBeNull();

      // dialogue1 -> choice1 (has timeLimit: 15) — timer must start
      useGameStore.getState().advanceDialogue();
      const { session, currentNode } = useGameStore.getState();
      expect(currentNode!.id).toBe('choice1');
      expect(session!.timerState).not.toBeNull();
      expect(session!.timerState!.duration).toBe(15);
      expect(session!.timerState!.remaining).toBe(15);
      expect(session!.timerState!.pausedAt).toBeNull();
    });

    it('selectChoice clears timerState when leaving a timed choice', () => {
      const day = createTestDay();
      useGameStore.getState().startDay('car-dealership', day);

      useGameStore.getState().advanceDialogue(); // intro -> dialogue1
      useGameStore.getState().advanceDialogue(); // dialogue1 -> choice1
      expect(useGameStore.getState().session!.timerState).not.toBeNull();

      useGameStore.getState().selectChoice(0); // -> after_choice (dialogue)
      expect(useGameStore.getState().currentNode!.id).toBe('after_choice');
      expect(useGameStore.getState().session!.timerState).toBeNull();
    });

    it('timerExpired routes to expireNodeId and clears timerState', () => {
      const day = createTestDay();
      useGameStore.getState().startDay('car-dealership', day);

      useGameStore.getState().advanceDialogue();
      useGameStore.getState().advanceDialogue();
      expect(useGameStore.getState().session!.timerState).not.toBeNull();

      useGameStore.getState().timerExpired();

      const { currentNode, session } = useGameStore.getState();
      expect(currentNode!.id).toBe('timeout_node');
      expect(session!.timerState).toBeNull();
    });

    it('pauseTimer freezes the remaining time', () => {
      const day = createTestDay();
      useGameStore.getState().startDay('car-dealership', day);
      useGameStore.getState().advanceDialogue();
      useGameStore.getState().advanceDialogue();

      const beforePause = useGameStore.getState().session!.timerState!;
      expect(beforePause.pausedAt).toBeNull();

      useGameStore.getState().pauseTimer();

      const afterPause = useGameStore.getState().session!.timerState!;
      expect(afterPause.pausedAt).not.toBeNull();
      // Remaining is frozen at pause time (≤ original 15)
      expect(afterPause.remaining).toBeLessThanOrEqual(15);
      expect(afterPause.remaining).toBeGreaterThan(0);
    });

    it('resumeTimer unfreezes a paused timer', () => {
      const day = createTestDay();
      useGameStore.getState().startDay('car-dealership', day);
      useGameStore.getState().advanceDialogue();
      useGameStore.getState().advanceDialogue();
      useGameStore.getState().pauseTimer();

      expect(useGameStore.getState().session!.timerState!.pausedAt).not.toBeNull();

      useGameStore.getState().resumeTimer();
      expect(useGameStore.getState().session!.timerState!.pausedAt).toBeNull();
    });

    it('pauseTimer / resumeTimer are noops when no timer is active', () => {
      const day = createTestDay();
      useGameStore.getState().startDay('car-dealership', day);

      // On day_intro node, no timer active
      expect(useGameStore.getState().session!.timerState).toBeNull();

      useGameStore.getState().pauseTimer();
      useGameStore.getState().resumeTimer();

      expect(useGameStore.getState().session!.timerState).toBeNull();
    });

    it('goBack from post-choice dialogue clears timerState', () => {
      const day = createTestDay();
      useGameStore.getState().startDay('car-dealership', day);
      useGameStore.getState().advanceDialogue(); // -> dialogue1
      useGameStore.getState().advanceDialogue(); // -> choice1 (timer starts)
      useGameStore.getState().selectChoice(0);   // -> after_choice (timer cleared)

      expect(useGameStore.getState().currentNode!.id).toBe('after_choice');

      // goBack from after_choice should return to dialogue1 (choice is skipped)
      useGameStore.getState().goBack();
      const { currentNode, session } = useGameStore.getState();
      expect(currentNode!.type).toBe('dialogue');
      expect(session!.timerState).toBeNull();
    });

    it('goBack then advanceDialogue restarts a fresh timer', () => {
      const day = createTestDay();
      useGameStore.getState().startDay('car-dealership', day);
      useGameStore.getState().advanceDialogue();
      useGameStore.getState().advanceDialogue(); // on choice1, timer running
      useGameStore.getState().selectChoice(0);   // -> after_choice
      useGameStore.getState().goBack();          // -> dialogue1 (timer cleared)

      expect(useGameStore.getState().session!.timerState).toBeNull();

      // Re-advance into the choice — a brand-new timer should start
      useGameStore.getState().advanceDialogue();
      const { currentNode, session } = useGameStore.getState();
      expect(currentNode!.id).toBe('choice1');
      expect(session!.timerState).not.toBeNull();
      expect(session!.timerState!.duration).toBe(15);
      expect(session!.timerState!.remaining).toBe(15);
    });
  });
});
