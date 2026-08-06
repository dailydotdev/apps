import type { ReactElement } from 'react';
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import { featureInterestAgent } from '../../../lib/featureManagement';
import { webappUrl } from '../../../lib/constants';
import { interestsQueryOptions } from '../queries';
import { useCreateInterest } from '../hooks/useCreateInterest';
import { AgentGlassComposer } from './AgentGlassComposer';
import { AgentMonitor, toMonitorItems } from './AgentMonitor';
import { AgentReviewChips } from './AgentReviewChips';

/**
 * The agent's way into the feed.
 *
 * Docked over the bottom of whatever you are reading, because that is when the
 * thought arrives: you scroll past the third near-identical post on a topic
 * and want something to watch it for you. It has no close button on purpose:
 * it is also the only place a finished run reports back, so hiding it would
 * hide the news with it.
 */
export const AgentFeedPrompt = (): ReactElement | null => {
  const router = useRouter();
  const { user, isAuthReady } = useAuthContext();
  const { value: showAgent } = useConditionalFeature({
    feature: featureInterestAgent,
    shouldEvaluate: isAuthReady && !!user,
  });
  const [query, setQuery] = useState('');
  const { data: interests } = useQuery({
    ...interestsQueryOptions(user),
    enabled: showAgent && !!user,
  });
  const { isCreating, createInterest } = useCreateInterest({
    onCreated: (id) => router.push(`${webappUrl}agent/${id}`),
  });

  if (!showAgent) {
    return null;
  }

  const items = toMonitorItems(interests ?? []);
  const waiting = items.filter(({ state }) => state === 'new');

  const onSubmit = () => {
    const trimmed = query.trim();

    if (!trimmed || isCreating) {
      return;
    }

    createInterest(trimmed);
  };

  return (
    // Clear of the mobile footer nav, and never wider than the reading column.
    <div className="pointer-events-none fixed inset-x-0 bottom-16 z-popup flex justify-center px-4 tablet:bottom-6">
      <div className="pointer-events-auto relative w-full max-w-[36rem]">
        <AgentGlassComposer
          value={query}
          onChange={setQuery}
          onSubmit={onSubmit}
          isBusy={isCreating}
          pending={<AgentReviewChips items={waiting} />}
          status={<AgentMonitor items={items} />}
        />
      </div>
    </div>
  );
};
