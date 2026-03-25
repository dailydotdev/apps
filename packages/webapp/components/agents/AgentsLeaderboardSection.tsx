import type { ReactElement } from 'react';
import React from 'react';
import { ArenaRankings } from '@dailydotdev/shared/src/features/agents/arena/ArenaRankings';
import { ArenaHighlightsFeed } from '@dailydotdev/shared/src/features/agents/arena/ArenaHighlightsFeed';
import type {
  ArenaTab,
  RankedTool,
  SentimentHighlightItem,
} from '@dailydotdev/shared/src/features/agents/arena/types';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import {
  Button,
  ButtonGroup,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';

const LiveIndicator = (): ReactElement => (
  <span className="flex items-center gap-1.5">
    <span className="inline-block h-2 w-2 animate-scale-down-pulse rounded-full bg-accent-avocado-default shadow-[0_0_6px_var(--theme-accent-avocado-default)]" />
    <span className="text-accent-avocado-default typo-caption2">Live</span>
  </span>
);

interface AgentsLeaderboardSectionProps {
  tools: RankedTool[];
  loading: boolean;
  tab: ArenaTab;
  onTabChange?: (tab: ArenaTab) => void;
  compact?: boolean;
  highlightsItems?: SentimentHighlightItem[];
}

export const AgentsLeaderboardSection = ({
  tools,
  loading,
  tab,
  onTabChange,
  compact = true,
  highlightsItems = [],
}: AgentsLeaderboardSectionProps): ReactElement => (
  <section className="w-full pt-4">
    {compact ? (
      <header className="mb-1.5 flex items-center gap-2 px-3 laptop:px-4">
        <h2 className="font-bold text-text-primary typo-title3">Arena</h2>
        <div className="ml-auto flex items-center gap-2">
          <LiveIndicator />
          <Link
            href={
              tab === 'coding-agents'
                ? '/agents/arena'
                : '/agents/arena?tab=llms'
            }
          >
            <a className="text-text-link typo-caption1">View all</a>
          </Link>
        </div>
      </header>
    ) : (
      <header className="mb-2">
        <div className="flex flex-col gap-3 laptop:flex-row laptop:items-start">
          <div className="flex flex-col">
            <h2 className="font-bold text-text-primary typo-title3">
              The Arena
            </h2>
            <p className="text-text-tertiary typo-footnote">
              Where AI tools fight for developer love
            </p>
          </div>
          {!!onTabChange && (
            <div className="laptop:ml-auto">
              <ButtonGroup>
                <Button
                  type="button"
                  variant={
                    tab === 'llms' ? ButtonVariant.Float : ButtonVariant.Tertiary
                  }
                  size={ButtonSize.Small}
                  onClick={() => onTabChange('llms')}
                >
                  LLMs
                </Button>
                <Button
                  type="button"
                  variant={
                    tab === 'coding-agents'
                      ? ButtonVariant.Float
                      : ButtonVariant.Tertiary
                  }
                  size={ButtonSize.Small}
                  onClick={() => onTabChange('coding-agents')}
                >
                  Agents
                </Button>
              </ButtonGroup>
            </div>
          )}
        </div>
      </header>
    )}
    {compact ? (
      <ArenaRankings
        tools={tools}
        tab={tab}
        origin="hub"
        loading={loading}
        compact={compact}
      />
    ) : (
      <div className="flex flex-col gap-4 laptop:grid laptop:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] laptop:gap-x-8">
        <section className="min-w-0">
          <ArenaRankings
            tools={tools}
            tab={tab}
            origin="hub"
            loading={loading}
            compact={compact}
          />
        </section>
        <aside className="relative laptop:w-full">
          <div className="laptop:absolute laptop:inset-0">
            <ArenaHighlightsFeed
              key={tab}
              items={highlightsItems}
              tab={tab}
              loading={loading}
            />
          </div>
        </aside>
      </div>
    )}
  </section>
);
