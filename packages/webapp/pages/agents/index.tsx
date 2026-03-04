import type { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import type { ReactElement } from 'react';
import React, { useEffect, useMemo } from 'react';
import type { DehydratedState } from '@tanstack/react-query';
import {
  dehydrate,
  QueryClient,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import Feed from '@dailydotdev/shared/src/components/Feed';
import { FeedContainer } from '@dailydotdev/shared/src/components/feeds/FeedContainer';
import { SignalPlaceholderList } from '@dailydotdev/shared/src/components/cards/placeholder/SignalPlaceholderList';
import { ArenaRankings } from '@dailydotdev/shared/src/features/agents/arena/ArenaRankings';
import { arenaOptions } from '@dailydotdev/shared/src/features/agents/arena/queries';
import { computeRankings } from '@dailydotdev/shared/src/features/agents/arena/arenaMetrics';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { CopyIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import SourceActionsNotify from '@dailydotdev/shared/src/components/sources/SourceActions/SourceActionsNotify';
import { Tooltip } from '@dailydotdev/shared/src/components/tooltip/Tooltip';
import {
  baseFeedSupportedTypes,
  CHANNEL_FEED_QUERY,
  RankingAlgorithm,
  SOURCE_FEED_QUERY,
} from '@dailydotdev/shared/src/graphql/feed';
import type { FeedData } from '@dailydotdev/shared/src/graphql/feed';
import { gqlClient } from '@dailydotdev/shared/src/graphql/common';
import { useSharePost } from '@dailydotdev/shared/src/hooks/useSharePost';
import { useScrollRestoration } from '@dailydotdev/shared/src/hooks';
import { Origin } from '@dailydotdev/shared/src/lib/log';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { ActiveFeedNameContext } from '@dailydotdev/shared/src/contexts/ActiveFeedNameContext';
import {
  generateQueryKey,
  OtherFeedPage,
  RequestKey,
} from '@dailydotdev/shared/src/lib/query';
import { sourceQueryOptions } from '@dailydotdev/shared/src/graphql/sources';
import { useSourceActions } from '@dailydotdev/shared/src/hooks/source/useSourceActions';
import useFeedSettings from '@dailydotdev/shared/src/hooks/useFeedSettings';
import type { Source } from '@dailydotdev/shared/src/graphql/sources';
import {
  stripHtmlTags,
  truncateAtWordBoundary,
} from '@dailydotdev/shared/src/lib/strings';
import {
  formatDate,
  oneDay,
  oneHour,
  TimeFormatType,
} from '@dailydotdev/shared/src/lib/dateFormat';
import { getLayout as getFooterNavBarLayout } from '../../components/layouts/FooterNavBarLayout';
import { getLayout } from '../../components/layouts/MainLayout';

const AGENTS_TITLE = 'Agents Hub - Arena, Digest & Vibes | daily.dev';
const AGENTS_DESCRIPTION =
  'Track the top coding agents live, catch the latest Agents Digest, and follow the Vibes channel feed on daily.dev.';
const AGENTS_DOOM_SKELETON_COUNT = 6;
const AGENTS_DOOM_SKELETON_IDS = [
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
] as const;
const AGENTS_DIGEST_QUERY_KEY = generateQueryKey(
  RequestKey.SourceFeed,
  undefined,
  'agents_digest_latest_post',
);

interface AgentsHomePageProps {
  dehydratedState: DehydratedState;
}

const LiveIndicator = (): ReactElement => (
  <div className="flex items-center gap-1.5">
    <span className="inline-block h-2 w-2 animate-scale-down-pulse rounded-full bg-accent-avocado-default shadow-[0_0_6px_var(--theme-accent-avocado-default)]" />
    <span className="text-accent-avocado-default typo-caption2">Live</span>
  </div>
);

const DoomScrollingSkeleton = (): ReactElement => (
  <>
    {AGENTS_DOOM_SKELETON_IDS.slice(0, AGENTS_DOOM_SKELETON_COUNT).map((id) => (
      <SignalPlaceholderList key={`doom-skeleton-${id}`} />
    ))}
  </>
);

const TLDR_PARAGRAPH_REGEX =
  /<p>\s*<strong>\s*TL;?DR:?\s*<\/strong>\s*([\s\S]*?)<\/p>/i;
const TLDR_HEADING_REGEX = /<h[1-6][^>]*>\s*TL;?DR\s*:?\s*<\/h[1-6]>/i;
const NEXT_HEADING_REGEX = /<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>/i;
const FIRST_PARAGRAPH_REGEX = /<p[^>]*>([\s\S]*?)<\/p>/i;
const DIGEST_PREVIEW_MAX_LENGTH = 420;
const DIGEST_PREVIEW_FALLBACK = 'Open the latest digest update to read more.';

const extractTldrFromContentHtml = (
  contentHtml?: string | null,
): string | undefined => {
  if (!contentHtml) {
    return undefined;
  }

  const tldrParagraphMatch = contentHtml.match(TLDR_PARAGRAPH_REGEX);
  if (tldrParagraphMatch?.[1]) {
    const tldrParagraph = stripHtmlTags(tldrParagraphMatch[1]).trim();
    if (tldrParagraph) {
      return tldrParagraph;
    }
  }

  const tldrHeadingMatch = contentHtml.match(TLDR_HEADING_REGEX);
  if (!tldrHeadingMatch || typeof tldrHeadingMatch.index !== 'number') {
    return undefined;
  }

  const afterTldrStart = tldrHeadingMatch.index + tldrHeadingMatch[0].length;
  const afterTldrContent = contentHtml.slice(afterTldrStart);
  const nextHeadingMatch = afterTldrContent.match(NEXT_HEADING_REGEX);
  const tldrHtml =
    nextHeadingMatch && typeof nextHeadingMatch.index === 'number'
      ? afterTldrContent.slice(0, nextHeadingMatch.index)
      : afterTldrContent;
  const tldr = stripHtmlTags(tldrHtml).trim();

  return tldr || undefined;
};

const extractDigestPreview = ({
  contentHtml,
}: {
  contentHtml?: string | null;
}): string => {
  const tldrContent = extractTldrFromContentHtml(contentHtml);
  if (tldrContent) {
    return tldrContent;
  }

  if (contentHtml) {
    const firstParagraphMatch = contentHtml.match(FIRST_PARAGRAPH_REGEX);
    const firstParagraph = firstParagraphMatch?.[1]
      ? stripHtmlTags(firstParagraphMatch[1]).trim()
      : stripHtmlTags(contentHtml).trim();

    if (firstParagraph) {
      return truncateAtWordBoundary(firstParagraph, DIGEST_PREVIEW_MAX_LENGTH);
    }
  }

  return DIGEST_PREVIEW_FALLBACK;
};

const DigestSubscribeButton = ({
  source,
}: {
  source: Source;
}): ReactElement => {
  const { isAuthReady, isLoggedIn } = useAuthContext();
  const { feedSettings, isLoading: isFeedSettingsLoading } = useFeedSettings({
    enabled: isLoggedIn && !!source?.id,
  });
  const { isFollowing, toggleFollow, haveNotificationsOn, toggleNotify } =
    useSourceActions({ source });
  const isFollowStatePending =
    !isAuthReady || (isLoggedIn && (isFeedSettingsLoading || !feedSettings));

  if (isFollowStatePending) {
    return null;
  }

  if (isFollowing) {
    return (
      <SourceActionsNotify
        haveNotificationsOn={haveNotificationsOn}
        onClick={async (event) => {
          event.preventDefault();
          event.stopPropagation();
          await toggleNotify();
        }}
      />
    );
  }

  return (
    <Button
      type="button"
      variant={ButtonVariant.Primary}
      size={ButtonSize.Small}
      className="w-28"
      onClick={async (event) => {
        event.preventDefault();
        event.stopPropagation();
        await toggleFollow();
      }}
    >
      Subscribe
    </Button>
  );
};

const AgentsHomePage = (): ReactElement => {
  useScrollRestoration();

  const { user, tokenRefreshed } = useAuthContext();
  const queryClient = useQueryClient();
  const { copyLink } = useSharePost(Origin.Feed);

  const { data: arenaData, isFetching: isFetchingArena } = useQuery(
    arenaOptions({ groupId: 'coding-agents' }),
  );

  const rankings = useMemo(
    () =>
      arenaData?.sentimentTimeSeries && arenaData.sentimentGroup
        ? computeRankings(
            arenaData.sentimentTimeSeries.entities.nodes,
            arenaData.sentimentGroup.entities,
            arenaData.sentimentTimeSeries.resolutionSeconds,
          )
        : [],
    [arenaData?.sentimentTimeSeries, arenaData?.sentimentGroup],
  );

  const topFiveRankings = useMemo(() => rankings.slice(0, 5), [rankings]);
  const isArenaLoading = isFetchingArena && !arenaData;

  const digestFeedVariables = useMemo(
    () => ({
      source: 'agents_digest',
      ranking: RankingAlgorithm.Time,
      first: 1,
      supportedTypes: baseFeedSupportedTypes,
    }),
    [],
  );

  const { data: digestFeed } = useQuery({
    queryKey: AGENTS_DIGEST_QUERY_KEY,
    queryFn: () =>
      gqlClient.request<FeedData>(SOURCE_FEED_QUERY, digestFeedVariables),
  });

  const digestPost = digestFeed?.page?.edges?.[0]?.node;
  const { data: digestSource } = useQuery(
    sourceQueryOptions({ sourceId: 'agents_digest' }),
  );
  const digestTldr = useMemo(() => {
    if (!digestPost) {
      return '';
    }

    return extractDigestPreview({
      contentHtml: digestPost.contentHtml,
    });
  }, [digestPost]);
  const digestUpdatedLabel = useMemo(() => {
    if (!digestPost?.createdAt) {
      return null;
    }

    const createdDate = new Date(digestPost.createdAt);
    const elapsedSeconds = (Date.now() - createdDate.getTime()) / 1000;

    if (elapsedSeconds < oneDay) {
      const hours = Math.max(1, Math.floor(elapsedSeconds / oneHour));
      return `${hours}h ago`;
    }

    return formatDate({
      value: digestPost.createdAt,
      type: TimeFormatType.Post,
    });
  }, [digestPost?.createdAt]);

  const vibesVariables = useMemo(
    () => ({
      channel: 'vibes',
      supportedTypes: baseFeedSupportedTypes,
    }),
    [],
  );

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    queryClient.invalidateQueries({ queryKey: AGENTS_DIGEST_QUERY_KEY });
  }, [queryClient, user?.id]);

  return (
    <div className="mx-auto flex w-full flex-col gap-6 px-4 pb-8 pt-6 laptop:max-w-[42.5rem] laptop:px-0 laptop:pt-10">
      <section className="w-full">
        <div className="mb-2 flex items-center gap-3">
          <h1 className="font-bold tracking-wide text-text-tertiary typo-caption1">
            Leaderboard
          </h1>
          <div className="ml-auto flex items-center gap-3">
            <LiveIndicator />
            <Link href="/agents/arena">
              <a className="text-text-link typo-callout">View all</a>
            </Link>
          </div>
        </div>
        <ArenaRankings
          tools={topFiveRankings}
          tab="coding-agents"
          loading={isArenaLoading}
        />
      </section>

      {!!digestPost && (
        <section className="w-full rounded-16 border border-border-subtlest-tertiary bg-background-default p-4 laptop:p-6">
          <div className="mb-4 flex items-start gap-2">
            <div className="flex flex-col">
              <h2 className="font-bold text-text-primary typo-title3">
                What&apos;s new?
              </h2>
              {digestUpdatedLabel && (
                <span className="text-text-tertiary typo-footnote">
                  Last updated {digestUpdatedLabel}
                </span>
              )}
            </div>
            <div className="ml-auto flex items-center gap-2">
              {!!digestSource?.id && (
                <DigestSubscribeButton source={digestSource} />
              )}
              <Tooltip content="Copy link">
                <Button
                  type="button"
                  variant={ButtonVariant.Secondary}
                  size={ButtonSize.Small}
                  aria-label="Copy link"
                  icon={<CopyIcon size={IconSize.XSmall} />}
                  onClick={() => copyLink({ post: digestPost })}
                />
              </Tooltip>
              <Link href={digestPost.commentsPermalink}>
                <a className="text-text-link typo-callout">Read more</a>
              </Link>
            </div>
          </div>
          {!!digestTldr && (
            <div className="text-text-secondary typo-body">{digestTldr}</div>
          )}
        </section>
      )}

      <section className="w-full">
        <div className="mb-4 flex items-center">
          <h2 className="font-bold text-text-primary typo-title3">
            Doom scrolling
          </h2>
        </div>
        <ActiveFeedNameContext.Provider
          value={{ feedName: OtherFeedPage.Post }}
        >
          {tokenRefreshed ? (
            <Feed
              feedName={OtherFeedPage.Post}
              feedQueryKey={[
                RequestKey.Feeds,
                user?.id ?? 'anonymous',
                'agents_vibes_channel_feed',
                Object.values(vibesVariables),
              ]}
              query={CHANNEL_FEED_QUERY}
              variables={vibesVariables}
              listVariant="signal"
            />
          ) : (
            <FeedContainer showSearch={false}>
              <DoomScrollingSkeleton />
            </FeedContainer>
          )}
        </ActiveFeedNameContext.Provider>
      </section>
    </div>
  );
};

const getAgentsLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

AgentsHomePage.getLayout = getAgentsLayout;
AgentsHomePage.layoutProps = {
  screenCentered: false,
  seo: {
    title: AGENTS_TITLE,
    description: AGENTS_DESCRIPTION,
    canonical: 'https://app.daily.dev/agents',
    openGraph: {
      title: AGENTS_TITLE,
      description: AGENTS_DESCRIPTION,
      url: 'https://app.daily.dev/agents',
      type: 'website',
    },
  },
};

export default AgentsHomePage;

export async function getServerSideProps({
  res,
}: GetServerSidePropsContext): Promise<
  GetServerSidePropsResult<AgentsHomePageProps>
> {
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=60, stale-while-revalidate=120',
  );

  const queryClient = new QueryClient();
  const digestFeedVariables = {
    source: 'agents_digest',
    ranking: RankingAlgorithm.Time,
    first: 1,
    supportedTypes: baseFeedSupportedTypes,
  };
  await Promise.all([
    queryClient.prefetchQuery(arenaOptions({ groupId: 'coding-agents' })),
    queryClient.prefetchQuery({
      queryKey: generateQueryKey(
        RequestKey.SourceFeed,
        undefined,
        'agents_digest_latest_post',
      ),
      queryFn: () =>
        gqlClient.request<FeedData>(SOURCE_FEED_QUERY, digestFeedVariables),
    }),
    queryClient.prefetchQuery(
      sourceQueryOptions({ sourceId: 'agents_digest' }),
    ),
  ]);

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
}
