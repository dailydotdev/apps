import type { CSSProperties, ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { LockIcon } from '@dailydotdev/shared/src/components/icons/Lock';
import { MinusIcon } from '@dailydotdev/shared/src/components/icons/Minus';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons/Arrow';
import type { Sponsor, WidgetKind, WidgetSize } from './catalog';
import {
  sizeLabel,
  sizeSpan,
  widgetCatalog,
  WidgetContent,
  WidgetSurface,
} from './catalog';

export type ShelfWidget = {
  id: string;
  kind: WidgetKind;
  size: WidgetSize;
  /** Ours: the reader cannot move or remove it. */
  isLocked?: boolean;
  sponsor?: Sponsor;
};

export type OverflowStrategy = 'limit' | 'pages' | 'stack' | 'scroll' | 'smart';

export const overflowLabel: Record<OverflowStrategy, string> = {
  limit: 'Limit',
  pages: 'Pages',
  stack: 'Stacks',
  scroll: 'Scroll rail',
  smart: 'Smart slot',
};

/* ------------------------------------------------------------------ */
/* Packing                                                             */
/* ------------------------------------------------------------------ */

type Placed = ShelfWidget & { col: number; row: number };

/**
 * First fit on a two-row grid of `columns` cells, scanning column by column so
 * the row fills left to right the way the feed reads. Placement is explicit,
 * not left to `grid-auto-flow: dense`, so what does not fit is known exactly
 * and can be handed to the overflow strategy instead of wrapping into a third
 * row the reader never asked for.
 */
export const pack = (
  widgets: ShelfWidget[],
  columns: number,
): { placed: Placed[]; overflow: ShelfWidget[] } => {
  const taken = [
    new Array(columns).fill(false),
    new Array(columns).fill(false),
  ];
  const placed: Placed[] = [];
  const overflow: ShelfWidget[] = [];

  const fits = (col: number, row: number, cols: number, rows: number) => {
    if (col + cols > columns || row + rows > 2) {
      return false;
    }
    for (let r = row; r < row + rows; r += 1) {
      for (let c = col; c < col + cols; c += 1) {
        if (taken[r][c]) {
          return false;
        }
      }
    }
    return true;
  };

  widgets.forEach((widget) => {
    const { cols, rows } = sizeSpan[widget.size];
    for (let col = 0; col < columns; col += 1) {
      for (let row = 0; row < 2; row += 1) {
        if (fits(col, row, cols, rows)) {
          for (let r = row; r < row + rows; r += 1) {
            for (let c = col; c < col + cols; c += 1) {
              taken[r][c] = true;
            }
          }
          placed.push({ ...widget, col, row });
          return;
        }
      }
    }
    overflow.push(widget);
  });

  return { placed, overflow };
};

/** Splits into pages, each packed on its own, the way a home screen pages. */
export const paginate = (
  widgets: ShelfWidget[],
  columns: number,
): Placed[][] => {
  const pages: Placed[][] = [];
  let rest = widgets;
  while (rest.length && pages.length < 8) {
    const { placed, overflow } = pack(rest, columns);
    if (!placed.length) {
      break;
    }
    pages.push(placed);
    rest = overflow;
  }
  return pages;
};

/* ------------------------------------------------------------------ */
/* Edit chrome                                                         */
/* ------------------------------------------------------------------ */

export const shelfCss = `
@keyframes hcJiggle {
  0% { transform: rotate(-0.6deg); }
  50% { transform: rotate(0.6deg); }
  100% { transform: rotate(-0.6deg); }
}
.hc-jiggle { animation: hcJiggle 260ms ease-in-out infinite; transform-origin: 50% 60%; }
.hc-jiggle:nth-child(2n) { animation-delay: -130ms; }
@media (prefers-reduced-motion: reduce) { .hc-jiggle { animation: none; } }
`;

const EditBadge = ({
  children,
  onClick,
  label,
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  label: string;
  className?: string;
}): ReactElement => (
  <button
    type="button"
    aria-label={label}
    onPointerDown={(event) => event.stopPropagation()}
    onClick={onClick}
    className={classNames(
      'absolute z-2 flex items-center justify-center rounded-max bg-text-primary text-surface-invert shadow-2',
      className,
    )}
  >
    {children}
  </button>
);

type CellProps = {
  widget: ShelfWidget;
  style?: CSSProperties;
  isEditing?: boolean;
  isFlat?: boolean;
  onRemove?: (id: string) => void;
  onResize?: (id: string) => void;
  onMove?: (fromId: string, toId: string) => void;
  /** Shown on a stack's top card: how many sit underneath. */
  stack?: { index: number; total: number; onStep: (index: number) => void };
  smartReason?: string;
};

const WidgetCell = ({
  widget,
  style,
  isEditing,
  isFlat,
  onRemove,
  onResize,
  onMove,
  stack,
  smartReason,
}: CellProps): ReactElement => {
  const [isOver, setIsOver] = useState(false);
  const canDrag = !!isEditing && !widget.isLocked;
  const def = widgetCatalog[widget.kind];
  const canResize = def.sizes.length > 1 && !widget.isLocked;

  return (
    <div
      style={style}
      draggable={canDrag}
      onDragStart={(event) =>
        event.dataTransfer.setData('text/plain', widget.id)
      }
      onDragOver={(event) => {
        if (isEditing) {
          event.preventDefault();
          setIsOver(true);
        }
      }}
      onDragLeave={() => setIsOver(false)}
      onDrop={(event) => {
        event.preventDefault();
        setIsOver(false);
        onMove?.(event.dataTransfer.getData('text/plain'), widget.id);
      }}
      className={classNames(
        'relative flex min-h-0 min-w-0',
        canDrag && 'hc-jiggle cursor-grab active:cursor-grabbing',
      )}
    >
      <WidgetSurface
        isFlat={isFlat}
        className={classNames(
          'flex-1',
          isOver && 'ring-2 ring-accent-cabbage-default',
          widget.isLocked && isEditing && 'opacity-70',
        )}
      >
        <WidgetContent
          kind={widget.kind}
          size={widget.size}
          sponsor={widget.sponsor}
        />
        {stack && stack.total > 1 && (
          <div className="absolute right-1.5 top-1/2 flex -translate-y-1/2 flex-col gap-1">
            {Array.from({ length: stack.total }, (_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`Show stacked widget ${index + 1}`}
                onPointerDown={(event) => event.stopPropagation()}
                onClick={() => stack.onStep(index)}
                className={classNames(
                  'w-1 rounded-max',
                  index === stack.index
                    ? 'h-3 bg-text-primary'
                    : 'h-1 bg-text-quaternary',
                )}
              />
            ))}
          </div>
        )}
        {smartReason && (
          <span className="absolute bottom-2 right-3 rounded-6 bg-surface-float px-1.5 text-text-tertiary typo-caption2">
            ✦ {smartReason}
          </span>
        )}
      </WidgetSurface>
      {isEditing && !widget.isLocked && (
        <EditBadge
          label={`Remove ${def.name}`}
          onClick={() => onRemove?.(widget.id)}
          className="-left-2 -top-2 size-6"
        >
          <MinusIcon size={IconSize.Size16} />
        </EditBadge>
      )}
      {isEditing && canResize && (
        <EditBadge
          label={`Resize ${def.name}`}
          onClick={() => onResize?.(widget.id)}
          className="-bottom-2 -right-2 h-6 px-2 font-bold typo-caption2"
        >
          {sizeLabel[widget.size]}
        </EditBadge>
      )}
      {isEditing && widget.isLocked && (
        <span className="absolute -right-2 -top-2 z-2 flex h-6 items-center gap-1 rounded-max bg-surface-float px-2 text-text-secondary shadow-2 typo-caption2">
          <LockIcon size={IconSize.Size16} />
          Pinned by daily.dev
        </span>
      )}
    </div>
  );
};

const placedStyle = ({ col, row, size }: Placed): CSSProperties => ({
  gridColumn: `${col + 1} / span ${sizeSpan[size].cols}`,
  gridRow: `${row + 1} / span ${sizeSpan[size].rows}`,
});

/* ------------------------------------------------------------------ */
/* Shelf                                                               */
/* ------------------------------------------------------------------ */

export type ShelfProps = {
  widgets: ShelfWidget[];
  columns: number;
  overflow?: OverflowStrategy;
  isEditing?: boolean;
  isFlat?: boolean;
  onChange?: (widgets: ShelfWidget[]) => void;
  /** Row height for one half-height cell. */
  cellHeight?: string;
};

const nextSize = (widget: ShelfWidget): WidgetSize => {
  const { sizes } = widgetCatalog[widget.kind];
  return sizes[(sizes.indexOf(widget.size) + 1) % sizes.length];
};

export const Shelf = ({
  widgets,
  columns,
  overflow = 'pages',
  isEditing = false,
  isFlat = false,
  onChange,
  cellHeight = '13.25rem',
}: ShelfProps): ReactElement => {
  const [page, setPage] = useState(0);
  const [stackIndex, setStackIndex] = useState(0);

  const remove = (id: string) =>
    onChange?.(widgets.filter((widget) => widget.id !== id));
  const resize = (id: string) =>
    onChange?.(
      widgets.map((widget) =>
        widget.id === id ? { ...widget, size: nextSize(widget) } : widget,
      ),
    );
  const move = (fromId: string, toId: string) => {
    const from = widgets.findIndex((widget) => widget.id === fromId);
    const to = widgets.findIndex((widget) => widget.id === toId);
    if (from === -1 || to === -1 || from === to || widgets[to].isLocked) {
      return;
    }
    const next = [...widgets];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange?.(next);
  };

  const cellProps = {
    isEditing,
    isFlat,
    onRemove: remove,
    onResize: resize,
    onMove: move,
  };
  const gridStyle: CSSProperties = {
    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
    gridTemplateRows: `repeat(2, ${cellHeight})`,
  };

  let body: ReactElement;
  let footer: ReactNode = null;

  if (overflow === 'scroll') {
    body = (
      <div className="no-scrollbar -mx-1 overflow-x-auto px-1 py-2">
        <div
          className="grid grid-flow-col gap-x-8 gap-y-4"
          style={{
            gridTemplateRows: `repeat(2, ${cellHeight})`,
            gridAutoColumns: `calc((100% - ${
              (columns - 1) * 2
            }rem) / ${columns} - 0.75rem)`,
          }}
        >
          {widgets.map((widget) => (
            <WidgetCell
              key={widget.id}
              widget={widget}
              style={{
                gridColumn: `span ${sizeSpan[widget.size].cols}`,
                gridRow: `span ${sizeSpan[widget.size].rows}`,
              }}
              {...cellProps}
            />
          ))}
        </div>
      </div>
    );
  } else if (overflow === 'pages') {
    const pages = paginate(widgets, columns);
    const current = Math.min(page, pages.length - 1);
    body = (
      <div className="grid gap-x-8 gap-y-4 py-2" style={gridStyle}>
        {(pages[current] ?? []).map((widget) => (
          <WidgetCell
            key={widget.id}
            widget={widget}
            style={placedStyle(widget)}
            {...cellProps}
          />
        ))}
      </div>
    );
    if (pages.length > 1) {
      footer = (
        <div className="flex items-center gap-3">
          <div className="flex flex-1 items-center gap-1">
            {pages.map((_, index) => (
              <button
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                type="button"
                aria-label={`Page ${index + 1}`}
                onClick={() => setPage(index)}
                className={classNames(
                  'h-1 rounded-max transition-all',
                  index === current
                    ? 'w-5 bg-text-primary'
                    : 'w-1 bg-text-quaternary',
                )}
              />
            ))}
          </div>
          <span className="text-text-quaternary typo-caption1">
            Page {current + 1} of {pages.length}
          </span>
          <button
            type="button"
            aria-label="Previous page"
            onClick={() => setPage(Math.max(0, current - 1))}
            className="text-text-tertiary"
          >
            <ArrowIcon className="-rotate-90" size={IconSize.Size16} />
          </button>
          <button
            type="button"
            aria-label="Next page"
            onClick={() => setPage(Math.min(pages.length - 1, current + 1))}
            className="text-text-tertiary"
          >
            <ArrowIcon className="rotate-90" size={IconSize.Size16} />
          </button>
        </div>
      );
    }
  } else {
    // limit, stack and smart all pack one screen and differ only in what
    // happens to the widgets left over.
    const first = pack(widgets, columns);
    let placed: Placed[] = first.placed;
    let rest: ShelfWidget[] = first.overflow;
    let slot: Placed | undefined;
    if (overflow !== 'limit' && first.overflow.length) {
      // Keep as many widgets as still leave a tall slot free for the stack.
      const slotWidget: ShelfWidget = {
        id: 'slot',
        kind: 'happening',
        size: 'm',
      };
      for (let keep = widgets.length - 1; keep >= 0; keep -= 1) {
        const attempt = pack([...widgets.slice(0, keep), slotWidget], columns);
        if (!attempt.overflow.length) {
          placed = attempt.placed.filter((widget) => widget.id !== 'slot');
          slot = attempt.placed.find((widget) => widget.id === 'slot');
          rest = widgets.slice(keep);
          break;
        }
      }
    }
    const stacked = rest.map((widget) => ({
      ...widget,
      size: 'm' as WidgetSize,
    }));
    const top = stacked.length
      ? stacked[stackIndex % stacked.length]
      : undefined;

    body = (
      <div className="grid gap-x-8 gap-y-4 py-2" style={gridStyle}>
        {placed.map((widget) => (
          <WidgetCell
            key={widget.id}
            widget={widget}
            style={placedStyle(widget)}
            {...cellProps}
          />
        ))}
        {slot && top && (
          <WidgetCell
            key={`stack-${top.id}`}
            widget={top}
            style={placedStyle({ ...slot, size: 'm' })}
            stack={{
              index: stackIndex % stacked.length,
              total: stacked.length,
              onStep: setStackIndex,
            }}
            smartReason={
              overflow === 'smart' ? 'Picked for this morning' : undefined
            }
            {...cellProps}
          />
        )}
      </div>
    );
    if (overflow === 'limit' && first.overflow.length) {
      footer = (
        <p className="text-text-tertiary typo-caption1">
          {first.overflow.length} widget
          {first.overflow.length > 1 ? 's' : ''} won&apos;t fit at {columns}{' '}
          columns:{' '}
          {first.overflow
            .map((widget) => widgetCatalog[widget.kind].name)
            .join(', ')}
          . Remove one to make room.
        </p>
      );
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <style>{shelfCss}</style>
      {body}
      {footer}
    </div>
  );
};

/** Cells the row holds, and cells the widgets ask for. */
export const capacity = (
  widgets: ShelfWidget[],
  columns: number,
): { used: number; total: number } => ({
  used: widgets.reduce(
    (sum, widget) =>
      sum + sizeSpan[widget.size].cols * sizeSpan[widget.size].rows,
    0,
  ),
  total: columns * 2,
});
