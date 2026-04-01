interface SpeakerCardProps {
  name: string;
  role: string;
  stats: string[];
  image: string;
}

export default function SpeakerCard({ name, role, stats, image }: SpeakerCardProps) {
  return (
    <div className="flex items-center gap-6 md:gap-8">
      <div className="relative flex-shrink-0">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary-container to-secondary-container rounded-full animate-pulse blur-sm" />
        <img
          src={image}
          alt={name}
          width={160}
          height={160}
          loading="lazy"
          className="relative w-28 h-28 md:w-40 md:h-40 rounded-full object-cover border-4 border-surface"
        />
      </div>
      <div>
        <h4 className="font-[family-name:var(--font-heading)] text-xl md:text-2xl text-on-surface">{name}</h4>
        <p className="text-on-surface-variant text-sm mb-4">{role}</p>
        <div className="flex flex-wrap gap-2">
          {stats.map((stat, i) => (
            <span
              key={i}
              className="bg-surface-container text-on-surface-variant px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
            >
              {stat}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
