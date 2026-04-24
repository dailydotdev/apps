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
import { getShortcutDedupKey } from '../../lib/getShortcutDedupKey';

export interface ImportPickerItem {
  url: string;
  title?: string;
}

export interface ImportPickerModalProps extends ModalProps {
  source: ImportSource;
  items: ImportPickerItem[];
  onImported?: (result: { imported: number; skipped: number }) => void;
  // When set, Cancel reopens this modal instead of dismissing the stack —
  // lets the picker be invoked from Manage without losing the user's place.
  returnTo?: LazyModal.ShortcutsManage;
}

// The icon proxy falls back to a blurry generic globe for unknown sites;
// swap that for a letter chip instead.
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

  const dedupedItems = useMemo(() => {
    const seen = new Set<string>();

    return items.filter((item) => {
      const dedupKey = getShortcutDedupKey(item.url) ?? item.url;
      if (seen.has(dedupKey)) {
        return false;
      }
      seen.add(dedupKey);
      return true;
    });
  }, [items]);

  const close = () => {
    closeModal();
    props.onRequestClose?.(undefined as never);
  };

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
    dedupedItems.slice(0, capacity).forEach((item) => {
      state[item.url] = true;
    });
    return state;
  });

  const selected = useMemo(
    () => dedupedItems.filter((item) => checked[item.url]),
    [checked, dedupedItems],
  );

  const selectableCount = Math.min(dedupedItems.length, capacity);
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
    dedupedItems.slice(0, capacity).forEach((item) => {
      next[item.url] = true;
    });
    setChecked(next);
  };

  const handleImport = async () => {
    const result = await manager.importFrom(source, selected);
    onImported?.(result);
    const noun = source === 'bookmarks' ? 'bookmarks' : 'sites';
    // Every selection ended up as a duplicate / at-cap skip. Reporting
    // "Imported 0" would read like a bug — say what actually happened.
    if (result.imported === 0) {
      displayToast(
        result.skipped > 0
          ? `Nothing imported — ${result.skipped} ${noun} already in shortcuts`
          : `Nothing to import`,
      );
    } else {
      displayToast(
        `Imported ${result.imported} ${noun} to shortcuts${
          result.skipped ? `. ${result.skipped} skipped.` : ''
        }`,
      );
    }
    close();
  };

  const isBookmarks = source === 'bookmarks';
  const title = isBookmarks ? 'Import bookmarks' : 'Import most visited';
  const sourceCopy = isBookmarks
    ? `Pick the ones you want. Your bookmarks stay untouched. ${dedupedItems.length} available.`
    : `Pick the ones you want. Snapshot from your browser. ${
        dedupedItems.length
      } site${dedupedItems.length === 1 ? '' : 's'} available.`;

  const slotsLeft = Math.max(0, capacity - selected.length);

  return (
    <Modal kind={Modal.Kind.FlexibleCenter} size={Modal.Size.Medium} {...props}>
      <Modal.Header showCloseButton>
        <Typography tag={TypographyTag.H3} type={TypographyType.Body} bold>
          {title}
        </Typography>
      </Modal.Header>
      <Modal.Body>
        <p className="mb-3 text-text-tertiary typo-callout">{sourceCopy}</p>
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

        {dedupedItems.length === 0 ? (
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
          <ul
            role="listbox"
            aria-multiselectable="true"
            className="flex max-h-[60vh] flex-col gap-0.5 overflow-y-auto pr-1"
          >
            {dedupedItems.map((item) => {
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
