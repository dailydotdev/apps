import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { CopyIcon } from '@dailydotdev/shared/src/components/icons';
import ExtensionProviders from '../extension/_providers';
import { SourcesStyles } from '../sources/kit';
import type { DeviceName } from '../sources/device';
import { Device } from '../sources/device';
import { SourcesApp } from '../sources/shell';
import { Callout, Eyebrow } from './kit';
import type { LeaderboardFinalProps } from './final';
import { LeaderboardFinal } from './final';
import { DEVS, rankBoard } from './data';

/** #1 on Highest reputation: the person the Followed frame just followed. */
const TOP_REP = rankBoard('reputation', DEVS)[0].dev;

const meta: Meta = {
  title: 'Leaderboard/Final',
  parameters: { layout: 'fullscreen' },
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
  title: ReactNode;
  lead?: ReactNode;
  children?: ReactNode;
}): ReactElement => (
  <section className="flex flex-col gap-5">
    <div className="flex flex-col gap-2">
      <h2 className="font-bold typo-title1">{title}</h2>
      {lead && (
        <div className="max-w-[80ch] text-text-secondary typo-callout">
          {lead}
        </div>
      )}
    </div>
    {children}
  </section>
);

const Page = ({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: ReactNode;
  children: ReactNode;
}): ReactElement => (
  <ExtensionProviders>
    <SourcesStyles />
    <div className="min-h-screen bg-background-default px-6 pb-24 pt-10 text-text-primary laptop:px-10">
      <div className="mx-auto flex w-full max-w-[100rem] flex-col gap-16">
        <header className="flex flex-col gap-3 border-b border-border-subtlest-tertiary pb-8">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="max-w-[30ch] font-bold typo-mega3">{title}</h1>
          <div className="flex max-w-[80ch] flex-col gap-3 text-text-secondary typo-body">
            {intro}
          </div>
        </header>
        {children}
      </div>
    </div>
  </ExtensionProviders>
);

const Screen = ({
  device,
  label,
  height,
  theme,
  toast,
  ...props
}: LeaderboardFinalProps & {
  device: DeviceName;
  label?: string;
  height?: number;
  theme?: 'dark' | 'light';
  toast?: string;
}): ReactElement => (
  <Device
    device={device}
    label={label}
    url="/users"
    height={height}
    theme={theme}
  >
    <SourcesApp toast={toast ? { message: toast } : undefined}>
      <LeaderboardFinal {...props} />
    </SourcesApp>
  </Device>
);

/* ----------------------------------------------------- responsive page */

const flows: { title: string; steps: string[] }[] = [
  {
    title: 'First visit, signed in',
    steps: [
      'The first row opens on the board you rank best on (here Longest streak, #317) with Snapshot, and the Plus invite with its ladder.',
      'Phones: those two cards are one strip you scroll sideways; the Plus card peeks in at the edge and each card snaps into place.',
      'Then the top 12 on Highest reputation, the Standouts row, and all 8 production boards.',
      'Signed out on a phone, app.daily.dev/users sends you to daily.dev/users on the marketing site, so these frames are signed in.',
    ],
  },
  {
    title: 'Switch the board on your rank card',
    steps: [
      'Open the picker: Highest reputation, Longest streak, Most reading days (the boards leaderboardPosition supports). On phones it opens as a bottom sheet, since a menu would be clipped by the sideways strip.',
      'Pick one: the title, the total and the Snapshot image change with it. Nothing else on the page moves.',
    ],
  },
  {
    title: 'Share your rank',
    steps: [
      'Press Snapshot: it shows its busy state while the 1080px card is captured, then opens the snapshot share panel.',
      'The image has your name, your rank on the board, your total, and that board’s top 3.',
    ],
  },
  {
    title: 'Outside the counted range, or no rank yet',
    steps: [
      'Past rank 1,000, leaderboardPosition returns no rank: the card says “You’re outside the top 1K” and your rows read 1K+.',
      'With no score on the board, the card says “No rank yet” with how to earn it, Snapshot is hidden and the tiles drop your row.',
    ],
  },
  {
    title: 'Follow someone',
    steps: [
      'Hover an avatar and press Follow in the profile hover card: production’s FollowButton, with its toast “✅ You are now following {name}”.',
      'Rows and Standouts cards have no Follow of their own. Your own card and people you already follow never show it.',
    ],
  },
  {
    title: 'Open a board’s top 50',
    steps: [
      'Tablet and laptop: press anywhere on a tile. It grows in place into a popover; the list scrolls inside and your row stays pinned at the bottom.',
      'Close with the X, a click outside it, or Escape.',
      'A board with fewer than 50 entries says how many it has instead (“All 8”); Most verified employees lights your verified company, and pins it under the top rows when it is further down.',
      'Phones: a tap opens the top 50 in a bottom sheet, your row pinned. Close with the square or a tap on the scrim.',
    ],
  },
  {
    title: 'Invite a friend',
    steps: [
      'Copy invite link copies the invite message and link, with production’s toast “✅ Copied your invite message and link”.',
      'At 3 of 3 friends the card says “You unlocked 1 year of Plus” (the last step production serves) and the button stays.',
    ],
  },
  {
    title: 'Navigate away',
    steps: [
      'A row or a Standouts card opens the profile. Full ranking opens /users/highestReputation.',
      'Phones: the Explore segments switch to Posts, Tags or Sources and the bar keeps Explore lit. There is no floating search field: production’s “Search people” SpotlightField is dropped.',
      'Tablet and laptop: the rail keeps Explore lit; the laptop strip says Leaderboard.',
    ],
  },
  {
    title: 'Loading and errors',
    steps: [
      'Loading: placeholders where the rank card, the invite card’s numbers, rows, Standouts and tiles go; Copy invite link stays disabled.',
      'If the static props fail, production serves empty lists: each board says “Nothing here right now”, Standouts is hidden and no tile opens.',
    ],
  },
];

interface Control {
  element: string;
  where: string;
  look: string;
  states: string;
  goesTo: string;
  event: string;
}

const controls: Control[] = [
  {
    element: 'Explore segments',
    where: 'Phone block',
    look: '28px segments, Leaderboard lit',
    states: 'Default · lit · pressed',
    goesTo: '/posts, /tags, /sources (the lit one does nothing)',
    event: 'As production',
  },
  {
    element: 'Bottom bar tabs',
    where: 'Phone',
    look: 'ShellCluster, Explore lit',
    states: 'Default · lit · pressed',
    goesTo: '/, /posts, /squads/discover, /notifications',
    event:
      'click · target_id “mobile footer nav” · extra {tab, logged_in}; Activity: “click notification icon”',
  },
  {
    element: 'Rail',
    where: 'Tablet and laptop',
    look: 'Explore lit',
    states: 'Default · hover · lit',
    goesTo: 'As production',
    event: 'As production',
  },
  {
    element: 'Board picker',
    where: 'Rank card',
    look: 'Dropdown, 36px; on phones it says the short name (Reputation) and shares the line with Snapshot',
    states:
      'Default · hover · open (a menu, or a bottom sheet on phones) · selected',
    goesTo: 'Stays on the page',
    event: 'None today; no backend needed',
  },
  {
    element: 'Snapshot',
    where: 'Rank card',
    look: 'Phones: Primary XSmall, beside the picker. Tablets: Primary Small at full width. Laptops: 176px',
    states:
      'Default · hover · pressed · busy while capturing · hidden with no rank',
    goesTo: 'Snapshot share panel',
    event:
      '“share profile” · provider snapshot · origin “leaderboard” (Origin.Leaderboard) · target_type “profile page”',
  },
  {
    element: 'Copy invite link',
    where: 'Invite card',
    look: 'Phones: Secondary XSmall, right-aligned. Tablets: full width. Laptops: same size and place as Snapshot',
    states: 'Default · hover · pressed · toast after copy',
    goesTo: 'Clipboard',
    event:
      '“copy referral link” · target_id: one new TargetId value for this placement',
  },
  {
    element: 'Full ranking',
    where: 'Highest reputation heading',
    look: 'Text link with arrow',
    states: 'Default · hover',
    goesTo: '/users/highestReputation',
    event: 'Page view',
  },
  {
    element: 'Person row, Standouts card',
    where: 'Highest reputation, Standouts',
    look: 'Whole row or card',
    states: 'Default · hover · focus',
    goesTo: '/{username}',
    event: 'Page view, as today’s rows',
  },
  {
    element: 'Follow',
    where: 'Profile hover card',
    look: 'Production’s FollowButton in UserEntityCard, Primary',
    states:
      'Default · hover · pressed · Following after press, with toast · never on you or people you follow',
    goesTo: 'Stays on the page',
    event:
      '“follow” · target_type user · target_id the user’s id (useContentPreference)',
  },
  {
    element: 'Board tile, Top 50',
    where: 'Every leaderboard',
    look: 'Whole card; “Top 50 ›” as its cue, or “All 8 ›” when the board is shorter',
    states:
      'Default · hover · open (popover or sheet) · not pressable while loading or empty',
    goesTo: 'Top 50 in place; today it is the /users/[board] page',
    event:
      'None today: the popover replaces a page view, so add a click event if the team wants the count',
  },
  {
    element: 'Close (popover, sheet)',
    where: 'Top 50',
    look: 'Tertiary XSmall X; sheet square',
    states: 'Default · hover · pressed; outside click or scrim also closes',
    goesTo: 'Back to the tile',
    event: 'None',
  },
];

const ButtonStates = (): ReactElement => (
  <div className="grid grid-cols-1 gap-4 tablet:grid-cols-3">
    {[
      {
        name: 'Follow',
        items: [
          <Button
            key="d"
            type="button"
            size={ButtonSize.XSmall}
            variant={ButtonVariant.Primary}
          >
            Follow
          </Button>,
          <Button
            key="l"
            type="button"
            size={ButtonSize.XSmall}
            variant={ButtonVariant.Primary}
            loading
          >
            Follow
          </Button>,
          <Button
            key="x"
            type="button"
            size={ButtonSize.XSmall}
            variant={ButtonVariant.Primary}
            disabled
          >
            Follow
          </Button>,
        ],
        note: 'Default · sending · disabled. In the hover card it turns into Following once it lands.',
      },
      {
        name: 'Snapshot',
        items: [
          <Button
            key="d"
            type="button"
            size={ButtonSize.Small}
            variant={ButtonVariant.Primary}
          >
            Snapshot
          </Button>,
          <Button
            key="l"
            type="button"
            size={ButtonSize.Small}
            variant={ButtonVariant.Primary}
            loading
          >
            Snapshot
          </Button>,
        ],
        note: 'Default · capturing. Hidden when you have no rank to share.',
      },
      {
        name: 'Copy invite link',
        items: [
          <Button
            key="d"
            type="button"
            size={ButtonSize.Small}
            variant={ButtonVariant.Secondary}
            icon={<CopyIcon />}
          >
            Copy invite link
          </Button>,
          <Button
            key="x"
            type="button"
            size={ButtonSize.Small}
            variant={ButtonVariant.Secondary}
            icon={<CopyIcon />}
            disabled
          >
            Copy invite link
          </Button>,
        ],
        note: 'Default · disabled until the link loads. Copy confirms with a toast.',
      },
    ].map((group) => (
      <div
        key={group.name}
        className="flex flex-col gap-3 rounded-16 border border-border-subtlest-tertiary p-4"
      >
        <span className="font-bold typo-callout">{group.name}</span>
        <div className="flex flex-wrap items-center gap-3">{group.items}</div>
        <span className="text-text-tertiary typo-footnote">{group.note}</span>
      </div>
    ))}
  </div>
);

const ResponsivePage = (): ReactElement => (
  <Page
    eyebrow="Leaderboard redesign · web · final"
    title="Option B at full width, on every screen"
    intro={
      <>
        <p>
          The chosen direction on production’s current shell at each width: the
          v2 rail and floating card on laptops, SidebarTablet on tablets, and
          Explore’s block with the bar on phones (#6855, #7017).
        </p>
        <p>
          Everything on it is data /users already has: the 7 boards from
          LEADERBOARD_QUERY plus Highest level from HIGHEST_LEVEL_QUERY (all
          time, with a limit of 12 where production asks for 10), each board’s
          top 50 (its own query, with a limit of 50 where /users/[board] asks
          for 100), and your rank from
          leaderboardPosition, which only answers for Highest reputation,
          Longest streak and Most reading days. No weekly boards, no rank
          change, no new backend. Every frame works: follow, copy, switch
          boards, open a top 50, take a Snapshot.
        </p>
      </>
    }
  >
    <Section
      title="Laptop"
      lead="1440 and 1024. Highest reputation runs in three columns of four; the boards go four across at 1440 and two at 1024."
    >
      <Screen device="laptopL" height={1500} />
      <Screen device="laptop" height={1500} />
    </Section>

    <Section
      title="Tablet and phones"
      lead="768: SidebarTablet, Highest reputation and the boards in two columns, and the card buttons at full width. Phones: one column, the first row scrolls sideways, Standouts too, and the top 50 opens in a sheet."
    >
      <div className="grid grid-cols-1 items-start gap-6 laptop:grid-cols-3">
        <Screen device="tablet" height={1400} />
        <Screen device="phone" height={1400} />
        <Screen device="phoneS" height={1400} />
      </div>
    </Section>

    <Section
      title="QA flows"
      lead="What to walk through on each width before it ships. Every state named here has a frame in Leaderboard / Final / All states."
    >
      <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2 laptop:grid-cols-3">
        {flows.map((flow, index) => (
          <Callout key={flow.title} title={`${index + 1}. ${flow.title}`}>
            <ol className="flex list-decimal flex-col gap-1 pl-4">
              {flow.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </Callout>
        ))}
      </div>
    </Section>

    <Section
      title="Buttons and navigation"
      lead="Every control on the page: how it looks, its states, where it goes, and the event it logs. Events reuse production’s; the two notes in the last column are the only open choices, and neither needs backend work."
    >
      <div className="overflow-x-auto rounded-20 border border-border-subtlest-tertiary">
        <table className="w-full text-left typo-footnote">
          <thead>
            <tr className="border-b border-border-subtlest-tertiary text-text-tertiary">
              {['Control', 'Where', 'Look', 'States', 'Goes to', 'Event'].map(
                (label) => (
                  <th key={label} className="p-3 font-bold">
                    {label}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {controls.map((control) => (
              <tr
                key={control.element}
                className="border-b border-border-subtlest-quaternary align-top last:border-0"
              >
                <td className="p-3 font-bold text-text-primary">
                  {control.element}
                </td>
                <td className="p-3 text-text-secondary">{control.where}</td>
                <td className="p-3 text-text-secondary">{control.look}</td>
                <td className="p-3 text-text-secondary">{control.states}</td>
                <td className="p-3 text-text-secondary">{control.goesTo}</td>
                <td className="p-3 text-text-secondary">{control.event}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ButtonStates />
    </Section>
  </Page>
);

/* ----------------------------------------------------------- all states */

interface State {
  label: string;
  device: DeviceName;
  props?: LeaderboardFinalProps;
  theme?: 'dark' | 'light';
  toast?: string;
}

const TOP_REP_THIRD = rankBoard('reputation', DEVS)[2].dev;

const groups: { title: string; lead: string; states: State[] }[] = [
  {
    title: 'Your rank',
    lead: 'What leaderboardPosition can answer: a rank, past the cap, or nothing yet. The card opens on your best board; the picker switches it.',
    states: [
      { label: 'Ranked, best board · laptop', device: 'laptop' },
      { label: 'Ranked, best board · tablet', device: 'tablet' },
      { label: 'Ranked, best board · phone', device: 'phone' },
      {
        label: 'Outside the top 1K · laptop',
        device: 'laptop',
        props: { position: 'capped' },
      },
      {
        label: 'Outside the top 1K · tablet',
        device: 'tablet',
        props: { position: 'capped' },
      },
      {
        label: 'Outside the top 1K · phone',
        device: 'phone',
        props: { position: 'capped' },
      },
      {
        label: 'No rank yet · laptop',
        device: 'laptop',
        props: { position: 'empty' },
      },
      {
        label: 'No rank yet · tablet',
        device: 'tablet',
        props: { position: 'empty' },
      },
      {
        label: 'No rank yet · phone',
        device: 'phone',
        props: { position: 'empty' },
      },
      {
        label: 'Picker open · laptop',
        device: 'laptop',
        props: { frame: { pickerOpen: true } },
      },
      {
        label: 'Picker open · tablet',
        device: 'tablet',
        props: { frame: { pickerOpen: true } },
      },
      {
        label: 'Picker open, short names · phone',
        device: 'phone',
        props: { frame: { pickerOpen: true } },
      },
      {
        label: 'Picked Highest reputation · phone',
        device: 'phone',
        props: { rankBoard: 'reputation' },
      },
      {
        label: 'Picked Most reading days · laptop',
        device: 'laptop',
        props: { rankBoard: 'readingDays' },
      },
    ],
  },
  {
    title: 'First row on phones',
    lead: 'One strip you scroll sideways: the Plus card peeks in at rest, the rank card peeks back once you scroll.',
    states: [
      { label: 'At rest · phone', device: 'phone' },
      {
        label: 'Scrolled to Plus · phone',
        device: 'phone',
        props: { frame: { stripAtInvite: true } },
      },
      { label: 'At rest · small phone', device: 'phoneS' },
    ],
  },
  {
    title: 'Top 50',
    lead: 'Pressing a tile: a popover in place from tablet up, a bottom sheet on phones. Your row stays pinned at the bottom; X, a press outside or Escape closes it.',
    states: [
      {
        label: 'Popover · laptop',
        device: 'laptop',
        props: { openBoard: 'reputation' },
      },
      {
        label: 'Popover · tablet',
        device: 'tablet',
        props: { openBoard: 'streak' },
      },
      {
        label: 'Sheet · phone',
        device: 'phone',
        props: { openBoard: 'readingDays' },
      },
      {
        label: 'Highest level, level rings · laptop',
        device: 'laptop',
        props: { openBoard: 'level' },
      },
    ],
  },
  {
    title: 'People',
    lead: 'Rows and Standouts open the profile. Hovering an avatar opens production’s hover card, the only place with Follow.',
    states: [
      {
        label: 'Hover card · laptop',
        device: 'laptop',
        props: { frame: { hoverCardFor: 3 } },
      },
      {
        label: 'Hover card · tablet',
        device: 'tablet',
        props: { frame: { hoverCardFor: 3 } },
      },
      {
        label: 'Already following: no Follow · laptop',
        device: 'laptop',
        props: { followed: [TOP_REP_THIRD.id], frame: { hoverCardFor: 3 } },
      },
      {
        label: 'Followed from a hover card · phone',
        device: 'phone',
        toast: `✅ You are now following ${TOP_REP.name}`,
        props: { followed: [TOP_REP.id] },
      },
    ],
  },
  {
    title: 'Plus invite',
    lead: 'Copying confirms with production’s toast. At three friends the ladder is full and the button stays.',
    states: [
      {
        label: 'Invite link copied · laptop',
        device: 'laptop',
        toast: '✅ Copied your invite message and link',
      },
      {
        label: 'Invite link copied · phone',
        device: 'phone',
        toast: '✅ Copied your invite message and link',
        props: { frame: { stripAtInvite: true } },
      },
      {
        label: 'Ladder complete · tablet',
        device: 'tablet',
        props: { friends: 3 },
      },
      {
        label: 'Ladder complete · phone',
        device: 'phone',
        props: { friends: 3, frame: { stripAtInvite: true } },
      },
    ],
  },
  {
    title: 'Most verified employees',
    lead: 'Fewer than 50 companies, so it says “All 8”. Your verified company is lit, and pinned under the top rows when it is further down.',
    states: [
      {
        label: 'Your company in the top rows · laptop',
        device: 'laptop',
        props: { frame: { atBoards: true } },
      },
      {
        label: 'Your company further down · laptop',
        device: 'laptop',
        props: { frame: { atBoards: true, myCompany: 'Hooli' } },
      },
      {
        label: 'Your company further down · phone',
        device: 'phone',
        props: { frame: { atBoards: true, myCompany: 'Hooli' } },
      },
    ],
  },
  {
    title: 'Loading and errors',
    lead: 'Placeholders while the page loads, and production’s fallback when the static props fail: empty lists, Standouts hidden, no tile opens.',
    states: [
      { label: 'Loading · laptop', device: 'laptop', props: { loading: true } },
      { label: 'Loading · tablet', device: 'tablet', props: { loading: true } },
      { label: 'Loading · phone', device: 'phone', props: { loading: true } },
      {
        label: 'Empty lists · laptop',
        device: 'laptop',
        props: { empty: true },
      },
      {
        label: 'Empty lists · tablet',
        device: 'tablet',
        props: { empty: true },
      },
      { label: 'Empty lists · phone', device: 'phone', props: { empty: true } },
    ],
  },
  {
    title: 'Light theme',
    lead: 'Every token follows the theme.',
    states: [
      { label: 'Laptop', device: 'laptop', theme: 'light' },
      { label: 'Tablet', device: 'tablet', theme: 'light' },
      { label: 'Phone', device: 'phone', theme: 'light' },
      {
        label: 'Top 50 sheet · phone',
        device: 'phone',
        theme: 'light',
        props: { openBoard: 'streak' },
      },
    ],
  },
];

const AllStatesPage = (): ReactElement => (
  <Page
    eyebrow="Leaderboard redesign · web · final"
    title="Every state"
    intro={
      <p>
        Each frame is the full page in a device of its own width, frozen in one
        state, and still works: switch boards, follow, open a top 50.
      </p>
    }
  >
    {groups.map((group) => (
      <Section key={group.title} title={group.title} lead={group.lead}>
        <div className="grid grid-cols-1 items-start gap-6 tablet:grid-cols-2 laptop:grid-cols-3">
          {group.states.map((state) => (
            <Screen
              key={state.label}
              device={state.device}
              label={state.label}
              height={state.device.startsWith('phone') ? 812 : 900}
              theme={state.theme}
              toast={state.toast}
              {...state.props}
            />
          ))}
        </div>
      </Section>
    ))}
  </Page>
);

export const Responsive: Story = {
  name: 'Responsive',
  render: () => <ResponsivePage />,
};

export const AllStates: Story = {
  name: 'All states',
  render: () => <AllStatesPage />,
};
