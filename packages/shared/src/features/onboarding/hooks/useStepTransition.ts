import type { UseMutateAsyncFunction } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import { HttpError } from '../../../lib/errors';
import type { FunnelStepTransitionType } from '../types/funnel';

export type StepInputs = Record<string, unknown>;

export interface StepTransitionPayload {
  fromStep: string;
  toStep: string | null;
  transitionEvent: FunnelStepTransitionType;
  inputs?: StepInputs;
}

export type UseStepTransitionRet = {
  transition: UseMutateAsyncFunction<void, HttpError, StepTransitionPayload>;
  isLoading: boolean;
};

export function useStepTransition(sessionId: string): UseStepTransitionRet {
  const { mutateAsync, isPending: isLoading } = useMutation({
    mutationFn: async (payload: StepTransitionPayload) => {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/freyja/sessions/${sessionId}/transition`;

      const res = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      });

      if (res.ok) {
        return;
      }
      throw new HttpError(url, res.status, await res.text());
    },
  });

  return {
    transition: mutateAsync,
    isLoading,
  };
}
