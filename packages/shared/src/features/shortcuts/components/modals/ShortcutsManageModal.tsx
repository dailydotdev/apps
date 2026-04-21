import type { ReactElement } from 'react';
import React, { useEffect, useRef } from 'react';
import classNames from 'classnames';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import type { ModalProps } from '../../../../components/modals/common/Modal';
import { Modal } from '../../../../components/modals/common/Modal';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../../components/typography/Typography';
import { HorizontalSeparator } from '../../../../components/utilities';
import { Switch } from '../../../../components/fields/Switch';
import {
  BookmarkIcon,
  DownloadIcon,
  DragIcon,
  EditIcon,
  PlusIcon,
  SitesIcon,
  TrashIcon,
} from '../../../../components/icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuOptions,
  DropdownMenuTrigger,
} from '../../../../components/dropdown/DropdownMenu';
import { MenuIcon as WrappingMenuIcon } from '../../../../components/MenuIcon';
import { useSettingsContext } from '../../../../contexts/SettingsContext';
import { useLogContext } from '../../../../contexts/LogContext';
import { LogEvent, TargetType } from '../../../../lib/log';
import { useShortcutsManager } from '../../hooks/useShortcutsManager';
import { useShortcuts } from '../../contexts/ShortcutsProvider';
import { useLazyModal } from '../../../../hooks/useLazyModal';
import { LazyModal } from '../../../../components/modals/common/types';
import { apiUrl } from '../../../../lib/config';
import { getDomainFromUrl } from '../../../../lib/links';
import { MAX_SHORTCUTS } from '../../types';
import type { Shortcut } from '../../types';

// Chrome-style radio row with a bold title and a dimmer description below.
// Mirrors the settings pattern users already know from Chrome's new tab, so
// the "My shortcuts vs Most visited sites" choice is self-explanatory.
function ShortcutsModeOption({
  id,
  checked,
  onSelect,
  title,
  description,
}: {
  id: string;
  checked: boolean;
  onSelect: () => void;
  title: string;
  description: string;
}): ReactElement {
  return (
    <label
      htmlFor={id}
      className={classNames(
        'flex cursor-pointer items-start gap-3 rounded-12 border p-3 transition-colors duration-150 motion-reduce:transition-none',
        checked
          ? 'border-accent-cabbage-default bg-accent-cabbage-subtlest'
          : 'border-border-subtlest-tertiary hover:border-border-subtlest-secondary hover:bg-surface-float',
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="text-text-primary typo-body">{title}</p>
        <p className="mt-0.5 text-text-tertiary typo-callout">{description}</p>
      </div>
      <input
        id={id}
        type="radio"
        name="shortcuts-mode"
        checked={checked}
        onChange={onSelect}
        className="sr-only peer"
      />
      <span
        aria-hidden
        className={classNames(
          'mt-1 flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-150 motion-reduce:transition-none',
          checked
            ? 'border-accent-cabbage-default bg-accent-cabbage-default'
            : 'border-border-subtlest-secondary bg-transparent',
        )}
      >
        {checked && <span className="size-1.5 rounded-full bg-white" />}
      </span>
    </label>
  );
}

function ShortcutRow({
  shortcut,
  onEdit,
  onRemove,
}: {
  shortcut: Shortcut;
  onEdit: (shortcut: Shortcut) => void;
  onRemove: (shortcut: Shortcut) => void;
}): ReactElement {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: shortcut.url });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const label = shortcut.name || getDomainFromUrl(shortcut.url);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={classNames(
        'group flex items-center gap-3 rounded-12 border border-transparent p-2 transition-all duration-150 hover:border-border-subtlest-tertiary hover:bg-surface-float hover:shadow-1 motion-reduce:transition-none',
        isDragging &&
          'border-border-subtlest-secondary bg-surface-float shadow-2 opacity-80 motion-reduce:opacity-100',
      )}
    >
      <button
        type="button"
        aria-label={`Drag to reorder ${label}`}
        className="cursor-grab rounded-8 p-1 text-text-tertiary opacity-60 transition-opacity hover:bg-surface-hover hover:text-text-primary focus-visible:opacity-100 group-hover:opacity-100 active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <DragIcon />
      </button>
      <img
        src={`${apiUrl}/icon?url=${encodeURIComponent(shortcut.url)}&size=32`}
        alt=""
        className="size-8 rounded-6 bg-surface-float"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-text-primary typo-callout">{label}</p>
        <p className="truncate text-text-tertiary typo-caption1">
          {shortcut.url}
        </p>
      </div>
      <Button
        type="button"
        variant={ButtonVariant.Tertiary}
        size={ButtonSize.Small}
        icon={<EditIcon />}
        aria-label={`Edit ${label}`}
        onClick={() => onEdit(shortcut)}
        className="opacity-60 transition-opacity group-hover:opacity-100"
      />
      <Button
        type="button"
        variant={ButtonVariant.Tertiary}
        size={ButtonSize.Small}
        icon={<TrashIcon />}
        aria-label={`Remove ${label}`}
        onClick={() => onRemove(shortcut)}
        className="opacity-60 transition-opacity group-hover:text-status-error group-hover:opacity-100"
      />
    </div>
  );
}

export default function ShortcutsManageModal(
  props: ModalProps,
): ReactElement {
  const { logEvent } = useLogContext();
  const {
    showTopSites,
    toggleShowTopSites,
    flags,
    updateFlag,
  } = useSettingsContext();
  const manager = useShortcutsManager();
  const {
    setShowImportSource,
    topSites,
    hasCheckedPermission: hasCheckedTopSitesPermission,
    askTopSitesPermission,
    bookmarks,
    hasCheckedBookmarksPermission,
  } = useShortcuts();
  const { openModal } = useLazyModal();

  const mode = flags?.shortcutsMode ?? 'manual';
  const selectMode = async (next: 'manual' | 'auto') => {
    if (next === mode) {
      return;
    }
    await updateFlag('shortcutsMode', next);
    if (next === 'auto' && topSites === undefined) {
      await askTopSitesPermission();
    }
  };

  const topSitesCount = topSites?.length ?? 0;
  const bookmarksCount = bookmarks?.length ?? 0;
  const topSitesKnown = hasCheckedTopSitesPermission && topSites !== undefined;
  const bookmarksKnown =
    hasCheckedBookmarksPermission && bookmarks !== undefined;

  const logRef = useRef<typeof logEvent>();
  logRef.current = logEvent;

  useEffect(() => {
    logRef.current?.({
      event_name: LogEvent.OpenShortcutConfig,
      target_type: TargetType.Shortcuts,
    });
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }
    const urls = manager.shortcuts.map((s) => s.url);
    const oldIndex = urls.indexOf(active.id as string);
    const newIndex = urls.indexOf(over.id as string);
    manager.reorder(arrayMove(urls, oldIndex, newIndex));
  };

  const onEdit = (shortcut: Shortcut) => {
    openModal({
      type: LazyModal.ShortcutEdit,
      props: { mode: 'edit', shortcut },
    });
  };

  const onRemove = (shortcut: Shortcut) => manager.removeShortcut(shortcut.url);

  const onAdd = () =>
    openModal({ type: LazyModal.ShortcutEdit, props: { mode: 'add' } });

  // Labels lead with the source ("Most visited sites", "Bookmarks bar") and
  // include counts when the browser has already handed them over. If we
  // haven't checked permission yet, the label invites the user to grant it
  // rather than pretending we know the count.
  const topSitesLabel = topSitesKnown
    ? `Most visited sites · ${topSitesCount} available`
    : 'Most visited sites · grant access to preview';
  const bookmarksLabel = bookmarksKnown
    ? `Bookmarks bar · ${bookmarksCount} available`
    : 'Bookmarks bar · grant access to preview';

  const importOptions = [
    {
      icon: <WrappingMenuIcon Icon={SitesIcon} />,
      label: topSitesLabel,
      action: () => setShowImportSource?.('topSites'),
    },
    {
      icon: <WrappingMenuIcon Icon={BookmarkIcon} />,
      label: bookmarksLabel,
      action: () => setShowImportSource?.('bookmarks'),
    },
  ];

  return (
    <Modal kind={Modal.Kind.FlexibleCenter} size={Modal.Size.Medium} {...props}>
      <Modal.Header showCloseButton={false}>
        <div className="flex items-baseline gap-2">
          <Typography tag={TypographyTag.H3} type={TypographyType.Body} bold>
            Shortcuts
          </Typography>
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
          >
            {manager.shortcuts.length}/{MAX_SHORTCUTS}
          </Typography>
        </div>
        <div className="ml-auto flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant={ButtonVariant.Tertiary}
                size={ButtonSize.Small}
                icon={<DownloadIcon />}
                disabled={!manager.canAdd}
                aria-label="Import shortcuts"
              >
                Import
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuOptions options={importOptions} />
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            type="button"
            variant={ButtonVariant.Float}
            size={ButtonSize.Small}
            onClick={() => props?.onRequestClose?.(undefined as never)}
          >
            Done
          </Button>
        </div>
      </Modal.Header>
      <Modal.Body>
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <div className="flex flex-1 flex-col gap-1">
              <Typography bold type={TypographyType.Body}>
                Show shortcuts
              </Typography>
              <Typography
                type={TypographyType.Callout}
                color={TypographyColor.Tertiary}
              >
                Toggle the shortcut row visibility on the new-tab page.
              </Typography>
            </div>
            <Switch
              inputId="showTopSites-switch"
              name="showTopSites"
              className="w-20 justify-end"
              compact={false}
              checked={showTopSites}
              onToggle={toggleShowTopSites}
            >
              {showTopSites ? 'On' : 'Off'}
            </Switch>
          </div>

          {showTopSites && (
            <>
              <HorizontalSeparator />
              <fieldset className="flex flex-col gap-2">
                <legend className="sr-only">Shortcuts source</legend>
                <ShortcutsModeOption
                  id="shortcuts-mode-manual"
                  checked={mode === 'manual'}
                  onSelect={() => selectMode('manual')}
                  title="My shortcuts"
                  description="Shortcuts are curated by you — add, edit, remove, and reorder them."
                />
                <ShortcutsModeOption
                  id="shortcuts-mode-auto"
                  checked={mode === 'auto'}
                  onSelect={() => selectMode('auto')}
                  title="Most visited sites"
                  description="Shortcuts are suggested based on websites you visit often."
                />
              </fieldset>
            </>
          )}

          <HorizontalSeparator />

          {manager.shortcuts.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-16 border border-dashed border-border-subtlest-tertiary bg-surface-float/50 px-4 py-10 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-accent-cabbage-subtlest text-accent-cabbage-default">
                <PlusIcon />
              </span>
              <div className="flex flex-col gap-1">
                <Typography
                  type={TypographyType.Body}
                  color={TypographyColor.Primary}
                  bold
                >
                  No shortcuts yet
                </Typography>
                <Typography
                  type={TypographyType.Callout}
                  color={TypographyColor.Tertiary}
                >
                  Add your first shortcut or import from your browser.
                </Typography>
              </div>
              <div className="mt-2 flex flex-wrap justify-center gap-2">
                <Button
                  type="button"
                  variant={ButtonVariant.Primary}
                  size={ButtonSize.Small}
                  icon={<PlusIcon />}
                  onClick={onAdd}
                >
                  Add shortcut
                </Button>
                <Button
                  type="button"
                  variant={ButtonVariant.Secondary}
                  size={ButtonSize.Small}
                  icon={<SitesIcon />}
                  onClick={() => setShowImportSource?.('topSites')}
                >
                  Most visited
                </Button>
                <Button
                  type="button"
                  variant={ButtonVariant.Secondary}
                  size={ButtonSize.Small}
                  icon={<BookmarkIcon />}
                  onClick={() => setShowImportSource?.('bookmarks')}
                >
                  Bookmarks
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex max-h-[60vh] flex-col gap-1 overflow-y-auto">
              <button
                type="button"
                onClick={onAdd}
                disabled={!manager.canAdd}
                className="group flex items-center gap-3 rounded-12 border border-dashed border-border-subtlest-tertiary p-2 text-left transition-colors duration-150 hover:border-accent-cabbage-default hover:bg-surface-float disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-border-subtlest-tertiary disabled:hover:bg-transparent motion-reduce:transition-none"
                aria-label="Add a shortcut"
              >
                <span className="flex size-8 items-center justify-center rounded-6 bg-accent-cabbage-subtlest text-accent-cabbage-default">
                  <PlusIcon />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-text-primary typo-callout">
                    Add a shortcut
                  </p>
                  <p className="truncate text-text-tertiary typo-caption1">
                    {manager.canAdd
                      ? `${manager.shortcuts.length}/${MAX_SHORTCUTS} used`
                      : `Max ${MAX_SHORTCUTS} shortcuts reached`}
                  </p>
                </div>
              </button>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={manager.shortcuts.map((s) => s.url)}
                  strategy={verticalListSortingStrategy}
                >
                  {manager.shortcuts.map((shortcut) => (
                    <ShortcutRow
                      key={shortcut.url}
                      shortcut={shortcut}
                      onEdit={onEdit}
                      onRemove={onRemove}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </div>
          )}

          {/* Permission revocation moved to the hub's overflow menu — those
              actions belong with the permission-gated features (auto mode,
              browser import) and don't need to be primary CTAs here. */}
        </div>
      </Modal.Body>
    </Modal>
  );
}
