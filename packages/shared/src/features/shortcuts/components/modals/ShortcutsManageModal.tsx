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
  EarthIcon,
  EditIcon,
  EyeIcon,
  LayoutIcon,
  LinkIcon,
  MagicIcon,
  PlusIcon,
  RefreshIcon,
  SitesIcon,
  StarIcon,
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

// Reusable section header that anchors every top-level group in the modal.
// The small glyph chip on the left gives each section a unique "family crest"
// so users can scan the modal vertically and know where they are at a glance
// (Apple System Settings / Raycast pattern). The chip stays neutral by
// default and picks up a subtle accent tint when the section is the active
// subject — we use that only on Appearance right now but the API is ready.
function SectionHeader({
  icon,
  title,
  description,
  trailing,
}: {
  icon: ReactElement;
  title: string;
  description?: string;
  trailing?: ReactElement;
}): ReactElement {
  return (
    <div className="flex items-center gap-3">
      <span
        aria-hidden
        className="flex size-7 shrink-0 items-center justify-center rounded-8 bg-surface-float text-text-secondary"
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <Typography bold type={TypographyType.Subhead}>
          {title}
        </Typography>
        {description && (
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
          >
            {description}
          </Typography>
        )}
      </div>
      {trailing}
    </div>
  );
}

// Compact capacity pill used next to "Your shortcuts". The tone warms up as
// the library fills so the limit feels present without ever shouting — grey
// through most of the range, cabbage accent when there are two or fewer
// slots left, rose when the cap is hit. Tabular nums keep the width steady
// as the count ticks up.
function CapacityPill({
  used,
  max,
}: {
  used: number;
  max: number;
}): ReactElement {
  const remaining = max - used;
  const tone =
    used >= max
      ? 'bg-overlay-float-ketchup text-accent-ketchup-default'
      : remaining <= 2
        ? 'bg-overlay-float-cabbage text-accent-cabbage-default'
        : 'bg-surface-float text-text-tertiary';
  return (
    <span
      className={classNames(
        'rounded-6 px-1.5 py-0.5 tabular-nums typo-caption1 font-bold',
        tone,
      )}
    >
      {used}/{max}
    </span>
  );
}

// Clean radio row. Selected state is carried entirely by the filled cabbage
// dot + bold title — no background fill, so it never reads like a hover.
// Hover is the only place we tint the surface, which keeps the difference
// between "you're pointing at this" and "this is selected" obvious.
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
      className="group flex cursor-pointer items-start gap-3 rounded-10 p-2 transition-colors duration-150 hover:bg-surface-float motion-reduce:transition-none"
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
        <p
          className={classNames(
            'typo-callout',
            checked
              ? 'font-bold text-text-primary'
              : 'text-text-primary',
          )}
        >
          {title}
        </p>
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
      {/* Actions fade in on row hover/focus. On touch devices (no hover),
          we reveal them at 60% opacity so they're always reachable without
          overwhelming the row. */}
      <div className="flex items-center gap-0.5 opacity-0 transition-opacity duration-150 focus-within:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-60 [@media(hover:none)]:focus-within:opacity-100 motion-reduce:transition-none">
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
          className="hover:!bg-overlay-float-ketchup hover:!text-accent-ketchup-default"
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
      <legend className="contents">
        <SectionHeader
          icon={<LayoutIcon className="size-4" />}
          title="Appearance"
          description="How the row renders on the new-tab page."
        />
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
                // Card rests on a 1px border. Selected adds an accent border
                // + corner badge + a soft cabbage-tinted background to the
                // preview shelf, so the choice feels lit up, not merely
                // outlined. Focus ring stays on the whole card for keyboards.
                'group relative flex flex-col items-center gap-1.5 rounded-12 border p-2 text-left outline-none transition-all duration-150 focus-visible:ring-2 focus-visible:ring-accent-cabbage-default focus-visible:ring-offset-2 focus-visible:ring-offset-background-default motion-reduce:transition-none',
                checked
                  ? 'border-accent-cabbage-default bg-overlay-float-cabbage/40'
                  : 'border-border-subtlest-tertiary hover:-translate-y-px hover:border-border-subtlest-secondary hover:bg-surface-float',
              )}
            >
              {checked && (
                <span
                  aria-hidden
                  className="absolute -right-1.5 -top-1.5 flex size-4 items-center justify-center rounded-full bg-accent-cabbage-default text-surface-invert shadow-2"
                >
                  <VIcon className="size-2.5" />
                </span>
              )}
              <div
                className={classNames(
                  'flex h-10 w-full items-center justify-center rounded-8 transition-colors duration-150 motion-reduce:transition-none',
                  checked ? 'bg-background-default' : 'bg-background-subtle',
                )}
              >
                {opt.preview}
              </div>
              <span
                className={classNames(
                  'typo-caption1 transition-colors duration-150 motion-reduce:transition-none',
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
    askBookmarksPermission,
    revokeBookmarksPermission,
  } = useShortcuts();
  const {
    hidden: hiddenTopSites,
    restore: restoreHiddenTopSites,
  } = useHiddenTopSites();
  const { openModal, closeModal } = useLazyModal();
  const close = () => {
    closeModal();
    props?.onRequestClose?.(undefined as never);
  };

  const mode = flags?.shortcutsMode ?? 'manual';
  const selectMode = async (next: 'manual' | 'auto') => {
    if (next === mode) {
      return;
    }
    await updateFlag('shortcutsMode', next);
    logEvent({
      event_name: LogEvent.ChangeShortcutsMode,
      target_type: TargetType.Shortcuts,
      extra: JSON.stringify({ mode: next }),
    });
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
    logEvent({
      event_name: LogEvent.ChangeShortcutsAppearance,
      target_type: TargetType.Shortcuts,
      extra: JSON.stringify({ appearance: next }),
    });
  };

  // Sync flag: when on, the same shortcuts render on daily.dev's web app
  // (not just the new-tab extension). Lives here in the manage modal — with
  // a clear description — instead of as a one-line toggle in the dropdown
  // where the "what does this do" wasn't obvious.
  const showOnWebapp = flags?.showShortcutsOnWebapp ?? false;
  const toggleShowOnWebapp = () => {
    const next = !showOnWebapp;
    updateFlag('showShortcutsOnWebapp', next);
    logEvent({
      event_name: LogEvent.ToggleShortcutsOnWebapp,
      target_type: TargetType.Shortcuts,
      extra: JSON.stringify({ enabled: next }),
    });
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
      {/* Header: title only on the left, primary Done on the right. The
          count badge moved out of the header — it lives next to the
          "Your shortcuts" subhead where it's contextual instead of
          floating above unrelated sections. */}
      <Modal.Header showCloseButton={false}>
        <Typography tag={TypographyTag.H3} type={TypographyType.Body} bold>
          Shortcuts
        </Typography>
        <Button
          type="button"
          variant={ButtonVariant.Primary}
          size={ButtonSize.Small}
          className="ml-auto"
          onClick={close}
        >
          Done
        </Button>
      </Modal.Header>
      <Modal.Body>
        {/* Settings flow, top to bottom: visibility → look → source → list →
            connections. Each section gets a small anchor glyph via
            SectionHeader so the modal reads as a set of distinct "cards" of
            configuration rather than a wall of bolded titles, and we drop
            hairline dividers between them for vertical rhythm. */}
        <div className="flex flex-col divide-y divide-border-subtlest-tertiary [&>*:not(:first-child)]:pt-5 [&>*:not(:last-child)]:pb-5">
          <SectionHeader
            icon={<EyeIcon className="size-4" />}
            title="Show shortcuts"
            description="Toggle the row visibility on the new-tab page."
            trailing={
              <Switch
                inputId="showTopSites-switch"
                name="showTopSites"
                compact={false}
                checked={showTopSites}
                onToggle={toggleShowTopSites}
                aria-label="Show shortcuts"
              />
            }
          />

          {showTopSites && (
            <div className="flex flex-col gap-4">
              <AppearancePicker
                value={appearance}
                onChange={selectAppearance}
              />
            </div>
          )}

          {showTopSites && (
            <fieldset className="flex flex-col gap-2">
              <legend className="contents">
                <SectionHeader
                  icon={<MagicIcon className="size-4" />}
                  title="Source"
                  description="Choose where this row gets its shortcuts from."
                />
              </legend>
              <div className="flex flex-col gap-1">
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
              </div>
            </fieldset>
          )}

          {mode === 'manual' && (
            <section className="flex flex-col gap-2">
              <SectionHeader
                icon={<StarIcon className="size-4" />}
                title="Your shortcuts"
                description="Drag to reorder. Hover a row to edit or remove."
                trailing={
                  <CapacityPill
                    used={manager.shortcuts.length}
                    max={MAX_SHORTCUTS}
                  />
                }
              />
              {manager.shortcuts.length === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-14 border border-dashed border-border-subtlest-tertiary bg-surface-float/40 px-4 py-8 text-center">
                  <span
                    aria-hidden
                    className="flex size-12 items-center justify-center rounded-14 bg-overlay-float-cabbage text-accent-cabbage-default"
                  >
                    <StarIcon secondary className="size-6" />
                  </span>
                  <Typography
                    type={TypographyType.Callout}
                    color={TypographyColor.Primary}
                    bold
                  >
                    Your shortcuts, your rules
                  </Typography>
                  <Typography
                    type={TypographyType.Caption1}
                    color={TypographyColor.Tertiary}
                  >
                    Add one manually or import from Connections below.
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
                  {/* Inline "Add" affordance. Visually distinct from the
                      shortcut rows (dashed icon chip, muted copy, subtle
                      right-side hint) so it reads as a utility row, not
                      another shortcut. At the cap we keep it visible but
                      disabled with a tiny "Library full" hint — tells users
                      why without hiding the control. */}
                  <button
                    type="button"
                    onClick={onAdd}
                    disabled={!manager.canAdd}
                    className="group flex items-center gap-3 rounded-10 p-2 text-left transition-colors duration-150 hover:bg-surface-float disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-transparent motion-reduce:transition-none"
                    aria-label="Add a shortcut"
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-8 border border-dashed border-border-subtlest-tertiary text-text-tertiary transition-all duration-150 group-hover:border-solid group-hover:border-accent-cabbage-default group-hover:bg-overlay-float-cabbage group-hover:text-accent-cabbage-default motion-reduce:transition-none">
                      <PlusIcon />
                    </span>
                    <p className="truncate text-text-primary typo-callout">
                      Add a shortcut
                    </p>
                    {!manager.canAdd && (
                      <span className="ml-auto text-text-tertiary typo-caption1">
                        Library full
                      </span>
                    )}
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
            isAuto={mode === 'auto'}
            topSitesCount={topSitesCount}
            bookmarksCount={bookmarksCount}
            topSitesKnown={topSitesKnown}
            bookmarksKnown={bookmarksKnown}
            showOnWebapp={showOnWebapp}
            onToggleShowOnWebapp={toggleShowOnWebapp}
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
            onAskBookmarks={askBookmarksPermission}
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
  isAuto: boolean;
  topSitesCount: number;
  bookmarksCount: number;
  topSitesKnown: boolean;
  bookmarksKnown: boolean;
  showOnWebapp: boolean;
  onToggleShowOnWebapp: () => void;
  onImportTopSites?: () => void;
  onImportBookmarks?: () => void;
  onAskTopSites?: () => void | Promise<boolean>;
  onAskBookmarks?: () => void | Promise<boolean>;
  onRevokeTopSites?: () => void | Promise<void>;
  onRevokeBookmarks?: () => void | Promise<void>;
  onRestoreHidden: () => void;
}

// Groups every cross-surface concern: permissions the browser grants us to
// read (top sites, bookmarks, hidden restoration) AND where we write the
// shortcuts (just this new-tab page, or synced to daily.dev). Previously the
// "Show on daily.dev" setting floated between Source and Your shortcuts as
// its own loose card, which fought the rest of the modal's rhythm. Living
// here, it reads as one more connection — just one that flows outward
// instead of inward.
function BrowserConnectionsSection({
  topSitesGranted,
  bookmarksGranted,
  hiddenCount,
  isAuto,
  topSitesCount,
  bookmarksCount,
  topSitesKnown,
  bookmarksKnown,
  showOnWebapp,
  onToggleShowOnWebapp,
  onImportTopSites,
  onImportBookmarks,
  onAskTopSites,
  onAskBookmarks,
  onRevokeTopSites,
  onRevokeBookmarks,
  onRestoreHidden,
}: BrowserConnectionsSectionProps): ReactElement {
  return (
    <section aria-label="Connections" className="flex flex-col gap-2">
      <SectionHeader
        icon={<LinkIcon className="size-4" />}
        title="Connections"
        description="Import from your browser, or sync this row to daily.dev so it follows you across signed-in devices."
      />
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
        {/* Hidden sites is purely an auto-mode concept: the only way to add
            to this list is to X-out a tile in the live top-sites row. In
            manual mode it's dead data, so we hide it. Pinning it directly
            under Most visited sites (rather than after Bookmarks) makes the
            ownership obvious at a glance — "these go together". */}
        {isAuto && hiddenCount > 0 && (
          <ConnectionRow
            icon={<RefreshIcon />}
            label={`Hidden sites (${hiddenCount})`}
            description="Restore sites you removed from your Most visited row."
            primaryLabel="Restore all"
            onPrimary={onRestoreHidden}
          />
        )}
        <ConnectionRow
          icon={<BookmarkIcon />}
          label="Bookmarks bar"
          description={
            bookmarksKnown
              ? `${bookmarksCount} available`
              : 'Grant access to import your browser bookmarks.'
          }
          primaryLabel={bookmarksGranted ? 'Import' : 'Connect'}
          onPrimary={
            bookmarksGranted
              ? onImportBookmarks
              : onAskBookmarks
                ? () => onAskBookmarks()
                : undefined
          }
          secondaryLabel={bookmarksGranted ? 'Disconnect' : undefined}
          onSecondary={
            bookmarksGranted ? () => onRevokeBookmarks?.() : undefined
          }
        />
        <ConnectionRow
          icon={<EarthIcon />}
          label="Sync to daily.dev"
          description="Show these shortcuts on the web app on every signed-in browser."
          trailing={
            <Switch
              inputId="shortcuts-show-on-webapp"
              name="shortcuts-show-on-webapp"
              compact={false}
              checked={showOnWebapp}
              onToggle={onToggleShowOnWebapp}
              aria-label="Sync shortcuts to daily.dev"
            />
          }
        />
      </ul>
    </section>
  );
}

interface ConnectionRowProps {
  icon: ReactElement;
  label: string;
  description: string;
  primaryLabel?: string;
  onPrimary?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  // Optional override for the trailing control. When provided, we skip the
  // primary/secondary button pair and render this slot instead. Lets the
  // sync row drop a Switch into the same footprint without a special-case
  // component.
  trailing?: ReactElement;
}

function ConnectionRow({
  icon,
  label,
  description,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  trailing,
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
        {trailing ?? (
          <>
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
            {primaryLabel && (
              <Button
                type="button"
                variant={ButtonVariant.Float}
                size={ButtonSize.XSmall}
                disabled={!onPrimary}
                onClick={onPrimary}
              >
                {primaryLabel}
              </Button>
            )}
          </>
        )}
      </div>
    </li>
  );
}
