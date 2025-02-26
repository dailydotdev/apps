import type { ReactElement } from 'react';
import React, { useMemo, useRef, useState, useEffect } from 'react';
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

const CustomFeedSlider = (): ReactElement => {
  const { feeds } = useFeeds();
  const { isPlus } = usePlusSubscription();
  const sortedFeeds = useSortedFeeds({ edges: feeds?.edges });
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeButtonRef = useRef<HTMLAnchorElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const router = useRouter();

  const urlToTab: Record<string, string> = useMemo(() => {
    return {
      '/': 'For you',
      ...sortedFeeds.reduce((acc, { node: feed }) => {
        const feedPath = `/feeds/${feed.id}`;
        acc[feedPath] = feed.flags?.name || `Feed ${feed.id}`;
        return acc;
      }, {}),
      '/feeds/new': 'New feed',
    };
  }, [sortedFeeds]);

  const updateArrowVisibility = () => {
    if (!scrollContainerRef.current) {
      return;
    }
    const container = scrollContainerRef.current;
    const { scrollLeft, scrollWidth, clientWidth } = container;

    const firstFeedBtn = container.firstElementChild as HTMLElement;
    const lastFeedBtn = container.lastElementChild as HTMLElement;
    const leftThreshold = firstFeedBtn?.offsetWidth ?? 0;
    const rightThreshold = lastFeedBtn?.offsetWidth ?? 0;

    setShowLeftArrow(scrollLeft > leftThreshold);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - rightThreshold);
  };

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

    // Update arrow visibility after scroll animation
    setTimeout(updateArrowVisibility, 300);
  };

  useEffect(() => {
    if (activeButtonRef.current) {
      activeButtonRef.current.scrollIntoView({
        behavior: 'auto',
        block: 'nearest',
        inline: 'center',
      });
      updateArrowVisibility();
    }

    // For cases where the scroll container becomes smaller,
    // and all the buttons are not visible anymore.
    const resizeObserver = new ResizeObserver(() => {
      updateArrowVisibility();
    });
    if (scrollContainerRef.current) {
      resizeObserver.observe(scrollContainerRef.current);
    }
    return () => {
      resizeObserver.disconnect();
    };
  }, [router.asPath]);

  return (
    <div className="relative flex-1 overflow-x-auto">
      {showLeftArrow && (
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
          return (
            <Button
              key={url}
              ref={isActive ? activeButtonRef : undefined}
              variant={isActive ? ButtonVariant.Primary : ButtonVariant.Subtle}
              size={ButtonSize.Small}
              tag="a"
              href={url}
              icon={url === '/feeds/new' && <PlusIcon size={IconSize.Small} />}
            >
              {label}
              {!isPlus && (
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

      {showRightArrow && (
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
