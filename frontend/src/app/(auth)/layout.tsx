import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-ink-50 px-4 py-10">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-6 block text-center text-2xl font-bold text-ink-900">
          GoalPredict <span className="text-pitch-500">Live</span> ⚽
        </Link>
        <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-sm sm:p-8">
          {children}
        </div>
      </div>
    </main>
  );
}
