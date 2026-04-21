import type { ReactElement } from 'react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  EditIcon,
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
import type {
  Shortcut,
  ShortcutsMode,
} from '@dailydotdev/shared/src/features/shortcuts/types';
import { MAX_SHORTCUTS } from '@dailydotdev/shared/src/features/shortcuts/types';

interface ShortcutLinksHubProps {
  shouldUseListFeedLayout: boolean;
}

export function ShortcutLinksHub({
  shouldUseListFeedLayout,
}: ShortcutLinksHubProps): ReactElement {
  const { openModal } = useLazyModal();
  const { toggleShowTopSites, showTopSites, flags, updateFlag } =
    useSettingsContext();
  const { logEvent } = useLogContext();
  const manager = useShortcutsManager();
  const {
    setShowImportSource,
    topSites,
    hasCheckedPermission: hasCheckedTopSitesPermission,
    askTopSitesPermission,
    onRevokePermission,
    bookmarks,
    revokeBookmarksPermission,
  } = useShortcuts();

  // `undefined` means "permission not granted". An empty array means granted
  // but nothing available. We only show Revoke entries when truly granted.
  const hasTopSitesAccess = topSites !== undefined;
  const hasBookmarksAccess = bookmarks !== undefined;

  // Default to 'manual' so existing users keep their curated lists. Auto mode
  // is opt-in via the overflow menu (users who grant topSites permission and
  // prefer Chrome-style live tiles).
  const mode: ShortcutsMode = flags?.shortcutsMode ?? 'manual';
  const isAuto = mode === 'auto';

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

  const loggedRef = useRef<ShortcutsMode | null>(null);
  useEffect(() => {
    if (!showTopSites) {
      return;
    }
    if (loggedRef.current === mode) {
      return;
    }
    loggedRef.current = mode;
    logEvent({
      event_name: LogEvent.Impression,
      target_type: TargetType.Shortcuts,
      extra: JSON.stringify({
        source: isAuto
          ? ShortcutsSourceType.Browser
          : ShortcutsSourceType.Custom,
      }),
    });
  }, [logEvent, showTopSites, mode, isAuto]);

  const [reorderAnnouncement, setReorderAnnouncement] = useState('');

  // Auto mode: render live top sites from the browser (read-only).
  // Manual mode: render the curated customLinks (editable).
  const autoShortcuts: Shortcut[] = useMemo(
    () =>
      (topSites ?? [])
        .slice(0, MAX_SHORTCUTS)
        .map((site) => ({ url: site.url, name: site.title || undefined })),
    [topSites],
  );
  const manualShortcuts = manager.shortcuts.slice(0, MAX_SHORTCUTS);
  const overflowCount = isAuto
    ? 0
    : manager.shortcuts.length - manualShortcuts.length;
  const visibleShortcuts = isAuto ? autoShortcuts : manualShortcuts;

  const handleDragEnd = (event: DragEndEvent) => {
    justDraggedRef.current = true;
    if (isAuto) {
      return;
    }
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }
    const urls = manualShortcuts.map((s) => s.url);
    const oldIndex = urls.indexOf(active.id as string);
    const newIndex = urls.indexOf(over.id as string);
    if (oldIndex < 0 || newIndex < 0) {
      return;
    }
    const overflowUrls = manager.shortcuts
      .slice(MAX_SHORTCUTS)
      .map((s) => s.url);
    manager.reorder([...arrayMove(urls, oldIndex, newIndex), ...overflowUrls]);
    const moved = manualShortcuts[oldIndex];
    const label = moved?.name || moved?.url || 'Shortcut';
    setReorderAnnouncement(
      `Moved ${label} to position ${newIndex + 1} of ${urls.length}`,
    );
  };

  const onLinkClick = () =>
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.Shortcuts,
      extra: JSON.stringify({
        source: isAuto
          ? ShortcutsSourceType.Browser
          : ShortcutsSourceType.Custom,
      }),
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

  const requestTopSitesAccess = async () => {
    // Unlike the import flow, we only need READ access here — we're not
    // copying sites into customLinks, just rendering whatever the browser
    // exposes. If the user declines we stay on the empty-state CTA.
    const granted = await askTopSitesPermission();
    return granted;
  };

  const switchToAuto = async () => {
    await updateFlag('shortcutsMode', 'auto');
    if (!hasCheckedTopSitesPermission || topSites === undefined) {
      await requestTopSitesAccess();
    }
  };

  const switchToManual = () => updateFlag('shortcutsMode', 'manual');

  const revokeTopSitesItem = hasTopSitesAccess
    ? [
        {
          icon: <WrappingMenuIcon Icon={SitesIcon} />,
          label: 'Revoke Most visited sites access',
          action: onRevokePermission,
        },
      ]
    : [];
  const revokeBookmarksItem =
    hasBookmarksAccess && revokeBookmarksPermission
      ? [
          {
            icon: <WrappingMenuIcon Icon={BookmarkIcon} />,
            label: 'Revoke Bookmarks bar access',
            action: () => revokeBookmarksPermission(),
          },
        ]
      : [];

  const menuOptions = isAuto
    ? [
        {
          icon: <WrappingMenuIcon Icon={EditIcon} />,
          label: 'Switch to My shortcuts',
          action: switchToManual,
        },
        ...revokeTopSitesItem,
        {
          icon: <WrappingMenuIcon Icon={EyeIcon} />,
          label: 'Hide shortcuts',
          action: toggleShowTopSites,
        },
      ]
    : [
        {
          icon: <WrappingMenuIcon Icon={PlusIcon} />,
          label: 'Add shortcut',
          action: onAdd,
        },
        {
          icon: <WrappingMenuIcon Icon={SitesIcon} />,
          label: 'Switch to Most visited sites',
          action: switchToAuto,
        },
        {
          icon: <WrappingMenuIcon Icon={SitesIcon} />,
          label: 'Import from Most visited sites',
          action: () => setShowImportSource?.('topSites'),
        },
        {
          icon: <WrappingMenuIcon Icon={BookmarkIcon} />,
          label: 'Import from Bookmarks bar',
          action: () => setShowImportSource?.('bookmarks'),
        },
        {
          icon: <WrappingMenuIcon Icon={SettingsIcon} />,
          label: 'Manage',
          action: onManage,
        },
        ...revokeTopSitesItem,
        ...revokeBookmarksItem,
        {
          icon: <WrappingMenuIcon Icon={EyeIcon} />,
          label: 'Hide shortcuts',
          action: toggleShowTopSites,
        },
      ];

  // Auto mode with no permission yet: show a clear CTA tile so the user knows
  // why the row is empty and can grant access or switch back to manual.
  const showAutoEmptyState = isAuto && visibleShortcuts.length === 0;

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
              draggable={!isAuto}
              onEdit={isAuto ? undefined : onEdit}
              onRemove={isAuto ? undefined : onRemove}
            />
          ))}
        </SortableContext>
      </DndContext>
      {!isAuto && manager.canAdd && <AddShortcutTile onClick={onAdd} />}
      {showAutoEmptyState && (
        <button
          type="button"
          onClick={requestTopSitesAccess}
          className="flex h-12 items-center gap-2 rounded-14 border border-dashed border-border-subtlest-tertiary px-4 text-text-tertiary typo-callout hover:border-accent-cabbage-default hover:text-accent-cabbage-default"
        >
          Grant access to show Most visited sites
        </button>
      )}
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
