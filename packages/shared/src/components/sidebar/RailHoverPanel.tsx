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
// markup so it looks polished inside this small floating dropdown.
//
// Goal: match the Support dropdown's row layout, which uses the
// ProfileSectionItem pattern of `px-1 gap-2 h-8` with a flush 16px
// icon (no centering wrapper). The docked sidebar instead wraps every
// icon in a `w-9 h-9` centering box so the icon visually floats in the
// middle of a 36px column — that wrapper is what made the rail hover
// panel look like it had a huge left padding, even after we removed
// the `mx-3` outer gutter.
//
// We use broad descendant selectors with `!important` so the override
// wins over the breakpoint-prefixed defaults (e.g. `laptop:h-9`) baked
// into NavItem/SidebarItem.
const compactOverrides = [
  // <li> from SidebarItem renders with `mx-3 rounded-10` — drop the
  // gutter so rows hug the panel's own padding.
  '[&_li.mx-3]:!mx-0',
  // <li> carries `typo-callout`; shrink to subhead for row-text parity.
  '[&_li.typo-callout]:!typo-subhead',
  // Item button/link defaults `h-10 laptop:h-9` — match Support's h-8.
  '[&_a]:!h-8 [&_button]:!h-8',
  // Match Support's tight `px-1 gap-2` row layout (icon + text +
  // optional right icon as evenly-spaced flex children) instead of the
  // sidebar's `pl-1 pr-3` + centered icon wrapper.
  '[&_a]:!px-1 [&_button]:!px-1',
  '[&_a]:!gap-2 [&_button]:!gap-2',
  // Collapse the icon centering wrapper down to the icon's own size
  // so the icon sits at the row's start, then `gap-2` provides the
  // breathing room before the label.
  '[&_span.h-9]:!h-4 [&_span.w-9]:!w-4',
  '[&_svg.h-5]:!h-4 [&_svg.w-5]:!w-4',
  // Section list spacing — Support has tighter group rhythm.
  '[&_ul.mt-1]:!mt-0',
  // Section header (NavHeader is `h-9 flex items-center`) — match the
  // Support title's compact `Footnote / p-1` height.
  '[&_li.h-9]:!h-6',
].join(' ');

// Floating preview of a sidebar category, shown on rail hover.
// Mirrors the dedicated panel structure (title header + scrollable
// section list) but rendered as a portaled card so the user can peek at
// any category's content without changing the pinned selection.
//
// Visual design copies the sidebar Support dropdown 1:1: solid
// `bg-accent-pepper-subtlest`, `border-border-subtlest-tertiary`,
// `rounded-10`, `shadow-3`, uniform `p-3` outer padding, and a
// `Footnote / Quaternary / p-1` section title — paired with the
// compact-density override scope so the section content matches
// Support's row size, icon size, gap, and inner padding.
export const RailHoverPanel = ({
  title,
  children,
  className,
}: RailHoverPanelProps) => (
  <div
    className={classNames(
      'flex max-h-[calc(100dvh-2rem)] w-72 flex-col overflow-hidden rounded-10 border border-border-subtlest-tertiary bg-accent-pepper-subtlest p-3 shadow-3',
      className,
    )}
  >
    <Typography
      bold
      type={TypographyType.Footnote}
      color={TypographyColor.Quaternary}
      className="p-1"
    >
      {title}
    </Typography>
    <SidebarScrollWrapper className="-mx-3 min-h-0 flex-1 overflow-y-auto px-3">
      <Nav className={classNames('!pb-0 !pt-0', compactOverrides)}>
        {children}
      </Nav>
    </SidebarScrollWrapper>
  </div>
);
