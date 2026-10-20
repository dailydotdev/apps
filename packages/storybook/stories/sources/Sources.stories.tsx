import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import classNames from 'classnames';
import ExtensionProviders from '../extension/_providers';
import { Frame, SourcesStyles } from './kit';
import { Today } from './layouts/Today';
import { Hub } from './layouts/Hub';
import { Device } from './device';
import { SourcesApp } from './shell';
import { AllStatesPage } from './states';

const meta: Meta = {
  title: 'Sources/Redesign',
  parameters: { layout: 'fullscreen' },
  globals: { theme: 'dark' },
};

export default meta;

type Story = StoryObj;

/* ------------------------------------------------------------ furniture */

/** The gaps from the /sources analysis, so each layout can cite them. */
const gaps = {
  rankings: 'Right sources in the lists',
  follow: 'Follow from the list',
  context: 'Description and numbers',
  topics: 'Browse by topic',
  personal: 'Personal',
  seo: 'Full crawlable index',
  search: 'Search up top',
} as const;

type Gap = keyof typeof gaps;

const Eyebrow = ({ children }: { children: ReactNode }): ReactElement => (
  <span className="font-bold uppercase tracking-[0.16em] text-text-quaternary typo-caption1">
    {children}
  </span>
);

const Section = ({
  id,
  title,
  lead,
  children,
}: {
  id?: string;
  title: ReactNode;
  lead?: ReactNode;
  children?: ReactNode;
}): ReactElement => (
  <section id={id} className="flex scroll-mt-6 flex-col gap-5">
    <div className="flex flex-col gap-2">
      <h2 className="font-bold typo-title1">{title}</h2>
      {lead && (
        <div className="max-w-[90ch] text-text-secondary typo-callout">
          {lead}
        </div>
      )}
    </div>
    {children}
  </section>
);

const Card = ({
  title,
  children,
  tone = 'neutral',
}: {
  title: ReactNode;
  children: ReactNode;
  tone?: 'neutral' | 'brand';
}): ReactElement => (
  <div
    className={classNames(
      'flex flex-col gap-2 rounded-20 border p-5',
      tone === 'brand'
        ? 'border-accent-cabbage-default bg-overlay-float-cabbage'
        : 'border-border-subtlest-tertiary',
    )}
  >
    <h3 className="font-bold typo-body">{title}</h3>
    <div className="flex flex-col gap-2 text-text-secondary typo-callout">
      {children}
    </div>
  </div>
);

interface Layout {
  id: string;
  number: string;
  name: string;
  pitch: string;
  borrows: string;
  solves: Gap[];
  tradeoff: string;
  backend?: string;
  /** The layout in a 1440 laptop: a device frame of its own. */
  render: () => ReactNode;
  /** The same layout on phones, each in a 375px device of its own. */
  phones?: { label: string; render: () => ReactNode }[];
}

const layouts: Layout[] = [
  {
    id: 'hub',
    number: '1',
    name: 'Sources hub',
    pitch:
      'The squads directory’s new frame (#6843), for sources. No page title: search leads a tab row (Discover, then the squad directory’s thirteen categories) and a quiet “Suggest a source” closes it. Discover opens on Trending and Most followed, each laid out like Popular Squads: a title and subtitle, then nine rows in three columns, each row round logo, name, followers and @handle, Follow. Then a Top video row you scroll sideways, Recently added in the same three columns, and a tile per category. A category tab is the squad page frame: a bordered list card, links to the category’s tag pages, and the Related Squads, Related Authors and Popular Sources widgets. Search works as on the squads directory: it opens production’s Spotlight already filtered to a new Sources scope (publications only), beside Posts, Squads, People and Tags. On phones it stays one of Explore’s views: Explore’s block with Sources lit, whose chevron opens Discover and the categories in a sheet (as Happening now does), four rows per list like Popular Squads on phones, and a category’s widgets after its list.',
    borrows:
      'Squads directory (#6843), onboarding packs (#6779), phone shell step 3 (#6855)',
    solves: ['topics', 'follow', 'rankings', 'search', 'seo'],
    tradeoff:
      'Matches the squads directory exactly, so Explore has one look. Rows drop the description and rank, so a row says less about why to follow, and the categories are tag bundles, not something a source is filed under.',
    backend:
      'A Sources scope for Spotlight search (publications only, ranked by name, @handle, then topic). Categories for sources: today each one gathers the sourcesByTag results of a few tags (AI & ML = #ai, #machine-learning, #llm). The squad categories API still has the old eleven (AI, Web, DevRel, Fun…), so it needs the same thirteen.',
    render: () => (
      <Device device="laptopL" height={1100}>
        <SourcesApp>
          <Hub />
        </SourcesApp>
      </Device>
    ),
    phones: [
      {
        label: 'Discover · signed in',
        render: () => (
          <SourcesApp>
            <Hub />
          </SourcesApp>
        ),
      },
      {
        label: 'DevOps & Cloud · signed in',
        render: () => (
          <SourcesApp>
            <Hub initialTab="devops-cloud" />
          </SourcesApp>
        ),
      },
      {
        label: 'Discover · signed out',
        render: () => (
          <SourcesApp loggedIn={false}>
            <Hub />
          </SourcesApp>
        ),
      },
    ],
  },
];

const GapTags = ({ solves }: { solves: Gap[] }): ReactElement => (
  <div className="flex flex-wrap gap-1.5">
    {solves.map((gap) => (
      <span
        key={gap}
        className="rounded-8 bg-surface-float px-2 py-0.5 text-text-secondary typo-footnote"
      >
        {gaps[gap]}
      </span>
    ))}
  </div>
);

const LayoutSection = ({ layout }: { layout: Layout }): ReactElement => (
  <Section
    id={layout.id}
    title={
      <span className="flex items-baseline gap-3">
        <span className="text-text-quaternary">{layout.number}</span>
        {layout.name}
      </span>
    }
  >
    <div className="grid grid-cols-1 gap-6 laptop:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <p className="text-text-secondary typo-body">{layout.pitch}</p>
      <div className="flex flex-col gap-3 typo-footnote">
        <span className="text-text-tertiary">
          Borrows from{' '}
          <span className="text-text-secondary">{layout.borrows}</span>
        </span>
        <GapTags solves={layout.solves} />
        <span className="text-text-tertiary">
          <span className="font-bold text-text-secondary">Trade-off: </span>
          {layout.tradeoff}
        </span>
        {layout.backend && (
          <span className="text-text-tertiary">
            <span className="font-bold text-text-secondary">Backend: </span>
            {layout.backend}
          </span>
        )}
      </div>
    </div>
    {layout.render()}
    {layout.phones && (
      <div className="flex flex-col gap-3">
        <Eyebrow>On phones</Eyebrow>
        <div className="grid grid-cols-1 gap-6 tablet:grid-cols-3">
          {layout.phones.map((phone) => (
            <Device key={phone.label} device="phone" label={phone.label}>
              {phone.render()}
            </Device>
          ))}
        </div>
      </div>
    )}
  </Section>
);

/* ---------------------------------------------------------------- page */

const AllLayoutsPage = (): ReactElement => (
  <ExtensionProviders>
    <SourcesStyles />
    <div className="min-h-screen bg-background-default px-6 pb-24 pt-10 text-text-primary laptop:px-10">
      <div className="mx-auto flex w-full max-w-[100rem] flex-col gap-16">
        <header className="flex flex-col gap-3 border-b border-border-subtlest-tertiary pb-8">
          <Eyebrow>Sources redesign · web</Eyebrow>
          <h1 className="max-w-[30ch] font-bold typo-mega3">
            A sources hub for /sources
          </h1>
          <div className="flex max-w-[80ch] flex-col gap-3 text-text-secondary typo-body">
            <p>
              Today /sources is four static top-10 lists. You can’t follow from
              them, and few visits go on to open a source. Popular is led by the
              daily.dev Changelog and two user sources. People treat the page as
              an Explore tab they flip past. The direction below puts /sources
              on the squads directory’s new frame, so Explore has one look for
              both.
            </p>
            <p>
              Every frame is a device of its own width (a 1440 laptop, 375px
              phones) on production’s current shell, the phone one after step 3
              (#6855). They use real sources, descriptions, latest posts, Squads
              and developers from the API, and work: follow a source or
              developer and join a Squad (the button goes away, with Undo in the
              toast), copy a link, search, every tab. The reader follows five
              sources and has blocked Medium, which the lists then leave out.
              Every width, theme and state is in Sources / Redesign / All
              states.
            </p>
          </div>
        </header>

        <Section
          title="Best practice for source directories"
          lead="What app stores, podcast apps, feed readers and social apps have settled on, and what it means for us."
        >
          <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2 laptop:grid-cols-3">
            <Card title="The action lives on the row">
              <p>
                Every directory that grows follows (Spotify, Substack, Bluesky,
                the App Store) puts the primary action on the list item. Making
                people open a detail page to follow loses most of them. Follow
                is instant, with Undo, never a confirm.
              </p>
            </Card>
            <Card title="Show why, not just who">
              <p>
                A name and a handle aren’t enough to decide. Feed readers show a
                one-line description, follower count and how often it posts, and
                the best ones show the latest headlines. Readers judge a source
                by what it writes.
              </p>
            </Card>
            <Card title="Browse by interest">
              <p>
                App stores and podcast apps lead with categories, with “See all”
                into a page per category. Topic pages are also the crawlable
                index search engines need: our 40 links today cover a tiny part
                of the catalog.
              </p>
            </Card>
            <Card title="Rankings need clean inputs">
              <p>
                Charts only work when everything in them is the same kind of
                thing. Mix in a changelog and user profiles and the list loses
                trust. Filter by type first, then rank. Show movement to give a
                reason to come back.
              </p>
            </Card>
            <Card title="Personal beats global">
              <p>
                For logged-in people, a directory should start from what they
                already like (“Because you follow #rust”) and hide what they
                follow or blocked. Medium, X and Substack all do it. A global
                list is the fallback, not the default.
              </p>
            </Card>
            <Card title="Search is the front door on mobile">
              <p>
                Mobile visitors lean on search more than desktop ones. Search
                sits at the top, matches handle, topic and description, and when
                it finds nothing it offers “Suggest this source” in place of a
                dead end.
              </p>
            </Card>
          </div>
        </Section>

        <Section
          id="today"
          title={
            <span className="flex items-baseline gap-3">
              <span className="text-text-quaternary">0</span>
              Today (production)
            </span>
          }
          lead="For reference: the four lists as the API returns them right now, including the Changelog and the two user sources in Popular. Rank, name, @handle and copy link per row, plus Suggest new source. The hub keeps every one of those actions, copy link included, on hover as today. Static."
        >
          <Frame>
            <Today />
          </Frame>
        </Section>

        {layouts.map((layout) => (
          <LayoutSection key={layout.id} layout={layout} />
        ))}

        <Section
          title="Gaps covered"
          lead="Which gaps from the analysis the hub closes."
        >
          <div className="overflow-x-auto rounded-20 border border-border-subtlest-tertiary">
            <table className="w-full text-left typo-callout">
              <thead>
                <tr className="border-b border-border-subtlest-tertiary text-text-tertiary typo-footnote">
                  <th className="p-3 font-bold">Layout</th>
                  {Object.values(gaps).map((label) => (
                    <th key={label} className="p-3 text-center font-bold">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {layouts.map((layout) => (
                  <tr
                    key={layout.id}
                    className="border-b border-border-subtlest-quaternary last:border-0"
                  >
                    <td className="p-3 font-bold">
                      <span className="mr-2 text-text-quaternary">
                        {layout.number}
                      </span>
                      {layout.name}
                    </td>
                    {(Object.keys(gaps) as Gap[]).map((gap) => (
                      <td key={gap} className="p-3 text-center">
                        {layout.solves.includes(gap) ? (
                          <span className="text-accent-avocado-default">●</span>
                        ) : (
                          <span className="text-text-disabled">·</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="Recommendation">
          <div className="grid grid-cols-1 gap-4 laptop:grid-cols-3">
            <Card tone="brand" title="Ship in two steps">
              <p>
                First the ranking fix and the hub frame with Trending, Most
                followed and Recently added: Follow and @handle on every row.
                Then the category tabs with their Squads and developers, linking
                to the tag pages.
              </p>
            </Card>
            <Card title="Phones ship with it">
              <p>
                /sources stays one of Explore’s views on phones: Explore’s block
                with Sources lit, a chevron on it that opens the categories in a
                sheet (one row of tabs, as Happening now), and search floating
                above the bar. Signed out, the app footer takes the bar’s place
                and search stays in the page, as on /tags and /tools today.
              </p>
            </Card>
            <Card title="Before any of it">
              <p>
                Fix measurement: log list clicks with list name and position,
                follows with origin “source directory”, and the Suggest a source
                flow. Without them, the hub can’t be judged against today.
              </p>
            </Card>
          </div>
        </Section>
      </div>
    </div>
  </ExtensionProviders>
);

export const Overview: Story = {
  render: () => <AllLayoutsPage />,
};

export const AllStates: Story = {
  name: 'All states',
  render: () => <AllStatesPage />,
};
