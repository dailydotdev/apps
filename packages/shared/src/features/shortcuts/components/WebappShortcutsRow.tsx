import type { ReactElement } from 'react';
import React, { useEffect, useRef } from 'react';
import classNames from 'classnames';
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  horizontalListSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { useSettingsContext } from '../../../contexts/SettingsContext';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, ShortcutsSourceType, TargetType } from '../../../lib/log';
import { ShortcutTile } from './ShortcutTile';
import { AddShortcutTile } from './AddShortcutTile';
import {
  useDragClickGuard,
  DRAG_ACTIVATION_DISTANCE_PX,
} from '../hooks/useDragClickGuard';
import { DEFAULT_SHORTCUTS_APPEARANCE } from '../types';
import type { ShortcutsAppearance } from '../types';
import { useManualShortcutsRow } from '../hooks/useManualShortcutsRow';

interface WebappShortcutsRowProps {
  className?: string;
}

// Shares `ShortcutTile` / `useShortcutsManager` with the extension hub so
// edits and reorders stay in sync. Auto mode is ignored — we don't have
// topSites permission on the webapp and live browser history doesn't
// translate across devices anyway.
export function WebappShortcutsRow({
  className,
}: WebappShortcutsRowProps): ReactElement | null {
  const { flags, showTopSites } = useSettingsContext();
  const { logEvent } = useLogContext();
  const manualRow = useManualShortcutsRow();
  const { shortcuts } = manualRow;

  const enabled = flags?.showShortcutsOnWebapp ?? false;
  const appearance: ShortcutsAppearance =
    flags?.shortcutsAppearance ?? DEFAULT_SHORTCUTS_APPEARANCE;

  const loggedRef = useRef(false);
  useEffect(() => {
    if (loggedRef.current) {
      return;
    }
    if (!enabled || !showTopSites || shortcuts.length === 0) {
      return;
    }
    loggedRef.current = true;
    logEvent({
      event_name: LogEvent.Impression,
      target_type: TargetType.Shortcuts,
      extra: JSON.stringify({
        source: ShortcutsSourceType.Custom,
        surface: 'webapp',
      }),
    });
  }, [enabled, showTopSites, shortcuts.length, logEvent]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: DRAG_ACTIVATION_DISTANCE_PX },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Same drag-guard plumbing as `ShortcutLinksHub` — see that file for the
  // full rationale on post-drag click + native URL-drag suppression.
  const { armGuard: armDragSuppression, onClickCapture: suppressClickCapture } =
    useDragClickGuard();

  const suppressNativeDragCapture = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDragEnd = (event: DragEndEvent) => {
    armDragSuppression();
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }
    manualRow.reorderShortcuts(active.id as string, over.id as string);
  };

  if (!enabled || !showTopSites) {
    return null;
  }
  if (shortcuts.length === 0 && !manualRow.canAdd) {
    return null;
  }

  return (
    <div
      role="toolbar"
      aria-label="Shortcuts"
      onClickCapture={suppressClickCapture}
      onAuxClickCapture={suppressClickCapture}
      onDragStartCapture={suppressNativeDragCapture}
      {...manualRow.dropHandlers}
      className={classNames(
        'hidden flex-wrap items-center mobileXL:flex',
        appearance === 'tile' && 'items-start gap-x-1 gap-y-2',
        appearance === 'icon' && 'gap-1',
        appearance === 'chip' && 'gap-1',
        'rounded-12 transition-[box-shadow,background-color] duration-150 motion-reduce:transition-none',
        manualRow.isDropTarget &&
          'bg-overlay-float-cabbage ring-2 ring-accent-cabbage-default ring-offset-4 ring-offset-background-default',
        className,
      )}
    >
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={armDragSuppression}
        onDragCancel={armDragSuppression}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={shortcuts.map((s) => s.url)}
          strategy={horizontalListSortingStrategy}
        >
          {shortcuts.map((shortcut) => (
            <ShortcutTile
              key={shortcut.url}
              shortcut={shortcut}
              appearance={appearance}
              onEdit={manualRow.onEdit}
              onRemove={manualRow.onRemove}
            />
          ))}
        </SortableContext>
      </DndContext>
      {manualRow.canAdd && (
        <AddShortcutTile
          appearance={appearance}
          onClick={manualRow.onAdd}
          acceptsDroppedUrl={manualRow.canAdd}
          isDropActive={manualRow.isDropTarget}
        />
      )}
    </div>
  );
}
