'use client';

import { useState } from 'react';
import type { MatchComment } from '@/api/matches';
import { matchesApi } from '@/api/matches';
import { ApiError } from '@/api/client';
import CommentList from './CommentList';

interface CommentSectionProps {
  matchId: string;
  initialComments: MatchComment[];
  isLoggedIn: boolean;
}

export default function CommentSection({ matchId, initialComments, isLoggedIn }: CommentSectionProps) {
  const [comments, setComments] = useState<MatchComment[]>(initialComments);
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const MAX_LENGTH = 1000;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) {
      setError('Bình luận không được để trống');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const newComment = await matchesApi.createComment(matchId, trimmed);
      setComments((prev) => [...prev, newComment]);
      setContent('');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Có lỗi xảy ra, vui lòng thử lại');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h3 className="font-headline-md text-headline-md flex items-center gap-2">
        <span className="material-symbols-outlined text-primary">chat</span>
        Bình luận ({comments.length})
      </h3>
      {isLoggedIn ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="relative">
            <textarea
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                if (error) setError(null);
              }}
              maxLength={MAX_LENGTH}
              rows={3}
              placeholder="Viết bình luận của bạn..."
              disabled={submitting}
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg px-4 py-3 text-on-surface placeholder-on-surface-variant/50 font-body-sm text-body-sm resize-none focus:outline-none focus:border-primary/60 transition-colors disabled:opacity-60"
            />
            <span className="absolute bottom-2 right-3 text-on-surface-variant/50 text-xs font-data-mono">
              {content.length}/{MAX_LENGTH}
            </span>
          </div>
          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || content.trim().length === 0}
              className="px-5 py-2 bg-primary text-on-primary rounded-lg font-medium text-sm transition-opacity disabled:opacity-50 hover:opacity-90"
            >
              {submitting ? 'Đang gửi...' : 'Gửi bình luận'}
            </button>
          </div>
        </form>
      ) : (
        <div className="flex items-center justify-center gap-2 py-4 text-on-surface-variant font-body-sm text-body-sm">
          <span className="material-symbols-outlined text-base">lock</span>
          <span>
            <a href="/login" className="text-primary hover:underline">Đăng nhập</a>
            {' '}để bình luận
          </span>
        </div>
      )}
      <CommentList comments={comments} />
    </div>
  );
}
