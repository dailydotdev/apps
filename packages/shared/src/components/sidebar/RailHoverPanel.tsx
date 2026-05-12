import type { ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { Nav, SidebarScrollWrapper } from './common';

export interface RailHoverPanelProps {
  title: string;
  children: ReactNode;
  className?: string;
}

// Compact-mode overrides for the docked-sidebar Section/SidebarItem
// markup so it looks polished inside this small floating dropdown
// instead of using the heavy mx-3 / w-9 icon / typo-callout sizing.
//
// We use broad descendant selectors with `!important` so the override
// wins over the breakpoint-prefixed defaults (e.g. `laptop:h-9`) baked
// into NavItem/SidebarItem. Targets the class strings emitted by
// `./common.tsx` to match the Support dropdown's row size, icon size,
// and inner padding.
const compactOverrides = [
  // Each SidebarItem renders <NavItem className="mx-3 rounded-10"> on
  // an <li> — drop the horizontal margin so rows align with the panel
  // edge instead of inheriting the docked-sidebar gutter.
  '[&_li.mx-3]:!mx-0',
  // The <li> carries `typo-callout`; shrink to subhead for parity with
  // Support's row text size.
  '[&_li.typo-callout]:!typo-subhead',
  // Item button/link defaults to `h-10 laptop:h-9` — tighten everywhere.
  '[&_a]:!h-8 [&_button]:!h-8',
  // Add a small inner padding so items have breathing room from the
  // panel edge after we removed mx-3.
  '[&_a]:!px-2 [&_button]:!px-2',
  // Icon container `w-9 h-9` → `w-7 h-7`, icon `h-5 w-5` → `h-4 w-4`.
  '[&_span.h-9]:!h-7 [&_span.w-9]:!w-7',
  '[&_svg.h-5]:!h-4 [&_svg.w-5]:!w-4',
  // NavSection adds `mt-1` between groups; tighten.
  '[&_ul.mt-1]:!mt-0.5',
  // Section header row (NavHeader is `h-9 flex items-center`) → tighter.
  '[&_li.h-9]:!h-7',
].join(' ');

// Floating preview of a sidebar category, shown on rail hover.
// Mirrors the dedicated panel structure (title header + scrollable
// section list) but rendered as a portaled card so the user can peek at
// any category's content without changing the pinned selection.
//
// Visual design follows the sidebar Support dropdown: solid
// `bg-accent-pepper-subtlest`, `border-border-subtlest-tertiary`,
// `rounded-10`, `shadow-3`, plus uniform `p-2` outer padding and a
// compact-density override scope so the section content matches
// Support's row size, icon size, and inner padding.
export const RailHoverPanel = ({
  title,
  children,
  className,
}: RailHoverPanelProps) => (
  <div
    className={classNames(
      'flex max-h-[calc(100dvh-2rem)] w-72 flex-col overflow-hidden rounded-10 border border-border-subtlest-tertiary bg-accent-pepper-subtlest p-2 shadow-3',
      className,
    )}
  >
    <Typography
      bold
      type={TypographyType.Footnote}
      color={TypographyColor.Quaternary}
      className="px-1 pb-1"
    >
      {title}
    </Typography>
    <SidebarScrollWrapper className="-mx-2 min-h-0 flex-1 overflow-y-auto px-2">
      <Nav className={classNames('!pb-0 !pt-0', compactOverrides)}>
        {children}
      </Nav>
    </SidebarScrollWrapper>
  </div>
);
