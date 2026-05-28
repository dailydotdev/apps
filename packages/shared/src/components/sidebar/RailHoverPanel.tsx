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

const floatingListSpacingOverrides = [
  // Keep dedicated-sidebar item density, but reduce the floating card's
  // list gutter so the preview feels tighter than the full sidebar.
  '[&_li.mx-3]:!mx-2',
].join(' ');

// Floating preview of a sidebar category, shown on rail hover.
// Mirrors the dedicated panel structure (title header + scrollable
// section list) but rendered as a portaled card so the user can peek at
// any category's content without changing the pinned selection.
//
// The card shell follows the Support dropdown (solid background, border,
// radius, shadow), but the list inside intentionally keeps the same
// SidebarItem density as the dedicated sidebar: h-9 rows, typo-callout
// labels, w-9/h-9 icon wrappers, and h-5/w-5 icons. These previews are
// navigation sidebars, not compact support menu links, so shrinking the
// rows makes icons and avatars look squeezed.
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
