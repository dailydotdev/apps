import type { ReactElement } from 'react';
import React from 'react';
import { ArenaRankings } from '@dailydotdev/shared/src/features/agents/arena/ArenaRankings';
import type { RankedTool } from '@dailydotdev/shared/src/features/agents/arena/types';
import Link from '@dailydotdev/shared/src/components/utilities/Link';

const LiveIndicator = (): ReactElement => (
  <div className="flex items-center gap-1.5">
    <span className="inline-block h-2 w-2 animate-scale-down-pulse rounded-full bg-accent-avocado-default shadow-[0_0_6px_var(--theme-accent-avocado-default)]" />
    <span className="text-accent-avocado-default typo-caption2">Live</span>
  </div>
);

interface AgentsLeaderboardSectionProps {
  tools: RankedTool[];
  loading: boolean;
}

export const AgentsLeaderboardSection = ({
  tools,
  loading,
}: AgentsLeaderboardSectionProps): ReactElement => (
  <section className="w-full">
    <div className="mb-1.5 flex items-center gap-2 px-3 laptop:px-4">
      <h2 className="font-bold text-text-primary typo-callout">Leaderboard</h2>
      <div className="ml-auto flex items-center gap-2">
        <LiveIndicator />
        <Link href="/agents/arena">
          <a className="text-text-link typo-caption1">View all</a>
        </Link>
      </div>
    </div>
    <ArenaRankings
      tools={tools}
      tab="coding-agents"
      loading={loading}
      compact
    />
  </section>
);
