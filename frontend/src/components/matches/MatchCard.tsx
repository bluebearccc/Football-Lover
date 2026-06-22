import Link from 'next/link';
import type { MatchListItem } from '@/api/matches';

interface MatchCardProps {
  match: MatchListItem;
}

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  LIVE: { bg: 'bg-error-container/20', text: 'text-error', label: 'LIVE' },
  SCHEDULED: { bg: 'bg-secondary/10', text: 'text-secondary', label: 'SẮP DIỄN RA' },
  FINISHED: { bg: 'bg-on-surface-variant/10', text: 'text-on-surface-variant', label: 'KẾT THÚC' },
  CANCELLED: { bg: 'bg-error/10', text: 'text-error', label: 'ĐÃ HỦY' },
  POSTPONED: { bg: 'bg-tertiary/10', text: 'text-tertiary', label: 'HOÃN' },
};

function formatMatchTime(iso: string): string {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(new Date(iso));
}

function TeamLogo({ name, logoUrl }: { name: string; logoUrl: string | null }) {
  return (
    <div className="w-16 h-16 mb-3 flex items-center justify-center bg-surface-container-highest rounded-full border-2 border-outline-variant/10">
      {logoUrl ? (
        <img src={logoUrl} alt={`Logo ${name}`} className="w-10 h-10 object-contain" />
      ) : (
        <span className="material-symbols-outlined text-on-surface-variant text-2xl">sports_soccer</span>
      )}
    </div>
  );
}

export default function MatchCard({ match }: MatchCardProps) {
  const style = STATUS_STYLES[match.status] ?? STATUS_STYLES.SCHEDULED;
  const showScore = match.status === 'LIVE' || match.status === 'FINISHED';

  return (
    <div className="bg-surface-container-low rounded-xl border border-outline-variant/20 overflow-hidden transition-all hover:scale-[1.01]">
      <div className="p-card-padding">
        {/* Status Badge */}
        <div className="flex justify-between items-center mb-6">
          <span className="font-label-caps text-label-caps text-on-surface-variant">
            {formatMatchTime(match.matchTime)}
          </span>
          <div className={`flex items-center ${style.bg} px-2 py-0.5 rounded ${style.text} border border-current/20`}>
            {match.status === 'LIVE' && (
              <span className="w-1.5 h-1.5 bg-error rounded-full mr-2 animate-pulse" />
            )}
            <span className="font-data-mono text-data-mono uppercase">{style.label}</span>
          </div>
        </div>

        {/* Teams + Score */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-col items-center flex-1">
            <TeamLogo name={match.homeTeam.name} logoUrl={match.homeTeam.logoUrl} />
            <span className="font-headline-md text-headline-md font-bold text-center text-sm">
              {match.homeTeam.shortName ?? match.homeTeam.name}
            </span>
          </div>
          <div className="flex flex-col items-center px-4">
            {showScore ? (
              <div className="font-display-lg text-display-lg font-extrabold flex items-center tracking-tighter text-3xl">
                <span className="text-primary">{match.homeScore ?? 0}</span>
                <span className="mx-2 text-on-surface-variant/30">-</span>
                <span>{match.awayScore ?? 0}</span>
              </div>
            ) : (
              <span className="font-headline-md text-headline-md text-on-surface-variant">VS</span>
            )}
          </div>
          <div className="flex flex-col items-center flex-1">
            <TeamLogo name={match.awayTeam.name} logoUrl={match.awayTeam.logoUrl} />
            <span className="font-headline-md text-headline-md font-bold text-center text-sm">
              {match.awayTeam.shortName ?? match.awayTeam.name}
            </span>
          </div>
        </div>

        {/* Meta */}
        <div className="flex justify-between font-label-caps text-label-caps text-on-surface-variant">
          <span>{match.criteriaCount} tiêu chí</span>
          <span>{match.participantCount} người tham gia</span>
        </div>
      </div>

      {/* Card Actions */}
      <div className="border-t border-outline-variant/10">
        <Link
          href={`/matches/${match.id}`}
          className="block w-full py-4 text-center font-label-caps text-label-caps hover:bg-surface-container-highest transition-colors uppercase"
        >
          Chi tiết trận đấu
        </Link>
      </div>
    </div>
  );
}
