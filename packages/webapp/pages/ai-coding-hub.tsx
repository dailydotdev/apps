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
  TerminalIcon,
  TwitterIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import { getLayout } from '../components/layouts/NoSidebarLayout';
import {
  feedItems,
  categoryLabels,
  getRelativeDate,
  getBreakingItems,
  getMilestoneItems,
  getTrendingTools,
} from '../data/aiCodingHubData';
import type { FeedItem, Category } from '../data/aiCodingHubData';

const SignalCard = ({ item }: { item: FeedItem }): ReactElement => {
  const tweetUrl = `https://twitter.com/i/web/status/${item.source_tweet_id}`;
  const detailUrl = `/ai-coding-hub/${item.id}`;

  return (
    <article className="group flex flex-col gap-3 border-b border-border-subtlest-tertiary bg-background-default px-4 py-4 transition-all hover:bg-surface-hover">
      <div className="flex items-center gap-2 text-xs">
        <span
          className={classNames(
            'rounded-4 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
            item.category === 'leak' && 'bg-accent-onion-default text-white',
            item.category === 'milestone' &&
              'bg-accent-cabbage-default text-white',
            item.category === 'release' && 'bg-accent-water-default text-white',
            item.category === 'hot_take' &&
              'bg-accent-bacon-default text-white',
            item.category === 'thread' && 'bg-accent-bun-default text-white',
            item.category === 'feature' &&
              'bg-accent-blueCheese-default text-white',
            item.category === 'endorsement' &&
              'bg-accent-avocado-default text-white',
            item.category === 'announcement' &&
              'bg-accent-cheese-default text-raw-pepper-90',
            item.category === 'drama' && 'bg-accent-ketchup-default text-white',
            item.category === 'insight' && 'bg-accent-salt-default text-white',
            item.category === 'data' && 'bg-accent-lettuce-default text-white',
            item.category === 'product_launch' &&
              'bg-accent-burger-default text-white',
            item.category === 'tips' && 'bg-accent-cabbage-default text-white',
            item.category === 'standard' && 'bg-accent-bun-default text-white',
            item.category === 'commentary' &&
              'bg-accent-salt-default text-white',
          )}
        >
          {categoryLabels[item.category]}
        </span>
        <span className="ml-auto text-text-quaternary">
          {getRelativeDate(item.date)}
        </span>
      </div>

      <Link href={detailUrl} passHref>
        <a className="block">
          <Typography
            type={TypographyType.Body}
            bold
            className="line-clamp-2 leading-snug transition-colors group-hover:text-accent-cabbage-default"
          >
            {item.headline}
          </Typography>
        </a>
      </Link>

      {item.summary && (
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Secondary}
          className="line-clamp-3 leading-relaxed"
        >
          {item.summary}
        </Typography>
      )}

      <div className="flex items-center justify-between">
        <ul className="flex flex-wrap gap-1.5" aria-label="Tags">
          {item.tags.slice(0, 3).map((tag) => (
            <li
              key={tag}
              className="list-none rounded-4 border border-border-subtlest-tertiary bg-transparent px-2 py-0.5 text-xs text-text-secondary"
            >
              #{tag.replace(/_/g, '')}
            </li>
          ))}
        </ul>
        <a
          href={tweetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-text-quaternary transition-colors hover:text-text-secondary"
        >
          <TwitterIcon size={IconSize.XXSmall} />
          <span>source</span>
        </a>
      </div>
    </article>
  );
};

type StatusSignal = {
  icon: string;
  label: string;
  text: string;
  priority: number;
};

const getSignalIcon = (category: Category): string => {
  if (category === 'drama') {
    return '🚨';
  }
  if (category === 'leak') {
    return '🔍';
  }
  return '🌶️';
};

const SmartStatusBar = (): ReactElement | null => {
  const signals = useMemo((): StatusSignal[] => {
    const result: StatusSignal[] = [];

    const breaking = getBreakingItems(feedItems);
    breaking.forEach((item) => {
      result.push({
        icon: getSignalIcon(item.category),
        label: categoryLabels[item.category],
        text: item.headline,
        priority: 1,
      });
    });

    const milestones = getMilestoneItems(feedItems);
    milestones.slice(0, 2).forEach((item) => {
      result.push({
        icon: '📈',
        label: 'MILESTONE',
        text: item.headline,
        priority: 2,
      });
    });

    const trending = getTrendingTools(feedItems);
    if (trending.length > 0) {
      const top = trending[0];
      result.push({
        icon: '🔥',
        label: 'TRENDING',
        text: `${top.name.replace(/_/g, ' ')} (${top.count} mentions)`,
        priority: 3,
      });
    }

    return result.sort((a, b) => a.priority - b.priority);
  }, []);

  if (signals.length === 0) {
    return null;
  }

  const renderSignal = (signal: StatusSignal, prefix: string) => (
    <span
      key={`${prefix}-${signal.text}`}
      className="inline-flex items-center gap-1.5"
    >
      <span>{signal.icon}</span>
      <span className="font-bold text-accent-cheese-default">
        {signal.text}
      </span>
      <span className="mx-6 text-text-quaternary">•</span>
    </span>
  );

  return (
    <div className="relative w-full overflow-hidden">
      <style>
        {`
          @keyframes ticker {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}
      </style>
      <div
        className="inline-flex whitespace-nowrap"
        style={{ animation: 'ticker 30s linear infinite' }}
      >
        {signals.map((signal) => renderSignal(signal, 'a'))}
        {signals.map((signal) => renderSignal(signal, 'b'))}
      </div>
    </div>
  );
};

type FilterCategory =
  | 'ALL'
  | 'product_launch'
  | 'feature'
  | 'tips'
  | 'announcement'
  | 'drama'
  | 'hot_take';

const AiCodingHubPage = (): ReactElement => {
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('ALL');

  const filteredFeedItems = useMemo(() => {
    if (activeCategory === 'ALL') {
      return feedItems;
    }
    return feedItems.filter((item) => item.category === activeCategory);
  }, [activeCategory]);

  const todayCount = useMemo(
    () =>
      feedItems.filter((item) => getRelativeDate(item.date) === 'today').length,
    [],
  );

  return (
    <div className="relative min-h-page w-full max-w-full overflow-x-hidden bg-background-default">
      <NextSeo
        title="AI Pulse // daily.dev"
        description="Don't fall behind. The AI coding signals that matter."
      />

      {/* Header */}
      <header className="z-20 bg-background-default/95 sticky top-0 border-b border-border-subtlest-tertiary backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
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
                  {todayCount} new
                </span>
              </div>
              <Typography
                type={TypographyType.Caption2}
                color={TypographyColor.Quaternary}
              >
                Don&apos;t fall behind
              </Typography>
            </div>
          </div>
        </div>
      </header>

      {/* Smart Status Bar */}
      <div className="border-b border-border-subtlest-tertiary bg-surface-float">
        <div className="mx-auto max-w-4xl overflow-hidden px-4 py-2 text-xs">
          <SmartStatusBar />
        </div>
      </div>

      <div className="mx-auto max-w-4xl">
        {/* Category Filters */}
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto border-b border-border-subtlest-tertiary px-4 py-2">
          <Button
            variant={
              activeCategory === 'ALL'
                ? ButtonVariant.Subtle
                : ButtonVariant.Tertiary
            }
            size={ButtonSize.XSmall}
            onClick={() => setActiveCategory('ALL')}
            className="flex-shrink-0"
          >
            All
          </Button>
          <Button
            variant={
              activeCategory === 'product_launch'
                ? ButtonVariant.Subtle
                : ButtonVariant.Tertiary
            }
            size={ButtonSize.XSmall}
            onClick={() => setActiveCategory('product_launch')}
            className="flex-shrink-0"
          >
            Launches
          </Button>
          <Button
            variant={
              activeCategory === 'feature'
                ? ButtonVariant.Subtle
                : ButtonVariant.Tertiary
            }
            size={ButtonSize.XSmall}
            onClick={() => setActiveCategory('feature')}
            className="flex-shrink-0"
          >
            Features
          </Button>
          <Button
            variant={
              activeCategory === 'tips'
                ? ButtonVariant.Subtle
                : ButtonVariant.Tertiary
            }
            size={ButtonSize.XSmall}
            onClick={() => setActiveCategory('tips')}
            className="flex-shrink-0"
          >
            Tips
          </Button>
          <Button
            variant={
              activeCategory === 'announcement'
                ? ButtonVariant.Subtle
                : ButtonVariant.Tertiary
            }
            size={ButtonSize.XSmall}
            onClick={() => setActiveCategory('announcement')}
            className="flex-shrink-0"
          >
            News
          </Button>
          <Button
            variant={
              activeCategory === 'drama'
                ? ButtonVariant.Subtle
                : ButtonVariant.Tertiary
            }
            size={ButtonSize.XSmall}
            onClick={() => setActiveCategory('drama')}
            className="flex-shrink-0"
          >
            Drama
          </Button>
          <Button
            variant={
              activeCategory === 'hot_take'
                ? ButtonVariant.Subtle
                : ButtonVariant.Tertiary
            }
            size={ButtonSize.XSmall}
            onClick={() => setActiveCategory('hot_take')}
            className="flex-shrink-0"
          >
            Hot Takes
          </Button>
        </div>

        {/* Feed */}
        <div className="flex flex-col">
          {filteredFeedItems.length > 0 ? (
            filteredFeedItems.map((item) => (
              <SignalCard key={item.id} item={item} />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 py-16">
              <Typography color={TypographyColor.Quaternary}>
                No signals in this category yet
              </Typography>
            </div>
          )}
        </div>

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
    </div>
  );
};

AiCodingHubPage.getLayout = getLayout;
AiCodingHubPage.layoutProps = { screenCentered: false, hideBackButton: true };

export default AiCodingHubPage;
