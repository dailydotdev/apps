import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { StreakQuestsSection } from '@dailydotdev/shared/src/components/sidebar/sections/StreakQuestsSection';
import { ReadingStreakPopup } from '@dailydotdev/shared/src/components/streak/popup/ReadingStreakPopup';
import { ReadingStreakButton } from '@dailydotdev/shared/src/components/streak/ReadingStreakButton';
import { StreakWidget } from '@dailydotdev/shared/src/features/feedWidgets/widgets/StreakWidget';
import { FeedWidgetSurface } from '@dailydotdev/shared/src/features/feedWidgets/FeedWidgetFrame';
import type { FeedWidgetComponentProps } from '@dailydotdev/shared/src/features/feedWidgets/registry';
import {
  FeedWidgetKind,
  FeedWidgetSize,
} from '@dailydotdev/shared/src/features/feedWidgets/types';
import type { UserStreak } from '@dailydotdev/shared/src/graphql/users';
import { DayOfWeek } from '@dailydotdev/shared/src/lib/date';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import {
  bootAsStreakReader,
  installClock,
  ProductionScene,
} from './production/scene';

/*
 * The GTA VI day on production's own components: the sidebar's
 * StreakQuestsSection, the feed StreakWidget, the streak button and its
 * ReadingStreakPopup, with production's providers and a reader's data. The
 * only stand-ins are StreakMonthCalendar and DayStreak (stories/streak/
 * production), which render production's code with the VI branch added.
 * Each story pins the clock to one day, since production reads new Date().
 */

const meta: Meta = {
  title: 'Streak/GTA VI production',
  parameters: { layout: 'fullscreen', today: '2026-11-09' },
  globals: { theme: 'dark' },
  beforeEach: ({ parameters }) => {
    bootAsStreakReader();
    return installClock(parameters.today);
  },
};

export default meta;

type Story = StoryObj;

/** The streak the button and popup show. */
const buttonStreak = (): UserStreak => ({
  current: 2,
  max: 31,
  total: 759,
  weekStart: DayOfWeek.Monday,
  lastViewAt: new Date(),
  freezesAvailable: 0,
});

/* ------------------------------------------------------------ furniture */

const Page = ({
  title,
  lead,
  children,
}: {
  title: string;
  lead: string;
  children: ReactNode;
}): ReactElement => (
  <div className="flex min-h-screen flex-col gap-8 bg-background-default p-10">
    <div className="flex max-w-3xl flex-col gap-2">
      <h1 className="font-bold text-text-primary typo-title1">{title}</h1>
      <p className="text-text-secondary typo-callout">{lead}</p>
    </div>
    <div className="flex flex-wrap items-start gap-x-16 gap-y-10">
      {children}
    </div>
  </div>
);

const Surface = ({
  name,
  component,
  children,
}: {
  name: string;
  component: string;
  children: ReactNode;
}): ReactElement => (
  <div className="flex flex-col gap-3 pb-32">
    <div className="flex flex-col">
      <span className="font-bold text-text-primary typo-callout">{name}</span>
      <code className="text-text-tertiary typo-caption1">{component}</code>
    </div>
    {children}
  </div>
);

const widgetBox: Record<FeedWidgetSize, string> = {
  [FeedWidgetSize.Small]: 'h-[17.5rem] w-80',
  [FeedWidgetSize.Tall]: 'h-[36rem] w-80',
  [FeedWidgetSize.Large]: 'h-[36rem] w-[41rem]',
};

const Widget = ({ size }: { size: FeedWidgetSize }): ReactElement => (
  <Surface
    name={`Feed widget, ${size}`}
    component={`<StreakWidget size="${size}" />`}
  >
    <div className={`flex ${widgetBox[size]}`}>
      <FeedWidgetSurface>
        <StreakWidget
          {...({ size } as FeedWidgetComponentProps<FeedWidgetKind.Streak>)}
        />
      </FeedWidgetSurface>
    </div>
  </Surface>
);

/** Every surface on one pinned day, with the VI tooltips open. */
const AllSurfaces = ({
  isEnabled = true,
  reads,
}: {
  isEnabled?: boolean;
  reads?: number[];
}): ReactElement => (
  <ProductionScene isEnabled={isEnabled} pinOpen reads={reads}>
    <Surface
      name="Sidebar panel (laptop) and phone drawer"
      component="<StreakQuestsSection />"
    >
      <div className="w-64 rounded-16 bg-background-default py-3">
        <StreakQuestsSection />
      </div>
    </Surface>
    <Surface
      name="Streak button popup (laptop and tablet)"
      component="<ReadingStreakPopup />"
    >
      <div className="rounded-16 border border-border-subtlest-tertiary bg-background-subtle">
        <ReadingStreakPopup streak={buttonStreak()} />
      </div>
    </Surface>
    <Widget size={FeedWidgetSize.Small} />
    <Widget size={FeedWidgetSize.Tall} />
    <Widget size={FeedWidgetSize.Large} />
  </ProductionScene>
);

/* ---------------------------------------------------------------- by day */

export const TenDaysOut: Story = {
  name: 'Nov 9: ten days out',
  render: () => (
    <Page
      title="Nov 9: ten days out"
      lead="Production components, clock pinned to Nov 9. Nov 19 is in the 30-day calendar but not yet in the popup's week strip (today ± 4), which stays production as it is."
    >
      <AllSurfaces />
    </Page>
  ),
};

export const WeekStripPicksItUp: Story = {
  name: 'Nov 15: first day in the week strip',
  parameters: { today: '2026-11-15' },
  render: () => (
    <Page
      title="Nov 15: first day in the week strip"
      lead="Nov 19 enters the popup's week strip at its right edge."
    >
      <AllSurfaces reads={[1, 2, 3]} />
    </Page>
  ),
};

export const ReleaseDay: Story = {
  name: 'Nov 19: release day',
  parameters: { today: '2026-11-19' },
  render: () => (
    <Page
      title="Nov 19: release day"
      lead="Today is release day: the calendar's today ring sits on the VI disc, and the popup's today arrow points at it."
    >
      <AllSurfaces reads={[1, 2, 3, 4]} />
    </Page>
  ),
};

export const AfterRelease: Story = {
  name: 'Nov 21: after release',
  parameters: { today: '2026-11-21' },
  render: () => (
    <Page
      title="Nov 21: after release"
      lead="The tooltip's after-release copy (proposed). Release day stays marked until it leaves the strip and the grid."
    >
      <AllSurfaces reads={[0, 1, 3, 4]} />
    </Page>
  ),
};

export const Gone: Story = {
  name: 'Nov 24: gone',
  parameters: { today: '2026-11-24' },
  render: () => (
    <Page
      title="Nov 24: gone"
      lead="Release day has left the grid and the strip: every surface is production as it is."
    >
      <AllSurfaces reads={[0, 1, 2]} />
    </Page>
  ),
};

export const FlagOff: Story = {
  name: 'Nov 19: flag off (control)',
  parameters: { today: '2026-11-19' },
  render: () => (
    <Page
      title="Nov 19: gta_vi_freeze_day off"
      lead="Production's control: the same day with the flag off renders production's StreakMonthCalendar and DayStreak untouched."
    >
      <AllSurfaces isEnabled={false} reads={[1, 2, 3, 4]} />
    </Page>
  ),
};

/* ---------------------------------------------------------- interactions */

/** The header mounts the button once boot has a logged-in reader. */
const LoggedInStreakButton = (): ReactElement | null => {
  const { user } = useAuthContext();

  return user ? (
    <ReadingStreakButton streak={buttonStreak()} isLoading={false} />
  ) : null;
};

const HeaderButton = (): ReactElement => (
  <ProductionScene reads={[0, 1, 2, 3]}>
    <div className="flex min-h-screen justify-end bg-background-default p-4">
      <LoggedInStreakButton />
    </div>
  </ProductionScene>
);

const openStreakButton = async (canvasElement: HTMLElement) => {
  const label = await within(canvasElement).findByText(
    /reading days/i,
    {},
    { timeout: 8000 },
  );
  await userEvent.click(label.closest('button') ?? label);
  return within(canvasElement.ownerDocument.body).findByRole(
    'button',
    { name: /GTA VI release day/ },
    { timeout: 8000 },
  );
};

const expectTooltip = async (canvasElement: HTMLElement) => {
  await expect(
    await within(canvasElement.ownerDocument.body).findByText(
      /GTA VI (is out|drops)/,
      {},
      { timeout: 4000 },
    ),
  ).toBeInTheDocument();
};

/** Laptop: the real header streak button opens its popover; hover the day. */
export const LaptopStreakButton: Story = {
  name: 'Laptop: streak button popover',
  parameters: { today: '2026-11-19' },
  render: () => <HeaderButton />,
  play: async ({ canvasElement }) => {
    await userEvent.hover(await openStreakButton(canvasElement));
    await expectTooltip(canvasElement);
  },
};

/** Phone: the streak button opens the sidebar panel in a drawer; tap the day. */
export const PhoneStreakButton: Story = {
  name: 'Phone: streak button drawer',
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  render: () => <HeaderButton />,
  play: async ({ canvasElement }) => {
    await userEvent.click(await openStreakButton(canvasElement));
    await expectTooltip(canvasElement);
  },
};

/** Tablet (768 and up): the streak button opens the same popover; tap. */
export const TabletStreakButton: Story = {
  name: 'Tablet: streak button popover',
  parameters: { today: '2026-11-19' },
  globals: { viewport: { value: 'tablet', isRotated: false } },
  render: () => <HeaderButton />,
  play: async ({ canvasElement }) => {
    await userEvent.click(await openStreakButton(canvasElement));
    await expectTooltip(canvasElement);
  },
};
