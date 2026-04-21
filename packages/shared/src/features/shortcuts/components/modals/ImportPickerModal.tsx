import type { ReactElement } from 'react';
import React, { useMemo, useState } from 'react';
import classNames from 'classnames';
import { Button, ButtonVariant } from '../../../../components/buttons/Button';
import type { ModalProps } from '../../../../components/modals/common/Modal';
import { Modal } from '../../../../components/modals/common/Modal';
import { Justify } from '../../../../components/utilities';
import { VIcon } from '../../../../components/icons';
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

  const capacity = Math.max(0, MAX_SHORTCUTS - (customLinks?.length ?? 0));
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
  const subtitle = isBookmarks
    ? 'Tap to pick. Your bookmarks stay untouched.'
    : 'Tap to pick. Added as a snapshot of your history.';

  // Segmented capacity meter. Rather than a thin progress line that reads as
  // a random pink scratch, we render one pip per slot. Filled pips are your
  // picks; empty pips are the room you still have. Lights up like a battery.
  const pips = Array.from({ length: Math.max(capacity, 1) });

  return (
    <Modal kind={Modal.Kind.FlexibleCenter} size={Modal.Size.Medium} {...props}>
      <Modal.Header>
        <div className="flex min-w-0 flex-1 flex-col">
          <Modal.Title>{title}</Modal.Title>
          <p className="mt-0.5 truncate text-text-tertiary typo-caption1">
            {subtitle}
          </p>
        </div>
      </Modal.Header>
      <Modal.Body>
        {/* Capacity bar: count + pip row + inline select-all toggle. Three
            affordances packed into one compact strip so the body can breathe. */}
        <div className="mb-3 flex items-center gap-4">
          <div
            className="flex flex-1 items-center gap-3"
            role="progressbar"
            aria-valuenow={selected.length}
            aria-valuemin={0}
            aria-valuemax={capacity}
            aria-label={`${selected.length} of ${capacity} slots selected`}
          >
            <span className="tabular-nums text-text-primary typo-body">
              <span className="font-bold">{selected.length}</span>
              <span className="text-text-tertiary">/{capacity}</span>
            </span>
            <div className="flex flex-1 gap-1" aria-hidden>
              {pips.map((_, idx) => (
                <span
                  key={idx}
                  className={classNames(
                    'h-1.5 flex-1 rounded-full transition-colors duration-150 motion-reduce:transition-none',
                    idx < selected.length
                      ? 'bg-accent-cabbage-default'
                      : 'bg-surface-float',
                  )}
                />
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={toggleAll}
            disabled={selectableCount === 0}
            className="shrink-0 rounded-6 text-text-secondary typo-callout underline-offset-2 transition-colors duration-150 hover:text-text-primary hover:underline disabled:cursor-not-allowed disabled:text-text-disabled disabled:no-underline motion-reduce:transition-none"
          >
            {allSelected ? 'Clear all' : 'Select all'}
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-16 border border-dashed border-border-subtlest-tertiary px-6 py-10 text-center">
            <span className="text-text-tertiary">
              {isBookmarks
                ? 'Your bookmarks bar is empty.'
                : 'No most visited sites yet.'}
            </span>
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
                      'group flex w-full items-center gap-3 rounded-12 p-2 text-left transition-colors duration-150 motion-reduce:transition-none',
                      isChecked
                        ? 'bg-surface-float'
                        : 'hover:bg-surface-float',
                      atCap && 'cursor-not-allowed opacity-40',
                    )}
                  >
                    <span className="relative">
                      <FaviconOrLetter url={item.url} label={label} />
                      {/* Selection badge overlays the icon bottom-right.
                          Scales in when picked for a light touch of delight
                          without the whole row having to slide or shift. */}
                      <span
                        aria-hidden
                        className={classNames(
                          'absolute -bottom-1 -right-1 flex size-4 items-center justify-center rounded-full bg-accent-cabbage-default text-white shadow-2 ring-2 ring-background-default transition-transform duration-150 motion-reduce:transition-none',
                          isChecked ? 'scale-100' : 'scale-0',
                        )}
                      >
                        <VIcon size={IconSize.XXSmall} />
                      </span>
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-text-primary typo-callout">
                        {label}
                      </p>
                      <p className="truncate text-text-tertiary typo-caption1">
                        {getDomainFromUrl(item.url)}
                      </p>
                    </div>
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
            ? 'Capacity reached'
            : `${Math.max(0, capacity - selected.length)} slot${
                capacity - selected.length === 1 ? '' : 's'
              } left`}
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
