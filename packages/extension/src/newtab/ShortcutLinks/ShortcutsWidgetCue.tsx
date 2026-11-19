import type { ReactElement } from 'react';
import React, { useCallback } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import CloseButton from '@dailydotdev/shared/src/components/CloseButton';
import { ShortcutsIcon } from '@dailydotdev/shared/src/components/icons/Shortcuts';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { useFeedWidgets } from '@dailydotdev/shared/src/features/feedWidgets/useFeedWidgets';
import {
  FEED_WIDGET_UNDO_MS,
  FeedWidgetKind,
} from '@dailydotdev/shared/src/features/feedWidgets/types';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import { useToastNotification } from '@dailydotdev/shared/src/hooks/useToastNotification';
import { LogEvent, Origin, TargetType } from '@dailydotdev/shared/src/lib/log';

interface ShortcutsWidgetCueProps {
  className?: string;
  onDismiss: () => void;
}

export function ShortcutsWidgetCue({
  className,
  onDismiss,
}: ShortcutsWidgetCueProps): ReactElement | null {
  const { canAdd, addWidget, removeWidget } = useFeedWidgets();
  const { logEvent } = useLogContext();
  const { displayToast } = useToastNotification();

  const logWidgetEvent = useCallback(
    (eventName: LogEvent, extra?: object) =>
      logEvent({
        event_name: eventName,
        target_type: TargetType.FeedWidget,
        target_id: FeedWidgetKind.Shortcuts,
        extra: JSON.stringify({ origin: Origin.FeedWidgets, ...extra }),
      }),
    [logEvent],
  );

  const onMove = () => {
    // The feed's first card, so they stay on the first screen where the row
    // was.
    const result = addWidget(FeedWidgetKind.Shortcuts, { slot: 0 });
    if (!result) {
      return;
    }
    const { widget, saved } = result;
    saved.then((isSaved) => {
      if (!isSaved) {
        return;
      }
      logWidgetEvent(LogEvent.AddFeedWidget, {
        size: widget.size,
        source: 'shortcuts_row',
      });
      displayToast('Shortcuts moved into your feed', {
        timer: FEED_WIDGET_UNDO_MS,
        action: {
          copy: 'Undo',
          onClick: () =>
            removeWidget(widget.id)?.saved.then(
              (isUndone) =>
                isUndone &&
                logWidgetEvent(LogEvent.RemoveFeedWidget, {
                  source: 'shortcuts_row_undo',
                }),
            ),
        },
      });
    });
  };

  if (!canAdd) {
    return null;
  }

  return (
    <div
      role="region"
      aria-label="Move shortcuts into your feed"
      className={classNames(
        'flex w-full max-w-[40rem] items-center gap-3 rounded-16 border border-accent-cabbage-default bg-surface-float py-2 pl-3 pr-2',
        className,
      )}
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-10 bg-overlay-float-cabbage text-accent-cabbage-default">
        <ShortcutsIcon secondary size={IconSize.Small} />
      </span>
      <p className="min-w-0 flex-1 text-text-secondary typo-callout">
        <strong className="text-text-primary">New:</strong> your shortcuts can
        now live in your feed, as its first card. Keep them up here or move
        them, either works.
      </p>
      <Button
        type="button"
        variant={ButtonVariant.Primary}
        size={ButtonSize.Small}
        onClick={onMove}
      >
        Move to feed
      </Button>
      <CloseButton
        type="button"
        size={ButtonSize.Small}
        aria-label="Keep shortcuts here"
        title="Keep shortcuts here"
        onClick={onDismiss}
      />
    </div>
  );
}
