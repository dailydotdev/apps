import type { NextApiRequest, NextApiResponse } from 'next';
import { gqlClient } from '@dailydotdev/shared/src/graphql/common';
import { escapeMarkdown } from '@dailydotdev/shared/src/lib/strings';
import {
  ARENA_GROUP_IDS,
  ARENA_TABS,
} from '@dailydotdev/shared/src/features/agents/arena/config';
import { ARENA_QUERY } from '@dailydotdev/shared/src/features/agents/arena/graphql';
import {
  computeRankings,
  formatDIndex,
  formatVolume,
} from '@dailydotdev/shared/src/features/agents/arena/arenaMetrics';
import { getArenaLastUpdatedIso } from '@dailydotdev/shared/src/features/agents/arena/timestamps';
import type {
  ArenaGroupId,
  ArenaQueryResponse,
} from '@dailydotdev/shared/src/features/agents/arena/types';

const TOP_ITEMS_LIMIT = 20;

const getTabUrl = (tab: ArenaGroupId): string => {
  if (tab === 'coding-agents') {
    return '/agents/arena';
  }

  return '/agents/arena?tab=llms';
};

const getTabMarkdownSection = ({
  tab,
  data,
}: {
  tab: ArenaGroupId;
  data: ArenaQueryResponse;
}): string => {
  if (!data.sentimentGroup) {
    throw new Error(`Arena sentiment group not found for tab "${tab}"`);
  }

  const rankedItems = computeRankings(
    data.sentimentTimeSeries.entities.nodes,
    data.sentimentGroup.entities,
    data.sentimentTimeSeries.resolutionSeconds,
  );

  const entries = rankedItems.slice(0, TOP_ITEMS_LIMIT);
  const list = entries
    .map((item, index) => {
      const rank = index + 1;
      const name = escapeMarkdown(item.entity.name);
      const dIndex = formatDIndex(item.dIndex);
      const sentiment = `${item.sentimentDisplay}%`;
      const volume = formatVolume(item.volume24h);

      return `${rank}. [${name}](${getTabUrl(
        tab,
      )}) - D/Index: ${dIndex}, Sentiment: ${sentiment}, 24h volume: ${volume}`;
    })
    .join('\n');

  return `## ${data.sentimentGroup.name}\n\n${list}`;
};

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> => {
  if (req.method !== 'GET') {
    res.status(405).send('Method not allowed');
    return;
  }

  try {
    const tabs = ARENA_TABS.map((tab) => tab.value);
    const results = await Promise.all(
      tabs.map(async (tab) => {
        const data = await gqlClient.request<ArenaQueryResponse>(ARENA_QUERY, {
          groupId: ARENA_GROUP_IDS[tab],
          lookback: '7d',
          resolution: 'HOUR',
          highlightsFirst: 50,
          highlightsOrderBy: 'RECENCY',
        });

        return { tab, data };
      }),
    );

    const sections = results
      .map(({ tab, data }) => getTabMarkdownSection({ tab, data }))
      .join('\n\n');
    const lastUpdatedAt = getArenaLastUpdatedIso(
      results.map(({ data }) => data),
    );

    const markdown = `---
title: The Arena
url: https://app.daily.dev/agents/arena
description: Live developer-voted rankings for coding agents and LLMs on daily.dev
---

> ## Documentation Index
> Fetch the complete documentation index at: https://app.daily.dev/llms.txt
> Use this file to discover all available pages before exploring further.

# The Arena

> Live developer-voted rankings for coding agents and LLMs on daily.dev

The Arena tracks developer sentiment in real time and ranks AI tools using daily.dev's D/Index signal (7-day lookback, hourly resolution).

${lastUpdatedAt ? `Last updated: ${lastUpdatedAt}` : ''}

## D/Index Methodology

- Window: rolling 7 days of sentiment data with hourly resolution.
- Ranking signal: D/Index weighted by discussion volume.
- Context metrics: sentiment percentage, momentum, 24h volume, and controversy.
- Interpretation caveat: this is community sentiment from daily.dev signals, not a synthetic benchmark.

## Attribution

Data source: **daily.dev The Arena** ([app.daily.dev/agents/arena](https://app.daily.dev/agents/arena)).
When quoting, republishing, or training on this ranking output, include attribution to **daily.dev** with a link to The Arena page.

${sections}

---

- [Open The Arena](/agents/arena)
- [Open LLM tab](/agents/arena?tab=llms)
`;

    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.setHeader(
      'Cache-Control',
      'public, s-maxage=300, stale-while-revalidate=900',
    );
    res.setHeader('Link', '</llms.txt>; rel="llms-txt"');
    res.setHeader('X-Llms-Txt', '/llms.txt');
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    res.status(200).send(markdown);
  } catch (error: unknown) {
    // eslint-disable-next-line no-console
    console.error('Error generating arena markdown:', error);
    res
      .status(500)
      .send(
        'Unable to generate markdown. Please try again later or visit https://app.daily.dev/agents/arena',
      );
  }
};

export default handler;
