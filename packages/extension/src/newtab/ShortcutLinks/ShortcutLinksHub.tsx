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
  SitesIcon,
} from '@dailydotdev/shared/src/components/icons';
import { MenuIcon as WrappingMenuIcon } from '@dailydotdev/shared/src/components/MenuIcon';
import { useLazyModal } from '@dailydotdev/shared/src/hooks/useLazyModal';
import { LazyModal } from '@dailydotdev/shared/src/components/modals/common/types';
import { ShortcutTile } from '@dailydotdev/shared/src/features/shortcuts/components/ShortcutTile';
import { AddShortcutTile } from '@dailydotdev/shared/src/features/shortcuts/components/AddShortcutTile';
import { useShortcutsManager } from '@dailydotdev/shared/src/features/shortcuts/hooks/useShortcutsManager';
import { useHiddenTopSites } from '@dailydotdev/shared/src/features/shortcuts/hooks/useHiddenTopSites';
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

// Stable menu row that flips source mode in place. Uses the same metrics as
// standard DropdownMenuOptions rows (h-7, typo-footnote, MenuIcon wrapper) so
// the dropdown reads as one dense list — matching the PostOptionButton
// convention. The enclosing DropdownMenuItem owns click + keyboard; the
// native Switch is pointer-events-none so clicks fall through to the row
// handler and `preventDefault` on `onSelect` keeps the menu open after
// toggling (it's a setting, not an action).
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
        <WrappingMenuIcon Icon={SitesIcon} />
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

  // Default to 'manual' so existing users keep their curated lists. Auto mode
  // is opt-in via the overflow menu (users who grant topSites permission and
  // prefer Chrome-style live tiles).
  const mode: ShortcutsMode = flags?.shortcutsMode ?? 'manual';
  const isAuto = mode === 'auto';
  const appearance: ShortcutsAppearance =
    flags?.shortcutsAppearance ?? DEFAULT_SHORTCUTS_APPEARANCE;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // dnd-kit activates drag via pointer events; browsers still synthesize a
  // `click` on `pointerup` over the anchor because the element follows the
  // pointer (no relative movement). We flag the drag lifecycle and swallow
  // any click that arrives in a short window afterward, so the link never
  // navigates. The window (instead of a one-shot flag) guards against browsers
  // that fire extra clicks, and against reorders that put a *different* tile
  // under the pointer at drop time.
  const justDraggedRef = useRef(false);
  const justDraggedTimerRef = useRef<number | null>(null);
  const armDragSuppression = () => {
    justDraggedRef.current = true;
    if (justDraggedTimerRef.current !== null) {
      window.clearTimeout(justDraggedTimerRef.current);
    }
    justDraggedTimerRef.current = window.setTimeout(() => {
      justDraggedRef.current = false;
      justDraggedTimerRef.current = null;
    }, 400);
  };
  useEffect(() => {
    return () => {
      if (justDraggedTimerRef.current !== null) {
        window.clearTimeout(justDraggedTimerRef.current);
      }
    };
  }, []);
  const suppressClickCapture = (event: React.MouseEvent) => {
    if (!justDraggedRef.current) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
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

  // Auto mode: render live top sites from the browser, minus any the user
  // dismissed (Chrome-style). Manual mode: render the curated customLinks.
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
  const manualShortcuts = manager.shortcuts.slice(0, MAX_SHORTCUTS);
  const overflowCount = isAuto
    ? 0
    : manager.shortcuts.length - manualShortcuts.length;
  const visibleShortcuts = isAuto ? autoShortcuts : manualShortcuts;

  const handleDragEnd = (event: DragEndEvent) => {
    armDragSuppression();
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

  // Chrome-style dismiss for auto mode: hide the tile for this browser and
  // offer a single-action "Undo" toast. We can't delete the site from the
  // browser's history, so we just remember the URL locally.
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

  // Drag-a-link-into-the-row shortcut: skip the edit modal entirely when
  // the user drops a URL from the address bar or another tab. We only
  // surface a toast when the add fails (duplicate / limit), because the
  // success case speaks for itself — the tile just appears in the row.
  const onDropUrl = async (url: string) => {
    const result = await manager.addShortcut({ url });
    if (result.error) {
      displayToast(result.error);
    }
  };

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

  // The overflow menu is the same shape in both modes — source selection is
  // an inline toggle at the top, so users never see items appear/disappear
  // after flipping mode. "Add shortcut" stays visible but is disabled in auto
  // so the placement doesn't jump.
  const toggleSourceMode = () => {
    if (isAuto) {
      switchToManual();
    } else {
      switchToAuto();
    }
  };

  // The inline "+" tile already lets users add when there's room. We don't
  // mirror "Add shortcut" into the dropdown: it either duplicates the tile
  // (manual + room left) or points at a disabled action (at the 12/12 cap),
  // both of which are clutter. At the limit, the library's-full story is
  // told by the Manage modal's counter and by tiles already filling the row.
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

  // Auto mode with no permission yet: show a clear CTA tile so the user knows
  // why the row is empty and can grant access or switch back to manual.
  const showAutoEmptyState = isAuto && visibleShortcuts.length === 0;

  // Controlled open state so the trigger stays visible while the menu is
  // open even when the user hovers *into* the floating menu content.
  const [menuOpen, setMenuOpen] = useState(false);

  // Force the trigger visible in these cases so users aren't trapped:
  // - the menu is already open (don't yank the trigger mid-hover)
  // - the auto-mode empty state is showing (no tiles to hover, only options)
  // - there's literally nothing else in the row (no "+" tile, no tiles)
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
      className={classNames(
        // `group` powers the hover-reveal of the overflow button below.
        'group/hub',
        // Shown from mobileXL (500px) up so narrow desktop windows and
        // split-screen use get the hub too. Still hidden on phone-sized
        // viewports where the new-tab page isn't really the use-case.
        'hidden flex-wrap items-center mobileXL:flex',
        // Gap scales with density: tiles still need a touch of breathing
        // room because of the label, but tighter than before so the row
        // reads as one cluster of shortcuts. Icons/chips pack like a real
        // bookmarks bar.
        appearance === 'tile' && 'items-start gap-x-1 gap-y-2',
        appearance === 'icon' && 'gap-1',
        appearance === 'chip' && 'gap-1',
        shouldUseListFeedLayout ? 'mx-6 mb-3 mt-1' : 'mb-5',
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
          onDropUrl={onDropUrl}
        />
      )}
      {showAutoEmptyState && (
        <button
          type="button"
          onClick={requestTopSitesAccess}
          className="flex h-11 items-center gap-2 rounded-12 border border-dashed border-border-subtlest-tertiary px-3 text-text-tertiary transition-colors duration-150 typo-callout hover:border-solid hover:border-border-subtlest-secondary hover:bg-surface-float hover:text-text-primary motion-reduce:transition-none"
        >
          Grant access to show Most visited sites
        </button>
      )}
      {overflowCount > 0 && (
        <button
          type="button"
          onClick={onManage}
          className={classNames(
            'rounded-8 px-2 py-1 text-text-tertiary transition-colors duration-150 typo-caption1 hover:bg-surface-float hover:text-text-primary motion-reduce:transition-none',
            // Only align with the icon square (not the label) in tile mode.
            appearance === 'tile' && 'mt-2',
          )}
        >
          +{overflowCount} more
        </button>
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
              'ml-1 !size-8 !min-w-0 rounded-full text-text-tertiary transition-opacity duration-150 hover:bg-surface-float hover:text-text-primary motion-reduce:transition-none',
              // Quiet by default, reveals when the user shows intent:
              // - hovering anywhere on the row
              // - keyboard-focusing any child (focus-within)
              // - touch devices where hover doesn't exist
              // - any case flagged above where hiding would trap the user
              forceShowMenuButton
                ? 'opacity-100'
                : 'opacity-0 focus-visible:opacity-100 group-focus-within/hub:opacity-100 group-hover/hub:opacity-100 [@media(hover:none)]:opacity-100',
              appearance === 'tile' && 'mt-2',
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
