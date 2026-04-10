'use client';

import { memo } from 'react';

interface LevelBadgeProps {
  level: number;
}

function LevelBadge({ level }: LevelBadgeProps) {
  return <span className="text-neutral-400 text-xs">Lv.{level}</span>;
}

export default memo(LevelBadge);
