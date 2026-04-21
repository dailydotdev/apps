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
  ButtonColor,
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
  EditIcon,
  MenuIcon,
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
        <MenuIcon className="rotate-90" />
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
  const { showTopSites, toggleShowTopSites } = useSettingsContext();
  const manager = useShortcutsManager();
  const {
    onRevokePermission,
    setShowImportSource,
    hasCheckedPermission,
    hasCheckedBookmarksPermission,
    bookmarks,
    revokeBookmarksPermission,
  } = useShortcuts();
  const hasBookmarksPermission =
    hasCheckedBookmarksPermission && bookmarks !== undefined;
  const { openModal } = useLazyModal();

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

  const importOptions = [
    {
      icon: <WrappingMenuIcon Icon={SitesIcon} />,
      label: 'From most visited',
      action: () => setShowImportSource?.('topSites'),
    },
    {
      icon: <WrappingMenuIcon Icon={BookmarkIcon} />,
      label: 'From bookmarks bar',
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
          <Button
            type="button"
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            icon={<PlusIcon />}
            onClick={onAdd}
            disabled={!manager.canAdd}
          >
            Add
          </Button>
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
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={manager.shortcuts.map((s) => s.url)}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex max-h-[60vh] flex-col gap-1 overflow-y-auto">
                  {manager.shortcuts.map((shortcut) => (
                    <ShortcutRow
                      key={shortcut.url}
                      shortcut={shortcut}
                      onEdit={onEdit}
                      onRemove={onRemove}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}

          {(hasCheckedPermission || hasBookmarksPermission) && (
            <div className="flex flex-wrap gap-2">
              {hasCheckedPermission && (
                <Button
                  onClick={onRevokePermission}
                  variant={ButtonVariant.Primary}
                  color={ButtonColor.Ketchup}
                  type="button"
                  size={ButtonSize.Small}
                >
                  Revoke top sites access
                </Button>
              )}
              {hasBookmarksPermission && revokeBookmarksPermission && (
                <Button
                  onClick={() => revokeBookmarksPermission()}
                  variant={ButtonVariant.Primary}
                  color={ButtonColor.Ketchup}
                  type="button"
                  size={ButtonSize.Small}
                >
                  Revoke bookmarks access
                </Button>
              )}
            </div>
          )}
        </div>
      </Modal.Body>
    </Modal>
  );
}
