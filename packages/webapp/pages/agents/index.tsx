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
import { arenaOptions } from '@dailydotdev/shared/src/features/agents/arena/queries';
import { computeRankings } from '@dailydotdev/shared/src/features/agents/arena/arenaMetrics';
import type { ArenaTab } from '@dailydotdev/shared/src/features/agents/arena/types';
import type { FeedData } from '@dailydotdev/shared/src/graphql/feed';
import {
  baseFeedSupportedTypes,
  RankingAlgorithm,
  SOURCE_FEED_QUERY,
} from '@dailydotdev/shared/src/graphql/feed';
import { gqlClient } from '@dailydotdev/shared/src/graphql/common';
import { useSharePost } from '@dailydotdev/shared/src/hooks/useSharePost';
import { useScrollRestoration } from '@dailydotdev/shared/src/hooks';
import { Origin } from '@dailydotdev/shared/src/lib/log';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import {
  generateQueryKey,
  RequestKey,
} from '@dailydotdev/shared/src/lib/query';
import { sourceQueryOptions } from '@dailydotdev/shared/src/graphql/sources';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { KeyIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { AgentsLeaderboardSection } from '../../components/agents/AgentsLeaderboardSection';
import { AgentsDigestCard } from '../../components/agents/AgentsDigestCard';
import { AgentsDoomScrollingSection } from '../../components/agents/AgentsDoomScrollingSection';
import { getLayout as getFooterNavBarLayout } from '../../components/layouts/FooterNavBarLayout';
import { getLayout } from '../../components/layouts/MainLayout';

const AGENTS_TITLE = 'Agentic Hub | daily.dev';
const AGENTS_DESCRIPTION =
  'Stay on top of AI coding with live rankings, momentum shifts, developer sentiment, and the latest news and content to make smarter tool decisions.';
const HUB_ARENA_TAB: ArenaTab = 'llms';
const AGENTS_DIGEST_QUERY_KEY = generateQueryKey(
  RequestKey.SourceFeed,
  undefined,
  'agents_digest_latest_post',
);

interface AgentsHomePageProps {
  dehydratedState: DehydratedState;
}

const digestFeedVariables = {
  source: 'agents_digest',
  ranking: RankingAlgorithm.Time,
  first: 1,
  supportedTypes: baseFeedSupportedTypes,
};

const AgentsHomePage = (): ReactElement => {
  useScrollRestoration();

  const { user, tokenRefreshed } = useAuthContext();
  const queryClient = useQueryClient();
  const { copyLink } = useSharePost(Origin.Feed);

  const { data: arenaData, isFetching: isFetchingArena } = useQuery(
    arenaOptions({ groupId: HUB_ARENA_TAB }),
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

  const { data: digestFeed } = useQuery({
    queryKey: AGENTS_DIGEST_QUERY_KEY,
    queryFn: () =>
      gqlClient.request<FeedData>(SOURCE_FEED_QUERY, digestFeedVariables),
  });

  const digestPost = digestFeed?.page?.edges?.[0]?.node;
  const { data: digestSource } = useQuery(
    sourceQueryOptions({ sourceId: 'agents_digest' }),
  );

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    queryClient.invalidateQueries({ queryKey: AGENTS_DIGEST_QUERY_KEY });
  }, [queryClient, user?.id]);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col pb-8 laptop:border-x laptop:border-border-subtlest-tertiary">
      <header className="w-full border-b border-border-subtlest-tertiary px-3 py-3 laptop:px-4 laptop:py-3">
        <div className="flex items-start gap-2">
          <div className="flex min-w-0 flex-1 flex-col">
            <h1 className="font-bold text-text-primary typo-title3 laptop:typo-title2">
              Agentic Hub
            </h1>
            <p className="text-text-tertiary typo-caption1">
              Stay on top of AI coding with live rankings, momentum shifts,
              developer sentiment, and the latest news and content.
            </p>
          </div>
          <div className="flex shrink-0 items-center">
            <Button
              tag="a"
              href="/settings/api"
              type="button"
              variant={ButtonVariant.Float}
              size={ButtonSize.Small}
              className="laptop:hidden"
              aria-label="Connect your agent"
              icon={<KeyIcon size={IconSize.Small} />}
            />
            <Button
              tag="a"
              href="/settings/api"
              type="button"
              variant={ButtonVariant.Float}
              size={ButtonSize.Small}
              className="hidden laptop:inline-flex"
              icon={<KeyIcon size={IconSize.Small} />}
            >
              Connect
            </Button>
          </div>
        </div>
      </header>
      <AgentsLeaderboardSection
        tools={topFiveRankings}
        loading={isArenaLoading}
        tab={HUB_ARENA_TAB}
      />
      <AgentsDigestCard
        post={digestPost}
        source={digestSource}
        onCopyLink={() => {
          if (!digestPost) {
            return;
          }

          copyLink({ post: digestPost });
        }}
      />
      <AgentsDoomScrollingSection
        userId={user?.id}
        tokenRefreshed={tokenRefreshed}
      />
    </main>
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
      images: [
        {
          url: 'https://og.daily.dev/api/arena?tab=llms&hideLink=1',
        },
      ],
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

  await Promise.all([
    queryClient.prefetchQuery(arenaOptions({ groupId: HUB_ARENA_TAB })),
    queryClient.prefetchQuery({
      queryKey: AGENTS_DIGEST_QUERY_KEY,
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
