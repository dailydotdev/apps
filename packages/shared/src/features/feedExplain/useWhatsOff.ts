import { useMutation } from '@tanstack/react-query';
import { useLogContext } from '../../contexts/LogContext';
import { feedV2SupportedTypes } from '../../graphql/feed';
import { LogEvent, TargetType } from '../../lib/log';
import { getWhatsOff } from './graphql';
import type { WhatsOff } from './types';
import { getWhatsOffSubmitExtra } from './whatsOff';

interface UseWhatsOff {
  answer?: WhatsOff;
  /** What the reader typed, for the answer on screen. */
  text?: string;
  isPending: boolean;
  error: unknown;
  /** Changes on every submit, so each answer starts fresh. */
  submittedAt: number;
  ask: (text: string) => void;
  clear: () => void;
}

/**
 * What's off: reads what the reader typed against the For You feed they see
 * and answers with changes to apply. Every answer costs a model call, so it
 * runs once per submit, never on render or refetch.
 */
export const useWhatsOff = (version: number): UseWhatsOff => {
  const { logEvent } = useLogContext();
  const {
    mutate: ask,
    reset: clear,
    data: answer,
    variables: text,
    isPending,
    error,
    submittedAt,
  } = useMutation({
    mutationFn: (complaint: string) =>
      getWhatsOff({
        version,
        text: complaint,
        supportedTypes: feedV2SupportedTypes,
      }),
    onSuccess: (whatsOff) => {
      logEvent({
        event_name: LogEvent.SubmitWhatsOff,
        target_type: TargetType.WhatsOff,
        target_id: whatsOff.id,
        extra: JSON.stringify(getWhatsOffSubmitExtra(whatsOff)),
      });
    },
  });

  return { answer, text, isPending, error, submittedAt, ask, clear };
};
