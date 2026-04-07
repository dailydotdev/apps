import type { ReactElement, RefObject } from 'react';
import React from 'react';
import classNames from 'classnames';
import { ArrowIcon } from '../../icons';
import type { PostHighlight } from '../../../graphql/highlights';
import { RelativeTime } from '../../utilities/RelativeTime';

export type HighlightSelectionHandler = (
  highlight: PostHighlight,
  position: number,
  highlights: PostHighlight[],
) => void;

interface HighlightTabsProps {
  highlights: PostHighlight[];
  activeIndex: number;
  onSelectHighlight: HighlightSelectionHandler;
}

interface HighlightDesktopRailProps extends HighlightTabsProps {
  isNavigationReady: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onScroll: () => void;
  scrollRef: RefObject<HTMLDivElement>;
}

interface HighlightMobileRailProps extends HighlightTabsProps {
  drawerContainerRef: RefObject<HTMLDivElement>;
  isDrawerMinimized: boolean;
  isNavigationReady: boolean;
  onRestoreDrawer: () => void;
  scrollRef: RefObject<HTMLDivElement>;
  showRightScrollGlow: boolean;
  updateHighlightsRightGlow: () => void;
}

const highlightTabsSkeletonItems = Array.from(
  { length: 4 },
  (_, index) => index,
);

export const HighlightTabs = ({
  highlights,
  activeIndex,
  onSelectHighlight,
}: HighlightTabsProps): ReactElement => {
  return (
    <>
      {highlights.map((highlight, index) => {
        const isActive = index === activeIndex;

        return (
          <button
            key={highlight.id}
            data-highlight-id={highlight.id}
            type="button"
            className={
              isActive
                ? 'feed-highlights-new-item-border-bottom flex w-fit max-w-56 shrink-0 flex-col items-start gap-0.5 rounded-8 border border-transparent px-2.5 py-2 text-left transition-colors'
                : 'flex w-fit max-w-56 shrink-0 flex-col items-start gap-0.5 rounded-8 border border-transparent px-2.5 py-2 text-left transition-colors hover:bg-surface-hover'
            }
            onClick={() => onSelectHighlight(highlight, index + 1, highlights)}
          >
            <RelativeTime
              dateTime={highlight.highlightedAt}
              maxHoursAgo={72}
              className="text-text-tertiary typo-caption2"
            />
            <span
              className={
                isActive
                  ? 'line-clamp-2 text-text-primary typo-callout'
                  : 'line-clamp-2 text-text-secondary typo-callout'
              }
            >
              {highlight.headline}
            </span>
          </button>
        );
      })}
    </>
  );
};

const HighlightTabsSkeleton = (): ReactElement => {
  return (
    <div className="flex min-w-max gap-1 overflow-hidden">
      {highlightTabsSkeletonItems.map((item) => (
        <div
          key={item}
          aria-hidden
          className="flex h-[4.125rem] w-56 min-w-56 shrink-0 animate-pulse flex-col gap-2 rounded-8 border border-border-subtlest-tertiary px-2.5 py-2"
        >
          <div className="h-3 w-16 rounded-full bg-surface-hover" />
          <div className="h-4 w-full rounded-full bg-surface-hover" />
          <div className="h-4 w-4/5 rounded-full bg-surface-hover" />
        </div>
      ))}
    </div>
  );
};

export const HighlightDesktopRail = ({
  activeIndex,
  highlights,
  isNavigationReady,
  onMouseEnter,
  onMouseLeave,
  onScroll,
  onSelectHighlight,
  scrollRef,
}: HighlightDesktopRailProps): ReactElement => {
  return (
    <section className="relative w-full max-w-full shrink-0 overflow-hidden border-b border-border-subtlest-tertiary">
      <div
        className="px-3 py-3"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <div
          ref={scrollRef}
          className="w-full max-w-full overflow-x-auto overflow-y-hidden"
          onScroll={onScroll}
          onWheel={onScroll}
        >
          <div
            className={
              !isNavigationReady
                ? 'invisible flex min-w-max gap-1'
                : 'flex min-w-max gap-1'
            }
          >
            {highlights.length ? (
              <HighlightTabs
                highlights={highlights}
                activeIndex={activeIndex}
                onSelectHighlight={onSelectHighlight}
              />
            ) : null}
          </div>
        </div>
        {!isNavigationReady && (
          <div className="pointer-events-none absolute inset-x-3 top-3">
            <HighlightTabsSkeleton />
          </div>
        )}
      </div>
    </section>
  );
};

export const HighlightMobileRail = ({
  activeIndex,
  drawerContainerRef,
  highlights,
  isDrawerMinimized,
  isNavigationReady,
  onRestoreDrawer,
  onSelectHighlight,
  scrollRef,
  showRightScrollGlow,
  updateHighlightsRightGlow,
}: HighlightMobileRailProps): ReactElement => {
  if (isDrawerMinimized) {
    return (
      <div className="pointer-events-none fixed inset-x-0 bottom-2 z-modal px-2">
        <div className="pointer-events-auto">
          <button
            type="button"
            className="bg-background-default/95 flex h-10 w-full items-center gap-2 rounded-12 border border-border-subtlest-tertiary px-3 backdrop-blur-sm"
            onClick={onRestoreDrawer}
          >
            <span className="bg-gradient-to-r from-accent-blueCheese-default via-accent-cheese-default to-accent-avocado-default bg-clip-text font-bold text-transparent typo-callout">
              Happening Now
            </span>
            <span className="ml-auto text-text-tertiary">
              <ArrowIcon className="[&_path]:fill-text-tertiary" />
            </span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <section className="my-2 w-full border-b border-border-subtlest-tertiary bg-background-default">
      <div ref={drawerContainerRef} className="flex items-center">
        <div className="relative min-w-0 flex-1">
          <div
            ref={scrollRef}
            className="min-w-0 flex-1 overflow-x-auto"
            onScroll={updateHighlightsRightGlow}
          >
            <div
              className={classNames(
                'flex min-w-max gap-1 px-3 pb-3',
                !isNavigationReady && 'invisible',
              )}
            >
              <HighlightTabs
                highlights={highlights}
                activeIndex={activeIndex}
                onSelectHighlight={onSelectHighlight}
              />
            </div>
          </div>
          {!isNavigationReady && (
            <div className="pointer-events-none absolute inset-x-3 top-0">
              <div className="pb-3">
                <HighlightTabsSkeleton />
              </div>
            </div>
          )}
          <div
            className={classNames(
              'pointer-events-none absolute inset-y-0 right-0 w-10 rounded-r-12 bg-gradient-to-l from-background-default to-transparent transition-opacity duration-200',
              showRightScrollGlow ? 'opacity-100' : 'opacity-0',
            )}
          />
        </div>
      </div>
    </section>
  );
};
