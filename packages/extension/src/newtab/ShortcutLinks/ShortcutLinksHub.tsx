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
  DropdownMenuItem,
  DropdownMenuOptions,
  DropdownMenuTrigger,
} from '@dailydotdev/shared/src/components/dropdown/DropdownMenu';
import {
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
  // pointer (no relative movement). We flag the drag lifecycle and swallow the
  // synthesized click in the capture phase so the link never navigates.
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

  const menuOptions = [
    {
      icon: <WrappingMenuIcon Icon={PlusIcon} />,
      label: 'Add shortcut',
      action: onAdd,
      disabled: isAuto,
      ariaLabel: isAuto
        ? 'Add shortcut (available in My shortcuts mode)'
        : 'Add shortcut',
    },
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

  return (
    <div
      role="toolbar"
      aria-label="Shortcuts"
      onClickCapture={suppressClickCapture}
      onAuxClickCapture={suppressClickCapture}
      className={classNames(
        'hidden flex-wrap items-center tablet:flex',
        // Gap scales with density: tiles have labels so they need breathing
        // room; chips/icons pack tighter like a real bookmarks bar.
        appearance === 'tile' && 'gap-x-2 gap-y-3 items-start',
        appearance === 'icon' && 'gap-1.5',
        appearance === 'chip' && 'gap-1.5',
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
        <AddShortcutTile appearance={appearance} onClick={onAdd} />
      )}
      {showAutoEmptyState && (
        <button
          type="button"
          onClick={requestTopSitesAccess}
          className="flex h-11 items-center gap-2 rounded-12 border border-dashed border-border-subtlest-tertiary px-3 text-text-tertiary typo-callout transition-colors duration-150 hover:border-solid hover:border-border-subtlest-secondary hover:bg-surface-float hover:text-text-primary motion-reduce:transition-none"
        >
          Grant access to show Most visited sites
        </button>
      )}
      {overflowCount > 0 && (
        <button
          type="button"
          onClick={onManage}
          className={classNames(
            'rounded-8 px-2 py-1 text-text-tertiary typo-caption1 transition-colors duration-150 hover:bg-surface-float hover:text-text-primary motion-reduce:transition-none',
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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            icon={<MenuIcon className="rotate-90" secondary />}
            className={classNames(
              'ml-1 !size-8 !min-w-0 rounded-full text-text-tertiary transition-colors duration-150 hover:bg-surface-float hover:text-text-primary motion-reduce:transition-none',
              appearance === 'tile' && 'mt-2',
            )}
            aria-label="Shortcut options"
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[260px]">
          <SourceModeToggleItem isAuto={isAuto} onToggle={toggleSourceMode} />
          <div className="my-1 h-px bg-border-subtlest-tertiary" aria-hidden />
          <DropdownMenuOptions options={menuOptions} />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

interface SourceModeToggleItemProps {
  isAuto: boolean;
  onToggle: () => void;
}

// A stable menu row that flips source mode in place. Lives inside the
// DropdownMenuContent so the surrounding options don't shuffle when the mode
// changes. We call `preventDefault` on `onSelect` so the menu stays open after
// toggling, matching the mental model of "I'm adjusting a setting, not
// triggering an action".
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
      className="!items-start !gap-3 !py-2.5"
    >
      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center text-text-tertiary">
        <SitesIcon />
      </span>
      <span className="flex flex-1 flex-col gap-0.5 text-left">
        <span className="text-text-primary typo-callout">
          Most visited sites
        </span>
        <span className="text-text-tertiary typo-caption1">
          Auto-fill from your browsing history
        </span>
      </span>
      <SwitchTrack checked={isAuto} />
    </DropdownMenuItem>
  );
}

// Visual-only switch. The enclosing menu item owns click + keyboard handling.
function SwitchTrack({ checked }: { checked: boolean }): ReactElement {
  return (
    <span
      aria-hidden
      className={classNames(
        'relative mt-0.5 inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-150 motion-reduce:transition-none',
        checked ? 'bg-accent-cabbage-default' : 'bg-surface-float',
      )}
    >
      <span
        className={classNames(
          'inline-block size-4 rounded-full bg-white shadow-2 transition-transform duration-150 motion-reduce:transition-none',
          checked ? 'translate-x-[18px]' : 'translate-x-0.5',
        )}
      />
    </span>
  );
}
