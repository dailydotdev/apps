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
  children: ReactNode;
}

// The floating square of the top row: back, the page's actions, messages,
// the avatar, the Plus door. 38px; `shell-hit` extends what the finger can
// reach to 44px.
export const ShellSquare = forwardRef<HTMLElement, ShellSquareProps>(
  ({ tag = 'button', className, children, ...props }, ref): ReactElement => {
    const Tag = tag as 'button';

    return (
      <Tag
        ref={ref as React.Ref<HTMLButtonElement>}
        type={tag === 'button' ? 'button' : undefined}
        className={classNames(
          'shell-material shell-press shell-hit relative flex size-[2.375rem] shrink-0 items-center justify-center rounded-14 text-text-primary',
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
