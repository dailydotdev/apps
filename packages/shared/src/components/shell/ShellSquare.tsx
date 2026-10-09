import type { ReactElement, ReactNode } from 'react';
import React, { forwardRef } from 'react';
import classNames from 'classnames';

type SquareTag = 'a' | 'button';

interface ShellSquareProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'children'>,
    Pick<
      React.AnchorHTMLAttributes<HTMLAnchorElement>,
      'href' | 'target' | 'rel'
    > {
  tag?: SquareTag;
  // 32px, for Home's row, where it sits among the 32px streak, quest and
  // avatar buttons.
  small?: boolean;
  children: ReactNode;
}

// The floating square of the top row: back, the page's actions, messages,
// the avatar, the Plus door. 38px, or 32px (`small`) on Home's row. The
// visible square keeps its size; `shell-hit` extends what the finger can
// reach to 44px.
export const ShellSquare = forwardRef<HTMLElement, ShellSquareProps>(
  (
    { tag = 'button', small, className, children, ...props },
    ref,
  ): ReactElement => {
    const Tag = tag as 'button';

    return (
      <Tag
        ref={ref as React.Ref<HTMLButtonElement>}
        type={tag === 'button' ? 'button' : undefined}
        className={classNames(
          'shell-material shell-press shell-hit relative flex shrink-0 items-center justify-center text-text-primary',
          small
            ? 'shell-hit-small size-8 rounded-10'
            : 'size-[2.375rem] rounded-14',
          className,
        )}
        {...props}
      >
        {children}
      </Tag>
    );
  },
);
ShellSquare.displayName = 'ShellSquare';

// The one filled action a thing brings into the block once its hero has
// left the screen: Follow, Join.
export const ShellPrimaryPill = ({
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>): ReactElement => (
  <button
    type="button"
    className={classNames(
      'shell-press shell-hit relative flex h-[2.375rem] shrink-0 items-center rounded-14 bg-text-primary px-3 font-bold text-surface-invert typo-footnote',
      className,
    )}
    {...props}
  >
    {children}
  </button>
);
