'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Suspense, useState, useEffect, useRef, useCallback } from 'react';
import { useGameEngine } from '@/lib/game/hooks/useGameEngine';
import { useTimer } from '@/lib/game/hooks/useTimer';
import { useAudio } from '@/lib/game/hooks/useAudio';
import { useAssetPreloader } from '@/lib/game/hooks/useAssetPreloader';
import { usePlayerInit } from '@/lib/game/hooks/usePlayerInit';
import { useLang } from '@/lib/game/utils/lang';
import { CHARACTERS } from '@/game/data/characters/index';
import { canReplay } from '@/game/systems/CoinSystem';
import { trackEvent } from '@/lib/game/analytics';
import SceneRenderer from '@/components/game/engine/SceneRenderer';
import DialogueBox, { type DialogueBoxHandle } from '@/components/game/engine/DialogueBox';
import ChoicePanel from '@/components/game/engine/ChoicePanel';
import GameHUD from '@/components/game/hud/GameHUD';
import RotateDevice from '@/components/game/screens/RotateDevice';
import type { DialogueNode, ChoiceNode, DayIntroNode, EndNode, CharacterOnScreen } from '@/game/engine/types';
import { isGameOver } from '@/game/systems/LivesSystem';

// Conditional screens — only rendered on specific flowState transitions.
// Splitting them out of the initial play chunk shaves ~30-50 KB from first
// load. ssr:false because they all rely on browser-only hooks/animations.
const DayIntroTransition = dynamic(
  () => import('@/components/game/engine/DayIntroTransition'),
  { ssr: false },
);
const DaySummary = dynamic(
  () => import('@/components/game/screens/DaySummary'),
  { ssr: false },
);
const FinalResults = dynamic(
  () => import('@/components/game/screens/FinalResults'),
  { ssr: false },
);
const GameOver = dynamic(
  () => import('@/components/game/screens/GameOver'),
  { ssr: false },
);
const PauseMenu = dynamic(
  () => import('@/components/game/screens/PauseMenu'),
  { ssr: false },
);
const SchoolCTA = dynamic(
  () => import('@/components/game/screens/SchoolCTA'),
  { ssr: false },
);

function GamePlayInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const scenarioId = searchParams.get('scenario');
  const { lang } = useLang();

  // Hydrate player store from Supabase on direct navigation / hard refresh
  // of /game/play (usePlayerInit is otherwise only called in the /game hub).
  // Idempotent — skipped if already initialized.
  usePlayerInit();

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

  // Stable callbacks so React.memo on PauseMenu/GameOver/FinalResults holds.
  // Pause/resume also freezes the choice timer so the player can't gain
  // extra thinking time by opening the pause menu on a timed choice.
  const handlePause = useCallback(() => {
    engine.pauseTimer();
    setShowPause(true);
  }, [engine.pauseTimer]);
  const handleResume = useCallback(() => {
    engine.resumeTimer();
    setShowPause(false);
  }, [engine.resumeTimer]);
  // ?menu=1 tells /game to skip its "first-time → Day 1" auto-redirect
  // and always show ScenarioSelect (used from PauseMenu / GameOver / FinalResults).
  const handleExit = useCallback(() => router.push('/game?menu=1'), [router]);
  const handleConsultation = useCallback(() => {
    window.open('https://t.me/salesup_uz', '_blank', 'noopener');
  }, []);
  const handleGameOverRestart = useCallback(() => {
    setShowGameOver(false);
    engine.restartDay();
  }, [engine.restartDay]);

  // Warm asset cache: current day on mount, next day as soon as we enter
  // `playing` state — so the transition is instant.
  const { preloadDay } = useAssetPreloader();
  useEffect(() => {
    preloadDay(scenarioId, engine.currentDayIndex).catch(() => {});
  }, [scenarioId, engine.currentDayIndex, preloadDay]);
  useEffect(() => {
    if (engine.flowState !== 'playing') return;
    const nextDay = engine.currentDayIndex + 1;
    if (engine.scenario && nextDay < engine.scenario.days.length) {
      preloadDay(scenarioId, nextDay).catch(() => {});
    }
  }, [engine.flowState, engine.currentDayIndex, engine.scenario, scenarioId, preloadDay]);

  const dialogueBoxRef = useRef<DialogueBoxHandle>(null);

  // Unified screen tap: typewriter skip → then advance
  const handleScreenTap = useCallback(() => {
    if (dialogueBoxRef.current) {
      const result = dialogueBoxRef.current.handleTap();
      if (result === 'advance') {
        engine.advanceDialogue();
      }
    } else {
      engine.advanceDialogue();
    }
  }, [engine.advanceDialogue]);

  const node = engine.currentNode;
  const day = engine.scenario?.days[engine.currentDayIndex];
  const session = engine.session;
  const player = engine.player;

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
    } else if (
      node.type === 'end' &&
      (node as EndNode).dialogue?.background
    ) {
      lastBackgroundRef.current = (node as EndNode).dialogue!.background!;
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
    const dayNumber =
      engine.scenario?.days[dr.dayIndex]?.dayNumber ?? dr.dayIndex + 1;
    return (
      <>
        <RotateDevice />
        <DaySummary
          dayIndex={dr.dayIndex}
          dayNumber={dayNumber}
          score={dr.score}
          targetScore={dr.targetScore}
          rating={dr.rating}
          dimensions={dr.dimensions}
          outcome={dr.outcome}
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
          flags={dr.flags}
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
          onNext={engine.showSchoolCta}
          onExit={handleExit}
          lang={lang}
        />
      </>
    );
  }

  // School CTA
  if (engine.flowState === 'school_cta' && engine.schoolCtaEnding) {
    return (
      <>
        <RotateDevice />
        <SchoolCTA
          ending={engine.schoolCtaEnding}
          lang={lang}
          playerPhone={player?.phone}
          onConsultation={handleConsultation}
          onDismiss={handleExit}
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
        onTap={handleScreenTap}
        tapEnabled={node?.type === 'dialogue' || node?.type === 'end'}
      >
        {/* HUD — render as soon as session exists. Player hydration may
            still be pending on direct navigation / refresh; fall back to
            level 1 so the HUD (and its pause button, which is the only
            entry point to PauseMenu / fullscreen toggle) is always
            reachable. */}
        {session && (
          <GameHUD
            lives={session.lives}
            maxLives={session.maxLives}
            score={session.score.total}
            comboCount={session.comboCount}
            level={player?.level ?? 1}
            onPause={handlePause}
            lang={lang}
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
            onAdvance={engine.advanceDialogue}
            lang={lang}
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
              timerBarRef={timer.barRef}
              lang={lang}
            />
            <DialogueBox
              text={(node as ChoiceNode).prompt[lang]}
              speakerName={undefined}
              isNarrator={true}
              lang={lang}
            />
          </>
        )}
      </SceneRenderer>

      {/* Pause Menu */}
      {showPause && (
        <PauseMenu
          onResume={handleResume}
          onExit={handleExit}
          isMuted={audio.isMuted}
          onToggleMute={audio.toggleMute}
          lang={lang}
        />
      )}

      {/* Game Over */}
      {isGameOverState && (
        <GameOver
          dayIndex={engine.currentDayIndex}
          onRestart={handleGameOverRestart}
          onExit={handleExit}
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
      <div className="flex items-center justify-center h-full w-full">
        <p className="text-neutral-400">Yuklanmoqda...</p>
      </div>
    }>
      <GamePlayInner />
    </Suspense>
  );
}
