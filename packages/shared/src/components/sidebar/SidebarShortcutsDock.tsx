import type { ReactElement } from 'react';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import classNames from 'classnames';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  pointerWithin,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type {
  CollisionDetection,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
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

interface ResolvedShortcut {
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
    // Resolve a real glyph/image from the path (e.g. the squad's logo).
    icon: () => <SidebarEntityIcon path={entry.path} />,
  };
};

// Matches the Home/Search rail buttons exactly.
const dockButtonClass =
  'focus-outline flex size-10 items-center justify-center rounded-12 text-text-tertiary transition-colors hover:bg-surface-hover hover:text-text-primary';

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
        {...attributes}
        {...listeners}
        style={{ transform: CSS.Transform.toString(transform), transition }}
        className={classNames('touch-none', isDragging && 'opacity-40')}
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

// A customizable "dock" of single-icon page shortcuts below the rail tabs.
// Add from the tray (drag-from or tap), drag a panel row in to pin it, reorder
// by dragging, and remove by dragging an icon off the rail — all with an Undo
// toast. Persisted per-user.
export const SidebarShortcutsDock = (): ReactElement | null => {
  const router = useRouter();
  const { displayToast } = useToastNotification();
  const [stored, setStored] = usePersistentContext<StoredShortcut[]>(
    SHORTCUTS_KEY,
    [],
  );
  const items = useMemo(
    () =>
      (stored ?? []).filter((entry) =>
        typeof entry === 'string' ? CATALOG_BY_ID.has(entry) : !!entry?.path,
      ),
    [stored],
  );
  const keys = useMemo(() => items.map(keyOf), [items]);
  const pinnedPaths = useMemo(
    () => new Set(items.map((entry) => normalizePath(keyOf(entry)))),
    [items],
  );

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
  useOutsideClick(trayRef, () => setTrayOpen(false), trayOpen);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [willRemove, setWillRemove] = useState(false);
  const [isPageDropActive, setIsPageDropActive] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );
  const { setNodeRef: setDockRef } = useDroppable({ id: DOCK_DROPPABLE_ID });

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
        action: { copy: 'Undo', onClick: () => persist(previous) },
      });
    },
    [displayToast, items, persist],
  );

  // Pin a page dragged in from a panel: resolve to a catalog entry by path when
  // possible (so it gets the proper icon), else store it as an arbitrary page.
  const pinPage = useCallback(
    (payload: ShortcutDragData) => {
      const normalized = normalizePath(payload.path);
      if (pinnedPaths.has(normalized)) {
        return;
      }
      const catalogDef = CATALOG_BY_PATH.get(normalized);
      const entry: StoredShortcut = catalogDef
        ? catalogDef.id
        : { title: payload.title, path: payload.path };
      persist([...items, entry]);
      displayToast(`${catalogDef?.label ?? payload.title} pinned to sidebar`);
    },
    [displayToast, items, persist, pinnedPaths],
  );

  const isOverDock = (overId?: string | number | null): boolean =>
    overId === DOCK_DROPPABLE_ID ||
    (typeof overId === 'string' && keys.includes(overId));

  const onDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setWillRemove(false);
    setDragging(true);
  };

  const onDragOver = (event: DragOverEvent) => {
    const id = event.active.id as string;
    const fromDock = keys.includes(id);
    setWillRemove(fromDock && !isOverDock(event.over?.id));
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const id = active.id as string;
    const fromDock = keys.includes(id);
    setActiveId(null);
    setWillRemove(false);
    setDragging(false);

    if (!fromDock) {
      if (isOverDock(over?.id)) {
        addCatalog(id);
      }
      return;
    }

    if (!isOverDock(over?.id)) {
      removeShortcut(id);
      return;
    }

    const overId = over?.id as string;
    if (overId && overId !== id && keys.includes(overId)) {
      persist(arrayMove(items, keys.indexOf(id), keys.indexOf(overId)));
    }
  };

  const onDragCancel = () => {
    setActiveId(null);
    setWillRemove(false);
    setDragging(false);
  };

  // Native drag of a panel row over the dock → allow drop + highlight.
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
  };

  const onPageDrop = (event: React.DragEvent<HTMLDivElement>) => {
    const raw = event.dataTransfer.getData(SHORTCUT_DRAG_MIME);
    setIsPageDropActive(false);
    if (!raw) {
      return;
    }
    event.preventDefault();
    try {
      const payload = JSON.parse(raw) as ShortcutDragData;
      if (payload?.path && payload?.title) {
        pinPage(payload);
      }
    } catch {
      // ignore malformed payloads
    }
  };

  // An empty dock keeps the customize (•••) button out of the way: it only
  // appears on sidebar hover (the SidebarAside `group`). Once a shortcut is
  // pinned the button stays visible by default. The tray being open or a page
  // being dragged in always reveals it regardless of hover.
  const revealOnHover = items.length === 0 && !trayOpen && !isPageDropActive;

  const activeEntry = activeId
    ? items.find((entry) => keyOf(entry) === activeId)
    : undefined;
  let activeResolved: ResolvedShortcut | null = null;
  if (activeEntry) {
    activeResolved = resolveShortcut(activeEntry);
  } else if (activeId && CATALOG_BY_ID.has(activeId)) {
    activeResolved = resolveShortcut(activeId);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={dockCollisionDetection}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDragCancel={onDragCancel}
    >
      <div
        className="relative flex w-full flex-col items-center gap-1"
        onDragOver={onPageDragOver}
        onDragEnter={onPageDragOver}
        onDragLeave={() => setIsPageDropActive(false)}
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
          className={classNames(
            'flex w-full flex-col items-center gap-1 rounded-12 transition-colors',
            isPageDropActive &&
              'bg-surface-float ring-2 ring-accent-bacon-default',
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
              type="button"
              aria-label="Customize shortcuts"
              aria-expanded={trayOpen}
              onClick={wrapHandler(() => setTrayOpen(!trayOpen))}
              className={classNames(
                dockButtonClass,
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
          <SortableContext items={keys} strategy={verticalListSortingStrategy}>
            {items.map((entry) => {
              const shortcut = resolveShortcut(entry);
              if (!shortcut) {
                return null;
              }
              return (
                <SortableShortcut
                  key={shortcut.key}
                  shortcut={shortcut}
                  active={isSidebarItemActive(router.asPath, shortcut.path)}
                />
              );
            })}
          </SortableContext>
        </div>

        {trayOpen && (
          <div
            ref={trayRef}
            className="absolute left-full top-0 z-3 ml-3 flex w-64 flex-col gap-2 !rounded-10 border border-border-subtlest-tertiary !bg-accent-pepper-subtlest p-3 shadow-3"
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
            {items.length > 0 && (
              <ul className="flex flex-col gap-0.5">
                {items.map((entry) => {
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
            {items.length > 0 && <HorizontalSeparator />}
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
        )}
      </div>

      <DragOverlay>
        {activeResolved ? (
          <div className="relative flex cursor-grabbing items-center">
            <div
              className={classNames(
                dockButtonClass,
                'scale-110 shadow-3',
                willRemove
                  ? 'opacity-70 text-status-error ring-2 ring-status-error'
                  : 'bg-surface-hover text-text-primary',
              )}
            >
              {activeResolved.icon(false)}
            </div>
            {willRemove && (
              <span className="ml-2 flex items-center gap-1 whitespace-nowrap rounded-8 border border-status-error bg-background-default px-2 py-1 text-status-error typo-caption1">
                <TrashIcon size={IconSize.XSmall} aria-hidden />
                Remove
              </span>
            )}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
