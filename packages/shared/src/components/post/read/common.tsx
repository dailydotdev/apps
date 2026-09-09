import classed from '../../../lib/classed';

/**
 * Same two-column shell the classic post layout uses, without the fixed
 * navigation branch — this template never enters modal/navigation mode.
 */
export const PostContentContainerRaw = classed(
  'div',
  'm-auto flex w-full flex-col bg-background-default pb-6 laptop:flex-row laptop:border-x laptop:border-border-subtlest-tertiary',
);
