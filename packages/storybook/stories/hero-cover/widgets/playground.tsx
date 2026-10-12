import type { ReactElement, ReactNode } from 'react';
import React, { useMemo, useState } from 'react';
import classNames from 'classnames';
import type { OverflowStrategy, ShelfWidget } from './shelf';
import { capacity, overflowLabel, pack, Shelf } from './shelf';
import type { WidgetKind, WidgetSize } from './catalog';
import { CustomizeButton, HeroInFeed, WidgetGallery } from './frame';
import { w } from './directions';

export type AdModel = 'reserved' | 'sponsored' | 'stack' | 'plus';

const adModelLabel: Record<AdModel, string> = {
  reserved: 'Reserved slot',
  sponsored: 'Sponsored widget',
  stack: 'In a stack',
  plus: 'Plus (no ads)',
};

const presets: Record<string, () => ShelfWidget[]> = {
  'Today’s hero': () => [w('featured', 'l'), w('happening', 'm')],
  Reader: () => [
    w('featured', 'l'),
    w('happening', 'm'),
    w('bookmarks', 's'),
    w('continue', 's'),
  ],
  Builder: () => [
    w('agents', 'l'),
    w('digest', 'm'),
    w('trending', 's'),
    w('jobs', 's'),
  ],
  Community: () => [
    w('squads', 'l'),
    w('dms', 'm'),
    w('notifications', 's'),
    w('arena', 's'),
  ],
};

const Segmented = <T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: ReactNode }[];
  onChange: (value: T) => void;
}): ReactElement => (
  <div className="flex flex-col gap-1">
    <span className="font-bold uppercase tracking-wider text-text-quaternary typo-caption2">
      {label}
    </span>
    <div className="flex flex-wrap items-center gap-1 rounded-12 bg-surface-float p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={classNames(
            'h-7 rounded-8 px-2.5 typo-caption1',
            option.value === value
              ? 'bg-text-primary font-bold text-surface-invert'
              : 'text-text-tertiary hover:text-text-primary',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  </div>
);

/** Where the ad goes under each model, applied to the reader's own widgets. */
const withAds = (widgets: ShelfWidget[], model: AdModel): ShelfWidget[] => {
  if (model === 'plus') {
    return widgets;
  }
  if (model === 'sponsored') {
    // One sponsored version of a widget the reader already chose.
    const index = widgets.findIndex((widget) =>
      ['agents', 'podcast', 'digest', 'happening'].includes(widget.kind),
    );
    return widgets.map((widget, position) =>
      position === index ? { ...widget, sponsor: { name: 'Vercel' } } : widget,
    );
  }
  const ad: ShelfWidget = {
    id: 'ad-slot',
    kind: 'ad',
    size: 'm',
    isLocked: model === 'reserved',
  };
  // Reserved: always on the first screen, after the lead widget. In a stack:
  // it joins the overflow and rotates with the rest.
  return model === 'reserved'
    ? [widgets[0], ad, ...widgets.slice(1)].filter(Boolean)
    : [...widgets, ad];
};

export const Playground = (): ReactElement => {
  const [columns, setColumns] = useState(5);
  const [overflow, setOverflow] = useState<OverflowStrategy>('stack');
  const [adModel, setAdModel] = useState<AdModel>('reserved');
  const [isFlat, setIsFlat] = useState(false);
  const [isEditing, setIsEditing] = useState(true);
  const [widgets, setWidgets] = useState<ShelfWidget[]>(presets.Reader);

  const shown = useMemo(() => withAds(widgets, adModel), [widgets, adModel]);
  const { used, total } = capacity(shown, columns);
  const isFull = pack(shown, columns).overflow.length > 0;

  const onAdd = (kind: WidgetKind, size: WidgetSize) =>
    setWidgets((current) => [...current, w(kind, size)]);
  // The shelf hands back the list with the ad in it; keep only the reader's.
  const onShelfChange = (next: ShelfWidget[]) =>
    setWidgets(
      next
        .filter((widget) => widget.id !== 'ad-slot')
        .map(({ sponsor, ...widget }) =>
          adModel === 'sponsored' ? widget : { ...widget, sponsor },
        ),
    );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end gap-6">
        <Segmented
          label="Feed columns"
          value={String(columns)}
          options={['3', '4', '5', '6'].map((value) => ({
            value,
            label: value,
          }))}
          onChange={(value) => setColumns(Number(value))}
        />
        <Segmented
          label="When it overflows"
          value={overflow}
          options={(Object.keys(overflowLabel) as OverflowStrategy[]).map(
            (value) => ({
              value,
              label: overflowLabel[value],
            }),
          )}
          onChange={setOverflow}
        />
        <Segmented
          label="Where the ad lives"
          value={adModel}
          options={(Object.keys(adModelLabel) as AdModel[]).map((value) => ({
            value,
            label: adModelLabel[value],
          }))}
          onChange={setAdModel}
        />
        <Segmented
          label="Surface"
          value={isFlat ? 'flat' : 'cards'}
          options={[
            { value: 'cards', label: 'Cards' },
            { value: 'flat', label: 'Flat' },
          ]}
          onChange={(value) => setIsFlat(value === 'flat')}
        />
        <Segmented
          label="Start from"
          value=""
          options={Object.keys(presets).map((value) => ({
            value,
            label: value,
          }))}
          onChange={(value) => setWidgets(presets[value]())}
        />
      </div>
      <div className="flex flex-col gap-6 laptopL:flex-row laptopL:items-start">
        <div className="min-w-0 flex-1">
          <HeroInFeed columns={columns}>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <span className="text-text-tertiary typo-caption1">
                  {used} of {total} spots
                  {isFull && overflow !== 'limit' && ' · the rest go to '}
                  {isFull &&
                    overflow !== 'limit' &&
                    overflowLabel[overflow].toLowerCase()}
                </span>
                <div className="h-1 w-24 overflow-hidden rounded-max bg-surface-float">
                  <div
                    className={classNames(
                      'h-full rounded-max',
                      used > total
                        ? 'bg-accent-bacon-default'
                        : 'bg-text-primary',
                    )}
                    style={{ width: `${Math.min(100, (used / total) * 100)}%` }}
                  />
                </div>
                <CustomizeButton
                  className="ml-auto"
                  isEditing={isEditing}
                  onClick={() => setIsEditing((value) => !value)}
                />
              </div>
              <Shelf
                widgets={shown}
                columns={columns}
                overflow={overflow}
                isEditing={isEditing}
                isFlat={isFlat}
                onChange={onShelfChange}
              />
            </div>
          </HeroInFeed>
        </div>
        {isEditing && (
          <WidgetGallery
            className="laptopL:w-[34rem] laptopL:shrink-0"
            onAdd={onAdd}
            disabledReason={
              overflow === 'limit' && isFull ? 'The row is full' : undefined
            }
          />
        )}
      </div>
    </div>
  );
};
