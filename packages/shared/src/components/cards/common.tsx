import { HTMLAttributes, ReactHTML } from 'react';
import classed, { ClassedHTML } from '../../lib/classed';

export const Separator = classed(
  'div',
  'mx-1 w-0.5 h-0.5 rounded-full bg-theme-label-tertiary',
);

export const visibleOnGroupHover =
  'laptop:mouse:invisible laptop:mouse:group-hover:visible';

export const getGroupedHoverContainer = <
  P extends HTMLAttributes<T>,
  T extends HTMLElement,
>(
  type: keyof ReactHTML = 'div',
): ClassedHTML<P, T> => classed<P, T>(type, visibleOnGroupHover);
