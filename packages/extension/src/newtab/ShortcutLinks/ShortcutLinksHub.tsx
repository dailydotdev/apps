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
import { Switch } from '@dailydotdev/shared/src/components/fields/Switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuOptions,
  DropdownMenuTrigger,
} from '@dailydotdev/shared/src/components/dropdown/DropdownMenu';
import {
  EyeIcon,
  MenuIcon,
  SettingsIcon,
} from '@dailydotdev/shared/src/components/icons';
import { ChromeIcon } from '@dailydotdev/shared/src/components/icons/Browser/Chrome';
import { MenuIcon as WrappingMenuIcon } from '@dailydotdev/shared/src/components/MenuIcon';
import { useLazyModal } from '@dailydotdev/shared/src/hooks/useLazyModal';
import { LazyModal } from '@dailydotdev/shared/src/components/modals/common/types';
import { ShortcutTile } from '@dailydotdev/shared/src/features/shortcuts/components/ShortcutTile';
import { AddShortcutTile } from '@dailydotdev/shared/src/features/shortcuts/components/AddShortcutTile';
import { useShortcutsManager } from '@dailydotdev/shared/src/features/shortcuts/hooks/useShortcutsManager';
import { useHiddenTopSites } from '@dailydotdev/shared/src/features/shortcuts/hooks/useHiddenTopSites';
import {
  useDragClickGuard,
  DRAG_ACTIVATION_DISTANCE_PX,
} from '@dailydotdev/shared/src/features/shortcuts/hooks/useDragClickGuard';
import { useShortcutDropZone } from '@dailydotdev/shared/src/features/shortcuts/hooks/useShortcutDropZone';
import { useShortcuts } from '@dailydotdev/shared/src/features/shortcuts/contexts/ShortcutsProvider';
import { useSettingsContext } from '@dailydotdev/shared/src/contexts/SettingsContext';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import { useToastNotification } from '@dailydotdev/shared/src/hooks/useToastNotification';
import {
  LogEvent,
  ShortcutsSourceType,
  TargetType,
} from '@dailydotdev/shared/src/lib/log';
import type {
  Shortcut,
  ShortcutsAppearance,
  ShortcutsMode,
} from '@dailydotdev/shared/src/features/shortcuts/types';
import {
  DEFAULT_SHORTCUTS_APPEARANCE,
  MAX_SHORTCUTS,
} from '@dailydotdev/shared/src/features/shortcuts/types';

interface ShortcutLinksHubProps {
  shouldUseListFeedLayout: boolean;
}

interface SourceModeToggleItemProps {
  isAuto: boolean;
  onToggle: () => void;
}

// `preventDefault` on `onSelect` keeps the menu open after toggling — this
// is a setting, not an action. Switch is pointer-events-none so the click
// lands on the DropdownMenuItem row, not the native input.
function SourceModeToggleItem({
  isAuto,
  onToggle,
}: SourceModeToggleItemProps): ReactElement {
  return (
    <DropdownMenuItem
      role="menuitemcheckbox"
      aria-checked={isAuto}
      onSelect={(event) => {
        event.preventDefault();
        onToggle();
      }}
    >
      <span className="inline-flex flex-1 items-center gap-2">
        <WrappingMenuIcon Icon={ChromeIcon} />
        <span className="flex-1 truncate">Most visited sites</span>
        <Switch
          inputId="shortcuts-source-toggle"
          name="shortcuts-source-toggle"
          checked={isAuto}
          onToggle={onToggle}
          aria-label="Most visited sites"
          className="pointer-events-none ml-2"
          compact
        />
      </span>
    </DropdownMenuItem>
  );
}

export function ShortcutLinksHub({
  shouldUseListFeedLayout,
}: ShortcutLinksHubProps): ReactElement {
  const { openModal } = useLazyModal();
  const { toggleShowTopSites, showTopSites, flags, updateFlag } =
    useSettingsContext();
  const { logEvent } = useLogContext();
  const { displayToast } = useToastNotification();
  const manager = useShortcutsManager();
  const {
    hidden: hiddenTopSites,
    hide: hideTopSite,
    unhide: unhideTopSite,
  } = useHiddenTopSites();
  const {
    topSites,
    hasCheckedPermission: hasCheckedTopSitesPermission,
    askTopSitesPermission,
  } = useShortcuts();

  // Default manual so existing users keep their curated lists; auto is opt-in
  // via the overflow menu.
  const mode: ShortcutsMode = flags?.shortcutsMode ?? 'manual';
  const isAuto = mode === 'auto';
  const appearance: ShortcutsAppearance =
    flags?.shortcutsAppearance ?? DEFAULT_SHORTCUTS_APPEARANCE;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: DRAG_ACTIVATION_DISTANCE_PX },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Drops outside the toolbar can synthesize a stray `click` on the tile
  // that React's root listener doesn't see; `useDragClickGuard` swallows it
  // at document capture so the shortcut doesn't navigate mid-drag.
  const { armGuard: armDragSuppression, onClickCapture: suppressClickCapture } =
    useDragClickGuard();

  // Cancel native HTML5 drag at the toolbar root — prevents a stray child
  // (or a browser ignoring `draggable={false}`) from kicking off a URL drag
  // that navigates the tab on drop.
  const suppressNativeDragCapture = (event: React.DragEvent) => {
    event.preventDefault();
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

  const hiddenTopSitesSet = useMemo(
    () => new Set(hiddenTopSites),
    [hiddenTopSites],
  );
  const autoShortcuts: Shortcut[] = useMemo(
    () =>
      (topSites ?? [])
        .filter((site) => !hiddenTopSitesSet.has(site.url))
        .slice(0, MAX_SHORTCUTS)
        .map((site) => ({ url: site.url, name: site.title || undefined })),
    [topSites, hiddenTopSitesSet],
  );
  const visibleShortcuts = isAuto ? autoShortcuts : manager.shortcuts;

  const handleDragEnd = (event: DragEndEvent) => {
    armDragSuppression();
    if (isAuto) {
      return;
    }
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }
    const urls = manager.shortcuts.map((s) => s.url);
    const oldIndex = urls.indexOf(active.id as string);
    const newIndex = urls.indexOf(over.id as string);
    if (oldIndex < 0 || newIndex < 0) {
      return;
    }
    manager.reorder(arrayMove(urls, oldIndex, newIndex));
    const moved = manager.shortcuts[oldIndex];
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

  // We can't delete the site from the browser's history, so we remember
  // dismissed URLs locally and offer an Undo toast.
  const onHideTopSite = (shortcut: Shortcut) => {
    hideTopSite(shortcut.url);
    const label = shortcut.name || shortcut.url;
    displayToast(`Hidden ${label}`, {
      action: {
        copy: 'Undo',
        onClick: () => unhideTopSite(shortcut.url),
      },
    });
  };

  const onAdd = () =>
    openModal({ type: LazyModal.ShortcutEdit, props: { mode: 'add' } });

  // Dropping a URL from the address bar, another tab, or bookmarks bar
  // adds directly without the edit modal. Only toast on failure.
  const onDropUrl = async (url: string) => {
    const result = await manager.addShortcut({ url });
    if (result.error) {
      displayToast(result.error);
    }
  };

  const canAcceptDroppedUrl = !isAuto && manager.canAdd;
  const { isDropTarget, dropHandlers } = useShortcutDropZone(
    onDropUrl,
    canAcceptDroppedUrl,
  );

  const onManage = () => openModal({ type: LazyModal.ShortcutsManage });

  // If permission is declined (or revoked since last boot), flip back to
  // manual so the user isn't stranded with an empty auto row and no way out.
  const switchToAuto = async () => {
    await updateFlag('shortcutsMode', 'auto');
    if (!hasCheckedTopSitesPermission || topSites === undefined) {
      const granted = await askTopSitesPermission();
      if (!granted) {
        await updateFlag('shortcutsMode', 'manual');
      }
    }
  };

  const switchToManual = () => updateFlag('shortcutsMode', 'manual');

  const toggleSourceMode = () => {
    if (isAuto) {
      switchToManual();
    } else {
      switchToAuto();
    }
  };

  const menuOptions = [
    {
      icon: <WrappingMenuIcon Icon={SettingsIcon} />,
      label: 'Manage shortcuts…',
      action: onManage,
    },
    {
      icon: <WrappingMenuIcon Icon={EyeIcon} />,
      label: 'Hide shortcuts',
      action: toggleShowTopSites,
    },
  ];

  // Two auto-mode empty shapes: permission not granted (ask) vs granted but
  // no history (new profile / cleared) — we need distinct copy for each.
  const autoPermissionGranted =
    hasCheckedTopSitesPermission && topSites !== undefined;
  const showAutoEmptyState = isAuto && visibleShortcuts.length === 0;
  const showAutoPermissionCta = showAutoEmptyState && !autoPermissionGranted;
  const showAutoNoHistoryMessage = showAutoEmptyState && autoPermissionGranted;

  const [menuOpen, setMenuOpen] = useState(false);

  // Force the overflow trigger visible when the user would otherwise be
  // trapped: menu open, auto-mode empty state, or row with no tiles at all.
  const forceShowMenuButton =
    menuOpen ||
    showAutoEmptyState ||
    (visibleShortcuts.length === 0 && (isAuto || !manager.canAdd));

  return (
    <div
      role="toolbar"
      aria-label="Shortcuts"
      onClickCapture={suppressClickCapture}
      onAuxClickCapture={suppressClickCapture}
      onDragStartCapture={suppressNativeDragCapture}
      {...dropHandlers}
      className={classNames(
        // `group/hub` powers the hover-reveal of the overflow button.
        'group/hub',
        'hidden flex-wrap items-center mobileXL:flex',
        appearance === 'tile' && 'items-start gap-x-1 gap-y-2',
        appearance === 'icon' && 'gap-1',
        appearance === 'chip' && 'gap-1',
        shouldUseListFeedLayout ? 'mx-6 mb-3 mt-1' : 'mb-5',
        'rounded-12 transition-[box-shadow,background-color] duration-150 motion-reduce:transition-none',
        isDropTarget &&
          'bg-overlay-float-cabbage ring-2 ring-accent-cabbage-default ring-offset-4 ring-offset-background-default',
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
          items={visibleShortcuts.map((s) => s.url)}
          strategy={horizontalListSortingStrategy}
        >
          {visibleShortcuts.map((shortcut) => (
            <ShortcutTile
              key={shortcut.url}
              shortcut={shortcut}
              appearance={appearance}
              onClick={onLinkClick}
              draggable={!isAuto}
              onEdit={isAuto ? undefined : onEdit}
              onRemove={isAuto ? onHideTopSite : onRemove}
              removeLabel={isAuto ? 'Hide' : 'Remove'}
            />
          ))}
        </SortableContext>
      </DndContext>
      {!isAuto && manager.canAdd && (
        <AddShortcutTile
          appearance={appearance}
          onClick={onAdd}
          acceptsDroppedUrl={canAcceptDroppedUrl}
          isDropActive={isDropTarget}
        />
      )}
      {showAutoPermissionCta && (
        <button
          type="button"
          onClick={askTopSitesPermission}
          className="flex h-11 items-center gap-2 rounded-12 border border-dashed border-border-subtlest-tertiary px-3 text-text-tertiary transition-colors duration-150 typo-callout hover:border-solid hover:border-border-subtlest-secondary hover:bg-surface-float hover:text-text-primary motion-reduce:transition-none"
        >
          Grant access to show Most visited sites
        </button>
      )}
      {showAutoNoHistoryMessage && (
        <span className="flex h-11 items-center gap-2 rounded-12 border border-dashed border-border-subtlest-tertiary px-3 text-text-tertiary typo-callout">
          Nothing visited yet — check back after browsing a few sites
        </span>
      )}
      <span role="status" aria-live="polite" className="sr-only">
        {reorderAnnouncement}
      </span>
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            icon={<MenuIcon className="rotate-90" secondary />}
            className={classNames(
              'ml-1 !size-8 !min-w-0 !rounded-10 text-text-tertiary transition-opacity duration-150 hover:bg-surface-float hover:text-text-primary motion-reduce:transition-none',
              // Quiet by default, revealed on hover/focus, and forced visible
              // when hiding it would trap the user (see forceShowMenuButton).
              forceShowMenuButton
                ? 'opacity-100'
                : 'opacity-0 focus-visible:opacity-100 group-focus-within/hub:opacity-100 group-hover/hub:opacity-100 [@media(hover:none)]:opacity-100',
              // Align with the favicon row, not the whole tile. `self-start`
              // keeps parent `items-center` from recentering onto the label.
              appearance === 'tile' && 'mt-3.5 self-start',
            )}
            aria-label="Shortcut options"
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <SourceModeToggleItem isAuto={isAuto} onToggle={toggleSourceMode} />
          <div
            aria-hidden
            className="mx-2 my-1 h-px bg-border-subtlest-tertiary"
          />
          <DropdownMenuOptions options={menuOptions} />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
