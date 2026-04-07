'use client';

interface CTABlockProps {
  primaryTitle: string;
  primarySubtitle?: string;
  primaryUrl?: string;
  secondaryTitle?: string;
  secondaryUrl?: string;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
}

export default function CTABlock({
  primaryTitle,
  primarySubtitle,
  primaryUrl,
  secondaryTitle,
  secondaryUrl,
  onPrimaryClick,
  onSecondaryClick,
}: CTABlockProps) {
  const handlePrimary = () => {
    if (onPrimaryClick) {
      onPrimaryClick();
    } else if (primaryUrl) {
      window.open(primaryUrl, '_blank');
    }
  };

  const handleSecondary = () => {
    if (onSecondaryClick) {
      onSecondaryClick();
    } else if (secondaryUrl) {
      window.open(secondaryUrl, '_blank');
    }
  };

  return (
    <div className="mt-8 text-center">
      <button
        onClick={handlePrimary}
        className="bg-blue-600 hover:bg-blue-700 w-full py-4 rounded-xl text-lg font-semibold text-white transition-colors"
      >
        {primaryTitle}
      </button>
      {primarySubtitle && (
        <p className="text-xs text-blue-300 mt-1">{primarySubtitle}</p>
      )}

      {secondaryTitle && (
        <button
          onClick={handleSecondary}
          className="mt-3 text-neutral-400 underline text-sm hover:text-neutral-300 transition-colors"
        >
          {secondaryTitle}
        </button>
      )}
    </div>
  );
}
