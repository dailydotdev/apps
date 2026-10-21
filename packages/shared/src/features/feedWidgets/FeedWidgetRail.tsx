import type { CSSProperties, ReactElement } from 'react';
import dynamic from 'next/dynamic';
import { useInView } from 'react-intersection-observer';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames';
import { PlusIcon } from '../../components/icons/Plus';
import { MinusIcon } from '../../components/icons/Minus';
import { IconSize } from '../../components/Icon';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent, Origin, TargetType } from '../../lib/log';
import { useToastNotification } from '../../hooks/useToastNotification';
import type { FeedWidget, FeedWidgetKind } from './types';
import { FeedWidgetSize, feedWidgetSizeLabel } from './types';
import type { RailPlacement } from './layout';
import { buildRailPlacement } from './layout';
import { getFeedWidgetDefinition, isFeedWidgetBare } from './registry';
import { feedWidgetSizes, getFeedWidgetComponent } from './components';
import { useFeedWidgets } from './useFeedWidgets';
import { FeedWidgetsProvider } from './FeedWidgetsContext';
import { FeedWidgetLoading, FeedWidgetSurface } from './FeedWidgetFrame';
import type { FeedWidgetMenuAction } from './FeedWidgetMenu';
import { FeedWidgetMenu } from './FeedWidgetMenu';
import { useFeedWidgetAd, useFeedWidgetAdSlot } from './feedState';
import {
  FeedWidgetRailSkeleton,
  railGridClassName,
  railGridStyle,
  railScrollerClassName,
  railSectionClassName,
} from './FeedWidgetRailFrame';
import { FeedWidgetRailHeader } from './FeedWidgetRailHeader';
import { FeedWidgetAdSlot } from './widgets/FeedWidgetAdSlot';
import { useRailEditMode } from './useRailEditMode';

export const FEED_WIDGET_UNDO_MS = 6000;

export type { FeedWidgetFeedState } from './feedState';

// Opened on demand, so its code waits until a reader wants to add a widget.
const FeedWidgetGallery = dynamic(() =>
  import(
    /* webpackChunkName: "feedWidgetGallery" */ './FeedWidgetGallery'
  ).then((mod) => mod.FeedWidgetGallery),
);

/**
 * A widget's content mounts the first time its cell nears the screen, and so
 * does everything it fetches: a rail of many widgets never competes with the
 * feed for the first paint, and widgets scrolled out of the rail stay idle.
 */
const OnScreen = ({ children }: { children: ReactElement }): ReactElement => {
  const { ref, inView } = useInView({ triggerOnce: true, rootMargin: '200px' });
  return (
    <div ref={ref} className="flex min-h-0 min-w-0 flex-1 flex-col">
      {inView ? children : <FeedWidgetLoading />}
    </div>
  );
};

export type FeedWidgetRailProps = {
  feedName: string;
  className?: string;
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

/**
 * The widget rail: the reader's widgets in one horizontal row on the feed's
 * columns, with our ad slot pinned to the third column. Customize enters edit
 * mode, where each widget carries a menu to resize, reorder and remove it and
 * a dashed tile at the end adds one.
 */
export const FeedWidgetRail = ({
  feedName,
  className,
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
  const {
    showAd,
    isSettled: isPhoneSettled,
    columns,
    isPhone,
  } = useFeedWidgetAdSlot();
  const { logEvent } = useLogContext();
  const [isEditing, setIsEditing] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  // Opened from an empty cell, a widget starts Small so it lands in that cell.
  const [addSize, setAddSize] = useState<FeedWidgetSize>();
  const [edges, setEdges] = useState({ start: false, end: false });
  const root = useRef<HTMLElement>(null);
  const scroller = useRef<HTMLDivElement>(null);

  const { ad, isNoFill } = useFeedWidgetAd({ enabled: showAd });

  const logWidgetEvent = useCallback(
    (eventName: LogEvent, widget?: FeedWidget, extra?: object) =>
      logEvent({
        event_name: eventName,
        target_type: TargetType.FeedWidget,
        target_id: widget?.kind,
        extra: JSON.stringify({ origin: Origin.FeedWidgets, ...extra }),
      }),
    [logEvent],
  );

  const onRemove = useCallback(
    (widget: FeedWidget) => {
      const removed = removeWidget(widget.id);
      if (!removed) {
        return;
      }
      logWidgetEvent(LogEvent.RemoveFeedWidget, widget, { size: widget.size });
      const { name } = getFeedWidgetDefinition(widget.kind);
      displayToast(`${name} removed`, {
        timer: FEED_WIDGET_UNDO_MS,
        action: {
          copy: 'Undo',
          onClick: () => {
            restoreWidget(removed);
            logWidgetEvent(LogEvent.UndoRemoveFeedWidget, widget);
          },
        },
      });
    },
    [displayToast, logWidgetEvent, removeWidget, restoreWidget],
  );

  const editing = useRailEditMode({
    isEditing,
    setIsEditing,
    isGalleryOpen,
    rootRef: root,
  });
  const { flashId } = editing;

  const shown = useMemo(
    () => widgets.map((widget) => sizeForScreen(widget, isPhone)),
    [widgets, isPhone],
  );
  const layout = useMemo(
    () => buildRailPlacement(shown, { showAd }),
    [shown, showAd],
  );
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
        logWidgetEvent(LogEvent.ResizeFeedWidget, widget, {
          method: 'menu',
          size: action.size,
        });
        break;
      case 'move': {
        const target = Math.max(
          0,
          Math.min(
            widgets.length - 1,
            {
              start: 0,
              left: index - 1,
              right: index + 1,
              end: widgets.length - 1,
            }[action.to],
          ),
        );
        moveWidget(widget.id, target);
        editing.flash(widget.id);
        logWidgetEvent(LogEvent.MoveFeedWidget, widget, {
          method: 'menu',
          from: index,
          to: target,
        });
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
    const widget = addWidget(kind, addSize);
    setIsGalleryOpen(false);
    logWidgetEvent(LogEvent.AddFeedWidget, widget, {
      size: widget.size,
      source: addSize ? 'slot' : 'tile',
    });
    editing.flash(widget.id);
    editing.setAnnouncement(
      `${getFeedWidgetDefinition(kind).name} added at the end.`,
    );
  };

  // Until the phone check settles, where our slot goes is not known, and
  // placing widgets now would repack them when it lands: hold the rail's
  // exact shape instead.
  if (!isPhoneSettled) {
    return <FeedWidgetRailSkeleton columns={columns} isPhone={isPhone} />;
  }

  return (
    <FeedWidgetsProvider feedName={feedName} isEditing={isEditing}>
      <section
        ref={root}
        className={classNames(railSectionClassName, className)}
        aria-label="Your widgets"
        data-testid="feedWidgetRail"
      >
        <FeedWidgetRailHeader
          isEditing={isEditing}
          showArrows={!isPhone}
          edges={edges}
          onScroll={scrollByPage}
          onToggleEditing={() => {
            if (!isEditing) {
              logWidgetEvent(LogEvent.CustomizeFeedWidgets);
            }
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
            railScrollerClassName,
            // A phone swipes card by card; a trackpad stops wherever the
            // reader lets go and only settles onto a column close by.
            isPhone ? 'snap-x snap-mandatory' : 'snap-x snap-proximity',
          )}
          style={{ scrollPaddingInline: '0.5rem' }}
        >
          <div
            className={railGridClassName(isPhone)}
            style={railGridStyle(columns, isPhone)}
          >
            {layout.placements.map((placement) => {
              // An empty ad keeps its cell, so nothing moves; the grid shows
              // the first ad instead and the cell is offered for a widget.
              if (placement.isGap || (placement.isAd && isNoFill)) {
                return canAdd ? (
                  <button
                    key={placement.key}
                    type="button"
                    onClick={() => {
                      // The ad's cell stays reserved, so a widget added from
                      // it goes to the end at its usual size.
                      if (placement.isGap) {
                        setAddSize(FeedWidgetSize.Small);
                      }
                      setIsGalleryOpen(true);
                    }}
                    className="flex min-h-0 items-center justify-center gap-2 rounded-16 border-2 border-dashed border-border-subtlest-tertiary text-text-quaternary transition-colors hover:border-border-subtlest-primary hover:bg-surface-hover hover:text-text-primary"
                    style={gridArea(placement)}
                    aria-label={
                      placement.isGap
                        ? 'Add a widget here'
                        : 'Add another widget'
                    }
                  >
                    <PlusIcon />
                  </button>
                ) : null;
              }

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
                  data-widget-id={widget.id}
                  data-testid="feedWidget"
                  data-kind={widget.kind}
                  data-size={shownWidget.size}
                  aria-label={`${definition.name}, ${
                    feedWidgetSizeLabel[shownWidget.size]
                  }${isEditing ? `, position ${index + 1}` : ''}`}
                  style={gridArea(placement)}
                  className={classNames(
                    'group/widget relative flex min-h-0 min-w-0 snap-start rounded-16',
                    flashId === widget.id && 'feed-widget-flash',
                  )}
                >
                  <FeedWidgetSurface
                    isBare={isFeedWidgetBare(widget.kind, shownWidget.size)}
                    // In edit mode a widget is a thing to arrange, so its
                    // links stay put.
                    className={isEditing ? 'pointer-events-none' : undefined}
                  >
                    <OnScreen>
                      <Component
                        widget={widget}
                        size={shownWidget.size}
                        isEditing={isEditing}
                      />
                    </OnScreen>
                  </FeedWidgetSurface>
                  {isEditing && (
                    <>
                      <button
                        type="button"
                        aria-label={`Remove ${definition.name}`}
                        onClick={() => onRemove(widget)}
                        className="feed-widget-controls-in absolute -left-2 -top-2 z-3 flex size-6 items-center justify-center rounded-max bg-text-primary text-surface-invert shadow-2"
                      >
                        <MinusIcon size={IconSize.Size16} />
                      </button>
                      <FeedWidgetMenu
                        widget={widget}
                        canMoveLeft={index > 0}
                        canMoveRight={index < widgets.length - 1}
                        onAction={(action) => onMenuAction(widget, action)}
                      />
                    </>
                  )}
                </div>
              );
            })}
            {canAdd && (
              <button
                type="button"
                onClick={() => {
                  setAddSize(undefined);
                  setIsGalleryOpen(true);
                }}
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
