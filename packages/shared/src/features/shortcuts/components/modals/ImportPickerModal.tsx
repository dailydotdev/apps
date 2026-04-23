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

export interface ImportPickerItem {
  url: string;
  title?: string;
}

export interface ImportPickerModalProps extends ModalProps {
  source: ImportSource;
  items: ImportPickerItem[];
  onImported?: (result: { imported: number; skipped: number }) => void;
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
  ...props
}: ImportPickerModalProps): ReactElement {
  const { customLinks } = useSettingsContext();
  const manager = useShortcutsManager();
  const { displayToast } = useToastNotification();

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

  const allSelected =
    selectableCount > 0 && selected.length >= selectableCount;
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
    props.onRequestClose?.(undefined as never);
  };

  const isBookmarks = source === 'bookmarks';
  const title = isBookmarks ? 'Import bookmarks' : 'Import most visited';
  // Spell out where the list came from and how many rows the browser surfaced.
  // Stops users assuming we've clipped the list at whatever number they see
  // (Chrome's topSites API, for instance, returns however many repeat-visit
  // origins the profile has — sometimes 8, sometimes 20).
  const sourceCopy = isBookmarks
    ? `Tap to pick. Your bookmarks stay untouched — ${items.length} found.`
    : `Tap to pick. Snapshot from your browser — ${items.length} site${
        items.length === 1 ? '' : 's'
      } shared.`;

  // Capacity meter always represents the full library (MAX_SHORTCUTS slots),
  // so users can see at a glance that the limit is 12 — not whatever number
  // is left after their existing shortcuts. Three zones stack across it:
  // already saved (muted), currently picking (accent), free (empty).
  const pips = Array.from({ length: MAX_SHORTCUTS });
  const filledEnd = alreadyUsed + selected.length;

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
        <p className="mb-4 text-text-tertiary typo-callout">{sourceCopy}</p>
        {/* Capacity bar: count + pip row + inline select-all toggle. Three
            affordances packed into one compact strip so the body can breathe. */}
        <div className="mb-3 flex flex-col gap-2">
          <div className="flex items-baseline justify-between gap-3">
            <div className="flex items-baseline gap-2 tabular-nums">
              <span className="text-text-primary typo-body">
                <span className="font-bold">{filledEnd}</span>
                <span className="text-text-tertiary">/{MAX_SHORTCUTS}</span>
              </span>
              <span className="text-text-tertiary typo-caption1">
                {alreadyUsed > 0
                  ? `${alreadyUsed} saved · ${selected.length} picked`
                  : `${selected.length} picked`}
              </span>
            </div>
            <button
              type="button"
              onClick={toggleAll}
              disabled={selectableCount === 0}
              className="shrink-0 rounded-8 bg-surface-float px-2 py-1 text-text-secondary typo-caption1 font-bold transition-colors duration-150 hover:bg-surface-primary hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none"
            >
              {allSelected ? 'Clear all' : 'Select all'}
            </button>
          </div>
          <div
            className="flex gap-1"
            role="progressbar"
            aria-valuenow={selected.length}
            aria-valuemin={0}
            aria-valuemax={capacity}
            aria-label={`${selected.length} of ${capacity} available slots selected. Library holds up to ${MAX_SHORTCUTS} shortcuts, ${alreadyUsed} already saved.`}
          >
            {pips.map((_, idx) => {
              const inSaved = idx < alreadyUsed;
              const inPicked = !inSaved && idx < filledEnd;
              return (
                <span
                  key={idx}
                  aria-hidden
                  className={classNames(
                    'h-2 flex-1 rounded-2 transition-colors duration-150 motion-reduce:transition-none',
                    inPicked && 'bg-accent-cabbage-default',
                    inSaved && 'bg-text-tertiary/40',
                    !inPicked && !inSaved && 'bg-surface-float',
                  )}
                />
              );
            })}
          </div>
        </div>

        {items.length === 0 ? (
          // Empty state worth looking at. The source-specific glyph tells
          // users what we tried to read from, and the copy explains *why*
          // there's nothing — not just "empty" which reads like our bug.
          <div className="flex flex-col items-center gap-3 rounded-16 border border-dashed border-border-subtlest-tertiary bg-surface-float/40 px-6 py-10 text-center">
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
                : 'Visit a few sites first — your browser needs history to suggest from.'}
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
                      // Quiet-by-default row that picks up a subtle cabbage
                      // tint + thin accent bar on the leading edge when
                      // selected, so a full page of rows reads as "these
                      // are picked" instantly without shouting.
                      'group relative flex w-full items-center gap-3 rounded-12 p-2 text-left transition-all duration-150 active:scale-[0.995] motion-reduce:transform-none motion-reduce:transition-none',
                      isChecked
                        ? 'bg-overlay-float-cabbage/50'
                        : 'hover:bg-surface-float',
                      atCap && 'cursor-not-allowed opacity-40',
                    )}
                  >
                    {isChecked && (
                      <span
                        aria-hidden
                        className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-accent-cabbage-default"
                      />
                    )}
                    <FaviconOrLetter url={item.url} label={label} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-text-primary typo-callout">
                        {label}
                      </p>
                      <p className="truncate text-text-tertiary typo-caption1">
                        {getDomainFromUrl(item.url)}
                      </p>
                    </div>
                    {/* Selection indicator on the trailing edge — reads as
                        "this row is picked" the moment you glance at it,
                        instead of squinting at a tiny badge tucked behind
                        the favicon. Empty ring at rest gives the row a
                        clear "tap me" affordance. */}
                    <span
                      aria-hidden
                      className={classNames(
                        'flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-150 motion-reduce:transition-none',
                        isChecked
                          ? 'scale-110 border-accent-cabbage-default bg-accent-cabbage-default text-surface-invert shadow-sm motion-reduce:scale-100'
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
      <Modal.Footer justify={Justify.Between}>
        <span className="text-text-tertiary typo-caption1">
          {atCapacity
            ? `Library full (${MAX_SHORTCUTS}/${MAX_SHORTCUTS})`
            : `${Math.max(0, capacity - selected.length)} of ${MAX_SHORTCUTS} slot${
                capacity - selected.length === 1 ? '' : 's'
              } free`}
        </span>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={ButtonVariant.Float}
            onClick={() => props.onRequestClose?.(undefined as never)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant={ButtonVariant.Primary}
            onClick={handleImport}
            disabled={!selected.length}
          >
            {selected.length ? `Import ${selected.length}` : 'Import'}
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}
