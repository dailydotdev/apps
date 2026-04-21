import type { ReactElement } from 'react';
import React, { useMemo, useState } from 'react';
import classNames from 'classnames';
import { Button, ButtonVariant } from '../../../../components/buttons/Button';
import { Checkbox } from '../../../../components/fields/Checkbox';
import type { ModalProps } from '../../../../components/modals/common/Modal';
import { Modal } from '../../../../components/modals/common/Modal';
import { Justify } from '../../../../components/utilities';
import { apiUrl } from '../../../../lib/config';
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

export default function ImportPickerModal({
  source,
  items,
  onImported,
  ...props
}: ImportPickerModalProps): ReactElement {
  const { customLinks } = useSettingsContext();
  const manager = useShortcutsManager();
  const { displayToast } = useToastNotification();

  const capacity = Math.max(
    0,
    MAX_SHORTCUTS - (customLinks?.length ?? 0),
  );
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

  const toggle = (url: string, next: boolean) =>
    setChecked((prev) => ({ ...prev, [url]: next }));

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

  const selectableCount = Math.min(items.length, capacity);
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

  return (
    <Modal kind={Modal.Kind.FlexibleCenter} size={Modal.Size.Medium} {...props}>
      <Modal.Header>
        <Modal.Title>
          {source === 'bookmarks'
            ? 'Pick bookmarks to import'
            : 'Pick sites to import'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="mb-4 flex items-center justify-between">
          <p className="text-text-tertiary typo-callout">
            <span className="font-bold text-text-primary">
              {selected.length}
            </span>{' '}
            of {capacity} slots selected
          </p>
          <Button
            type="button"
            variant={ButtonVariant.Tertiary}
            onClick={toggleAll}
            disabled={selectableCount === 0}
          >
            {allSelected ? 'Clear all' : 'Select all'}
          </Button>
        </div>
        <ul className="flex max-h-96 flex-col gap-1 overflow-y-auto pr-1">
          {items.map((item) => {
            const isChecked = !!checked[item.url];
            const atCap = !isChecked && selected.length >= capacity;
            return (
              <li
                key={item.url}
                className={classNames(
                  'flex items-center gap-3 rounded-12 p-2 transition-colors duration-150',
                  isChecked ? 'bg-accent-cabbage-subtlest' : 'hover:bg-surface-float',
                  atCap && 'opacity-50',
                )}
              >
                <Checkbox
                  name={`import-${item.url}`}
                  checked={isChecked}
                  disabled={atCap}
                  onToggleCallback={(next) => toggle(item.url, next)}
                />
                <img
                  src={`${apiUrl}/icon?url=${encodeURIComponent(
                    item.url,
                  )}&size=32`}
                  alt=""
                  className="size-6 rounded-6 bg-surface-float"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-text-primary typo-callout">
                    {item.title || item.url}
                  </p>
                  <p className="truncate text-text-tertiary typo-caption1">
                    {item.url}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </Modal.Body>
      <Modal.Footer justify={Justify.End}>
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
          Import {selected.length || ''}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
