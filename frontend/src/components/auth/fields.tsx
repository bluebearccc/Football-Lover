import type { InputHTMLAttributes } from 'react';

export function Field({
  label,
  id,
  ...props
}: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label htmlFor={id} className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-ink-800">{label}</span>
      <input
        id={id}
        className="rounded-lg border border-ink-100 bg-white px-3 py-2 text-ink-900 outline-none transition focus:border-pitch-400 focus:ring-2 focus:ring-pitch-200"
        {...props}
      />
    </label>
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
      className="mt-1 rounded-lg bg-pitch-500 px-4 py-2.5 font-medium text-white transition hover:bg-pitch-600 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? 'Đang xử lý…' : children}
    </button>
  );
}
