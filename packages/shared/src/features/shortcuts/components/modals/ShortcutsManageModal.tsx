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
  RefreshIcon,
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
import { useHiddenTopSites } from '../../hooks/useHiddenTopSites';
import { useShortcuts } from '../../contexts/ShortcutsProvider';
import { useLazyModal } from '../../../../hooks/useLazyModal';
import { LazyModal } from '../../../../components/modals/common/types';
import { apiUrl } from '../../../../lib/config';
import { getDomainFromUrl } from '../../../../lib/links';
import { DEFAULT_SHORTCUTS_APPEARANCE, MAX_SHORTCUTS } from '../../types';
import type { Shortcut, ShortcutsAppearance } from '../../types';

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
        // Selected state leads with a left accent rail + elevated surface.
        // No full-bleed accent fill — the copy stays readable against the
        // neutral surface and the rail is enough signal for "this one".
        'relative flex cursor-pointer items-start gap-3 overflow-hidden rounded-12 border p-3 pl-4 transition-colors duration-150 motion-reduce:transition-none',
        checked
          ? 'border-border-subtlest-primary bg-surface-float'
          : 'border-border-subtlest-tertiary hover:border-border-subtlest-secondary hover:bg-surface-float',
      )}
    >
      <span
        aria-hidden
        className={classNames(
          'absolute inset-y-0 left-0 w-1 transition-colors duration-150 motion-reduce:transition-none',
          checked ? 'bg-accent-cabbage-default' : 'bg-transparent',
        )}
      />
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
          'mt-1 flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors duration-150 motion-reduce:transition-none',
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
        // Rows are quiet by default; hover darkens the surface only.
        // Drag state tilts slightly with a real shadow so the user feels
        // the row "lift" without the busy scale-up jump.
        'group relative flex items-center gap-3 rounded-10 p-2 transition-colors duration-150 hover:bg-surface-float motion-reduce:transition-none',
        isDragging &&
          'z-10 rotate-[-1deg] bg-surface-float shadow-2 motion-reduce:rotate-0',
      )}
    >
      <button
        type="button"
        aria-label={`Drag to reorder ${label}`}
        className="flex size-6 shrink-0 cursor-grab items-center justify-center rounded-6 text-text-quaternary transition-colors duration-150 hover:text-text-primary focus-visible:text-text-primary active:cursor-grabbing motion-reduce:transition-none"
        {...attributes}
        {...listeners}
      >
        <DragIcon />
      </button>
      <img
        src={`${apiUrl}/icon?url=${encodeURIComponent(shortcut.url)}&size=32`}
        alt=""
        className="size-8 shrink-0 rounded-8 bg-surface-float"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-text-primary typo-callout">{label}</p>
        <p className="truncate text-text-tertiary typo-caption1">
          {shortcut.url}
        </p>
      </div>
      <div className="flex items-center gap-0.5 opacity-0 transition-opacity duration-150 focus-within:opacity-100 group-hover:opacity-100 motion-reduce:transition-none">
        <Button
          type="button"
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Small}
          icon={<EditIcon />}
          aria-label={`Edit ${label}`}
          onClick={() => onEdit(shortcut)}
        />
        <Button
          type="button"
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Small}
          icon={<TrashIcon />}
          aria-label={`Remove ${label}`}
          onClick={() => onRemove(shortcut)}
          className="hover:!text-status-error"
        />
      </div>
    </div>
  );
}

// Appearance picker: three preset cards with tiny live previews so users
// see what they're picking. Pattern is borrowed from Raindrop.io's layout
// switcher and Notion's view picker — one click changes the row style of
// the whole toolbar.
function AppearancePicker({
  value,
  onChange,
}: {
  value: ShortcutsAppearance;
  onChange: (next: ShortcutsAppearance) => void;
}): ReactElement {
  const options: Array<{
    id: ShortcutsAppearance;
    title: string;
    description: string;
    preview: ReactElement;
  }> = [
    {
      id: 'tile',
      title: 'Tile',
      description: 'Icon with label below — Chrome new-tab style.',
      preview: (
        <div className="flex items-start gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="flex w-9 flex-col items-center gap-1"
              aria-hidden
            >
              <div className="size-6 rounded-6 bg-border-subtlest-secondary" />
              <div className="h-1 w-5 rounded-full bg-border-subtlest-tertiary" />
            </div>
          ))}
        </div>
      ),
    },
    {
      id: 'icon',
      title: 'Icon',
      description: 'Just the favicon. Minimal, like a dock.',
      preview: (
        <div className="flex items-center gap-1" aria-hidden>
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="size-6 rounded-6 bg-border-subtlest-secondary"
            />
          ))}
        </div>
      ),
    },
    {
      id: 'chip',
      title: 'Chip',
      description: 'Favicon + name in a pill — bookmarks bar.',
      preview: (
        <div className="flex flex-col gap-1" aria-hidden>
          {[0, 1].map((i) => (
            <div
              key={i}
              className="flex h-3 w-16 items-center gap-1 rounded-full bg-border-subtlest-tertiary px-1"
            >
              <div className="size-1.5 shrink-0 rounded-full bg-border-subtlest-secondary" />
              <div className="h-0.5 flex-1 rounded-full bg-border-subtlest-secondary" />
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <fieldset>
      <legend className="mb-2 flex items-baseline gap-2">
        <Typography bold type={TypographyType.Body}>
          Appearance
        </Typography>
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
        >
          Choose how shortcuts look
        </Typography>
      </legend>
      <div className="grid grid-cols-3 gap-2">
        {options.map((opt) => {
          const checked = value === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={checked}
              onClick={() => onChange(opt.id)}
              className={classNames(
                'group relative flex flex-col items-start gap-2 overflow-hidden rounded-12 border p-3 text-left outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-accent-cabbage-default focus-visible:ring-offset-2 focus-visible:ring-offset-background-default motion-reduce:transition-none',
                checked
                  ? 'border-border-subtlest-primary bg-surface-float'
                  : 'border-border-subtlest-tertiary hover:border-border-subtlest-secondary hover:bg-surface-float',
              )}
            >
              <span
                aria-hidden
                className={classNames(
                  'absolute inset-y-0 left-0 w-1 transition-colors duration-150 motion-reduce:transition-none',
                  checked ? 'bg-accent-cabbage-default' : 'bg-transparent',
                )}
              />
              {/* Live preview sitting on a neutral canvas that matches the
                  new-tab background tone, so users can picture it in place. */}
              <div className="flex h-12 w-full items-center justify-center rounded-8 bg-background-default px-2">
                {opt.preview}
              </div>
              <div className="flex min-w-0 flex-col">
                <span className="text-text-primary typo-callout">
                  {opt.title}
                </span>
                <span className="text-text-tertiary typo-caption1">
                  {opt.description}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </fieldset>
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
    onRevokePermission,
    bookmarks,
    hasCheckedBookmarksPermission,
    revokeBookmarksPermission,
  } = useShortcuts();
  const {
    hidden: hiddenTopSites,
    restore: restoreHiddenTopSites,
  } = useHiddenTopSites();
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

  const appearance: ShortcutsAppearance =
    flags?.shortcutsAppearance ?? DEFAULT_SHORTCUTS_APPEARANCE;
  const selectAppearance = (next: ShortcutsAppearance) => {
    if (next === appearance) {
      return;
    }
    updateFlag('shortcutsAppearance', next);
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

              <HorizontalSeparator />

              <AppearancePicker
                value={appearance}
                onChange={selectAppearance}
              />
            </>
          )}

          <HorizontalSeparator />

          {manager.shortcuts.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-16 border border-dashed border-border-subtlest-tertiary px-4 py-10 text-center">
              <span className="flex size-12 items-center justify-center rounded-full border border-border-subtlest-tertiary bg-surface-float text-text-tertiary">
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
            <div className="flex max-h-[60vh] flex-col gap-0.5 overflow-y-auto">
              <button
                type="button"
                onClick={onAdd}
                disabled={!manager.canAdd}
                className="group flex items-center gap-3 rounded-10 p-2 text-left transition-colors duration-150 hover:bg-surface-float disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent motion-reduce:transition-none"
                aria-label="Add a shortcut"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-8 border border-dashed border-border-subtlest-tertiary text-text-tertiary transition-colors duration-150 group-hover:border-solid group-hover:border-border-subtlest-secondary group-hover:bg-background-default group-hover:text-text-primary motion-reduce:transition-none">
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

          <BrowserConnectionsSection
            topSitesGranted={topSites !== undefined}
            bookmarksGranted={bookmarks !== undefined}
            hiddenCount={hiddenTopSites.length}
            onRevokeTopSites={onRevokePermission}
            onRevokeBookmarks={revokeBookmarksPermission}
            onRestoreHidden={() => restoreHiddenTopSites()}
          />
        </div>
      </Modal.Body>
    </Modal>
  );
}

interface BrowserConnectionsSectionProps {
  topSitesGranted: boolean;
  bookmarksGranted: boolean;
  hiddenCount: number;
  onRevokeTopSites?: () => void | Promise<void>;
  onRevokeBookmarks?: () => void | Promise<void>;
  onRestoreHidden: () => void;
}

function BrowserConnectionsSection({
  topSitesGranted,
  bookmarksGranted,
  hiddenCount,
  onRevokeTopSites,
  onRevokeBookmarks,
  onRestoreHidden,
}: BrowserConnectionsSectionProps): ReactElement | null {
  const hasTopSites = topSitesGranted && !!onRevokeTopSites;
  const hasBookmarks = bookmarksGranted && !!onRevokeBookmarks;
  const hasHidden = hiddenCount > 0;

  if (!hasTopSites && !hasBookmarks && !hasHidden) {
    return null;
  }

  return (
    <>
      <HorizontalSeparator />
      <section
        aria-label="Browser connections"
        className="flex flex-col gap-3"
      >
        <div className="flex flex-col gap-0.5">
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Primary}
            bold
          >
            Browser connections
          </Typography>
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
          >
            Manage what daily.dev can read from your browser.
          </Typography>
        </div>
        <ul className="flex flex-col gap-1.5">
          {hasTopSites && (
            <ConnectionRow
              icon={<SitesIcon />}
              label="Most visited sites"
              description="Used for auto mode and import."
              actionLabel="Disconnect"
              onAction={() => onRevokeTopSites?.()}
            />
          )}
          {hasBookmarks && (
            <ConnectionRow
              icon={<BookmarkIcon />}
              label="Bookmarks bar"
              description="Used to import your browser bookmarks."
              actionLabel="Disconnect"
              onAction={() => onRevokeBookmarks?.()}
            />
          )}
          {hasHidden && (
            <ConnectionRow
              icon={<RefreshIcon />}
              label={`Hidden sites (${hiddenCount})`}
              description="Sites you removed from auto mode."
              actionLabel="Restore all"
              onAction={onRestoreHidden}
            />
          )}
        </ul>
      </section>
    </>
  );
}

interface ConnectionRowProps {
  icon: ReactElement;
  label: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}

function ConnectionRow({
  icon,
  label,
  description,
  actionLabel,
  onAction,
}: ConnectionRowProps): ReactElement {
  return (
    <li className="flex items-center gap-3 rounded-10 p-2 transition-colors duration-150 hover:bg-surface-float motion-reduce:transition-none">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-8 bg-surface-float text-text-tertiary">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-text-primary typo-callout">{label}</p>
        <p className="truncate text-text-tertiary typo-caption1">
          {description}
        </p>
      </div>
      <Button
        type="button"
        variant={ButtonVariant.Tertiary}
        size={ButtonSize.Small}
        onClick={onAction}
      >
        {actionLabel}
      </Button>
    </li>
  );
}
