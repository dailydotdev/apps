import { ActiveTabIndicator } from '@dailydotdev/shared/src/components/utilities';
import classNames from 'classnames';
import React, { ReactElement, ReactNode } from 'react';
import { Flipped } from 'react-flip-toolkit';

export interface FooterNavBarItemProps {
  className?: string;
  isActive?: boolean;
  children: ReactNode;
}

export function FooterNavBarItem({
  className,
  isActive,
  children,
}: FooterNavBarItemProps): ReactElement {
  return (
    <div className={classNames('relative', className)}>
      {children}
      <Flipped flipId="activeTabIndicator">
        {isActive && <ActiveTabIndicator className="-top-0.5 w-6" />}
      </Flipped>
    </div>
  );
}
