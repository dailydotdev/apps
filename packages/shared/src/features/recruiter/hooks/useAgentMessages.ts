import { useEffect, useState } from 'react';
import type { Opportunity } from '../../opportunity/types';
import {
  createSeed,
  generateMessage,
  getMessageIndexFromTime,
  getMillisecondsUntilNextMessage,
} from '../lib/agentActivityMessages';

interface UseAgentMessagesOptions {
  opportunity: Opportunity | undefined;
  opportunityId: string;
  enabled?: boolean;
}

interface UseAgentMessagesResult {
  currentMessage: string;
}

/**
 * Hook that manages rotating agent activity messages.
 * Messages change every 10 seconds, synchronized to wall clock time.
 * This ensures consistency across page refreshes - same second = same message.
 */
export function useAgentMessages({
  opportunity,
  opportunityId,
  enabled = true,
}: UseAgentMessagesOptions): UseAgentMessagesResult {
  const seed = createSeed(opportunityId);
  const [messageIndex, setMessageIndex] = useState(getMessageIndexFromTime);

  const currentMessage = generateMessage(opportunity, messageIndex, seed);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    let timeoutId: ReturnType<typeof setTimeout>;

    // Schedule the next update at the exact moment the index should change
    const scheduleNext = () => {
      const msUntilNext = getMillisecondsUntilNextMessage();

      timeoutId = setTimeout(() => {
        setMessageIndex(getMessageIndexFromTime());
        scheduleNext();
      }, msUntilNext);
    };

    scheduleNext();

    return () => {
      clearTimeout(timeoutId);
    };
  }, [enabled]);

  return {
    currentMessage,
  };
}
