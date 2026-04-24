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
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { useSettingsContext } from '../../../contexts/SettingsContext';
import { useLogContext } from '../../../contexts/LogContext';
import { useLazyModal } from '../../../hooks/useLazyModal';
import { useToastNotification } from '../../../hooks/useToastNotification';
import { LazyModal } from '../../../components/modals/common/types';
import { LogEvent, ShortcutsSourceType, TargetType } from '../../../lib/log';
import { ShortcutTile } from './ShortcutTile';
import { AddShortcutTile } from './AddShortcutTile';
import { useShortcutsManager } from '../hooks/useShortcutsManager';
import {
  useDragClickGuard,
  DRAG_ACTIVATION_DISTANCE_PX,
} from '../hooks/useDragClickGuard';
import { useShortcutDropZone } from '../hooks/useShortcutDropZone';
import { DEFAULT_SHORTCUTS_APPEARANCE } from '../types';
import type { Shortcut, ShortcutsAppearance } from '../types';

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
  const { openModal } = useLazyModal();
  const { displayToast } = useToastNotification();
  const { logEvent } = useLogContext();
  const manager = useShortcutsManager();

  const enabled = flags?.showShortcutsOnWebapp ?? false;
  const appearance: ShortcutsAppearance =
    flags?.shortcutsAppearance ?? DEFAULT_SHORTCUTS_APPEARANCE;
  const shortcuts = manager.shortcuts;

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
    const urls = shortcuts.map((s) => s.url);
    const oldIndex = urls.indexOf(active.id as string);
    const newIndex = urls.indexOf(over.id as string);
    if (oldIndex < 0 || newIndex < 0) {
      return;
    }
    manager.reorder(arrayMove(urls, oldIndex, newIndex));
  };

  const onEdit = (shortcut: Shortcut) =>
    openModal({
      type: LazyModal.ShortcutEdit,
      props: { mode: 'edit', shortcut },
    });

  const onRemove = (shortcut: Shortcut) => manager.removeShortcut(shortcut.url);

  const onAdd = () =>
    openModal({ type: LazyModal.ShortcutEdit, props: { mode: 'add' } });

  const onDropUrl = async (url: string) => {
    const result = await manager.addShortcut({ url });
    if (result.error) {
      displayToast(result.error);
    }
  };

  const canAcceptDroppedUrl = manager.canAdd;
  const { isDropTarget, dropHandlers } = useShortcutDropZone(
    onDropUrl,
    canAcceptDroppedUrl,
  );

  if (!enabled || !showTopSites) {
    return null;
  }
  if (shortcuts.length === 0 && !manager.canAdd) {
    return null;
  }

  return (
    <div
      role="toolbar"
      aria-label="Shortcuts"
      onClickCapture={suppressClickCapture}
      onAuxClickCapture={suppressClickCapture}
      onDragStartCapture={suppressNativeDragCapture}
      {...dropHandlers}
      className={classNames(
        'hidden flex-wrap items-center mobileXL:flex',
        appearance === 'tile' && 'items-start gap-x-1 gap-y-2',
        appearance === 'icon' && 'gap-1',
        appearance === 'chip' && 'gap-1',
        'rounded-12 transition-[box-shadow,background-color] duration-150 motion-reduce:transition-none',
        isDropTarget &&
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
              onEdit={onEdit}
              onRemove={onRemove}
            />
          ))}
        </SortableContext>
      </DndContext>
      {manager.canAdd && (
        <AddShortcutTile
          appearance={appearance}
          onClick={onAdd}
          acceptsDroppedUrl={canAcceptDroppedUrl}
          isDropActive={isDropTarget}
        />
      )}
    </div>
  );
}
