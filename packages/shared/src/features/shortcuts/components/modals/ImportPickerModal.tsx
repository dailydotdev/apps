import type { ReactElement } from 'react';
import React, { useMemo, useState } from 'react';
import classNames from 'classnames';
import { Button, ButtonVariant } from '../../../../components/buttons/Button';
import type { ModalProps } from '../../../../components/modals/common/Modal';
import { Modal } from '../../../../components/modals/common/Modal';
import { Justify } from '../../../../components/utilities';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../../components/typography/Typography';
import { BookmarkIcon, SitesIcon, VIcon } from '../../../../components/icons';
import { IconSize } from '../../../../components/Icon';
import { apiUrl } from '../../../../lib/config';
import { getDomainFromUrl } from '../../../../lib/links';
import { MAX_SHORTCUTS } from '../../types';
import type { ImportSource } from '../../types';
import { useShortcutsManager } from '../../hooks/useShortcutsManager';
import { useSettingsContext } from '../../../../contexts/SettingsContext';
import { useToastNotification } from '../../../../hooks/useToastNotification';
import { useLazyModal } from '../../../../hooks/useLazyModal';
import type { LazyModal } from '../../../../components/modals/common/types';

export interface ImportPickerItem {
  url: string;
  title?: string;
}

export interface ImportPickerModalProps extends ModalProps {
  source: ImportSource;
  items: ImportPickerItem[];
  onImported?: (result: { imported: number; skipped: number }) => void;
  // When set, the Cancel button hands control back to this modal instead of
  // fully dismissing the stack. Keeps "cancel the import" distinct from
  // "close the whole flow" (which the header X still does). Narrowed to
  // `ShortcutsManage` because that's the only prop-less modal we reopen
  // from here; keeping it narrow avoids the generic `openModal` call
  // requiring a `props` argument at the type level.
  returnTo?: LazyModal.ShortcutsManage;
}

// Favicon with graceful fallback: the browser-icon proxy often ships a blurry
// 16px globe for sites it doesn't know. Instead of rendering that fuzz, we
// swap to a letter chip painted from the site's first character.
function FaviconOrLetter({
  url,
  label,
}: {
  url: string;
  label: string;
}): ReactElement {
  const [failed, setFailed] = useState(false);
  const letter = (label || '?').charAt(0).toUpperCase();

  if (failed) {
    return (
      <span
        aria-hidden
        className="flex size-10 shrink-0 items-center justify-center rounded-12 bg-surface-float text-text-secondary typo-callout"
      >
        {letter}
      </span>
    );
  }

  return (
    <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-12 bg-surface-float">
      <img
        src={`${apiUrl}/icon?url=${encodeURIComponent(url)}&size=64`}
        alt=""
        onError={() => setFailed(true)}
        className="size-6 rounded-4"
      />
    </span>
  );
}

export default function ImportPickerModal({
  source,
  items,
  onImported,
  returnTo,
  ...props
}: ImportPickerModalProps): ReactElement {
  const { customLinks } = useSettingsContext();
  const manager = useShortcutsManager();
  const { displayToast } = useToastNotification();
  const { openModal, closeModal } = useLazyModal();

  const close = () => {
    closeModal();
    props.onRequestClose?.(undefined as never);
  };

  // Cancel = "back out of the import", not "close the whole shortcuts flow".
  // If the picker was triggered from another modal (e.g. Manage), hand
  // control back there so the user lands where they came from.
  const handleCancel = () => {
    if (returnTo) {
      openModal({ type: returnTo });
      return;
    }
    close();
  };

  const alreadyUsed = customLinks?.length ?? 0;
  const capacity = Math.max(0, MAX_SHORTCUTS - alreadyUsed);
  const [checked, setChecked] = useState<Record<string, boolean>>(() => {
    const state: Record<string, boolean> = {};
    items.slice(0, capacity).forEach((item) => {
      state[item.url] = true;
    });
    return state;
  });

  const selected = useMemo(
    () => items.filter((item) => checked[item.url]),
    [checked, items],
  );

  const selectableCount = Math.min(items.length, capacity);
  const atCapacity = selected.length >= capacity;

  const toggle = (url: string) =>
    setChecked((prev) => {
      const next = !prev[url];
      if (next && !prev[url] && selected.length >= capacity) {
        return prev;
      }
      return { ...prev, [url]: next };
    });

  const allSelected = selectableCount > 0 && selected.length >= selectableCount;
  const toggleAll = () => {
    if (allSelected) {
      setChecked({});
      return;
    }
    const next: Record<string, boolean> = {};
    items.slice(0, capacity).forEach((item) => {
      next[item.url] = true;
    });
    setChecked(next);
  };

  const handleImport = async () => {
    const result = await manager.importFrom(source, selected);
    onImported?.(result);
    displayToast(
      `Imported ${result.imported} ${
        source === 'bookmarks' ? 'bookmarks' : 'sites'
      } to shortcuts${result.skipped ? `. ${result.skipped} skipped.` : ''}`,
    );
    close();
  };

  const isBookmarks = source === 'bookmarks';
  const title = isBookmarks ? 'Import bookmarks' : 'Import most visited';
  // Spell out where the list came from and how many rows the browser surfaced.
  // Stops users assuming we've clipped the list at whatever number they see
  // (Chrome's topSites API, for instance, returns however many repeat-visit
  // origins the profile has, sometimes 8, sometimes 20).
  const sourceCopy = isBookmarks
    ? `Pick the ones you want. Your bookmarks stay untouched. ${items.length} available.`
    : `Pick the ones you want. Snapshot from your browser. ${
        items.length
      } site${items.length === 1 ? '' : 's'} available.`;

  const slotsLeft = Math.max(0, capacity - selected.length);

  return (
    <Modal kind={Modal.Kind.FlexibleCenter} size={Modal.Size.Medium} {...props}>
      {/* Same header rhythm as the Manage / Edit modals: left-aligned, Body
          bold, no oversized Title1. Subtitle lives in the body as helper
          copy so the header stays compact. */}
      <Modal.Header showCloseButton>
        <Typography tag={TypographyTag.H3} type={TypographyType.Body} bold>
          {title}
        </Typography>
      </Modal.Header>
      <Modal.Body>
        <p className="mb-3 text-text-tertiary typo-callout">{sourceCopy}</p>
        {/* Calm status strip: what you've picked + how many slots you have
            left, and an inline Select-all / Clear-all toggle. No fill bar,
            no "progress to fill" metaphor. Picking is optional, not a
            task. */}
        <div
          className="bg-surface-float/40 mb-4 flex items-center justify-between gap-3 rounded-12 border border-border-subtlest-tertiary px-3 py-2"
          aria-live="polite"
        >
          <div className="flex flex-col leading-tight">
            <span className="font-bold tabular-nums text-text-primary typo-footnote">
              {selected.length === 0
                ? 'Nothing picked yet'
                : `${selected.length} picked`}
            </span>
            <span className="text-text-tertiary typo-caption1">
              {atCapacity
                ? `You've hit the ${MAX_SHORTCUTS}-shortcut limit`
                : `${slotsLeft} of ${MAX_SHORTCUTS} slot${
                    slotsLeft === 1 ? '' : 's'
                  } left${
                    alreadyUsed > 0 ? ` · ${alreadyUsed} already saved` : ''
                  }`}
            </span>
          </div>
          <button
            type="button"
            onClick={toggleAll}
            disabled={selectableCount === 0}
            className="shrink-0 rounded-8 px-2 py-1 font-bold text-text-secondary transition-colors duration-150 typo-caption1 hover:bg-surface-float hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none"
          >
            {allSelected ? 'Clear all' : 'Select all'}
          </button>
        </div>

        {items.length === 0 ? (
          // Empty state worth looking at. The source-specific glyph tells
          // users what we tried to read from, and the copy explains *why*
          // there's nothing — not just "empty" which reads like our bug.
          <div className="bg-surface-float/40 flex flex-col items-center gap-3 rounded-16 border border-dashed border-border-subtlest-tertiary px-6 py-10 text-center">
            <span
              aria-hidden
              className="flex size-12 items-center justify-center rounded-14 bg-overlay-float-cabbage text-accent-cabbage-default"
            >
              {isBookmarks ? (
                <BookmarkIcon secondary className="size-6" />
              ) : (
                <SitesIcon secondary className="size-6" />
              )}
            </span>
            <Typography type={TypographyType.Callout} bold>
              {isBookmarks
                ? 'No bookmarks to import'
                : 'No browsing history to show'}
            </Typography>
            <Typography
              type={TypographyType.Caption1}
              color={TypographyColor.Tertiary}
            >
              {isBookmarks
                ? 'Add bookmarks to your browser bar, then come back.'
                : 'Visit a few sites first. Your browser needs history to suggest from.'}
            </Typography>
          </div>
        ) : (
          // Tap-to-toggle rows. No separate checkbox column. Selected state is
          // a check badge on the icon itself (iOS Photos multi-select feel)
          // plus a calm surface tint. Dead quiet until you interact.
          <ul
            role="listbox"
            aria-multiselectable="true"
            className="flex max-h-[60vh] flex-col gap-0.5 overflow-y-auto pr-1"
          >
            {items.map((item) => {
              const isChecked = !!checked[item.url];
              const atCap = !isChecked && atCapacity;
              const label = item.title || getDomainFromUrl(item.url);
              return (
                <li key={item.url}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={isChecked}
                    disabled={atCap}
                    onClick={() => toggle(item.url)}
                    className={classNames(
                      // Selection is carried by the trailing check alone so
                      // a long list of picked rows doesn't look like a wall
                      // of colour. Selected rows get a hair of surface tint
                      // to feel "lifted", nothing more.
                      'group relative flex w-full items-center gap-3 rounded-12 p-2 text-left transition-colors duration-150 motion-reduce:transition-none',
                      isChecked
                        ? 'bg-surface-float hover:bg-surface-float'
                        : 'hover:bg-surface-float/60',
                      atCap && 'cursor-not-allowed opacity-40',
                    )}
                  >
                    <FaviconOrLetter url={item.url} label={label} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-text-primary typo-callout">
                        {label}
                      </p>
                      <p className="truncate text-text-tertiary typo-caption1">
                        {getDomainFromUrl(item.url)}
                      </p>
                    </div>
                    {/* The only selection signal: a small filled check on the
                        trailing edge. Empty ring at rest invites a tap. */}
                    <span
                      aria-hidden
                      className={classNames(
                        'flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-150 motion-reduce:transition-none',
                        isChecked
                          ? 'border-accent-cabbage-default bg-accent-cabbage-default text-surface-invert'
                          : 'border-border-subtlest-tertiary bg-transparent group-hover:border-border-subtlest-secondary',
                      )}
                    >
                      <VIcon
                        size={IconSize.XXSmall}
                        className={classNames(
                          'transition-opacity duration-150 motion-reduce:transition-none',
                          isChecked ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </Modal.Body>
      <Modal.Footer justify={Justify.End}>
        <Button
          type="button"
          variant={ButtonVariant.Tertiary}
          onClick={handleCancel}
        >
          {returnTo ? 'Back' : 'Cancel'}
        </Button>
        <Button
          type="button"
          variant={ButtonVariant.Primary}
          onClick={handleImport}
          disabled={!selected.length}
        >
          {selected.length ? `Import ${selected.length}` : 'Import'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
