import type { ReactElement } from 'react';
import React, { useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSortedFeeds } from '../../hooks/feed/useSortedFeeds';
import { useFeeds } from '../../hooks/feed';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { ArrowIcon, PlusIcon } from '../icons';
import { IconSize } from '../Icon';
import { usePlusSubscription } from '../../hooks';
import {
  Typography,
  TypographyTag,
  TypographyType,
  TypographyColor,
} from '../typography/Typography';
import { useScrollManagement } from '../HorizontalScroll/useScrollManagement';
import useCustomDefaultFeed from '../../hooks/feed/useCustomDefaultFeed';

const CustomFeedSlider = (): ReactElement => {
  const { feeds } = useFeeds();
  const { isPlus } = usePlusSubscription();
  const { isCustomDefaultFeed, defaultFeedId } = useCustomDefaultFeed();
  const sortedFeeds = useSortedFeeds({ edges: feeds?.edges });
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeButtonRef = useRef<HTMLAnchorElement>(null);
  const router = useRouter();

  const urlToTab: Record<string, string> = useMemo(() => {
    const myFeedPath = isCustomDefaultFeed ? '/my-feed' : '/';
    return {
      [myFeedPath]: 'For you',
      '/following': 'Following',
      ...sortedFeeds.reduce((acc, { node: feed }) => {
        const feedPath = defaultFeedId === feed.id ? '/' : `/feeds/${feed.id}`;
        acc[feedPath] = feed.flags?.name || `Feed ${feed.id}`;
        return acc;
      }, {}),
      '/feeds/new': 'New feed',
    };
  }, [sortedFeeds, isCustomDefaultFeed, defaultFeedId]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) {
      return;
    }
    const { clientWidth } = scrollContainerRef.current;
    const scrollAmount = clientWidth / 2;

    scrollContainerRef.current.scrollTo({
      left:
        scrollContainerRef.current.scrollLeft +
        (direction === 'left' ? -scrollAmount : scrollAmount),
      behavior: 'smooth',
    });
  };

  const { isAtStart, isAtEnd } = useScrollManagement(scrollContainerRef);

  useEffect(() => {
    if (activeButtonRef.current) {
      activeButtonRef.current.scrollIntoView({
        behavior: 'auto',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [router.asPath]);

  return (
    <div className="relative flex-1 overflow-x-auto">
      {!isAtStart && (
        <Button
          className="absolute left-0 top-1/2 z-1 -translate-y-1/2 rounded-l-none rounded-r-12 bg-background-default !px-2"
          onClick={() => scroll('left')}
          aria-label="Scroll left"
          icon={<ArrowIcon className="-rotate-90" size={IconSize.Small} />}
        />
      )}

      <div
        ref={scrollContainerRef}
        className="flex h-full items-center gap-2 overflow-hidden py-2"
      >
        {Object.entries(urlToTab).map(([url, label]) => {
          const isActive = router.asPath === url;
          const isNewFeed = url === '/feeds/new';
          return (
            <Button
              key={url}
              ref={isActive ? activeButtonRef : undefined}
              variant={isActive ? ButtonVariant.Primary : ButtonVariant.Subtle}
              size={ButtonSize.Small}
              tag="a"
              href={url}
              icon={isNewFeed && <PlusIcon size={IconSize.Small} />}
            >
              {label}
              {!isPlus && isNewFeed && (
                <Typography
                  tag={TypographyTag.Span}
                  type={TypographyType.Caption1}
                  className="ml-1 flex items-center rounded-4 bg-action-plus-float px-1"
                  bold
                  color={TypographyColor.Plus}
                >
                  Plus
                </Typography>
              )}
            </Button>
          );
        })}
      </div>

      {!isAtEnd && (
        <Button
          className="absolute right-0 top-1/2 z-1 -translate-y-1/2 rounded-l-12 rounded-r-none bg-background-default !px-2"
          onClick={() => scroll('right')}
          aria-label="Scroll right"
          icon={<ArrowIcon className="rotate-90" size={IconSize.Small} />}
        />
      )}
    </div>
  );
};

export default CustomFeedSlider;
