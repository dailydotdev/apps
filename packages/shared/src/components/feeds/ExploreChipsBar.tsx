import type { ReactElement } from 'react';
import React, { useCallback, useMemo, useState } from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import Link from '../utilities/Link';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { ArrowIcon } from '../icons';
import { useScrollManagement } from '../HorizontalScroll/useScrollManagement';
import { webappUrl } from '../../lib/constants';
import useCustomDefaultFeed from '../../hooks/feed/useCustomDefaultFeed';
import type { ExploreCategory } from './exploreCategories';

interface ExploreChipsBarProps {
  categories: ExploreCategory[];
  className?: string;
}

const FOR_YOU_CATEGORY_ID = 'foryou';

export function ExploreChipsBar({
  categories,
  className,
}: ExploreChipsBarProps): ReactElement | null {
  const router = useRouter();
  const { isCustomDefaultFeed } = useCustomDefaultFeed();
  const [scroller, setScroller] = useState<HTMLDivElement | null>(null);
  const { isAtStart, isAtEnd } = useScrollManagement(scroller);
  const showRight = !!scroller && !isAtEnd;
  const showLeft = !!scroller && !isAtStart;

  const forYouCategory: ExploreCategory = useMemo(
    () => ({
      id: FOR_YOU_CATEGORY_ID,
      label: 'For you',
      path: isCustomDefaultFeed ? `${webappUrl}my-feed` : webappUrl,
    }),
    [isCustomDefaultFeed],
  );
  const allCategories = useMemo(
    () => [forYouCategory, ...categories],
    [forYouCategory, categories],
  );

  const activePath = useMemo(() => {
    const noQuery = router.asPath.split('?')[0];
    if (!noQuery || noQuery === '/') {
      return '/';
    }
    return noQuery.replace(/\/$/, '');
  }, [router.asPath]);

  const normalizePath = (p: string): string => {
    const noQuery = p.split('?')[0];
    if (!noQuery || noQuery === '/') {
      return '/';
    }
    return noQuery.replace(/\/$/, '');
  };

  const onScrollRight = useCallback(() => {
    if (!scroller) {
      return;
    }
    scroller.scrollBy({ left: scroller.clientWidth * 0.8, behavior: 'smooth' });
  }, [scroller]);

  const onScrollLeft = useCallback(() => {
    if (!scroller) {
      return;
    }
    scroller.scrollBy({
      left: -scroller.clientWidth * 0.8,
      behavior: 'smooth',
    });
  }, [scroller]);

  return (
    <section
      className={classNames(
        'relative isolate w-full overflow-hidden bg-background-default px-3 transition-colors duration-200 laptop:px-10',
        className,
      )}
    >
      <div className="relative">
        <div
          ref={setScroller}
          className="no-scrollbar relative flex items-center gap-2 overflow-x-auto py-2"
        >
          {allCategories.map((category) => {
            // For You owns the homepage. Match it against both `/` and `/my-feed`
            // so the user's default custom feed (also at `/`) doesn't steal the
            // active state.
            const isForYou = category.id === FOR_YOU_CATEGORY_ID;
            const candidates = isForYou
              ? [category.path, webappUrl, `${webappUrl}my-feed`]
              : [category.path];
            const isActive = candidates.some(
              (candidate) => normalizePath(candidate) === activePath,
            );
            return (
              <Link key={category.id} href={category.path}>
                <a
                  aria-current={isActive ? 'page' : undefined}
                  className={classNames(
                    'shrink-0 rounded-10 border px-2.5 py-1.5 font-bold transition-colors typo-callout',
                    isActive
                      ? 'border-border-subtlest-tertiary bg-surface-float text-text-primary hover:bg-surface-hover'
                      : 'border-transparent bg-background-subtle text-text-tertiary hover:bg-surface-hover hover:text-text-primary',
                  )}
                >
                  {category.label}
                </a>
              </Link>
            );
          })}
        </div>
        <div
          aria-hidden
          className={classNames(
            'pointer-events-none absolute inset-y-0 left-0 flex items-center pl-1 transition-opacity duration-200',
            showLeft ? 'opacity-100' : 'opacity-0',
          )}
        >
          <Button
            type="button"
            variant={ButtonVariant.Float}
            size={ButtonSize.XSmall}
            icon={<ArrowIcon className="-rotate-90 text-white" />}
            aria-label="Scroll categories left"
            tabIndex={showLeft ? 0 : -1}
            className={classNames(
              'pointer-events-auto bg-background-default shadow-2',
              !showLeft && 'invisible',
            )}
            onClick={onScrollLeft}
          />
          <div className="pointer-events-none h-full w-12 bg-gradient-to-l from-transparent to-background-default" />
        </div>
        <div
          aria-hidden
          className={classNames(
            'pointer-events-none absolute inset-y-0 right-0 flex items-center pr-1 transition-opacity duration-200',
            showRight ? 'opacity-100' : 'opacity-0',
          )}
        >
          <div className="pointer-events-none h-full w-12 bg-gradient-to-r from-transparent to-background-default" />
          <Button
            type="button"
            variant={ButtonVariant.Float}
            size={ButtonSize.XSmall}
            icon={<ArrowIcon className="rotate-90 text-white" />}
            aria-label="Scroll categories right"
            tabIndex={showRight ? 0 : -1}
            className={classNames(
              'pointer-events-auto bg-background-default shadow-2',
              !showRight && 'invisible',
            )}
            onClick={onScrollRight}
          />
        </div>
      </div>
    </section>
  );
}
