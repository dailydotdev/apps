/* eslint-disable @typescript-eslint/no-use-before-define */
import type { ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';
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
  LinkIcon,
  PlusIcon,
  RefreshIcon,
  StarIcon,
  TrashIcon,
  VIcon,
} from '../../../../components/icons';
import { ChromeIcon } from '../../../../components/icons/Browser/Chrome';
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
import { invokeOnRequestClose } from './closeModal';
import type { ShortcutEditFormState } from '../ShortcutEditForm';
import { ShortcutEditForm } from '../ShortcutEditForm';

// Flattened state-machine for the Browser access row's primary action. The
// button can either trigger the picker (granted) or ask for permission (not
// granted); extracted from JSX so we don't nest ternaries inline.
function getTopSitesPrimaryAction({
  topSitesGranted,
  setShowImportSource,
  askTopSitesPermission,
}: {
  topSitesGranted: boolean;
  setShowImportSource?: (
    source: 'topSites' | 'bookmarks',
    returnTo?: LazyModal.ShortcutsManage,
  ) => void;
  askTopSitesPermission?: () => Promise<boolean> | void;
}): (() => void) | undefined {
  if (topSitesGranted) {
    if (!setShowImportSource) {
      return undefined;
    }
    return () => setShowImportSource('topSites', LazyModal.ShortcutsManage);
  }
  if (!askTopSitesPermission) {
    return undefined;
  }
  return () => {
    askTopSitesPermission();
  };
}

// Same flattening as `getTopSitesPrimaryAction`, but for the Bookmarks row.
function getBookmarksPrimaryAction({
  bookmarksGranted,
  onImportBookmarks,
  onAskBookmarks,
}: {
  bookmarksGranted: boolean;
  onImportBookmarks?: () => void;
  onAskBookmarks?: () => Promise<boolean> | void;
}): (() => void) | undefined {
  if (bookmarksGranted) {
    return onImportBookmarks;
  }
  if (!onAskBookmarks) {
    return undefined;
  }
  return () => {
    onAskBookmarks();
  };
}

// Plain-text section header. Bold subhead + muted caption, no decorative
// icon chip. Keeps each group clearly delimited vertically without the
// visual weight of a leading glyph — settings rhythm closer to Linear /
// GitHub preferences than Raycast.
function SectionHeader({
  title,
  description,
  trailing,
}: {
  title: string;
  description?: string;
  trailing?: ReactElement;
}): ReactElement {
  return (
    <div className="flex items-center gap-3">
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
  let tone = 'bg-surface-float text-text-tertiary';
  if (used >= max) {
    tone = 'bg-overlay-float-ketchup text-accent-ketchup-default';
  } else if (remaining <= 2) {
    tone = 'bg-overlay-float-cabbage text-accent-cabbage-default';
  }
  return (
    <span
      className={classNames(
        'rounded-6 px-1.5 py-0.5 font-bold tabular-nums typo-caption1',
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
// between "you're pointing at this" and "this is selected" obvious. An
// optional `trailingBadge` sits on the right (kept out of the radio/text
// column) so we can flag a row with a brand mark — e.g. the Chrome glyph
// on the auto-mode row — without knocking the radio bullet and copy out
// of alignment.
function ShortcutsModeOption({
  id,
  checked,
  onSelect,
  title,
  description,
  trailingBadge,
}: {
  id: string;
  checked: boolean;
  onSelect: () => void;
  title: string;
  description: string;
  trailingBadge?: ReactElement;
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
            checked ? 'font-bold text-text-primary' : 'text-text-primary',
          )}
        >
          {title}
        </p>
        <p className="mt-0.5 text-text-tertiary typo-caption1">{description}</p>
      </div>
      {trailingBadge && (
        <span
          aria-hidden
          className="mt-0.5 flex size-5 shrink-0 items-center justify-center"
        >
          {trailingBadge}
        </span>
      )}
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
      <div className="[@media(hover:none)]:opacity-60 flex items-center gap-0.5 opacity-0 transition-opacity duration-150 focus-within:opacity-100 group-hover:opacity-100 motion-reduce:transition-none [@media(hover:none)]:focus-within:opacity-100">
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
// see what they're picking. Pattern borrowed from Raindrop.io's layout
// switcher and Notion's view picker.
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
              <div className="rounded-1 h-1 w-4 bg-border-subtlest-tertiary" />
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
              <div className="rounded-1 h-0.5 flex-1 bg-border-subtlest-secondary" />
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
                  'transition-colors duration-150 typo-caption1 motion-reduce:transition-none',
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

export default function ShortcutsManageModal(props: ModalProps): ReactElement {
  const { logEvent } = useLogContext();
  const { showTopSites, toggleShowTopSites, flags, updateFlag } =
    useSettingsContext();
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
  const { hidden: hiddenTopSites, restore: restoreHiddenTopSites } =
    useHiddenTopSites();
  const { closeModal } = useLazyModal();
  const close = () => {
    closeModal();
    invokeOnRequestClose(props?.onRequestClose);
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
  const topSitesGranted = topSites !== undefined;
  const topSitesKnown = hasCheckedTopSitesPermission && topSitesGranted;
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

  // Inline add/edit: we keep the form inside the manage modal instead of
  // opening a separate ShortcutEdit modal. Popping a second modal closed this
  // one via the LazyModal registry (only one can be open at a time), so the
  // user landed on an empty surface after saving and had to reopen Manage
  // from the hub. Swapping this modal's body between "list view" and "form
  // view" keeps the whole flow in a single surface.
  const [editing, setEditing] = useState<
    { mode: 'add' } | { mode: 'edit'; shortcut: Shortcut } | null
  >(null);
  const [formState, setFormState] = useState<ShortcutEditFormState>({
    isSubmitting: false,
    isUploading: false,
  });

  const onEdit = (shortcut: Shortcut) => setEditing({ mode: 'edit', shortcut });

  const onRemove = (shortcut: Shortcut) => manager.removeShortcut(shortcut.url);

  const onAdd = () => setEditing({ mode: 'add' });

  const closeEditor = () => setEditing(null);

  const EDIT_FORM_ID = 'shortcut-edit-form-manage';

  if (editing) {
    return (
      <Modal
        kind={Modal.Kind.FlexibleCenter}
        size={Modal.Size.Medium}
        {...props}
      >
        <Modal.Header showCloseButton={false}>
          <Typography tag={TypographyTag.H3} type={TypographyType.Body} bold>
            {editing.mode === 'add' ? 'Add shortcut' : 'Edit shortcut'}
          </Typography>
          <Button
            type="button"
            variant={ButtonVariant.Float}
            size={ButtonSize.Small}
            className="-mr-2 ml-auto tablet:-mr-4"
            onClick={closeEditor}
          >
            Back
          </Button>
        </Modal.Header>
        <Modal.Body>
          <ShortcutEditForm
            mode={editing.mode}
            shortcut={editing.mode === 'edit' ? editing.shortcut : undefined}
            formId={EDIT_FORM_ID}
            onStateChange={setFormState}
            onDone={closeEditor}
          />
          <div className="mt-4 flex justify-end gap-2">
            <Button
              type="button"
              variant={ButtonVariant.Float}
              size={ButtonSize.Small}
              onClick={closeEditor}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form={EDIT_FORM_ID}
              variant={ButtonVariant.Primary}
              size={ButtonSize.Small}
              disabled={formState.isSubmitting || formState.isUploading}
            >
              {editing.mode === 'add' ? 'Add' : 'Save'}
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    );
  }

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
          className="-mr-2 ml-auto tablet:-mr-4"
          onClick={close}
        >
          Done
        </Button>
      </Modal.Header>
      <Modal.Body>
        {/* Sections stack vertically with hairline dividers. Flow goes:
            visibility (master switch) → look → source (with inline auto
            controls when auto is picked) → your list (manual) →
            connections (bookmarks + cross-device sync). */}
        <div className="flex flex-col divide-y divide-border-subtlest-tertiary [&>*:not(:first-child)]:pt-5 [&>*:not(:last-child)]:pb-5">
          <SectionHeader
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
            <fieldset className="flex flex-col gap-2">
              <legend className="contents">
                <SectionHeader
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
                  description="Curated by you. Add, edit, and reorder."
                />
                <ShortcutsModeOption
                  id="shortcuts-mode-auto"
                  checked={mode === 'auto'}
                  onSelect={() => selectMode('auto')}
                  title="Most visited sites"
                  description="Pulled automatically from your browser history."
                  trailingBadge={<ChromeIcon className="size-5" />}
                />
              </div>
            </fieldset>
          )}

          {/* Auto-mode connections. Mirrors the manual-mode Connections
              section 1:1 — same SectionHeader treatment, same bare <ul>
              of ConnectionRows — so the divider, title, and row padding
              all line up regardless of which source the user picks. */}
          {showTopSites && mode === 'auto' && (
            <section aria-label="Connections" className="flex flex-col gap-2">
              <SectionHeader
                title="Connections"
                description="Pull your most visited sites from your browser."
              />
              <ul className="flex flex-col gap-0.5">
                <ConnectionRow
                  icon={<LinkIcon />}
                  label="Browser access"
                  description={
                    topSitesKnown
                      ? `${topSitesCount} sites available from your browser.`
                      : 'Grant access so we can read your most visited sites.'
                  }
                  primaryLabel={topSitesGranted ? 'Import' : 'Connect'}
                  onPrimary={getTopSitesPrimaryAction({
                    topSitesGranted,
                    setShowImportSource,
                    askTopSitesPermission,
                  })}
                  secondaryLabel={topSitesGranted ? 'Disconnect' : undefined}
                  onSecondary={
                    topSitesGranted ? () => onRevokePermission?.() : undefined
                  }
                />
                {hiddenTopSites.length > 0 && (
                  <ConnectionRow
                    icon={<RefreshIcon />}
                    label={`Hidden sites (${hiddenTopSites.length})`}
                    description="Restore sites you removed from your Most visited row."
                    primaryLabel="Restore all"
                    onPrimary={() => restoreHiddenTopSites()}
                  />
                )}
              </ul>
            </section>
          )}

          {mode === 'manual' && (
            <section className="flex flex-col gap-2">
              <SectionHeader
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
                <div className="bg-surface-float/40 flex flex-col items-center gap-3 rounded-14 border border-dashed border-border-subtlest-tertiary px-4 py-8 text-center">
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
                <div className="flex flex-col gap-0.5">
                  {/* Inline "Add" affordance sitting above the list. At
                      the cap we keep it visible but disabled with a tiny
                      "Library full" hint so users know why they can't add. */}
                  <button
                    type="button"
                    onClick={onAdd}
                    disabled={!manager.canAdd}
                    className="disabled:opacity-60 group flex items-center gap-3 rounded-10 p-2 text-left transition-colors duration-150 hover:bg-surface-float disabled:cursor-not-allowed disabled:hover:bg-transparent motion-reduce:transition-none"
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

          {/* Connections (bookmarks import + web-app sync) only apply when the
              user curates their own list. In auto mode the row is fed by
              browser history, so importing bookmarks or mirroring a manual
              list across devices is meaningless — hide the whole section to
              match how "Your shortcuts" disappears above. */}
          {mode === 'manual' && (
            <BrowserConnectionsSection
              bookmarksGranted={bookmarks !== undefined}
              bookmarksCount={bookmarksCount}
              bookmarksKnown={bookmarksKnown}
              showOnWebapp={showOnWebapp}
              onToggleShowOnWebapp={toggleShowOnWebapp}
              onImportBookmarks={
                setShowImportSource
                  ? () =>
                      setShowImportSource(
                        'bookmarks',
                        LazyModal.ShortcutsManage,
                      )
                  : undefined
              }
              onAskBookmarks={askBookmarksPermission}
              onRevokeBookmarks={revokeBookmarksPermission}
            />
          )}

          {/* Appearance lives at the bottom: it tweaks how the already-decided
              source+list renders, so it reads better *after* users have
              picked what the row shows. */}
          {showTopSites && (
            <div className="flex flex-col gap-4">
              <AppearancePicker
                value={appearance}
                onChange={selectAppearance}
              />
            </div>
          )}
        </div>
      </Modal.Body>
    </Modal>
  );
}

interface BrowserConnectionsSectionProps {
  bookmarksGranted: boolean;
  bookmarksCount: number;
  bookmarksKnown: boolean;
  showOnWebapp: boolean;
  onToggleShowOnWebapp: () => void;
  onImportBookmarks?: () => void;
  onAskBookmarks?: () => void | Promise<boolean>;
  onRevokeBookmarks?: () => void | Promise<void>;
}

// "Connections" holds everything that's not specific to one source choice:
// importing from bookmarks (available regardless of auto/manual) and the
// cross-device web app sync. Top-sites permissions live under the Source
// radio where they actually belong, so this section stays short and clear.
function BrowserConnectionsSection({
  bookmarksGranted,
  bookmarksCount,
  bookmarksKnown,
  showOnWebapp,
  onToggleShowOnWebapp,
  onImportBookmarks,
  onAskBookmarks,
  onRevokeBookmarks,
}: BrowserConnectionsSectionProps): ReactElement {
  return (
    <section aria-label="Connections" className="flex flex-col gap-2">
      <SectionHeader
        title="Connections"
        description="Pull from your browser, or mirror your shortcuts on the daily.dev web app."
      />
      <ul className="flex flex-col gap-0.5">
        <ConnectionRow
          icon={<BookmarkIcon />}
          label="Bookmarks bar"
          description={
            bookmarksKnown
              ? `${bookmarksCount} available`
              : 'Grant access to import your browser bookmarks.'
          }
          primaryLabel={bookmarksGranted ? 'Import' : 'Connect'}
          onPrimary={getBookmarksPrimaryAction({
            bookmarksGranted,
            onImportBookmarks,
            onAskBookmarks,
          })}
          secondaryLabel={bookmarksGranted ? 'Disconnect' : undefined}
          onSecondary={
            bookmarksGranted ? () => onRevokeBookmarks?.() : undefined
          }
        />
        <ConnectionRow
          icon={<EarthIcon />}
          label="Show on daily.dev web app"
          description="Mirror these shortcuts across every signed-in browser."
          trailing={
            <Switch
              inputId="shortcuts-show-on-webapp"
              name="shortcuts-show-on-webapp"
              compact={false}
              checked={showOnWebapp}
              onToggle={onToggleShowOnWebapp}
              aria-label="Show shortcuts on daily.dev web app"
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
