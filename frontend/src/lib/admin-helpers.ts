export function logStatusBadge(status: string): { cls: string; label: string } {
  switch (status) {
    case 'SUCCESS':
      return { cls: 'bg-primary/20 text-primary', label: 'SUCCESS' };
    case 'WARNING':
      return { cls: 'bg-error/20 text-error', label: 'WARNING' };
    case 'UPDATED':
      return { cls: 'bg-secondary/20 text-secondary', label: 'UPDATED' };
    case 'FAILED':
      return { cls: 'bg-error/20 text-error', label: 'FAILED' };
    default:
      return { cls: 'bg-outline/20 text-on-surface-variant', label: status };
  }
}
