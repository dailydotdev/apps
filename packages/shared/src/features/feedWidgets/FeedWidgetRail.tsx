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
import {
  FEED_WIDGET_UNDO_MS,
  FeedWidgetSize,
  feedWidgetSizeLabel,
} from './types';
import type { RailPlacement } from './layout';
import { buildRailPlacement } from './layout';
import { getFeedWidgetDefinition, isFeedWidgetBare } from './registry';
import { feedWidgetSizes, getFeedWidgetComponent } from './components';
import { useFeedWidgets } from './useFeedWidgets';
import { isNewerFeedWidgetConfig } from './config';
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
import { FeedWidgetTip } from './widgets/FeedWidgetTip';
import {
  feedWidgetTipLogEvent,
  pickFeedWidgetTip,
  useFeedWidgetTips,
} from './tips';
import type { RailCorner, RailEdit } from './useRailEditing';
import { useRailEditing } from './useRailEditing';

export { FEED_WIDGET_UNDO_MS } from './types';

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
  /** Turns the whole rail off; the feed owns it, as hiding unmounts the rail. */
  onHide: () => void;
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

/** A phone shows no Large, so it never offers one either. */
const sizesForScreen = (
  kind: FeedWidgetKind,
  isPhone: boolean,
): FeedWidgetSize[] =>
  feedWidgetSizes(kind).filter(
    (size) => !isPhone || size !== FeedWidgetSize.Large,
  );

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
 * a dashed tile at the end adds one. Once the reader has made the rail their
 * own, that tile only shows in edit mode.
 */
export const FeedWidgetRail = ({
  feedName,
  onHide,
  className,
}: FeedWidgetRailProps): ReactElement | null => {
  const {
    widgets,
    isReadOnly,
    isCustomized,
    canAdd,
    addWidget,
    removeWidget,
    restoreWidget,
    moveWidget,
    resizeWidget,
    updateWidgetConfig,
    replaceWidgets,
    isTipHidden,
    setTipHidden,
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
  // The widget whose config the reader is changing, out of edit mode so the
  // widget's own controls take the clicks.
  const [configuringId, setConfiguringId] = useState<string>();
  // Opened from an empty cell, a widget starts Small so it lands in that cell.
  const [addSize, setAddSize] = useState<FeedWidgetSize>();
  const [edges, setEdges] = useState({ start: false, end: false });
  const root = useRef<HTMLElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const grid = useRef<HTMLDivElement>(null);
  // Customize brings the add tile into view, so adding is never a hunt.
  const shouldRevealAdd = useRef(false);

  const { ad, isNoFill } = useFeedWidgetAd({ enabled: showAd });
  // One tip per page view, over our slot: it is known from the settings and
  // the slot alone, so it is there from the first paint.
  const tips = useFeedWidgetTips();
  const [tipDraw] = useState(Math.random);
  const tip = pickFeedWidgetTip(tips, tipDraw);
  const showTip = showAd && !isTipHidden;

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
      const result = removeWidget(widget.id);
      if (!result) {
        return;
      }
      const { removed, saved } = result;
      saved.then(
        (isSaved) =>
          isSaved &&
          logWidgetEvent(LogEvent.RemoveFeedWidget, widget, {
            size: widget.size,
          }),
      );
      const { name } = getFeedWidgetDefinition(widget.kind);
      displayToast(`${name} removed`, {
        timer: FEED_WIDGET_UNDO_MS,
        action: {
          copy: 'Undo',
          onClick: () =>
            restoreWidget(removed).then(
              (isSaved) =>
                isSaved &&
                logWidgetEvent(LogEvent.UndoRemoveFeedWidget, widget),
            ),
        },
      });
    },
    [displayToast, logWidgetEvent, removeWidget, restoreWidget],
  );

  const logTip = useCallback(
    (eventName: LogEvent) =>
      logEvent(feedWidgetTipLogEvent(eventName, Origin.FeedWidgets, tip)),
    [logEvent, tip],
  );

  const onRestoreTips = useCallback(() => {
    setIsGalleryOpen(false);
    setTipHidden(false).then(
      (isSaved) => isSaved && logTip(LogEvent.RestoreFeedWidgetTip),
    );
  }, [logTip, setTipHidden]);

  const onRemoveTip = useCallback(() => {
    setTipHidden(true).then(
      (isSaved) => isSaved && logTip(LogEvent.DismissFeedWidgetTip),
    );
    displayToast('daily.dev tips removed', {
      timer: FEED_WIDGET_UNDO_MS,
      action: {
        copy: 'Undo',
        onClick: () =>
          setTipHidden(false).then(
            (isSaved) => isSaved && logTip(LogEvent.UndoDismissFeedWidgetTip),
          ),
      },
    });
  }, [displayToast, logTip, setTipHidden]);

  const onEdit = useCallback(
    (edit: RailEdit) =>
      edit.type === 'move'
        ? logWidgetEvent(LogEvent.MoveFeedWidget, edit.widget, {
            method: edit.method,
            from: edit.from,
            to: edit.to,
          })
        : logWidgetEvent(LogEvent.ResizeFeedWidget, edit.widget, {
            method: 'corner',
            size: edit.size,
          }),
    [logWidgetEvent],
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
    onRemove,
    onEdit,
    canEdit: !isReadOnly,
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

  useEffect(() => {
    if (!isEditing || !shouldRevealAdd.current) {
      return;
    }
    shouldRevealAdd.current = false;
    const node = scroller.current;
    node?.scrollTo({ left: node.scrollWidth, behavior: 'smooth' });
  }, [isEditing]);

  const showAddTile = canAdd && (isEditing || !isCustomized);

  const openGallery = () => {
    setAddSize(undefined);
    setIsGalleryOpen(true);
  };

  const onHideRail = () => {
    setIsEditing(false);
    setIsGalleryOpen(false);
    onHide();
  };

  const scrollByPage = (direction: 1 | -1) =>
    scroller.current?.scrollBy({
      left: direction * scroller.current.clientWidth * 0.85,
      behavior: 'smooth',
    });

  const onMenuAction = (widget: FeedWidget, action: FeedWidgetMenuAction) => {
    const index = widgets.findIndex(({ id }) => id === widget.id);
    switch (action.type) {
      case 'size':
        editing.flash(widget.id);
        resizeWidget(widget.id, action.size).then(
          (isSaved) =>
            isSaved &&
            logWidgetEvent(LogEvent.ResizeFeedWidget, widget, {
              method: 'menu',
              size: action.size,
            }),
        );
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
        editing.flash(widget.id);
        moveWidget(widget.id, target).then(
          (isSaved) =>
            isSaved &&
            logWidgetEvent(LogEvent.MoveFeedWidget, widget, {
              method: 'menu',
              from: index,
              to: target,
            }),
        );
        break;
      }
      case 'configure':
        setIsEditing(false);
        setConfiguringId(widget.id);
        break;
      case 'remove':
        onRemove(widget);
        break;
      default:
        break;
    }
  };

  const onAdd = (kind: FeedWidgetKind) => {
    const result = addWidget(kind, addSize);
    setIsGalleryOpen(false);
    if (!result) {
      return;
    }
    const { widget, saved } = result;
    saved.then(
      (isSaved) =>
        isSaved &&
        logWidgetEvent(LogEvent.AddFeedWidget, widget, {
          size: widget.size,
          source: addSize ? 'slot' : 'tile',
        }),
    );
    editing.flash(widget.id);
    const { name, configureLabel } = getFeedWidgetDefinition(kind);
    editing.setAnnouncement(`${name} added at the end.`);
    // A widget that needs setting up is set up right away: edit mode makes
    // its content inert, so it would sit there asking with dead buttons.
    if (configureLabel) {
      setIsEditing(false);
      setConfiguringId(widget.id);
    }
  };

  const isBusy = editing.isDragging || !!resizing || !!liftedId;

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
          // A rail a newer build saved renders here but is not edited here.
          canCustomize={!isReadOnly}
          isEditing={isEditing}
          isPhone={isPhone}
          showArrows={!isPhone}
          edges={edges}
          onScroll={scrollByPage}
          onAdd={canAdd ? openGallery : undefined}
          onHide={onHideRail}
          onToggleEditing={() => {
            if (!isEditing) {
              logWidgetEvent(LogEvent.CustomizeFeedWidgets);
              shouldRevealAdd.current = canAdd;
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
            !editing.isDragging &&
              (isPhone ? 'snap-x snap-mandatory' : 'snap-x snap-proximity'),
          )}
        >
          <div
            ref={grid}
            className={railGridClassName(isPhone)}
            style={railGridStyle(columns, isPhone)}
          >
            {layout.placements.map((placement) => {
              // An empty ad keeps its cell, so nothing moves; the grid shows
              // the first ad instead and the cell is offered for a widget.
              if (placement.isGap || (placement.isAd && isNoFill && !showTip)) {
                return canAdd ? (
                  <button
                    key={placement.key}
                    type="button"
                    data-widget-control
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
                    data-flip-id={placement.key}
                    className={classNames(
                      'flex min-h-0 snap-start',
                      showTip && 'flex-col gap-2',
                    )}
                    style={gridArea(placement)}
                    aria-label="Sponsored, pinned"
                  >
                    {showTip && (
                      <FeedWidgetTip
                        tip={tip}
                        isEditing={isEditing}
                        onRemove={isReadOnly ? undefined : onRemoveTip}
                      />
                    )}
                    {isNoFill ? (
                      canAdd && (
                        <button
                          type="button"
                          data-widget-control
                          onClick={() => setIsGalleryOpen(true)}
                          className="flex min-h-0 flex-1 items-center justify-center gap-2 rounded-16 border-2 border-dashed border-border-subtlest-tertiary text-text-quaternary transition-colors hover:border-border-subtlest-primary hover:bg-surface-hover hover:text-text-primary"
                          aria-label="Add another widget"
                        >
                          <PlusIcon />
                        </button>
                      )
                    ) : (
                      <FeedWidgetAdSlot
                        ad={ad}
                        isEditing={isEditing}
                        isCompact={showTip}
                        className="flex-1"
                      />
                    )}
                  </div>
                );
              }

              const { widget } = placement;
              if (!widget) {
                return null;
              }
              const shownWidget = shown.find(({ id }) => id === widget.id);
              const index = widgets.findIndex(({ id }) => id === widget.id);
              // Where it is now, mid-move included, for screen readers.
              const position = displayed.findIndex(
                ({ id }) => id === widget.id,
              );
              const definition = getFeedWidgetDefinition(widget.kind);
              const Component = getFeedWidgetComponent(widget.kind);
              if (!Component || !shownWidget) {
                return null;
              }
              const isDragged = dragId === widget.id;
              const isLifted = liftedId === widget.id;
              const sizes = sizesForScreen(widget.kind, isPhone);
              // On a phone the menu resizes: a corner grip is a poor touch
              // target, and its preview could reach a span the phone never
              // shows, writing a size to every other screen.
              const canResize = !isPhone && sizes.length > 1;

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
                    }${isEditing ? `, position ${position + 1}` : ''}`}
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
                    onContextMenu={editing.onItemContextMenu}
                    style={gridArea(placement)}
                    className={classNames(
                      'group/widget relative flex min-h-0 min-w-0 snap-start rounded-16 outline-none',
                      'focus-visible:ring-2 focus-visible:ring-accent-cabbage-default',
                      // No long-press callout: a hold on a widget enters edit
                      // mode, and in edit mode it starts a drag.
                      '[-webkit-touch-callout:none]',
                      isEditing && 'cursor-grab touch-pan-x select-none',
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
                      isInert={isEditing}
                    >
                      <OnScreen>
                        <Component
                          widget={widget}
                          size={shownWidget.size}
                          isEditing={isEditing}
                          onConfigChange={(config) => {
                            const isSaved = updateWidgetConfig(
                              widget.id,
                              config,
                            );
                            if (isSaved) {
                              logWidgetEvent(
                                LogEvent.ConfigureFeedWidget,
                                widget,
                              );
                            }
                            return isSaved;
                          }}
                          canConfigure={
                            !isReadOnly && !isNewerFeedWidgetConfig(widget)
                          }
                          isConfiguring={configuringId === widget.id}
                          onConfigureEnd={() => setConfiguringId(undefined)}
                        />
                      </OnScreen>
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
                            widget={shownWidget}
                            sizes={sizes}
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
                              onPointerCancel={editing.onResizeCancel}
                              onLostPointerCapture={editing.onResizeEnd}
                              className={classNames(
                                'feed-widget-controls-in absolute z-2 size-7 touch-none border-text-primary transition-transform duration-150 before:absolute before:-inset-2 hover:scale-110 motion-reduce:transition-none',
                                cornerClassName[corner],
                              )}
                            />
                          ))}
                        {resizing?.id === widget.id && (
                          <>
                            <span
                              aria-hidden
                              className="pointer-events-none absolute z-2 rounded-16 border border-dashed border-border-subtlest-primary"
                              style={{
                                ...cornerAnchor[resizing.corner],
                                width: resizing.width,
                                height: resizing.height,
                              }}
                            />
                            <span
                              aria-hidden
                              className="pointer-events-none absolute z-2 flex items-center justify-center rounded-16 border-2 border-accent-cabbage-default bg-surface-float backdrop-blur-sm transition-[width,height] duration-150 ease-out motion-reduce:transition-none"
                              style={{
                                ...cornerAnchor[resizing.corner],
                                width: resizing.targetWidth,
                                height: resizing.targetHeight,
                              }}
                            >
                              <span className="rounded-max bg-accent-cabbage-default px-3 py-1 font-bold text-white typo-footnote">
                                {feedWidgetSizeLabel[resizing.size]}
                              </span>
                            </span>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </React.Fragment>
              );
            })}
            {showAddTile && (
              <button
                type="button"
                onClick={openGallery}
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
          // Only where the slot shows, so the reader sees the tips come back.
          onRestoreTips={
            isTipHidden && showAd && !isReadOnly ? onRestoreTips : undefined
          }
          onRequestClose={() => setIsGalleryOpen(false)}
        />
      )}
    </FeedWidgetsProvider>
  );
};
