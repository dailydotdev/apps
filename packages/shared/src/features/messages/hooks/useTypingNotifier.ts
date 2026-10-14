import { useCallback, useEffect, useRef } from 'react';
import { useAuthContext } from '../../../contexts/AuthContext';
import { getDmTransport } from '../transport';
import type { DmChatState, DmPeer } from '../types';

// How long after the last keystroke the peer sees the typing stop.
const pauseAfterMs = 4 * 1000;
// Resent while typing continues, so the peer's own timeout never fires on a
// long message. Keep it well under useMessagesLiveUpdates' typingTimeoutMs.
const repeatComposingMs = 5 * 1000;

type TypingNotifier = {
  // Call on every change to the draft with whether it has text.
  onDraftChange: (hasText: boolean) => void;
  // The message itself tells the peer the typing is over.
  onSent: () => void;
};

// Sends XEP-0085 chat states for the composer. Best effort: a lost state only
// leaves the peer's indicator to time out.
export const useTypingNotifier = (
  peer: DmPeer | null | undefined,
  enabled: boolean,
): TypingNotifier => {
  const { user } = useAuthContext();
  const isComposingRef = useRef(false);
  const composingSentAtRef = useRef(0);
  const pauseTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const send = useCallback(
    (state: DmChatState) => {
      if (!user || !peer || !enabled) {
        return;
      }

      getDmTransport(user.id)
        .sendChatState(peer, state)
        .catch(() => undefined);
    },
    [enabled, peer, user],
  );

  const stop = useCallback(
    (notify: boolean) => {
      clearTimeout(pauseTimerRef.current);
      pauseTimerRef.current = undefined;
      if (isComposingRef.current && notify) {
        send('paused');
      }
      isComposingRef.current = false;
    },
    [send],
  );

  const onDraftChange = useCallback(
    (hasText: boolean) => {
      if (!hasText || !enabled) {
        stop(true);
        return;
      }

      const now = Date.now();
      if (
        !isComposingRef.current ||
        now - composingSentAtRef.current >= repeatComposingMs
      ) {
        send('composing');
        composingSentAtRef.current = now;
      }
      isComposingRef.current = true;
      clearTimeout(pauseTimerRef.current);
      pauseTimerRef.current = setTimeout(() => stop(true), pauseAfterMs);
    },
    [enabled, send, stop],
  );

  const onSent = useCallback(() => stop(false), [stop]);

  // Leaving the thread mid-draft reads as stopping.
  useEffect(() => () => stop(true), [stop]);

  return { onDraftChange, onSent };
};
