import type { ReactElement } from 'react';
import React from 'react';
import type { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { ArenaDailySocialCard } from '@dailydotdev/shared/src/features/agents/arena/ArenaDailySocialCard';
import {
  computeCrowns,
  computeRankings,
} from '@dailydotdev/shared/src/features/agents/arena/arenaMetrics';
import { arenaOptions } from '@dailydotdev/shared/src/features/agents/arena/queries';
import type {
  ArenaGroupId,
  CrownType,
} from '@dailydotdev/shared/src/features/agents/arena/types';
import { getArenaLastUpdatedIso } from '@dailydotdev/shared/src/features/agents/arena/timestamps';

interface ArenaCardTool {
  logo: string;
  name: string;
  dIndex: number;
  sentiment: number;
  momentum: number;
  trend: number[];
}

interface ArenaCardCrown {
  type: CrownType;
  label: string;
  stat: string;
  entityName?: string;
  entityLogo?: string;
}

const fallbackTools: ArenaCardTool[] = [
  {
    logo: 'https://media.daily.dev/image/upload/s--Tj7ByrSQ--/f_auto/v1755778080/public/arenatools/cursor-logo.jpg',
    name: 'Cursor',
    dIndex: 9420,
    sentiment: 86,
    momentum: 18,
    trend: [6020, 6400, 6710, 7250, 7810, 8550, 9420],
  },
  {
    logo: 'https://media.daily.dev/image/upload/s--z41G6Epj--/f_auto/v1755605020/public/arenatools/claude-logo.jpg',
    name: 'Claude',
    dIndex: 8870,
    sentiment: 84,
    momentum: 12,
    trend: [6310, 6500, 7000, 7310, 7590, 8120, 8870],
  },
  {
    logo: 'https://media.daily.dev/image/upload/s--gqf2f87F--/f_auto/v1755778134/public/arenatools/windsurf-logo.jpg',
    name: 'Windsurf',
    dIndex: 7610,
    sentiment: 79,
    momentum: 25,
    trend: [4020, 4410, 4890, 5400, 6040, 6880, 7610],
  },
  {
    logo: 'https://media.daily.dev/image/upload/s--NbN9QfJB--/f_auto/v1755605451/public/arenatools/chatgpt-logo.jpg',
    name: 'ChatGPT',
    dIndex: 7230,
    sentiment: 77,
    momentum: 8,
    trend: [5860, 6030, 6240, 6520, 6690, 6980, 7230],
  },
  {
    logo: 'https://media.daily.dev/image/upload/s--tvX9Nqf5--/f_auto/v1755778178/public/arenatools/copilot-logo.jpg',
    name: 'Copilot',
    dIndex: 6950,
    sentiment: 74,
    momentum: -3,
    trend: [6410, 6550, 6720, 6890, 7040, 7010, 6950],
  },
];

const fallbackCrowns: ArenaCardCrown[] = [
  {
    type: 'developers-choice',
    label: "Developer's choice",
    stat: '9,420 D-Index',
    entityName: 'Cursor',
    entityLogo:
      'https://media.daily.dev/image/upload/s--Tj7ByrSQ--/f_auto/v1755778080/public/arenatools/cursor-logo.jpg',
  },
  {
    type: 'most-loved',
    label: 'Most loved',
    stat: '86 / 100',
    entityName: 'Cursor',
    entityLogo:
      'https://media.daily.dev/image/upload/s--Tj7ByrSQ--/f_auto/v1755778080/public/arenatools/cursor-logo.jpg',
  },
  {
    type: 'fastest-rising',
    label: 'Fastest rising',
    stat: '+25% vs prior 24h',
    entityName: 'Windsurf',
    entityLogo:
      'https://media.daily.dev/image/upload/s--gqf2f87F--/f_auto/v1755778134/public/arenatools/windsurf-logo.jpg',
  },
  {
    type: 'most-discussed',
    label: 'Most discussed',
    stat: '12.4k mentions',
    entityName: 'Claude',
    entityLogo:
      'https://media.daily.dev/image/upload/s--z41G6Epj--/f_auto/v1755605020/public/arenatools/claude-logo.jpg',
  },
  {
    type: 'most-controversial',
    label: 'Most controversial',
    stat: 'Heat 71',
    entityName: 'Copilot',
    entityLogo:
      'https://media.daily.dev/image/upload/s--tvX9Nqf5--/f_auto/v1755778178/public/arenatools/copilot-logo.jpg',
  },
];

const formatUpdatedLabel = (iso?: string): string => {
  const parsedDate = iso ? new Date(iso) : new Date();
  const safeDate = Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate;

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(safeDate);
};

interface ArenaDailyImagePageProps {
  updatedAtLabel: string;
  tools: ArenaCardTool[];
  crowns: ArenaCardCrown[];
}

const ArenaDailyImagePage = ({
  updatedAtLabel,
  tools,
  crowns,
}: ArenaDailyImagePageProps): ReactElement => {
  return (
    <div id="screenshot_wrapper" className="w-fit p-6">
      <ArenaDailySocialCard
        title="Who is winning dev sentiment today?"
        updatedAtLabel={updatedAtLabel}
        sourceUrl="https://app.daily.dev/agents/arena"
        tools={tools}
        crowns={crowns}
        animated={false}
      />
    </div>
  );
};

export async function getServerSideProps({
  query,
}: GetServerSidePropsContext): Promise<
  GetServerSidePropsResult<ArenaDailyImagePageProps>
> {
  const tab: ArenaGroupId = query.tab === 'llms' ? 'llms' : 'coding-agents';

  try {
    const arenaData = await arenaOptions({ groupId: tab }).queryFn();
    const rankings = computeRankings(
      arenaData.sentimentTimeSeries.entities.nodes,
      arenaData.sentimentGroup.entities,
      arenaData.sentimentTimeSeries.resolutionSeconds,
    );
    const crowns = computeCrowns(rankings);
    const tools = [...rankings]
      .sort((a, b) => b.dIndex - a.dIndex)
      .map((tool) => ({
        logo: tool.entity.logo,
        name: tool.entity.name,
        dIndex: tool.dIndex,
        sentiment: tool.sentimentDisplay,
        momentum: tool.momentum,
        trend: tool.sparkline,
      }));

    const cardCrowns = crowns.map((crown) => ({
      type: crown.type,
      label: crown.label,
      stat: crown.stat,
      entityName: crown.entity?.name,
      entityLogo: crown.entity?.logo,
    }));

    return {
      props: {
        updatedAtLabel: formatUpdatedLabel(getArenaLastUpdatedIso(arenaData)),
        tools: tools.length > 0 ? tools : fallbackTools,
        crowns: cardCrowns.length > 0 ? cardCrowns : fallbackCrowns,
      },
    };
  } catch {
    return {
      props: {
        updatedAtLabel: formatUpdatedLabel(),
        tools: fallbackTools,
        crowns: fallbackCrowns,
      },
    };
  }
}

export default ArenaDailyImagePage;
