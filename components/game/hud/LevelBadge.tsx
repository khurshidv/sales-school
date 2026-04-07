'use client';

interface LevelBadgeProps {
  level: number;
}

export default function LevelBadge({ level }: LevelBadgeProps) {
  return <span className="text-neutral-400 text-xs">Lv.{level}</span>;
}
