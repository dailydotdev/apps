import type { ReactElement } from 'react';
import React, { useEffect, useMemo, useRef } from 'react';
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
import {
  LogEvent,
  ShortcutsSourceType,
  TargetType,
} from '../../../lib/log';
import { ShortcutTile } from './ShortcutTile';
import { AddShortcutTile } from './AddShortcutTile';
import { useShortcutsManager } from '../hooks/useShortcutsManager';
import {
  DEFAULT_SHORTCUTS_APPEARANCE,
  MAX_SHORTCUTS,
} from '../types';
import type {
  Shortcut,
  ShortcutsAppearance,
} from '../types';

interface WebappShortcutsRowProps {
  className?: string;
}

/**
 * Webapp-side shortcut row. Only renders when the user has enabled
 * `showShortcutsOnWebapp` from the extension's manage modal. Reuses the same
 * `ShortcutTile` and `useShortcutsManager` the extension hub does so edits
 * and reorders stay in sync across surfaces.
 *
 * Auto mode (live top-sites from the browser) is intentionally ignored on
 * the webapp — we don't have topSites permission outside the extension and
 * the "most visited sites" concept doesn't travel across devices anyway.
 * Manual curated shortcuts do.
 */
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

  const shortcuts: Shortcut[] = useMemo(
    () => manager.shortcuts.slice(0, MAX_SHORTCUTS),
    [manager.shortcuts],
  );

  // One-shot impression per enabled->rendered cycle. Lets us slice hub
  // adoption between "on the extension" and "on the webapp" without needing
  // client-side duplication.
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
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Same click-suppression guard the extension hub uses: dnd-kit swallows
  // the pointerdown→up sequence but the browser still fires a click on
  // release, so we have to intercept or the link would navigate mid-drag.
  const justDraggedRef = useRef(false);
  const armDragSuppression = () => {
    justDraggedRef.current = true;
  };
  const suppressClickCapture = (event: React.MouseEvent) => {
    if (!justDraggedRef.current) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    justDraggedRef.current = false;
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
    const overflowUrls = manager.shortcuts
      .slice(MAX_SHORTCUTS)
      .map((s) => s.url);
    manager.reorder([...arrayMove(urls, oldIndex, newIndex), ...overflowUrls]);
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

  // Gatekeeping: only render for opted-in users with something to show or
  // the ability to add. Users who haven't turned on the setting — or who
  // hid the row entirely — get nothing.
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
      className={classNames(
        'hidden flex-wrap items-center mobileXL:flex',
        appearance === 'tile' && 'gap-x-1 gap-y-2 items-start',
        appearance === 'icon' && 'gap-1',
        appearance === 'chip' && 'gap-1',
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
          onDropUrl={onDropUrl}
        />
      )}
    </div>
  );
}
