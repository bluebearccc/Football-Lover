import type { MatchComment } from '@/api/matches';

interface CommentListProps {
  comments: MatchComment[];
}

function formatCommentTime(iso: string): string {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(new Date(iso));
}

export default function CommentList({ comments }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-on-surface-variant">
        <span className="material-symbols-outlined text-3xl mb-2">chat_bubble_outline</span>
        <p className="font-body-sm text-body-sm">Chưa có bình luận</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {comments.map((c) => (
        <div
          key={c.id}
          className="bg-surface-container-low rounded-lg p-4 border border-outline-variant/10"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center border border-outline-variant/20">
              <span className="material-symbols-outlined text-on-surface-variant text-sm">person</span>
            </div>
            <div className="flex-1">
              <span className="font-bold text-on-surface text-sm">{c.user.displayName}</span>
              <span className="text-on-surface-variant font-body-sm text-body-sm ml-2">
                {formatCommentTime(c.createdAt)}
              </span>
            </div>
          </div>
          <p className="text-on-surface font-body-sm text-body-sm pl-11">{c.content}</p>
        </div>
      ))}
    </div>
  );
}
