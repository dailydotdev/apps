import type { CSSProperties, ReactElement } from 'react';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames';
import { PlusIcon } from '../../components/icons/Plus';
import { IconSize } from '../../components/Icon';
import FeedContext from '../../contexts/FeedContext';
import { useIsPhone } from '../../hooks/useViewSize';
import { usePlusSubscription } from '../../hooks/usePlusSubscription';
import { useToastNotification } from '../../hooks/useToastNotification';
import { useFeedHeroData } from '../../components/feeds/hero/useFeedHeroData';
import type { FeedWidget } from './types';
import { FeedWidgetKind, FeedWidgetSize, feedWidgetSizeLabel } from './types';
import type { RailPlacement } from './layout';
import { buildRailPlacement } from './layout';
import { getFeedWidgetDefinition, isFeedWidgetBare } from './registry';
import { feedWidgetSizes, getFeedWidgetComponent } from './components';
import { useFeedWidgets } from './useFeedWidgets';
import { FeedWidgetsProvider } from './FeedWidgetsContext';
import { FeedWidgetSurface } from './FeedWidgetFrame';
import type { FeedWidgetMenuAction } from './FeedWidgetMenu';
import { FeedWidgetMenu } from './FeedWidgetMenu';
import { FeedWidgetGallery } from './FeedWidgetGallery';
import { FeedWidgetRailHeader } from './FeedWidgetRailHeader';
import { FeedWidgetAdSlot, useFeedWidgetAd } from './widgets/FeedWidgetAdSlot';

export const FEED_WIDGET_UNDO_MS = 6000;
/** Half the rail's height: a Small widget, or one row of a Tall one. */
const CELL_HEIGHT = '13.25rem';

/**
 * What the rail puts on screen that the grid below must not repeat. The feed
 * takes back a slot the moment its widget is removed or finds nothing.
 */
export type FeedWidgetFeedState = {
  /** Posts the rail's cards show, kept out of the grid. */
  excludedPostIds: string[];
  /** The Happening Now rows are on the rail, so the grid drops its card. */
  hasHappeningNow: boolean;
  /** A featured card leads the page, so wide cards stay out of row one. */
  hasTopStory: boolean;
  /** The pinned slot shows a creative, so the grid stands its first ad down. */
  isAdVisible: boolean;
};

export type FeedWidgetRailProps = {
  feedName: string;
  className?: string;
  onFeedStateChange?: (state: FeedWidgetFeedState) => void;
};

const gridArea = ({
  column,
  row,
  colSpan,
  rowSpan,
}: RailPlacement): CSSProperties => ({
  gridColumn: `${column + 1} / span ${colSpan}`,
  gridRow: `${row + 1} / span ${rowSpan}`,
});

/**
 * A phone shows one column at a time, so a Large widget shrinks to Tall (or
 * Small) for the screen while its stored size stays what the reader chose.
 */
const sizeForScreen = (widget: FeedWidget, isPhone: boolean): FeedWidget => {
  if (!isPhone || widget.size !== FeedWidgetSize.Large) {
    return widget;
  }
  const sizes = feedWidgetSizes(widget.kind);
  const size = sizes.includes(FeedWidgetSize.Tall)
    ? FeedWidgetSize.Tall
    : sizes.find((item) => item !== FeedWidgetSize.Large) ?? widget.size;
  return { ...widget, size };
};

const emptyIds: string[] = [];

/**
 * The widget rail: the reader's widgets in one horizontal row on the feed's
 * columns, with our ad slot pinned to the third column. Customize enters edit
 * mode, where each widget carries a menu to resize, reorder and remove it and
 * a dashed tile at the end adds one.
 */
export const FeedWidgetRail = ({
  feedName,
  className,
  onFeedStateChange,
}: FeedWidgetRailProps): ReactElement | null => {
  const {
    widgets,
    canAdd,
    addWidget,
    removeWidget,
    restoreWidget,
    moveWidget,
    resizeWidget,
  } = useFeedWidgets();
  const { displayToast } = useToastNotification();
  const { numCards } = useContext(FeedContext);
  const isPhone = useIsPhone();
  const { isPlus } = usePlusSubscription();
  const [isEditing, setIsEditing] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [edges, setEdges] = useState({ start: false, end: false });
  const scroller = useRef<HTMLDivElement>(null);

  // Below the tablet breakpoint the slot leaves the rail and the ad goes back
  // to the feed, second, after the first post, as it is today.
  const showAd = !isPhone && !isPlus;
  const { ad } = useFeedWidgetAd({ enabled: showAd });

  const shown = useMemo(
    () => widgets.map((widget) => sizeForScreen(widget, isPhone)),
    [widgets, isPhone],
  );
  const layout = useMemo(
    () => buildRailPlacement(shown, { showAd }),
    [shown, showAd],
  );
  // `.eco` regardless of the reader's spaciness: the count the grid renders
  // with — see `FeedContainer`.
  const columns = isPhone ? 1 : numCards.eco;

  const hasTopStoryWidget = widgets.some(
    ({ kind }) => kind === FeedWidgetKind.TopStory,
  );
  const hasHappeningNowWidget = widgets.some(
    ({ kind }) => kind === FeedWidgetKind.HappeningNow,
  );
  const { posts, highlights } = useFeedHeroData({
    enabled: hasTopStoryWidget || hasHappeningNowWidget,
  });
  const excludedPostIds = useMemo(
    () => (hasTopStoryWidget ? posts.map(({ id }) => id) : emptyIds),
    [hasTopStoryWidget, posts],
  );
  const hasTopStory = excludedPostIds.length > 0;
  const hasHappeningNow = hasHappeningNowWidget && highlights.length > 0;
  const isAdVisible = showAd && !!ad;
  // Joined so a fresh array of the same ids does not report a change.
  const excludedKey = excludedPostIds.join(',');
  useEffect(() => {
    onFeedStateChange?.({
      excludedPostIds: excludedKey ? excludedKey.split(',') : emptyIds,
      hasHappeningNow,
      hasTopStory,
      isAdVisible,
    });
  }, [
    onFeedStateChange,
    excludedKey,
    hasHappeningNow,
    hasTopStory,
    isAdVisible,
  ]);

  const updateEdges = useCallback(() => {
    const node = scroller.current;
    if (!node) {
      return;
    }
    setEdges({
      start: node.scrollLeft > 4,
      end: node.scrollLeft + node.clientWidth < node.scrollWidth - 4,
    });
  }, []);

  useEffect(() => {
    updateEdges();
  }, [updateEdges, layout, isEditing, columns]);

  useEffect(() => {
    if (!isEditing) {
      return undefined;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isGalleryOpen) {
        setIsEditing(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isEditing, isGalleryOpen]);

  const scrollByPage = (direction: 1 | -1) =>
    scroller.current?.scrollBy({
      left: direction * scroller.current.clientWidth * 0.85,
      behavior: 'smooth',
    });

  const onRemove = (widget: FeedWidget) => {
    const removed = removeWidget(widget.id);
    if (!removed) {
      return;
    }
    const { name } = getFeedWidgetDefinition(widget.kind);
    displayToast(`${name} removed`, {
      timer: FEED_WIDGET_UNDO_MS,
      action: { copy: 'Undo', onClick: () => restoreWidget(removed) },
    });
  };

  const onMenuAction = (widget: FeedWidget, action: FeedWidgetMenuAction) => {
    const index = widgets.findIndex(({ id }) => id === widget.id);
    switch (action.type) {
      case 'size':
        resizeWidget(widget.id, action.size);
        break;
      case 'move': {
        const target = {
          start: 0,
          left: index - 1,
          right: index + 1,
          end: widgets.length - 1,
        }[action.to];
        moveWidget(widget.id, target);
        break;
      }
      case 'remove':
        onRemove(widget);
        break;
      default:
        break;
    }
  };

  const onAdd = (kind: FeedWidgetKind) => {
    addWidget(kind);
    setIsGalleryOpen(false);
  };

  const isEmpty = !layout.placements.length;

  return (
    <FeedWidgetsProvider feedName={feedName} isEditing={isEditing}>
      <section
        className={classNames(
          'group/rail relative flex flex-col gap-1',
          className,
        )}
        aria-label="Your widgets"
        data-testid="feedWidgetRail"
      >
        <FeedWidgetRailHeader
          isEditing={isEditing}
          showArrows={!isPhone}
          edges={edges}
          onScroll={scrollByPage}
          onToggleEditing={() => {
            setIsEditing((value) => !value);
            setIsGalleryOpen(false);
          }}
        />
        {(!isEmpty || isEditing) && (
          <div
            ref={scroller}
            role="region"
            onScroll={updateEdges}
            className={classNames(
              // Sideways only: a vertical wheel over the rail scrolls the page.
              'no-scrollbar -mx-2 overflow-x-auto overflow-y-hidden overscroll-x-contain px-2 pb-2 pt-3',
              'snap-x snap-mandatory',
            )}
            style={{ scrollPaddingInline: '0.5rem' }}
          >
            <div
              className={classNames(
                'relative grid',
                isPhone ? 'gap-3' : 'gap-x-8 gap-y-4',
              )}
              style={{
                gridTemplateRows: `repeat(2, ${CELL_HEIGHT})`,
                // A phone shows one column and the edge of the next, so the
                // rail always says it scrolls.
                gridAutoColumns: isPhone
                  ? 'calc((100% - 0.75rem) / 1.18)'
                  : `calc((100% - ${(columns - 1) * 2}rem) / ${columns})`,
              }}
            >
              {layout.placements.map((placement) => {
                if (placement.isAd) {
                  return (
                    <div
                      key={placement.key}
                      className="flex min-h-0 snap-start"
                      style={gridArea(placement)}
                      aria-label="Sponsored, pinned"
                    >
                      <FeedWidgetAdSlot
                        ad={ad}
                        isEditing={isEditing}
                        className="flex-1"
                      />
                    </div>
                  );
                }

                const { widget } = placement;
                if (!widget) {
                  return null;
                }
                const shownWidget = shown.find(({ id }) => id === widget.id);
                const index = widgets.findIndex(({ id }) => id === widget.id);
                const definition = getFeedWidgetDefinition(widget.kind);
                const Component = getFeedWidgetComponent(widget.kind);
                if (!Component || !shownWidget) {
                  return null;
                }

                return (
                  <div
                    key={placement.key}
                    className={classNames(
                      'relative flex min-h-0 min-w-0 snap-start',
                      isEditing &&
                        'rounded-16 outline outline-1 outline-offset-4 outline-border-subtlest-tertiary',
                    )}
                    style={gridArea(placement)}
                    data-testid="feedWidget"
                    data-kind={widget.kind}
                    data-size={shownWidget.size}
                    aria-label={`${definition.name}, ${
                      feedWidgetSizeLabel[widget.size]
                    }`}
                  >
                    <FeedWidgetSurface
                      isBare={isFeedWidgetBare(widget.kind, shownWidget.size)}
                    >
                      <Component
                        widget={widget}
                        size={shownWidget.size}
                        isEditing={isEditing}
                      />
                    </FeedWidgetSurface>
                    {isEditing && (
                      <FeedWidgetMenu
                        widget={widget}
                        canMoveLeft={index > 0}
                        canMoveRight={index < widgets.length - 1}
                        onAction={(action) => onMenuAction(widget, action)}
                      />
                    )}
                  </div>
                );
              })}
              {isEditing && (
                <button
                  type="button"
                  onClick={() => setIsGalleryOpen(true)}
                  disabled={!canAdd}
                  className="flex min-h-0 snap-start flex-col items-center justify-center gap-2 rounded-16 border border-dashed border-border-subtlest-secondary text-text-tertiary transition-colors hover:border-border-subtlest-primary hover:text-text-primary disabled:opacity-50"
                  style={gridArea({
                    key: 'add',
                    column: layout.columns,
                    row: 0,
                    colSpan: 1,
                    rowSpan: 2,
                  })}
                >
                  <PlusIcon size={IconSize.Large} />
                  <span className="font-bold typo-callout">Add a widget</span>
                </button>
              )}
            </div>
          </div>
        )}
      </section>
      {isGalleryOpen && (
        <FeedWidgetGallery
          widgets={widgets}
          canAdd={canAdd}
          onAdd={onAdd}
          onRequestClose={() => setIsGalleryOpen(false)}
        />
      )}
    </FeedWidgetsProvider>
  );
};
