import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons/Arrow';
import type { WidgetKind } from './catalog';
import { widgetCatalog } from './catalog';
import { toneClass } from '../data';

/**
 * Where a stacked widget says "there is more here". The first exploration put
 * vertical dots on the right edge, which read as a scrollbar and fought the
 * content. These four keep the signal inside the widget's own grammar.
 */
export type StackIndicatorStyle = 'smart' | 'dots' | 'icons' | 'bars' | 'peek';

export const stackIndicatorLabel: Record<StackIndicatorStyle, string> = {
  smart: 'Smart Stack',
  dots: 'Header dots',
  icons: 'Header icons',
  bars: 'Story bars',
  peek: 'Peek + count',
};

export type StackState = {
  kinds: WidgetKind[];
  index: number;
  onStep: (index: number) => void;
  /** Hovered or just flipped: the moment the indicator is worth showing. */
  isAwake?: boolean;
};

const stop = (event: React.SyntheticEvent) => event.stopPropagation();

/** Sits in the widget header's row, on the right, where a title's actions go. */
const HeaderDots = ({ kinds, index, onStep }: StackState): ReactElement => (
  <div className="absolute right-4 top-4 z-1 flex h-7 items-center gap-1">
    {kinds.map((kind, position) => (
      <button
        key={kind}
        type="button"
        aria-label={`Show ${widgetCatalog[kind].name}`}
        onPointerDown={stop}
        onClick={() => onStep(position)}
        className={classNames(
          'h-1.5 rounded-max transition-all',
          position === index
            ? 'w-4 bg-text-primary'
            : 'w-1.5 bg-text-quaternary hover:bg-text-tertiary',
        )}
      />
    ))}
  </div>
);

/**
 * The other widgets in the stack as their own icons: you see what is inside
 * before you switch, the way a browser shows tabs rather than tab numbers.
 */
const HeaderIcons = ({ kinds, index, onStep }: StackState): ReactElement => (
  <div className="absolute right-3 top-4 z-1 flex h-7 items-center gap-0.5 rounded-10 bg-surface-float p-0.5">
    {kinds.map((kind, position) => {
      const def = widgetCatalog[kind];
      const isActive = position === index;
      return (
        <button
          key={kind}
          type="button"
          aria-label={`Show ${def.name}`}
          title={def.name}
          onPointerDown={stop}
          onClick={() => onStep(position)}
          className={classNames(
            'flex size-6 items-center justify-center rounded-8 transition-colors',
            isActive
              ? classNames(toneClass[def.tone].subtle, 'text-text-primary')
              : 'text-text-quaternary hover:text-text-primary',
          )}
        >
          {def.icon(IconSize.Size16)}
        </button>
      );
    })}
  </div>
);

/** Thin segments across the top edge, like stories: position and count at once. */
const StoryBars = ({ kinds, index, onStep }: StackState): ReactElement => (
  <div className="absolute inset-x-4 top-2 z-1 flex gap-1">
    {kinds.map((kind, position) => (
      <button
        key={kind}
        type="button"
        aria-label={`Show ${widgetCatalog[kind].name}`}
        onPointerDown={stop}
        onClick={() => onStep(position)}
        className="h-3 flex-1 py-1"
      >
        <span
          className={classNames(
            'block h-0.5 rounded-max',
            position === index
              ? 'bg-text-primary'
              : 'bg-border-subtlest-secondary',
          )}
        />
      </button>
    ))}
  </div>
);

/** Card edges under the widget and a count in its corner: a physical stack. */
const Peek = ({ kinds, index, onStep }: StackState): ReactElement => (
  <>
    {/* Behind the widget: the cell is `isolate`, so -1 stays inside it. */}
    <div
      style={{ zIndex: -1 }}
      className="pointer-events-none absolute inset-x-4 -bottom-1.5 h-4 rounded-b-16 border border-t-0 border-border-subtlest-tertiary bg-background-subtle"
    />
    {kinds.length > 2 && (
      <div
        style={{ zIndex: -1 }}
        className="pointer-events-none absolute inset-x-8 -bottom-3 h-4 rounded-b-16 border border-t-0 border-border-subtlest-tertiary bg-background-subtle"
      />
    )}
    <button
      type="button"
      onPointerDown={stop}
      onClick={() => onStep((index + 1) % kinds.length)}
      className="absolute bottom-3 right-3 z-1 flex h-6 items-center gap-1 rounded-8 bg-surface-float px-2 tabular-nums text-text-tertiary typo-caption1 hover:text-text-primary"
    >
      {index + 1} / {kinds.length}
      <ArrowIcon className="rotate-90" size={IconSize.Size16} />
    </button>
  </>
);

/**
 * iOS's Smart Stack grammar: a soft vertical capsule on the right edge that
 * wakes on hover and after each flip, then fades. Flipping itself is a scroll
 * or a swipe over the widget, so the dots only have to say where you are.
 */
const SmartDots = ({
  kinds,
  index,
  onStep,
  isAwake,
}: StackState): ReactElement => (
  <div
    className={classNames(
      'absolute right-1.5 top-1/2 z-1 flex -translate-y-1/2 flex-col items-center rounded-max bg-surface-float py-1 backdrop-blur-md transition-opacity duration-300',
      isAwake ? 'opacity-100' : 'opacity-0',
    )}
  >
    {kinds.map((kind, position) => (
      <button
        key={kind}
        type="button"
        aria-label={`Show ${widgetCatalog[kind].name}`}
        onPointerDown={stop}
        onClick={() => onStep(position)}
        className="flex h-3 w-3 items-center justify-center"
      >
        <span
          className={classNames(
            'block w-1 rounded-max transition-all duration-300',
            position === index
              ? 'h-2.5 bg-text-primary'
              : 'h-1 bg-text-quaternary',
          )}
        />
      </button>
    ))}
  </div>
);

export const StackIndicator = ({
  style,
  ...state
}: StackState & { style: StackIndicatorStyle }): ReactElement | null => {
  if (state.kinds.length < 2) {
    return null;
  }
  if (style === 'smart') {
    return <SmartDots {...state} />;
  }
  if (style === 'icons') {
    return <HeaderIcons {...state} />;
  }
  if (style === 'bars') {
    return <StoryBars {...state} />;
  }
  if (style === 'peek') {
    return <Peek {...state} />;
  }
  return <HeaderDots {...state} />;
};
