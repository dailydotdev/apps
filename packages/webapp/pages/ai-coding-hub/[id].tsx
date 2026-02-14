import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
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
  TerminalIcon,
  TwitterIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import { getLayout } from '../../components/layouts/NoSidebarLayout';
import {
  feedItems,
  categoryLabels,
  getRelativeDate,
} from '../../data/aiCodingHubData';
import type { FeedItem } from '../../data/aiCodingHubData';

const TweetEmbed = ({ tweetId }: { tweetId: string }): ReactElement => {
  const containerRef = useRef<HTMLDivElement>(null);

  const renderTweet = useCallback(() => {
    const container = containerRef.current;
    if (!container || !window.twttr) {
      return;
    }

    container.innerHTML = '';
    window.twttr.widgets.createTweet(tweetId, container, { theme: 'dark' });
  }, [tweetId]);

  useEffect(() => {
    if (window.twttr) {
      renderTweet();
      return undefined;
    }

    const existingScript = document.querySelector(
      'script[src="https://platform.twitter.com/widgets.js"]',
    );
    if (existingScript) {
      existingScript.addEventListener('load', renderTweet);
      return () => existingScript.removeEventListener('load', renderTweet);
    }

    const script = document.createElement('script');
    script.src = 'https://platform.twitter.com/widgets.js';
    script.async = true;
    script.onload = renderTweet;
    document.body.appendChild(script);

    return undefined;
  }, [renderTweet]);

  return (
    <div className="flex justify-center">
      <div ref={containerRef}>
        <a
          href={`https://twitter.com/i/web/status/${tweetId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-text-quaternary text-sm"
        >
          Loading tweet...
        </a>
      </div>
    </div>
  );
};

declare global {
  interface Window {
    twttr?: {
      widgets: {
        load: () => void;
        createTweet: (
          id: string,
          el: HTMLElement,
          options?: Record<string, string>,
        ) => Promise<HTMLElement>;
      };
    };
  }
}

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
          <Button tag="a" variant={ButtonVariant.Primary}>
            Back to AI Pulse
          </Button>
        </Link>
      </div>
    );
  }

  const tweetUrl = `https://twitter.com/i/web/status/${item.source_tweet_id}`;

  return (
    <div className="relative min-h-page w-full max-w-full overflow-x-hidden bg-background-default">
      <NextSeo
        title={`${item.headline} // AI Pulse`}
        description={item.summary}
      />

      {/* Header */}
      <header className="z-20 bg-background-default/95 sticky top-0 border-b border-border-subtlest-tertiary backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3">
          <Link href="/ai-coding-hub" passHref>
            <Button
              tag="a"
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.Small}
              icon={<ArrowIcon className="rotate-180" size={IconSize.Small} />}
            >
              Back
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <TerminalIcon
              size={IconSize.Medium}
              className="text-accent-cabbage-default"
            />
            <Typography type={TypographyType.Body} bold>
              AI Pulse
            </Typography>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-4 py-6">
        {/* Category and Date */}
        <div className="mb-4 flex items-center gap-3">
          <span
            className={classNames(
              'rounded-4 px-2 py-0.5 text-xs font-bold uppercase tracking-wide',
              item.category === 'leak' && 'bg-accent-onion-default text-white',
              item.category === 'milestone' &&
                'bg-accent-avocado-default text-white',
              item.category === 'release' &&
                'bg-accent-water-default text-white',
              item.category === 'hot_take' &&
                'bg-accent-bacon-default text-white',
              item.category === 'thread' && 'bg-accent-bun-default text-white',
              item.category === 'feature' &&
                'bg-accent-blueCheese-default text-white',
              item.category === 'endorsement' &&
                'bg-accent-lettuce-default text-white',
              item.category === 'announcement' &&
                'bg-accent-cheese-default text-white',
              item.category === 'drama' &&
                'bg-accent-ketchup-default text-white',
              item.category === 'insight' &&
                'bg-accent-salt-default text-white',
              item.category === 'data' &&
                'bg-accent-lettuce-default text-white',
              item.category === 'product_launch' &&
                'bg-accent-water-default text-white',
              item.category === 'tips' &&
                'bg-accent-cabbage-default text-white',
              item.category === 'standard' &&
                'bg-accent-bun-default text-white',
              item.category === 'commentary' &&
                'bg-accent-pepper-default text-white',
            )}
          >
            {categoryLabels[item.category]}
          </span>
          <span className="text-sm text-text-quaternary">
            {getRelativeDate(item.date)}
          </span>
        </div>

        {/* Headline */}
        <Typography type={TypographyType.LargeTitle} bold className="mb-4">
          {item.headline}
        </Typography>

        {/* Summary */}
        <Typography
          type={TypographyType.Body}
          color={TypographyColor.Secondary}
          className="mb-6 leading-relaxed"
        >
          {item.summary}
        </Typography>

        {/* Tags */}
        <div className="mb-8 flex flex-wrap gap-2">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-8 bg-surface-float px-3 py-1 text-sm text-text-tertiary"
            >
              #{tag.replace(/_/g, '')}
            </span>
          ))}
        </div>

        {/* Tweet Section */}
        <div className="border-t border-border-subtlest-tertiary pt-6">
          <div className="mb-4 flex items-center justify-between">
            <Typography
              type={TypographyType.Title3}
              bold
              className="flex items-center gap-2"
            >
              <TwitterIcon
                size={IconSize.Medium}
                className="text-text-tertiary"
              />
              Source Tweet
            </Typography>
            <a
              href={tweetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-text-quaternary transition-colors hover:text-text-secondary"
            >
              Open on Twitter
            </a>
          </div>

          <div className="flex flex-col gap-4 laptop:flex-row laptop:overflow-x-auto">
            <TweetEmbed tweetId={item.source_tweet_id} />
            {item.related_tweet_ids.map((relatedTweetId) => (
              <TweetEmbed key={relatedTweetId} tweetId={relatedTweetId} />
            ))}
          </div>
        </div>

        {/* Related Signals */}
        <div className="mt-8 border-t border-border-subtlest-tertiary pt-6">
          <Typography type={TypographyType.Title3} bold className="mb-4">
            Related Signals
          </Typography>
          <div className="flex flex-col gap-3">
            {feedItems
              .filter(
                (related) =>
                  related.id !== item.id &&
                  (related.category === item.category ||
                    related.tags.some((tag) => item.tags.includes(tag))),
              )
              .slice(0, 3)
              .map((related) => (
                <Link
                  key={related.id}
                  href={`/ai-coding-hub/${related.id}`}
                  passHref
                >
                  <a className="block rounded-12 border border-border-subtlest-tertiary bg-surface-float p-4 transition-colors hover:bg-surface-hover">
                    <div className="mb-2 flex items-center gap-2">
                      <span
                        className={classNames(
                          'rounded-4 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                          related.category === 'leak' &&
                            'bg-accent-onion-default text-white',
                          related.category === 'milestone' &&
                            'bg-accent-avocado-default text-white',
                          related.category === 'release' &&
                            'bg-accent-water-default text-white',
                          related.category === 'hot_take' &&
                            'bg-accent-bacon-default text-white',
                          related.category === 'thread' &&
                            'bg-accent-bun-default text-white',
                          related.category === 'feature' &&
                            'bg-accent-blueCheese-default text-white',
                          related.category === 'endorsement' &&
                            'bg-accent-lettuce-default text-white',
                          related.category === 'announcement' &&
                            'bg-accent-cheese-default text-white',
                          related.category === 'drama' &&
                            'bg-accent-ketchup-default text-white',
                          related.category === 'insight' &&
                            'bg-accent-salt-default text-white',
                          related.category === 'data' &&
                            'bg-accent-lettuce-default text-white',
                          related.category === 'product_launch' &&
                            'bg-accent-water-default text-white',
                          related.category === 'tips' &&
                            'bg-accent-cabbage-default text-white',
                          related.category === 'standard' &&
                            'bg-accent-bun-default text-white',
                          related.category === 'commentary' &&
                            'bg-accent-pepper-default text-white',
                        )}
                      >
                        {categoryLabels[related.category]}
                      </span>
                      <span className="text-xs text-text-quaternary">
                        {getRelativeDate(related.date)}
                      </span>
                    </div>
                    <Typography type={TypographyType.Body} bold>
                      {related.headline}
                    </Typography>
                  </a>
                </Link>
              ))}
          </div>
        </div>
      </main>
    </div>
  );
};

SignalDetailPage.getLayout = getLayout;
SignalDetailPage.layoutProps = { screenCentered: false, hideBackButton: true };

export default SignalDetailPage;
