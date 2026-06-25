import type { RankedEntry } from '@/api/leaderboard';

interface PodiumProps {
  topThree: RankedEntry[];
}

const PODIUM_CONFIG = [
  {
    rank: 2,
    order: 'order-2 md:order-1',
    borderColor: 'border-podium-silver',
    badgeBg: 'bg-podium-silver',
    badgeText: 'text-surface',
    gradientClass: 'podium-gradient-2',
    gradientOpacity: 'opacity-10',
    iconColor: 'text-podium-silver',
    iconName: 'military_tech',
    iconSize: 'text-4xl',
    avatarSize: 'w-24 h-24',
    label: '2nd',
    extraClass: 'hover:-translate-y-2',
    pointSize: '',
  },
  {
    rank: 1,
    order: 'order-1 md:order-2',
    borderColor: 'border-podium-gold',
    badgeBg: 'bg-podium-gold',
    badgeText: 'text-surface',
    gradientClass: 'podium-gradient-1',
    gradientOpacity: 'opacity-20',
    iconColor: 'text-podium-gold',
    iconName: 'emoji_events',
    iconSize: 'text-6xl',
    avatarSize: 'w-32 h-32',
    label: '1st',
    extraClass: 'shadow-accent-glow border-primary/20 hover:-translate-y-3 z-10 md:mb-6',
    pointSize: 'text-xl',
  },
  {
    rank: 3,
    order: 'order-3',
    borderColor: 'border-podium-bronze',
    badgeBg: 'bg-podium-bronze',
    badgeText: 'text-on-surface',
    gradientClass: 'podium-gradient-3',
    gradientOpacity: 'opacity-10',
    iconColor: 'text-podium-bronze',
    iconName: 'military_tech',
    iconSize: 'text-4xl',
    avatarSize: 'w-24 h-24',
    label: '3rd',
    extraClass: 'hover:-translate-y-2',
    pointSize: '',
  },
] as const;

export default function Podium({ topThree }: PodiumProps) {
  if (topThree.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-widget-gap items-end">
      {PODIUM_CONFIG.map((cfg) => {
        const entry = topThree[cfg.rank - 1];
        if (!entry) return null;

        return (
          <div
            key={entry.userId}
            className={`${cfg.order} p-card-padding rounded-2xl relative overflow-hidden flex flex-col items-center group transition-all duration-300 ${cfg.extraClass}`}
            style={{
              background: 'rgba(30, 41, 59, 0.7)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            {/* Gradient overlay */}
            <div
              className={`absolute inset-0 ${cfg.gradientOpacity}`}
              style={{
                background: `linear-gradient(180deg, ${
                  cfg.rank === 1 ? '#FFD700' : cfg.rank === 2 ? '#C0C0C0' : '#CD7F32'
                } 0%, transparent 100%)`,
              }}
            />

            {/* Champion badge for 1st */}
            {cfg.rank === 1 && (
              <div className="absolute top-4 right-4">
                <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ boxShadow: '0 0 8px #4be277' }} />
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                    Live Champion
                  </span>
                </div>
              </div>
            )}

            {/* Avatar */}
            <div className="relative mb-4">
              <div
                className={`${cfg.avatarSize} rounded-full ${cfg.borderColor} border-4 p-1 bg-surface-container-highest flex items-center justify-center`}
              >
                <span className="material-symbols-outlined text-on-surface-variant text-3xl">person</span>
              </div>
              <div
                className={`absolute -bottom-2 left-1/2 -translate-x-1/2 ${cfg.badgeBg} ${cfg.badgeText} font-bold px-4 py-1 rounded-full text-sm`}
              >
                {cfg.label}
              </div>
            </div>

            {/* Info */}
            <h3 className="font-headline-md text-headline-md text-on-surface mb-1 relative z-10">
              {entry.displayName}
            </h3>
            <p className={`text-primary font-data-mono mb-4 relative z-10 ${cfg.pointSize}`}>
              {entry.totalPoints.toLocaleString()} pts
            </p>

            {/* Medal icon */}
            <span
              className={`material-symbols-outlined ${cfg.iconColor} ${cfg.iconSize} relative z-10`}
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {cfg.iconName}
            </span>
          </div>
        );
      })}
    </div>
  );
}
