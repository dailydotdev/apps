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
            item.category === 'mindset_shift' &&
              'bg-accent-onion-subtle text-accent-onion-default',
            item.category === 'tips' &&
              'bg-accent-cabbage-subtle text-accent-cabbage-default',
            item.category === 'product_launch' &&
              'bg-accent-water-subtle text-accent-water-default',
            item.category === 'workflow' &&
              'bg-accent-bun-subtle text-accent-bun-default',
            item.category === 'announcement' &&
              'bg-accent-cheese-subtle text-accent-cheese-default',
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

      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Secondary}
        className="line-clamp-3 leading-relaxed"
      >
        {item.summary}
      </Typography>

      {/* WHY IT MATTERS - The FOMO hook */}
      <div className="border-accent-cabbage-default/30 bg-accent-cabbage-subtle/50 mt-1 rounded-8 border px-3 py-2">
        <div className="flex items-start gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-accent-cabbage-default">
            Why it matters
          </span>
        </div>
        <Typography
          type={TypographyType.Caption1}
          className="mt-1 font-medium text-text-primary"
        >
          {item.why_it_matters}
        </Typography>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1.5">
          {item.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-4 bg-surface-float px-2 py-0.5 text-[10px] text-text-tertiary"
            >
              #{tag.replace(/_/g, '')}
            </span>
          ))}
        </div>
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

const AiCodingHubPage = (): ReactElement => {
  const [activeCategory, setActiveCategory] = useState<Category | 'ALL'>('ALL');

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

      {/* Quick Stats */}
      <div className="border-b border-border-subtlest-tertiary bg-surface-float">
        <div className="no-scrollbar mx-auto flex max-w-4xl items-center gap-4 overflow-x-auto px-4 py-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-text-quaternary">SIGNALS</span>
            <span className="font-bold text-text-primary">
              {feedItems.length}
            </span>
          </div>
          <span className="text-border-subtlest-tertiary">│</span>
          <div className="flex items-center gap-2">
            <span className="text-text-quaternary">TODAY</span>
            <span className="font-bold text-status-success">{todayCount}</span>
          </div>
          <span className="text-border-subtlest-tertiary">│</span>
          <div className="flex items-center gap-2">
            <span className="text-text-quaternary">FOCUS</span>
            <span className="font-bold text-accent-cheese-default">
              Agentic workflows
            </span>
          </div>
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
              activeCategory === 'tips'
                ? ButtonVariant.Subtle
                : ButtonVariant.Tertiary
            }
            size={ButtonSize.XSmall}
            onClick={() => setActiveCategory('tips')}
            className="flex-shrink-0"
          >
            Quick Wins
          </Button>
          <Button
            variant={
              activeCategory === 'workflow'
                ? ButtonVariant.Subtle
                : ButtonVariant.Tertiary
            }
            size={ButtonSize.XSmall}
            onClick={() => setActiveCategory('workflow')}
            className="flex-shrink-0"
          >
            Workflows
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
              activeCategory === 'mindset_shift'
                ? ButtonVariant.Subtle
                : ButtonVariant.Tertiary
            }
            size={ButtonSize.XSmall}
            onClick={() => setActiveCategory('mindset_shift')}
            className="flex-shrink-0"
          >
            Mindset
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
