import type { ReactElement } from 'react';
import React from 'react';
import { NextSeo } from 'next-seo';
import classNames from 'classnames';
import {
  Button,
  ButtonGroup,
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  ArrowIcon,
  CopyIcon,
  DocsIcon,
  DownvoteIcon,
  FlagIcon,
  GitHubIcon,
  HotIcon,
  MinusIcon,
  SparkleIcon,
  TLDRIcon,
  TrendingIcon,
  TwitterIcon,
  UpvoteIcon,
  YoutubeIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { getLayout } from '../components/layouts/NoSidebarLayout';

type TrendDirection = 'up' | 'down' | 'flat';

type ToolSnapshot = {
  name: string;
  sentiment: number;
  delta: number;
  trend: TrendDirection;
  mentions: string;
  momentum?: string;
};

type SentimentPoint = {
  label: string;
  score: number;
};

type FeedSource = 'Twitter' | 'GitHub' | 'YouTube' | 'Newsletter' | 'Blog';

type FeedItem = {
  source: FeedSource;
  title: string;
  excerpt: string;
  timestamp: string;
  engagement: string;
  tag: string;
};

type PromptItem = {
  tool: string;
  category: string;
  title: string;
  author: string;
  timestamp: string;
  votes: number;
  preview: string;
};

type DataSourceStatus = {
  name: string;
  status: 'live' | 'delayed' | 'down';
  detail: string;
};

const sentimentTools: ToolSnapshot[] = [
  {
    name: 'Cursor',
    sentiment: 82,
    delta: 18,
    trend: 'up',
    mentions: '24.1k',
    momentum: 'Hot right now',
  },
  {
    name: 'GitHub Copilot',
    sentiment: 74,
    delta: 6,
    trend: 'up',
    mentions: '31.6k',
  },
  {
    name: 'Claude Code',
    sentiment: 71,
    delta: 0,
    trend: 'flat',
    mentions: '14.9k',
  },
  {
    name: 'Windsurf',
    sentiment: 68,
    delta: 5,
    trend: 'up',
    mentions: '11.2k',
  },
  {
    name: 'Cline',
    sentiment: 59,
    delta: -7,
    trend: 'down',
    mentions: '8.3k',
  },
  {
    name: 'Aider',
    sentiment: 57,
    delta: -3,
    trend: 'down',
    mentions: '6.1k',
  },
  {
    name: 'Cody',
    sentiment: 54,
    delta: 2,
    trend: 'up',
    mentions: '5.4k',
  },
];

const sentimentSeries: SentimentPoint[] = [
  { label: 'Tue', score: 54 },
  { label: 'Wed', score: 58 },
  { label: 'Thu', score: 62 },
  { label: 'Fri', score: 64 },
  { label: 'Sat', score: 61 },
  { label: 'Sun', score: 67 },
  { label: 'Mon', score: 73 },
];

const toolSentimentSeries = [
  {
    name: 'Cursor',
    strokeClass: 'stroke-accent-cabbage-default',
    fillClass: 'fill-accent-cabbage-default',
    dotClass: 'bg-accent-cabbage-default',
    values: [56, 60, 66, 70, 68, 74, 82],
  },
  {
    name: 'Copilot',
    strokeClass: 'stroke-accent-water-default',
    fillClass: 'fill-accent-water-default',
    dotClass: 'bg-accent-water-default',
    values: [60, 62, 65, 68, 67, 70, 74],
  },
  {
    name: 'Claude Code',
    strokeClass: 'stroke-accent-cheese-default',
    fillClass: 'fill-accent-cheese-default',
    dotClass: 'bg-accent-cheese-default',
    values: [58, 57, 60, 62, 61, 66, 71],
  },
  {
    name: 'Windsurf',
    strokeClass: 'stroke-accent-bacon-default',
    fillClass: 'fill-accent-bacon-default',
    dotClass: 'bg-accent-bacon-default',
    values: [52, 55, 58, 63, 62, 65, 68],
  },
];

const hotShifts = [
  {
    tool: 'Cursor',
    note: '+18% sentiment week-over-week',
  },
  {
    tool: 'Windsurf',
    note: 'New release drove +2.4k mentions',
  },
  {
    tool: 'Copilot',
    note: 'Stable momentum, high volume',
  },
];

const feedItems: FeedItem[] = [
  {
    source: 'Twitter',
    title: 'Cursor just shipped parallel agent mode. Ship velocity goes brr.',
    excerpt:
      'Benchmarks show 1.7x faster project bootstrapping on mid-size repos.',
    timestamp: '12m ago',
    engagement: '4.2k likes · 640 reposts',
    tag: 'Release',
  },
  {
    source: 'GitHub',
    title: 'Aider 0.57 released with repo map caching',
    excerpt: 'Star velocity spiked 28% in 24h, contributors +12 this week.',
    timestamp: '38m ago',
    engagement: '1.1k stars · 14 releases',
    tag: 'GitHub',
  },
  {
    source: 'YouTube',
    title: 'Windsurf deep dive: agentic refactors in 20 minutes',
    excerpt: 'Walkthrough of a multi-file refactor workflow with guardrails.',
    timestamp: '1h ago',
    engagement: '62k views · 3.1k likes',
    tag: 'Video',
  },
  {
    source: 'Newsletter',
    title: 'TLDR AI: Copilot adds inline test generation',
    excerpt: 'Quick summary + rollout notes for enterprise orgs.',
    timestamp: '2h ago',
    engagement: 'Top story · 18k opens',
    tag: 'Newsletter',
  },
  {
    source: 'Blog',
    title: 'Claude Code workflows for large TypeScript monorepos',
    excerpt: 'Prompt patterns for safe refactors and incremental migrations.',
    timestamp: '4h ago',
    engagement: '2.8k reads · 320 saves',
    tag: 'Guide',
  },
];

const promptItems: PromptItem[] = [
  {
    tool: 'Cursor',
    category: 'Feature Development',
    title: 'Build a new feature with guardrails + checkpoints',
    author: 'sierra.codes',
    timestamp: '26m ago',
    votes: 214,
    preview:
      'You are my pair. Before writing code, outline a 3-step plan and ask me to confirm. Then implement step 1 only, run tests, and pause for review.',
  },
  {
    tool: 'Claude Code',
    category: 'Refactoring',
    title: 'Safely migrate a legacy module without breaking tests',
    author: 'matthew.r',
    timestamp: '2h ago',
    votes: 168,
    preview:
      'Scan the module for implicit contracts, list them, and propose a refactor sequence. Keep behavior identical; show diffs for each step.',
  },
  {
    tool: 'Copilot',
    category: 'Testing',
    title: 'Generate edge-case tests from production logs',
    author: 'leah.dev',
    timestamp: '5h ago',
    votes: 121,
    preview:
      'Here are anonymized log lines. Derive the input shapes, then write Jest tests that target the failure modes only.',
  },
  {
    tool: 'Windsurf',
    category: 'Debugging',
    title: 'Root-cause a flaky build with a reproduction plan',
    author: 'kenji',
    timestamp: '8h ago',
    votes: 92,
    preview:
      'Summarize likely causes, rank by probability, then suggest minimal repro steps. Ask before applying any fixes.',
  },
];

const dataSources: DataSourceStatus[] = [
  {
    name: 'Twitter/X',
    status: 'live',
    detail: 'Updated 14 minutes ago',
  },
  {
    name: 'GitHub',
    status: 'delayed',
    detail: 'Release API lagging ~2 hours',
  },
  {
    name: 'npm',
    status: 'live',
    detail: 'Updated 9 minutes ago',
  },
  {
    name: 'Reddit',
    status: 'down',
    detail: 'r/cursor feed unavailable (showing cached)',
  },
];

const trendStyles: Record<
  TrendDirection,
  { text: string; bar: string; label: string }
> = {
  up: {
    text: 'text-status-success',
    bar: 'bg-status-success',
    label: 'Rising',
  },
  down: {
    text: 'text-status-error',
    bar: 'bg-status-error',
    label: 'Cooling',
  },
  flat: {
    text: 'text-text-tertiary',
    bar: 'bg-border-subtlest-secondary',
    label: 'Stable',
  },
};

const feedSourceMeta: Record<
  FeedSource,
  { icon: (props: { className?: string; size?: IconSize }) => ReactElement }
> = {
  Twitter: { icon: TwitterIcon },
  GitHub: { icon: GitHubIcon },
  YouTube: { icon: YoutubeIcon },
  Newsletter: { icon: TLDRIcon },
  Blog: { icon: DocsIcon },
};

const getTrendLabel = (trend: TrendDirection, delta: number): string => {
  if (trend === 'flat') {
    return '±0%';
  }

  const sign = trend === 'up' ? '+' : '-';
  return `${sign}${Math.abs(delta)}%`;
};

const chartWidth = 560;
const chartHeight = 180;
const chartPadding = 16;

const getSeriesRange = (series: typeof toolSentimentSeries) => {
  const allValues = series.flatMap((item) => item.values);
  const min = Math.min(...allValues);
  const max = Math.max(...allValues);

  return { min, max: Math.max(max, min + 1) };
};

const getChartX = (index: number, total: number): number => {
  if (total <= 1) {
    return chartPadding;
  }

  const step = (chartWidth - chartPadding * 2) / (total - 1);
  return chartPadding + index * step;
};

const getChartY = (value: number, min: number, max: number): number => {
  const range = max - min;
  const normalized = range === 0 ? 0.5 : (value - min) / range;

  return (
    chartHeight - chartPadding - normalized * (chartHeight - chartPadding * 2)
  );
};

const buildLinePath = (values: number[], min: number, max: number): string => {
  return values
    .map((value, index) => {
      const x = getChartX(index, values.length);
      const y = getChartY(value, min, max);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');
};

const getTrendIcon = (trend: TrendDirection): ReactElement => {
  if (trend === 'flat') {
    return <MinusIcon size={IconSize.Size16} />;
  }

  const rotation = trend === 'up' ? '-rotate-90' : 'rotate-90';

  return (
    <ArrowIcon
      size={IconSize.Size16}
      className={classNames('transition-transform', rotation)}
    />
  );
};

const AiCodingHubPage = (): ReactElement => {
  const { min: chartMin, max: chartMax } = getSeriesRange(toolSentimentSeries);

  return (
    <>
      <NextSeo
        title="AI Coding Hub | daily.dev"
        description="Signal, community pulse, and shared workflows for AI-assisted developers."
      />
      <div className="relative mx-4 mb-20 mt-8 min-h-page max-w-[78rem] tablet:mx-auto">
        <div className="flex flex-col gap-12">
          <section className="rounded-24 border border-border-subtlest-tertiary bg-surface-float p-6">
            <div className="grid gap-6 laptop:grid-cols-[1.2fr_0.8fr]">
              <div className="flex flex-col gap-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-8 bg-accent-cabbage-subtle px-2 py-1 text-text-primary typo-caption1">
                    Live pulse
                  </span>
                  <Typography
                    type={TypographyType.Caption1}
                    color={TypographyColor.Tertiary}
                  >
                    Updated every 15-30 minutes · Same for everyone
                  </Typography>
                </div>
                <Typography
                  tag={TypographyTag.H1}
                  type={TypographyType.Mega1}
                  bold
                >
                  AI Coding Hub
                </Typography>
                <Typography type={TypographyType.Title3}>
                  The daily.dev home for AI coding assistants: sentiment
                  snapshots, curated signal, and real workflows from the
                  community.
                </Typography>
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant={ButtonVariant.Primary}
                    size={ButtonSize.Large}
                  >
                    Explore the feed
                  </Button>
                  <Button
                    variant={ButtonVariant.Secondary}
                    size={ButtonSize.Large}
                  >
                    Submit a prompt
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-4 rounded-20 border border-border-subtlest-tertiary bg-background-default p-5">
                <div className="flex items-center gap-2">
                  <TrendingIcon size={IconSize.Small} />
                  <Typography type={TypographyType.Title4} bold>
                    Live Signal Snapshot
                  </Typography>
                </div>
                <div className="grid gap-3">
                  <div className="flex items-center justify-between">
                    <Typography color={TypographyColor.Tertiary}>
                      Mentions today
                    </Typography>
                    <Typography type={TypographyType.Title4} bold>
                      112k
                    </Typography>
                  </div>
                  <div className="flex items-center justify-between">
                    <Typography color={TypographyColor.Tertiary}>
                      Velocity change
                    </Typography>
                    <Typography type={TypographyType.Title4} bold>
                      +21%
                    </Typography>
                  </div>
                  <div className="flex items-center justify-between">
                    <Typography color={TypographyColor.Tertiary}>
                      Hottest tool
                    </Typography>
                    <div className="flex items-center gap-2">
                      <HotIcon size={IconSize.Size16} />
                      <Typography type={TypographyType.Title4} bold>
                        Cursor
                      </Typography>
                    </div>
                  </div>
                </div>
                <div className="rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4">
                  <div className="flex items-center gap-2">
                    <SparkleIcon size={IconSize.Size16} />
                    <Typography type={TypographyType.Callout} bold>
                      What&apos;s hot right now
                    </Typography>
                  </div>
                  <div className="mt-3 flex flex-col gap-2">
                    {hotShifts.map((item) => (
                      <div
                        key={item.tool}
                        className="flex items-center justify-between"
                      >
                        <Typography>{item.tool}</Typography>
                        <Typography
                          type={TypographyType.Caption1}
                          color={TypographyColor.Tertiary}
                        >
                          {item.note}
                        </Typography>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 tablet:grid-cols-3">
              <div className="rounded-16 border border-border-subtlest-tertiary bg-background-default p-4">
                <Typography type={TypographyType.Title4} bold>
                  Signal
                </Typography>
                <Typography color={TypographyColor.Tertiary}>
                  Curated high-quality coverage from social, repos, and
                  releases.
                </Typography>
              </div>
              <div className="rounded-16 border border-border-subtlest-tertiary bg-background-default p-4">
                <Typography type={TypographyType.Title4} bold>
                  Community
                </Typography>
                <Typography color={TypographyColor.Tertiary}>
                  Real prompts, workflows, and shared benchmarks from peers.
                </Typography>
              </div>
              <div className="rounded-16 border border-border-subtlest-tertiary bg-background-default p-4">
                <Typography type={TypographyType.Title4} bold>
                  Speed
                </Typography>
                <Typography color={TypographyColor.Tertiary}>
                  Stay current without scrolling socials all day long.
                </Typography>
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-6">
            <div className="flex flex-col gap-2 laptop:flex-row laptop:items-end laptop:justify-between">
              <div className="flex flex-col gap-1">
                <Typography type={TypographyType.Title2} bold>
                  Live Sentiment Dashboard
                </Typography>
                <Typography color={TypographyColor.Tertiary}>
                  Updated Feb 3, 2026 at 2:45 PM · Global, non-personalized
                </Typography>
              </div>
              <ButtonGroup>
                <Button variant={ButtonVariant.Subtle} size={ButtonSize.Small}>
                  7d view
                </Button>
                <Button
                  variant={ButtonVariant.Tertiary}
                  size={ButtonSize.Small}
                >
                  30d view
                </Button>
              </ButtonGroup>
            </div>

            <div className="grid gap-6 laptop:grid-cols-[2fr_1fr]">
              <div className="rounded-20 border border-border-subtlest-tertiary bg-surface-float p-5">
                <div className="flex items-center justify-between">
                  <Typography type={TypographyType.Title4} bold>
                    Sentiment trend
                  </Typography>
                  <Typography color={TypographyColor.Tertiary}>
                    7-day composite
                  </Typography>
                </div>
                <div className="mt-6 flex flex-col gap-4">
                  <div className="rounded-16 border border-border-subtlest-tertiary bg-background-default p-4">
                    <svg
                      viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                      className="h-44 w-full"
                      role="img"
                      aria-label="Sentiment trends by tool"
                    >
                      {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                        const y =
                          chartPadding +
                          ratio * (chartHeight - chartPadding * 2);

                        return (
                          <line
                            key={ratio}
                            x1={chartPadding}
                            x2={chartWidth - chartPadding}
                            y1={y}
                            y2={y}
                            className="stroke-border-subtlest-tertiary"
                            strokeWidth="1"
                          />
                        );
                      })}

                      {toolSentimentSeries.map((tool) => (
                        <path
                          key={tool.name}
                          d={buildLinePath(tool.values, chartMin, chartMax)}
                          className={classNames(
                            'fill-none stroke-[3]',
                            tool.strokeClass,
                          )}
                        />
                      ))}

                      {toolSentimentSeries.map((tool) =>
                        tool.values.map((value, index) => {
                          const label = sentimentSeries[index]?.label ?? value;

                          return (
                            <circle
                              key={`${tool.name}-${label}`}
                              cx={getChartX(index, tool.values.length)}
                              cy={getChartY(value, chartMin, chartMax)}
                              r="3.5"
                              className={classNames(
                                'stroke-none',
                                tool.fillClass,
                              )}
                            />
                          );
                        }),
                      )}
                    </svg>
                  </div>

                  <div className="flex items-center justify-between">
                    {sentimentSeries.map((point) => (
                      <Typography
                        key={point.label}
                        type={TypographyType.Caption1}
                        color={TypographyColor.Tertiary}
                      >
                        {point.label}
                      </Typography>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {toolSentimentSeries.map((tool) => (
                      <div
                        key={tool.name}
                        className="flex items-center gap-2 rounded-10 border border-border-subtlest-tertiary bg-surface-float px-3 py-1"
                      >
                        <span
                          className={classNames(
                            'h-2 w-2 rounded-full',
                            tool.dotClass,
                          )}
                        />
                        <Typography type={TypographyType.Caption1} bold>
                          {tool.name}
                        </Typography>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-6 grid gap-3 rounded-16 border border-border-subtlest-tertiary bg-background-default p-4">
                  <Typography type={TypographyType.Callout} bold>
                    Data sources
                  </Typography>
                  <div className="grid gap-2">
                    {dataSources.map((source) => (
                      <div
                        key={source.name}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={classNames(
                              'h-2 w-2 rounded-full',
                              source.status === 'live' && 'bg-status-success',
                              source.status === 'delayed' &&
                                'bg-status-warning',
                              source.status === 'down' && 'bg-status-error',
                            )}
                          />
                          <Typography type={TypographyType.Callout}>
                            {source.name}
                          </Typography>
                        </div>
                        <Typography
                          type={TypographyType.Caption1}
                          color={TypographyColor.Tertiary}
                        >
                          {source.detail}
                        </Typography>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-20 border border-border-subtlest-tertiary bg-surface-float p-5">
                <div className="flex items-center gap-2">
                  <HotIcon size={IconSize.Small} />
                  <Typography type={TypographyType.Title4} bold>
                    Momentum shifts
                  </Typography>
                </div>
                <div className="mt-4 flex flex-col gap-3">
                  {hotShifts.map((shift) => (
                    <div
                      key={shift.tool}
                      className="rounded-14 border border-border-subtlest-tertiary bg-background-default p-3"
                    >
                      <Typography type={TypographyType.Callout} bold>
                        {shift.tool}
                      </Typography>
                      <Typography
                        type={TypographyType.Caption1}
                        color={TypographyColor.Tertiary}
                      >
                        {shift.note}
                      </Typography>
                    </div>
                  ))}
                  <div className="rounded-14 border border-border-subtlest-tertiary bg-background-default p-3">
                    <Typography type={TypographyType.Callout} bold>
                      Community pulse
                    </Typography>
                    <Typography
                      type={TypographyType.Caption1}
                      color={TypographyColor.Tertiary}
                    >
                      Prompt submissions +28% over 48 hours.
                    </Typography>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 tablet:grid-cols-2 laptop:grid-cols-3">
              {sentimentTools.map((tool) => {
                const trendStyle = trendStyles[tool.trend];

                return (
                  <div
                    key={tool.name}
                    className="flex flex-col gap-4 rounded-16 border border-border-subtlest-tertiary bg-background-default p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Typography type={TypographyType.Title4} bold>
                          {tool.name}
                        </Typography>
                        <Typography color={TypographyColor.Tertiary}>
                          {trendStyle.label}
                        </Typography>
                      </div>
                      <div
                        className={classNames(
                          'flex items-center gap-1 rounded-10 border px-2 py-1',
                          trendStyle.text,
                        )}
                      >
                        {getTrendIcon(tool.trend)}
                        <Typography type={TypographyType.Caption1} bold>
                          {getTrendLabel(tool.trend, tool.delta)}
                        </Typography>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Typography color={TypographyColor.Tertiary}>
                        Sentiment score
                      </Typography>
                      <Typography type={TypographyType.Title4} bold>
                        {tool.sentiment}
                      </Typography>
                    </div>
                    <div className="h-2 overflow-hidden rounded-14 bg-border-subtlest-tertiary">
                      <div
                        className={classNames(
                          'h-full rounded-12',
                          trendStyle.bar,
                        )}
                        style={{ width: `${tool.sentiment}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Typography type={TypographyType.Caption1}>
                        {tool.mentions} mentions
                      </Typography>
                      {tool.momentum && (
                        <span className="flex items-center gap-1 rounded-8 bg-accent-bacon-subtle px-2 py-1 text-text-primary typo-caption1">
                          <HotIcon size={IconSize.Size16} />
                          {tool.momentum}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="flex flex-col gap-6">
            <div className="flex flex-col gap-2 laptop:flex-row laptop:items-end laptop:justify-between">
              <div>
                <Typography type={TypographyType.Title2} bold>
                  Aggregated Content Feed
                </Typography>
                <Typography color={TypographyColor.Tertiary}>
                  The best AI coding content across social, releases, and media.
                </Typography>
              </div>
              <ButtonGroup>
                <Button variant={ButtonVariant.Subtle} size={ButtonSize.Small}>
                  All
                </Button>
                <Button
                  variant={ButtonVariant.Tertiary}
                  size={ButtonSize.Small}
                >
                  Releases
                </Button>
                <Button
                  variant={ButtonVariant.Tertiary}
                  size={ButtonSize.Small}
                >
                  Tutorials
                </Button>
                <Button
                  variant={ButtonVariant.Tertiary}
                  size={ButtonSize.Small}
                >
                  Opinions
                </Button>
              </ButtonGroup>
            </div>

            <div className="flex flex-col gap-4">
              {feedItems.map((item) => {
                const SourceIcon = feedSourceMeta[item.source].icon;

                return (
                  <div
                    key={item.title}
                    className="flex flex-col gap-4 rounded-16 border border-border-subtlest-tertiary bg-background-default p-4 laptop:flex-row"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-12 border border-border-subtlest-tertiary bg-surface-float">
                        <SourceIcon size={IconSize.Small} />
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-8 bg-accent-salt-subtle px-2 py-1 text-text-secondary typo-caption1">
                            {item.source}
                          </span>
                          <span className="rounded-8 bg-accent-burger-subtle px-2 py-1 text-text-secondary typo-caption1">
                            {item.tag}
                          </span>
                          <Typography
                            type={TypographyType.Caption1}
                            color={TypographyColor.Tertiary}
                          >
                            {item.timestamp}
                          </Typography>
                        </div>
                        <Typography type={TypographyType.Title4} bold>
                          {item.title}
                        </Typography>
                        <Typography color={TypographyColor.Tertiary}>
                          {item.excerpt}
                        </Typography>
                        <Typography
                          type={TypographyType.Caption1}
                          color={TypographyColor.Tertiary}
                        >
                          {item.engagement}
                        </Typography>
                      </div>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                      <Button
                        variant={ButtonVariant.Tertiary}
                        size={ButtonSize.Small}
                      >
                        Open
                      </Button>
                      <Button
                        variant={ButtonVariant.Subtle}
                        size={ButtonSize.Small}
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="flex flex-col gap-6">
            <div>
              <Typography type={TypographyType.Title2} bold>
                Community Prompts & Workflows
              </Typography>
              <Typography color={TypographyColor.Tertiary}>
                Upvote the prompts you use and contribute your own workflows.
              </Typography>
            </div>

            <div className="grid gap-6 laptop:grid-cols-[1.6fr_1fr]">
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Typography type={TypographyType.Callout} bold>
                    Sort by
                  </Typography>
                  <ButtonGroup>
                    <Button
                      variant={ButtonVariant.Subtle}
                      size={ButtonSize.Small}
                    >
                      Hot
                    </Button>
                    <Button
                      variant={ButtonVariant.Tertiary}
                      size={ButtonSize.Small}
                    >
                      Top
                    </Button>
                    <Button
                      variant={ButtonVariant.Tertiary}
                      size={ButtonSize.Small}
                    >
                      New
                    </Button>
                  </ButtonGroup>
                </div>

                {promptItems.map((prompt) => (
                  <div
                    key={prompt.title}
                    className="flex gap-4 rounded-16 border border-border-subtlest-tertiary bg-background-default p-4"
                  >
                    <div className="flex flex-col items-center gap-2 text-center">
                      <button
                        type="button"
                        className="flex h-8 w-8 items-center justify-center rounded-10 border border-border-subtlest-tertiary text-text-secondary"
                      >
                        <UpvoteIcon size={IconSize.Size16} />
                      </button>
                      <Typography type={TypographyType.Caption1} bold>
                        {prompt.votes}
                      </Typography>
                      <button
                        type="button"
                        className="flex h-8 w-8 items-center justify-center rounded-10 border border-border-subtlest-tertiary text-text-secondary"
                      >
                        <DownvoteIcon size={IconSize.Size16} />
                      </button>
                    </div>
                    <div className="flex flex-1 flex-col gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-8 bg-accent-cabbage-subtle px-2 py-1 text-text-primary typo-caption1">
                          {prompt.tool}
                        </span>
                        <span className="rounded-8 bg-accent-water-subtle px-2 py-1 text-text-primary typo-caption1">
                          {prompt.category}
                        </span>
                        <Typography
                          type={TypographyType.Caption1}
                          color={TypographyColor.Tertiary}
                        >
                          {prompt.timestamp} · @{prompt.author}
                        </Typography>
                      </div>
                      <Typography type={TypographyType.Title4} bold>
                        {prompt.title}
                      </Typography>
                      <div className="rounded-12 border border-border-subtlest-tertiary bg-surface-float p-3">
                        <Typography
                          tag={TypographyTag.P}
                          className="font-mono text-sm"
                        >
                          {prompt.preview}
                        </Typography>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          variant={ButtonVariant.Tertiary}
                          size={ButtonSize.Small}
                          icon={<CopyIcon />}
                          iconPosition={ButtonIconPosition.Left}
                        >
                          Copy prompt
                        </Button>
                        <Button
                          variant={ButtonVariant.Subtle}
                          size={ButtonSize.Small}
                          icon={<FlagIcon />}
                          iconPosition={ButtonIconPosition.Left}
                        >
                          Flag
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-4">
                <div className="rounded-16 border border-border-subtlest-tertiary bg-surface-float p-5">
                  <Typography type={TypographyType.Title3} bold>
                    Submit a prompt
                  </Typography>
                  <Typography color={TypographyColor.Tertiary}>
                    Share your workflow with the community. Auth required.
                  </Typography>
                  <div className="mt-4 flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                      <Typography
                        type={TypographyType.Caption1}
                        color={TypographyColor.Tertiary}
                      >
                        Tool used
                      </Typography>
                      <div className="rounded-12 border border-border-subtlest-tertiary bg-background-default px-3 py-2 text-text-secondary typo-callout">
                        Cursor
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Typography
                        type={TypographyType.Caption1}
                        color={TypographyColor.Tertiary}
                      >
                        Use case
                      </Typography>
                      <div className="rounded-12 border border-border-subtlest-tertiary bg-background-default px-3 py-2 text-text-secondary typo-callout">
                        Refactoring
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Typography
                        type={TypographyType.Caption1}
                        color={TypographyColor.Tertiary}
                      >
                        Title
                      </Typography>
                      <div className="rounded-12 border border-border-subtlest-tertiary bg-background-default px-3 py-2 text-text-tertiary typo-callout">
                        Short, descriptive title (max 100 chars)
                      </div>
                      <Typography
                        type={TypographyType.Caption2}
                        color={TypographyColor.StatusError}
                      >
                        Title must be at least 10 characters.
                      </Typography>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Typography
                        type={TypographyType.Caption1}
                        color={TypographyColor.Tertiary}
                      >
                        Prompt / workflow
                      </Typography>
                      <div className="rounded-12 border border-border-subtlest-tertiary bg-background-default px-3 py-3 text-text-tertiary typo-callout">
                        Paste your prompt here (50-5000 chars, markdown
                        supported)
                      </div>
                      <Typography
                        type={TypographyType.Caption2}
                        color={TypographyColor.Tertiary}
                      >
                        0 / 5000
                      </Typography>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Typography
                        type={TypographyType.Caption1}
                        color={TypographyColor.Tertiary}
                      >
                        Screenshot / video URL (optional)
                      </Typography>
                      <div className="rounded-12 border border-border-subtlest-tertiary bg-background-default px-3 py-2 text-text-tertiary typo-callout">
                        https://
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-col gap-2">
                    <Button
                      variant={ButtonVariant.Primary}
                      size={ButtonSize.Medium}
                    >
                      Publish prompt
                    </Button>
                    <Typography
                      type={TypographyType.Caption2}
                      color={TypographyColor.Tertiary}
                    >
                      Rate limit: 5 submissions per day · Auto-flag duplicates
                    </Typography>
                  </div>
                </div>

                <div className="rounded-16 border border-border-subtlest-tertiary bg-background-default p-5">
                  <Typography type={TypographyType.Title4} bold>
                    Moderation & Safety
                  </Typography>
                  <div className="mt-3 flex flex-col gap-2">
                    <Typography color={TypographyColor.Tertiary}>
                      Flag spam or unsafe content for review.
                    </Typography>
                    <Typography color={TypographyColor.Tertiary}>
                      Duplicate prompts are auto-flagged for admin review.
                    </Typography>
                    <Typography color={TypographyColor.Tertiary}>
                      External links in titles are rejected at submission.
                    </Typography>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

AiCodingHubPage.getLayout = getLayout;
AiCodingHubPage.layoutProps = { screenCentered: false };

export default AiCodingHubPage;
