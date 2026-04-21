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
import { Switch } from '../../../../components/fields/Switch';
import {
  BookmarkIcon,
  DragIcon,
  EditIcon,
  PlusIcon,
  RefreshIcon,
  SitesIcon,
  TrashIcon,
  VIcon,
} from '../../../../components/icons';
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

// Lean mode row styled like the settings-page radio pattern:
// borderless by default, a quiet hover, and a filled cabbage ring on select.
// No left accent rail, no heavy outline — the radio dot carries the state.
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
        'group flex cursor-pointer items-start gap-3 rounded-10 p-2 transition-colors duration-150 motion-reduce:transition-none',
        checked ? 'bg-surface-float' : 'hover:bg-surface-float',
      )}
    >
      <input
        id={id}
        type="radio"
        name="shortcuts-mode"
        checked={checked}
        onChange={onSelect}
        className="peer sr-only"
      />
      <span
        aria-hidden
        className={classNames(
          'mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-150 motion-reduce:transition-none',
          checked
            ? 'border-accent-cabbage-default'
            : 'border-border-subtlest-secondary group-hover:border-border-subtlest-primary',
        )}
      >
        {checked && (
          <span className="size-2 rounded-full bg-accent-cabbage-default" />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-text-primary typo-callout">{title}</p>
        <p className="mt-0.5 text-text-tertiary typo-caption1">{description}</p>
      </div>
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
    preview: ReactElement;
  }> = [
    {
      id: 'tile',
      title: 'Tile',
      preview: (
        <div className="flex items-start gap-1.5" aria-hidden>
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="size-5 rounded-6 bg-border-subtlest-secondary" />
              <div className="h-1 w-4 rounded-1 bg-border-subtlest-tertiary" />
            </div>
          ))}
        </div>
      ),
    },
    {
      id: 'icon',
      title: 'Icon',
      preview: (
        <div className="flex items-center gap-1" aria-hidden>
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="size-5 rounded-6 bg-border-subtlest-secondary"
            />
          ))}
        </div>
      ),
    },
    {
      id: 'chip',
      title: 'Chip',
      preview: (
        <div className="flex flex-col gap-1" aria-hidden>
          {[0, 1].map((i) => (
            <div
              key={i}
              className="flex h-3 w-14 items-center gap-1 rounded-4 bg-border-subtlest-tertiary px-1"
            >
              <div className="size-1.5 shrink-0 rounded-2 bg-border-subtlest-secondary" />
              <div className="h-0.5 flex-1 rounded-1 bg-border-subtlest-secondary" />
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1 text-text-primary typo-subhead">
        <span className="font-bold">Appearance</span>
      </legend>
      <div
        className="grid grid-cols-3 gap-2"
        role="radiogroup"
        aria-label="Shortcut appearance"
      >
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
                'group relative flex flex-col items-center gap-1.5 rounded-10 border p-2 text-left outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-accent-cabbage-default focus-visible:ring-offset-2 focus-visible:ring-offset-background-default motion-reduce:transition-none',
                checked
                  ? 'border-accent-cabbage-default bg-surface-float'
                  : 'border-border-subtlest-tertiary hover:border-border-subtlest-secondary',
              )}
            >
              {/* A small corner badge is the clearest "this one is chosen"
                  signal — stronger than a color swap but quieter than an
                  accent rail that covers the whole row. */}
              {checked && (
                <span
                  aria-hidden
                  className="absolute -right-1.5 -top-1.5 flex size-4 items-center justify-center rounded-full bg-accent-cabbage-default text-surface-invert shadow-2"
                >
                  <VIcon className="size-2.5" />
                </span>
              )}
              <div className="flex h-10 w-full items-center justify-center rounded-6 bg-background-default">
                {opt.preview}
              </div>
              <span
                className={classNames(
                  'typo-caption1',
                  checked
                    ? 'font-bold text-text-primary'
                    : 'text-text-tertiary group-hover:text-text-primary',
                )}
              >
                {opt.title}
              </span>
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
        <Button
          type="button"
          variant={ButtonVariant.Float}
          size={ButtonSize.Small}
          className="ml-auto"
          onClick={() => props?.onRequestClose?.(undefined as never)}
        >
          Done
        </Button>
      </Modal.Header>
      <Modal.Body>
        {/* Matches the settings page rhythm: sections spaced with gap, bold
            Subhead titles, no heavy separators between groups. */}
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-4">
            <div className="flex flex-1 flex-col">
              <Typography bold type={TypographyType.Subhead}>
                Show shortcuts
              </Typography>
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Tertiary}
              >
                Toggle the row visibility on the new-tab page.
              </Typography>
            </div>
            <Switch
              inputId="showTopSites-switch"
              name="showTopSites"
              compact={false}
              checked={showTopSites}
              onToggle={toggleShowTopSites}
              aria-label="Show shortcuts"
            />
          </div>

          {showTopSites && (
            <>
              <fieldset className="flex flex-col gap-1">
                <legend className="mb-1 text-text-primary typo-subhead">
                  <span className="font-bold">Source</span>
                </legend>
                <ShortcutsModeOption
                  id="shortcuts-mode-manual"
                  checked={mode === 'manual'}
                  onSelect={() => selectMode('manual')}
                  title="My shortcuts"
                  description="Curated by you — add, edit, reorder."
                />
                <ShortcutsModeOption
                  id="shortcuts-mode-auto"
                  checked={mode === 'auto'}
                  onSelect={() => selectMode('auto')}
                  title="Most visited sites"
                  description="Suggested from your browser history."
                />
              </fieldset>

              <AppearancePicker
                value={appearance}
                onChange={selectAppearance}
              />
            </>
          )}

          {mode === 'manual' && (
            <section className="flex flex-col gap-1">
              <div className="mb-1 flex items-baseline justify-between">
                <Typography bold type={TypographyType.Subhead}>
                  Your shortcuts
                </Typography>
                <Typography
                  type={TypographyType.Caption1}
                  color={TypographyColor.Tertiary}
                >
                  {manager.shortcuts.length}/{MAX_SHORTCUTS}
                </Typography>
              </div>
              {manager.shortcuts.length === 0 ? (
                <div className="flex flex-col items-center gap-2 rounded-10 bg-surface-float px-4 py-8 text-center">
                  <Typography
                    type={TypographyType.Callout}
                    color={TypographyColor.Primary}
                    bold
                  >
                    No shortcuts yet
                  </Typography>
                  <Typography
                    type={TypographyType.Caption1}
                    color={TypographyColor.Tertiary}
                  >
                    Add one manually or import from Browser connections below.
                  </Typography>
                  <Button
                    type="button"
                    variant={ButtonVariant.Primary}
                    size={ButtonSize.Small}
                    icon={<PlusIcon />}
                    onClick={onAdd}
                    className="mt-1"
                  >
                    Add shortcut
                  </Button>
                </div>
              ) : (
                <div className="flex max-h-[50vh] flex-col gap-0.5 overflow-y-auto">
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
                    <p className="truncate text-text-primary typo-callout">
                      Add a shortcut
                    </p>
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
            </section>
          )}

          <BrowserConnectionsSection
            topSitesGranted={topSites !== undefined}
            bookmarksGranted={bookmarks !== undefined}
            hiddenCount={hiddenTopSites.length}
            topSitesCount={topSitesCount}
            bookmarksCount={bookmarksCount}
            topSitesKnown={topSitesKnown}
            bookmarksKnown={bookmarksKnown}
            onImportTopSites={
              setShowImportSource
                ? () => setShowImportSource('topSites')
                : undefined
            }
            onImportBookmarks={
              setShowImportSource
                ? () => setShowImportSource('bookmarks')
                : undefined
            }
            onAskTopSites={askTopSitesPermission}
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
  topSitesCount: number;
  bookmarksCount: number;
  topSitesKnown: boolean;
  bookmarksKnown: boolean;
  onImportTopSites?: () => void;
  onImportBookmarks?: () => void;
  onAskTopSites?: () => void | Promise<boolean>;
  onRevokeTopSites?: () => void | Promise<void>;
  onRevokeBookmarks?: () => void | Promise<void>;
  onRestoreHidden: () => void;
}

// Single home for anything that involves the browser:
// import (primary action), revoke (secondary), and restore hidden.
// Lives at the bottom because it's a "settings-like" section — less used
// than adding/editing shortcuts but too important to bury in a menu.
function BrowserConnectionsSection({
  topSitesGranted,
  bookmarksGranted,
  hiddenCount,
  topSitesCount,
  bookmarksCount,
  topSitesKnown,
  bookmarksKnown,
  onImportTopSites,
  onImportBookmarks,
  onAskTopSites,
  onRevokeTopSites,
  onRevokeBookmarks,
  onRestoreHidden,
}: BrowserConnectionsSectionProps): ReactElement {
  return (
    <section
      aria-label="Browser connections"
      className="flex flex-col gap-2"
    >
      <div className="mb-1 flex flex-col">
        <Typography bold type={TypographyType.Subhead}>
          Browser connections
        </Typography>
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
        >
          Import from and manage what daily.dev can read from your browser.
        </Typography>
      </div>
      <ul className="flex flex-col gap-0.5">
        <ConnectionRow
          icon={<SitesIcon />}
          label="Most visited sites"
          description={
            topSitesKnown
              ? `${topSitesCount} available`
              : 'Grant access to import or switch to auto mode.'
          }
          primaryLabel={topSitesGranted ? 'Import' : 'Connect'}
          onPrimary={
            topSitesGranted
              ? onImportTopSites
              : onAskTopSites
                ? () => onAskTopSites()
                : undefined
          }
          secondaryLabel={topSitesGranted ? 'Disconnect' : undefined}
          onSecondary={
            topSitesGranted ? () => onRevokeTopSites?.() : undefined
          }
        />
        <ConnectionRow
          icon={<BookmarkIcon />}
          label="Bookmarks bar"
          description={
            bookmarksKnown
              ? `${bookmarksCount} available`
              : 'Grant access to import your browser bookmarks.'
          }
          primaryLabel={bookmarksGranted ? 'Import' : 'Connect'}
          onPrimary={bookmarksGranted ? onImportBookmarks : onImportBookmarks}
          secondaryLabel={bookmarksGranted ? 'Disconnect' : undefined}
          onSecondary={
            bookmarksGranted ? () => onRevokeBookmarks?.() : undefined
          }
        />
        {hiddenCount > 0 && (
          <ConnectionRow
            icon={<RefreshIcon />}
            label={`Hidden sites (${hiddenCount})`}
            description="Sites you removed from auto mode."
            primaryLabel="Restore all"
            onPrimary={onRestoreHidden}
          />
        )}
      </ul>
    </section>
  );
}

interface ConnectionRowProps {
  icon: ReactElement;
  label: string;
  description: string;
  primaryLabel: string;
  onPrimary?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
}

function ConnectionRow({
  icon,
  label,
  description,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
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
      <div className="flex shrink-0 items-center gap-1">
        {secondaryLabel && (
          <Button
            type="button"
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.XSmall}
            onClick={onSecondary}
          >
            {secondaryLabel}
          </Button>
        )}
        <Button
          type="button"
          variant={ButtonVariant.Float}
          size={ButtonSize.XSmall}
          disabled={!onPrimary}
          onClick={onPrimary}
        >
          {primaryLabel}
        </Button>
      </div>
    </li>
  );
}
