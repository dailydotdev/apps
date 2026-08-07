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
import { AgentFeedDock } from './AgentFeedDock';
import { AgentMonitor, toMonitorItems } from './AgentMonitor';

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

  const onSubmit = () => {
    const trimmed = query.trim();

    if (!trimmed || isCreating) {
      return;
    }

    createInterest(trimmed);
  };

  return (
    <AgentFeedDock>
      <AgentGlassComposer
        value={query}
        onChange={setQuery}
        onSubmit={onSubmit}
        isBusy={isCreating}
        pending={<AgentMonitor items={items} />}
      />
    </AgentFeedDock>
  );
};
