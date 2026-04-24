import type { ReactElement } from 'react';
import React, { useCallback } from 'react';
import classNames from 'classnames';
import { format } from 'date-fns';
import { useDndContext } from '../../../contexts/DndContext';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, TargetType } from '../../../lib/log';
import { isExtension } from '../../../lib/func';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { PauseIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { SidebarActionRow } from './SidebarCompactRow';

/**
 * Self-contained "Pause new tab" row. Lives next to the Mode picker because
 * pausing is conceptually another mode ("take a break"), not a widget toggle.
 *
 * - Inactive: clickable row that opens the DND modal (which owns the
 *   preset/custom duration picker).
 * - Active: non-clickable row with a Resume button + expiration label.
 *
 * Returns null outside the extension or when the DnD context isn't wired,
 * so callers can drop it in unconditionally.
 */
export const PauseNewTabRow = (): ReactElement | null => {
  const { logEvent } = useLogContext();
  const { setShowDnd, onDndSettings, isActive, dndSettings } = useDndContext();

  const onOpenDndModal = useCallback(() => {
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.CustomizeNewTab,
      target_id: 'dnd_open',
    });
    setShowDnd(true);
  }, [logEvent, setShowDnd]);

  const onUnpause = useCallback(async () => {
    if (!onDndSettings) {
      return;
    }
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.CustomizeNewTab,
      target_id: 'dnd_unpause',
    });
    await onDndSettings(null);
  }, [logEvent, onDndSettings]);

  if (!isExtension || !onDndSettings) {
    return null;
  }

  if (!isActive) {
    return (
      <SidebarActionRow
        label="Pause new tab"
        description="Temporarily hide the feed and notifications."
        icon={PauseIcon}
        onClick={onOpenDndModal}
      />
    );
  }

  const expiration = dndSettings?.expiration ?? null;
  const untilLabel = expiration
    ? `Paused until ${format(new Date(expiration), 'MMM d, h:mm a')}`
    : 'Paused';

  return (
    <div
      className={classNames(
        'flex min-h-9 items-center gap-3 rounded-10 bg-surface-float px-2 py-1.5',
      )}
    >
      <PauseIcon
        size={IconSize.Size16}
        secondary
        className="shrink-0 text-accent-cabbage-default"
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Typography type={TypographyType.Callout} className="truncate">
          Pause new tab
        </Typography>
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
          className="break-words"
        >
          {untilLabel}
        </Typography>
      </div>
      <Button
        type="button"
        variant={ButtonVariant.Secondary}
        size={ButtonSize.XSmall}
        onClick={onUnpause}
      >
        Resume
      </Button>
    </div>
  );
};
