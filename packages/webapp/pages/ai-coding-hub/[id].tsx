import type { ReactElement } from 'react';
import React, { useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { NextSeo } from 'next-seo';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  ArrowIcon,
  TwitterIcon,
  UpvoteIcon,
  DiscussIcon,
  BookmarkIcon,
  ShareIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import { getLayout } from '../../components/layouts/NoSidebarLayout';
import {
  feedItems,
  categoryLabels,
  getMentionsLabel,
  isViralFeedItem,
} from '../../data/aiCodingHubData';
import type { FeedItem } from '../../data/aiCodingHubData';

const normalizeTag = (tag: string): string => tag.replace(/_/g, '');

const SourceTweetCard = ({
  item,
  tweetId,
  index,
}: {
  item: FeedItem;
  tweetId: string;
  index: number;
}): ReactElement => {
  const label = index === 0 ? 'Original' : `Mention ${index}`;
  const link = `https://twitter.com/i/web/status/${tweetId}`;
  const sourceHandle = `@${item.author_username}`;
  const sourceName = item.author_name;
  const avatarUrl = item.author_avatar_url;

  return (
    <article className="rounded-12 bg-surface-float px-3 py-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img
            src={avatarUrl}
            alt={`${sourceName} profile`}
            className="h-8 w-8 rounded-full bg-background-default"
          />
          <div className="leading-tight">
            <p className="font-bold text-text-primary" style={{ fontSize: '15px' }}>
              {sourceName}
            </p>
            <p className="text-xs text-text-quaternary">{sourceHandle}</p>
          </div>
        </div>
        <span className="rounded-4 bg-background-default px-1.5 py-0.5 text-[10px] font-bold uppercase leading-none text-text-tertiary">
          {label}
        </span>
      </div>

      <p className="font-bold leading-snug text-text-primary" style={{ fontSize: '15px' }}>
        {item.headline}
      </p>

      <p className="mt-2 leading-normal text-text-secondary" style={{ fontSize: '15px', lineHeight: '20px' }}>
        {item.summary}
      </p>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex flex-wrap items-center gap-1 text-text-quaternary" style={{ fontSize: '15px' }}>
          {item.tags.slice(0, 2).map((tag) => (
            <span key={`${tweetId}-${tag}`} className="rounded-4 bg-background-default px-1.5 py-0.5 text-[10px] font-bold uppercase leading-none text-text-tertiary">
              #{normalizeTag(tag)}
            </span>
          ))}
        </div>
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[15px] text-text-quaternary transition-colors hover:text-text-secondary"
        >
          <span>Open on</span>
          <TwitterIcon size={IconSize.XXSmall} />
        </a>
      </div>
    </article>
  );
};

const FeedSignalCard = ({
  item,
  isClickable = true,
  showActions = true,
}: {
  item: FeedItem;
  isClickable?: boolean;
  showActions?: boolean;
}): ReactElement => {
  const router = useRouter();
  const detailUrl = `/ai-coding-hub/${item.id}`;
  const isViral = isViralFeedItem(item);

  return (
    <article
      className={classNames(
        'group border-b border-border-subtlest-quaternary bg-background-default transition-all hover:bg-surface-hover',
        isClickable && 'cursor-pointer',
      )}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={isClickable ? () => router.push(detailUrl) : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              router.push(detailUrl);
            }
          }
          : undefined
      }
    >
      <div className="flex flex-col gap-1 px-8 py-3">
        <div
          className="flex items-center gap-1 text-text-quaternary"
          style={{ fontSize: '15px' }}
        >
          {isViral && (
            <>
              <span className="rounded-4 bg-accent-bacon-default px-1.5 py-0.5 text-[10px] font-bold uppercase leading-none text-text-primary">
                Viral
              </span>
              <span>·</span>
            </>
          )}
          <span>{categoryLabels[item.category]}</span>
          <span>·</span>
          <span className="inline-flex items-center gap-1">
            <span>{`${getMentionsLabel(item)} on`}</span>
            <TwitterIcon size={IconSize.XXSmall} />
          </span>
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
          <div className="flex items-center justify-between text-text-quaternary">
            <button
              type="button"
              className="flex items-center gap-1 transition-colors hover:text-text-secondary"
              onClick={(e) => e.stopPropagation()}
            >
              <UpvoteIcon size={IconSize.XSmall} />
              {item.upvotes > 0 && <span className="text-xs">{item.upvotes}</span>}
            </button>
            <button
              type="button"
              className="flex items-center gap-1 transition-colors hover:text-text-secondary"
              onClick={(e) => e.stopPropagation()}
            >
              <DiscussIcon size={IconSize.XSmall} />
              {item.comments > 0 && <span className="text-xs">{item.comments}</span>}
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
    </article>
  );
};

const SignalDetailPage = (): ReactElement => {
  const router = useRouter();
  const { id } = router.query;

  const item = feedItems.find((feedItem) => feedItem.id === id) as
    | FeedItem
    | undefined;

  if (!item) {
    return (
      <div className="flex min-h-page w-full flex-col items-center justify-center bg-background-default">
        <Typography type={TypographyType.Title2} className="mb-4">
          Signal not found
        </Typography>
        <Link href="/ai-coding-hub" passHref>
          <a className="rounded-10 bg-surface-float px-4 py-2 text-sm font-bold text-text-primary transition-colors hover:bg-surface-hover">
            Back to Sentinel
          </a>
        </Link>
      </div>
    );
  }

  const tweetIds = [
    item.source_tweet_id,
    ...item.related_tweet_ids.filter(
      (relatedTweetId) => relatedTweetId !== item.source_tweet_id,
    ),
  ];
  const tweetsScrollerRef = useRef<HTMLDivElement>(null);
  const [activeTweetIndex, setActiveTweetIndex] = useState(0);

  const handleTweetsScroll = useCallback(() => {
    if (!tweetsScrollerRef.current) {
      return;
    }

    const { scrollLeft, clientWidth } = tweetsScrollerRef.current;
    const nextIndex = Math.round(scrollLeft / clientWidth);
    setActiveTweetIndex(Math.min(Math.max(nextIndex, 0), tweetIds.length - 1));
  }, [tweetIds.length]);

  const scrollToTweet = useCallback((index: number) => {
    if (!tweetsScrollerRef.current) {
      return;
    }

    tweetsScrollerRef.current.scrollTo({
      left: tweetsScrollerRef.current.clientWidth * index,
      behavior: 'smooth',
    });
    setActiveTweetIndex(index);
  }, []);

  const relatedFeedItems = feedItems
    .filter(
      (feedItem) =>
        feedItem.id !== item.id &&
        (feedItem.category === item.category ||
          feedItem.tags.some((tag) => item.tags.includes(tag))),
    )
    .slice(0, 6);

  return (
    <div className="relative mx-auto min-h-page w-full max-w-[540px] bg-background-default">
      <NextSeo
        title={`${item.headline} // Sentinel`}
        description={item.summary}
      />

      {/* Header */}
      <header className="sticky top-0 z-[80] border-b border-border-subtlest-tertiary bg-background-default backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <Link href="/ai-coding-hub" passHref>
            <a className="flex items-center gap-1 text-text-quaternary transition-colors hover:text-text-secondary">
              <ArrowIcon className="-rotate-90" size={IconSize.Small} />
              <span className="text-sm">Back</span>
            </a>
          </Link>
          <Typography type={TypographyType.Title3} bold>
            Sentinel
          </Typography>
          <div className="w-12" />
        </div>
      </header>

      <main className="mx-auto max-w-4xl">
        {/* Selected post in feed style */}
        <div className="mx-auto max-w-[540px] overflow-x-hidden">
          <FeedSignalCard item={item} isClickable={false} showActions={false} />
        </div>

        {/* Source tweets */}
        <div className="border-b border-border-subtlest-tertiary py-2 pl-8">
          <div
            ref={tweetsScrollerRef}
            className="no-scrollbar flex gap-6 snap-x snap-mandatory overflow-x-auto pl-14 pr-0"
            onScroll={handleTweetsScroll}
          >
            {tweetIds.map((tweetId, index) => (
              <div
                key={tweetId}
                className="w-full flex-shrink-0 snap-start rounded-12 bg-background-default p-0"
              >
                <SourceTweetCard
                  item={item}
                  tweetId={tweetId}
                  index={index}
                />
              </div>
            ))}
          </div>

          {tweetIds.length > 1 && (
            <div className="mt-2 flex items-center justify-center gap-1.5">
              {tweetIds.map((tweetId, index) => (
                <button
                  key={tweetId}
                  type="button"
                  aria-label={`Go to tweet ${index + 1}`}
                  className={classNames(
                    'h-2 w-2 rounded-full transition-colors',
                    activeTweetIndex === index
                      ? 'bg-text-primary'
                      : 'bg-border-subtlest-tertiary',
                  )}
                  onClick={() => scrollToTweet(index)}
                />
              ))}
            </div>
          )}

          <div className="mt-2 flex items-center justify-between pb-2 pr-8 pl-0 text-text-quaternary">
            <button
              type="button"
              className="flex items-center gap-1 transition-colors hover:text-text-secondary"
            >
              <UpvoteIcon size={IconSize.XSmall} />
              {item.upvotes > 0 && <span className="text-xs">{item.upvotes}</span>}
            </button>
            <button
              type="button"
              className="flex items-center gap-1 transition-colors hover:text-text-secondary"
            >
              <DiscussIcon size={IconSize.XSmall} />
              {item.comments > 0 && <span className="text-xs">{item.comments}</span>}
            </button>
            <button
              type="button"
              className="flex items-center gap-1 transition-colors hover:text-text-secondary"
            >
              <BookmarkIcon size={IconSize.XSmall} />
            </button>
            <button
              type="button"
              className="flex items-center gap-1 transition-colors hover:text-text-secondary"
            >
              <ShareIcon size={IconSize.XSmall} />
            </button>
          </div>
        </div>

        {/* Related posts */}
        <div className="mx-auto max-w-[540px]">
          <div className="border-b border-border-subtlest-tertiary px-4 py-3">
            <Typography type={TypographyType.Callout} bold>
              Related posts
            </Typography>
          </div>
          {relatedFeedItems.map((feedItem) => (
              <FeedSignalCard key={feedItem.id} item={feedItem} />
          ))}
          <div className="border-t border-border-subtlest-tertiary px-4 py-4">
            <Typography
              type={TypographyType.Caption2}
              color={TypographyColor.Quaternary}
            >
              Curated from Twitter, GitHub, and the dev community. Updated daily.
            </Typography>
          </div>
        </div>
      </main>
    </div>
  );
};

SignalDetailPage.getLayout = getLayout;
SignalDetailPage.layoutProps = { screenCentered: false, hideBackButton: true };

export default SignalDetailPage;
