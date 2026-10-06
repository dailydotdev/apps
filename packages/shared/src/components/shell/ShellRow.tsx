import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import Link from '../utilities/Link';
import { ArrowIcon } from '../icons';
import { IconSize } from '../Icon';
import { motion } from './constants';
import { usePagerPosition } from './segmentPagerStore';

export interface RowItem {
  key: string;
  label: ReactNode;
  href?: string;
  onClick?: () => void;
  active?: boolean;
  // Segments replace the history entry: a segment is a view of the page,
  // not a place you went to.
  replace?: boolean;
  // A view switched from inside the page keeps the reader where they are.
  keepScroll?: boolean;
  ariaLabel?: string;
}

export const ShellRow = ({
  children,
}: {
  children: ReactNode;
}): ReactElement => (
  <div className="no-scrollbar flex h-11 w-full items-center gap-1 overflow-x-auto px-4">
    {children}
  </div>
);

const chipClassName =
  'shell-press flex h-7 shrink-0 items-center gap-1 rounded-8 border px-2 font-bold typo-footnote';

const RowChip = ({
  item,
  className,
  children,
}: {
  item: RowItem;
  className: string;
  children?: ReactNode;
}): ReactElement => {
  const content = (
    <>
      {item.label}
      {children}
    </>
  );

  if (item.href) {
    return (
      <Link
        href={item.href}
        passHref
        replace={item.replace}
        scroll={item.keepScroll ? false : undefined}
      >
        <a
          data-segment
          aria-label={item.ariaLabel}
          aria-current={item.active ? 'page' : undefined}
          onClick={item.onClick}
          role="link"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === ' ') {
              event.preventDefault();
              event.currentTarget.click();
            }
          }}
          className={classNames(chipClassName, className)}
        >
          {content}
        </a>
      </Link>
    );
  }

  return (
    <button
      type="button"
      data-segment
      aria-label={item.ariaLabel}
      aria-pressed={item.active}
      onClick={item.onClick}
      className={classNames(chipClassName, className)}
    >
      {content}
    </button>
  );
};

// The lit segment's chip is a highlight of its own behind the labels, so a
// drag between panes can slide it from one segment to the next.
const SegmentHighlight = ({
  items,
  rowRef,
}: {
  items: RowItem[];
  rowRef: React.RefObject<HTMLDivElement>;
}): ReactElement | null => {
  const position = usePagerPosition();
  const active = items.findIndex((item) => item.active);
  const at = position ?? active;
  const [frame, setFrame] = useState<{ left: number; width: number } | null>(
    null,
  );

  useEffect(() => {
    const row = rowRef.current;
    if (!row || active < 0) {
      return;
    }
    const chips = Array.from(
      row.querySelectorAll<HTMLElement>('[data-segment]'),
    );
    const from = chips[Math.max(0, Math.min(chips.length - 1, Math.floor(at)))];
    const to = chips[Math.max(0, Math.min(chips.length - 1, Math.ceil(at)))];
    if (!from || !to) {
      return;
    }
    const t = at - Math.floor(at);
    setFrame({
      left: from.offsetLeft + (to.offsetLeft - from.offsetLeft) * t,
      width: from.offsetWidth + (to.offsetWidth - from.offsetWidth) * t,
    });
  }, [at, active, items, rowRef]);

  if (!frame) {
    return null;
  }

  return (
    <span
      aria-hidden
      className="pointer-events-none absolute top-1/2 h-7 -translate-y-1/2 rounded-8 border border-border-subtlest-secondary bg-surface-float"
      style={{
        left: frame.left,
        width: frame.width,
        transition:
          position === null
            ? `left ${motion.snap}ms ${motion.interaction}, width ${motion.snap}ms ${motion.interaction}`
            : 'none',
      }}
    />
  );
};

export const Segments = ({
  items,
  menu,
  onMenu,
}: {
  items: RowItem[];
  menu?: string;
  onMenu?: () => void;
}): ReactElement => {
  const rowRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={rowRef} className="relative flex items-center gap-1">
      <SegmentHighlight items={items} rowRef={rowRef} />
      {items.map((item) => {
        const className = classNames(
          'relative border-transparent',
          item.active ? 'text-text-primary' : 'text-text-tertiary',
        );

        // The lit segment that carries a menu is already the page, so its
        // chip is the menu's button rather than a link with a button inside.
        if (item.active && item.key === menu) {
          return (
            <RowChip
              key={item.key}
              item={{
                ...item,
                href: undefined,
                ariaLabel: item.ariaLabel ?? `${item.label}, choose a channel`,
                onClick: onMenu,
              }}
              className={className}
            >
              <ArrowIcon size={IconSize.XSmall} className="-mr-1 rotate-180" />
            </RowChip>
          );
        }

        return <RowChip key={item.key} item={item} className={className} />;
      })}
    </div>
  );
};

export const Chips = ({ items }: { items: RowItem[] }): ReactElement => (
  <>
    {items.map((item) => (
      <RowChip
        key={item.key}
        item={item}
        className={
          item.active
            ? 'border-text-primary bg-text-primary text-surface-invert'
            : 'border-border-subtlest-tertiary text-text-secondary'
        }
      />
    ))}
  </>
);

export const MenuLabel = ({
  label,
  onClick,
}: {
  label: ReactNode;
  onClick: () => void;
}): ReactElement => (
  <button
    type="button"
    onClick={onClick}
    className="shell-press flex h-7 items-center gap-0.5 rounded-8 px-1 text-text-secondary typo-footnote"
  >
    {label}
    <ArrowIcon
      size={IconSize.XSmall}
      className="rotate-180 text-text-tertiary"
    />
  </button>
);

export const SheetChoice = ({ items }: { items: RowItem[] }): ReactElement => (
  <div className="flex flex-col py-1">
    {items.map((item) => {
      const className = classNames(
        'flex h-12 w-full items-center px-4 text-left transition-colors typo-callout hover:bg-surface-hover',
        item.active ? 'font-bold text-text-primary' : 'text-text-primary',
      );
      const mark = item.active && (
        <span className="ml-auto size-2 rounded-2 bg-text-primary" />
      );

      if (item.href) {
        return (
          <Link
            key={item.key}
            href={item.href}
            passHref
            replace={item.replace}
            scroll={item.keepScroll ? false : undefined}
          >
            <a
              aria-current={item.active ? 'page' : undefined}
              onClick={item.onClick}
              role="link"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === ' ') {
                  event.preventDefault();
                  event.currentTarget.click();
                }
              }}
              className={className}
            >
              {item.label}
              {mark}
            </a>
          </Link>
        );
      }

      return (
        <button
          key={item.key}
          type="button"
          aria-pressed={item.active}
          onClick={item.onClick}
          className={className}
        >
          {item.label}
          {mark}
        </button>
      );
    })}
  </div>
);
