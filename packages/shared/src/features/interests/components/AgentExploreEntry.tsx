import type { ReactElement } from 'react';
import React, { useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import classNames from 'classnames';
import Link from '../../../components/utilities/Link';
import { FlexRow } from '../../../components/utilities';
import { AiIcon, MagicIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { SpotlightContext } from '../../../components/spotlight/SpotlightContext';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import { useViewSizeClient, ViewSize } from '../../../hooks/useViewSize';
import { featureInterestAgent } from '../../../lib/featureManagement';
import { webappUrl } from '../../../lib/constants';
import { interestsQueryOptions } from '../queries';
import { toMonitorItems } from './AgentMonitor';

const half =
  'agent-press-row flex min-w-0 flex-1 items-center gap-2 px-3 transition-colors hover:bg-surface-hover';

/**
 * The two ways of going to look for something, in one object.
 *
 * Search is what you do when you know what you want; an agent is what you leave
 * behind when you don't and want to be told later. Explore is where both
 * belong, so they sit in a single field split down the middle rather than as a
 * button that happens to be near a search box.
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
    shouldEvaluate: isAuthReady && !!user,
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
    <FlexRow className="h-12 w-full items-stretch overflow-hidden rounded-12 border border-border-subtlest-tertiary bg-background-subtle">
      <Link href={`${webappUrl}agent`}>
        <a className={half} aria-label="Your agents">
          <MagicIcon
            size={IconSize.Small}
            className="shrink-0 text-brand-default"
            secondary={waiting > 0}
          />
          <span className="min-w-0 flex-1 truncate typo-callout">Agents</span>
          {/* The count is the reason to look: an agent that came back while
                you were elsewhere has no other way of saying so here. */}
          {!!waiting && (
            <span className="shrink-0 rounded-8 bg-brand-default px-1.5 py-0.5 tabular-nums text-white typo-caption2">
              {waiting}
            </span>
          )}
        </a>
      </Link>
      <span aria-hidden className="w-px bg-border-subtlest-tertiary" />
      <button
        type="button"
        onClick={spotlight.open}
        aria-label="Open search"
        className={classNames(half, 'text-text-tertiary')}
      >
        <AiIcon size={IconSize.Small} className="shrink-0" secondary />
        <span className="min-w-0 flex-1 truncate text-left typo-callout">
          Search
        </span>
      </button>
    </FlexRow>
  );
};
