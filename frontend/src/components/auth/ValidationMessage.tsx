export function ValidationMessage({
  message,
  tone = 'error',
}: {
  message?: string | null;
  tone?: 'error' | 'success';
}) {
  if (!message) return null;
  const cls =
    tone === 'success'
      ? 'border-primary/30 bg-primary/10 text-primary'
      : 'border-error/30 bg-error/10 text-error';
  return (
    <p role="alert" className={`rounded-lg border px-3 py-2 text-sm ${cls}`}>
      {message}
    </p>
  );
}
