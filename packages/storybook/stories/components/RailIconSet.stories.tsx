import React from 'react';
import classNames from 'classnames';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  BellIcon,
  CompassIcon,
  HotIcon,
  NewPostIcon,
  SourceIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  RAIL_ICON_SIZE,
  railTabClass,
  railTabLabelClass,
} from '@dailydotdev/shared/src/components/sidebar/common';
import { StreakBadge } from '@dailydotdev/shared/src/components/sidebar/StreakBadge';

// Optical-size audit for the v2 rail. Every tab glyph sits in the same box
// (RAIL_ICON_SIZE, with railGlyphBoxClass for the shaped ones),
// but a box is not what the eye measures — it measures INK. A ring-shaped glyph
// (compass, streak) reads smaller than a solid one (bell, avatar) at identical
// box sizes, so the set needs per-glyph correction rather than one shared size.
//
// Use `Audit` to compare ink coverage: each cell draws the 24px box as a dashed
// outline so you can see how much of it the glyph actually fills.

const AVATAR =
  'https://daily-now-res.cloudinary.com/image/upload/f_auto,q_auto/v1/placeholders/1';

type Tab = {
  key: string;
  label: string;
  render: () => React.ReactNode;
};

const TABS: Tab[] = [
  {
    key: 'you',
    label: 'You',
    render: () => (
      <span className="flex size-7 items-center justify-center">
        <img src={AVATAR} alt="" className="size-6 rounded-8 object-cover" />
      </span>
    ),
  },
  {
    key: 'explore',
    label: 'Explore',
    render: () => <CompassIcon size={RAIL_ICON_SIZE} className="scale-105" />,
  },
  {
    key: 'squads',
    label: 'Squads',
    render: () => <SourceIcon size={RAIL_ICON_SIZE} />,
  },
  {
    key: 'activity',
    label: 'Activity',
    render: () => <BellIcon size={RAIL_ICON_SIZE} />,
  },
  {
    key: 'streak',
    label: '73',
    render: () => <StreakBadge state="pending" hasReadToday={false} />,
  },
  {
    key: 'streak-read',
    label: '73',
    render: () => <StreakBadge state="safe" hasReadToday />,
  },
  {
    key: 'plain-flame',
    label: 'Flame',
    render: () => <HotIcon size={RAIL_ICON_SIZE} />,
  },
  {
    key: 'new-post',
    label: 'New',
    render: () => (
      <span className="flex size-9 items-center justify-center rounded-12 bg-accent-cabbage-default text-white">
        {/* Deliberately NOT RAIL_ICON_SIZE — the create chip is sized on its own. */}
        <NewPostIcon size={IconSize.Small} />
      </span>
    ),
  },
];

const RailTab = ({ tab, audit }: { tab: Tab; audit: boolean }) => (
  <span className={railTabClass}>
    <span
      className={classNames(
        'relative flex items-center justify-center',
        audit && 'outline-dashed outline-1 outline-status-error',
      )}
    >
      {tab.render()}
    </span>
    <span className={railTabLabelClass}>{tab.label}</span>
  </span>
);

const Grid = ({ audit }: { audit: boolean }) => (
  <div className="flex items-start gap-2">
    {TABS.map((tab) => (
      <div key={tab.key} className="w-[68px]">
        <RailTab tab={tab} audit={audit} />
      </div>
    ))}
  </div>
);

const meta: Meta = {
  title: 'Components/Sidebar/Rail icon set',
  decorators: [
    (Story) => (
      <div className="flex min-h-[200px] items-center justify-center bg-[color-mix(in_srgb,var(--theme-surface-secondary)_3%,var(--theme-background-default))] p-8">
        <Story />
      </div>
    ),
  ],
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj;

// The set as the rail renders it — check that no glyph reads noticeably
// larger or smaller than its neighbours.
export const Default: Story = { render: () => <Grid audit={false} /> };

// Same set with each glyph's 24px box outlined, to see ink coverage per glyph.
export const Audit: Story = { render: () => <Grid audit /> };
