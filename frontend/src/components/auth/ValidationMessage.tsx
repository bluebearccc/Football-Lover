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
      ? 'border-pitch-200 bg-pitch-50 text-pitch-700'
      : 'border-red-200 bg-red-50 text-red-700';
  return (
    <p role="alert" className={`rounded-md border px-3 py-2 text-sm ${cls}`}>
      {message}
    </p>
  );
}
