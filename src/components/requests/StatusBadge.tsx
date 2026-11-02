import { Badge } from '@/components/ui/badge';
import type { CopyStatus } from '@/data/types';

const config: Record<CopyStatus, { label: string; variant: 'default' | 'secondary' }> = {
  available: { label: 'Available', variant: 'default' },
  reserved: { label: 'Reserved', variant: 'secondary' },
  on_loan: { label: 'On loan', variant: 'secondary' },
  unavailable: { label: 'Unavailable', variant: 'secondary' },
};

interface StatusBadgeProps {
  status: CopyStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const { label, variant } = config[status];
  return <Badge variant={variant}>{label}</Badge>;
}
