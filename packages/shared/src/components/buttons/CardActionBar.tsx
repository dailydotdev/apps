import type { HTMLAttributes, ReactElement, ReactNode, Ref } from 'react';
import React, { forwardRef } from 'react';
import classNames from 'classnames';

export type CardActionBarLayout =
  | 'default'
  | 'feedCard'
  | 'between'
  | 'compact';

const layoutToClass: Record<CardActionBarLayout, string> = {
  default: 'gap-1',
  feedCard: 'flex-1 min-w-0 gap-1 justify-between',
  between: 'gap-1 justify-between w-full',
  compact: 'gap-0.5',
};

export type CardActionBarProps = HTMLAttributes<HTMLDivElement> & {
  layout?: CardActionBarLayout;
  children: ReactNode;
};

function CardActionBarComponent(
  { layout = 'default', className, children, ...rest }: CardActionBarProps,
  ref?: Ref<HTMLDivElement>,
): ReactElement {
  return (
    <div
      {...rest}
      ref={ref}
      className={classNames(
        'flex items-center',
        layoutToClass[layout],
        className,
      )}
    >
      {children}
    </div>
  );
}

export const CardActionBar = forwardRef(CardActionBarComponent);
CardActionBar.displayName = 'CardActionBar';
