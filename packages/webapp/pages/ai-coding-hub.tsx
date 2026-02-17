import type { ReactElement } from 'react';
import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
  useContext,
} from 'react';
import { useRouter } from 'next/router';
import { NextSeo } from 'next-seo';
import classNames from 'classnames';
import dynamic from 'next/dynamic';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
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
  MoveToIcon,
  LinkIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import ProgressiveEnhancementContext from '@dailydotdev/shared/src/contexts/ProgressiveEnhancementContext';
import { useViewSize, ViewSize } from '@dailydotdev/shared/src/hooks';
import { getLayout } from '../components/layouts/MainLayout';
import {
  feedItems as rawFeedItems,
  categoryLabels,
  getMentionsLabel,
  getRelativeTime,
  isViralFeedItem,
} from '../data/aiCodingHubData';
import type { FeedItem, Category } from '../data/aiCodingHubData';

const MobileFooterNavbar = dynamic(
  () =>
    import(
      /* webpackChunkName: "mobileFooterNavbar" */ '../components/footer/MobileFooterNavbar'
    ),
);

// --- HELPERS ---

const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const formatDate = (dateStr: string): string => {
  if (!dateStr) {
    return '';
  }
  const parts = dateStr.split('-');
  if (parts.length < 3) {
    return dateStr;
  }
  const monthIndex = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  if (Number.isNaN(monthIndex) || Number.isNaN(day)) {
    return dateStr;
  }
  return `${MONTH_NAMES[monthIndex]} ${day}`;
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

// Pre-compute at module level (deterministic, no Date-based drift)
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

// --- MODEL DEFINITIONS ---

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
  { id: 'kimi', label: 'Kimi', keywords: ['kimi', 'moonshot'] },
  {
    id: 'copilot',
    label: 'Copilot',
    keywords: ['copilot', 'github copilot'],
  },
  { id: 'cursor', label: 'Cursor', keywords: ['cursor'] },
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
  const model = modelDefinitions.find((d) => d.id === modelId);
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
  const fallback = items.filter((item) => !prioritized.includes(item));
  return [...prioritized, ...fallback].slice(0, 8);
};

// --- TREND PULSE ---

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

// Pre-compute date labels and relative times (avoids Date() calls during render)
const dateLabels: Record<string, string> = {};
const relativeTimeLabels: Record<string, string> = {};
feedItems.forEach((item) => {
  dateLabels[item.id] = formatDate(item.date);
  relativeTimeLabels[item.id] = getRelativeTime(item.date);
});

// --- THEME ---

const THEME = { bg: 'bg-background-default' };

// --- TICKER ITEMS ---

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

// --- EMOJI CONFIG ---

const modelEmojis: Record<string, string[]> = {
  all: ['🚀', '⚡', '🔥', '💡', '🤖', '🧠', '💻', '🎯', '⭐', '🔮'],
  codex: ['🚀', '🎉', '🆕', '📦', '🏗️', '🛠️', '✨', '🎁'],
  opus: ['⚙️', '🔧', '💎', '🧩', '🔌', '📐', '🎨', '✨'],
  claude_code: ['💡', '📝', '🎓', '🧪', '📖', '🔑', '✅', '🏆'],
  kimi: ['📢', '📰', '🗞️', '🔔', '📣', '🌐', '📡', '🏷️'],
  copilot: ['🔥', '💥', '🍿', '😱', '⚠️', '🌪️', '💣', '👀'],
  cursor: ['🌶️', '♨️', '💬', '🗣️', '🤔', '😤', '🎤', '💭'],
  opencode: ['🚀', '⚡', '💡', '🧠', '🔮', '💻', '🛠️', '✨'],
};

interface EmojiParticle {
  id: number;
  emoji: string;
  x: number;
  y: number;
}

// --- ATOMS ---

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

// --- TSAHI TOP SECTION COMPONENTS ---

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
      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-2 px-3 pb-1.5 pt-3 tablet:grid-cols-2">
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
}) => (
  <div
    className={classNames(
      'border-y border-border-subtlest-tertiary bg-background-default px-3 py-1.5',
      className,
    )}
  >
    <div className="no-scrollbar mx-auto flex max-w-4xl items-center gap-1.5 overflow-x-auto">
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
      <div className="mx-auto max-w-4xl">
        <button
          type="button"
          className="mb-2 flex w-full items-center justify-between"
          onClick={onOpenFeed}
        >
          <h2 className="text-[12px] font-semibold text-text-primary">
            Community Wire
          </h2>
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
                    {relativeTimeLabels[item.id] || getRelativeTime(item.date)}
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
      </div>
    </section>
  );
};

const CommunityWireFeed = ({
  items,
  onBack,
}: {
  items: FeedItem[];
  onBack: () => void;
}) => (
  <div className="min-h-screen bg-background-default">
    <div className="border-b border-border-subtlest-tertiary bg-background-subtle px-3 py-2">
      <div className="mx-auto max-w-4xl">
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
                online &bull; broadcast
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
    </div>
    <div className="mx-auto max-w-4xl space-y-2 px-3 py-3">
      {items.map((item) => (
        <div key={`wire-feed-${item.id}`} className="flex items-start gap-2.5">
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

// --- SPARKLINE ---

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
  const range = max;
  const points = data
    .map((val, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - (val / range) * height;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="flex items-center justify-end">
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
        'grid grid-cols-[1fr_auto_auto_auto] items-center gap-x-3 gap-y-1 py-1.5',
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
            <span className="flex items-center justify-center text-text-quaternary">
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
      <div className="bg-accent-avocado-subtlest/35 mx-auto max-w-4xl rounded-12 p-3">
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
        <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 gap-y-1 pb-1 text-[10px] text-text-quaternary">
          <span>Model</span>
          <span className="text-right">Mentions</span>
          <span className="text-right">24h chg%</span>
          <span className="text-right">Trend (7d)</span>
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

// --- BREAKING NEWS CAROUSEL ---

const BreakingNewsCarousel = ({ items }: { items: FeedItem[] }) => {
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
      <div className="mx-auto max-w-4xl">
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
    </div>
  );
};

// --- LIVE PODCAST STRIP ---

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
      <div className="no-scrollbar mx-auto flex max-w-4xl gap-2 overflow-x-auto">
        {podcasts.map((podcast) => (
          <button
            key={podcast.id}
            type="button"
            className="hover:opacity-90 w-[86%] min-w-[86%] shrink-0 rounded-12 bg-accent-onion-default px-2.5 py-1.5 text-left text-white transition-opacity laptop:w-auto laptop:min-w-0"
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

// --- COMPACT HEADER ---

const CompactHeader = ({ logoGlow }: { logoGlow: boolean }) => {
  const router = useRouter();
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    setDateStr(new Date().toLocaleDateString());
  }, []);

  return (
    <div className="from-accent-water-subtlest/30 via-background-default/80 to-accent-onion-subtlest/30 z-30 border-b border-border-subtlest-tertiary bg-gradient-to-r px-3 py-2 backdrop-blur-md">
      <div className="mx-auto flex max-w-4xl items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-1 text-text-quaternary transition-colors hover:text-text-secondary"
            aria-label="Go back"
          >
            <MoveToIcon className="rotate-180" size={IconSize.XSmall} />
          </button>
          <div>
            <h1
              className={classNames(
                'font-bold leading-none text-text-primary transition-all duration-500 typo-callout',
                logoGlow && 'logo-glow-pulse',
              )}
            >
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
          <button
            type="button"
            className="flex items-center gap-1 rounded-8 border border-border-subtlest-tertiary px-2 py-1 text-text-tertiary transition-colors hover:bg-surface-hover hover:text-text-secondary"
            aria-label="Connect AI feed"
          >
            <LinkIcon size={IconSize.XSmall} />
            <span className="text-[10px] font-semibold uppercase tracking-wide">
              Connect
            </span>
          </button>
        </div>
      </div>
      <div className="mx-auto mt-1.5 flex max-w-4xl items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="opacity-75 absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-cabbage-default" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-cabbage-default" />
          </span>
          <span className="font-mono text-[10px] uppercase tracking-wider text-text-secondary">
            Live &bull; 6.2k Sources
          </span>
        </div>
        <div className="font-mono text-[10px] text-text-quaternary">
          Updated 1m
        </div>
      </div>
    </div>
  );
};

// --- TOMER FEED CARD (SignalCard) ---

const SignalCard = ({
  item,
  showJustIn = false,
  isClickable = true,
  showActions = true,
}: {
  item: FeedItem;
  showJustIn?: boolean;
  isClickable?: boolean;
  showActions?: boolean;
}): ReactElement => {
  const router = useRouter();
  const detailUrl = `/ai-coding-hub/${item.id}`;
  const isViral = isViralFeedItem(item);

  const cardContent = (
    <div className="flex flex-col gap-1 px-4 py-3 text-left">
      <div
        className="flex items-center gap-1 text-text-quaternary"
        style={{ fontSize: '15px' }}
      >
        {showJustIn && (
          <span className="rounded-4 bg-white px-1.5 py-0.5 text-[10px] font-bold uppercase leading-none text-black">
            Just in
          </span>
        )}
        {isViral && (
          <>
            <span className="viral-gradient-badge rounded-4 px-1.5 py-0.5 text-[10px] font-bold uppercase leading-none text-text-primary">
              Viral
            </span>
            <span>&middot;</span>
          </>
        )}
        <span>{categoryLabels[item.category]}</span>
        <span>{getMentionsLabel(item)}</span>
        <span>&middot;</span>
        <span>{relativeTimeLabels[item.id] || getRelativeTime(item.date)}</span>
      </div>

      <p
        className="line-clamp-2 font-bold leading-snug"
        style={{ fontSize: '15px', color: '#EAEAEA' }}
      >
        {item.headline}
      </p>

      {item.summary && (
        <p
          className="leading-normal"
          style={{ fontSize: '15px', lineHeight: '20px', color: '#EAEAEA' }}
        >
          {item.summary}
        </p>
      )}

      {showActions && (
        <div className="mt-2 flex items-center justify-between text-text-quaternary">
          <button
            type="button"
            className="flex items-center gap-1 transition-colors hover:text-text-secondary"
            onClick={(e) => e.stopPropagation()}
          >
            <UpvoteIcon size={IconSize.XSmall} />
            {item.upvotes > 0 && (
              <span className="text-xs">{item.upvotes}</span>
            )}
          </button>
          <button
            type="button"
            className="flex items-center gap-1 transition-colors hover:text-text-secondary"
            onClick={(e) => e.stopPropagation()}
          >
            <DiscussIcon size={IconSize.XSmall} />
            {item.comments > 0 && (
              <span className="text-xs">{item.comments}</span>
            )}
          </button>
          <button
            type="button"
            className="flex items-center gap-1 transition-colors hover:text-text-secondary"
            onClick={(e) => e.stopPropagation()}
          >
            <BookmarkIcon size={IconSize.XSmall} />
          </button>
          <button
            type="button"
            className="flex items-center gap-1 transition-colors hover:text-text-secondary"
            onClick={(e) => e.stopPropagation()}
          >
            <ShareIcon size={IconSize.XSmall} />
          </button>
        </div>
      )}
    </div>
  );

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div
      className={classNames(
        'group border-b border-border-subtlest-quaternary bg-background-default transition-all hover:bg-surface-hover',
        isClickable && 'cursor-pointer',
      )}
      onClick={isClickable ? () => router.push(detailUrl) : undefined}
    >
      {cardContent}
    </div>
  );
};

// --- TSAHI INTERLEAVED CARDS ---

const SignalContextCard = ({ item }: { item: FeedItem }) => (
  <div className="bg-accent-onion-subtlest/10 relative border-b border-border-subtlest-tertiary px-3 py-2">
    <div className="mx-auto flex max-w-4xl items-start gap-2">
      <div className="flex h-5 w-5 shrink-0 items-center justify-center text-accent-onion-default">
        <InfoIcon size={IconSize.Small} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-0.5 flex items-center gap-2">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-accent-onion-default">
            Context &bull; {getPrimaryModelLabel(item)}
          </span>
        </div>
        <p
          className="line-clamp-2 leading-normal"
          style={{ fontSize: '15px', lineHeight: '20px' }}
        >
          {item.summary}
        </p>
      </div>
    </div>
  </div>
);

const TopicAnalysisCard = ({ item }: { item: FeedItem }) => {
  const impactScore = useMemo(() => getImpactScore(item.id), [item.id]);

  return (
    <div className="from-accent-cabbage-subtlest/5 group relative border-b border-border-subtlest-tertiary bg-gradient-to-r via-transparent to-transparent px-3 py-3">
      <div className="mx-auto flex max-w-4xl gap-3">
        <div className="flex flex-col items-center pt-0.5">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-10 border border-border-subtlest-tertiary bg-transparent text-accent-cabbage-default">
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

          {item.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="flex h-6 items-center justify-center rounded-8 border border-border-subtlest-tertiary px-2 text-text-quaternary typo-footnote"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- FEED COMPOSER ---

const FeedComposer = ({
  items,
  breakingItems,
}: {
  items: FeedItem[];
  breakingItems: FeedItem[];
}) => {
  const breakingIds = new Set(breakingItems.map((b) => b.id));
  const remaining = items.filter((i) => !breakingIds.has(i.id));
  const feedComponents: ReactElement[] = [];

  remaining.forEach((item, index) => {
    const isTopicCard = (index + 1) % 5 === 0;
    const isContextCard = (index + 1) % 3 === 0 && !isTopicCard;

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
        <SignalCard key={item.id} item={item} showJustIn={index === 0} />,
      );
    }
  });

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-16">
        <Typography color={TypographyColor.Quaternary}>
          No signals in this category yet
        </Typography>
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

// --- CONSTANTS ---

const SWIPE_THRESHOLD = 50;
const PULL_THRESHOLD = 60;
const SCROLL_DIRECTION_THRESHOLD = 2;
const allItems = feedItems;

// --- MAIN PAGE ---

function AiCodingHubContent(): ReactElement {
  const { windowLoaded } = useContext(ProgressiveEnhancementContext);
  const isMobile = useViewSize(ViewSize.MobileL);
  const showNav = windowLoaded && isMobile;

  // Model tabs
  const modelFeedData = useMemo(() => getModelFeedData(allItems), []);
  const [activeModelId, setActiveModelId] = useState<string>('all');
  const [activeFeedView, setActiveFeedView] = useState<'main' | 'community'>(
    'main',
  );
  const feedStartRef = useRef<HTMLDivElement>(null);
  const feedAreaRef = useRef<HTMLDivElement>(null);

  // Interaction state (Tomer)
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [emojiParticles, setEmojiParticles] = useState<EmojiParticle[]>([]);
  const [showFlash, setShowFlash] = useState(false);
  const [logoGlow, setLogoGlow] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  const [showNewPostsBar, setShowNewPostsBar] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(
    null,
  );
  const lastScrollY = useRef(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const touchStartY = useRef(0);
  const isPulling = useRef(false);
  const emojiIdCounter = useRef(0);
  const lastEmojiSpawn = useRef(0);
  const pullStartTime = useRef(0);
  const pullCommitted = useRef(false);

  // Compute model tab index for swipe navigation
  const allModelIds = useMemo(
    () => ['all', ...modelFeedData.stats.map((s) => s.id)],
    [modelFeedData.stats],
  );
  const activeModelIndex = allModelIds.indexOf(activeModelId);

  const switchModelTab = useCallback(
    (direction: 'left' | 'right') => {
      const nextIndex =
        direction === 'left'
          ? Math.min(activeModelIndex + 1, allModelIds.length - 1)
          : Math.max(activeModelIndex - 1, 0);

      if (nextIndex === activeModelIndex) {
        return;
      }

      setSlideDirection(direction);
      setTimeout(() => {
        setActiveModelId(allModelIds[nextIndex]);
        setSlideDirection(null);
      }, 200);
    },
    [activeModelIndex, allModelIds],
  );

  const spawnEmoji = useCallback(() => {
    const emojis = modelEmojis[activeModelId] || modelEmojis.all;
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];
    const angle = Math.random() * Math.PI * 2;
    const radius = 120 + Math.random() * 100;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    emojiIdCounter.current += 1;
    const particle: EmojiParticle = {
      id: emojiIdCounter.current,
      emoji,
      x,
      y,
    };

    setEmojiParticles((prev) => [...prev, particle]);
    setTimeout(() => {
      setEmojiParticles((prev) => prev.filter((p) => p.id !== particle.id));
    }, 1000);
  }, [activeModelId]);

  const scrollToTop = useCallback(() => {
    setHeaderVisible(true);
    setShowNewPostsBar(false);
    feedStartRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }, []);

  // Pull-to-refresh (window-level, only at top of page)
  useEffect(() => {
    const onPullStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
      if (window.scrollY === 0 && !isRefreshing) {
        isPulling.current = true;
        pullCommitted.current = false;
        pullStartTime.current = Date.now();
      }
    };

    const onPullMove = (e: TouchEvent) => {
      if (!isPulling.current || isRefreshing) {
        return;
      }

      const deltaY = e.touches[0].clientY - touchStartY.current;

      if (!pullCommitted.current) {
        if (deltaY > 15 && window.scrollY === 0) {
          pullCommitted.current = true;
        } else {
          return;
        }
      }

      if (deltaY > 0 && window.scrollY === 0) {
        const dist = Math.min((deltaY - 15) * 0.4, 120);
        setPullDistance(Math.max(0, dist));

        const now = Date.now();
        const elapsed = now - pullStartTime.current;
        if (elapsed > 800) {
          const spawnInterval = Math.max(60, 300 - dist * 2);
          if (now - lastEmojiSpawn.current > spawnInterval) {
            lastEmojiSpawn.current = now;
            spawnEmoji();
          }
        }
      }
    };

    const onPullEnd = () => {
      if (pullDistance >= PULL_THRESHOLD && !isRefreshing) {
        setIsRefreshing(true);
        setPullDistance(PULL_THRESHOLD);
        setTimeout(() => {
          setIsRefreshing(false);
          setPullDistance(0);
          setEmojiParticles([]);
          setShowFlash(true);
          setLogoGlow(true);
          setTimeout(() => setShowFlash(false), 400);
          setTimeout(() => setLogoGlow(false), 800);
        }, 1000);
      } else {
        setPullDistance(0);
        setEmojiParticles([]);
      }
      isPulling.current = false;
    };

    window.addEventListener('touchstart', onPullStart, { passive: true });
    window.addEventListener('touchmove', onPullMove, { passive: true });
    window.addEventListener('touchend', onPullEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', onPullStart);
      window.removeEventListener('touchmove', onPullMove);
      window.removeEventListener('touchend', onPullEnd);
    };
  }, [isRefreshing, spawnEmoji, pullDistance]);

  // Swipe gesture for tab navigation (feed area only)
  useEffect(() => {
    const feedArea = feedAreaRef.current;
    if (!feedArea) {
      return undefined;
    }

    const onSwipeStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
      touchEndX.current = e.touches[0].clientX;
    };

    const onSwipeMove = (e: TouchEvent) => {
      touchEndX.current = e.touches[0].clientX;
    };

    const onSwipeEnd = () => {
      const diffX = touchStartX.current - touchEndX.current;
      if (Math.abs(diffX) >= SWIPE_THRESHOLD) {
        switchModelTab(diffX > 0 ? 'left' : 'right');
      }
    };

    feedArea.addEventListener('touchstart', onSwipeStart, { passive: true });
    feedArea.addEventListener('touchmove', onSwipeMove, { passive: true });
    feedArea.addEventListener('touchend', onSwipeEnd, { passive: true });

    return () => {
      feedArea.removeEventListener('touchstart', onSwipeStart);
      feedArea.removeEventListener('touchmove', onSwipeMove);
      feedArea.removeEventListener('touchend', onSwipeEnd);
    };
  }, [switchModelTab]);

  // Header auto-hide on scroll
  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY;
      const deltaY = currentY - lastScrollY.current;

      if (currentY < 120) {
        setShowNewPostsBar(false);
      } else if (deltaY > SCROLL_DIRECTION_THRESHOLD) {
        setShowNewPostsBar(true);
      }

      if (Math.abs(deltaY) < SCROLL_DIRECTION_THRESHOLD) {
        return;
      }

      if (deltaY < 0) {
        setHeaderVisible(true);
        lastScrollY.current = currentY;
        return;
      }

      if (currentY > 50) {
        setHeaderVisible(false);
        lastScrollY.current = currentY;
        return;
      }

      setHeaderVisible(true);
      lastScrollY.current = currentY;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Disable native overscroll
  useEffect(() => {
    const html = document.documentElement;
    const { body } = document;
    html.style.overscrollBehavior = 'none';
    body.style.overscrollBehavior = 'none';

    return () => {
      html.style.overscrollBehavior = '';
      body.style.overscrollBehavior = '';
    };
  }, []);

  // Hide scrollbar
  useEffect(() => {
    const html = document.documentElement;
    const { body } = document;
    const pageClass = 'ai-hub-hide-scrollbar';
    const style = document.createElement('style');
    style.setAttribute('data-ai-hub-hide-scrollbar', 'true');
    style.textContent = `
      html.${pageClass},
      body.${pageClass} {
        scrollbar-width: none;
        -ms-overflow-style: none;
      }
      html.${pageClass}::-webkit-scrollbar,
      body.${pageClass}::-webkit-scrollbar {
        display: none;
        width: 0;
        height: 0;
      }
    `;
    html.classList.add(pageClass);
    body.classList.add(pageClass);
    document.head.append(style);

    return () => {
      html.classList.remove(pageClass);
      body.classList.remove(pageClass);
      style.remove();
    };
  }, []);

  // Hide feedback widget
  useEffect(() => {
    const style = document.createElement('style');
    style.setAttribute('data-ai-hub-hide-qd-widget', 'true');
    style.textContent = `
      .t.qd-parent-container,
      .qd-parent-container,
      .t.qd-transition-container,
      .t.qd-open-btn-container {
        display: none !important;
        visibility: hidden !important;
        pointer-events: none !important;
      }
    `;
    document.head.append(style);
    return () => {
      style.remove();
    };
  }, []);

  // Computed feed data
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
      className={`relative min-h-page w-full max-w-full ${THEME.bg} font-sans text-text-primary`}
    >
      <NextSeo
        title="AI Coding Hub // daily.dev"
        description="Real-time updates on AI coding tools and models."
      />
      <style>
        {`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          @keyframes voiceWave {
            0%, 100% { transform: scaleY(0.35); opacity: 0.55; }
            50% { transform: scaleY(1); opacity: 1; }
          }
          .animate-marquee {
            animation: marquee 48s linear infinite;
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

      {/* Header block - not sticky on any breakpoint */}
      <div className="isolate z-[74] mx-auto w-full max-w-4xl bg-background-default laptop:border-x laptop:border-border-subtlest-tertiary">
        <CompactHeader logoGlow={logoGlow} />

        {showFlash && (
          <div className="tab-glow-explosion pointer-events-none absolute bottom-0 left-0 right-0 h-8" />
        )}
      </div>

      <div className="mx-auto max-w-4xl laptop:border-x laptop:border-border-subtlest-tertiary">
        {/* Black hole pull-to-refresh */}
        <div
          className="relative z-0 flex items-center justify-center overflow-visible transition-all duration-200"
          style={{ height: pullDistance > 0 ? `${pullDistance}px` : 0 }}
        >
          <div
            className={classNames(
              'relative rounded-full bg-black',
              isRefreshing && 'blackhole-core',
            )}
            style={{
              width: `${Math.max(12, Math.min(pullDistance * 0.35, 36))}px`,
              height: `${Math.max(12, Math.min(pullDistance * 0.35, 36))}px`,
              opacity: Math.min(pullDistance / PULL_THRESHOLD, 1),
              boxShadow: `0 0 ${Math.min(pullDistance * 0.2, 16)}px ${Math.min(
                pullDistance * 0.1,
                6,
              )}px rgba(255,255,255,0.2), inset 0 0 ${Math.min(
                pullDistance * 0.1,
                8,
              )}px rgba(255,255,255,0.1)`,
              transition: isRefreshing ? 'all 0.3s ease' : 'none',
            }}
          />
          {emojiParticles.map((p) => (
            <span
              key={p.id}
              className="emoji-particle"
              style={
                {
                  '--start-x': `${p.x}px`,
                  '--start-y': `${p.y}px`,
                  fontSize: '28px',
                  left: '50%',
                  top: '50%',
                  marginLeft: '-14px',
                  marginTop: '-14px',
                } as React.CSSProperties
              }
            >
              {p.emoji}
            </span>
          ))}
        </div>

        {/* Flash on refresh complete */}
        {showFlash && (
          <div className="refresh-flash-overlay from-white/30 pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-b to-transparent" />
        )}

        {activeFeedView === 'community' ? (
          <CommunityWireFeed
            items={communityWireItems}
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
            <BreakingNewsCarousel items={scopedBreakingItems} />
            <CommunityWirePreview
              items={communityWireItems}
              onOpenFeed={() => {
                setActiveFeedView('community');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
            <WidgetComparisonMonitor />

            {/* Feed zone: swipe gestures only affect this area */}
            <div ref={feedAreaRef}>
              {/* Model chip rail - sticks above footer initially, then sticks to top when pushed there */}
              <div
                ref={feedStartRef}
                className="z-[75] sticky top-0 bg-background-default"
                style={{
                  bottom: showNav
                    ? 'calc(4rem + env(safe-area-inset-bottom, 0px))'
                    : '0px',
                }}
              >
                <ModelChipRail
                  stats={modelFeedData.stats}
                  activeModelId={activeModelId}
                  onSelect={handleModelSelect}
                />
              </div>

              {/* "New posts" button below tab bar */}
              {showNewPostsBar && !headerVisible && (
                <div className="flex justify-center py-2">
                  <button
                    type="button"
                    className="z-[21] rounded-8 bg-accent-cabbage-default px-3 py-1.5 text-sm font-bold text-text-primary shadow-2 transition-all hover:bg-accent-cabbage-default"
                    onClick={scrollToTop}
                  >
                    2 new posts &uarr;
                  </button>
                </div>
              )}

              <LivePodcastStrip />

              {/* Feed area with slide transition */}
              <div
                className={classNames(
                  'relative z-0 flex min-h-screen flex-col transition-all duration-200',
                  slideDirection === 'left' && '-translate-x-4 opacity-0',
                  slideDirection === 'right' && 'translate-x-4 opacity-0',
                  !slideDirection && 'translate-x-0 opacity-100',
                )}
              >
                <FeedComposer
                  items={scopedItems}
                  breakingItems={scopedBreakingItems}
                />
              </div>
            </div>
          </>
        )}

        {/* Footer */}
        <div className="border-t border-border-subtlest-tertiary px-4 py-4">
          <Typography
            type={TypographyType.Caption2}
            color={TypographyColor.Quaternary}
          >
            Curated from Twitter, GitHub, and the dev community. Updated daily.
          </Typography>
        </div>
      </div>

      {/* Bottom spacer for footer navbar */}
      {showNav && <div className="h-16" />}

      {/* Mobile bottom navbar - always visible */}
      {showNav && (
        <div className="z-30 fixed bottom-0 left-0 w-full bg-gradient-to-t from-background-subtle from-70% to-transparent px-2 pt-2">
          <MobileFooterNavbar />
        </div>
      )}
    </div>
  );
}

const AiCodingHubPage = (): ReactElement => <AiCodingHubContent />;

AiCodingHubPage.getLayout = getLayout;
AiCodingHubPage.layoutProps = {
  screenCentered: false,
  forceDesktopHeaderOnMobile: true,
};

export default AiCodingHubPage;
