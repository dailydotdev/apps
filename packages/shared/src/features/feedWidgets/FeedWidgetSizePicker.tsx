import type { KeyboardEvent, ReactElement } from 'react';
import React, { useEffect, useRef } from 'react';
import classNames from 'classnames';
import type { FeedWidgetKind, FeedWidgetSize } from './types';
import { feedWidgetSizeLabel } from './types';
import { FeedWidgetPreview } from './FeedWidgetPreview';

const radioKeySteps: Partial<Record<string, number>> = {
  ArrowRight: 1,
  ArrowDown: 1,
  ArrowLeft: -1,
  ArrowUp: -1,
};

/** Arrow keys move a size group's choice, and its focus, as radios do. */
const sizeFromKey = (
  event: KeyboardEvent<HTMLElement>,
  sizes: FeedWidgetSize[],
  size: FeedWidgetSize,
): FeedWidgetSize | undefined => {
  const step = radioKeySteps[event.key];
  if (!step) {
    return undefined;
  }
  event.preventDefault();
  const index = (sizes.indexOf(size) + step + sizes.length) % sizes.length;
  const radios =
    event.currentTarget.parentElement?.querySelectorAll<HTMLElement>(
      '[role="radio"]',
    );
  radios?.[index]?.focus();
  return sizes[index];
};

export const SizePicker = ({
  sizes,
  size,
  onChange,
}: {
  sizes: FeedWidgetSize[];
  size: FeedWidgetSize;
  onChange: (size: FeedWidgetSize) => void;
}): ReactElement => (
  <div
    role="radiogroup"
    aria-label="Size"
    className="flex rounded-10 bg-surface-float p-0.5"
  >
    {sizes.map((value) => (
      <button
        key={value}
        type="button"
        role="radio"
        aria-checked={size === value}
        tabIndex={size === value ? 0 : -1}
        onClick={() => onChange(value)}
        onKeyDown={(event) => {
          const next = sizeFromKey(event, sizes, size);
          if (next) {
            onChange(next);
          }
        }}
        className={classNames(
          'h-7 rounded-8 px-3 transition-colors typo-footnote',
          size === value
            ? 'bg-background-default font-bold text-text-primary shadow-2'
            : 'text-text-tertiary hover:text-text-primary',
        )}
      >
        {feedWidgetSizeLabel[value]}
      </button>
    ))}
  </div>
);

/** A phone's sizes as pages to swipe, with a dot for each under them. */
export const SizePages = ({
  kind,
  sizes,
  size,
  onChange,
}: {
  kind: FeedWidgetKind;
  sizes: FeedWidgetSize[];
  size: FeedWidgetSize;
  onChange: (size: FeedWidgetSize) => void;
}): ReactElement => {
  const scroller = useRef<HTMLDivElement>(null);
  const page = Math.max(0, sizes.indexOf(size));

  const scrollToPage = (index: number, behavior: ScrollBehavior) => {
    const node = scroller.current;
    node?.scrollTo?.({ left: index * node.clientWidth, behavior });
  };

  useEffect(() => {
    scrollToPage(page, 'auto');
    // Only where the pages start; a swipe moves them on its own.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind]);

  const pickPage = (index: number) => {
    onChange(sizes[index]);
    scrollToPage(index, 'smooth');
  };

  return (
    <>
      <div
        ref={scroller}
        className="no-scrollbar flex min-h-40 shrink snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
        onScroll={(event) => {
          const { scrollLeft, clientWidth } = event.currentTarget;
          const next = sizes[Math.round(scrollLeft / clientWidth)];
          if (next && next !== size) {
            onChange(next);
          }
        }}
      >
        {sizes.map((value) => (
          <div
            key={value}
            className="flex w-full shrink-0 snap-center flex-col items-center gap-3 px-6"
          >
            <FeedWidgetPreview
              kind={kind}
              size={value}
              className="w-full flex-[0_1_18rem]"
            />
            <span className="font-bold text-text-tertiary typo-caption1">
              {feedWidgetSizeLabel[value]}
            </span>
          </div>
        ))}
      </div>
      {sizes.length > 1 && (
        <div
          role="radiogroup"
          aria-label="Size"
          className="flex shrink-0 justify-center gap-1.5 py-3"
        >
          {sizes.map((value, index) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-label={feedWidgetSizeLabel[value]}
              aria-checked={value === size}
              tabIndex={value === size ? 0 : -1}
              onClick={() => pickPage(index)}
              onKeyDown={(event) => {
                const next = sizeFromKey(event, sizes, size);
                if (next) {
                  pickPage(sizes.indexOf(next));
                }
              }}
              className={classNames(
                'size-1.5 rounded-max',
                value === size ? 'bg-text-primary' : 'bg-surface-float',
              )}
            />
          ))}
        </div>
      )}
    </>
  );
};
