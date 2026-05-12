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

// Floating preview of a sidebar category, shown on rail hover.
// Mirrors the dedicated panel structure (title header + scrollable
// section list) but rendered as a portaled card so the user can peek at
// any category's content without changing the pinned selection.
//
// Styling matches the sidebar Support dropdown: solid
// `bg-accent-pepper-subtlest` (NOT the translucent `surface-float`),
// `border-border-subtlest-tertiary`, `rounded-10`, plus a stronger
// `shadow-3` to lift it off the rail. Wider than the docked panel so
// it stays comfortably readable when it overlays the feed.
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
    <div className="flex h-10 shrink-0 items-center px-3 pt-3">
      <Typography bold type={TypographyType.Body}>
        {title}
      </Typography>
    </div>
    <SidebarScrollWrapper className="mt-2 min-h-0 flex-1 overflow-y-auto pb-3">
      <Nav>{children}</Nav>
    </SidebarScrollWrapper>
  </div>
);
