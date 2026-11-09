import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import {
  day,
  GtaViPhoneDrawer,
  GtaViPopover,
  GtaViSidebarPanel,
  GtaViTabletDrawer,
  GtaViWidget,
  Scene,
} from './gtaVi';

const meta: Meta = {
  title: 'Streak/GTA VI day',
  parameters: { layout: 'centered' },
  globals: { theme: 'dark' },
};

export default meta;

type Story = StoryObj;

/* ------------------------------------------------------------ furniture */

const Section = ({
  title,
  lead,
  children,
}: {
  title: string;
  lead: string;
  children: ReactNode;
}): ReactElement => (
  <section className="flex flex-col gap-4">
    <div className="flex max-w-3xl flex-col gap-1">
      <h2 className="font-bold text-text-primary typo-title2">{title}</h2>
      <p className="text-text-tertiary typo-callout">{lead}</p>
    </div>
    <div className="flex flex-wrap items-start gap-x-36 gap-y-8">
      {children}
    </div>
  </section>
);

const Case = ({
  title,
  note,
  tag,
  roomForTooltip = false,
  children,
}: {
  title: string;
  note?: string;
  tag?: 'Decision' | 'Proposed' | 'Control';
  roomForTooltip?: boolean;
  children: ReactNode;
}): ReactElement => (
  <div className="flex w-min flex-col gap-2">
    <div className="flex items-center gap-2">
      <span className="whitespace-nowrap font-bold text-text-primary typo-callout">
        {title}
      </span>
      {tag && (
        <span className="rounded-6 bg-surface-float px-1.5 py-0.5 text-text-secondary typo-caption2">
          {tag}
        </span>
      )}
    </div>
    {note && (
      <p className="min-h-10 min-w-full text-text-tertiary typo-footnote">
        {note}
      </p>
    )}
    <div className={roomForTooltip ? 'pb-32' : undefined}>{children}</div>
  </div>
);

/* --------------------------------------------------------------- catalog */

/**
 * Every state the GTA VI day can be in, by date, by surface and by decision.
 * "Today" is pinned per case, so the dates below hold whenever this is read.
 */
export const AllStates: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="flex flex-col gap-14 bg-background-default p-10">
      <div className="flex max-w-3xl flex-col gap-2">
        <h1 className="font-bold text-text-primary typo-mega3">
          GTA VI day: all states
        </h1>
        <p className="text-text-secondary typo-body">
          Nov 19, 2026 gets a VI disc wherever streak days show, with a tooltip
          giving a free Freeze Day. Tooltips are pinned open here; on laptop
          they open on hover or keyboard focus, on phone and tablet on tap.
        </p>
      </div>

      <Section
        title="1. Tooltip copy by date"
        lead="The title and body follow where today sits against release day."
      >
        <Case title="Before release" note="Nov 9." roomForTooltip>
          <Scene today={day('2026-11-09')} forceOpen>
            <GtaViSidebarPanel />
          </Scene>
        </Case>
        <Case title="Release day" note="Nov 19, today." roomForTooltip>
          <Scene today={day('2026-11-19')} forceOpen>
            <GtaViSidebarPanel />
          </Scene>
        </Case>
        <Case
          title="After release"
          tag="Proposed"
          note="Nov 21. The original body promised a freeze that is already used."
          roomForTooltip
        >
          <Scene today={day('2026-11-21')} forceOpen>
            <GtaViSidebarPanel />
          </Scene>
        </Case>
      </Section>

      <Section
        title="2. When the VI day shows in the 30-day calendar"
        lead="The grid runs from 4 days before today to 25 after, so Nov 19 shows from Oct 25 to Nov 23."
      >
        <Case title="First day it shows" note="Oct 25: the last cell.">
          <Scene today={day('2026-10-25')}>
            <GtaViSidebarPanel />
          </Scene>
        </Case>
        <Case title="Ten days out" note="Nov 9.">
          <Scene today={day('2026-11-09')}>
            <GtaViSidebarPanel />
          </Scene>
        </Case>
        <Case title="The day before" note="Nov 18.">
          <Scene today={day('2026-11-18')} reads={[0]}>
            <GtaViSidebarPanel />
          </Scene>
        </Case>
        <Case title="Last day it shows" note="Nov 23: the first cell.">
          <Scene today={day('2026-11-23')} reads={[0, 1]}>
            <GtaViSidebarPanel />
          </Scene>
        </Case>
        <Case title="Gone" note="Nov 24: release day has left the grid.">
          <Scene today={day('2026-11-24')} reads={[0, 1, 2]}>
            <GtaViSidebarPanel />
          </Scene>
        </Case>
      </Section>

      <Section
        title="3. Release day itself"
        lead="Today's ring sits on the disc. A read that day is the one state the disc hides, so it needs a call."
      >
        <Case title="Today, not read yet" note="Nov 19, nothing read today.">
          <Scene today={day('2026-11-19')} reads={[1, 2]}>
            <GtaViSidebarPanel />
          </Scene>
        </Case>
        <Case
          title="Read that day: VI only"
          tag="Decision"
          note="Nov 21. The disc covers the flame, so the read is invisible."
        >
          <Scene today={day('2026-11-21')} reads={[0, 1, 2, 3]}>
            <GtaViSidebarPanel />
          </Scene>
        </Case>
        <Case
          title="Read that day: VI with a flame"
          tag="Decision"
          note="Nov 21. A small flame badge keeps the read visible."
        >
          <Scene
            today={day('2026-11-21')}
            reads={[0, 1, 2, 3]}
            readMarker="flame"
          >
            <GtaViSidebarPanel />
          </Scene>
        </Case>
        <Case
          title="New reader, no history"
          note="Nov 9, nothing read yet: the disc still shows."
        >
          <Scene today={day('2026-11-09')} reads={[]}>
            <GtaViSidebarPanel />
          </Scene>
        </Case>
      </Section>

      <Section
        title="4. Week strip (streak button popup)"
        lead="Today and four days each side, so release day shows from Nov 15 to Nov 23."
      >
        <Case title="Not yet" note="Nov 14: Nov 19 is just past the strip.">
          <Scene today={day('2026-11-14')} reads={[0, 1, 4]}>
            <GtaViPopover />
          </Scene>
        </Case>
        <Case title="First day it shows" note="Nov 15: the right edge.">
          <Scene today={day('2026-11-15')} reads={[1, 2, 3]}>
            <GtaViPopover />
          </Scene>
        </Case>
        <Case title="Release day" note="Nov 19: the center, today.">
          <Scene today={day('2026-11-19')} reads={[1, 2, 3, 4]}>
            <GtaViPopover />
          </Scene>
        </Case>
        <Case title="Last day it shows" note="Nov 23: the left edge.">
          <Scene today={day('2026-11-23')} reads={[0, 1, 2]}>
            <GtaViPopover />
          </Scene>
        </Case>
      </Section>

      <Section
        title="5. Every surface"
        lead="Where a reader meets the calendar or the strip, on each device."
      >
        <Case
          title="Sidebar panel (laptop)"
          note="Game Center tab. Hover or focus."
          roomForTooltip
        >
          <Scene today={day('2026-11-09')} forceOpen>
            <GtaViSidebarPanel />
          </Scene>
        </Case>
        <Case
          title="Streak popover (laptop)"
          note="Streak button in the header. Hover or focus."
          roomForTooltip
        >
          <Scene today={day('2026-11-19')} reads={[1, 2, 3, 4]} forceOpen>
            <GtaViPopover />
          </Scene>
        </Case>
        <Case
          title="Feed widget, small"
          note="Home feed widget. Hover or focus."
          roomForTooltip
        >
          <Scene today={day('2026-11-09')} forceOpen>
            <GtaViWidget />
          </Scene>
        </Case>
        <Case
          title="Feed widget, tall"
          note="Tall and large sizes share this calendar."
          roomForTooltip
        >
          <Scene today={day('2026-11-09')} forceOpen>
            <GtaViWidget size="tall" />
          </Scene>
        </Case>
        <Case
          title="Phone drawer"
          note="Streak button on phone opens the sidebar panel. Tap."
          roomForTooltip
        >
          <Scene today={day('2026-11-09')} forceOpen>
            <GtaViPhoneDrawer />
          </Scene>
        </Case>
        <Case
          title="Tablet drawer"
          note="Streak button on tablet portrait opens the week strip. Tap."
          roomForTooltip
        >
          <Scene today={day('2026-11-19')} reads={[1, 2, 3, 4]} forceOpen>
            <GtaViTabletDrawer />
          </Scene>
        </Case>
      </Section>

      <Section
        title="6. Control"
        lead="gta_vi_freeze_day off, production's default: release day is a plain day."
      >
        <Case title="Flag off, calendar" tag="Control">
          <Scene today={day('2026-11-09')} isEnabled={false}>
            <GtaViSidebarPanel />
          </Scene>
        </Case>
        <Case title="Flag off, week strip" tag="Control">
          <Scene
            today={day('2026-11-19')}
            reads={[1, 2, 3, 4]}
            isEnabled={false}
          >
            <GtaViPopover />
          </Scene>
        </Case>
      </Section>
    </div>
  ),
};

/** The catalog in the light theme. */
export const AllStatesLight: Story = {
  ...AllStates,
  globals: { theme: 'light' },
};

/* ----------------------------------------------------------- interactions */

const openOnTap: Story['play'] = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.click(
    await canvas.findByRole('button', { name: /GTA VI release day/ }),
  );
  await expect(
    await within(document.body).findByRole('tooltip'),
  ).toBeInTheDocument();
};

const openOnHover: Story['play'] = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.hover(
    await canvas.findByRole('button', { name: /GTA VI release day/ }),
  );
  await expect(
    await within(document.body).findByRole('tooltip'),
  ).toBeInTheDocument();
};

const openOnFocus: Story['play'] = async ({ canvasElement }) => {
  // The story frame must hold focus for Tab's focus event to reach the day.
  canvasElement.ownerDocument.defaultView?.focus();
  await userEvent.tab();
  await expect(
    within(canvasElement).getByRole('button', { name: /GTA VI release day/ }),
  ).toHaveFocus();
  await expect(
    await within(document.body).findByRole('tooltip'),
  ).toBeInTheDocument();
};

/** Laptop: hover the VI day in the sidebar panel. */
export const LaptopHover: Story = {
  render: () => (
    <Scene today={day('2026-11-09')}>
      <div className="pb-32">
        <GtaViSidebarPanel />
      </div>
    </Scene>
  ),
  play: openOnHover,
};

/** Keyboard: Tab to the VI day; the tooltip opens on focus. */
export const KeyboardFocus: Story = {
  render: () => (
    <Scene today={day('2026-11-09')}>
      <div className="pb-32">
        <GtaViSidebarPanel />
      </div>
    </Scene>
  ),
  play: openOnFocus,
};

/** Phone: the drawer's VI day opens on tap. */
export const PhoneTap: Story = {
  render: () => (
    <Scene today={day('2026-11-09')}>
      <div className="pb-32">
        <GtaViPhoneDrawer />
      </div>
    </Scene>
  ),
  play: openOnTap,
};

/** Tablet: the week strip's VI day opens on tap. */
export const TabletTap: Story = {
  render: () => (
    <Scene today={day('2026-11-19')} reads={[1, 2, 3, 4]}>
      <div className="pb-32">
        <GtaViTabletDrawer />
      </div>
    </Scene>
  ),
  play: openOnTap,
};
