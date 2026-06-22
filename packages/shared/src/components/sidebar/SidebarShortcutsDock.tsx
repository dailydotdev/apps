import type { ReactElement } from 'react';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useRouter } from 'next/router';
import classNames from 'classnames';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  defaultDropAnimationSideEffects,
  pointerWithin,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type {
  CollisionDetection,
  DragEndEvent,
  DragMoveEvent,
  DragOverEvent,
  DragStartEvent,
  DropAnimation,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  AnalyticsIcon,
  BookmarkIcon,
  BriefIcon,
  CompassIcon,
  CoreIcon,
  DiscussIcon,
  EarthIcon,
  EyeIcon,
  HashtagIcon,
  JobIcon,
  MegaphoneIcon,
  MenuIcon,
  SquadIcon,
  TrashIcon,
  UserIcon,
} from '../icons';
import { IconSize } from '../Icon';
import { Tooltip } from '../tooltip/Tooltip';
import { RootPortal } from '../tooltips/Portal';
import Link from '../utilities/Link';
import { HorizontalSeparator } from '../utilities';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import type { ShortcutDragData } from './common';
import { SHORTCUT_DRAG_MIME, isSidebarItemActive } from './common';
import { useSidebarDragState } from './useSidebarDragState';
import { SidebarEntityIcon } from './SidebarEntityIcon';
import { useInteractivePopup } from '../../hooks/utils/useInteractivePopup';
import { useOutsideClick } from '../../hooks/utils/useOutsideClick';
import usePersistentContext from '../../hooks/usePersistentContext';
import { useToastNotification } from '../../hooks/useToastNotification';
import { briefingUrl, walletUrl, webappUrl } from '../../lib/constants';

type ShortcutIcon = (active: boolean) => ReactElement;

interface ShortcutDef {
  id: string;
  label: string;
  path: string;
  icon: ShortcutIcon;
}

// The catalog of pages a user can pin from the tray. Dragging an arbitrary
// panel row in also resolves to one of these (by path) when it matches.
export const SHORTCUT_CATALOG: ShortcutDef[] = [
  {
    id: 'explore',
    label: 'Explore',
    path: `${webappUrl}posts`,
    icon: (a) => (
      <CompassIcon secondary={a} size={IconSize.Small} aria-hidden />
    ),
  },
  {
    id: 'tags',
    label: 'Tags',
    path: `${webappUrl}tags`,
    icon: (a) => (
      <HashtagIcon secondary={a} size={IconSize.Small} aria-hidden />
    ),
  },
  {
    id: 'sources',
    label: 'Sources',
    path: `${webappUrl}sources`,
    icon: (a) => <EarthIcon secondary={a} size={IconSize.Small} aria-hidden />,
  },
  {
    id: 'leaderboard',
    label: 'Leaderboard',
    path: `${webappUrl}users`,
    icon: (a) => <SquadIcon secondary={a} size={IconSize.Small} aria-hidden />,
  },
  {
    id: 'discussed',
    label: 'Discussions',
    path: `${webappUrl}discussed`,
    icon: (a) => (
      <DiscussIcon secondary={a} size={IconSize.Small} aria-hidden />
    ),
  },
  {
    id: 'highlights',
    label: 'Happening Now',
    path: `${webappUrl}highlights`,
    icon: (a) => (
      <MegaphoneIcon secondary={a} size={IconSize.Small} aria-hidden />
    ),
  },
  {
    id: 'following',
    label: 'Following',
    path: '/following',
    icon: (a) => <UserIcon secondary={a} size={IconSize.Small} aria-hidden />,
  },
  {
    id: 'bookmarks',
    label: 'Bookmarks',
    path: `${webappUrl}bookmarks`,
    icon: (a) => (
      <BookmarkIcon secondary={a} size={IconSize.Small} aria-hidden />
    ),
  },
  {
    id: 'history',
    label: 'History',
    path: `${webappUrl}history`,
    icon: (a) => <EyeIcon secondary={a} size={IconSize.Small} aria-hidden />,
  },
  {
    id: 'analytics',
    label: 'Analytics',
    path: `${webappUrl}analytics`,
    icon: (a) => (
      <AnalyticsIcon secondary={a} size={IconSize.Small} aria-hidden />
    ),
  },
  {
    id: 'jobs',
    label: 'Jobs',
    path: `${webappUrl}jobs`,
    icon: (a) => <JobIcon secondary={a} size={IconSize.Small} aria-hidden />,
  },
  {
    id: 'briefing',
    label: 'Briefing',
    path: briefingUrl,
    icon: (a) => <BriefIcon secondary={a} size={IconSize.Small} aria-hidden />,
  },
  {
    id: 'cores',
    label: 'Cores',
    path: walletUrl,
    icon: (a) => <CoreIcon secondary={a} size={IconSize.Small} aria-hidden />,
  },
];

const CATALOG_BY_ID = new Map(SHORTCUT_CATALOG.map((item) => [item.id, item]));

// Strip origin/query so a panel row's path (which may be absolute or relative)
// can be matched against a catalog entry.
const normalizePath = (path: string): string =>
  path
    .replace(/^https?:\/\/[^/]+/, '')
    .split('?')[0]
    .split('#')[0] || '/';

const CATALOG_BY_PATH = new Map(
  SHORTCUT_CATALOG.map((item) => [normalizePath(item.path), item]),
);

// A stored shortcut is either a catalog id (string) or an arbitrary pinned page
// ({title, path}) dragged in from a panel.
type StoredShortcut = string | ShortcutDragData;

const SHORTCUTS_KEY = 'sidebar_shortcuts';
const DOCK_DROPPABLE_ID = 'sidebar-shortcuts-dock';

const keyOf = (entry: StoredShortcut): string =>
  typeof entry === 'string' ? entry : entry.path;

export interface ResolvedShortcut {
  key: string;
  label: string;
  path: string;
  icon: ShortcutIcon;
}

const resolveShortcut = (entry: StoredShortcut): ResolvedShortcut | null => {
  if (typeof entry === 'string') {
    const def = CATALOG_BY_ID.get(entry);
    if (!def) {
      return null;
    }
    return { key: def.id, label: def.label, path: def.path, icon: def.icon };
  }
  return {
    key: entry.path,
    label: entry.title,
    path: entry.path,
    // Prefer the image captured at drag time (instant, no flash); fall back to
    // resolving a glyph/image from the path.
    icon: () => <SidebarEntityIcon path={entry.path} image={entry.image} />,
  };
};

// Matches the Home/Search rail buttons exactly. Transitions transform too so
// the press (active:scale) on the clickable buttons that use this eases rather
// than snaps; the sortable shortcut anchors don't add a press scale (it would
// distort the drag-start rect measurement).
const dockButtonClass =
  'focus-outline flex size-10 items-center justify-center rounded-12 text-text-tertiary transition-[background-color,color,transform] duration-150 ease-out hover:bg-surface-hover hover:text-text-primary motion-reduce:transition-none';

// Reorder smoothly while the pointer is inside the dock, but report NO target
// (over === null) once it leaves the rail — so dragging a shortcut off the
// sidebar is detected as a remove. (closestCenter always returns the nearest
// droppable, so over was never null and drag-out-to-remove never fired.)
const dockCollisionDetection: CollisionDetection = (args) =>
  pointerWithin(args).length > 0 ? closestCenter(args) : [];

const SortableShortcut = ({
  shortcut,
  active,
}: {
  shortcut: ResolvedShortcut;
  active: boolean;
}): ReactElement => {
  const {
    setNodeRef,
    listeners,
    attributes,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: shortcut.key });
  const { isDragging: isAnyDragging } = useSidebarDragState();

  return (
    <Tooltip
      side="right"
      content={shortcut.label}
      collisionPadding={4}
      visible={!isAnyDragging}
    >
      <div
        ref={setNodeRef}
        data-shortcut-slot
        {...attributes}
        {...listeners}
        style={{
          // The dragged item's skeleton stays put at its (live-reordered) index
          // — the floating DragOverlay follows the pointer, so applying the
          // sortable transform here too would make the skeleton drift.
          transform: isDragging ? undefined : CSS.Transform.toString(transform),
          transition,
        }}
        className={classNames(
          'relative touch-none rounded-12 transition-colors',
          // The dragged icon reorders live, so this item's own slot IS the
          // landing place — show it as a solid skeleton (icon hidden) so it's
          // clear where the icon drops.
          isDragging && 'bg-background-subtle',
        )}
      >
        <Link href={shortcut.path} passHref prefetch={false}>
          <a
            href={shortcut.path}
            aria-label={shortcut.label}
            // Anchors are natively draggable, which hijacks dnd-kit's pointer
            // drag — disable it so reorder and drag-out-to-remove work.
            draggable={false}
            className={classNames(
              dockButtonClass,
              active && '!text-text-primary',
              isDragging && 'opacity-0',
            )}
          >
            {shortcut.icon(active)}
          </a>
        </Link>
      </div>
    </Tooltip>
  );
};

const TrayItem = ({
  def,
  added,
  onAdd,
  onRemove,
}: {
  def: ShortcutDef;
  added: boolean;
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
}): ReactElement => {
  // Added items aren't draggable (they already live in the dock); they're a
  // click-to-remove toggle. Unadded items are draggable into the dock and also
  // click-to-add — the reliable, accessible path.
  const { setNodeRef, listeners, attributes, isDragging } = useDraggable({
    id: def.id,
    disabled: added,
  });

  return (
    <button
      ref={added ? undefined : setNodeRef}
      type="button"
      onClick={() => (added ? onRemove(def.id) : onAdd(def.id))}
      {...(added ? { 'aria-pressed': true } : { ...attributes, ...listeners })}
      className={classNames(
        'flex flex-col items-center gap-1 rounded-10 p-2 transition-colors',
        added
          ? 'bg-surface-float text-text-primary'
          : 'touch-none text-text-tertiary hover:bg-surface-hover hover:text-text-primary',
        isDragging && 'opacity-40',
      )}
    >
      <span className="flex size-6 items-center justify-center">
        {def.icon(added)}
      </span>
      <Typography
        type={TypographyType.Caption2}
        color={added ? TypographyColor.Primary : TypographyColor.Tertiary}
        className="line-clamp-1 text-center"
      >
        {def.label}
      </Typography>
    </button>
  );
};

export interface SidebarShortcutsApi {
  items: StoredShortcut[];
  keys: string[];
  pinnedPaths: Set<string>;
  resolved: ResolvedShortcut[];
  persist: (next: StoredShortcut[]) => void;
  addCatalog: (id: string) => void;
  removeShortcut: (key: string) => void;
  pinPage: (payload: ShortcutDragData, index?: number) => void;
}

// Shortcuts state + mutations, shared by the dock and the rail's "More" menu
// (which lists shortcuts when the rail is too short to show the dock inline).
// usePersistentContext is react-query backed, so calling this in both places
// reads the same cached source of truth.
export const useSidebarShortcutItems = (): SidebarShortcutsApi => {
  const { displayToast } = useToastNotification();
  const [stored, setStored] = usePersistentContext<StoredShortcut[]>(
    SHORTCUTS_KEY,
    [],
  );
  const items = useMemo(() => {
    // Drop invalid entries AND de-duplicate by key. Duplicate keys would make
    // React/dnd-kit treat several rows as the same node (all reporting
    // isDragging), so a single corrupt write must never cascade into a runaway
    // list. The next mutation persists this cleaned array, healing storage.
    const seen = new Set<string>();
    return (stored ?? []).filter((entry) => {
      const valid =
        typeof entry === 'string' ? CATALOG_BY_ID.has(entry) : !!entry?.path;
      if (!valid) {
        return false;
      }
      const key = keyOf(entry);
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }, [stored]);
  const keys = useMemo(() => items.map(keyOf), [items]);
  const pinnedPaths = useMemo(
    () => new Set(items.map((entry) => normalizePath(keyOf(entry)))),
    [items],
  );
  const resolved = useMemo(
    () =>
      items
        .map(resolveShortcut)
        .filter((entry): entry is ResolvedShortcut => !!entry),
    [items],
  );

  const persist = useCallback(
    (next: StoredShortcut[]) => {
      setStored(next).catch(() => undefined);
    },
    [setStored],
  );

  const addCatalog = useCallback(
    (id: string) => {
      if (!CATALOG_BY_ID.has(id) || keys.includes(id)) {
        return;
      }
      persist([...items, id]);
    },
    [items, keys, persist],
  );

  const removeShortcut = useCallback(
    (key: string) => {
      const index = items.findIndex((entry) => keyOf(entry) === key);
      if (index === -1) {
        return;
      }
      const previous = items;
      const label = resolveShortcut(items[index])?.label ?? 'Shortcut';
      persist(items.filter((entry) => keyOf(entry) !== key));
      displayToast(`${label} removed`, {
        // Always auto-dismiss (even if the global setting is off); a touch
        // longer so there's time to reach the Undo action before it clears.
        forceAutoDismiss: true,
        timer: 6000,
        action: { copy: 'Undo', onClick: () => persist(previous) },
      });
    },
    [displayToast, items, persist],
  );

  // Pin a page dragged in from a panel: resolve to a catalog entry by path when
  // possible (so it gets the proper icon), else store it as an arbitrary page.
  const pinPage = useCallback(
    (payload: ShortcutDragData, index?: number) => {
      const normalized = normalizePath(payload.path);
      if (pinnedPaths.has(normalized)) {
        return;
      }
      const catalogDef = CATALOG_BY_PATH.get(normalized);
      const entry: StoredShortcut = catalogDef
        ? catalogDef.id
        : { title: payload.title, path: payload.path, image: payload.image };
      const next = [...items];
      next.splice(
        typeof index === 'number'
          ? Math.max(0, Math.min(index, next.length))
          : next.length,
        0,
        entry,
      );
      persist(next);
      displayToast(`${catalogDef?.label ?? payload.title} pinned to sidebar`, {
        forceAutoDismiss: true,
      });
    },
    [displayToast, items, persist, pinnedPaths],
  );

  return {
    items,
    keys,
    pinnedPaths,
    resolved,
    persist,
    addCatalog,
    removeShortcut,
    pinPage,
  };
};

// A customizable "dock" of single-icon page shortcuts below the rail tabs.
// Add from the tray (drag-from or tap), drag a panel row in to pin it, reorder
// by dragging, and remove by dragging an icon off the rail — all with an Undo
// toast. Persisted per-user.
export const SidebarShortcutsDock = ({
  collapsed = false,
}: {
  // Very short viewport: hide the inline shortcut icons and keep only the
  // customize (•••) button, whose tray still lists and manages them all.
  collapsed?: boolean;
}): ReactElement | null => {
  const router = useRouter();
  const { items, persist, addCatalog, removeShortcut, pinPage } =
    useSidebarShortcutItems();
  // Render from a local order mirror during (and just after) a reorder drop so
  // the DOM is already in the new order when dnd-kit measures the drop landing.
  // The persisted store updates asynchronously and would otherwise lag a frame,
  // springing the ghost back to the old slot before the list re-renders. The
  // override is dropped once the store catches up (or the set changes).
  const [orderOverride, setOrderOverride] = useState<StoredShortcut[] | null>(
    null,
  );
  const orderedItems = orderOverride ?? items;
  const keys = useMemo(() => orderedItems.map(keyOf), [orderedItems]);
  useEffect(() => {
    if (!orderOverride) {
      return;
    }
    const storeKeys = items.map(keyOf);
    const overrideKeys = orderOverride.map(keyOf);
    const sameSet =
      storeKeys.length === overrideKeys.length &&
      storeKeys.every((key) => overrideKeys.includes(key));
    if (!sameSet || storeKeys.join('|') === overrideKeys.join('|')) {
      setOrderOverride(null);
    }
  }, [items, orderOverride]);

  const { isDragging: isAnyDragging, setDragging } = useSidebarDragState();
  // Share the rail popup group so the customize menu is mutually exclusive with
  // the Support/Settings popups and behaves like them. ('sidebar-rail' must
  // match RAIL_POPUP_GROUP in SidebarDesktopV2.)
  const {
    isOpen: trayOpen,
    onUpdate: setTrayOpen,
    wrapHandler,
  } = useInteractivePopup('sidebar-rail');
  const trayRef = useRef<HTMLDivElement>(null);
  const customizeBtnRef = useRef<HTMLButtonElement>(null);
  useOutsideClick(trayRef, () => setTrayOpen(false), trayOpen);
  // The tray is portaled to the body so the scrollable rail's overflow (which
  // forces overflow-x to clip) can't hide it; we anchor it to the customize
  // button's rect once on open (and on resize). It is NOT re-positioned on rail
  // scroll — like the Support/Settings popups it stays put, which avoids the
  // jittery shift the live scroll-tracking caused.
  const [trayPos, setTrayPos] = useState<{ top: number; left: number } | null>(
    null,
  );
  useEffect(() => {
    if (!trayOpen) {
      setTrayPos(null);
      return undefined;
    }
    const update = () => {
      const rect = customizeBtnRef.current?.getBoundingClientRect();
      if (rect) {
        setTrayPos({ top: rect.top, left: rect.right + 12 });
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('resize', update);
    };
  }, [trayOpen]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [willRemove, setWillRemove] = useState(false);
  const [isPageDropActive, setIsPageDropActive] = useState(false);
  // The slot a panel row being dragged in (native drag) would drop into, so it
  // lands exactly where you release — same skeleton indicator as reordering —
  // instead of always appending. null while not over the dock.
  const [pageDropIndex, setPageDropIndex] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );
  const { setNodeRef: setDockRef } = useDroppable({ id: DOCK_DROPPABLE_ID });

  const isOverDock = (target?: string | number | null): boolean =>
    target === DOCK_DROPPABLE_ID ||
    (typeof target === 'string' && keys.includes(target));

  // Drop-time flag (not state) so the DragOverlay's dropAnimation keyframes —
  // which run *after* onDragEnd resets willRemove — can tell whether this drop
  // was a remove (poof in place) or a settle/reorder (animate to slot).
  const removeOnDropRef = useRef(false);
  // Bounds of the rail column + a flag for "the dragged icon is now ENTIRELY
  // outside the rail". Remove only fires once the whole icon clears the rail,
  // not the moment the cursor nudges past the edge.
  const dockAreaRef = useRef<HTMLDivElement>(null);
  const outsideRailRef = useRef(false);
  // The live (in-progress) reorder, mirrored in a ref so onDragEnd reads the
  // final order without a stale-closure risk.
  const liveOrderRef = useRef<StoredShortcut[] | null>(null);
  // Whether the drag began on an existing dock icon (reorder) vs the tray
  // (add). Captured at drag START where the order is stable — recomputing it at
  // drop from the live `keys` could misclassify a reorder as an add (which adds
  // a duplicate), because live reorder mutates `keys` mid-drag.
  const fromDockRef = useRef(false);

  const isIconOutsideRail = (event: DragMoveEvent | DragEndEvent): boolean => {
    const rail = dockAreaRef.current?.getBoundingClientRect();
    const icon = event.active.rect.current.translated;
    if (!rail || !icon) {
      return false;
    }
    // Horizontal-only: the rail spans the full viewport height, so "outside" is
    // the icon's box no longer overlapping the rail's column on the x-axis.
    return icon.left >= rail.right || icon.right <= rail.left;
  };

  const onDragStart = (event: DragStartEvent) => {
    const id = event.active.id as string;
    const fromDock = keys.includes(id);
    fromDockRef.current = fromDock;
    setActiveId(id);
    setOverId(null);
    setWillRemove(false);
    removeOnDropRef.current = false;
    outsideRailRef.current = false;
    // Snapshot the order so the list can reorder live (in onDragOver) without
    // touching the persisted store until drop.
    liveOrderRef.current = fromDock ? orderedItems : null;
    setDragging(true);
  };

  // Drive the remove indicator off the icon's geometry (fires every move),
  // not the cursor's over target — so it only turns on once the whole icon has
  // left the rail.
  const onDragMove = (event: DragMoveEvent) => {
    if (!fromDockRef.current) {
      return;
    }
    const outside = isIconOutsideRail(event);
    outsideRailRef.current = outside;
    setWillRemove(outside);
  };

  // Live reorder: as the icon passes over a slot, reorder the rendered list so
  // the dragged item's own placeholder moves into the target slot (the landing
  // skeleton). Persisted only on drop.
  const onDragOver = (event: DragOverEvent) => {
    const id = event.active.id as string;
    const over = (event.over?.id as string) ?? null;
    setOverId(over);
    if (!keys.includes(id) || !over || over === id || !keys.includes(over)) {
      return;
    }
    const base = liveOrderRef.current ?? items;
    const baseKeys = base.map(keyOf);
    const from = baseKeys.indexOf(id);
    const to = baseKeys.indexOf(over);
    if (from === -1 || to === -1 || from === to) {
      return;
    }
    const next = arrayMove(base, from, to);
    liveOrderRef.current = next;
    setOrderOverride(next);
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active } = event;
    const id = active.id as string;
    // Use the start-of-drag classification, not the live `keys` (which the
    // live reorder mutates) — recomputing here can misread a reorder as an add.
    const fromDock = fromDockRef.current;
    const liveOrder = liveOrderRef.current;
    liveOrderRef.current = null;
    setActiveId(null);
    setOverId(null);
    setWillRemove(false);
    setDragging(false);

    if (!fromDock) {
      if (isOverDock(event.over?.id)) {
        addCatalog(id);
      }
      return;
    }

    // Remove only when the whole icon cleared the rail; a cursor that merely
    // slipped past the edge (icon still overlapping) snaps back instead.
    if (isIconOutsideRail(event)) {
      removeOnDropRef.current = true;
      removeShortcut(id);
      return;
    }

    // Commit the live reorder (already reflected in orderOverride). Compare to
    // the STORE order (not the live keys, which already include the override);
    // if nothing actually moved, drop the override and fall back to the store.
    const storeKeys = items.map(keyOf).join('|');
    if (liveOrder && liveOrder.map(keyOf).join('|') !== storeKeys) {
      persist(liveOrder);
    } else {
      setOrderOverride(null);
    }
  };

  const onDragCancel = () => {
    liveOrderRef.current = null;
    setActiveId(null);
    setOverId(null);
    setWillRemove(false);
    outsideRailRef.current = false;
    setOrderOverride(null);
    setDragging(false);
  };

  // Insertion index for a native page drag: count the shortcut slots whose
  // vertical midpoint sits above the cursor. Returns where the new shortcut
  // would land (0..length).
  const pageDropIndexAt = (event: React.DragEvent<HTMLDivElement>): number => {
    const slots = event.currentTarget.querySelectorAll('[data-shortcut-slot]');
    let index = slots.length;
    for (let i = 0; i < slots.length; i += 1) {
      const rect = slots[i].getBoundingClientRect();
      if (event.clientY < rect.top + rect.height / 2) {
        index = i;
        break;
      }
    }
    return index;
  };

  // Native drag of a panel row over the dock → allow drop, highlight the area,
  // and track the slot it would land in (so it drops exactly there).
  const onPageDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    if (!event.dataTransfer.types.includes(SHORTCUT_DRAG_MIME)) {
      return;
    }
    event.preventDefault();
    // eslint-disable-next-line no-param-reassign
    event.dataTransfer.dropEffect = 'copy';
    if (!isPageDropActive) {
      setIsPageDropActive(true);
    }
    setPageDropIndex(pageDropIndexAt(event));
  };

  const resetPageDrop = () => {
    setIsPageDropActive(false);
    setPageDropIndex(null);
  };

  const onPageDrop = (event: React.DragEvent<HTMLDivElement>) => {
    const raw = event.dataTransfer.getData(SHORTCUT_DRAG_MIME);
    const dropIndex = pageDropIndexAt(event);
    resetPageDrop();
    if (!raw) {
      return;
    }
    event.preventDefault();
    try {
      const payload = JSON.parse(raw) as ShortcutDragData;
      if (payload?.path && payload?.title) {
        pinPage(payload, dropIndex);
      }
    } catch {
      // ignore malformed payloads
    }
  };

  // An empty dock keeps the customize (•••) button out of the way: it only
  // appears on sidebar hover (the SidebarAside `group`). Once a shortcut is
  // pinned the button stays visible by default. The tray being open or a page
  // being dragged in always reveals it regardless of hover.
  const revealOnHover =
    orderedItems.length === 0 && !trayOpen && !isPageDropActive;

  const activeEntry = activeId
    ? orderedItems.find((entry) => keyOf(entry) === activeId)
    : undefined;
  let activeResolved: ResolvedShortcut | null = null;
  if (activeEntry) {
    activeResolved = resolveShortcut(activeEntry);
  } else if (activeId && CATALOG_BY_ID.has(activeId)) {
    activeResolved = resolveShortcut(activeId);
  }

  // macOS-dock feel on release: a removed icon poofs out (fades + shrinks) right
  // where you let go instead of flying back to its old slot then vanishing.
  // Reorders/adds keep the default settle-into-place animation. Collapsed to an
  // instant settle when the user prefers reduced motion.
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const dropAnimation: DropAnimation = {
    duration: prefersReducedMotion ? 0 : 200,
    easing: 'cubic-bezier(0.2, 0, 0, 1)',
    // Keep the placeholder dimmed at its drag opacity (0.4) through the whole
    // landing instead of the default flip-to-visible, which made the icon flash
    // back at its old slot mid-drop (the spring-back glitch).
    sideEffects: defaultDropAnimationSideEffects({
      styles: { active: { opacity: '0.4' } },
    }),
    keyframes: ({ transform }) => {
      const from = CSS.Transform.toString(transform.initial);
      if (removeOnDropRef.current) {
        return [
          { opacity: 1, transform: from },
          {
            opacity: 0,
            transform: CSS.Transform.toString({
              ...transform.initial,
              scaleX: 0.4,
              scaleY: 0.4,
            }),
          },
        ];
      }
      return [
        { transform: from },
        { transform: CSS.Transform.toString(transform.final) },
      ];
    },
  };

  const isReordering = !!activeId && keys.includes(activeId);
  // A catalog item dragged from the tray (not yet in the dock) lands by hovering
  // over the dock — highlight the whole dock as an "add here" target. Native
  // page drags reuse the same highlight via isPageDropActive.
  const showAddZone =
    isPageDropActive || (!!activeId && !isReordering && isOverDock(overId));
  // The whole dock reads as an active drop area whenever an icon is being
  // dragged inside it — both adding a new one and reordering an existing one
  // (but not while dragging one out to remove).
  const showDragArea = showAddZone || (isReordering && !willRemove);

  // Drag-overlay chip look: solid red while removing; solid bordered chip while
  // reordering an existing icon; solid chip with a dashed brand border while
  // *adding* a new icon (dragged from the tray) so it reads as "being placed".
  let ghostStateClass =
    'scale-110 border border-border-subtlest-tertiary bg-background-default !text-text-primary';
  if (willRemove) {
    ghostStateClass = 'scale-90 !bg-status-error text-white';
  } else if (!isReordering) {
    ghostStateClass =
      'scale-110 border border-dashed border-accent-cabbage-default bg-background-default !text-text-primary';
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={dockCollisionDetection}
      onDragStart={onDragStart}
      onDragMove={onDragMove}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDragCancel={onDragCancel}
    >
      <div
        ref={dockAreaRef}
        className="relative flex w-full flex-col items-center gap-1"
        onDragOver={onPageDragOver}
        onDragEnter={onPageDragOver}
        onDragLeave={resetPageDrop}
        onDrop={onPageDrop}
      >
        <div
          aria-hidden
          className={classNames(
            'my-1 h-px w-6 bg-border-subtlest-tertiary transition-opacity',
            revealOnHover && 'opacity-0 group-hover:opacity-100',
          )}
        />
        <div
          ref={setDockRef}
          // The drop target wraps the customize (•••) button and every shortcut
          // from the top. A 1px dashed border (transparent at rest → brand
          // while dragging) frames the area; the colour is set exclusively (not
          // layered over border-transparent) so it actually renders. No tint
          // fill — the solid rail background shows through.
          className={classNames(
            'flex w-full flex-col items-center gap-1 rounded-12 border border-dashed p-0.5 transition-colors duration-150',
            showDragArea
              ? 'border-accent-cabbage-default'
              : 'border-transparent',
          )}
        >
          {/* The customize (•••) button always starts the dock; pinned
              shortcuts stack below it. */}
          <Tooltip
            side="right"
            content="Customize shortcuts"
            collisionPadding={4}
            visible={!isAnyDragging}
          >
            <button
              ref={customizeBtnRef}
              type="button"
              aria-label="Customize shortcuts"
              aria-expanded={trayOpen}
              onClick={wrapHandler(() => setTrayOpen(!trayOpen))}
              className={classNames(
                dockButtonClass,
                'active:scale-90',
                trayOpen && 'bg-background-default !text-text-primary',
                revealOnHover &&
                  'opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100',
              )}
            >
              <MenuIcon
                size={IconSize.Small}
                aria-hidden
                className="rotate-90"
              />
            </button>
          </Tooltip>
          <SortableContext
            items={collapsed ? [] : keys}
            strategy={verticalListSortingStrategy}
          >
            {!collapsed &&
              orderedItems.map((entry, index) => {
                const shortcut = resolveShortcut(entry);
                if (!shortcut) {
                  return null;
                }
                return (
                  <React.Fragment key={shortcut.key}>
                    {/* Float skeleton at the slot a dragged-in panel row would
                        land — same indicator as reordering. */}
                    {pageDropIndex === index && (
                      <div
                        aria-hidden
                        className="size-10 shrink-0 rounded-12 bg-background-subtle"
                      />
                    )}
                    <SortableShortcut
                      shortcut={shortcut}
                      active={isSidebarItemActive(router.asPath, shortcut.path)}
                    />
                  </React.Fragment>
                );
              })}
            {/* Dropping below the last shortcut → skeleton at the end. */}
            {!collapsed &&
              pageDropIndex !== null &&
              pageDropIndex >= orderedItems.length && (
                <div
                  aria-hidden
                  className="size-10 shrink-0 rounded-12 bg-background-subtle"
                />
              )}
          </SortableContext>
        </div>

        {trayOpen && trayPos && (
          <RootPortal>
            <div
              ref={trayRef}
              style={{
                position: 'fixed',
                top: trayPos.top,
                left: trayPos.left,
              }}
              // Identical chrome to the Support/Settings popups (same classes
              // InteractivePopup renders): fixed, z-popup, shadow-2, the
              // pepper-subtlest card. Anchored to the • • • button instead of a
              // fixed sidebar corner so it sits next to its trigger.
              className="z-popup flex w-64 flex-col gap-2 overflow-hidden !rounded-10 border border-border-subtlest-tertiary !bg-accent-pepper-subtlest p-3 shadow-2"
            >
              <Typography
                type={TypographyType.Callout}
                color={TypographyColor.Primary}
                bold
              >
                Customize shortcuts
              </Typography>
              {/* All pinned shortcuts, clickable here too — so they're reachable
                even when the rail is full. */}
              {orderedItems.length > 0 && (
                <ul className="flex flex-col gap-0.5">
                  {orderedItems.map((entry) => {
                    const shortcut = resolveShortcut(entry);
                    if (!shortcut) {
                      return null;
                    }
                    return (
                      <li
                        key={shortcut.key}
                        className="group/srow flex items-center gap-1 rounded-8 pr-1 hover:bg-surface-hover"
                      >
                        <Link href={shortcut.path} passHref prefetch={false}>
                          <a
                            href={shortcut.path}
                            onClick={() => setTrayOpen(false)}
                            className="flex min-w-0 flex-1 items-center gap-2 rounded-8 px-1 py-1.5 text-text-secondary"
                          >
                            <span className="flex size-6 shrink-0 items-center justify-center">
                              {shortcut.icon(false)}
                            </span>
                            <Typography
                              type={TypographyType.Footnote}
                              color={TypographyColor.Primary}
                              truncate
                              className="min-w-0"
                            >
                              {shortcut.label}
                            </Typography>
                          </a>
                        </Link>
                        <button
                          type="button"
                          aria-label={`Remove ${shortcut.label}`}
                          onClick={() => removeShortcut(shortcut.key)}
                          className="focus-outline flex size-6 shrink-0 items-center justify-center rounded-6 text-text-tertiary opacity-0 transition-opacity hover:bg-surface-float hover:text-text-primary group-hover/srow:opacity-100"
                        >
                          <TrashIcon size={IconSize.XSmall} aria-hidden />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
              {orderedItems.length > 0 && <HorizontalSeparator />}
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Tertiary}
              >
                Drag a page from any panel onto the sidebar, or add one:
              </Typography>
              <div className="grid grid-cols-4 gap-1">
                {SHORTCUT_CATALOG.filter((def) => !keys.includes(def.id)).map(
                  (def) => (
                    <TrayItem
                      key={def.id}
                      def={def}
                      added={false}
                      onAdd={addCatalog}
                      onRemove={removeShortcut}
                    />
                  ),
                )}
              </div>
            </div>
          </RootPortal>
        )}
      </div>

      <DragOverlay dropAnimation={dropAnimation}>
        {activeResolved ? (
          <div className="relative flex cursor-grabbing items-center">
            <div
              className={classNames(
                dockButtonClass,
                // Solid (opaque) chip so the dragged icon reads clearly over any
                // feed content it passes over — never see-through.
                'shadow-3 transition-all duration-150',
                ghostStateClass,
              )}
            >
              {/* Always the shortcut's own icon — the solid red chip + "Remove"
                  pill convey the remove intent, so we keep showing exactly what
                  you're about to remove (white-tinted on red for vector icons). */}
              {activeResolved.icon(false)}
            </div>
            {/* Kept mounted so it scales + fades in/out as you cross the remove
                boundary instead of popping (origin-left so it grows out of the
                chip). */}
            <span
              aria-hidden={!willRemove}
              className={classNames(
                'ml-2 flex origin-left items-center gap-1 whitespace-nowrap rounded-10 bg-status-error px-2.5 py-1 font-bold text-white shadow-2 transition-[opacity,transform] duration-150 ease-out typo-caption1 motion-reduce:transition-none',
                willRemove
                  ? 'scale-100 opacity-100'
                  : 'pointer-events-none scale-50 opacity-0',
              )}
            >
              Remove
            </span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
