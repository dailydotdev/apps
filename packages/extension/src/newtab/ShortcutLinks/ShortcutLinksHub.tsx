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
  horizontalListSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { useLazyModal } from '@dailydotdev/shared/src/hooks/useLazyModal';
import { LazyModal } from '@dailydotdev/shared/src/components/modals/common/types';
import { ShortcutTile } from '@dailydotdev/shared/src/features/shortcuts/components/ShortcutTile';
import { AddShortcutTile } from '@dailydotdev/shared/src/features/shortcuts/components/AddShortcutTile';
import { useHiddenTopSites } from '@dailydotdev/shared/src/features/shortcuts/hooks/useHiddenTopSites';
import {
  useDragClickGuard,
  DRAG_ACTIVATION_DISTANCE_PX,
} from '@dailydotdev/shared/src/features/shortcuts/hooks/useDragClickGuard';
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
import { useManualShortcutsRow } from '@dailydotdev/shared/src/features/shortcuts/hooks/useManualShortcutsRow';
import { useSingleRowOverflow } from '@dailydotdev/shared/src/features/shortcuts/hooks/useSingleRowOverflow';
import { ShortcutLinksHubAutoState } from './ShortcutLinksHubAutoState';
import { ShortcutLinksHubMenu } from './ShortcutLinksHubMenu';

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
  const manualRow = useManualShortcutsRow();
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
  const shortcutSource = isAuto
    ? ShortcutsSourceType.Browser
    : ShortcutsSourceType.Custom;
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
      extra: JSON.stringify({ source: shortcutSource }),
    });
  }, [logEvent, showTopSites, mode, shortcutSource]);

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
  const visibleShortcuts = isAuto ? autoShortcuts : manualRow.shortcuts;

  // Keep the hub on a single row — overflow tiles are hidden (still reachable
  // via the overflow menu's "Manage shortcuts…") rather than wrapping.
  const { containerRef, visibleCount } = useSingleRowOverflow(
    visibleShortcuts.length,
    appearance,
  );

  const handleDragEnd = (event: DragEndEvent) => {
    armDragSuppression();
    if (isAuto) {
      return;
    }
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }
    const moved = manualRow.reorderShortcuts(
      active.id as string,
      over.id as string,
    );
    if (!moved) {
      return;
    }
    const label = moved?.name || moved?.url || 'Shortcut';
    setReorderAnnouncement(
      `Moved ${label} to position ${
        visibleShortcuts.findIndex((shortcut) => shortcut.url === over.id) + 1
      } of ${manualRow.shortcuts.length}`,
    );
  };

  const onLinkClick = () =>
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.Shortcuts,
      extra: JSON.stringify({ source: shortcutSource }),
    });

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

  const onManage = () => openModal({ type: LazyModal.ShortcutsManage });

  // Don't auto-revert to manual on a falsy permission response — that
  // also fires when the polyfill hasn't loaded yet or the permission
  // was silently re-granted, which would otherwise flicker the mode.
  // The empty-state CTA in `ShortcutLinksHubAutoState` is the recovery.
  const switchToAuto = async () => {
    await updateFlag('shortcutsMode', 'auto');
    if (!hasCheckedTopSitesPermission || topSites === undefined) {
      await askTopSitesPermission();
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

  // Two auto-mode empty shapes: permission not granted (ask) vs granted but
  // no history (new profile / cleared) — we need distinct copy for each.
  const autoPermissionGranted =
    hasCheckedTopSitesPermission && topSites !== undefined;
  const showAutoEmptyState = isAuto && visibleShortcuts.length === 0;
  const showAutoPermissionCta = showAutoEmptyState && !autoPermissionGranted;
  const showAutoNoHistoryMessage = showAutoEmptyState && autoPermissionGranted;

  const [menuOpen, setMenuOpen] = useState(false);

  // Force the overflow trigger visible when the user would otherwise be
  // trapped: menu open, auto-mode empty state, a row with no tiles at all, or
  // whenever tiles are being hidden to fit one row (the menu is the only way
  // to reach them).
  const hasHiddenShortcuts = visibleCount < visibleShortcuts.length;
  const forceShowMenuButton =
    menuOpen ||
    showAutoEmptyState ||
    hasHiddenShortcuts ||
    (visibleShortcuts.length === 0 && (isAuto || !manualRow.canAdd));

  return (
    <div
      role="toolbar"
      aria-label="Shortcuts"
      onClickCapture={suppressClickCapture}
      onAuxClickCapture={suppressClickCapture}
      onDragStartCapture={suppressNativeDragCapture}
      {...(!isAuto ? manualRow.dropHandlers : undefined)}
      className={classNames(
        // `group/hub` powers the hover-reveal of the overflow button.
        'group/hub',
        // Single line only — overflow tiles are hidden (reachable via the
        // overflow menu), never wrapped onto a second row. `w-full min-w-0`
        // pins the row to the column width (rather than letting its content
        // width balloon the layout / spill out of its `justify-center`
        // parent) so the inner tiles container has a bounded width to shrink
        // and clip against — that bound is what the overflow measurement reads.
        'hidden w-full min-w-0 items-center mobileXL:flex',
        appearance === 'tile' ? 'items-start gap-x-1' : 'gap-1',
        shouldUseListFeedLayout ? 'mx-6 mb-3 mt-1' : 'mb-5',
        'rounded-12 transition-[box-shadow,background-color] duration-150 motion-reduce:transition-none',
        !isAuto &&
          manualRow.isDropTarget &&
          'bg-overlay-float-cabbage ring-2 ring-accent-cabbage-default ring-offset-4 ring-offset-background-default',
      )}
    >
      <div
        ref={containerRef}
        className={classNames(
          'relative flex min-w-0 overflow-hidden',
          appearance === 'tile' ? 'items-start gap-x-1' : 'items-center gap-1',
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
            {visibleShortcuts.map((shortcut, index) => (
              <ShortcutTile
                key={shortcut.url}
                shortcut={shortcut}
                appearance={appearance}
                onClick={onLinkClick}
                draggable={!isAuto}
                onEdit={isAuto ? undefined : manualRow.onEdit}
                onRemove={isAuto ? onHideTopSite : manualRow.onRemove}
                removeLabel={isAuto ? 'Hide' : 'Remove'}
                // Overflow tiles stay mounted (kept measurable so the count is
                // stable) but are taken out of flow so they don't occupy width
                // and shove the trailing controls to the far edge. `!absolute`
                // overrides the tile root's own `relative` base class.
                className={
                  index >= visibleCount ? 'invisible !absolute' : undefined
                }
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>
      {!isAuto && manualRow.canAdd && (
        // `shrink-0` keeps the add tile at full size; the tiles container is
        // the only flex item allowed to shrink (and clip its overflow).
        <div className="shrink-0">
          <AddShortcutTile
            appearance={appearance}
            onClick={manualRow.onAdd}
            acceptsDroppedUrl={manualRow.canAdd}
            isDropActive={manualRow.isDropTarget}
          />
        </div>
      )}
      <ShortcutLinksHubAutoState
        showPermissionCta={showAutoPermissionCta}
        showNoHistoryMessage={showAutoNoHistoryMessage}
        onAskPermission={askTopSitesPermission}
      />
      <span role="status" aria-live="polite" className="sr-only">
        {reorderAnnouncement}
      </span>
      <ShortcutLinksHubMenu
        isAuto={isAuto}
        appearance={appearance}
        forceShowMenuButton={forceShowMenuButton}
        menuOpen={menuOpen}
        onOpenChange={setMenuOpen}
        onToggleSourceMode={toggleSourceMode}
        onManage={onManage}
        onHideShortcuts={toggleShowTopSites}
      />
    </div>
  );
}
