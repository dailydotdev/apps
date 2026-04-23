import type { GetStaticPropsResult } from 'next';
import type { ReactElement } from 'react';
import React, { useCallback, useMemo } from 'react';
import type { DehydratedState } from '@tanstack/react-query';
import { dehydrate, QueryClient, useQuery } from '@tanstack/react-query';
import { arenaOptions } from '@dailydotdev/shared/src/features/agents/arena/queries';
import { computeRankings } from '@dailydotdev/shared/src/features/agents/arena/arenaMetrics';
import type { ArenaTab } from '@dailydotdev/shared/src/features/agents/arena/types';
import { gqlClient } from '@dailydotdev/shared/src/graphql/common';
import type { PostHighlight } from '@dailydotdev/shared/src/graphql/highlights';
import { POST_HIGHLIGHTS_QUERY } from '@dailydotdev/shared/src/graphql/highlights';
import { useScrollRestoration } from '@dailydotdev/shared/src/hooks';
import { useToastNotification } from '@dailydotdev/shared/src/hooks/useToastNotification';
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
import { KeyIcon, ShareIcon } from '@dailydotdev/shared/src/components/icons';
import { Tooltip } from '@dailydotdev/shared/src/components/tooltip/Tooltip';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { AgentsHighlightsSection } from '../../components/agents/AgentsHighlightsSection';
import { AgentsLeaderboardSection } from '../../components/agents/AgentsLeaderboardSection';
import { AgentsDoomScrollingSection } from '../../components/agents/AgentsDoomScrollingSection';
import { getLayout as getFooterNavBarLayout } from '../../components/layouts/FooterNavBarLayout';
import { getLayout } from '../../components/layouts/MainLayout';

const AGENTS_TITLE = 'Agentic Hub | daily.dev';
const AGENTS_DESCRIPTION =
  'Stay on top of AI coding with live rankings, momentum shifts, developer sentiment, and the latest news and content to make smarter tool decisions.';
const HUB_ARENA_TAB: ArenaTab = 'llms';
const HIGHLIGHTS_CHANNEL = 'vibes';
const HIGHLIGHTS_QUERY_KEY = generateQueryKey(
  RequestKey.PostHighlights,
  undefined,
  HIGHLIGHTS_CHANNEL,
);
interface AgentsHomePageProps {
  dehydratedState: DehydratedState;
}

const AgentsHomePage = (): ReactElement => {
  useScrollRestoration();

  const { user, tokenRefreshed } = useAuthContext();
  const { displayToast } = useToastNotification();

  const onSharePage = useCallback(async () => {
    await navigator.clipboard.writeText(window.location.href);
    displayToast('Link copied to clipboard');
  }, [displayToast]);

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

  const { data: highlightsData, isFetching: isFetchingHighlights } = useQuery({
    queryKey: HIGHLIGHTS_QUERY_KEY,
    queryFn: () =>
      gqlClient.request<{ postHighlights: PostHighlight[] }>(
        POST_HIGHLIGHTS_QUERY,
        { channel: HIGHLIGHTS_CHANNEL },
      ),
  });

  const highlights = highlightsData?.postHighlights ?? [];
  const isHighlightsLoading = isFetchingHighlights && !highlightsData;

  const { data: digestSource } = useQuery(
    sourceQueryOptions({ sourceId: 'agents_digest' }),
  );

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
          <div className="flex shrink-0 items-center gap-1.5">
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
            <Tooltip content="Share">
              <Button
                type="button"
                variant={ButtonVariant.Float}
                size={ButtonSize.Small}
                aria-label="Share"
                icon={<ShareIcon size={IconSize.Small} />}
                onClick={onSharePage}
              />
            </Tooltip>
          </div>
        </div>
      </header>
      <AgentsHighlightsSection
        highlights={highlights}
        loading={isHighlightsLoading}
        digestSource={digestSource}
      />
      <AgentsLeaderboardSection
        tools={topFiveRankings}
        loading={isArenaLoading}
        tab={HUB_ARENA_TAB}
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

export async function getStaticProps(): Promise<
  GetStaticPropsResult<AgentsHomePageProps>
> {
  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: HIGHLIGHTS_QUERY_KEY,
      queryFn: () =>
        gqlClient.request<{ postHighlights: PostHighlight[] }>(
          POST_HIGHLIGHTS_QUERY,
          { channel: HIGHLIGHTS_CHANNEL },
        ),
    }),
    queryClient.prefetchQuery(arenaOptions({ groupId: HUB_ARENA_TAB })),
    queryClient.prefetchQuery(
      sourceQueryOptions({ sourceId: 'agents_digest' }),
    ),
  ]);

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
    revalidate: 600,
  };
}
