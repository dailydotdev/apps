import type { ReactElement } from 'react';
import React, { useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from '../../../components/utilities/Link';
import { FlexRow } from '../../../components/utilities';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { AiIcon, MagicIcon } from '../../../components/icons';
import { SpotlightContext } from '../../../components/spotlight/SpotlightContext';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import { useViewSizeClient, ViewSize } from '../../../hooks/useViewSize';
import { featureInterestAgent } from '../../../lib/featureManagement';
import { webappUrl } from '../../../lib/constants';
import { interestsQueryOptions } from '../queries';
import { toMonitorItems } from '../monitorItems';

export const AgentExploreEntry = ({
  fallback = null,
}: {
  fallback?: ReactElement | null;
} = {}): ReactElement | null => {
  const { user, isAuthReady } = useAuthContext();
  // Read the context directly; `useSpotlight` throws off the app shell.
  const spotlight = useContext(SpotlightContext);
  // Client-side: present or absent rather than restyled, so deciding it during
  // the server render is a hydration mismatch.
  const isTablet = useViewSizeClient(ViewSize.Tablet);
  const { value: showAgent } = useConditionalFeature({
    feature: featureInterestAgent,
    // The viewport gates the render, so it gates enrolment too. `=== false`
    // rather than `!isTablet`: unknown on the first paint must not enrol.
    shouldEvaluate: isAuthReady && !!user && isTablet === false,
  });
  const { data: interests } = useQuery({
    ...interestsQueryOptions(user),
    enabled: showAgent && !!user,
  });

  if (!showAgent || !spotlight || isTablet !== false) {
    return fallback;
  }

  const waiting = toMonitorItems(interests ?? []).filter(
    ({ state }) => state === 'waiting',
  ).length;

  return (
    <FlexRow className="w-full gap-3">
      <Link href={`${webappUrl}agent`} passHref>
        <Button
          tag="a"
          variant={ButtonVariant.Subtle}
          size={ButtonSize.Medium}
          className="flex-1"
          aria-label="Your agents"
          icon={
            <MagicIcon className="text-brand-default" secondary={waiting > 0} />
          }
        >
          Agents
          {!!waiting && (
            <span className="ml-2 rounded-8 bg-brand-default px-1.5 py-0.5 tabular-nums text-white typo-caption2">
              {waiting}
            </span>
          )}
        </Button>
      </Link>
      <Button
        type="button"
        variant={ButtonVariant.Subtle}
        size={ButtonSize.Medium}
        className="flex-1"
        aria-label="Open search"
        icon={<AiIcon secondary />}
        onClick={spotlight.open}
      >
        Search
      </Button>
    </FlexRow>
  );
};
