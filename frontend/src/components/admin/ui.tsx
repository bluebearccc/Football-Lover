'use client';

import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-primary text-on-primary hover:opacity-90',
  secondary:
    'border border-outline-variant/30 bg-surface-container text-on-surface hover:bg-surface-variant',
  danger: 'bg-tertiary/90 text-on-tertiary hover:bg-tertiary',
  ghost: 'text-on-surface-variant hover:bg-surface-variant',
};

export function Button({
  variant = 'primary',
  className = '',
  children,
  ...props
}: { variant?: Variant } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'green' | 'gold' | 'red' }) {
  const tones = {
    neutral: 'bg-surface-variant text-on-surface-variant',
    green: 'bg-primary/10 text-primary border border-primary/20',
    gold: 'bg-secondary/10 text-secondary border border-secondary/20',
    red: 'bg-tertiary/10 text-tertiary border border-tertiary/20',
  } as const;
  return <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${tones[tone]}`}>{children}</span>;
}

export function Card({ title, children, action }: { title?: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="glass-panel rounded-xl p-5">
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="font-headline-md text-headline-md text-on-surface">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function TextInput({ label, className = '', ...props }: { label?: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      {label && <span className="font-label-caps text-label-caps text-on-surface-variant">{label}</span>}
      <input
        className={`rounded-lg border border-outline-variant/30 bg-surface-container px-3 py-2 text-on-surface outline-none transition focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-on-surface-variant/50 ${className}`}
        {...props}
      />
    </label>
  );
}

export function Select({ label, children, className = '', ...props }: { label?: string } & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      {label && <span className="font-label-caps text-label-caps text-on-surface-variant">{label}</span>}
      <select
        className={`rounded-lg border border-outline-variant/30 bg-surface-container px-3 py-2 text-on-surface outline-none transition focus:border-primary focus:ring-1 focus:ring-primary ${className}`}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}

export function Banner({ message, tone = 'error' }: { message?: string | null; tone?: 'error' | 'success' }) {
  if (!message) return null;
  const cls =
    tone === 'success'
      ? 'border-primary/30 bg-primary/10 text-primary'
      : 'border-tertiary/30 bg-tertiary/10 text-tertiary';
  return (
    <p role="alert" className={`rounded-xl border px-4 py-3 text-body-sm ${cls}`}>
      {message}
    </p>
  );
}
