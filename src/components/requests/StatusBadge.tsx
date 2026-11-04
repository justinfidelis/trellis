import { Badge } from '@/components/ui/badge';
import type { CopyStatus } from '@/data/types';

const config: Record<CopyStatus, { label: string; variant: 'default' | 'secondary'; className?: string }> = {
  available: { label: 'Available', variant: 'secondary', className: 'bg-lime-600/10 text-lime-700 dark:text-lime-400' },
  reserved: { label: 'Reserved', variant: 'secondary' },
  on_loan: { label: 'On loan', variant: 'secondary' },
  unavailable: { label: 'Unavailable', variant: 'secondary' },
};

interface StatusBadgeProps {
  status: CopyStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const { label, variant, className } = config[status];
  return <Badge variant={variant} className={className}>{label}</Badge>;
}
