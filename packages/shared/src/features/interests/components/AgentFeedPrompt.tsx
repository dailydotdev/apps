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
import { toMonitorItems } from '../monitorItems';
import { AgentMonitor } from './AgentMonitor';

// No close button on purpose: this is also where a finished run reports back.
export const AgentFeedPrompt = (): ReactElement | null => {
  const router = useRouter();
  const { user, isAuthReady } = useAuthContext();
  // Client-side: present or absent rather than restyled, so deciding it during
  // the server render is a hydration mismatch.
  const isTablet = useViewSizeClient(ViewSize.Tablet);
  const { value: showAgent } = useConditionalFeature({
    feature: featureInterestAgent,
    // The viewport gates the render, so it gates enrolment too. `=== true`
    // rather than `isTablet`: unknown on the first paint must not enrol.
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

    // The mutation toasts its own failure; swallowed so the press does not
    // also throw an unhandled rejection.
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
