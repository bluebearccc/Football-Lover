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
          className="font-label-caps text-label-caps uppercase text-on-surface-variant"
        >
          {label}
        </label>
        {labelRight}
      </div>
      <div className="group relative">
        {icon && (
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant transition-colors group-focus-within:text-primary">
            {icon}
          </span>
        )}
        <input
          id={id}
          type={resolvedType}
          className={`w-full rounded-lg border border-outline-variant/30 bg-surface-container-lowest py-3 text-on-surface outline-none transition-all placeholder:text-on-surface-variant/50 focus:border-primary focus:shadow-input-glow font-body-lg text-body-lg ${icon ? 'pl-11' : 'px-4'} ${isPassword ? 'pr-11' : icon ? 'pr-4' : ''}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant transition-colors hover:text-on-surface"
            onClick={() => setShowPassword((v) => !v)}
            tabIndex={-1}
          >
            <span className="material-symbols-outlined text-xl">
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
}: {
  loading: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-4 font-headline-md text-headline-md text-on-primary transition-all accent-glow hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? 'Đang xử lý…' : children}
    </button>
  );
}
