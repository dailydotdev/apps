import type { ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';
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
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuOptions,
  DropdownMenuTrigger,
} from '@dailydotdev/shared/src/components/dropdown/DropdownMenu';
import {
  BookmarkIcon,
  EyeIcon,
  MenuIcon,
  PlusIcon,
  SettingsIcon,
  SitesIcon,
} from '@dailydotdev/shared/src/components/icons';
import { MenuIcon as WrappingMenuIcon } from '@dailydotdev/shared/src/components/MenuIcon';
import { useLazyModal } from '@dailydotdev/shared/src/hooks/useLazyModal';
import { LazyModal } from '@dailydotdev/shared/src/components/modals/common/types';
import { ShortcutTile } from '@dailydotdev/shared/src/features/shortcuts/components/ShortcutTile';
import { AddShortcutTile } from '@dailydotdev/shared/src/features/shortcuts/components/AddShortcutTile';
import { useShortcutsManager } from '@dailydotdev/shared/src/features/shortcuts/hooks/useShortcutsManager';
import { useShortcuts } from '@dailydotdev/shared/src/features/shortcuts/contexts/ShortcutsProvider';
import { useSettingsContext } from '@dailydotdev/shared/src/contexts/SettingsContext';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import {
  LogEvent,
  ShortcutsSourceType,
  TargetType,
} from '@dailydotdev/shared/src/lib/log';
import type { Shortcut } from '@dailydotdev/shared/src/features/shortcuts/types';
import { MAX_SHORTCUTS } from '@dailydotdev/shared/src/features/shortcuts/types';

interface ShortcutLinksHubProps {
  shouldUseListFeedLayout: boolean;
}

export function ShortcutLinksHub({
  shouldUseListFeedLayout,
}: ShortcutLinksHubProps): ReactElement {
  const { openModal } = useLazyModal();
  const { toggleShowTopSites, showTopSites } = useSettingsContext();
  const { logEvent } = useLogContext();
  const manager = useShortcutsManager();
  const { setShowImportSource } = useShortcuts();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const justDraggedRef = useRef(false);
  const suppressClickCapture = (event: React.MouseEvent) => {
    if (!justDraggedRef.current) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    justDraggedRef.current = false;
  };

  const loggedRef = useRef(false);
  useEffect(() => {
    if (loggedRef.current || !showTopSites) {
      return;
    }
    loggedRef.current = true;
    logEvent({
      event_name: LogEvent.Impression,
      target_type: TargetType.Shortcuts,
      extra: JSON.stringify({ source: ShortcutsSourceType.Custom }),
    });
  }, [logEvent, showTopSites]);

  const [reorderAnnouncement, setReorderAnnouncement] = useState('');

  // Defensive cap: never render more than MAX_SHORTCUTS tiles on the new tab
  // even if `customLinks` somehow contains more (legacy data, cross-device
  // sync, direct settings mutation). Overflow stays visible + removable in
  // the Manage modal. Mirrors Chrome's new-tab behaviour of a fixed cap.
  const visibleShortcuts = manager.shortcuts.slice(0, MAX_SHORTCUTS);
  const overflowCount = manager.shortcuts.length - visibleShortcuts.length;

  const handleDragEnd = (event: DragEndEvent) => {
    justDraggedRef.current = true;
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }
    const urls = visibleShortcuts.map((s) => s.url);
    const oldIndex = urls.indexOf(active.id as string);
    const newIndex = urls.indexOf(over.id as string);
    if (oldIndex < 0 || newIndex < 0) {
      return;
    }
    // Reorder affects only the visible window; append any overflow so we
    // don't silently drop them from customLinks.
    const overflowUrls = manager.shortcuts
      .slice(MAX_SHORTCUTS)
      .map((s) => s.url);
    manager.reorder([...arrayMove(urls, oldIndex, newIndex), ...overflowUrls]);
    const moved = visibleShortcuts[oldIndex];
    const label = moved?.name || moved?.url || 'Shortcut';
    setReorderAnnouncement(
      `Moved ${label} to position ${newIndex + 1} of ${urls.length}`,
    );
  };

  const onLinkClick = () =>
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.Shortcuts,
      extra: JSON.stringify({ source: ShortcutsSourceType.Custom }),
    });

  const onEdit = (shortcut: Shortcut) =>
    openModal({
      type: LazyModal.ShortcutEdit,
      props: { mode: 'edit', shortcut },
    });

  const onRemove = (shortcut: Shortcut) => manager.removeShortcut(shortcut.url);

  const onAdd = () =>
    openModal({ type: LazyModal.ShortcutEdit, props: { mode: 'add' } });

  const onManage = () => openModal({ type: LazyModal.ShortcutsManage });

  const menuOptions = [
    {
      icon: <WrappingMenuIcon Icon={PlusIcon} />,
      label: 'Add shortcut',
      action: onAdd,
    },
    {
      icon: <WrappingMenuIcon Icon={SitesIcon} />,
      label: 'Import from browser',
      action: () => setShowImportSource?.('topSites'),
    },
    {
      icon: <WrappingMenuIcon Icon={BookmarkIcon} />,
      label: 'Import from bookmarks',
      action: () => setShowImportSource?.('bookmarks'),
    },
    {
      icon: <WrappingMenuIcon Icon={EyeIcon} />,
      label: 'Hide',
      action: toggleShowTopSites,
    },
    {
      icon: <WrappingMenuIcon Icon={SettingsIcon} />,
      label: 'Manage',
      action: onManage,
    },
  ];

  return (
    <div
      role="toolbar"
      aria-label="Shortcuts"
      onClickCapture={suppressClickCapture}
      onAuxClickCapture={suppressClickCapture}
      className={classNames(
        'hidden flex-wrap items-start gap-x-3 gap-y-4 tablet:flex',
        shouldUseListFeedLayout ? 'mx-6 mb-3 mt-1' : 'mb-5',
      )}
    >
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={visibleShortcuts.map((s) => s.url)}
          strategy={horizontalListSortingStrategy}
        >
          {visibleShortcuts.map((shortcut) => (
            <ShortcutTile
              key={shortcut.url}
              shortcut={shortcut}
              onClick={onLinkClick}
              onEdit={onEdit}
              onRemove={onRemove}
            />
          ))}
        </SortableContext>
      </DndContext>
      {manager.canAdd && <AddShortcutTile onClick={onAdd} />}
      {overflowCount > 0 && (
        <button
          type="button"
          onClick={onManage}
          className="mt-2 text-text-tertiary underline typo-caption1 hover:text-text-primary"
        >
          +{overflowCount} more
        </button>
      )}
      <span role="status" aria-live="polite" className="sr-only">
        {reorderAnnouncement}
      </span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            icon={<MenuIcon className="rotate-90" secondary />}
            className="mt-2 transition-transform duration-150 hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            aria-label="toggle shortcuts menu"
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuOptions options={menuOptions} />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
