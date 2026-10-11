import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import { markDmConversationRead } from '../queries';

// Long enough for a burst to share one mark, and for the sender's report of
// the message, which only goes out on the chat server's ack, to land first.
const readDelayMs = 1500;

// Marks an open thread read once it loads, and again after messages arrive
// while it's open. Only while the page is visible: a thread left open in a
// background tab mustn't swallow what arrives there.
export const useMarkThreadRead = ({
  peerId,
  lastIncomingId,
  isLoaded,
}: {
  peerId: string;
  lastIncomingId?: string;
  isLoaded: boolean;
}): void => {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const readKey = `${peerId}:${lastIncomingId ?? ''}`;
  const markedKeyRef = useRef<string>();
  const pendingRef = useRef<{
    timer?: ReturnType<typeof setTimeout>;
    flush?: () => void;
  }>({});

  useEffect(() => {
    if (!user || !isLoaded || markedKeyRef.current === readKey) {
      return undefined;
    }

    const pending = pendingRef.current;
    const flush = () => {
      clearTimeout(pending.timer);
      pending.timer = undefined;
      markedKeyRef.current = readKey;
      markDmConversationRead(queryClient, user, peerId).catch(() => undefined);
    };
    const schedule = () => {
      clearTimeout(pending.timer);
      pending.timer =
        document.visibilityState === 'visible'
          ? setTimeout(flush, readDelayMs)
          : undefined;
    };

    pending.flush = flush;
    schedule();
    document.addEventListener('visibilitychange', schedule);

    return () => document.removeEventListener('visibilitychange', schedule);
  }, [isLoaded, peerId, queryClient, readKey, user]);

  // Leaving the thread reads what was on screen.
  useEffect(() => {
    const pending = pendingRef.current;

    return () => {
      if (pending.timer) {
        pending.flush?.();
      }
    };
  }, []);
};
