'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useState, useEffect, useRef, useCallback } from 'react';
import { useGameEngine } from '@/lib/game/hooks/useGameEngine';
import { useTimer } from '@/lib/game/hooks/useTimer';
import { useAudio } from '@/lib/game/hooks/useAudio';
import { useLang } from '@/lib/game/utils/lang';
import { CHARACTERS } from '@/game/data/characters/index';
import { canReplay } from '@/game/systems/CoinSystem';
import { trackEvent } from '@/lib/game/analytics';
import SceneRenderer from '@/components/game/engine/SceneRenderer';
import DialogueBox, { type DialogueBoxHandle } from '@/components/game/engine/DialogueBox';
import ChoicePanel from '@/components/game/engine/ChoicePanel';
import DayIntroTransition from '@/components/game/engine/DayIntroTransition';
import GameHUD from '@/components/game/hud/GameHUD';
import DaySummary from '@/components/game/screens/DaySummary';
import FinalResults from '@/components/game/screens/FinalResults';
import GameOver from '@/components/game/screens/GameOver';
import PauseMenu from '@/components/game/screens/PauseMenu';
import RotateDevice from '@/components/game/screens/RotateDevice';
import type { DialogueNode, ChoiceNode, DayIntroNode, EndNode, CharacterOnScreen } from '@/game/engine/types';
import { isGameOver } from '@/game/systems/LivesSystem';

function GamePlayInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const scenarioId = searchParams.get('scenario');
  const { lang } = useLang();

  if (!scenarioId) {
    router.replace('/game');
    return null;
  }

  return <GameScreen scenarioId={scenarioId} lang={lang} />;
}

function GameScreen({ scenarioId, lang }: { scenarioId: string; lang: 'uz' | 'ru' }) {
  const engine = useGameEngine(scenarioId);
  const router = useRouter();
  const audio = useAudio(engine.eventBus);
  const [showPause, setShowPause] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);

  const timerState = engine.session?.timerState ?? null;
  const timer = useTimer(timerState, engine.timerExpired);

  const dialogueBoxRef = useRef<DialogueBoxHandle>(null);
  const tapEnabledRef = useRef(false);
  const advanceRef = useRef(engine.advanceDialogue);
  advanceRef.current = engine.advanceDialogue;

  // Document-level tap listener — registered once, uses refs for latest state
  useEffect(() => {
    let touchHandled = false;

    const handleTap = () => {
      if (!tapEnabledRef.current) return;
      if (dialogueBoxRef.current) {
        const result = dialogueBoxRef.current.handleTap();
        if (result === 'advance') {
          advanceRef.current();
        }
      } else {
        advanceRef.current();
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('button, input, [role="button"], [data-choice]')) return;
      touchHandled = true;
      handleTap();
    };

    const onClick = (e: MouseEvent) => {
      if (touchHandled) { touchHandled = false; return; }
      const target = e.target as HTMLElement;
      if (target.closest('button, input, [role="button"], [data-choice]')) return;
      handleTap();
    };

    document.addEventListener('touchend', onTouchEnd, true);
    document.addEventListener('click', onClick, true);
    return () => {
      document.removeEventListener('touchend', onTouchEnd, true);
      document.removeEventListener('click', onClick, true);
    };
  }, []); // stable — never re-registers

  const node = engine.currentNode;
  const day = engine.scenario?.days[engine.currentDayIndex];
  const session = engine.session;
  const player = engine.player;

  // Keep tapEnabled in sync (used by document listener)
  tapEnabledRef.current = engine.flowState === 'playing' && (node?.type === 'dialogue' || node?.type === 'end');

  // Detect game over from session
  const isGameOverState = session ? isGameOver(session.lives) : false;

  // Auto-advance past day_intro nodes when in playing state
  // (day_intro is rendered by DayIntroTransition; once playing starts, skip to next node)
  useEffect(() => {
    if (engine.flowState === 'playing' && node?.type === 'day_intro') {
      engine.advanceDialogue();
    }
  }, [engine.flowState, node, engine]);

  // BGM control based on flow state
  const prevBgmRef = useRef<string | null>(null);
  useEffect(() => {
    let bgm: string | null = null;
    if (engine.flowState === 'playing') {
      bgm = node?.type === 'choice' && (node as ChoiceNode).timeLimit ? 'bgm_tension' : 'bgm_showroom';
    } else if (engine.flowState === 'day_summary') {
      bgm = 'bgm_summary';
    }
    if (bgm !== prevBgmRef.current) {
      prevBgmRef.current = bgm;
      if (bgm) {
        audio.playBgMusic(bgm);
      } else {
        audio.stopBgMusic();
      }
    }
  }, [engine.flowState, node, audio]);

  // Timer tick sound
  useEffect(() => {
    if (timer.isCritical && timer.remaining !== null && timer.remaining > 0) {
      audio.playSound('sfx_timer_tick');
    }
  }, [timer.isCritical, timer.remaining !== null && Math.ceil(timer.remaining ?? 0), audio]);

  // Track drop-off on page leave
  useEffect(() => {
    const handler = () => {
      try {
        if (player && engine.flowState === 'playing') {
          trackEvent(player.id, 'dropped_off', { dayIndex: engine.currentDayIndex }, scenarioId);
        }
      } catch {
        // Never crash on page unload
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [player, engine.flowState, engine.currentDayIndex, scenarioId]);

  // Track last-seen background so it persists across nodes without explicit background
  const lastBackgroundRef = useRef<string>('bg_showroom');

  // Reset background when day changes
  useEffect(() => {
    lastBackgroundRef.current = 'bg_showroom';
  }, [engine.currentDayIndex]);

  // Resolve background from current node, persisting last-seen value
  const getBackground = useCallback((): string => {
    if (!node) return lastBackgroundRef.current;
    if (node.type === 'dialogue' && (node as DialogueNode).background) {
      lastBackgroundRef.current = (node as DialogueNode).background!;
    } else if (node.type === 'day_intro') {
      lastBackgroundRef.current = (node as DayIntroNode).background;
    }
    return lastBackgroundRef.current;
  }, [node]);

  // Resolve speaker and emotion
  const getSpeaker = (): { speaker: string | undefined; emotion: string | null } => {
    if (!node) return { speaker: undefined, emotion: null };
    if (node.type === 'dialogue') {
      const d = node as DialogueNode;
      return { speaker: d.speaker, emotion: d.emotion };
    }
    if (node.type === 'end' && (node as EndNode).dialogue) {
      const e = node as EndNode;
      return { speaker: e.dialogue!.speaker, emotion: e.dialogue!.emotion };
    }
    return { speaker: undefined, emotion: null };
  };

  // Get dialogue text
  const getDialogueText = (): string | null => {
    if (!node) return null;
    if (node.type === 'dialogue') return (node as DialogueNode).text[lang];
    if (node.type === 'end' && (node as EndNode).dialogue) {
      return (node as EndNode).dialogue!.text[lang];
    }
    return null;
  };

  // Track characters on screen (persists across nodes without explicit characters)
  const lastCharactersRef = useRef<CharacterOnScreen[]>([]);
  // Character history stack for correct goBack restoration
  const characterHistoryRef = useRef<CharacterOnScreen[][]>([]);
  const prevNodeIdRef = useRef<string | null>(null);

  // Reset characters when day changes
  useEffect(() => {
    lastCharactersRef.current = [];
    characterHistoryRef.current = [];
    prevNodeIdRef.current = null;
  }, [engine.currentDayIndex]);

  const resolveCharactersForNode = useCallback((n: typeof node): CharacterOnScreen[] => {
    if (!n) return [];

    // DialogueNode with explicit characters array
    if (n.type === 'dialogue' && (n as DialogueNode).characters) {
      return (n as DialogueNode).characters!;
    }

    // EndNode with dialogue.characters
    if (n.type === 'end' && (n as EndNode).dialogue?.characters) {
      return (n as EndNode).dialogue!.characters!;
    }

    // DialogueNode without characters → single speaker fallback
    if (n.type === 'dialogue') {
      const d = n as DialogueNode;
      if (d.speaker && d.speaker !== 'narrator') {
        return [{
          id: d.speaker,
          emotion: d.emotion ?? 'neutral',
          position: 'center' as const,
        }];
      }
      // Narrator with no characters → inherit previous (forward) or restored (back)
      return lastCharactersRef.current;
    }

    // EndNode single speaker fallback
    if (n.type === 'end' && (n as EndNode).dialogue) {
      const e = n as EndNode;
      return [{
        id: e.dialogue!.speaker,
        emotion: e.dialogue!.emotion ?? 'neutral',
        position: 'center' as const,
      }];
    }

    // Choice/condition/score nodes → keep previous characters
    return lastCharactersRef.current;
  }, []);

  const getCharacters = useCallback((): CharacterOnScreen[] => {
    if (!node) return lastCharactersRef.current;

    const currentNodeId = node.id;
    const historyLength = session?.nodeHistory?.length ?? 0;

    // Detect navigation direction by comparing with previous node
    if (prevNodeIdRef.current !== null && prevNodeIdRef.current !== currentNodeId) {
      const isBack = characterHistoryRef.current.length > historyLength;
      if (isBack) {
        // Going back: pop from character history to restore previous state
        const restored = characterHistoryRef.current.pop();
        if (restored !== undefined) {
          lastCharactersRef.current = restored;
        }
      } else {
        // Going forward: save current characters before updating
        characterHistoryRef.current.push([...lastCharactersRef.current]);
      }
    }
    prevNodeIdRef.current = currentNodeId;

    const chars = resolveCharactersForNode(node);
    lastCharactersRef.current = chars;
    return chars;
  }, [node, session?.nodeHistory?.length, resolveCharactersForNode]);

  const { speaker, emotion } = getSpeaker();
  const dialogueText = getDialogueText();
  const backgroundId = getBackground();
  const characters = getCharacters();
  const isNarrator = !speaker || speaker === 'narrator';
  const speakerName = speaker && speaker !== 'narrator' && CHARACTERS[speaker]
    ? CHARACTERS[speaker].name[lang]
    : undefined;

  // --- RENDER ---

  // Day Intro
  if (engine.flowState === 'day_intro' && day) {
    return (
      <>
        <RotateDevice />
        <DayIntroTransition
          dayNumber={day.dayNumber}
          title={day.title[lang]}
          subtitle={undefined}
          teaser={engine.currentDayIndex > 0
            ? engine.scenario?.days[engine.currentDayIndex - 1]?.nextDayTeaser?.[lang]
            : undefined}
          backgroundId={
            (() => {
              const introNode = day.nodes[day.rootNodeId];
              if (introNode?.type === 'day_intro') {
                return (introNode as DayIntroNode).background;
              }
              if (introNode?.type === 'dialogue' && (introNode as DialogueNode).background) {
                return (introNode as DialogueNode).background!;
              }
              return 'bg_showroom';
            })()
          }
          onComplete={engine.beginPlaying}
          lang={lang}
        />
      </>
    );
  }

  // Day Summary
  if (engine.flowState === 'day_summary' && engine.dayResults) {
    const dr = engine.dayResults;
    return (
      <>
        <RotateDevice />
        <DaySummary
          dayIndex={dr.dayIndex}
          score={dr.score}
          targetScore={dr.targetScore}
          rating={dr.rating}
          dimensions={dr.dimensions}
          nearMiss={dr.nearMiss}
          unlockedAchievements={dr.unlockedAchievements}
          coinsEarned={dr.coinsEarned}
          xpEarned={dr.xpEarned}
          nextDayTeaser={dr.nextDayTeaser?.[lang]}
          isLastDay={dr.isLastDay}
          onNextDay={engine.confirmNextDay}
          onReplayDay={engine.restartDay}
          canReplay={player ? canReplay(player.coins) : false}
          lang={lang}
        />
      </>
    );
  }

  // Final Results
  if (engine.flowState === 'final_results' && engine.finalResults) {
    const fr = engine.finalResults;
    return (
      <>
        <RotateDevice />
        <FinalResults
          totalScore={fr.totalScore}
          dimensions={fr.dimensions}
          dayRatings={fr.dayRatings}
          strongestDimension={fr.strongestDimension}
          weakestDimension={fr.weakestDimension}
          onExit={() => router.push('/game')}
          lang={lang}
        />
      </>
    );
  }

  // Main gameplay
  return (
    <>
      <RotateDevice />
      <SceneRenderer
        backgroundId={backgroundId}
        characters={characters}
        activeSpeaker={speaker}
      >
        {/* HUD */}
        {session && player && (
          <GameHUD
            lives={session.lives}
            maxLives={session.maxLives}
            score={session.score.total}
            comboCount={session.comboCount}
            level={player.level}
            onPause={() => setShowPause(true)}
          />
        )}

        {/* Dialogue Box */}
        {dialogueText && node?.type !== 'choice' && (
          <DialogueBox
            ref={dialogueBoxRef}
            text={dialogueText}
            speakerName={speakerName}
            isNarrator={isNarrator}
            onGoBack={engine.goBack}
            canGoBack={engine.canGoBack}
          />
        )}

        {/* Choice Panel + Prompt */}
        {node?.type === 'choice' && (
          <>
            <ChoicePanel
              choices={engine.availableChoices.map((c) => ({
                id: c.id,
                text: c.text[lang],
              }))}
              onSelect={engine.selectChoice}
              multiSelect={(node as ChoiceNode).multiSelect}
              onMultiSelect={engine.selectMultiChoices}
              timerRemaining={timer.remaining}
              timeLimit={(node as ChoiceNode).timeLimit}
            />
            <DialogueBox
              text={(node as ChoiceNode).prompt[lang]}
              speakerName={undefined}
              isNarrator={true}
            />
          </>
        )}
      </SceneRenderer>

      {/* Pause Menu */}
      {showPause && (
        <PauseMenu
          onResume={() => setShowPause(false)}
          onExit={() => router.push('/game')}
          isMuted={audio.isMuted}
          onToggleMute={audio.toggleMute}
          lang={lang}
        />
      )}

      {/* Game Over */}
      {isGameOverState && (
        <GameOver
          dayIndex={engine.currentDayIndex}
          onRestart={() => {
            setShowGameOver(false);
            engine.restartDay();
          }}
          onExit={() => router.push('/game')}
          canAffordRestart={player ? canReplay(player.coins) : true}
          lang={lang}
        />
      )}
    </>
  );
}

export default function GamePlay() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-dvh">
        <p className="text-neutral-400">Yuklanmoqda...</p>
      </div>
    }>
      <GamePlayInner />
    </Suspense>
  );
}
