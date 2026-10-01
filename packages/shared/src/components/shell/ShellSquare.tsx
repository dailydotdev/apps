import type { ReactElement, ReactNode } from 'react';
import React, { forwardRef } from 'react';
import classNames from 'classnames';

type SquareTag = 'a' | 'button' | 'span';

interface ShellSquareProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'children'>,
    Pick<
      React.AnchorHTMLAttributes<HTMLAnchorElement>,
      'href' | 'target' | 'rel'
    > {
  tag?: SquareTag;
  type?: 'button' | 'submit';
  disabled?: boolean;
  children: ReactNode;
}

// The 38px floating square of the top row: back, the page's actions, the
// avatar, the Plus door. The visible square keeps its size; `shell-hit`
// extends what the finger can reach to 44px.
export const ShellSquare = forwardRef<HTMLElement, ShellSquareProps>(
  (
    { tag = 'button', className, children, type, ...props },
    ref,
  ): ReactElement => {
    const Tag = tag as 'button';

    return (
      <Tag
        ref={ref as React.Ref<HTMLButtonElement>}
        type={tag === 'button' ? type ?? 'button' : undefined}
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
