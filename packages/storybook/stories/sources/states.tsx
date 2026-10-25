import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import ExtensionProviders from '../extension/_providers';
import type { Source } from './data';
import { communitiesForCategory, getSource, lists } from './data';
import type { InitialToast } from './kit';
import { SourcesProvider, SourcesStyles, SourceTile, ToastHost } from './kit';
import { PersonRow, SquadRow } from './communities';
import type { DeviceName } from './device';
import { Device } from './device';
import { SourcesApp } from './shell';
import { Hub, HubRow } from './layouts/Hub';
import { Scope } from './spotlight';
import type { SuggestOpen } from './suggest';
import type { AuthPrompt } from './authLines';
import { authLines } from './authLines';

// Every width, account, theme and state of the Sources hub, for a careful
// review (the "All states" story in Sources.stories.tsx). Pages render in devices of their own width, so each shows its real
// breakpoint; component states render frozen beside each other.

/* ------------------------------------------------------------ furniture */

const sections = [
  { id: 'widths-discover', title: 'Widths · Discover' },
  { id: 'widths-category', title: 'Widths · Category page' },
  { id: 'flows', title: 'Flows · press X, go to Y' },
  { id: 'sheet', title: 'Phone · Sources sheet' },
  { id: 'signed-out', title: 'Signed out' },
  { id: 'light', title: 'Light theme' },
  { id: 'search', title: 'Search' },
  { id: 'after-follow', title: 'After following and joining' },
  { id: 'categories', title: 'Category edge cases' },
  { id: 'rows', title: 'Source rows' },
  { id: 'buttons', title: 'Follow and Join' },
  { id: 'toasts', title: 'Toasts' },
];

const Section = ({
  id,
  lead,
  children,
}: {
  id: string;
  lead: ReactNode;
  children: ReactNode;
}): ReactElement => {
  const title = sections.find((section) => section.id === id)?.title;
  return (
    <section id={id} className="flex scroll-mt-6 flex-col gap-5">
      <div className="flex flex-col gap-2">
        <h2 className="font-bold typo-title1">{title}</h2>
        <div className="max-w-[90ch] text-text-secondary typo-callout">
          {lead}
        </div>
      </div>
      {children}
    </section>
  );
};

/** A page in a device, with its own follow state. */
const Page = ({
  device,
  label,
  theme,
  height,
  loggedIn,
  tab,
  search,
  following,
  members,
  toast,
  authPrompt,
  sheet,
  source,
  suggestOpen,
}: {
  device: DeviceName;
  label?: string;
  theme?: 'dark' | 'light';
  height?: number;
  loggedIn?: boolean;
  tab?: string;
  search?: { query?: string; scope?: Scope };
  following?: string[];
  members?: string[];
  toast?: InitialToast;
  authPrompt?: AuthPrompt;
  sheet?: boolean;
  /** Opens on this source's page. */
  source?: string;
  suggestOpen?: SuggestOpen;
}): ReactElement => (
  <Device device={device} label={label} theme={theme} height={height}>
    <SourcesApp
      loggedIn={loggedIn}
      following={following}
      members={members}
      toast={toast}
      authPrompt={authPrompt}
      suggestOpen={suggestOpen}
    >
      <Hub
        initialTab={tab}
        initialSearch={search}
        initialSheet={sheet}
        initialSource={source}
      />
    </SourcesApp>
  </Device>
);

/** A frozen component state, labeled. */
const StateCard = ({
  label,
  note,
  children,
  className,
}: {
  label: string;
  note?: string;
  children: ReactNode;
  className?: string;
}): ReactElement => (
  <div className="flex min-w-0 flex-col gap-2 rounded-16 border border-border-subtlest-tertiary p-4">
    <div className="flex flex-col">
      <span className="font-bold typo-callout">{label}</span>
      {note && <span className="text-text-tertiary typo-footnote">{note}</span>}
    </div>
    <div className={classNames('min-w-0', className)}>{children}</div>
  </div>
);

const Grid = ({
  children,
  cols = 3,
}: {
  children: ReactNode;
  cols?: 2 | 3 | 4 | 5;
}): ReactElement => (
  <div
    className={classNames(
      'grid grid-cols-1 items-start gap-6',
      cols === 2 && 'laptop:grid-cols-2',
      cols === 3 && 'laptop:grid-cols-3',
      cols === 4 && 'tablet:grid-cols-2 laptop:grid-cols-4',
      cols === 5 && 'tablet:grid-cols-3 laptop:grid-cols-5',
    )}
  >
    {children}
  </div>
);

/* ------------------------------------------------------------- variants */

const noted = getSource('noted');
const fireship = getSource('fireship');
const newSource = lists.recent[0];
const longName =
  lists.recent.find((source) => source.name.length > 30) ?? lists.recent[8];
const withoutDescription: Source = {
  ...getSource('sitepoint'),
  description: null,
};
const withoutImage: Source = { ...getSource('foojayio'), image: '' };
const { squads, people } = communitiesForCategory('devops-cloud');

// Every press on these pages and where it goes. “Leaves” is a page outside
// the sources pages: the mockup names it in a toast instead of drawing it.
const flows: [string, string, string][] = [
  [
    'Hub',
    'A source row (Trending, Most followed, Recently added, a category list, the Popular Sources widget)',
    'The source’s page',
  ],
  ['Hub', 'A Top video tile', 'The source’s page'],
  [
    'Hub',
    'Follow on a row or tile',
    'Follows; the button goes, a toast offers Undo (signed out: the Sign up window)',
  ],
  [
    'Hub',
    'Copy link on a row or tile (on hover; always on touch)',
    'The icon turns to a check, “✅ Copied link to clipboard”',
  ],
  [
    'Hub',
    'A topic tile, a header tab, a choice in the phone sheet',
    'That category (or Discover), scrolled to the top',
  ],
  ['Hub', 'Sources ▾ (phone)', 'The sheet with Discover and the 13 categories'],
  [
    'Hub',
    'Search button, floating field, signed-out field',
    'Spotlight, scoped to Sources',
  ],
  [
    'Hub',
    'Suggest a source (+ on phone)',
    'Production’s Suggest new source modal',
  ],
  [
    'Hub',
    'A Squad / developer in the widgets',
    'Leaves: /squads/<handle>, /<username>',
  ],
  ['Hub', 'Join / Follow in the widgets', 'Joins or follows, toast with Undo'],
  ['Hub', 'A #tag under a category list', 'Leaves: /tags/<tag>'],
  ['Spotlight', 'A source', 'The source’s page'],
  [
    'Spotlight',
    'A post, Squad, person, tag, action',
    'Leaves: /posts/<id>, /squads/<handle>, /<username>, /tags/<tag>, the action',
  ],
  [
    'Spotlight',
    'See all … / a filter chip / Search sources',
    'Narrows to that scope',
  ],
  ['Spotlight', 'The pill, Backspace on an empty field', 'Widens to All'],
  [
    'Spotlight',
    'Esc, the backdrop, Cancel (phone)',
    'Closes, back on the page it opened from',
  ],
  [
    'Shell',
    'Rail, tablet rail, phone bar and Explore segments, You, Create',
    'Leaves: Home, Search, Squads, Activity, Streak, Bookmarks, History, Posts, Tags, Leaderboard, profile, create',
  ],
  [
    'Signed out',
    'Follow, Join, an upvote or bookmark on the source page; the header’s Sign up; Continue with email',
    'Production’s Sign up window (Join adds its line on phones)',
  ],
  [
    'Signed out',
    'Log in (header, phone block, banner, the window’s footer)',
    'The Log in view; its footer’s Sign up flips back',
  ],
  [
    'Signed out',
    'A provider, the email arrow, Log in, Continue with Google / GitHub',
    'Leaves: /onboarding',
  ],
  ['Signed out', 'Close, the backdrop', 'Closes the window'],
  ['Signed out', 'Get the app, Open app', 'Leaves: the app download page'],
  [
    'Toast',
    'Undo / ×',
    'Reverts the action / dismisses (it also goes after 6 seconds)',
  ],
];

const FlowTable = (): ReactElement => (
  <div className="overflow-x-auto rounded-16 border border-border-subtlest-tertiary">
    <table className="w-full min-w-[40rem] text-left typo-callout">
      <thead className="bg-surface-float text-text-tertiary typo-footnote">
        <tr>
          <th className="px-4 py-2 font-bold">Where</th>
          <th className="px-4 py-2 font-bold">Press</th>
          <th className="px-4 py-2 font-bold">Goes to</th>
        </tr>
      </thead>
      <tbody>
        {flows.map(([where, press, to]) => (
          <tr
            key={`${where}-${press}`}
            className="border-t border-border-subtlest-tertiary align-top"
          >
            <td className="whitespace-nowrap px-4 py-2 font-bold">{where}</td>
            <td className="px-4 py-2 text-text-secondary">{press}</td>
            <td className="px-4 py-2">{to}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const widths: DeviceName[] = ['laptopL', 'laptop', 'tablet', 'phone', 'phoneS'];

/* ---------------------------------------------------------------- page */

export const AllStatesPage = (): ReactElement => (
  <ExtensionProviders>
    <SourcesStyles />
    <div className="min-h-screen bg-background-default px-6 pb-24 pt-10 text-text-primary laptop:px-10">
      <div className="mx-auto flex w-full max-w-[110rem] flex-col gap-16">
        <header className="flex flex-col gap-3 border-b border-border-subtlest-tertiary pb-8">
          <span className="font-bold uppercase tracking-[0.16em] text-text-quaternary typo-caption1">
            Sources redesign · states
          </span>
          <h1 className="font-bold typo-mega3">Every state of the hub</h1>
          <p className="max-w-[80ch] text-text-secondary typo-body">
            Each page is a device of its own width with production’s breakpoints
            (phone below 656, laptop from 1020, laptop L from 1360), on the
            shell production serves today. Every frame works: follow, join,
            search, switch tabs. Frozen states (a toast, the Sign up window,
            rows already followed) open that way so they can be checked without
            clicking.
          </p>
          <nav className="flex flex-wrap gap-2 pt-2">
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="flex h-9 items-center rounded-12 bg-surface-float px-3 font-bold typo-callout hover:bg-surface-hover"
              >
                {section.title}
              </a>
            ))}
          </nav>
        </header>

        <Section
          id="widths-discover"
          lead="Discover, signed in. Laptop L: three columns of nine and four topic tiles across. Laptop 1024: the same columns, narrower. Tablet: one column of four per list, header tabs, the 64px icon rail. Phones: Explore’s block with one row of tabs (Sources ▾ opens the categories), four rows per list, the floating search and bar."
        >
          <Grid cols={2}>
            {widths.slice(0, 2).map((device) => (
              <Page key={device} device={device} />
            ))}
          </Grid>
          <Grid cols={3}>
            {widths.slice(2).map((device) => (
              <Page key={device} device={device} />
            ))}
          </Grid>
        </Section>

        <Section
          id="widths-category"
          lead="DevOps & Cloud. Laptop L: two columns in the bordered card, widgets beside it. Laptop 1024: one column in the card, widgets beside it. Tablet: two columns, widgets after the list. Phones: the category’s name heads the page, one column, widgets after the list."
        >
          <Grid cols={2}>
            {widths.slice(0, 2).map((device) => (
              <Page key={device} device={device} tab="devops-cloud" />
            ))}
          </Grid>
          <Grid cols={3}>
            {widths.slice(2).map((device) => (
              <Page key={device} device={device} tab="devops-cloud" />
            ))}
          </Grid>
        </Section>

        <Section
          id="flows"
          lead="Every control on the hub, the source page and search goes somewhere. Inside the sources pages the frames really navigate; a press that leaves them (a post, a tag, a Squad, the rail) shows a toast naming the page it opens."
        >
          <FlowTable />
        </Section>

        <Section
          id="sheet"
          lead="Phones keep one row of tabs, Explore’s. Like Happening now, the lit Sources segment carries a chevron and opens a sheet with Discover and the thirteen categories, the current one marked. Picking one closes the sheet; a category then names itself at the top of the page."
        >
          <Grid cols={3}>
            <Page device="phone" label="Phone · sheet open on Discover" sheet />
            <Page
              device="phone"
              label="Phone · sheet open on a category"
              tab="devops-cloud"
              sheet
            />
            <Page
              device="phone"
              theme="light"
              label="Phone · sheet, light"
              sheet
            />
          </Grid>
        </Section>

        <Section
          id="signed-out"
          lead="Signed out, exactly as production serves /sources today. Laptop: no floating card; the header (logo, Search with ⌘ + K, Get the app, Log in, Sign up), the rail collapsed under it (Home, Search, then Explore lit and Squads), the page straight beside it, and the column sign-up banner with the geo headline pinned to the bottom: left-aligned up to 1667px, centered from 1668px (laptopXL), as production. Tablet: the Log in / Sign up strip pinned to the top (CustomAuthBanner, as on the source page, featured Squads and posts), SidebarTablet with Home lit and the FeedNav chips with Sources lit. Phone: Explore’s block with Log in and Open app, and the “Open daily.dev app” footer in place of the bar and the floating search. Follow and Join open production’s Sign up window: a centered card from tablet up, full screen on phones, where Join adds “Sign up to join this Squad.”"
        >
          <Page
            device="laptopXL"
            label="Laptop XL · 1728 (from 1668 the banner centers)"
            loggedIn={false}
          />
          <Grid cols={2}>
            <Page
              device="laptopL"
              label="Laptop L · 1440 (below 1668 the banner sits left)"
              loggedIn={false}
            />
            <Page device="laptop" loggedIn={false} />
          </Grid>
          <Grid cols={3}>
            <Page device="tablet" loggedIn={false} />
            <Page device="phone" loggedIn={false} />
            <Page device="phoneS" loggedIn={false} />
          </Grid>
          <Grid cols={2}>
            <Page
              device="laptopL"
              label="Laptop L · after Follow"
              loggedIn={false}
              authPrompt={{ view: 'signup' }}
            />
            <Page
              device="laptopL"
              label="Laptop L · Log in"
              loggedIn={false}
              authPrompt={{ view: 'login' }}
            />
          </Grid>
          <Grid cols={3}>
            <Page
              device="tablet"
              label="Tablet · after Join, on a category"
              loggedIn={false}
              tab="devops-cloud"
              authPrompt={{ view: 'signup', line: authLines.joinSquad }}
            />
            <Page
              device="phone"
              label="Phone · after Follow"
              loggedIn={false}
              authPrompt={{ view: 'signup' }}
            />
            <Page
              device="phone"
              label="Phone · after Join"
              loggedIn={false}
              tab="devops-cloud"
              authPrompt={{ view: 'signup', line: authLines.joinSquad }}
            />
          </Grid>
        </Section>

        <Section
          id="light"
          lead="The same pages in the light theme: the rail, the card, the shell material (white action pieces) and the Follow buttons."
        >
          <Grid cols={2}>
            <Page device="laptopL" theme="light" />
            <Page device="laptopL" theme="light" tab="devops-cloud" />
          </Grid>
          <Grid cols={4}>
            <Page device="tablet" theme="light" />
            <Page device="phone" theme="light" />
            <Page device="phone" theme="light" tab="devops-cloud" />
            <Page device="phone" theme="light" loggedIn={false} />
          </Grid>
        </Section>

        <Section
          id="search"
          lead="Search works as on the squads directory: the search button (laptop and tablet), the floating field (phones) and the in-page field (signed-out phones) open production’s Spotlight already filtered to the new Sources scope, the way the squads directory opens it filtered to Squads. Sources returns publications only, matched on name, @handle and topic, most followed first. Removing the pill (click it or Backspace) widens to all of daily.dev, where Sources joins the filter chips between Squads and People. On phones search is a page: the scopes as segments, the field by the thumb."
        >
          <Grid cols={3}>
            <Page
              device="laptopL"
              label="Laptop L · opened, filtered to Sources"
              search={{}}
            />
            <Page
              device="laptopL"
              label="Laptop L · “rust”"
              search={{ query: 'rust' }}
            />
            <Page
              device="laptopL"
              label="Laptop L · no match"
              search={{ query: 'cobol mainframes' }}
            />
          </Grid>
          <Grid cols={3}>
            <Page
              device="laptopL"
              label="Laptop L · filter removed, all of daily.dev"
              search={{ scope: Scope.All }}
            />
            <Page
              device="laptopL"
              label="Laptop L · “rust” across daily.dev"
              search={{ query: 'rust', scope: Scope.All }}
            />
            <Page
              device="tablet"
              label="Tablet · “react”"
              search={{ query: 'react' }}
            />
          </Grid>
          <Grid cols={4}>
            <Page device="phone" label="Phone · opened" search={{}} />
            <Page
              device="phone"
              label="Phone · “rust”"
              search={{ query: 'rust' }}
            />
            <Page
              device="phone"
              label="Phone · no match"
              search={{ query: 'cobol mainframes' }}
            />
            <Page
              device="phone"
              label="Phone · signed out, from the page"
              loggedIn={false}
              search={{ query: 'kubernetes' }}
            />
          </Grid>
        </Section>

        <Section
          id="after-follow"
          lead="Following removes the button and shows production’s toast, at the top on every device, with Undo. Here Noted, SitePoint and Foojay.io are followed, and on the category the first two Squads are joined and the first developer followed."
        >
          <Grid cols={3}>
            <Page
              device="laptopL"
              following={['noted', 'sitepoint', 'foojayio']}
              toast={{
                message: '✅ You are now following Foojay.io',
                undo: { following: ['noted', 'sitepoint'] },
              }}
            />
            <Page
              device="laptopL"
              tab="devops-cloud"
              members={[
                ...squads.slice(0, 2).map((squad) => `squad:${squad.id}`),
                `user:${people[0]?.id}`,
              ]}
              toast={{
                message: `Joined ${squads[1]?.name}`,
                undo: {
                  members: [`squad:${squads[0]?.id}`, `user:${people[0]?.id}`],
                },
              }}
            />
            <Page
              device="phone"
              following={['noted', 'sitepoint', 'foojayio']}
              toast={{
                message: '✅ You are now following Foojay.io',
                undo: { following: ['noted', 'sitepoint'] },
              }}
            />
          </Grid>
        </Section>

        <Section
          id="categories"
          lead="Categories are bundles of tags, so their size varies. Security has one tag and the fewest sources; Games and DevTools have the fewest Squads; Data & Databases has the most tags to link to."
        >
          <Grid cols={3}>
            <Page device="laptopL" tab="security" label="Security" />
            <Page device="laptopL" tab="games" label="Games" />
            <Page device="laptopL" tab="data" label="Data & Databases" />
          </Grid>
          <Grid cols={3}>
            <Page device="phone" tab="security" label="Security · phone" />
            <Page device="phone" tab="games" label="Games · phone" />
            <Page
              device="phone"
              tab="career"
              label="Career & Leadership · phone"
            />
          </Grid>
        </Section>

        <SourcesProvider>
          <Section
            id="rows"
            lead="The row Discover’s lists use (and, larger with a description, a category’s). The whole row opens the source; Copy link shows on hover (always on touch), as production’s list rows do; a followed source has no button."
          >
            <Grid cols={3}>
              <StateCard label="Default">
                <HubRow source={noted} />
              </StateCard>
              <StateCard
                label="Hover"
                note="Copy link appears beside Follow (always shown on touch)"
              >
                <HubRow source={noted} state="hover" />
              </StateCard>
              <StateCard label="Already followed" note="No button">
                <HubRow source={fireship} />
              </StateCard>
              <StateCard
                label="New source"
                note="Under 50 followers and added in the last four weeks"
              >
                <HubRow source={newSource} />
              </StateCard>
              <StateCard
                label="Long name"
                note="Name and handle each truncate on a narrow row"
              >
                <HubRow source={longName} />
              </StateCard>
              <StateCard label="Category row" note="Large, with description">
                <HubRow source={noted} size="large" description />
              </StateCard>
              <StateCard label="No description" note="The line is left out">
                <HubRow source={withoutDescription} size="large" description />
              </StateCard>
              <StateCard
                label="No image"
                note="Falls back to the placeholder logo"
              >
                <HubRow source={withoutImage} />
              </StateCard>
            </Grid>
          </Section>

          <Section
            id="buttons"
            lead="Follow and Join are the leaderboard’s small primary button at one width. They go away once used; there is no Following or Joined state on this page."
          >
            <Grid cols={4}>
              <StateCard label="Squad row" note="Join">
                <SquadRow squad={squads[2] ?? squads[0]} />
              </StateCard>
              <StateCard label="Developer row" note="Follow">
                <PersonRow person={people[1] ?? people[0]} />
              </StateCard>
              <StateCard label="Video tile" note="Follow">
                <SourceTile source={lists.video[0]} />
              </StateCard>
              <StateCard label="Video tile, followed" note="No button">
                <SourceTile source={fireship} />
              </StateCard>
            </Grid>
          </Section>
        </SourcesProvider>

        <Section
          id="toasts"
          lead="Every toast the page shows, in production’s toast with its copy. Actions that can be taken back carry Undo."
        >
          <Grid cols={3}>
            {[
              {
                label: 'Follow a source',
                message: '✅ You are now following Noted',
                undo: true,
              },
              { label: 'Join a Squad', message: 'Joined DevOps', undo: true },
              {
                label: 'Follow a developer',
                message: '✅ You are now following Pavan Belagatti',
                undo: true,
              },
              { label: 'Copy link', message: '✅ Copied link to clipboard' },
            ].map((toast) => (
              <StateCard key={toast.label} label={toast.label}>
                <div className="relative h-24 overflow-hidden [transform:translateZ(0)]">
                  <SourcesProvider
                    toast={{ message: toast.message, undo: toast.undo }}
                  >
                    <ToastHost />
                  </SourcesProvider>
                </div>
              </StateCard>
            ))}
          </Grid>
        </Section>
      </div>
    </div>
  </ExtensionProviders>
);
