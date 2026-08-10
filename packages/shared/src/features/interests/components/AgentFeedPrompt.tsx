import type { ReactElement } from 'react';
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import { useViewSizeClient, ViewSize } from '../../../hooks/useViewSize';
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
 *
 * From tablet up only. A phone has too little screen to give a permanent inch
 * of it to a bar, and the software keyboard would take the rest — there the
 * agent is reached from the pair on Explore instead.
 */
export const AgentFeedPrompt = (): ReactElement | null => {
  const router = useRouter();
  const { user, isAuthReady } = useAuthContext();
  // Client-side, for the same reason as the Explore pair: this is present or
  // absent rather than restyled.
  const isTablet = useViewSizeClient(ViewSize.Tablet);
  const { value: showAgent } = useConditionalFeature({
    feature: featureInterestAgent,
    // The viewport is part of the gate, so it is part of the enrolment
    // condition: a phone reader can never be shown this dock, and evaluating
    // would enrol them anyway. `=== true` because the client hook has not
    // answered yet on the first paint.
    shouldEvaluate: isAuthReady && !!user && isTablet === true,
  });
  const [query, setQuery] = useState('');
  const { data: interests } = useQuery({
    ...interestsQueryOptions(user),
    enabled: showAgent && !!user,
  });
  const { isCreating, createInterest } = useCreateInterest({
    onCreated: (id) => router.push(`${webappUrl}agent/${id}`),
  });

  if (!showAgent || !isTablet) {
    return null;
  }

  const items = toMonitorItems(interests ?? []);

  const onSubmit = () => {
    const trimmed = query.trim();

    if (!trimmed || isCreating) {
      return;
    }

    // The mutation reports its own failure with a toast; swallowed here so it
    // does not also escape the press as an unhandled rejection.
    createInterest(trimmed).catch(() => undefined);
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
