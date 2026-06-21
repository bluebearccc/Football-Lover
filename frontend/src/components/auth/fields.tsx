'use client';

import { useState, type InputHTMLAttributes, type ReactNode } from 'react';

export function Field({
  label,
  id,
  icon,
  type,
  labelRight,
  ...props
}: {
  label: string;
  icon?: string;
  labelRight?: ReactNode;
} & InputHTMLAttributes<HTMLInputElement>) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const resolvedType = isPassword && showPassword ? 'text' : type;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label
          htmlFor={id}
          className="ml-1 font-label-caps text-label-caps uppercase tracking-wider text-on-surface-variant"
        >
          {label}
        </label>
        {labelRight}
      </div>
      <div className="glass-input group relative overflow-hidden rounded-xl transition-all duration-200">
        {icon && (
          <span className="material-symbols-outlined pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[20px] text-on-surface-variant transition-colors group-focus-within:text-primary">
            {icon}
          </span>
        )}
        <input
          id={id}
          type={resolvedType}
          className={`w-full border-none bg-transparent py-3.5 font-body-lg text-body-lg text-on-surface outline-none placeholder:text-on-surface-variant/40 focus:ring-0 ${icon ? 'pl-11' : 'pl-4'} ${isPassword ? 'pr-12' : 'pr-4'}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant transition-colors hover:text-primary"
            onClick={() => setShowPassword((v) => !v)}
            tabIndex={-1}
          >
            <span className="material-symbols-outlined text-[20px]">
              {showPassword ? 'visibility_off' : 'visibility'}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

export function SubmitButton({
  loading,
  children,
  icon = 'chevron_right',
  variant = 'solid',
}: {
  loading: boolean;
  children: React.ReactNode;
  icon?: string;
  variant?: 'solid' | 'gradient';
}) {
  const baseClass =
    'mt-2 flex w-full items-center justify-center gap-2 rounded-xl py-4 font-headline-md text-headline-md text-on-primary transition-all hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60';
  const bgClass =
    variant === 'gradient'
      ? 'btn-gradient shadow-lg shadow-primary/20'
      : 'bg-primary accent-glow';

  return (
    <button type="submit" disabled={loading} className={`${baseClass} ${bgClass}`}>
      {loading ? 'Đang xử lý…' : children}
      {!loading && icon && (
        <span className="material-symbols-outlined">{icon}</span>
      )}
    </button>
  );
}
