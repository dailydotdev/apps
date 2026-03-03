import type { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import type { ReactElement } from 'react';
import React from 'react';
import { NextSeo } from 'next-seo';
import type { DehydratedState } from '@tanstack/react-query';
import { dehydrate, QueryClient } from '@tanstack/react-query';
import { ArenaEntityPage } from '@dailydotdev/shared/src/features/agents/arena/ArenaEntityPage';
import { arenaOptions } from '@dailydotdev/shared/src/features/agents/arena/queries';
import { computeRankings } from '@dailydotdev/shared/src/features/agents/arena/arenaMetrics';
import type {
  ArenaQueryResponse,
  ArenaTab,
} from '@dailydotdev/shared/src/features/agents/arena/types';
import { getLayout as getFooterNavBarLayout } from '../../components/layouts/FooterNavBarLayout';
import { getLayout } from '../../components/layouts/MainLayout';

interface AgentEntityPageProps {
  entityId: string;
  entityName: string;
  tab: ArenaTab;
  dehydratedState: DehydratedState;
}

const getEntitySeo = ({
  entityId,
  entityName,
}: {
  entityId: string;
  entityName: string;
}) => ({
  title: `${entityName} | Agent profile | daily.dev`,
  description:
    'Developer sentiment, momentum, highlights, and rank for AI agents and LLMs in The Arena.',
  canonical: `https://app.daily.dev/agents/${encodeURIComponent(entityId)}`,
  openGraph: {
    title: `${entityName} | Agent profile | daily.dev`,
    description:
      'Developer sentiment, momentum, highlights, and rank for AI agents and LLMs in The Arena.',
    url: `https://app.daily.dev/agents/${encodeURIComponent(entityId)}`,
    type: 'website',
  },
});

const AgentEntityRoute = ({
  entityId,
  entityName,
  tab,
}: AgentEntityPageProps): ReactElement => {
  return (
    <>
      <NextSeo {...getEntitySeo({ entityId, entityName })} />
      <ArenaEntityPage entityId={entityId} tab={tab} />
    </>
  );
};

export async function getServerSideProps({
  params,
  res,
}: GetServerSidePropsContext): Promise<
  GetServerSidePropsResult<AgentEntityPageProps>
> {
  const entityId = String(params?.entityId ?? '').trim();
  if (!entityId) {
    return { notFound: true };
  }

  res.setHeader(
    'Cache-Control',
    'public, s-maxage=60, stale-while-revalidate=120',
  );

  const queryClient = new QueryClient();
  await Promise.all([
    queryClient.prefetchQuery(arenaOptions({ groupId: 'coding-agents' })),
    queryClient.prefetchQuery(arenaOptions({ groupId: 'llms' })),
  ]);

  const codingAgentsData = queryClient.getQueryData<ArenaQueryResponse>(
    arenaOptions({ groupId: 'coding-agents' }).queryKey,
  );
  const llmsData = queryClient.getQueryData<ArenaQueryResponse>(
    arenaOptions({ groupId: 'llms' }).queryKey,
  );

  const codingAgentsRankings =
    codingAgentsData?.sentimentTimeSeries && codingAgentsData.sentimentGroup
      ? computeRankings(
          codingAgentsData.sentimentTimeSeries.entities.nodes,
          codingAgentsData.sentimentGroup.entities,
          codingAgentsData.sentimentTimeSeries.resolutionSeconds,
        )
      : [];
  const llmsRankings =
    llmsData?.sentimentTimeSeries && llmsData.sentimentGroup
      ? computeRankings(
          llmsData.sentimentTimeSeries.entities.nodes,
          llmsData.sentimentGroup.entities,
          llmsData.sentimentTimeSeries.resolutionSeconds,
        )
      : [];

  const entityExists =
    codingAgentsRankings.some((item) => item.entity.entity === entityId) ||
    llmsRankings.some((item) => item.entity.entity === entityId);
  if (!entityExists) {
    return { notFound: true };
  }

  let tab: ArenaTab = 'coding-agents';
  const codingEntity = codingAgentsRankings.find(
    (item) => item.entity.entity === entityId,
  );
  const llmEntity = llmsRankings.find(
    (item) => item.entity.entity === entityId,
  );
  if (!codingEntity && llmEntity) {
    tab = 'llms';
  }

  const entityName =
    codingEntity?.entity.name ?? llmEntity?.entity.name ?? entityId;

  return {
    props: {
      entityId,
      entityName,
      tab,
      dehydratedState: dehydrate(queryClient),
    },
  };
}

const getAgentEntityLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

AgentEntityRoute.getLayout = getAgentEntityLayout;
AgentEntityRoute.layoutProps = {
  screenCentered: false,
  seo: {
    title: 'Agent profile | daily.dev',
    description:
      'Developer sentiment, momentum, highlights, and rank for AI agents and LLMs in The Arena.',
    canonical: 'https://app.daily.dev/agents',
    openGraph: {
      title: 'Agent profile | daily.dev',
      description:
        'Developer sentiment, momentum, highlights, and rank for AI agents and LLMs in The Arena.',
      url: 'https://app.daily.dev/agents',
      type: 'website',
    },
  },
};

export default AgentEntityRoute;
