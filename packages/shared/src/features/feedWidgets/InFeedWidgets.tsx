import type { ReactElement } from 'react';
import React, { useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import classNames from 'classnames';
import { useInView } from 'react-intersection-observer';
import { MinusIcon } from '../../components/icons/Minus';
import { IconSize } from '../../components/Icon';
import { Button } from '../../components/buttons/Button';
import { ButtonSize, ButtonVariant } from '../../components/buttons/common';
import { useLogContext } from '../../contexts/LogContext';
import { useToastNotification } from '../../hooks/useToastNotification';
import { LogEvent, Origin, TargetType } from '../../lib/log';
import type { FeedWidget } from './types';
import {
  FEED_WIDGET_IN_FEED_SIZE,
  FEED_WIDGET_UNDO_MS,
  FeedWidgetKind,
  FeedWidgetSize,
  feedWidgetInFeedSizeLabel,
  feedWidgetInFeedSizes,
} from './types';
import { getFeedWidgetDefinition, isFeedWidgetBare } from './registry';
import { feedWidgetSizes, getFeedWidgetComponent } from './components';
import { useFeedWidgets } from './useFeedWidgets';
import { isNewerFeedWidgetConfig } from './config';
import { FeedWidgetsProvider } from './FeedWidgetsContext';
import { FeedWidgetLoading, FeedWidgetSurface } from './FeedWidgetFrame';
import type { FeedWidgetMenuAction } from './FeedWidgetMenu';
import { FeedWidgetMenu } from './FeedWidgetMenu';
import { useFeedWidgetsOptOut } from './feedState';
import { useInFeedWidgets } from './InFeedWidgetsContext';

// Opened on demand, so its code waits until a reader picks a slot.
const FeedWidgetGallery = dynamic(() =>
  import(
    /* webpackChunkName: "feedWidgetGallery" */ './FeedWidgetGallery'
  ).then((mod) => mod.FeedWidgetGallery),
);

const useLogWidgetEvent = () => {
  const { logEvent } = useLogContext();

  return useCallback(
    (eventName: LogEvent, widget?: FeedWidget, extra?: object) =>
      logEvent({
        event_name: eventName,
        target_type: TargetType.FeedWidget,
        target_id: widget?.kind,
        extra: JSON.stringify({ origin: Origin.FeedWidgets, ...extra }),
      }),
    [logEvent],
  );
};

/**
 * A widget's content mounts the first time its cell nears the screen, and so
 * does everything it fetches, so a widget far down the feed stays idle.
 */
const OnScreen = ({ children }: { children: ReactElement }): ReactElement => {
  const { ref, inView } = useInView({ triggerOnce: true, rootMargin: '200px' });
  return (
    <div ref={ref} className="flex min-h-0 min-w-0 flex-1 flex-col">
      {inView ? children : <FeedWidgetLoading />}
    </div>
  );
};

export type FeedWidgetCellProps = {
  widget: FeedWidget;
  feedName: string;
  /** The columns the layout gave it: two for a wide one that fits its row. */
  columns?: number;
};

/**
 * A placed widget, in the cell of the feed card it took the place of. It
 * renders at one card's size whatever size it was stored at. In Customize
 * mode its content goes inert and it carries a remove button and a menu to
 * move it a card along, set it up or remove it.
 */
export const FeedWidgetCell = ({
  widget: stored,
  feedName,
  columns = 1,
}: FeedWidgetCellProps): ReactElement | null => {
  const {
    widgets,
    isReadOnly,
    removeWidget,
    restoreWidget,
    moveWidget,
    resizeWidget,
    updateWidgetConfig,
  } = useFeedWidgets();
  const {
    isEditing,
    setIsEditing,
    configuringId,
    setConfiguringId,
    flashId,
    setFlashId,
  } = useInFeedWidgets();
  const { displayToast } = useToastNotification();
  const logWidgetEvent = useLogWidgetEvent();
  // As this build can render it: a known kind, its config validated.
  const widget = widgets.find(({ id }) => id === stored.id) ?? stored;
  const Component = getFeedWidgetComponent(widget.kind);
  const definition = getFeedWidgetDefinition(widget.kind);
  const slot = widget.slot ?? 0;
  // Wide where the row had room for it; a wide one in the last column
  // narrows to one card, as a hero card does.
  const size = columns > 1 ? FeedWidgetSize.Large : FEED_WIDGET_IN_FEED_SIZE;
  const sizes = feedWidgetSizes(widget.kind).filter((value) =>
    feedWidgetInFeedSizes.includes(value),
  );
  const canEdit = isEditing && !isReadOnly;

  const onRemove = () => {
    const result = removeWidget(widget.id);
    if (!result) {
      return;
    }
    const { removed, saved } = result;
    saved.then(
      (isSaved) =>
        isSaved && logWidgetEvent(LogEvent.RemoveFeedWidget, widget, { slot }),
    );
    displayToast(`${definition.name} removed`, {
      timer: FEED_WIDGET_UNDO_MS,
      action: {
        copy: 'Undo',
        onClick: () =>
          restoreWidget(removed).then(
            (isSaved) =>
              isSaved && logWidgetEvent(LogEvent.UndoRemoveFeedWidget, widget),
          ),
      },
    });
  };

  const onMenuAction = (action: FeedWidgetMenuAction) => {
    switch (action.type) {
      case 'size':
        setFlashId(widget.id);
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
        const to = action.to === 'left' ? slot - 1 : slot + 1;
        setFlashId(widget.id);
        moveWidget(widget.id, to).then(
          (isSaved) =>
            isSaved &&
            logWidgetEvent(LogEvent.MoveFeedWidget, widget, {
              method: 'menu',
              from: slot,
              to,
            }),
        );
        break;
      }
      case 'configure':
        setIsEditing(false);
        setConfiguringId(widget.id);
        break;
      case 'remove':
        onRemove();
        break;
      default:
        break;
    }
  };

  if (!Component) {
    return null;
  }

  return (
    // The content sits in an absolute layer so its own height never
    // stretches the feed's row; the cell takes the row's height.
    <div
      data-testid="feedWidget"
      data-kind={widget.kind}
      data-slot={slot}
      aria-label={definition.name}
      role="group"
      className={classNames(
        'relative min-h-card w-full min-w-0 rounded-16',
        canEdit && 'select-none',
        flashId === widget.id && 'feed-widget-flash',
      )}
      onAnimationEnd={(event) => {
        if (event.animationName === 'feed-widget-flash') {
          setFlashId(undefined);
        }
      }}
    >
      <div className="absolute inset-0 flex flex-col">
        <FeedWidgetsProvider
          feedName={feedName}
          isEditing={isEditing}
          hasTopStory={widget.kind === FeedWidgetKind.TopStory}
        >
          <FeedWidgetSurface
            isBare={isFeedWidgetBare(widget.kind, size)}
            isInert={isEditing}
          >
            <OnScreen>
              <Component
                widget={widget}
                size={size}
                isEditing={isEditing}
                onConfigChange={(config) => {
                  const isSaved = updateWidgetConfig(widget.id, config);
                  if (isSaved) {
                    logWidgetEvent(LogEvent.ConfigureFeedWidget, widget);
                  }
                  return isSaved;
                }}
                canConfigure={!isReadOnly && !isNewerFeedWidgetConfig(widget)}
                isConfiguring={configuringId === widget.id}
                onConfigureEnd={() => setConfiguringId(undefined)}
              />
            </OnScreen>
          </FeedWidgetSurface>
        </FeedWidgetsProvider>
      </div>
      {canEdit && (
        <>
          <button
            type="button"
            aria-label={`Remove ${definition.name}`}
            onClick={onRemove}
            className="feed-widget-controls-in absolute -left-2 -top-2 z-3 flex size-6 items-center justify-center rounded-max bg-text-primary text-surface-invert shadow-2"
          >
            <MinusIcon size={IconSize.Size16} />
          </button>
          <FeedWidgetMenu
            widget={widget}
            sizes={sizes.length > 1 ? sizes : []}
            sizeLabel={(value) => feedWidgetInFeedSizeLabel[value] ?? value}
            moves={['left', 'right']}
            canMoveLeft={slot > 0}
            canMoveRight
            onAction={onMenuAction}
          />
        </>
      )}
    </div>
  );
};

/**
 * Customize mode's own controls: a bar floating over the feed with the way
 * out, and the gallery once the reader picks a slot. Adding places the widget
 * on that slot and leaves Customize mode, so the feed reads as it will.
 */
export const FeedWidgetEditor = (): ReactElement => {
  const { widgets, canAdd, isReadOnly, addWidget } = useFeedWidgets();
  const {
    isEditing,
    setIsEditing,
    addingSlot,
    setAddingSlot,
    setConfiguringId,
    setFlashId,
  } = useInFeedWidgets();
  const { hide } = useFeedWidgetsOptOut();
  const logWidgetEvent = useLogWidgetEvent();

  useEffect(() => {
    if (!isEditing || addingSlot !== null) {
      return undefined;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsEditing(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isEditing, addingSlot, setIsEditing]);

  useEffect(() => {
    if (addingSlot !== null) {
      logWidgetEvent(LogEvent.OpenFeedWidgetGallery, undefined, {
        source: 'slot',
        slot: addingSlot,
      });
    }
  }, [addingSlot, logWidgetEvent]);

  const onAdd = (kind: FeedWidgetKind, size: FeedWidgetSize) => {
    const slot = addingSlot ?? 0;
    setAddingSlot(null);
    const result = addWidget(kind, { size, slot });
    if (!result) {
      return;
    }
    const { widget, saved } = result;
    saved.then(
      (isSaved) =>
        isSaved &&
        logWidgetEvent(LogEvent.AddFeedWidget, widget, {
          size: widget.size,
          source: 'slot',
          slot,
        }),
    );
    setIsEditing(false);
    setFlashId(widget.id);
    // A widget that needs setting up is set up right away.
    if (getFeedWidgetDefinition(kind).configureLabel) {
      setConfiguringId(widget.id);
    }
  };

  return (
    <>
      {isEditing && (
        <div className="pointer-events-none fixed inset-x-0 bottom-[calc(1.5rem+var(--sponsor-strip-height,0rem))] z-header flex justify-center px-4">
          <div
            role="toolbar"
            aria-label="Customize widgets"
            className="pointer-events-auto flex items-center gap-3 rounded-16 border border-border-subtlest-tertiary bg-background-popover py-2 pl-4 pr-2 shadow-2"
          >
            <span className="text-text-secondary typo-callout">
              {canAdd
                ? 'Pick a card to put a widget in its place'
                : 'You have all the widgets you can add'}
            </span>
            <Button
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.Small}
              onClick={() => {
                setIsEditing(false);
                hide();
              }}
            >
              Hide widgets
            </Button>
            <Button
              variant={ButtonVariant.Primary}
              size={ButtonSize.Small}
              onClick={() => setIsEditing(false)}
            >
              Done
            </Button>
          </div>
        </div>
      )}
      {addingSlot !== null && !isReadOnly && (
        <FeedWidgetGallery
          widgets={widgets}
          isFull={!canAdd}
          allowedSizes={feedWidgetInFeedSizes}
          sizeLabel={(size) => feedWidgetInFeedSizeLabel[size] ?? size}
          onAdd={onAdd}
          onRequestClose={() => setAddingSlot(null)}
        />
      )}
    </>
  );
};
