// Shared DTO types for the admin surface (UC06/07/12/13 + users + moderation).

export type Role = 'USER' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'LOCKED';
export type MatchStatus = 'SCHEDULED' | 'LIVE' | 'FINISHED' | 'CANCELLED' | 'POSTPONED';
export type TeamSide = 'HOME' | 'AWAY';
export type CommentStatus = 'VISIBLE' | 'HIDDEN' | 'DELETED';
export type CriterionSource = 'MANUAL' | 'SCRAPED';

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface Team {
  id: string;
  name: string;
  shortName: string | null;
  logoUrl: string | null;
  externalId: string | null;
  isActive: boolean;
  createdAt: string;
  _count?: { players: number };
}

export interface Player {
  id: string;
  teamId: string;
  name: string;
  position: string | null;
  imageUrl: string | null;
  externalId: string | null;
}

export interface TeamWithPlayers extends Team {
  players: Player[];
}

export interface Match {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  matchTime: string;
  status: MatchStatus;
  homeScore: number | null;
  awayScore: number | null;
  entryGold: string;
  homeTeam?: Team;
  awayTeam?: Team;
  _count?: { predictions: number; comments: number; criteria: number; participations: number };
}

export interface Criterion {
  id: string;
  matchId: string;
  name: string;
  description: string | null;
  resultTeam: TeamSide | null;
  resolvedAt: string | null;
  source: CriterionSource;
}

export interface ScoringSummary {
  scored: boolean;
  reason?: string;
  participantCount: number;
  winnerCount: number;
  pool: string;
  goldPerWinner: string;
  leaderboardEligible: boolean;
}

export interface AdminUser {
  id: string;
  email: string;
  displayName: string;
  role: Role;
  status: UserStatus;
  totalPoints: number;
  createdAt: string;
  _count?: { predictions: number; participations: number; comments: number };
}

export interface AdminComment {
  id: string;
  matchId: string;
  userId: string;
  content: string;
  status: CommentStatus;
  createdAt: string;
  user?: { id: string; displayName: string };
}

export interface DashboardStats {
  users: number;
  lockedUsers: number;
  teams: number;
  activeTeams: number;
  matches: number;
  liveOrScheduled: number;
  finishedMatches: number;
  predictions: number;
  comments: number;
  hiddenComments: number;
}

export interface DashboardOverview {
  stats: DashboardStats;
  recentMatches: Match[];
}

export interface SyncCounts {
  created: number;
  updated: number;
  unchanged: number;
}

export interface SyncResult {
  triggeredAt: string;
  provider: 'api-football';
  leagueId: number;
  season: number;
  teams: SyncCounts;
  players: SyncCounts;
  note: string;
}
