'use client';

import { useState, useCallback } from 'react';
import { getScenario } from '@/game/data/scenarios';
import { CHARACTERS } from '@/game/data/characters/index';
import type { DialogueNode, ScenarioNode } from '@/game/engine/types';

interface UseAssetPreloaderReturn {
  preloadDay: (scenarioId: string, dayIndex: number) => Promise<void>;
  progress: number; // 0-1
  isReady: boolean;
}

function collectImageUrls(nodes: Record<string, ScenarioNode>, scenarioId: string): string[] {
  const urls = new Set<string>();

  for (const node of Object.values(nodes)) {
    if (node.type !== 'dialogue') continue;
    const dialogue = node as DialogueNode;

    // Collect background images
    if (dialogue.background) {
      urls.add(`/assets/scenarios/${scenarioId}/backgrounds/${dialogue.background}.jpg`);
    }

    // Collect character sprite images from speaker + emotion
    if (dialogue.speaker && dialogue.speaker !== 'narrator' && dialogue.emotion) {
      const character = CHARACTERS[dialogue.speaker];
      if (character) {
        urls.add(character.assetPath(dialogue.emotion));
      }
    }
  }

  return Array.from(urls);
}

function preloadImage(url: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve(); // Silent fail — asset may not exist yet
    img.src = url;
  });
}

export function useAssetPreloader(): UseAssetPreloaderReturn {
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);

  const preloadDay = useCallback(async (scenarioId: string, dayIndex: number) => {
    setProgress(0);
    setIsReady(false);

    const scenario = getScenario(scenarioId);
    if (!scenario || !scenario.days[dayIndex]) {
      setProgress(1);
      setIsReady(true);
      return;
    }

    const day = scenario.days[dayIndex];
    const urls = collectImageUrls(day.nodes as Record<string, ScenarioNode>, scenarioId);

    if (urls.length === 0) {
      setProgress(1);
      setIsReady(true);
      return;
    }

    let loaded = 0;
    const total = urls.length;

    await Promise.all(
      urls.map((url) =>
        preloadImage(url).then(() => {
          loaded++;
          setProgress(loaded / total);
        })
      )
    );

    setIsReady(true);
  }, []);

  return { preloadDay, progress, isReady };
}
