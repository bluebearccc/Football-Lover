import type { MatchTeam } from '@/api/matches';

interface TeamInfoPanelProps {
  team: MatchTeam;
  score: number | null;
  side: 'home' | 'away';
}

export default function TeamInfoPanel({ team, score, side }: TeamInfoPanelProps) {
  return (
    <div className={`flex flex-col items-center ${side === 'home' ? 'md:items-end' : 'md:items-start'} gap-4 w-full md:w-1/3`}>
      <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-surface-container-highest/50 backdrop-blur-sm flex items-center justify-center p-4 border-2 border-outline-variant/30">
        {team.logoUrl ? (
          <img
            src={team.logoUrl}
            alt={`Logo ${team.name}`}
            className="w-full h-full object-contain"
          />
        ) : (
          <span className="material-symbols-outlined text-on-surface-variant text-5xl">sports_soccer</span>
        )}
      </div>
      <div className={`text-center ${side === 'home' ? 'md:text-right' : 'md:text-left'}`}>
        <h2 className="font-headline-lg text-headline-lg md:text-display-lg text-on-surface">
          {team.name}
        </h2>
        {team.shortName && (
          <p className="text-on-surface-variant font-label-caps">{team.shortName}</p>
        )}
      </div>
    </div>
  );
}
