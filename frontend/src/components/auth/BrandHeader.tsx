import Link from 'next/link';

export function BrandHeader({ subtitle }: { subtitle?: string }) {
  return (
    <div className="mb-10 flex flex-col items-center gap-2 text-center">
      <Link href="/" className="flex items-center gap-3">
        <span
          className="material-symbols-outlined text-5xl text-primary"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          sports_soccer
        </span>
        <h1 className="font-display-lg text-4xl font-extrabold tracking-tight text-white drop-shadow-md">
          GoalPredict Live
        </h1>
      </Link>
      {subtitle && (
        <p className="mt-1 font-body-sm text-body-sm font-medium uppercase tracking-wide text-primary-fixed-dim">
          {subtitle}
        </p>
      )}
    </div>
  );
}
