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
import { MinusIcon } from '../../components/icons/Minus';
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
import type { RailCorner } from './useRailEditing';
import { useRailEditing } from './useRailEditing';

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

const railCorners: RailCorner[] = ['tr', 'br', 'bl'];

/**
 * The resize grip from iOS and macOS edit mode: a quarter of the widget's own
 * corner, drawn just outside it, on every corner but the one that removes.
 */
const cornerClassName: Record<RailCorner, string> = {
  tr: '-right-1.5 -top-1.5 cursor-nesw-resize rounded-tr-[1.375rem] border-r-[0.1875rem] border-t-[0.1875rem]',
  br: '-bottom-1.5 -right-1.5 cursor-nwse-resize rounded-br-[1.375rem] border-b-[0.1875rem] border-r-[0.1875rem]',
  bl: '-bottom-1.5 -left-1.5 cursor-nesw-resize rounded-bl-[1.375rem] border-b-[0.1875rem] border-l-[0.1875rem]',
};

/** The outline grows away from the corner opposite the one being dragged. */
const cornerAnchor: Record<RailCorner, CSSProperties> = {
  tr: { left: 0, bottom: 0 },
  br: { left: 0, top: 0 },
  bl: { right: 0, top: 0 },
};

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
    replaceWidgets,
  } = useFeedWidgets();
  const { displayToast } = useToastNotification();
  const { numCards } = useContext(FeedContext);
  const isPhone = useIsPhone();
  const { isPlus } = usePlusSubscription();
  const [isEditing, setIsEditing] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [edges, setEdges] = useState({ start: false, end: false });
  const root = useRef<HTMLElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const grid = useRef<HTMLDivElement>(null);

  // Below the tablet breakpoint the slot leaves the rail and the ad goes back
  // to the feed, second, after the first post, as it is today.
  const showAd = !isPhone && !isPlus;
  const { ad } = useFeedWidgetAd({ enabled: showAd });

  const onRemove = useCallback(
    (widget: FeedWidget) => {
      const removed = removeWidget(widget.id);
      if (!removed) {
        return;
      }
      const { name } = getFeedWidgetDefinition(widget.kind);
      displayToast(`${name} removed`, {
        timer: FEED_WIDGET_UNDO_MS,
        action: { copy: 'Undo', onClick: () => restoreWidget(removed) },
      });
    },
    [displayToast, removeWidget, restoreWidget],
  );

  const editing = useRailEditing({
    widgets,
    isEditing,
    setIsEditing,
    isGalleryOpen,
    rootRef: root,
    gridRef: grid,
    scrollerRef: scroller,
    replaceWidgets,
    moveWidget,
    onRemove,
  });
  const { displayed, dragId, liftedId, resizing, flashId } = editing;

  const shown = useMemo(
    () => displayed.map((widget) => sizeForScreen(widget, isPhone)),
    [displayed, isPhone],
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
    const start = node.scrollLeft > 4;
    const end = node.scrollLeft + node.clientWidth < node.scrollWidth - 4;
    // Scroll fires every frame; only a flip of either end re-renders.
    setEdges((current) =>
      current.start === start && current.end === end ? current : { start, end },
    );
  }, []);

  useEffect(() => {
    updateEdges();
  }, [updateEdges, layout, isEditing, columns]);

  const scrollByPage = (direction: 1 | -1) =>
    scroller.current?.scrollBy({
      left: direction * scroller.current.clientWidth * 0.85,
      behavior: 'smooth',
    });

  const onMenuAction = (widget: FeedWidget, action: FeedWidgetMenuAction) => {
    const index = widgets.findIndex(({ id }) => id === widget.id);
    switch (action.type) {
      case 'size':
        resizeWidget(widget.id, action.size);
        editing.flash(widget.id);
        break;
      case 'move': {
        const target = {
          start: 0,
          left: index - 1,
          right: index + 1,
          end: widgets.length - 1,
        }[action.to];
        moveWidget(widget.id, target);
        editing.flash(widget.id);
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
    const widget = addWidget(kind);
    setIsGalleryOpen(false);
    editing.flash(widget.id);
    editing.setAnnouncement(
      `${getFeedWidgetDefinition(kind).name} added at the end.`,
    );
  };

  const isBusy = editing.isDragging || !!resizing || !!liftedId;

  return (
    <FeedWidgetsProvider feedName={feedName} isEditing={isEditing}>
      <section
        ref={root}
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
            setIsEditing(!isEditing);
            setIsGalleryOpen(false);
          }}
        />
        <div
          ref={scroller}
          role="region"
          onScroll={updateEdges}
          className={classNames(
            // Sideways only: a vertical wheel over the rail scrolls the page.
            'no-scrollbar -mx-2 overflow-x-auto overflow-y-hidden overscroll-x-contain px-2 pb-3 pt-4',
            // A phone swipes card by card; a trackpad stops wherever the
            // reader lets go and only settles onto a column close by.
            !editing.isDragging &&
              (isPhone ? 'snap-x snap-mandatory' : 'snap-x snap-proximity'),
          )}
          style={{ scrollPaddingInline: '0.5rem' }}
        >
          <div
            ref={grid}
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
                    data-flip-id={placement.key}
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
              const placed = shown.find(({ id }) => id === widget.id);
              // Stood Tall by the layout so no hole sits before the ad.
              const shownWidget =
                placed &&
                placement.isStretched &&
                feedWidgetSizes(placed.kind).includes(FeedWidgetSize.Tall)
                  ? { ...placed, size: FeedWidgetSize.Tall }
                  : placed;
              const index = widgets.findIndex(({ id }) => id === widget.id);
              const definition = getFeedWidgetDefinition(widget.kind);
              const Component = getFeedWidgetComponent(widget.kind);
              if (!Component || !shownWidget) {
                return null;
              }
              const isDragged = dragId === widget.id;
              const isLifted = liftedId === widget.id;
              const canResize = feedWidgetSizes(widget.kind).length > 1;

              return (
                <React.Fragment key={placement.key}>
                  {isDragged && (
                    <div
                      aria-hidden
                      className="rounded-16 border-2 border-dashed border-border-subtlest-secondary bg-surface-float"
                      style={gridArea(placement)}
                    />
                  )}
                  {/* A sortable button in edit mode, a plain cell otherwise; the
                      rule cannot read the conditional role. */}
                  {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
                  <div
                    data-flip-id={widget.id}
                    data-widget-id={widget.id}
                    data-testid="feedWidget"
                    data-kind={widget.kind}
                    data-size={shownWidget.size}
                    role={isEditing ? 'button' : undefined}
                    aria-roledescription={
                      isEditing ? 'sortable widget' : undefined
                    }
                    aria-label={`${definition.name}, ${
                      feedWidgetSizeLabel[shownWidget.size]
                    }${isEditing ? `, position ${index + 1}` : ''}`}
                    // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
                    tabIndex={isEditing ? 0 : undefined}
                    onKeyDown={(event) => editing.onItemKeyDown(event, widget)}
                    onPointerDown={(event) =>
                      editing.onItemPointerDown(event, widget.id)
                    }
                    onPointerMove={editing.onItemPointerMove}
                    onPointerUp={editing.onItemPointerUp}
                    onPointerCancel={editing.onItemPointerCancel}
                    onClickCapture={editing.onItemClickCapture}
                    style={gridArea(placement)}
                    className={classNames(
                      'group/widget relative flex min-h-0 min-w-0 snap-start rounded-16 outline-none',
                      'focus-visible:ring-2 focus-visible:ring-accent-cabbage-default',
                      isEditing && 'cursor-grab touch-none select-none',
                      isEditing &&
                        !isBusy &&
                        !isGalleryOpen &&
                        'feed-widget-jiggle',
                      isDragged &&
                        'pointer-events-none z-3 cursor-grabbing shadow-3',
                      isLifted &&
                        'z-2 scale-[1.03] shadow-3 transition-transform duration-150',
                      flashId === widget.id && 'feed-widget-flash',
                    )}
                  >
                    <FeedWidgetSurface
                      isBare={isFeedWidgetBare(widget.kind, shownWidget.size)}
                      className={isEditing ? 'pointer-events-none' : undefined}
                    >
                      <Component
                        widget={widget}
                        size={shownWidget.size}
                        isEditing={isEditing}
                      />
                    </FeedWidgetSurface>
                    {isEditing && !isDragged && (
                      <>
                        <button
                          type="button"
                          data-widget-control
                          aria-label={`Remove ${definition.name}`}
                          onPointerDown={(event) => event.stopPropagation()}
                          onClick={() => onRemove(widget)}
                          className="feed-widget-controls-in absolute -left-2 -top-2 z-3 flex size-6 items-center justify-center rounded-max bg-text-primary text-surface-invert shadow-2"
                        >
                          <MinusIcon size={IconSize.Size16} />
                        </button>
                        <div
                          data-widget-control
                          onPointerDown={(event) => event.stopPropagation()}
                        >
                          <FeedWidgetMenu
                            widget={widget}
                            canMoveLeft={index > 0}
                            canMoveRight={index < widgets.length - 1}
                            onAction={(action) => onMenuAction(widget, action)}
                          />
                        </div>
                        {canResize &&
                          !isGalleryOpen &&
                          railCorners.map((corner) => (
                            <span
                              key={corner}
                              aria-hidden
                              data-widget-control
                              onPointerDown={(event) =>
                                editing.onResizeStart(
                                  event,
                                  shownWidget,
                                  corner,
                                )
                              }
                              onPointerMove={editing.onResizeMove}
                              onPointerUp={editing.onResizeEnd}
                              onPointerCancel={editing.onResizeEnd}
                              className={classNames(
                                'feed-widget-controls-in absolute z-3 size-7 touch-none border-text-primary transition-transform duration-150 before:absolute before:-inset-2 hover:scale-110 motion-reduce:transition-none',
                                cornerClassName[corner],
                              )}
                            />
                          ))}
                        {resizing?.id === widget.id && (
                          <span
                            aria-hidden
                            className="opacity-80 pointer-events-none absolute z-2 rounded-16 border-2 border-accent-cabbage-default bg-surface-float"
                            style={{
                              ...cornerAnchor[resizing.corner],
                              width: resizing.width,
                              height: resizing.height,
                            }}
                          />
                        )}
                      </>
                    )}
                  </div>
                </React.Fragment>
              );
            })}
            {canAdd && (
              <button
                type="button"
                onClick={() => setIsGalleryOpen(true)}
                className="flex min-h-0 snap-start flex-col items-center justify-center gap-2 rounded-16 border-2 border-dashed border-border-subtlest-secondary text-text-tertiary transition-colors hover:border-border-subtlest-primary hover:bg-surface-hover hover:text-text-primary"
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
        <span role="status" aria-live="polite" className="sr-only">
          {editing.announcement}
        </span>
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
