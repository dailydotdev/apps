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
import { toMonitorItems } from './AgentMonitor';

/**
 * The two ways of going to look for something, side by side.
 *
 * Search is what you do when you know what you want; an agent is what you leave
 * behind when you don't and want to be told later. Explore is where both
 * belong, so both are here, as two buttons of the same weight — one field split
 * down the middle read as a search box with something bolted to its left.
 *
 * It takes the place of Explore's own search field rather than sitting under
 * it. Mobile Explore has no header but that field, so adding a second Search
 * below it asked the same question twice; the pair answers both.
 *
 * A phone only. From tablet up the agent is reached through the field docked
 * over the feed, and two ways in on the same screen is one too many: this pair
 * and that bar are the same door. Anywhere it stands down it renders
 * `fallback`, so the slot it was given is never left empty.
 */
export const AgentExploreEntry = ({
  fallback = null,
}: {
  fallback?: ReactElement | null;
} = {}): ReactElement | null => {
  const { user, isAuthReady } = useAuthContext();
  // Read rather than `useSpotlight`, which throws off the app shell. Half a
  // paired control is not worth rendering, so it stands down instead.
  const spotlight = useContext(SpotlightContext);
  // Client-side: this is present or absent rather than restyled, so deciding
  // it during the server render is a hydration mismatch. Asking for tablet
  // rather than "is mobile" keeps the unresolved first paint empty instead of
  // flashing the phone layout on a desktop.
  const isTablet = useViewSizeClient(ViewSize.Tablet);
  const { value: showAgent } = useConditionalFeature({
    feature: featureInterestAgent,
    // The viewport is part of the gate, so it is part of the enrolment
    // condition: evaluating enrols, and a desktop reader who can never be
    // shown this pair would otherwise be measured on an experience they never
    // got. `=== false` rather than `!isTablet` because the client hook has not
    // answered yet on the first paint, and unknown must not enrol either.
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
          {/* The count is the reason to look: an agent that came back while
              you were elsewhere has no other way of saying so here. */}
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
