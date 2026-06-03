import type { ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { Typography, TypographyType } from '../typography/Typography';
import { Nav, SidebarScrollWrapper } from './common';

export interface RailHoverPanelProps {
  title: string;
  children: ReactNode;
  className?: string;
}

const floatingListSpacingOverrides = '[&_li.mx-3]:!mx-2';

export const RailHoverPanel = ({
  title,
  children,
  className,
}: RailHoverPanelProps) => (
  <div
    className={classNames(
      'flex max-h-[calc(100dvh-2rem)] w-72 flex-col overflow-hidden rounded-10 border border-border-subtlest-tertiary bg-accent-pepper-subtlest shadow-3',
      className,
    )}
  >
    <div className="flex h-9 shrink-0 items-center px-4 pt-3">
      <Typography bold type={TypographyType.Callout}>
        {title}
      </Typography>
    </div>
    <SidebarScrollWrapper className="mt-1 min-h-0 flex-1 overflow-y-auto pb-2">
      <Nav className={classNames('!pb-0 !pt-0', floatingListSpacingOverrides)}>
        {children}
      </Nav>
    </SidebarScrollWrapper>
  </div>
);
