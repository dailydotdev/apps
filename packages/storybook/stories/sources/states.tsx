import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import ExtensionProviders from '../extension/_providers';
import type { Source } from './data';
import { communitiesForCategory, getSource, lists } from './data';
import { SourcesProvider, SourcesStyles, SourceTile, ToastHost } from './kit';
import { PersonRow, SquadRow } from './communities';
import type { DeviceName } from './device';
import { Device } from './device';
import { SourcesApp } from './shell';
import { Hub, HubRow } from './layouts/Hub';
import { Scope } from './spotlight';
import type { SuggestOpen } from './suggest';

// Every width, account, theme and state of the Sources hub, for a careful
// review (the "All states" story in Sources.stories.tsx). Pages render in devices of their own width, so each shows its real
// breakpoint; component states render frozen beside each other.

/* ------------------------------------------------------------ furniture */

const sections = [
  { id: 'widths-discover', title: 'Widths · Discover' },
  { id: 'widths-category', title: 'Widths · Category page' },
  { id: 'source-page', title: 'Source page' },
  { id: 'suggest', title: 'Suggest new source' },
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
  toast?: { message: string; undo?: boolean };
  authPrompt?: string;
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
    'A source row (Trending, Most followed, Recently added, a category list, the Most followed widget)',
    'The source’s page',
  ],
  ['Hub', 'A Top video tile', 'The source’s page'],
  [
    'Hub',
    'Follow on a row or tile',
    'Follows; the button goes, a toast offers Undo (signed out: the sign-up prompt)',
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
    'The Suggest new source modal: Check link, pick a feed, Submit for review, thanks toast (signed out: sign-up prompt)',
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
  ['Spotlight', '“Search posts for …” on no results', 'Leaves: /search?q=…'],
  [
    'Spotlight',
    'Esc, the backdrop, Cancel (phone)',
    'Closes, back on the page it opened from',
  ],
  [
    'Source page',
    'The “Sources” crumb, the phone back square',
    'One step back: the hub tab it was opened from, or the source before it',
  ],
  ['Source page', 'The Home crumb', 'Leaves: /'],
  ['Source page', 'A similar source', 'That source’s page; Back returns here'],
  [
    'Source page',
    'Follow / Following',
    'Follows (“✅ You are now following …”), then Following, which unfollows on click; signed out, the sign-up prompt',
  ],
  [
    'Source page',
    'The bell (once following)',
    'Turns notifications on or off, with production’s toast',
  ],
  [
    'Source page',
    'Block / Unblock (when not following)',
    '“⛔️ … is now blocked”: Follow goes and the button reads Unblock',
  ],
  [
    'Source page',
    'Copy link, ⋯ › Share / Add to custom feed',
    '“✅ Copied link to clipboard” / leaves: /feeds/new',
  ],
  [
    'Source page',
    'A post card (title, comments), upvote, bookmark',
    'Leaves: /posts/<id>; upvote and bookmark toggle on the card',
  ],
  ['Source page', 'A #tag', 'Leaves: /tags/<tag>'],
  [
    'Shell',
    'Rail, tablet rail, phone bar and Explore segments, You, Create',
    'Leaves: Home, Search, Squads, Activity, Streak, Bookmarks, History, Posts, Tags, Leaderboard, profile, create',
  ],
  [
    'Signed out',
    'Continue with Google / GitHub (prompt or banner)',
    'Leaves: /onboarding',
  ],
  ['Signed out', 'Not now, the backdrop', 'Closes the prompt'],
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
            search, switch tabs. Frozen states (a toast, a sign-up prompt, rows
            already followed) open that way so they can be checked without
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
          id="source-page"
          lead="Any source row, tile or search result opens the source’s page, /sources/<handle>, exactly as production ships it today: nothing new. Laptop: the page header with the name. Tablet and up: the Home / Sources / name breadcrumbs. The hero card: logo, name, Follow, Block (or the bell once following), Copy link and ⋯, the description and related tags. Then Sources similar to it, the Most upvoted and Best discussed rails (hidden when empty) and All posts, with production’s cards. Phones: SourceShellPage’s row, back and ⋯, with the name fading in once it scrolls past and the Follow pill once the hero has. “Best of …” is left out: it needs the archive index, which the story has no data for. Below: no posts and no tags, no description, blocked, already followed, a long name, signed out."
        >
          <Grid cols={2}>
            {widths.slice(0, 2).map((device) => (
              <Page key={device} device={device} source="noted" />
            ))}
          </Grid>
          <Grid cols={3}>
            {widths.slice(2).map((device) => (
              <Page key={device} device={device} source="noted" />
            ))}
          </Grid>
          <Grid cols={3}>
            <Page
              device="laptop"
              label="No posts, no topics"
              source="cmu-database-group"
            />
            <Page device="laptop" label="No description" source="hackaday" />
            <Page
              device="laptop"
              label="Blocked: Unblock instead of Follow"
              source="medium_js"
            />
          </Grid>
          <Grid cols={4}>
            <Page
              device="phone"
              label="Phone · already followed"
              source="fireship"
            />
            <Page
              device="phone"
              label="Phone · long name"
              source={longName.id}
            />
            <Page
              device="phone"
              label="Phone · signed out"
              loggedIn={false}
              source="noted"
            />
            <Page
              device="phone"
              theme="light"
              label="Phone · light"
              source="noted"
            />
          </Grid>
          <Grid cols={2}>
            <Page
              device="laptopL"
              label="Laptop L · signed out"
              loggedIn={false}
              source="noted"
            />
            <Page
              device="laptopL"
              theme="light"
              label="Laptop L · light"
              source="noted"
            />
          </Grid>
        </Section>

        <Section
          id="suggest"
          lead="Every Suggest button (the header’s, the phone’s +, the empty state’s) opens production’s NewSourceModal: paste a link, Check link, pick the RSS feed, Submit for review, then the thanks toast. The scrape is mocked from the link: a known source’s site (css-tricks.com) says it already exists and links to its page; a link with “fail” in it can’t be fetched and offers Contact; any other site finds its feeds. Without enough reputation the field locks. Signed out, Suggest asks to sign up first."
        >
          <Grid cols={3}>
            <Page device="laptop" label="Opened" suggestOpen={{}} />
            <Page
              device="laptop"
              label="Feeds found"
              suggestOpen={{ url: 'https://overreacted.io', step: 'feeds' }}
            />
            <Page
              device="laptop"
              label="Already a source"
              suggestOpen={{ url: 'https://css-tricks.com', step: 'exists' }}
            />
            <Page
              device="laptop"
              label="Couldn’t fetch"
              suggestOpen={{ url: 'https://fail.example.com', step: 'error' }}
            />
            <Page
              device="laptop"
              label="Not enough reputation"
              suggestOpen={{ locked: true }}
            />
            <Page
              device="laptop"
              theme="light"
              label="Feeds found"
              suggestOpen={{ url: 'https://overreacted.io', step: 'feeds' }}
            />
          </Grid>
          <Grid cols={4}>
            <Page device="phone" label="Phone · opened" suggestOpen={{}} />
            <Page
              device="phone"
              label="Phone · feeds found"
              suggestOpen={{ url: 'https://overreacted.io', step: 'feeds' }}
            />
            <Page
              device="phone"
              label="Phone · already a source"
              suggestOpen={{ url: 'https://css-tricks.com', step: 'exists' }}
            />
            <Page
              device="phone"
              label="Phone · signed out"
              loggedIn={false}
              authPrompt="suggest a source"
            />
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
          lead="Signed out, nobody is followed. Laptop: the rail drops You, Activity and Create, and the public pages’ sign-up banner pins to the bottom. Tablet: no banner, as in production. Phone: the “Open daily.dev app” footer replaces the bar, search stays in the page. Follow, Join, Block and Suggest ask to sign up first: a centered card from tablet up, a sheet on phones."
        >
          <Grid cols={3}>
            <Page device="laptopL" loggedIn={false} />
            <Page device="tablet" loggedIn={false} />
            <Page device="phone" loggedIn={false} />
          </Grid>
          <Grid cols={3}>
            <Page
              device="laptopL"
              label="Laptop L · after Follow"
              loggedIn={false}
              authPrompt="follow Noted"
            />
            <Page
              device="tablet"
              label="Tablet · after Join, on a category"
              loggedIn={false}
              tab="devops-cloud"
              authPrompt="join DevOps"
            />
            <Page
              device="phone"
              label="Phone · after Follow"
              loggedIn={false}
              authPrompt="follow Noted"
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
          lead="Following removes the button and shows a toast with Undo, at the bottom from tablet up and at the top on phones. Here Noted, SitePoint and Foojay.io are followed, and on the category the first two Squads are joined and the first developer followed."
        >
          <Grid cols={3}>
            <Page
              device="laptopL"
              following={['noted', 'sitepoint', 'foojayio']}
              toast={{
                message:
                  'Following Foojay.io. Its posts join your Following feed',
                undo: true,
              }}
            />
            <Page
              device="laptopL"
              tab="devops-cloud"
              members={[
                ...squads.slice(0, 2).map((squad) => `squad:${squad.id}`),
                `user:${people[0]?.id}`,
              ]}
              toast={{ message: `Joined ${squads[1]?.name}`, undo: true }}
            />
            <Page
              device="phone"
              following={['noted', 'sitepoint', 'foojayio']}
              toast={{
                message:
                  'Following Foojay.io. Its posts join your Following feed',
                undo: true,
              }}
            />
          </Grid>
        </Section>

        <Section
          id="categories"
          lead="Categories are bundles of tags, so their size varies. Security has one tag and the fewest sources; Games has the fewest Squads; Data & Databases has the most tags to link to."
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
                note="Name wins, the handle truncates"
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
          lead="Every toast the page shows. Actions that can be taken back carry Undo."
        >
          <Grid cols={3}>
            {[
              {
                label: 'Follow a source',
                message: 'Following Noted. Its posts join your Following feed',
                undo: true,
              },
              { label: 'Join a Squad', message: 'Joined DevOps', undo: true },
              {
                label: 'Follow a developer',
                message: 'Following Pavan Belagatti',
                undo: true,
              },
              { label: 'Copy link', message: '✅ Copied link to clipboard' },
              {
                label: 'Suggest a source',
                message:
                  'Thanks! We’ll review your suggestion and let you know',
              },
            ].map((toast) => (
              <StateCard key={toast.label} label={toast.label}>
                <div className="relative h-24">
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
