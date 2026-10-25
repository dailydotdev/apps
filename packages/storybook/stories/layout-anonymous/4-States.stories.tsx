import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import ExtensionProviders, { bootAsAnonymous } from '../extension/_providers';
import { Card, Page, Section, Shot } from './kit';
import {
  exploreItems,
  HoverPanel,
  LaptopShell,
  PanelList,
  squadsItems,
} from './chrome';
import { ExplorePage } from './pages';

// The proposed shell in every state a visitor can put it in. Each frame is
// one state, frozen: a hover card open beside its tab, the panel pinned
// open, the promotional banner above everything, the 1024 laptop, the
// rail-only alternative, the light theme.

// The rail's rows, from SidebarDesktopV2's own spacing: 13px of top
// padding, the logo (10px margin + 40px), Home (40), Search (40), 2px
// gaps and the 9px divider block. The Explore tab starts at 158px, Squads
// 42px below it.
const EXPLORE_TAB_TOP = 158;
const SQUADS_TAB_TOP = EXPLORE_TAB_TOP + 42;

interface State {
  id: string;
  title: string;
  note: ReactNode;
  width?: number;
  height?: number;
  render: () => ReactNode;
}

const states: State[] = [
  {
    id: 'rest',
    title: 'At rest',
    note: 'Rail collapsed (the default density is compact for everyone), the strip above the card, Explore lit. This is story 1’s proposed frame.',
    render: () => (
      <LaptopShell version="proposed" selected="explore" signupBanner>
        <ExplorePage version="proposed" />
      </LaptopShell>
    ),
  },
  {
    id: 'explore-hover',
    title: 'Hovering Explore',
    note: 'The collapsed rail opens the category’s hover card beside the tab (RailHoverPanel). For a visitor the Explore panel is DiscoverSection’s rows; Recent is empty because anonymous browsing is not recorded.',
    render: () => (
      <LaptopShell
        version="proposed"
        selected="explore"
        previewing="explore"
        signupBanner
        overlay={
          <HoverPanel
            title="Explore"
            items={exploreItems}
            activeTitle="Explore"
            top={EXPLORE_TAB_TOP}
          />
        }
      >
        <ExplorePage version="proposed" />
      </LaptopShell>
    ),
  },
  {
    id: 'squads-hover',
    title: 'Hovering Squads',
    note: 'NetworkSection for a visitor: Find Squads and New Squad (which opens the login modal). No squad rows, no Pending Posts.',
    render: () => (
      <LaptopShell
        version="proposed"
        selected="explore"
        previewing="squads"
        signupBanner
        overlay={
          <HoverPanel title="Squads" items={squadsItems} top={SQUADS_TAB_TOP} />
        }
      >
        <ExplorePage version="proposed" />
      </LaptopShell>
    ),
  },
  {
    id: 'pinned',
    title: 'Panel pinned open',
    note: 'The toggle (or “[”) pins the panel; the content moves right to the expanded width (19rem at the compact density), exactly as for a member. Today a visitor cannot reach the toggle: it sits under the header.',
    render: () => (
      <LaptopShell
        version="proposed"
        selected="explore"
        expanded
        panelTitle="Explore"
        panel={<PanelList items={exploreItems} activeTitle="Explore" />}
        signupBanner
      >
        <ExplorePage version="proposed" />
      </LaptopShell>
    ),
  },
  {
    id: 'promo',
    title: 'With the promotional banner',
    note: 'useBanner’s 2rem strip pins above everything; the rail and the card drop by 2rem (--safe-area-top-offset), the sign-in strip sticks under it.',
    render: () => (
      <LaptopShell version="proposed" selected="explore" promo signupBanner>
        <ExplorePage version="proposed" />
      </LaptopShell>
    ),
  },
  {
    id: 'laptop-1024',
    title: 'The 1024 laptop',
    note: 'The smallest window that gets the rail. The strip drops Get the app (it stays on the rail) and uses the shorter line; the grid is two cards wide.',
    width: 1024,
    height: 768,
    render: () => (
      <LaptopShell
        version="proposed"
        selected="explore"
        compactStrip
        signupBanner
      >
        <ExplorePage version="proposed" count={6} />
      </LaptopShell>
    ),
  },
  {
    id: 'rail-only',
    title: 'Alternative: rail only, no strip',
    note: 'Not recommended. The Log in tab and the bottom banner carry all of auth; Sign up loses its always-visible primary button. Shown so the trade is visible.',
    render: () => (
      <LaptopShell
        version="proposed"
        selected="explore"
        strip={false}
        signupBanner
      >
        <ExplorePage version="proposed" />
      </LaptopShell>
    ),
  },
];

const StatesPage = ({ only }: { only?: string[] }): ReactElement => (
  <ExtensionProviders>
    <Page
      title="The proposed shell, state by state"
      lead="Each window is one state, frozen. The login modal itself is production’s AuthModal and is not drawn; the Log in tab, the strip’s buttons, New Squad and the banner’s email link all open it."
    >
      <div className="flex flex-col gap-12">
        {states
          .filter((state) => !only || only.includes(state.id))
          .map((state) => (
            <Section
              key={state.id}
              id={state.id}
              title={state.title}
              lead={state.note}
            >
              <Shot
                label={`${state.width ?? 1440} × ${state.height ?? 900}`}
                width={state.width}
                height={state.height}
              >
                {state.render()}
              </Shot>
            </Section>
          ))}
      </div>
      <Section title="States that need no drawing">
        <div className="grid grid-cols-1 gap-4 laptop:grid-cols-3">
          <Card title="Scrolled">
            <p>
              The strip is sticky (top: 0) inside the content column, so it
              stays at the top of the window for the length of the page, above
              the card — scroll any frame in story 1 to see it. The rail is
              fixed, as it is for members.
            </p>
          </Card>
          <Card title="Logging in">
            <p>
              The shell does not change on login: the Log in tab becomes the
              avatar, Activity, Streak and New post appear in the tabs, the
              strip unmounts. Today the whole header disappears and the page
              jumps up by 64px.
            </p>
          </Card>
          <Card title="Short windows">
            <p>
              Two tabs and the pinned Log in never overflow; “More” exists for
              members only (it needs the shortcuts dock). Below 1020px the rail
              gives way to SidebarTablet (story 5).
            </p>
          </Card>
        </div>
      </Section>
    </Page>
  </ExtensionProviders>
);

const meta: Meta<typeof StatesPage> = {
  title: 'Layout v2 anonymous/4. States',
  component: StatesPage,
  beforeEach: bootAsAnonymous,
  parameters: { layout: 'fullscreen' },
  globals: { theme: 'dark' },
};

export default meta;

type Story = StoryObj<typeof StatesPage>;

export const All: Story = { name: 'All states · dark' };

export const Light: Story = {
  name: 'At rest and pinned · light',
  args: { only: ['rest', 'pinned'] },
  globals: { theme: 'light' },
};
