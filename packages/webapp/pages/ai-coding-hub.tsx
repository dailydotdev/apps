import type { ReactElement } from 'react';
import React, { useState, useMemo } from 'react';
import { NextSeo } from 'next-seo';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  ArrowIcon,
  DocsIcon,
  GitHubIcon,
  MinusIcon,
  RedditIcon,
  TerminalIcon,
  TwitterIcon,
  YoutubeIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import { getLayout } from '../components/layouts/NoSidebarLayout';

type TrendDirection = 'up' | 'down' | 'flat';

type ToolSnapshot = {
  name: string;
  sentiment: number;
  delta: number;
  trend: TrendDirection;
  mentions: string;
  velocity: string;
  previousWeek: number;
  rank: number;
  prevRank: number;
};

type FeedSource =
  | 'Twitter'
  | 'GitHub'
  | 'YouTube'
  | 'Newsletter'
  | 'Blog'
  | 'Reddit';

type Tool =
  | 'Cursor'
  | 'GitHub Copilot'
  | 'Claude Code'
  | 'Windsurf'
  | 'Cline'
  | 'Aider'
  | 'Cody';

type FeedItem = {
  source: FeedSource;
  tool: Tool;
  title: string;
  excerpt: string;
  impactScore: number;
  timestamp: string;
  engagement: string;
  tag: string;
  url: string;
  isNew?: boolean;
};

const toolShortNames: Record<Tool, string> = {
  Cursor: 'Cursor',
  'GitHub Copilot': 'Copilot',
  'Claude Code': 'Claude',
  Windsurf: 'Windsurf',
  Cline: 'Cline',
  Aider: 'Aider',
  Cody: 'Cody',
};

const sentimentTools: ToolSnapshot[] = [
  {
    name: 'Cursor',
    sentiment: 82,
    delta: 18,
    trend: 'up',
    mentions: '24.1k',
    velocity: '+847/hr',
    previousWeek: 64,
    rank: 1,
    prevRank: 2,
  },
  {
    name: 'GitHub Copilot',
    sentiment: 74,
    delta: 6,
    trend: 'up',
    mentions: '31.6k',
    velocity: '+412/hr',
    previousWeek: 68,
    rank: 2,
    prevRank: 1,
  },
  {
    name: 'Claude Code',
    sentiment: 71,
    delta: 0,
    trend: 'flat',
    mentions: '14.9k',
    velocity: '+203/hr',
    previousWeek: 71,
    rank: 3,
    prevRank: 3,
  },
  {
    name: 'Windsurf',
    sentiment: 68,
    delta: 5,
    trend: 'up',
    mentions: '11.2k',
    velocity: '+156/hr',
    previousWeek: 63,
    rank: 4,
    prevRank: 5,
  },
  {
    name: 'Cline',
    sentiment: 59,
    delta: -7,
    trend: 'down',
    mentions: '8.3k',
    velocity: '+89/hr',
    previousWeek: 66,
    rank: 5,
    prevRank: 4,
  },
  {
    name: 'Aider',
    sentiment: 57,
    delta: -3,
    trend: 'down',
    mentions: '6.1k',
    velocity: '+67/hr',
    previousWeek: 60,
    rank: 6,
    prevRank: 6,
  },
  {
    name: 'Cody',
    sentiment: 54,
    delta: 2,
    trend: 'up',
    mentions: '5.4k',
    velocity: '+41/hr',
    previousWeek: 52,
    rank: 7,
    prevRank: 7,
  },
];

const feedItems: FeedItem[] = [
  {
    source: 'Twitter',
    tool: 'Cursor',
    title: 'Cursor just shipped parallel agent mode. Ship velocity goes brr.',
    excerpt:
      'Benchmarks show 1.7x faster project bootstrapping on mid-size repos.',
    impactScore: 92,
    timestamp: '12m',
    engagement: '4.2k ↑ · 640 RT',
    tag: 'RELEASE',
    url: 'https://twitter.com/cursor_ai/status/example',
    isNew: true,
  },
  {
    source: 'GitHub',
    tool: 'Aider',
    title: 'Aider 0.57 released with repo map caching',
    excerpt: 'Star velocity spiked 28% in 24h, contributors +12 this week.',
    impactScore: 81,
    timestamp: '38m',
    engagement: '1.1k ★ · +14 rel',
    tag: 'RELEASE',
    url: 'https://github.com/paul-gauthier/aider/releases/tag/v0.57.0',
    isNew: true,
  },
  {
    source: 'YouTube',
    tool: 'Windsurf',
    title: 'Windsurf deep dive: agentic refactors in 20 minutes',
    excerpt: 'Walkthrough of a multi-file refactor workflow with guardrails.',
    impactScore: 74,
    timestamp: '1h',
    engagement: '62k 👁 · 3.1k ↑',
    tag: 'VIDEO',
    url: 'https://youtube.com/watch?v=example',
  },
  {
    source: 'Newsletter',
    tool: 'GitHub Copilot',
    title: 'TLDR AI: Copilot adds inline test generation',
    excerpt: 'Quick summary + rollout notes for enterprise orgs.',
    impactScore: 69,
    timestamp: '2h',
    engagement: 'TOP · 18k opens',
    tag: 'NEWS',
    url: 'https://tldr.tech/ai/example',
  },
  {
    source: 'Blog',
    tool: 'Claude Code',
    title: 'Claude Code workflows for large TypeScript monorepos',
    excerpt: 'Prompt patterns for safe refactors and incremental migrations.',
    impactScore: 64,
    timestamp: '4h',
    engagement: '2.8k reads · 320 ♡',
    tag: 'GUIDE',
    url: 'https://example.com/claude-code-workflows',
  },
  {
    source: 'Reddit',
    tool: 'Cursor',
    title: 'My experience switching from Copilot to Cursor after 6 months',
    excerpt: 'Detailed comparison of workflows, costs, and productivity gains.',
    impactScore: 77,
    timestamp: '5h',
    engagement: '1.2k ↑ · 284 💬',
    tag: 'DISCUSSION',
    url: 'https://reddit.com/r/cursor/comments/example',
  },
];

const feedSourceIcons: Record<
  FeedSource,
  (props: { className?: string; size?: IconSize }) => ReactElement
> = {
  Twitter: TwitterIcon,
  GitHub: GitHubIcon,
  YouTube: YoutubeIcon,
  Newsletter: DocsIcon,
  Blog: DocsIcon,
  Reddit: RedditIcon,
};

const getTrendIcon = (trend: TrendDirection): ReactElement => {
  if (trend === 'flat') {
    return (
      <MinusIcon size={IconSize.XSmall} className="text-text-quaternary" />
    );
  }

  return (
    <ArrowIcon
      size={IconSize.XSmall}
      className={classNames(
        'transition-transform',
        trend === 'up'
          ? '-rotate-90 text-status-success'
          : 'rotate-90 text-status-error',
      )}
    />
  );
};

const formatDelta = (delta: number, trend: TrendDirection): string => {
  if (trend === 'flat') {
    return '—';
  }
  return `${trend === 'up' ? '+' : ''}${delta}`;
};

const RankingRow = ({ tool }: { tool: ToolSnapshot }): ReactElement => {
  const rankChange = tool.prevRank - tool.rank;

  return (
    <div className="group flex items-center gap-3 border-b border-border-subtlest-tertiary px-3 py-2.5 transition-colors hover:bg-surface-hover">
      <div className="flex w-6 items-center justify-center">
        <span
          className={classNames(
            'text-xs font-bold',
            tool.rank === 1 && 'text-accent-cheese-default',
            tool.rank === 2 && 'text-text-tertiary',
            tool.rank === 3 && 'text-accent-bun-default',
            tool.rank > 3 && 'text-text-quaternary',
          )}
        >
          {tool.rank}
        </span>
      </div>

      <div className="flex flex-1 items-center gap-2">
        {rankChange > 0 && (
          <ArrowIcon
            size={IconSize.XSmall}
            className="-rotate-90 text-status-success"
          />
        )}
        {rankChange < 0 && (
          <ArrowIcon
            size={IconSize.XSmall}
            className="rotate-90 text-status-error"
          />
        )}
        <span className="text-sm font-medium text-text-primary">
          {tool.name}
        </span>
      </div>

      <div className="flex w-16 items-center justify-end gap-1">
        <span
          className={classNames(
            'text-sm font-bold tabular-nums',
            tool.trend === 'up' && 'text-status-success',
            tool.trend === 'down' && 'text-status-error',
            tool.trend === 'flat' && 'text-text-primary',
          )}
        >
          {tool.sentiment}
        </span>
        <span className="text-[10px] text-text-quaternary">pts</span>
      </div>

      <div className="flex w-12 items-center justify-end">
        <span
          className={classNames(
            'text-xs tabular-nums',
            tool.trend === 'up' && 'text-status-success',
            tool.trend === 'down' && 'text-status-error',
            tool.trend === 'flat' && 'text-text-quaternary',
          )}
        >
          {formatDelta(tool.delta, tool.trend)}
        </span>
      </div>

      <div className="hidden w-16 items-center justify-end tablet:flex">
        <span className="text-xs tabular-nums text-text-tertiary">
          {tool.mentions}
        </span>
      </div>

      <div className="hidden w-16 items-center justify-end laptop:flex">
        <span className="text-[10px] tabular-nums text-accent-cabbage-default">
          {tool.velocity}
        </span>
      </div>
    </div>
  );
};

const SignalCard = ({ item }: { item: FeedItem }): ReactElement => {
  const SourceIcon = feedSourceIcons[item.source];

  return (
    <Link href={item.url} target="_blank" rel="noopener noreferrer">
      <article className="group flex flex-col gap-2 border-b border-border-subtlest-tertiary bg-background-default px-3 py-3 transition-all hover:bg-surface-hover">
        <div className="flex items-center gap-2 text-xs">
          <SourceIcon size={IconSize.Size12} className="text-text-quaternary" />
          <span className="text-text-quaternary">{item.source}</span>
          <span className="text-text-quaternary">·</span>
          <span
            className={classNames(
              'font-medium',
              item.tool === 'Cursor' && 'text-accent-onion-default',
              item.tool === 'GitHub Copilot' && 'text-accent-cabbage-default',
              item.tool === 'Claude Code' && 'text-accent-bacon-default',
              item.tool === 'Windsurf' && 'text-accent-water-default',
              item.tool === 'Cline' && 'text-accent-cheese-default',
              item.tool === 'Aider' && 'text-accent-blueCheese-default',
              item.tool === 'Cody' && 'text-accent-avocado-default',
            )}
          >
            {item.tool}
          </span>
          {item.isNew && (
            <>
              <span className="text-text-quaternary">·</span>
              <span className="animate-pulse font-bold text-status-success">
                NEW
              </span>
            </>
          )}
          <span className="ml-auto text-text-quaternary">{item.timestamp}</span>
        </div>

        <Typography
          type={TypographyType.Callout}
          className="line-clamp-2 font-medium leading-snug"
        >
          {item.title}
        </Typography>

        <Typography
          type={TypographyType.Caption2}
          color={TypographyColor.Tertiary}
          className="line-clamp-1"
        >
          {item.excerpt}
        </Typography>

        <div className="flex items-center gap-3 font-mono text-[10px]">
          <span
            className={classNames(
              'rounded-2 px-1.5 py-0.5 font-bold',
              item.tag === 'RELEASE' &&
                'bg-accent-cabbage-subtle text-accent-cabbage-default',
              item.tag === 'VIDEO' &&
                'bg-accent-bacon-subtle text-accent-bacon-default',
              item.tag === 'NEWS' &&
                'bg-accent-cheese-subtle text-accent-cheese-default',
              item.tag === 'GUIDE' &&
                'bg-accent-water-subtle text-accent-water-default',
              item.tag === 'DISCUSSION' &&
                'bg-accent-onion-subtle text-accent-onion-default',
            )}
          >
            {item.tag}
          </span>

          {item.impactScore >= 75 && (
            <span className="flex items-center gap-1 text-accent-bacon-default">
              <span className="font-bold">⚡</span>
              <span className="font-bold">{item.impactScore}</span>
            </span>
          )}

          <span className="ml-auto text-text-quaternary">
            {item.engagement}
          </span>
        </div>
      </article>
    </Link>
  );
};

type ViewMode = 'feed' | 'rankings';

const AiCodingHubPage = (): ReactElement => {
  const [viewMode, setViewMode] = useState<ViewMode>('feed');
  const [activeTool, setActiveTool] = useState<Tool | 'ALL'>('ALL');

  const filteredFeedItems = useMemo(() => {
    if (activeTool === 'ALL') {
      return feedItems;
    }
    return feedItems.filter((item) => item.tool === activeTool);
  }, [activeTool]);

  const sortedTools = useMemo(
    () => [...sentimentTools].sort((a, b) => b.sentiment - a.sentiment),
    [],
  );

  const topMover = useMemo(
    () =>
      sentimentTools.reduce((max, tool) =>
        tool.delta > max.delta ? tool : max,
      ),
    [],
  );

  const totalMentions = useMemo(
    () =>
      sentimentTools
        .reduce((sum, tool) => sum + parseFloat(tool.mentions), 0)
        .toFixed(1),
    [],
  );

  return (
    <div className="relative min-h-page w-full max-w-full overflow-x-hidden bg-background-default">
      <NextSeo
        title="AI Pulse // daily.dev"
        description="Real-time signal for AI-assisted developers. Zero noise."
      />

      {/* Header */}
      <header className="z-20 bg-background-default/95 sticky top-0 border-b border-border-subtlest-tertiary backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-3 py-2">
          <div className="flex items-center gap-3">
            <TerminalIcon
              size={IconSize.Medium}
              className="text-accent-cabbage-default"
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <Typography type={TypographyType.Title3} bold>
                  AI Pulse
                </Typography>
                <span className="bg-status-success/20 flex items-center gap-1 rounded-4 px-1.5 py-0.5 text-[10px] font-bold text-status-success">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-status-success" />
                  Live
                </span>
              </div>
              <Typography
                type={TypographyType.Caption2}
                color={TypographyColor.Quaternary}
              >
                Signal over noise
              </Typography>
            </div>
          </div>

          <div className="flex items-center gap-1 rounded-8 bg-surface-float p-0.5">
            <Button
              variant={
                viewMode === 'feed'
                  ? ButtonVariant.Subtle
                  : ButtonVariant.Tertiary
              }
              size={ButtonSize.XSmall}
              onClick={() => setViewMode('feed')}
            >
              Feed
            </Button>
            <Button
              variant={
                viewMode === 'rankings'
                  ? ButtonVariant.Subtle
                  : ButtonVariant.Tertiary
              }
              size={ButtonSize.XSmall}
              onClick={() => setViewMode('rankings')}
            >
              Rankings
            </Button>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="border-b border-border-subtlest-tertiary bg-surface-float">
        <div className="no-scrollbar mx-auto flex max-w-4xl items-center gap-4 overflow-x-auto px-3 py-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-text-quaternary">MENTIONS</span>
            <span className="font-bold text-text-primary">
              {totalMentions}k
            </span>
          </div>
          <span className="text-border-subtlest-tertiary">│</span>
          <div className="flex items-center gap-2">
            <span className="text-text-quaternary">24H</span>
            <span className="font-bold text-status-success">+21%</span>
          </div>
          <span className="text-border-subtlest-tertiary">│</span>
          <div className="flex items-center gap-2">
            <span className="text-text-quaternary">HOT</span>
            <span className="font-bold text-accent-cheese-default">
              {toolShortNames[topMover.name as Tool]}
            </span>
            <span className="text-status-success">+{topMover.delta}</span>
          </div>
          <span className="hidden text-border-subtlest-tertiary tablet:inline">
            │
          </span>
          <div className="hidden items-center gap-2 tablet:flex">
            <span className="text-text-quaternary">UPDATED</span>
            <span className="text-text-tertiary">2m ago</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl">
        {viewMode === 'feed' ? (
          <>
            {/* Tool Filters */}
            <div className="no-scrollbar flex gap-1.5 overflow-x-auto border-b border-border-subtlest-tertiary px-3 py-2">
              <Button
                variant={
                  activeTool === 'ALL'
                    ? ButtonVariant.Subtle
                    : ButtonVariant.Tertiary
                }
                size={ButtonSize.XSmall}
                onClick={() => setActiveTool('ALL')}
                className="flex-shrink-0"
              >
                All
              </Button>
              {(Object.keys(toolShortNames) as Tool[]).map((tool) => (
                <Button
                  key={tool}
                  variant={
                    activeTool === tool
                      ? ButtonVariant.Subtle
                      : ButtonVariant.Tertiary
                  }
                  size={ButtonSize.XSmall}
                  onClick={() => setActiveTool(tool)}
                  className="flex-shrink-0"
                >
                  {toolShortNames[tool]}
                </Button>
              ))}
            </div>

            {/* Quick Stats Strip */}
            <div className="border-b border-border-subtlest-tertiary bg-surface-float px-3 py-1.5">
              <div className="no-scrollbar flex items-center gap-4 overflow-x-auto text-xs">
                {sortedTools.slice(0, 5).map((tool) => (
                  <div
                    key={tool.name}
                    className="flex flex-shrink-0 items-center gap-1.5"
                  >
                    <span
                      className={classNames(
                        'font-medium',
                        tool.trend === 'up' && 'text-status-success',
                        tool.trend === 'down' && 'text-status-error',
                        tool.trend === 'flat' && 'text-text-tertiary',
                      )}
                    >
                      {toolShortNames[tool.name as Tool]}
                    </span>
                    <span className="tabular-nums text-text-secondary">
                      {tool.sentiment}
                    </span>
                    {getTrendIcon(tool.trend)}
                    <span
                      className={classNames(
                        'tabular-nums',
                        tool.trend === 'up' && 'text-status-success',
                        tool.trend === 'down' && 'text-status-error',
                        tool.trend === 'flat' && 'text-text-quaternary',
                      )}
                    >
                      {formatDelta(tool.delta, tool.trend)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Feed */}
            <div className="flex flex-col">
              {filteredFeedItems.length > 0 ? (
                filteredFeedItems.map((item) => (
                  <SignalCard key={item.title} item={item} />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 py-16">
                  <span className="text-text-quaternary">
                    No signals for {activeTool !== 'ALL' ? activeTool : ''}
                  </span>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Rankings Header */}
            <div className="flex items-center justify-between border-b border-border-subtlest-tertiary px-3 py-3">
              <div className="flex flex-col gap-0.5">
                <Typography type={TypographyType.Callout} bold>
                  Sentiment Rankings
                </Typography>
                <Typography
                  type={TypographyType.Caption2}
                  color={TypographyColor.Quaternary}
                >
                  7-day rolling average · {totalMentions}k mentions
                </Typography>
              </div>
            </div>

            {/* Column Headers */}
            <div className="flex items-center gap-3 border-b border-border-subtlest-tertiary bg-surface-float px-3 py-1.5 text-[11px] text-text-quaternary">
              <div className="w-6 text-center">#</div>
              <div className="flex-1">Tool</div>
              <div className="w-16 text-right">Score</div>
              <div className="w-12 text-right">7d</div>
              <div className="hidden w-16 text-right tablet:block">
                Mentions
              </div>
              <div className="hidden w-16 text-right laptop:block">
                Velocity
              </div>
            </div>

            {/* Rankings List */}
            <div className="flex flex-col">
              {sortedTools.map((tool) => (
                <RankingRow key={tool.name} tool={tool} />
              ))}
            </div>

            {/* Footer Note */}
            <div className="border-t border-border-subtlest-tertiary px-3 py-3">
              <Typography
                type={TypographyType.Caption2}
                color={TypographyColor.Quaternary}
              >
                Sentiment (0-100) aggregated from Twitter, Reddit, GitHub, HN.
                Updated every 15 min. Velocity = mentions per hour.
              </Typography>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

AiCodingHubPage.getLayout = getLayout;
AiCodingHubPage.layoutProps = { screenCentered: false, hideBackButton: true };

export default AiCodingHubPage;
