import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import classNames from 'classnames';
import { Bullets, Callout, DocPage, DocSection } from './doc';
import { Device, PHONE } from './shell';
import { Current } from './layouts/Current';
import { CategoryHub } from './layouts/CategoryHub';

const meta: Meta = {
  title: 'Squads Discover/1. Research & conclusions',
  parameters: { layout: 'fullscreen' },
  globals: { theme: 'dark' },
};

export default meta;

const Table = ({
  head,
  rows,
}: {
  head: string[];
  rows: ReactNode[][];
}): ReactElement => (
  <div className="overflow-x-auto rounded-16 border border-border-subtlest-tertiary">
    <table className="w-full min-w-[48rem] text-left typo-callout">
      <thead className="bg-surface-float text-text-tertiary typo-footnote">
        <tr>
          {head.map((cell) => (
            <th key={cell} className="px-4 py-2 font-bold">
              {cell}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-border-subtlest-quaternary">
        {rows.map((row, index) => (
          <tr
            // eslint-disable-next-line react/no-array-index-key
            key={index}
          >
            {row.map((cell, cellIndex) => (
              <td
                // eslint-disable-next-line react/no-array-index-key
                key={cellIndex}
                className={classNames(
                  'px-4 py-3 align-top',
                  cellIndex === 0
                    ? 'font-bold text-text-primary'
                    : 'text-text-secondary',
                )}
              >
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const competitors: ReactNode[][] = [
  [
    'Reddit',
    'Discover tab: a personalised feed where communities are found through their posts. Web Explore: topic chips over a grid of cards with an inline Join. Best-of: a plain ranked list',
    'In testing, one in five users joined a community from Discover. Bulk-join onboarding leaves people in communities they did not want',
  ],
  [
    'Discord',
    'Web directory: search, a category sidebar, a card grid sorted by members, each card showing online and total counts and Verified/Partnered badges. Phones: a category bar and no search',
    '"Without search, mobile discovery is basically useless" is a common user complaint',
  ],
  [
    'Facebook Groups',
    'Suggested for you, Friends’ groups, Popular near you, then 25+ categories. Cards show the cover, members, “N friends are members” and Join',
    'Social proof from people you know is the main ranking signal',
  ],
  [
    'X Communities',
    'A light list grouped by topic. Join opens the rules, then “Agree and join”',
    'A rules step at join is friction. Keep it on the squad page, not in discovery',
  ],
  [
    'Bluesky',
    'Starter packs: up to 50 accounts plus feeds, with one “Follow all” button',
    'Packs drove about 20% of all follows, and up to 43% during growth waves',
  ],
  [
    'Medium, Pinterest',
    'Onboarding asks you to pick 3 or more topics, then suggests follows',
    'Medium: 35% more reading time than readers who skipped it',
  ],
  [
    'Dev.to, Product Hunt',
    'A flat grid (or a “Popular” block plus A–Z) with Follow on every card. No carousels',
    'Developer audiences scan names. Description and count beat imagery',
  ],
  [
    'Spotify, Twitch',
    'Browse is a grid of coloured category tiles, then category pages',
    'Every category visible at a glance, at the cost of one tap',
  ],
  [
    'Telegram',
    '“Similar channels” shown right after you join a channel',
    'Discovery at the moment of highest intent, with no trip to a directory',
  ],
  [
    'Netflix (2026)',
    'Moved its phone app from horizontal rows to a vertical feed',
    'Even the company that made content rows famous drops them on phones',
  ],
];

const principles: [string, string, string][] = [
  [
    'The first screen is the page',
    'Most phone visits never get past the first sections, and visits are short. NN/g: 57% of viewing time is above the fold.',
    'More joinable squads on the first phone screen than today’s 5, Featured included.',
  ],
  [
    'Nothing hides sideways',
    'Carousels hide most of each row, and people rarely look past 5 frames (NN/g, Baymard). Sideways scrolling can’t even be measured today.',
    'Grids and lists for browsing. The one carousel is Featured, with square arrows lined up with the header and the next block peeking so it reads as more.',
  ],
  [
    'Filter in place',
    'Few visits use the tabs, yet those that do often open several categories in a row. Each hop is a page load today.',
    'Today’s tabs, switching the view in place with no page load.',
  ],
  [
    'Joining several is the behaviour',
    'People who join usually join several squads in one visit.',
    'Instant join with Undo, and starter packs on Discover and on every topic.',
  ],
  [
    'A reason beats a ranking',
    'Many visitors signed up the same day and have no history, only the tags they picked at signup.',
    '“Because you follow #react” on every For you squad. Top for logged-out visitors.',
  ],
  [
    'Promoted is native and plain',
    'One slot today, in a carousel. FTC guidance: the label goes before the content, in plain words.',
    'A fixed 2nd slot on every view, the same card, the label first.',
  ],
  [
    'Honest social proof',
    'Verified Company Squads rank first by design (a paid promise in the docs), but nothing says so: AI opens with a 14-member squad above a 30K community. “4 members” on a promoted card reads as a warning.',
    'Keep the lead, label it “Verified company Squads”. Show “New Squad” below 50.',
  ],
  [
    'Keep the editorial voice',
    'Featured is the first thing visitors see today and the team’s way to highlight squads. Promoted squads can also be featured.',
    'A bold Featured mosaic at the top (Wolt-style blocks with the next one peeking, square arrows lined up with the header), a Google Play banner rail on phones.',
  ],
  [
    'Demote the rare action',
    'New Squad is the biggest button on phones and one of the least used.',
    'A Subtle button in the laptop header and a square icon on phones.',
  ],
];

const decisions: ReactNode[] = [
  <>
    <b>Layout: the topic hub.</b> Today&apos;s tab bar (Discover, My Squads,
    Featured, every topic) with no page title, switching in place. Search leads
    the row, a Subtle New Squad closes it.
  </>,
  <>
    <b>Discover:</b> the Featured mosaic (Wolt-style blocks, the next one
    peeking and fading, square arrows lined up with the header, opening on the
    first block with only the right arrow; a Google Play banner rail on phones),
    Trending this week in three columns, starter packs, then a tile per topic.
    Featured moves on its own every 5 seconds, holds on hover or focus, stops
    for good once the reader swipes or uses the arrows, and never moves with
    reduced motion.
  </>,
  <>
    <b>Inner pages:</b> the production squad page&apos;s frame. The list in a
    bordered card, in the same row as Trending (name, members and handle,
    description, Join on the right) and, from laptop, Promoted, Starter packs
    and Trending widgets. No title bar and no inner tabs on phones.
  </>,
  <>
    <b>Featured squads</b> appear only in the Featured area and are the only
    cards with a banner.
  </>,
  <>
    <b>Promoted</b> takes the second slot everywhere and can be verified,
    featured or regular. The label is a bold word in the colour of its line.
  </>,
  <>
    <b>Verified Company Squads</b> lead each topic under their own label, as the
    paid promise in the docs.
  </>,
  <>
    <b>Starter packs</b> use Tsahi&apos;s design from the onboarding step
    (dailydotdev/apps#6779).
  </>,
  <>
    <b>Search</b> is production&apos;s Spotlight, opened scoped to Squads.
  </>,
  <>
    <b>Tabs keep their URLs.</b> Switching is in place, but every tab pushes
    production&apos;s path (<code>/squads/discover/ai</code>), so back, forward,
    shared links and topic SEO keep working.
  </>,
  <>
    <b>Joining.</b> Join is instant with an Undo toast, for one Squad or a whole
    pack. A Squad or pack you are in stays in place with no button: no Joined
    state on discovery surfaces, and leaving happens on the Squad&apos;s own
    page.
  </>,
  <>
    <b>Topic lists</b> page like production: 100 at a time, the next page
    loading as you reach the bottom.
  </>,
];

const quickWins: ReactNode[] = [
  <>
    <b>Render Join immediately.</b> In production,{' '}
    <code>SquadActionButton</code> hides itself until its card&apos;s own{' '}
    <code>contentPreferenceStatus</code> query resolves, and every featured card
    also fetches its own members (<code>getSquadMembers</code>, not batched).
    The sources query already returns <code>currentMember</code>, so the button
    can render on first paint.
  </>,
  <>
    <b>Explain the verified lead.</b> Verified Company Squads rank first by
    design, so keep that, but group them under a &quot;Verified company
    Squads&quot; label. Today AI opens with a 14-member squad and DevOps &amp;
    Cloud with a 4-member one, and it reads like a bug.
  </>,
  <>
    <b>Demote New Squad on phones</b> from the full white Primary button to an
    icon. It is the biggest element on screen and one of the least used.
  </>,
  <>
    <b>Bring My Squads back on laptop.</b> People use it, almost all on phones,
    because the v2 header dropped the tab.
  </>,
  <>
    <b>Reorder sections by the reader&apos;s tags</b> so their topics come
    first, above the drop-off.
  </>,
  <>
    <b>Log what we can&apos;t see today:</b> scroll depth, card impressions
    inside carousels, the New Squad click, and the chip or section a join came
    from.
  </>,
];

const measurement: ReactNode[][] = [
  [
    'Joins per visit',
    'Primary',
    'Joins ÷ visits, by device and by new vs existing users',
  ],
  ['Join reach', 'Primary', 'Share of visits with at least one join'],
  ['Squad opens', 'Secondary', 'Share of visits that open a squad page'],
  [
    'Depth',
    'Secondary',
    'Share of visits that see the 8th squad (new impression log)',
  ],
  [
    'Promoted',
    'Business',
    'Viewable impressions, joins and opens per promoted slot',
  ],
  [
    'Leave rate',
    'Guardrail',
    'Squads left within 7 days, joined from discovery vs elsewhere',
  ],
  ['Time to first join', 'Guardrail', 'Seconds from page view to first join'],
];

export const Overview: StoryObj = {
  name: 'Overview',
  render: () => (
    <DocPage
      eyebrow="Squads discover · Redesign research"
      title="Fewer rows, more joins: what the discover page should become"
      intro={
        <>
          <p>
            The page does one job well for a small group and almost nothing for
            everyone else. The visitors who join, join several. The rest look at
            the top, find a carousel, and leave within seconds.
          </p>
          <p>
            <b className="text-text-primary">Decision:</b> the{' '}
            <b className="text-text-primary">topic hub</b>. Today&apos;s tab bar
            without the page title; Discover with the Featured mosaic, Trending,
            starter packs and a tile per topic; every other tab in the squad
            page&apos;s frame. A/B test it against today&apos;s page. The quick
            wins below are worth doing either way.
          </p>
        </>
      }
    >
      <DocSection
        title="What the data says"
        lead="From the team's analytics for /squads/discover. The figures stay in the internal doc; these are the conclusions."
      >
        <Callout tone="brand" title="What it adds up to">
          Visitors come to join, and they join in batches. The page makes them
          dig for it: twelve stacked sections, each hiding most of its squads
          sideways, and tabs that send you to another page. The fix is to show
          more joinable squads on the first screen, let readers switch topics
          without leaving, and make several joins in a row feel natural.
        </Callout>
      </DocSection>

      <DocSection
        title="The difference on the first phone screen"
        lead="The same real squads, same phone, same moment: today's production components on the left, the topic hub on the right."
      >
        <div className="flex flex-wrap items-start gap-6">
          <Device
            width={PHONE.width}
            height={PHONE.height}
            label="Today · 5 to join"
          >
            <Current />
          </Device>
          <Device
            width={PHONE.width}
            height={PHONE.height}
            label="Topic hub · tabs, Featured, then Trending"
          >
            <CategoryHub />
          </Device>
        </div>
      </DocSection>

      <DocSection
        title="What others do"
        lead="Directories (Discord web, Dev.to, Product Hunt, Reddit Best-of) use grids or lists filtered by chips or a sidebar, not stacked carousels. Carousels survive only as short curated strips. Every product puts Join on the card."
      >
        <Table
          head={['Product', 'Pattern', 'What we take from it']}
          rows={competitors}
        />
      </DocSection>

      <DocSection title="Nine principles, each tied to our data">
        <Table
          head={['Principle', 'Evidence', 'What it means here']}
          rows={principles}
        />
      </DocSection>

      <DocSection
        title="What we decided"
        lead="Every decision is interactive in “2. Layouts” (Topic hub) and detailed in “4. Details”."
      >
        <Bullets items={decisions} />
      </DocSection>

      <DocSection
        title="Quick wins"
        lead="Each is small and independent of the redesign."
      >
        <Bullets items={quickWins} />
      </DocSection>

      <DocSection
        title="How we will know"
        lead="Time on page should go down if the page works: people find, join and get back to reading. Judge it on joins."
      >
        <Table head={['Metric', 'Role', 'Definition']} rows={measurement} />
      </DocSection>

      <DocSection title="Sources">
        <Bullets
          items={[
            'NN/g: Designing effective carousels, Scrolling and attention, Sticky headers, Social proof in UX',
            'Baymard: Homepage carousels, Avoid horizontal tabs',
            'Bluesky starter packs study (arXiv 2501.11605, Lancaster University)',
            'Medium: Make Medium yours (topic onboarding)',
            'FTC native advertising guide; University of Georgia study of sponsored-content labels',
            'Input and News 5 on Reddit Discover; TechCrunch on Telegram similar channels and Bluesky starter packs; Fast Company on the Netflix vertical feed',
            'Product analytics for /squads/discover, provided by the team',
          ]}
        />
      </DocSection>
    </DocPage>
  ),
};
