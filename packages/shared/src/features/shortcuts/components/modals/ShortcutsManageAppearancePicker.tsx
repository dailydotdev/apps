import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { VIcon } from '../../../../components/icons';
import type { ShortcutsAppearance } from '../../types';
import { SectionHeader } from './ShortcutsManageCommon';

export function AppearancePicker({
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
        {options.map((option) => {
          const checked = value === option.id;

          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={checked}
              onClick={() => onChange(option.id)}
              className={classNames(
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
                {option.preview}
              </div>
              <span
                className={classNames(
                  'transition-colors duration-150 typo-caption1 motion-reduce:transition-none',
                  checked
                    ? 'font-bold text-text-primary'
                    : 'text-text-tertiary group-hover:text-text-primary',
                )}
              >
                {option.title}
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
