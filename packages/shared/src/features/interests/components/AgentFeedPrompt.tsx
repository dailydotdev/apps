import type { ReactElement } from 'react';
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { FlexRow } from '../../../components/utilities';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { MiniCloseIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import { featureInterestAgent } from '../../../lib/featureManagement';
import { webappUrl } from '../../../lib/constants';
import { UserInterestStatus } from '../../../graphql/interests';
import { interestsQueryOptions } from '../queries';
import { useCreateInterest } from '../hooks/useCreateInterest';
import { AgentGlassComposer } from './AgentGlassComposer';
import { AgentRunStrip } from './AgentRunStrip';

/**
 * The agent's way into the feed.
 *
 * Docked over the bottom of whatever you are reading, because that is when the
 * thought arrives: you scroll past the third near-identical post on a topic
 * and want something to watch it for you. Dismissable, and gone for the rest
 * of the session once it is.
 */
export const AgentFeedPrompt = (): ReactElement | null => {
  const router = useRouter();
  const { user, isAuthReady } = useAuthContext();
  const { value: showAgent } = useConditionalFeature({
    feature: featureInterestAgent,
    shouldEvaluate: isAuthReady && !!user,
  });
  const [query, setQuery] = useState('');
  const [isDismissed, setDismissed] = useState(false);
  const { data: interests } = useQuery({
    ...interestsQueryOptions(user),
    enabled: showAgent && !!user,
  });
  const { isCreating, createInterest } = useCreateInterest({
    onCreated: (id) => router.push(`${webappUrl}agent/${id}`),
  });

  if (!showAgent || isDismissed) {
    return null;
  }

  const running = (interests ?? []).filter(
    ({ status }) => status === UserInterestStatus.Active,
  );

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
          banner={running.length ? <AgentRunStrip agents={running} /> : null}
        />
        <FlexRow className="absolute -right-1 -top-1">
          <Button
            icon={<MiniCloseIcon size={IconSize.Size16} />}
            size={ButtonSize.XSmall}
            variant={ButtonVariant.Subtle}
            className="!bg-background-subtle"
            aria-label="Hide the agent field"
            onClick={() => setDismissed(true)}
          />
        </FlexRow>
      </div>
    </div>
  );
};
