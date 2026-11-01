import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useRef } from 'react';
import classNames from 'classnames';
import Link from '../utilities/Link';
import { ArrowIcon } from '../icons';
import { IconSize } from '../Icon';

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
  // A tab with choices of its own: a tap on it while lit opens them.
  menu?: {
    ariaLabel: string;
    onOpen: () => void;
  };
}

const rowInset = 16;
const litSelector = '[aria-current="page"], [aria-pressed="true"]';
// The lit tab's mark: a short bar of one width under every label.
const barWidth = 32;

export enum ShellRowKind {
  // Switch to content that is different altogether.
  Tabs = 'tabs',
  // Narrow the list the page already holds.
  Chips = 'chips',
}

export const ShellRow = ({
  children,
  kind = ShellRowKind.Tabs,
}: {
  children: ReactNode;
  kind?: ShellRowKind;
}): ReactElement => {
  const rowRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const isTabs = kind === ShellRowKind.Tabs;

  useEffect(() => {
    const row = rowRef.current;

    if (!row) {
      return undefined;
    }

    // The bar follows the lit label; it only slides once it has a place.
    const placeBar = () => {
      const bar = barRef.current;
      const lit = row.querySelector<HTMLElement>(litSelector);
      const label = lit?.querySelector<HTMLElement>('[data-tab-label]');

      if (!bar || !lit || !label) {
        if (bar) {
          bar.style.opacity = '0';
        }
        return;
      }

      const left =
        lit.offsetLeft +
        label.offsetLeft +
        label.offsetWidth / 2 -
        barWidth / 2;
      const isPlaced = bar.style.opacity === '1';
      bar.style.transition = isPlaced ? '' : 'none';
      bar.style.transform = `translateX(${left}px)`;
      bar.style.opacity = '1';
    };

    const reveal = () => {
      placeBar();
      const lit = row.querySelector(litSelector);

      if (!row.clientWidth || !lit) {
        return;
      }

      // Not scrollIntoView: it would also scroll the page to a row below the fold.
      const rowBox = row.getBoundingClientRect();
      const litBox = lit.getBoundingClientRect();

      if (litBox.right > rowBox.right - rowInset) {
        row.scrollLeft += litBox.right - rowBox.right + rowInset;
      } else if (litBox.left < rowBox.left + rowInset) {
        row.scrollLeft -= rowBox.left + rowInset - litBox.left;
      }
    };

    reveal();
    const mutations = new MutationObserver(reveal);
    mutations.observe(row, {
      subtree: true,
      childList: true,
      attributeFilter: ['aria-current', 'aria-pressed'],
    });
    const resizes =
      typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(reveal);
    resizes?.observe(row);

    return () => {
      mutations.disconnect();
      resizes?.disconnect();
    };
  }, []);

  return (
    <div
      ref={rowRef}
      data-shell-row
      className={classNames(
        'no-scrollbar relative flex h-12 w-full items-center overflow-x-auto',
        isTabs ? 'border-b border-border-subtlest-tertiary' : 'gap-2 px-4',
      )}
    >
      {children}
      {isTabs && (
        <span
          ref={barRef}
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-0 h-[0.1875rem] w-8 rounded-max bg-text-primary opacity-0 transition-transform duration-[260ms] ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none"
        />
      )}
    </div>
  );
};

// A tab takes an equal share of the row while every tab fits, and its
// label's own width once they do not, so the row scrolls instead of
// truncating.
const tabClassName =
  'relative flex h-12 min-w-max flex-1 items-center justify-center px-4 typo-callout';

const chipClassName =
  'shell-press flex h-8 shrink-0 items-center gap-1 rounded-10 px-3 font-medium typo-subhead';

// The lit label is bold; an invisible bold copy holds every label at its
// bold width, so lighting a tab never moves the row.
const TabLabel = ({
  label,
  isLit,
  children,
}: {
  label: ReactNode;
  isLit?: boolean;
  children?: ReactNode;
}): ReactElement => (
  <span data-tab-label className="relative flex items-center">
    {typeof label === 'string' ? (
      <span
        data-text={label}
        className={classNames(
          'inline-flex flex-col after:invisible after:h-0 after:select-none after:overflow-hidden after:font-bold after:content-[attr(data-text)]',
          isLit ? 'font-bold' : 'font-medium',
        )}
      >
        {label}
      </span>
    ) : (
      label
    )}
    {children}
  </span>
);

const RowChip = ({
  item,
  className,
  content,
}: {
  item: RowItem;
  className: string;
  content: ReactNode;
}): ReactElement => {
  if (item.href) {
    return (
      <Link
        href={item.href}
        passHref
        replace={item.replace}
        scroll={item.keepScroll ? false : undefined}
      >
        <a
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
          className={className}
        >
          {content}
        </a>
      </Link>
    );
  }

  return (
    <button
      type="button"
      aria-label={item.ariaLabel}
      aria-pressed={item.active}
      onClick={item.onClick}
      className={className}
    >
      {content}
    </button>
  );
};

export const Segments = ({ items }: { items: RowItem[] }): ReactElement => (
  <>
    {items.map((item) => {
      const className = classNames(
        tabClassName,
        item.active ? 'text-text-primary' : 'text-text-tertiary',
      );
      // The lit tab's chevron hangs in its side padding, so it appears
      // without moving the label.
      const content = (
        <TabLabel label={item.label} isLit={item.active}>
          {item.active && item.menu && (
            <ArrowIcon
              size={IconSize.XXSmall}
              className="absolute left-full ml-1 rotate-180 text-text-secondary"
            />
          )}
        </TabLabel>
      );

      // The lit tab that carries a menu is already the page, so it is the
      // menu's button rather than a link with a button inside.
      if (item.active && item.menu) {
        return (
          <RowChip
            key={item.key}
            item={{
              ...item,
              href: undefined,
              ariaLabel: item.menu.ariaLabel,
              onClick: item.menu.onOpen,
            }}
            className={className}
            content={content}
          />
        );
      }

      return (
        <RowChip
          key={item.key}
          item={item}
          className={className}
          content={content}
        />
      );
    })}
  </>
);

export const Chips = ({ items }: { items: RowItem[] }): ReactElement => (
  <>
    {items.map((item) => (
      <RowChip
        key={item.key}
        item={item}
        className={classNames(
          chipClassName,
          item.active
            ? 'bg-text-primary text-surface-invert'
            : 'bg-surface-float text-text-secondary',
        )}
        content={item.label}
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
