'use client';

import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-pitch-500 text-white hover:bg-pitch-600',
  secondary: 'border border-ink-100 bg-white text-ink-800 hover:bg-ink-50',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  ghost: 'text-ink-700 hover:bg-ink-50',
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
    neutral: 'bg-ink-100 text-ink-700',
    green: 'bg-pitch-100 text-pitch-700',
    gold: 'bg-gold-100 text-gold-700',
    red: 'bg-red-100 text-red-700',
  } as const;
  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${tones[tone]}`}>{children}</span>;
}

export function Card({ title, children, action }: { title?: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="rounded-2xl border border-ink-100 bg-white p-5 shadow-sm">
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between">
          {title && <h2 className="text-lg font-semibold text-ink-900">{title}</h2>}
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
      {label && <span className="font-medium text-ink-800">{label}</span>}
      <input
        className={`rounded-lg border border-ink-100 bg-white px-3 py-2 text-ink-900 outline-none transition focus:border-pitch-400 focus:ring-2 focus:ring-pitch-200 ${className}`}
        {...props}
      />
    </label>
  );
}

export function Select({ label, children, className = '', ...props }: { label?: string } & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      {label && <span className="font-medium text-ink-800">{label}</span>}
      <select
        className={`rounded-lg border border-ink-100 bg-white px-3 py-2 text-ink-900 outline-none transition focus:border-pitch-400 focus:ring-2 focus:ring-pitch-200 ${className}`}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}

export function Banner({ message, tone = 'error' }: { message?: string | null; tone?: 'error' | 'success' }) {
  if (!message) return null;
  const cls = tone === 'success' ? 'border-pitch-200 bg-pitch-50 text-pitch-700' : 'border-red-200 bg-red-50 text-red-700';
  return (
    <p role="alert" className={`rounded-md border px-3 py-2 text-sm ${cls}`}>
      {message}
    </p>
  );
}
