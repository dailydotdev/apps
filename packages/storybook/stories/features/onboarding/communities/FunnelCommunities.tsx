import type { ReactElement, ReactNode } from 'react';
import React, { useCallback, useEffect, useMemo } from 'react';
import classNames from 'classnames';
import { useQuery } from '@tanstack/react-query';
import type { FunnelStepTransitionCallback } from '@dailydotdev/shared/src/features/onboarding/types/funnel';
import { FunnelStepTransitionType } from '@dailydotdev/shared/src/features/onboarding/types/funnel';
import {
  FunnelStepCtaWrapper,
  funnelStepRail,
} from '@dailydotdev/shared/src/features/onboarding/shared/FunnelStepCtaWrapper';
import { sanitizeMessage } from '@dailydotdev/shared/src/features/onboarding/lib/utils';
import {
  OnboardingHeadline,
  OnboardingSubheadline,
} from '@dailydotdev/shared/src/components/onboarding/common';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import useFeedSettings from '@dailydotdev/shared/src/hooks/useFeedSettings';
import { suggestedTagsQueryOptions } from '@dailydotdev/shared/src/graphql/feedSettings';
import { ElementPlaceholder } from '@dailydotdev/shared/src/components/ElementPlaceholder';
import { VIcon } from '@dailydotdev/shared/src/components/icons/V';
import { communityPacksQueryOptions } from './communityPacks';
import { useJoinCommunities } from './useJoinCommunities';
import { usePackSelection } from './packSelection';
import { CommunityPackRow } from './CommunityPackRow';

// What engineering adds to the `FunnelStep` union as `FunnelStepType.Communities`.
export interface FunnelStepCommunitiesProps {
  parameters: {
    headline?: string;
    explainer?: string;
    cta?: string;
    // How many topic packs to offer.
    limit?: number;
    // Packs to join before Continue unlocks, like the tag step's minimum.
    minimumPacks?: number;
  };
  onTransition: FunnelStepTransitionCallback<{
    packs: string[];
    squads: string[];
    sources: string[];
    users: string[];
  }>;
}

const DEFAULT_HEADLINE = 'Find your communities';
const PACK_PROMISE =
  "Each pack brings a topic's top Squads, sources and the developers writing about it.";
const DEFAULT_LIMIT = 10;
const MINIMUM_PACKS = 3;
// Topics too thin to fill a pack are dropped, so a few more are asked for.
const SPARE_TOPICS = 4;
const PLACEHOLDER_ROWS = 5;
const NAMED_TAGS = 3;

// Says where the packs came from, in the user's own words: the tags they
// picked one step earlier.
const getExplainer = (yourTitles: string[]): string => {
  if (!yourTitles.length) {
    return `Here are the topics developers join most. ${PACK_PROMISE}`;
  }

  const named = yourTitles.slice(0, NAMED_TAGS);
  const rest = yourTitles.length - named.length;
  const list =
    rest > 0
      ? `${named.join(', ')} and ${rest} more`
      : `${named.slice(0, -1).join(', ')}${
          named.length > 1 ? ' and ' : ''
        }${named.at(-1)}`;

  return `Built from the tags you picked: ${list}. ${PACK_PROMISE}`;
};

const getProgress = (required: number, joined: number): string => {
  const remaining = required - joined;

  if (remaining <= 0) {
    return "You're all set. Join more anytime.";
  }

  if (!joined) {
    return `Join ${required} ${required === 1 ? 'pack' : 'packs'} to continue`;
  }

  return `Join ${remaining} more to continue`;
};

const PackSection = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}): ReactElement => (
  <section className="flex w-full flex-col">
    <h2 className="font-bold text-text-tertiary typo-footnote">{title}</h2>
    <ul className="flex w-full flex-col divide-y divide-border-subtlest-tertiary">
      {children}
    </ul>
  </section>
);

export function FunnelCommunities({
  parameters: {
    headline,
    explainer,
    cta,
    limit = DEFAULT_LIMIT,
    minimumPacks = MINIMUM_PACKS,
  },
  onTransition,
}: FunnelStepCommunitiesProps): ReactElement | null {
  const { user } = useAuthContext();
  const { feedSettings } = useFeedSettings();
  const { data: suggested, isPending: isSuggestedPending } = useQuery(
    suggestedTagsQueryOptions(),
  );
  const topics = useMemo(() => {
    if (!feedSettings || isSuggestedPending) {
      return [];
    }

    return [
      ...new Set([
        ...(feedSettings.includeTags ?? []),
        ...(suggested?.onboardingTags.tags.flatMap(({ name }) =>
          name ? [name] : [],
        ) ?? []),
      ]),
    ].slice(0, limit + SPARE_TOPICS);
  }, [feedSettings, isSuggestedPending, limit, suggested]);
  const { data: packs, isPending: isPacksPending } = useQuery(
    communityPacksQueryOptions({ tags: topics, limit }),
  );
  const isPending =
    !feedSettings || isSuggestedPending || (!!topics.length && isPacksPending);
  const { isJoined, togglePack, joinedPacks, joinedMembers } =
    usePackSelection(packs);
  const { joinCommunities, isJoining } = useJoinCommunities();
  const headlineHtml = useMemo(
    () => sanitizeMessage(headline || DEFAULT_HEADLINE),
    [headline],
  );
  const onSkip = useCallback(
    () => onTransition({ type: FunnelStepTransitionType.Skip }),
    [onTransition],
  );
  const hasNothingToOffer = !isPending && !packs?.length;
  const userTags = feedSettings?.includeTags ?? [];
  const yourPacks = packs?.filter(({ tag }) => userTags.includes(tag)) ?? [];
  const morePacks = packs?.filter(({ tag }) => !userTags.includes(tag)) ?? [];
  // Never ask for more packs than there are to pick from.
  const requiredPacks = Math.min(minimumPacks, packs?.length ?? 0);
  const isReady = joinedPacks.length > 0 && joinedPacks.length >= requiredPacks;

  useEffect(() => {
    if (hasNothingToOffer) {
      onSkip();
    }
  }, [hasNothingToOffer, onSkip]);

  const onJoin = useCallback(async () => {
    const joined = await joinCommunities(joinedMembers);

    onTransition({
      type: FunnelStepTransitionType.Complete,
      details: { packs: joinedPacks.map(({ tag }) => tag), ...joined },
    });
  }, [joinCommunities, joinedMembers, joinedPacks, onTransition]);

  if (!user || hasNothingToOffer) {
    return null;
  }

  const renderRows = (list: typeof yourPacks) =>
    list.map((pack) => (
      <CommunityPackRow
        key={pack.tag}
        isJoined={isJoined(pack)}
        onToggle={() => togglePack(pack)}
        pack={pack}
      />
    ));

  return (
    <FunnelStepCtaWrapper
      isGlass
      containerClassName="flex w-full flex-1 flex-col items-center overflow-hidden"
      cta={{ label: cta || 'Continue' }}
      disabled={!isReady}
      docked={
        !isPending && (
          <p
            aria-live="polite"
            className={classNames(
              'mx-auto flex w-fit items-center justify-center gap-1 rounded-[100rem] border border-border-subtlest-tertiary bg-background-subtle px-4 py-1.5 text-center typo-callout',
              isReady ? 'text-status-success' : 'text-text-secondary',
            )}
          >
            {isReady && <VIcon />}
            {getProgress(requiredPacks, joinedPacks.length)}
          </p>
        )
      }
      loading={isJoining}
      onClick={onJoin}
    >
      <div
        className={classNames(
          funnelStepRail,
          'z-1 flex flex-col items-center gap-6 py-6 pt-3',
        )}
      >
        <div className="flex flex-col gap-3">
          <OnboardingHeadline
            dangerouslySetInnerHTML={{ __html: headlineHtml }}
          />
          <OnboardingSubheadline>
            {explainer || getExplainer(yourPacks.map(({ title }) => title))}
          </OnboardingSubheadline>
        </div>
        {isPending || !packs ? (
          <ul className="flex w-full flex-col divide-y divide-border-subtlest-tertiary">
            {Array.from({ length: PLACEHOLDER_ROWS }, (_, index) => (
              <li key={index} className="flex items-start gap-4 py-3">
                <ElementPlaceholder className="size-14 rounded-10" />
                <span className="flex flex-1 flex-col gap-2 pt-1">
                  <ElementPlaceholder className="h-4 w-1/2 rounded-6" />
                  <ElementPlaceholder className="h-3 w-2/3 rounded-6" />
                  <ElementPlaceholder className="h-3 w-1/3 rounded-6" />
                </span>
                <ElementPlaceholder className="h-8 w-14 rounded-10" />
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex w-full flex-col gap-6">
            {!!yourPacks.length && (
              <PackSection title="From your tags">
                {renderRows(yourPacks)}
              </PackSection>
            )}
            {!!morePacks.length && (
              <PackSection
                title={
                  yourPacks.length ? 'Popular with developers' : 'Most joined'
                }
              >
                {renderRows(morePacks)}
              </PackSection>
            )}
          </div>
        )}
      </div>
    </FunnelStepCtaWrapper>
  );
}
