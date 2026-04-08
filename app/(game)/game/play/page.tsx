'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useState, useEffect, useRef } from 'react';
import { useGameEngine } from '@/lib/game/hooks/useGameEngine';
import { useTimer } from '@/lib/game/hooks/useTimer';
import { useAudio } from '@/lib/game/hooks/useAudio';
import { useLang } from '@/lib/game/utils/lang';
import { CHARACTERS } from '@/game/data/characters/index';
import { canReplay } from '@/game/systems/CoinSystem';
import { trackEvent } from '@/lib/game/analytics';
import SceneRenderer from '@/components/game/engine/SceneRenderer';
import DialogueBox from '@/components/game/engine/DialogueBox';
import ChoicePanel from '@/components/game/engine/ChoicePanel';
import DayIntroTransition from '@/components/game/engine/DayIntroTransition';
import GameHUD from '@/components/game/hud/GameHUD';
import DaySummary from '@/components/game/screens/DaySummary';
import FinalResults from '@/components/game/screens/FinalResults';
import GameOver from '@/components/game/screens/GameOver';
import PauseMenu from '@/components/game/screens/PauseMenu';
import RotateDevice from '@/components/game/screens/RotateDevice';
import type { DialogueNode, ChoiceNode, DayIntroNode, EndNode } from '@/game/engine/types';
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

  const node = engine.currentNode;
  const day = engine.scenario?.days[engine.currentDayIndex];
  const session = engine.session;
  const player = engine.player;

  // Detect game over from session
  const isGameOverState = session ? isGameOver(session.lives) : false;

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

  // Resolve background from current node or day default
  const getBackground = (): string | undefined => {
    if (!node) return undefined;
    if (node.type === 'dialogue' && (node as DialogueNode).background) {
      return (node as DialogueNode).background;
    }
    if (node.type === 'day_intro') {
      return (node as DayIntroNode).background;
    }
    if (day) {
      const introNode = day.nodes[day.rootNodeId];
      if (introNode?.type === 'dialogue' && (introNode as DialogueNode).background) {
        return (introNode as DialogueNode).background;
      }
    }
    return undefined;
  };

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

  const { speaker, emotion } = getSpeaker();
  const dialogueText = getDialogueText();
  const backgroundId = getBackground();
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
        speaker={speaker}
        emotion={emotion}
        onTap={engine.advanceDialogue}
        tapEnabled={node?.type === 'dialogue' || node?.type === 'end'}
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
            text={dialogueText}
            speakerName={speakerName}
            isNarrator={isNarrator}
            onAdvance={engine.advanceDialogue}
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
              onAdvance={() => {}}
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
