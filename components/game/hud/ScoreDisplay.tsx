'use client';

interface ScoreDisplayProps {
  score: number;
}

export default function ScoreDisplay({ score }: ScoreDisplayProps) {
  return (
    <div className="flex items-center gap-1 text-[#ffd700] font-medium text-sm">
      <span>★</span>
      <span>{score}</span>
    </div>
  );
}
