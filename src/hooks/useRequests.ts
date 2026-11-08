import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Request } from '@/data/types';

export function useLenderRequests() {
  return useQuery({
    queryKey: ['lender-requests'],
    queryFn: async (): Promise<Request[]> => {
      const res = await fetch('/api/lender/requests');
      if (!res.ok) throw new Error('Failed to fetch requests');
      return res.json();
    },
  });
}

export function useUpdateRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, copy_id }: { id: string; status: string; copy_id?: string }) => {
      const res = await fetch(`/api/requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, copy_id }),
      });
      if (!res.ok) throw new Error('Failed to update request');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lender-requests'] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
}

export function useSubmitRequest() {
  return useMutation({
    mutationFn: async (payload: {
      copy_id: string;
      passcode: string;
      borrower_name: string;
      borrower_tele: string;
    }) => {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json() as { error?: string };
        throw new Error(body.error ?? 'Failed to submit request');
      }
      return res.json();
    },
  });
}
