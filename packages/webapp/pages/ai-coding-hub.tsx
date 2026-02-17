import type { ReactElement } from 'react';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/router';
import { NextSeo } from 'next-seo';
import classNames from 'classnames';
import {
  TerminalIcon,
  TwitterIcon,
  TrendingIcon,
  AlertIcon,
  MicrosoftIcon,
  HotIcon,
  InfoIcon,
  UpvoteIcon,
  DiscussIcon,
  BookmarkIcon,
  ShareIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { getLayout } from '../components/layouts/NoSidebarLayout';
import {
  feedItems as rawFeedItems,
  categoryLabels,
} from '../data/aiCodingHubData';
import type { FeedItem, Category } from '../data/aiCodingHubData';

// --- HELPERS ---

// Static date format to avoid hydration mismatch (no "X days ago" that changes)
const formatDate = (dateStr: string): string => {
  if (!dateStr) {
    return '';
  }
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) {
    return dateStr;
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const getImpactScore = (id: string): number => {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    // eslint-disable-next-line no-bitwise
    hash = (hash << 5) - hash + id.charCodeAt(i);
    // eslint-disable-next-line no-bitwise
    hash &= hash;
  }
  return 85 + (Math.abs(hash) % 10);
};

const getTimeLabelFromSeed = (seed: string): string => {
  const normalizedSeed = seed || '0';
  let value = 0;

  for (let i = 0; i < normalizedSeed.length; i += 1) {
    value = (value * 31 + normalizedSeed.charCodeAt(i)) % 1440;
  }

  const hours = Math.floor(value / 60)
    .toString()
    .padStart(2, '0');
  const minutes = (value % 60).toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

const getInteractionCounts = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    // eslint-disable-next-line no-bitwise
    hash = (hash << 5) - hash + id.charCodeAt(i);
    // eslint-disable-next-line no-bitwise
    hash |= 0;
  }
  const upvotes = (Math.abs(hash) % 50) + 5;
  // eslint-disable-next-line no-bitwise
  const comments = Math.abs(hash >> 2) % 20;
  return { upvotes, comments };
};

// Precompute at module level (deterministic, no Date-based drift)
const feedItems: FeedItem[] = Array.isArray(rawFeedItems)
  ? rawFeedItems.filter(
      (item) =>
        item &&
        typeof item.id === 'string' &&
        typeof item.headline === 'string' &&
        item.headline.length > 0,
    )
  : [];

const breakingCategories = new Set(['drama', 'leak', 'hot_take']);

type ModelDefinition = {
  id: string;
  label: string;
  keywords: string[];
};

type ModelStat = {
  id: string;
  label: string;
  count: number;
  latestDate: number;
};

type ModelFeedData = {
  stats: ModelStat[];
  itemsByModel: Record<string, FeedItem[]>;
  trendingModelId: string | null;
};

const modelDefinitions: ModelDefinition[] = [
  {
    id: 'codex',
    label: 'Codex',
    keywords: ['codex', 'gpt-5', 'gpt_5', 'chatgpt', 'openai'],
  },
  {
    id: 'opus',
    label: 'Opus',
    keywords: ['opus', 'anthropic', 'claude 4', 'claude 4.6', 'opus 4.6'],
  },
  {
    id: 'claude_code',
    label: 'Claude Code',
    keywords: ['claude code', 'claude', 'anthropic'],
  },
  {
    id: 'kimi',
    label: 'Kimi',
    keywords: ['kimi', 'moonshot'],
  },
  {
    id: 'copilot',
    label: 'Copilot',
    keywords: ['copilot', 'github copilot'],
  },
  {
    id: 'cursor',
    label: 'Cursor',
    keywords: ['cursor'],
  },
  {
    id: 'opencode',
    label: 'OpenCode',
    keywords: ['opencode', 'open code'],
  },
];

const normalizeText = (value: string): string => value.toLowerCase();

const getItemModelIds = (item: FeedItem): string[] => {
  const haystack = normalizeText(
    `${item.headline} ${item.summary} ${(item.tags || []).join(' ')}`,
  );

  return modelDefinitions
    .filter((model) =>
      model.keywords.some((keyword) =>
        haystack.includes(normalizeText(keyword)),
      ),
    )
    .map((model) => model.id);
};

const getModelFeedData = (items: FeedItem[]): ModelFeedData => {
  const itemsByModel: Record<string, FeedItem[]> = {};
  const latestDateByModel: Record<string, number> = {};

  modelDefinitions.forEach((model) => {
    itemsByModel[model.id] = [];
    latestDateByModel[model.id] = 0;
  });

  items.forEach((item) => {
    const modelIds = getItemModelIds(item);
    if (modelIds.length === 0) {
      return;
    }

    const itemDate = new Date(item.date).getTime() || 0;
    modelIds.forEach((modelId) => {
      itemsByModel[modelId].push(item);
      if (itemDate > latestDateByModel[modelId]) {
        latestDateByModel[modelId] = itemDate;
      }
    });
  });

  const stats = modelDefinitions
    .map((model) => ({
      id: model.id,
      label: model.label,
      count: itemsByModel[model.id].length,
      latestDate: latestDateByModel[model.id],
    }))
    .filter((model) => model.count > 0)
    .sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count;
      }
      return b.latestDate - a.latestDate;
    });

  return {
    stats,
    itemsByModel,
    trendingModelId: stats[0]?.id || null,
  };
};

const getPrimaryModelLabel = (item: FeedItem): string => {
  const modelId = getItemModelIds(item)[0];
  if (!modelId) {
    return 'General AI';
  }
  const model = modelDefinitions.find(
    (definition) => definition.id === modelId,
  );
  return model?.label || 'General AI';
};

const getBotHandle = (item: FeedItem): string => {
  const label = getPrimaryModelLabel(item).toLowerCase().replace(/\s+/g, '_');
  return `@${label}_watch`;
};

const communityCategories = new Set<Category>([
  'thread',
  'hot_take',
  'insight',
  'commentary',
  'tips',
]);

const getCommunityWireItems = (items: FeedItem[]): FeedItem[] => {
  const prioritized = items.filter((item) =>
    communityCategories.has(item.category),
  );
  if (prioritized.length >= 4) {
    return prioritized;
  }

  // Keep fallback deterministic and compact.
  const fallback = items.filter((item) => !prioritized.includes(item));
  return [...prioritized, ...fallback].slice(0, 8);
};

// --- THEME ---

const THEME = {
  bg: 'bg-background-default',
};

// --- COMPONENTS: ATOMS ---

const Badge = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <span
    className={classNames(
      'inline-flex items-center rounded-4 px-1 py-0.5 text-[10px] font-medium uppercase tracking-wide',
      className,
    )}
  >
    {children}
  </span>
);

// --- COMPONENTS: TICKER ---

type TickerItemData = {
  id: string;
  text: string;
  score: number;
  trend: number;
  icon?: ReactElement;
};

const tickerItems: TickerItemData[] = [
  {
    id: '1',
    text: 'GPT-5 Rumors',
    score: 9.2,
    trend: 12,
    icon: <TrendingIcon size={IconSize.Small} className="text-text-primary" />,
  },
  {
    id: '2',
    text: 'Cursor Adoption',
    score: 8.5,
    trend: 24,
    icon: <TerminalIcon size={IconSize.Small} className="text-text-primary" />,
  },
  {
    id: '3',
    text: 'Devin AI Updates',
    score: 7.8,
    trend: 5,
    icon: <AlertIcon size={IconSize.Small} className="text-text-primary" />,
  },
  {
    id: '4',
    text: 'Claude 3.7 Leaks',
    score: 8.9,
    trend: 15,
    icon: <TwitterIcon size={IconSize.Small} className="text-text-primary" />,
  },
  {
    id: '5',
    text: 'Copilot Sentiment',
    score: 6.4,
    trend: -3,
    icon: <MicrosoftIcon size={IconSize.Small} className="text-text-primary" />,
  },
];

const NewsTickerItem = ({ item }: { item: TickerItemData }) => (
  <div className="flex items-center gap-1 px-2 py-0.5">
    {item.icon && <span className="opacity-80 scale-[0.7]">{item.icon}</span>}
    <span className="whitespace-nowrap text-[12px] font-medium text-text-primary">
      {item.text}
    </span>
    <span className="text-[12px] font-bold text-text-secondary">
      {item.score}
    </span>
    <span
      className={classNames(
        'rounded-4 px-1 py-0 text-[10px] font-bold',
        item.trend > 0 ? 'text-text-secondary' : 'text-text-tertiary',
      )}
    >
      {item.trend > 0 ? '▲' : '▼'} {Math.abs(item.trend)}%
    </span>
  </div>
);

const MarqueeTicker = ({
  items,
  className,
}: {
  items: TickerItemData[];
  className?: string;
}) => (
  <div className={classNames('relative', className)}>
    <div className="relative flex overflow-x-hidden py-1">
      <div className="flex animate-marquee items-center whitespace-nowrap">
        {items.map((item) => (
          <NewsTickerItem key={item.id} item={item} />
        ))}
        {items.map((item, i) => (
          <NewsTickerItem key={`${item.id}-dup-${i.toString()}`} item={item} />
        ))}
      </div>
      <div className="absolute right-0 top-0 h-full w-20 bg-gradient-to-l from-background-default to-transparent" />
    </div>
  </div>
);

const MarketOverview = ({
  breakingItems,
  trendingModelLabel,
}: {
  breakingItems: FeedItem[];
  trendingModelLabel: string;
}) => {
  const topAlert = breakingItems[0];

  return (
    <div className="bg-gradient-to-b from-background-subtle via-background-default to-background-default">
      <div className="grid grid-cols-1 gap-2 px-3 pb-1.5 pt-3 tablet:grid-cols-2">
        <div className="min-w-0">
          <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-text-quaternary">
            Trending Model
          </div>
          <div className="flex items-center gap-2 text-[14px] font-bold text-text-primary">
            {trendingModelLabel}
            <span className="rounded-4 border border-border-subtlest-secondary bg-transparent px-1.5 py-0.5 text-[10px] font-medium text-text-secondary">
              +14%
            </span>
          </div>
        </div>
        <div className="min-w-0">
          <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-text-tertiary">
            Top Alert
          </div>
          <div className="line-clamp-2 text-[14px] font-medium leading-relaxed text-text-primary">
            {topAlert?.headline || 'System nominal. No critical alerts.'}
          </div>
        </div>
      </div>
    </div>
  );
};

const ModelChipRail = ({
  stats,
  activeModelId,
  onSelect,
  className,
}: {
  stats: ModelStat[];
  activeModelId: string;
  onSelect: (modelId: string) => void;
  className?: string;
}) => {
  return (
    <div
      className={classNames(
        'border-y border-border-subtlest-tertiary bg-background-default px-3 py-1.5',
        className,
      )}
    >
      <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto">
        <button
          type="button"
          onClick={() => onSelect('all')}
          className={classNames(
            'whitespace-nowrap rounded-6 px-1.5 py-0.5 text-[12px] font-semibold transition-colors',
            activeModelId === 'all'
              ? 'shadow-sm bg-white text-black'
              : 'text-text-quaternary hover:text-text-secondary',
          )}
        >
          All
        </button>
        {stats.map((model) => (
          <button
            key={model.id}
            type="button"
            onClick={() => onSelect(model.id)}
            className={classNames(
              'whitespace-nowrap rounded-6 px-1.5 py-0.5 text-[12px] font-semibold transition-colors',
              activeModelId === model.id
                ? 'shadow-sm bg-white text-black'
                : 'text-text-quaternary hover:text-text-secondary',
            )}
          >
            {model.label}
          </button>
        ))}
      </div>
    </div>
  );
};

const CommunityWirePreview = ({
  items,
  onOpenFeed,
}: {
  items: FeedItem[];
  onOpenFeed: () => void;
}) => {
  const previewItems = items.slice(0, 4);
  const getAvatarUrl = (item: FeedItem): string =>
    `https://i.pravatar.cc/80?u=${encodeURIComponent(getBotHandle(item))}`;

  return (
    <section className="bg-background-default px-3 py-2">
      <button
        type="button"
        className="mb-2 flex w-full items-center justify-between"
        onClick={onOpenFeed}
      >
        <h2 className="text-[12px] font-semibold text-text-primary">
          Community Wire
        </h2>
        <span className="text-[10px] text-text-quaternary">
          View all &rarr;
        </span>
      </button>
      <button
        type="button"
        className="w-full space-y-2 text-left"
        onClick={onOpenFeed}
      >
        {previewItems.map((item) => (
          <article
            key={`wire-preview-${item.id}`}
            className="flex items-start gap-2"
          >
            <img
              src={getAvatarUrl(item)}
              alt={`${getBotHandle(item)} avatar`}
              className="mt-0.5 h-8 w-8 shrink-0 rounded-full border border-border-subtlest-tertiary bg-surface-float"
              loading="lazy"
            />
            <div className="min-w-0 flex-1 rounded-10 rounded-tl-2 border border-border-subtlest-tertiary bg-surface-float p-2.5">
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="truncate text-[10px] font-semibold text-text-primary">
                  {getBotHandle(item)}
                </span>
                <span className="text-[10px] text-text-quaternary">
                  {getTimeLabelFromSeed(item.source_tweet_id || item.id)}
                </span>
              </div>
              <p className="line-clamp-2 text-[14px] leading-snug text-text-primary">
                {item.headline}. {item.summary}
              </p>
            </div>
          </article>
        ))}
      </button>
      <button
        type="button"
        onClick={onOpenFeed}
        className="mt-2 w-full rounded-8 border border-border-subtlest-tertiary bg-transparent px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
      >
        Open feed
      </button>
    </section>
  );
};

const CommunityWireFeed = ({
  items,
  dateLabels,
  onBack,
}: {
  items: FeedItem[];
  dateLabels: Record<string, string>;
  onBack: () => void;
}) => {
  return (
    <div className="min-h-screen bg-background-default">
      <div className="border-b border-border-subtlest-tertiary bg-background-subtle px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-theme-active text-[10px] font-bold text-text-secondary">
              AI
            </span>
            <div>
              <h2 className="font-mono text-[10px] font-semibold uppercase tracking-widest text-text-secondary">
                Community Wire Bot
              </h2>
              <p className="text-[10px] text-text-quaternary">
                online • broadcast
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="rounded-6 border border-border-subtlest-tertiary px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-text-tertiary hover:bg-theme-active hover:text-text-primary"
          >
            Back
          </button>
        </div>
        <p className="mt-1 text-[10px] text-text-quaternary">
          Live bot updates from the daily.dev community.
        </p>
      </div>
      <div className="space-y-2 bg-background-default px-3 py-3">
        {items.map((item) => (
          <div
            key={`wire-feed-${item.id}`}
            className="flex items-start gap-2.5"
          >
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-theme-active text-[10px] font-bold text-text-secondary">
              AI
            </span>
            <div className="min-w-0 flex-1 rounded-10 rounded-tl-2 border border-border-subtlest-tertiary bg-surface-float px-2.5 py-2">
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-text-secondary">
                  {getBotHandle(item)}
                </span>
                <span className="text-[10px] text-text-quaternary">
                  {dateLabels[item.id] || item.date}
                </span>
              </div>
              <p className="text-[14px] font-medium leading-snug text-text-primary">
                {item.headline}
              </p>
              <p className="mt-0.5 text-[12px] leading-relaxed text-text-tertiary">
                {item.summary}
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1">
                <span className="rounded-4 border border-border-subtlest-secondary bg-transparent px-1 py-0.5 text-[10px] font-medium text-text-tertiary">
                  {getPrimaryModelLabel(item)}
                </span>
                <span className="rounded-4 border border-border-subtlest-secondary bg-transparent px-1 py-0.5 text-[10px] font-medium text-text-tertiary">
                  update
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- COMPONENTS: MEDIA SHARE MONITOR ---

type TrendPulse = {
  id: string;
  label: string;
  mentions: number;
  currentMentions: number;
  previousMentions: number;
  delta: number;
  latestSeenAt: number;
  hotScore: number;
  sparklineData: number[];
};

const getTrendPulseData = (items: FeedItem[]): TrendPulse[] => {
  const itemTimes = items
    .map((item) => new Date(item.date).getTime())
    .filter((time) => Number.isFinite(time) && time > 0);
  const latestFeedTime = itemTimes.length > 0 ? Math.max(...itemTimes) : 0;
  const dayMs = 24 * 60 * 60 * 1000;
  const currentWindowStart = latestFeedTime - dayMs;
  const previousWindowStart = latestFeedTime - dayMs * 2;
  const weeklyWindowStart = latestFeedTime - dayMs * 7;

  const rows = modelDefinitions.map((model) => {
    let weeklyMentions = 0;
    let currentMentions = 0;
    let previousMentions = 0;
    let latestSeenAt = 0;
    const dailyCounts = Array(7).fill(0);

    items.forEach((item) => {
      const modelIds = getItemModelIds(item);
      if (!modelIds.includes(model.id)) {
        return;
      }

      const itemTime = new Date(item.date).getTime() || 0;
      latestSeenAt = Math.max(latestSeenAt, itemTime);

      if (itemTime >= weeklyWindowStart) {
        weeklyMentions += 1;
        // Calculate day index (0 to 6, where 6 is today/latest)
        const dayIndex = Math.floor((itemTime - weeklyWindowStart) / dayMs);
        if (dayIndex >= 0 && dayIndex < 7) {
          dailyCounts[dayIndex] += 1;
        }
      }

      if (itemTime >= currentWindowStart) {
        currentMentions += 1;
      } else if (itemTime >= previousWindowStart) {
        previousMentions += 1;
      }
    });

    let delta = 0;
    if (previousMentions > 0) {
      delta = ((currentMentions - previousMentions) / previousMentions) * 100;
    } else if (currentMentions > 0) {
      delta = 100;
    }

    return {
      id: model.id,
      label: model.label,
      mentions: weeklyMentions,
      currentMentions,
      previousMentions,
      delta,
      latestSeenAt,
      hotScore: currentMentions * 3 + weeklyMentions,
      sparklineData: dailyCounts,
    };
  });

  return rows
    .filter((row) => row.mentions > 0 || row.currentMentions > 0)
    .sort((a, b) => b.hotScore - a.hotScore);
};

const trendPulseData: TrendPulse[] = getTrendPulseData(feedItems);

const monitorTabs = [
  { id: 'hot', label: 'Hot' },
  { id: 'alpha', label: 'Alpha' },
  { id: 'new', label: 'New' },
  { id: 'gainers', label: 'Gainers' },
  { id: 'losers', label: 'Losers' },
] as const;

type MonitorTabId = (typeof monitorTabs)[number]['id'];

const getFilteredPulseItems = (tabId: MonitorTabId): TrendPulse[] => {
  if (tabId === 'gainers') {
    return trendPulseData
      .filter((item) => item.delta > 0)
      .sort((a, b) => b.delta - a.delta)
      .slice(0, 5);
  }

  if (tabId === 'losers') {
    return trendPulseData
      .filter((item) => item.delta < 0)
      .sort((a, b) => a.delta - b.delta)
      .slice(0, 5);
  }

  if (tabId === 'new') {
    return [...trendPulseData]
      .sort((a, b) => b.latestSeenAt - a.latestSeenAt)
      .slice(0, 5);
  }

  if (tabId === 'alpha') {
    return [...trendPulseData].sort((a, b) => b.delta - a.delta).slice(0, 5);
  }

  return [...trendPulseData]
    .sort((a, b) => b.hotScore - a.hotScore)
    .slice(0, 5);
};

const Sparkline = ({
  data,
  isNegative,
}: {
  data: number[];
  isNegative: boolean;
}) => {
  const width = 36;
  const height = 12;
  const max = Math.max(...data, 1);
  const min = 0; // Base from 0 to show magnitude
  const range = max - min;

  const points = data
    .map((val, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * height;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="flex items-center justify-center">
      <svg width={width} height={height} className="overflow-visible">
        <polyline
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={
            isNegative
              ? 'text-accent-ketchup-default'
              : 'text-accent-avocado-default'
          }
        />
      </svg>
    </div>
  );
};

const TrendPulseRow = ({ item }: { item: TrendPulse }) => {
  const isNegative = item.delta < 0;

  return (
    <div
      className={classNames(
        'grid grid-cols-[1.4fr_0.8fr_5rem_1fr] items-center gap-1 py-1.5',
        isNegative
          ? 'bg-accent-ketchup-subtlest/20'
          : 'bg-accent-avocado-subtlest/20',
      )}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-1">
          <span className="truncate text-[12px] font-semibold text-text-primary">
            {item.label}
          </span>
          {Math.abs(item.delta) >= 10 && (
            <span
              className="flex items-center justify-center text-text-quaternary"
              aria-label="hot"
            >
              <HotIcon size={IconSize.Size16} secondary />
            </span>
          )}
        </div>
      </div>
      <div className="text-right leading-none">
        <p className="font-mono text-[12px] font-semibold text-text-primary">
          {item.mentions.toLocaleString()}
        </p>
      </div>
      <div
        className={classNames(
          'text-right font-mono text-[11px] font-bold',
          isNegative
            ? 'text-accent-ketchup-default'
            : 'text-accent-avocado-default',
        )}
      >
        {item.delta > 0 ? '+' : ''}
        {item.delta.toFixed(2)}%
      </div>
      <Sparkline data={item.sparklineData} isNegative={isNegative} />
    </div>
  );
};

const WidgetComparisonMonitor = () => {
  const router = useRouter();
  const [activeTabId, setActiveTabId] = useState<MonitorTabId>('hot');
  const visibleItems = useMemo(
    () => getFilteredPulseItems(activeTabId),
    [activeTabId],
  );

  return (
    <section className="bg-background-default px-3 py-2">
      <div className="bg-accent-avocado-subtlest/35 rounded-12 p-3">
        <div className="mb-2.5 flex items-center justify-start gap-1.5 overflow-x-auto">
          {monitorTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTabId(tab.id)}
              className={classNames(
                'whitespace-nowrap rounded-6 px-1.5 py-0.5 text-[12px] font-semibold transition-colors',
                activeTabId === tab.id
                  ? 'shadow-sm bg-white text-black'
                  : 'text-text-quaternary hover:text-text-secondary',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-[1.4fr_0.8fr_5rem_1fr] gap-1 pb-1 text-[10px] text-text-quaternary">
          <span>Model</span>
          <span className="text-right">Mentions</span>
          <span className="text-right">24h chg%</span>
          <span className="text-center">Trend (7d)</span>
        </div>
        <div>
          {visibleItems.map((item) => (
            <TrendPulseRow key={item.id} item={item} />
          ))}
        </div>
        <button
          type="button"
          onClick={() => router.push('/ai-coding-hub-monitor')}
          className="mt-2 w-full rounded-8 border border-border-subtlest-tertiary bg-transparent px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
        >
          View more
        </button>
      </div>
    </section>
  );
};

// --- COMPONENTS: HEADER ---

const CompactHeader = () => {
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    setDateStr(new Date().toLocaleDateString());
  }, []);

  return (
    <div className="z-30 from-accent-water-subtlest/30 via-background-default/80 to-accent-onion-subtlest/30 border-b border-border-subtlest-tertiary bg-gradient-to-r px-3 py-2 backdrop-blur-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-background-default/50 shadow-sm ring-black/5 flex h-6 w-6 items-center justify-center rounded-8 text-text-primary ring-1">
            <TerminalIcon size={IconSize.Small} />
          </div>
          <div>
            <h1 className="font-bold leading-none text-text-primary typo-callout">
              AI CODING HUB
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {dateStr && (
            <span className="md:block hidden font-mono text-[10px] text-text-quaternary">
              {dateStr}
            </span>
          )}
        </div>
      </div>
      <div className="mt-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="opacity-75 absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-cabbage-default" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-cabbage-default" />
          </span>
          <span className="font-mono text-[10px] uppercase tracking-wider text-text-secondary">
            Live • 6.2k Sources
          </span>
        </div>
        <div className="font-mono text-[10px] text-text-quaternary">
          Updated 1m
        </div>
      </div>
    </div>
  );
};

// --- COMPONENTS: FEED ITEMS ---

const NewsItem = ({
  item,
  dateLabel,
  isLatest = false,
}: {
  item: FeedItem;
  dateLabel: string;
  isLatest?: boolean;
}) => {
  const label =
    categoryLabels[item.category as Category] || item.category || 'NEWS';
  const { upvotes, comments } = useMemo(
    () => getInteractionCounts(item.id),
    [item.id],
  );

  return (
    <div className="group relative flex flex-col gap-1.5 border-b border-border-subtlest-tertiary bg-background-default p-3 transition-colors hover:bg-surface-hover">
      <div className="flex items-center gap-2">
        {isLatest && (
          <Badge className="rounded-4 bg-white px-1.5 py-0.5 text-[9px] font-bold uppercase leading-none tracking-wide text-black">
            Just in
          </Badge>
        )}
        <span className="text-[10px] font-bold uppercase tracking-wide text-text-tertiary">
          {label}
        </span>
        <div className="flex items-center gap-1.5 text-[12px] text-text-tertiary">
          <span>·</span>
          <span>{getPrimaryModelLabel(item)}</span>
          <span>·</span>
          <span>{dateLabel}</span>
        </div>
      </div>
      <div>
        <h3 className="text-[14px] font-bold leading-snug text-text-primary transition-colors group-hover:text-text-primary">
          {item.headline}
        </h3>
        <p className="mt-1 line-clamp-3 text-[14px] leading-relaxed text-text-secondary">
          {item.summary}
        </p>
      </div>
      <div className="mt-1 flex items-center justify-between pt-0.5">
        <button
          type="button"
          className="flex flex-1 items-center justify-start gap-1 text-text-tertiary transition-colors hover:text-text-primary"
        >
          <UpvoteIcon size={IconSize.XSmall} />
          <span className="text-[11px] font-medium">{upvotes}</span>
        </button>
        <button
          type="button"
          className="flex flex-1 items-center justify-center gap-1 text-text-tertiary transition-colors hover:text-text-primary"
        >
          <DiscussIcon size={IconSize.XSmall} />
          <span className="text-[11px] font-medium">{comments}</span>
        </button>
        <button
          type="button"
          className="flex flex-1 items-center justify-center text-text-tertiary transition-colors hover:text-text-primary"
        >
          <BookmarkIcon size={IconSize.XSmall} />
        </button>
        <button
          type="button"
          className="flex flex-1 items-center justify-end text-text-tertiary transition-colors hover:text-text-primary"
        >
          <ShareIcon size={IconSize.XSmall} />
        </button>
      </div>
    </div>
  );
};

const SignalContextCard = ({ item }: { item: FeedItem }) => (
  <div className="bg-accent-onion-subtlest/10 relative border-b border-border-subtlest-tertiary px-3 py-2">
    <div className="flex items-start gap-2">
      <div className="flex h-5 w-5 shrink-0 items-center justify-center text-accent-onion-default">
        <InfoIcon size={IconSize.Small} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-0.5 flex items-center gap-2">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-accent-onion-default">
            Context • {getPrimaryModelLabel(item)}
          </span>
        </div>
        <p className="line-clamp-2 text-[12px] font-medium leading-relaxed text-text-primary">
          {item.summary}
        </p>
      </div>
    </div>
  </div>
);

// --- COMPONENTS: TOPIC ANALYSIS CARD ---

const TopicAnalysisCard = ({ item }: { item: FeedItem }) => {
  const impactScore = useMemo(() => getImpactScore(item.id), [item.id]);

  return (
    <div className="from-accent-cabbage-subtlest/5 group relative border-b border-border-subtlest-tertiary bg-gradient-to-r via-transparent to-transparent px-3 py-3">
      <div className="flex gap-3">
        <div className="flex flex-col items-center pt-0.5">
          <div className="bg-accent-cabbage-subtlest/10 ring-accent-cabbage-subtlest/20 relative flex h-8 w-8 items-center justify-center rounded-10 text-accent-cabbage-default ring-1 ring-inset">
            <TrendingIcon size={IconSize.Small} />
            <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-background-default ring-2 ring-background-default">
              <span className="text-[9px] font-bold text-text-primary">
                {impactScore}
              </span>
            </div>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-accent-cabbage-default">
              Topic Analysis
            </span>
            <span className="bg-accent-cabbage-default/50 flex h-1.5 w-1.5 rounded-full">
              <span className="h-full w-full animate-ping rounded-full bg-accent-cabbage-default" />
            </span>
          </div>

          <h3 className="mt-1 text-[14px] font-bold leading-snug text-text-primary">
            {item.headline.replace(/^Topic Analysis:\s*/i, '')}
          </h3>

          <div className="mt-2 flex items-center gap-3">
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-border-subtlest-tertiary">
              <div
                className="h-full rounded-full bg-accent-cabbage-default"
                style={{ width: `${impactScore}%` }}
              />
            </div>
            <button
              type="button"
              className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-text-tertiary transition-colors hover:text-accent-cabbage-default"
            >
              View Data <span className="text-[12px] leading-none">›</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENTS: BREAKING NEWS SECTION ---

const BreakingNewsCarousel = ({
  items,
  dateLabels,
}: {
  items: FeedItem[];
  dateLabels: Record<string, string>;
}) => {
  const [pageIndex, setPageIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pageCount = items.length;

  const handleScroll = () => {
    if (!scrollRef.current) {
      return;
    }
    const { scrollLeft, clientWidth } = scrollRef.current;
    const newIndex = Math.round(scrollLeft / clientWidth);
    if (newIndex !== pageIndex) {
      setPageIndex(newIndex);
    }
  };

  const scrollToPage = (index: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        left: index * scrollRef.current.clientWidth,
        behavior: 'smooth',
      });
      setPageIndex(index);
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="bg-background-default px-3 pb-2 pt-2">
      <div className="mb-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-accent-ketchup-default" />
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-accent-ketchup-default">
            Breaking
          </span>
        </div>
        <div className="flex items-center gap-1">
          {Array.from({ length: pageCount }).map((_, index) => (
            <button
              key={`breaking-page-dot-${index.toString()}`}
              type="button"
              onClick={() => scrollToPage(index)}
              className={classNames(
                'h-1.5 w-1.5 rounded-full border transition-colors',
                pageIndex === index
                  ? 'border-text-secondary bg-text-secondary'
                  : 'border-border-subtlest-secondary bg-transparent hover:border-text-tertiary',
              )}
              aria-label={`Breaking page ${index + 1}`}
            />
          ))}
        </div>
      </div>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="no-scrollbar flex w-full snap-x snap-mandatory gap-2 overflow-x-auto"
      >
        {items.map((item) => {
          const dateLabel = dateLabels[item.id] || item.date;
          return (
            <article
              key={`breaking-card-${item.id}`}
              className="flex h-[112px] w-full flex-shrink-0 snap-center flex-col rounded-12 border border-border-subtlest-tertiary bg-surface-float p-2.5"
            >
              <div className="mb-0.5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <Badge className="bg-accent-ketchup-default text-white">
                    {categoryLabels[item.category as Category] || 'ALERT'}
                  </Badge>
                  <span className="font-mono text-[10px] text-text-quaternary">
                    {dateLabel}
                  </span>
                </div>
                <span className="rounded-4 border border-border-subtlest-secondary bg-transparent px-1 py-0.5 text-[10px] text-text-tertiary">
                  {getPrimaryModelLabel(item)}
                </span>
              </div>
              <div className="min-h-0">
                <p className="line-clamp-3 text-[14px] text-text-primary">
                  {item.headline} {item.summary}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};

const LivePodcastStrip = () => {
  const podcasts = [
    {
      id: 'pod-1',
      handle: '@ai_live_daily',
      text: 'This livestream is trending',
      listeners: '1.2k listening',
    },
    {
      id: 'pod-2',
      handle: '@sam_altman',
      text: 'Reasoning roadmap AMA is live',
      listeners: '980 listening',
    },
    {
      id: 'pod-3',
      handle: '@cursor_team',
      text: 'Agent workflows weekly standup',
      listeners: '760 listening',
    },
  ] as const;

  return (
    <div className="bg-background-default px-3 py-2">
      <div className="no-scrollbar flex gap-2 overflow-x-auto">
        {podcasts.map((podcast) => (
          <button
            key={podcast.id}
            type="button"
            className="hover:opacity-90 w-[86%] min-w-[86%] rounded-12 bg-accent-onion-default px-2.5 py-1.5 text-left text-white transition-opacity"
          >
            <div className="flex items-center gap-2">
              <img
                src={`https://api.dicebear.com/9.x/personas/svg?seed=${encodeURIComponent(
                  podcast.handle,
                )}`}
                alt={`${podcast.handle} profile`}
                className="border-white/30 bg-white/20 h-6 w-6 shrink-0 rounded-full border"
                loading="lazy"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-medium">
                  {podcast.handle} {podcast.text}
                </p>
                <p className="text-white/80 mt-0.5 text-[10px]">
                  {podcast.listeners}
                </p>
              </div>
              <span
                className="bg-black/10 flex h-4 items-end gap-0.5 rounded-4 px-1 py-0.5"
                aria-label="live voice activity"
              >
                <span className="animate-voice-wave-1 h-1.5 w-0.5 rounded-full bg-white" />
                <span className="animate-voice-wave-2 h-3 w-0.5 rounded-full bg-white" />
                <span className="animate-voice-wave-3 h-2 w-0.5 rounded-full bg-white" />
                <span className="animate-voice-wave-4 h-2.5 w-0.5 rounded-full bg-white" />
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// --- COMPONENTS: PULL TO REFRESH ---

const CyberRefreshIndicator = ({
  pullY,
  isRefreshing,
}: {
  pullY: number;
  isRefreshing: boolean;
}) => {
  const [hexString, setHexString] = useState('0x00');
  const opacity = Math.min(pullY / 80, 1);

  useEffect(() => {
    if (pullY > 10 || isRefreshing) {
      const interval = setInterval(() => {
        setHexString(
          `0x${Math.floor(Math.random() * 16777215)
            .toString(16)
            .toUpperCase()}`,
        );
      }, 100);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [pullY, isRefreshing]);

  if (pullY === 0 && !isRefreshing) {
    return null;
  }

  return (
    <div
      className="absolute left-0 top-0 flex w-full justify-center overflow-hidden pt-4"
      style={{ height: Math.max(pullY, 80), opacity }}
    >
      <div className="font-mono text-[10px] text-accent-avocado-default">
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-2">
            <span className="animate-pulse">
              {isRefreshing ? '► UPDATING_FEED' : '▼ PULL_TO_SCAN'}
            </span>
          </div>
          <div className="flex gap-1 text-text-tertiary">
            <span>ADDR:</span>
            <span>{hexString}</span>
          </div>
          <div className="mt-1 flex gap-0.5">
            {Array.from({ length: 10 }).map((_, i) => {
              const isActive = i < (pullY / 150) * 10;
              let dotClass = 'bg-border-subtlest-tertiary';

              if (isRefreshing) {
                dotClass = 'animate-pulse bg-accent-avocado-default';
              } else if (isActive) {
                dotClass = 'bg-accent-avocado-default';
              }

              return (
                <div
                  key={`refresh-dot-${i.toString()}`}
                  className={classNames('h-1.5 w-1.5 rounded-full', dotClass)}
                  style={{ animationDelay: `${i * 50}ms` }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- FEED COMPOSER ---

const FeedComposer = ({
  items,
  breakingItems,
  dateLabels,
}: {
  items: FeedItem[];
  breakingItems: FeedItem[];
  dateLabels: Record<string, string>;
}) => {
  const breakingIds = new Set(breakingItems.map((b) => b.id));
  const remaining = items.filter((i) => !breakingIds.has(i.id));
  const feedComponents: ReactElement[] = [];

  remaining.forEach((item, index) => {
    const isTopicCard = (index + 1) % 5 === 0;
    const isContextCard = (index + 1) % 3 === 0 && !isTopicCard;
    const dateLabel = dateLabels[item.id] || item.date;

    if (isTopicCard) {
      feedComponents.push(
        <TopicAnalysisCard
          key={`topic-${item.id}-${index.toString()}`}
          item={item}
        />,
      );
    } else if (isContextCard) {
      feedComponents.push(
        <SignalContextCard
          key={`context-${item.id}-${index.toString()}`}
          item={item}
        />,
      );
    } else {
      feedComponents.push(
        <NewsItem
          key={item.id}
          item={item}
          dateLabel={dateLabel}
          isLatest={index === 0}
        />,
      );
    }
  });

  if (items.length === 0) {
    return (
      <div className="p-8 text-center text-[12px] text-text-quaternary">
        No feed items available.
      </div>
    );
  }

  return (
    <>
      {feedComponents}
      <div className="p-4 text-center text-[10px] text-text-quaternary">
        End of Stream
      </div>
    </>
  );
};

// --- MAIN PAGE ---

// Pre-compute everything at module level so SSR and client are identical
const allItems = feedItems;

// Pre-compute date labels using formatDate (deterministic, no "now" dependency)
const dateLabels: Record<string, string> = {};
allItems.forEach((item) => {
  dateLabels[item.id] = formatDate(item.date);
});

function AiCodingHubContent(): ReactElement {
  const [pullY, setPullY] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const touchStartXRef = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      touchStartXRef.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartXRef.current !== null && window.scrollY === 0) {
      const currentY = e.touches[0].clientY;
      const diff = currentY - touchStartXRef.current;
      if (diff > 0) {
        const resistance = Math.min(diff * 0.5, 150);
        setPullY(resistance);
      }
    }
  };

  const handleTouchEnd = () => {
    if (pullY > 80) {
      setIsRefreshing(true);
      setPullY(80);
      setTimeout(() => {
        setIsRefreshing(false);
        setPullY(0);
      }, 2000);
    } else {
      setPullY(0);
    }
    touchStartXRef.current = null;
  };

  const modelFeedData = useMemo(() => getModelFeedData(allItems), []);
  const [activeModelId, setActiveModelId] = useState<string>('all');
  const [activeFeedView, setActiveFeedView] = useState<'main' | 'community'>(
    'main',
  );
  const feedStartRef = useRef<HTMLDivElement>(null);
  const [showBottomNav, setShowBottomNav] = useState(true);

  useEffect(() => {
    if (activeFeedView !== 'main') {
      setShowBottomNav(false);
      return undefined;
    }

    const feedStartNode = feedStartRef.current;
    if (!feedStartNode) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show bottom bar when the in-flow rail is below the viewport (user hasn't scrolled to it yet)
        // Hide bottom bar when the in-flow rail is visible or above the viewport (sticky top takes over)
        const isBelow =
          !entry.isIntersecting &&
          entry.boundingClientRect.top > window.innerHeight;
        setShowBottomNav(isBelow);
      },
      {
        threshold: 0,
      },
    );

    observer.observe(feedStartNode);

    return () => observer.disconnect();
  }, [activeFeedView]);

  const scopedItems =
    activeModelId === 'all'
      ? allItems
      : modelFeedData.itemsByModel[activeModelId] || [];
  const communityWireItems = getCommunityWireItems(scopedItems);
  const scopedBreakingItems = scopedItems
    .filter((item) => breakingCategories.has(item.category))
    .slice(0, 9);
  const trendingModelLabel =
    modelFeedData.stats.find(
      (model) => model.id === modelFeedData.trendingModelId,
    )?.label || 'N/A';

  const handleModelSelect = (modelId: string): void => {
    setActiveModelId(modelId);
    const el = feedStartRef.current;
    if (!el) {
      return;
    }
    const rect = el.getBoundingClientRect();
    const isAlreadySticky = rect.top <= 1 && rect.top >= -1;
    if (!isAlreadySticky) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div
      className={`min-h-screen w-full ${THEME.bg} font-sans text-text-primary`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <NextSeo
        title="AI Coding Hub // Live Feed"
        description="Real-time updates on AI coding tools and models."
      />
      <style>
        {`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          @keyframes breakingContentSwipe {
            0% { transform: translateX(14px); opacity: 0; }
            100% { transform: translateX(0); opacity: 1; }
          }
          @keyframes voiceWave {
            0%, 100% { transform: scaleY(0.35); opacity: 0.55; }
            50% { transform: scaleY(1); opacity: 1; }
          }
          .animate-marquee {
            animation: marquee 48s linear infinite;
          }
          .animate-breaking-content-swipe {
            animation: breakingContentSwipe 220ms ease-out;
            will-change: transform, opacity;
          }
          .animate-voice-wave-1 {
            transform-origin: center bottom;
            animation: voiceWave 1s ease-in-out infinite;
          }
          .animate-voice-wave-2 {
            transform-origin: center bottom;
            animation: voiceWave 0.8s ease-in-out infinite;
            animation-delay: 80ms;
          }
          .animate-voice-wave-3 {
            transform-origin: center bottom;
            animation: voiceWave 1.2s ease-in-out infinite;
            animation-delay: 160ms;
          }
          .animate-voice-wave-4 {
            transform-origin: center bottom;
            animation: voiceWave 0.9s ease-in-out infinite;
            animation-delay: 240ms;
          }
        `}
      </style>
      <div className="relative mx-auto min-h-screen max-w-lg border-x border-border-subtlest-tertiary bg-background-default">
        <CyberRefreshIndicator pullY={pullY} isRefreshing={isRefreshing} />
        <div
          style={{
            transform: `translateY(${pullY}px)`,
            transition: isRefreshing
              ? 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
              : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          className="min-h-screen bg-background-default"
        >
          <CompactHeader />
          {activeFeedView === 'community' ? (
            <CommunityWireFeed
              items={communityWireItems}
              dateLabels={dateLabels}
              onBack={() => setActiveFeedView('main')}
            />
          ) : (
            <>
              <MarqueeTicker
                items={tickerItems}
                className="bg-transparent pb-1"
              />
              <MarketOverview
                breakingItems={scopedBreakingItems}
                trendingModelLabel={trendingModelLabel}
              />
              <BreakingNewsCarousel
                items={scopedBreakingItems}
                dateLabels={dateLabels}
              />
              <CommunityWirePreview
                items={communityWireItems}
                onOpenFeed={() => {
                  setActiveFeedView('community');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
              <WidgetComparisonMonitor />
              <div
                ref={feedStartRef}
                className="sticky top-0 z-[9999] bg-background-default"
              >
                <ModelChipRail
                  stats={modelFeedData.stats}
                  activeModelId={activeModelId}
                  onSelect={handleModelSelect}
                />
              </div>
              <LivePodcastStrip />
              <div className="min-h-screen">
                <FeedComposer
                  items={scopedItems}
                  breakingItems={scopedBreakingItems}
                  dateLabels={dateLabels}
                />
              </div>
            </>
          )}
        </div>
      </div>
      {showBottomNav && activeFeedView === 'main' && (
        <div className="fixed inset-x-0 bottom-0 z-[9999]">
          <div className="shadow-2xl mx-auto max-w-lg border-x border-t border-border-subtlest-tertiary bg-background-default">
            <ModelChipRail
              stats={modelFeedData.stats}
              activeModelId={activeModelId}
              onSelect={handleModelSelect}
            />
          </div>
        </div>
      )}
    </div>
  );
}

const AiCodingHubPage = (): ReactElement => <AiCodingHubContent />;

AiCodingHubPage.getLayout = getLayout;
AiCodingHubPage.layoutProps = { screenCentered: false, hideBackButton: true };

export default AiCodingHubPage;
