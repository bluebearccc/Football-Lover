import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-surface p-gutter text-on-surface">
      {/* Atmospheric background blurs */}
      <div className="pointer-events-none absolute left-[-10%] top-[-10%] h-[40%] w-[40%] rounded-full bg-primary/10 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] rounded-full bg-secondary/10 blur-[120px]" />

      <div className="relative z-10 w-full max-w-md">
        {/* Brand header */}
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <Link href="/" className="flex items-center gap-2">
            <span
              className="material-symbols-outlined text-4xl text-primary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              sports_soccer
            </span>
            <span className="font-headline-lg text-headline-lg tracking-tight text-primary">
              GoalPredict Live
            </span>
          </Link>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Nâng tầm dự đoán bóng đá
          </p>
        </div>

        {/* Glass card */}
        <div className="glass-card rounded-xl p-8 shadow-2xl">{children}</div>
      </div>
    </main>
  );
}
