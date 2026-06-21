import type { ReactElement } from 'react';
import React, { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import classNames from 'classnames';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type {
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
  PlusIcon,
  SquadIcon,
  TrashIcon,
  UserIcon,
} from '../icons';
import { IconSize } from '../Icon';
import { Tooltip } from '../tooltip/Tooltip';
import Link from '../utilities/Link';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { isSidebarItemActive } from './common';
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

// The catalog of pages a user can pin as a no-panel shortcut. Add new entries
// here; order is the order they appear in the tray.
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

const SHORTCUTS_KEY = 'sidebar_shortcuts';
const DOCK_DROPPABLE_ID = 'sidebar-shortcuts-dock';

// Matches the Home/Search rail buttons exactly.
const dockButtonClass =
  'focus-outline flex size-10 items-center justify-center rounded-12 text-text-tertiary transition-colors hover:bg-surface-hover hover:text-text-primary';

const SortableShortcut = ({
  def,
  active,
}: {
  def: ShortcutDef;
  active: boolean;
}): ReactElement => {
  const {
    setNodeRef,
    listeners,
    attributes,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: def.id });

  return (
    <Tooltip side="right" content={def.label} collisionPadding={4}>
      <div
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        style={{ transform: CSS.Transform.toString(transform), transition }}
        className={classNames('touch-none', isDragging && 'opacity-40')}
      >
        <Link href={def.path} passHref prefetch={false}>
          <a
            href={def.path}
            aria-label={def.label}
            // Anchors are natively draggable, which hijacks dnd-kit's pointer
            // drag (the link URL gets dragged instead) — disable it so reorder
            // and drag-out-to-remove work.
            draggable={false}
            className={classNames(
              dockButtonClass,
              active && '!text-text-primary',
            )}
          >
            {def.icon(active)}
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
// Add by dragging from (or clicking) the tray, reorder by dragging, and remove
// by dragging an icon off the rail (macOS-style) or toggling it off in the tray
// — with an Undo toast. Persisted per-user.
export const SidebarShortcutsDock = (): ReactElement | null => {
  const router = useRouter();
  const { displayToast } = useToastNotification();
  const [stored, setStored] = usePersistentContext<string[]>(SHORTCUTS_KEY, []);
  const ids = useMemo(
    () => (stored ?? []).filter((id) => CATALOG_BY_ID.has(id)),
    [stored],
  );
  const [trayOpen, setTrayOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [willRemove, setWillRemove] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );
  const { setNodeRef: setDockRef } = useDroppable({ id: DOCK_DROPPABLE_ID });

  const persist = useCallback(
    (next: string[]) => {
      setStored(next).catch(() => undefined);
    },
    [setStored],
  );

  const addShortcut = useCallback(
    (id: string) => {
      if (!CATALOG_BY_ID.has(id) || ids.includes(id)) {
        return;
      }
      persist([...ids, id]);
    },
    [ids, persist],
  );

  const removeShortcut = useCallback(
    (id: string) => {
      if (!ids.includes(id)) {
        return;
      }
      const previous = ids;
      persist(ids.filter((item) => item !== id));
      displayToast(`${CATALOG_BY_ID.get(id)?.label ?? 'Shortcut'} removed`, {
        action: { copy: 'Undo', onClick: () => persist(previous) },
      });
    },
    [displayToast, ids, persist],
  );

  const isOverDock = (overId?: string | number | null): boolean =>
    overId === DOCK_DROPPABLE_ID ||
    (typeof overId === 'string' && ids.includes(overId));

  const onDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setWillRemove(false);
  };

  const onDragOver = (event: DragOverEvent) => {
    const id = event.active.id as string;
    const fromDock = ids.includes(id);
    setWillRemove(fromDock && !isOverDock(event.over?.id));
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const id = active.id as string;
    const fromDock = ids.includes(id);
    setActiveId(null);
    setWillRemove(false);

    if (!fromDock) {
      if (isOverDock(over?.id)) {
        addShortcut(id);
      }
      return;
    }

    if (!isOverDock(over?.id)) {
      removeShortcut(id);
      return;
    }

    const overId = over?.id as string;
    if (overId && overId !== id && ids.includes(overId)) {
      persist(arrayMove(ids, ids.indexOf(id), ids.indexOf(overId)));
    }
  };

  const onDragCancel = () => {
    setActiveId(null);
    setWillRemove(false);
  };

  const activeDef = activeId ? CATALOG_BY_ID.get(activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDragCancel={onDragCancel}
    >
      <div className="relative flex w-full flex-col items-center">
        <div
          aria-hidden
          className="my-3 h-px w-6 bg-border-subtlest-tertiary"
        />
        <div
          ref={setDockRef}
          className="flex w-full flex-col items-center gap-1"
        >
          <SortableContext items={ids} strategy={verticalListSortingStrategy}>
            {ids.map((id) => {
              const def = CATALOG_BY_ID.get(id);
              if (!def) {
                return null;
              }
              return (
                <SortableShortcut
                  key={id}
                  def={def}
                  active={isSidebarItemActive(router.asPath, def.path)}
                />
              );
            })}
          </SortableContext>
          <Tooltip side="right" content="Add shortcut" collisionPadding={4}>
            <button
              type="button"
              aria-label="Add shortcut"
              aria-expanded={trayOpen}
              onClick={() => setTrayOpen((open) => !open)}
              className={classNames(
                dockButtonClass,
                trayOpen && 'bg-surface-hover text-text-primary',
              )}
            >
              <PlusIcon size={IconSize.Small} aria-hidden />
            </button>
          </Tooltip>
        </div>

        {trayOpen && (
          <div className="absolute left-full top-0 z-3 ml-3 w-64 rounded-16 border border-border-subtlest-tertiary bg-background-default p-3 shadow-3">
            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Primary}
              bold
              className="mb-2 block"
            >
              Add shortcuts
            </Typography>
            <Typography
              type={TypographyType.Caption1}
              color={TypographyColor.Tertiary}
              className="mb-3 block"
            >
              Drag onto the sidebar, or tap to add. Drag an icon off the sidebar
              to remove it.
            </Typography>
            <div className="grid grid-cols-4 gap-1">
              {SHORTCUT_CATALOG.map((def) => (
                <TrayItem
                  key={def.id}
                  def={def}
                  added={ids.includes(def.id)}
                  onAdd={addShortcut}
                  onRemove={removeShortcut}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <DragOverlay>
        {activeDef ? (
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
              {activeDef.icon(false)}
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
