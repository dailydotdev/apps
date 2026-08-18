import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  SponsorFeedBand,
  SponsorFeedCard,
  SponsorRailInline,
  SponsorRailPinned,
  SponsorLogo,
  SponsorSideRail,
  type Sponsor,
  type SponsoredStripProps,
} from 'extension/src/newtab/SponsoredStrip';
import ExtensionProviders from './_providers';
import { MockFeedGrid, MockFeedHeader } from './_mockPostFeed';

// =============================================================
// Sponsored strip — five ways to put a "presented by" slot and a
// ten-logo partner wall on the new tab, evaluated over a real feed.
//
// Reference: TBPN's lower third — a pinned "Presented by <primary>"
// card plus a "Made possible by" logo ticker. That show can hold a
// bar on screen forever because the bar covers nothing. Our new tab
// is a reading surface, so the ticker is dropped (motion in the
// periphery is the disruption we are avoiding) and each concept is
// scored on how much feed it costs. Start with **Evaluation**.
//
// Logos are real daily.dev advertiser marks pulled from
// business.daily.dev — placeholders for layout only, not a claim
// that any of these companies has bought this slot.
// =============================================================

const LOGO_BASE = 'https://business.daily.dev/assets/company-logos';

const sponsor = (name: string, file: string, ratio: number): Sponsor => ({
  name,
  logo: `${LOGO_BASE}/${file}.svg`,
  ratio,
});

// The primary slot keeps its brand colour, so the mark has to read on
// both grounds. NVIDIA is not in the advertiser library, so this one is
// a local story fixture (public/mock-logos): the Wikimedia wordmark
// recoloured to the brand green. That recolour is the point — the
// stock lockup is black, which vanishes on the dark feed, while
// #76B900 sits at 0.62 luminance and clears both.
const PRIMARY: Sponsor = {
  name: 'NVIDIA',
  logo: '/mock-logos/nvidia.svg',
  ratio: 630.2 / 118.2,
};

// All ten mask cleanly, and the ratios deliberately span the real
// range of wordmark shapes — a stubby mark (Amazon, 2:1) through a
// long lockup (LaunchDarkly, 6.4:1) — to exercise optical sizing.
const PARTNERS: Sponsor[] = [
  sponsor('Datadog', 'datadog', 800.5 / 203.19),
  sponsor('PostHog', 'posthog', 512 / 90),
  sponsor('ClickHouse', 'clickhouse', 584.9 / 103.1),
  sponsor('Retool', 'retool', 87 / 17),
  sponsor('Snyk', 'snyk', 65 / 35),
  sponsor('Okta', 'okta', 512 / 169),
  sponsor('Neo4j', 'neo4j', 512 / 170),
  sponsor('Pulumi', 'pulumi', 512 / 128),
  sponsor('LaunchDarkly', 'launchdarkly', 512 / 80),
  sponsor('Amazon', 'amazon', 512 / 256),
];

// Marks whose artwork defeats the silhouette treatment, kept for the
// LogoTreatment story so the constraint is shown rather than asserted.
// (A backplate <rect> inside a <clipPath> is harmless — Redis has one
// and masks fine — so the check is what gets painted, not what exists.)
const ASSET_PROBLEMS: (Sponsor & { reason: string })[] = [
  {
    ...sponsor('Postman', 'postman', 512 / 156),
    reason: 'white knockouts fill in',
  },
  {
    ...sponsor('Notion', 'notion', 512 / 178),
    reason: 'white knockouts fill in',
  },
  {
    ...sponsor('GitLab', 'gitlab', 1),
    reason: 'raster WebP in an .svg wrapper, no alpha',
  },
];

// Candidates for the coloured lead slot, with the check that
// matters: does every ink survive both grounds? Rendered side by side
// in LogoTreatment against a normal and an `.invert` ground.
const PRIMARY_CANDIDATES: (Sponsor & { verdict: string })[] = [
  {
    ...PRIMARY,
    verdict: 'brand green at 0.62 luminance — holds on both',
  },
  {
    ...sponsor('Google', 'google', 75 / 24),
    verdict: 'four inks, 0.40–0.74 luminance — the alternative',
  },
  {
    ...sponsor('Appwrite', 'appwrite', 512 / 91),
    verdict: 'a single #f02e65 — holds on both',
  },
  {
    ...sponsor('Sentry', 'sentry', 512 / 113),
    verdict: '#362D59 at 0.20 luminance — sinks into the dark ground',
  },
  {
    ...sponsor('Notion', 'notion', 512 / 178),
    verdict: 'black wordmark — gone on the dark ground',
  },
];

const stripProps: Pick<SponsoredStripProps, 'primary' | 'partners'> = {
  primary: PRIMARY,
  partners: PARTNERS,
};

const meta: Meta<SponsoredStripProps> = {
  title: 'Extension/Sponsored Strip',
  parameters: { layout: 'fullscreen' },
  argTypes: {
    monochrome: {
      control: 'boolean',
      description:
        'Silhouette logos in the surrounding text colour. Off shows the brand-colour originals.',
    },
  },
  args: { monochrome: true, ...stripProps },
};

export default meta;

type Story = StoryObj<SponsoredStripProps>;

const Page = ({ children }: { children: ReactNode }): ReactElement => (
  <div className="min-h-dvh bg-background-default">{children}</div>
);

const Note = ({ children }: { children: ReactNode }): ReactElement => (
  <p className="mx-auto mb-4 max-w-[64rem] text-text-tertiary typo-footnote">
    {children}
  </p>
);

// ---------------------------------------------------------------
// A. Pinned rail
// ---------------------------------------------------------------
export const PinnedRail: Story = {
  name: 'A · Pinned rail',
  render: (args) => (
    <ExtensionProviders>
      <Page>
        <div className="flex min-h-dvh flex-col">
          <div className="flex-1 p-6 pb-16">
            <MockFeedHeader />
            <MockFeedGrid />
          </div>
          <SponsorRailPinned {...args} />
        </div>
      </Page>
    </ExtensionProviders>
  ),
};

// ---------------------------------------------------------------
// B. Inline rail
// ---------------------------------------------------------------
export const InlineRail: Story = {
  name: 'B · Inline rail',
  render: (args) => (
    <ExtensionProviders>
      <Page>
        <div className="p-6">
          <MockFeedHeader />
          <div className="mx-auto max-w-[64rem]">
            <SponsorRailInline {...args} />
          </div>
          <MockFeedGrid />
        </div>
      </Page>
    </ExtensionProviders>
  ),
};

// ---------------------------------------------------------------
// C. Feed band
// ---------------------------------------------------------------
export const FeedBand: Story = {
  name: 'C · Feed band',
  render: (args) => (
    <ExtensionProviders>
      <Page>
        <div className="p-6">
          <MockFeedHeader />
          <MockFeedGrid
            insert={<SponsorFeedBand {...args} />}
            insertAfter={3}
          />
        </div>
      </Page>
    </ExtensionProviders>
  ),
};

// ---------------------------------------------------------------
// D. Card slot
// ---------------------------------------------------------------
export const CardSlot: Story = {
  name: 'D · Card slot',
  render: (args) => (
    <ExtensionProviders>
      <Page>
        <div className="p-6">
          <MockFeedHeader />
          <MockFeedGrid
            insert={<SponsorFeedCard {...args} />}
            insertAfter={4}
          />
        </div>
      </Page>
    </ExtensionProviders>
  ),
};

// ---------------------------------------------------------------
// E. Side rail
// ---------------------------------------------------------------
export const SideRail: Story = {
  name: 'E · Side rail',
  render: (args) => (
    <ExtensionProviders>
      <Page>
        <div className="flex gap-8 p-6">
          <div className="min-w-0 flex-1">
            <MockFeedHeader />
            <MockFeedGrid count={6} />
          </div>
          <SponsorSideRail className="sticky top-6 self-start" {...args} />
        </div>
      </Page>
    </ExtensionProviders>
  ),
};

// ---------------------------------------------------------------
// Gallery — all five, same data, no feed
// ---------------------------------------------------------------
const CONCEPTS = [
  {
    id: 'A',
    name: 'Pinned rail',
    note: 'the literal translation of the reference: bottom edge, whole session',
    render: (args: SponsoredStripProps) => (
      <SponsorRailPinned {...args} className="!static rounded-12 border" />
    ),
  },
  {
    id: 'B',
    name: 'Inline rail',
    note: 'same bar, in flow above the first card row — scrolls away',
    render: (args: SponsoredStripProps) => <SponsorRailInline {...args} />,
  },
  {
    id: 'C',
    name: 'Feed band',
    note: 'full-width row between card rows; wraps instead of clipping',
    render: (args: SponsoredStripProps) => <SponsorFeedBand {...args} />,
  },
  {
    id: 'D',
    name: 'Card slot',
    note: 'takes one post card’s place in the grid',
    render: (args: SponsoredStripProps) => (
      <div className="max-w-80">
        <SponsorFeedCard {...args} />
      </div>
    ),
  },
  {
    id: 'E',
    name: 'Side rail',
    note: 'no feed displaced at all, lowest attention, laptop and up only',
    render: (args: SponsoredStripProps) => <SponsorSideRail {...args} />,
  },
];

export const Gallery: Story = {
  render: (args) => (
    <ExtensionProviders>
      <Page>
        <div className="mx-auto flex max-w-[64rem] flex-col gap-8 p-6">
          {CONCEPTS.map((concept) => (
            <figure key={concept.id}>
              <figcaption className="mb-2 flex items-baseline gap-2">
                <span className="font-bold text-text-primary typo-callout">
                  {concept.id} · {concept.name}
                </span>
                <span className="text-text-tertiary typo-caption1">
                  {concept.note}
                </span>
              </figcaption>
              {concept.render(args)}
            </figure>
          ))}
        </div>
      </Page>
    </ExtensionProviders>
  ),
};

// ---------------------------------------------------------------
// Logo treatment — why the silhouette default exists
// ---------------------------------------------------------------
const Ground = ({
  children,
  invert,
  label,
}: {
  children: ReactNode;
  invert?: boolean;
  label: string;
}): ReactElement => (
  <div
    className={classNames(
      'flex flex-col gap-2 rounded-12 border border-border-subtlest-tertiary bg-background-default p-4',
      invert && 'invert',
    )}
  >
    <span className="text-text-quaternary typo-caption2 uppercase tracking-wide">
      {label}
    </span>
    {children}
  </div>
);

export const LogoTreatment: Story = {
  render: (args) => (
    <ExtensionProviders>
      <Page>
        <div className="mx-auto flex max-w-[64rem] flex-col gap-8 p-6">
          <Note>
            The strip splits its logo treatment. The lead slot keeps its brand
            colour — it is the thing being paid for, and one coloured mark
            against a neutral wall is the whole hierarchy. The partner wall goes
            to silhouettes that inherit the strip&apos;s text colour, so ten
            marks stay even-weighted and none of them out-shouts a post.
          </Note>

          <figure>
            <figcaption className="mb-1 font-bold text-text-primary typo-callout">
              The lead slot has to clear both grounds
            </figcaption>
            <Note>
              Keeping brand colour means the mark gets no help from the theme,
              so any ink near black or near white dies on one side. Both columns
              are the same asset on both grounds at once — the right one uses
              the app&apos;s own <code>.invert</code> class, so it is the real
              theme, not a mock-up of it, and the pair swaps when you flip the
              toolbar. Of the library&apos;s vector wordmarks only a handful
              pass; the bottom two are why Sentry was dropped as the primary.
            </Note>
            <div className="flex flex-col gap-3">
              {PRIMARY_CANDIDATES.map((candidate) => (
                <div
                  className="flex flex-col gap-2 tablet:flex-row tablet:items-center"
                  key={candidate.name}
                >
                  <span className="w-28 shrink-0 text-text-primary typo-footnote">
                    {candidate.name}
                  </span>
                  <span className="w-72 shrink-0 text-text-tertiary typo-caption1">
                    {candidate.verdict}
                  </span>
                  <div className="flex gap-3">
                    <Ground label="This theme">
                      <SponsorLogo
                        height={20}
                        monochrome={false}
                        sponsor={candidate}
                      />
                    </Ground>
                    <Ground invert label="Opposite">
                      <SponsorLogo
                        height={20}
                        monochrome={false}
                        sponsor={candidate}
                      />
                    </Ground>
                  </div>
                </div>
              ))}
            </div>
          </figure>

          <figure>
            <figcaption className="mb-2 font-bold text-text-primary typo-callout">
              The wall, silhouetted (default)
            </figcaption>
            <SponsorRailInline {...args} monochrome />
          </figure>
          <figure>
            <figcaption className="mb-2 font-bold text-text-primary typo-callout">
              The wall, in original brand colour
            </figcaption>
            <Note>
              Ten marks all fighting for their own colour, several of them
              near-black. This is what the silhouette default is avoiding.
            </Note>
            <SponsorRailInline {...args} monochrome={false} />
          </figure>

          <figure>
            <figcaption className="mb-2 font-bold text-text-primary typo-callout">
              Where the silhouette breaks
            </figcaption>
            <Note>
              An alpha mask keeps the artwork&apos;s outline, so anything opaque
              comes through solid. Two failure modes show up in the existing
              advertiser library: white knockouts fill in, and 31 of its 66
              wordmark files are raster images wrapped in an .svg, which mask to
              a plain block. The fix is not code — a single-colour vector asset
              has to be part of the slot spec.
            </Note>
            <div className="flex flex-col gap-4 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-5">
              {ASSET_PROBLEMS.map((logo) => (
                <div className="flex items-center gap-6" key={logo.name}>
                  <span className="w-24 shrink-0 text-text-primary typo-footnote">
                    {logo.name}
                  </span>
                  <span className="w-56 shrink-0 text-text-tertiary typo-caption1">
                    {logo.reason}
                  </span>
                  <span className="flex w-40 justify-start text-text-primary">
                    <SponsorLogo height={20} monochrome sponsor={logo} />
                  </span>
                  <SponsorLogo height={20} monochrome={false} sponsor={logo} />
                </div>
              ))}
            </div>
          </figure>
        </div>
      </Page>
    </ExtensionProviders>
  ),
};

// ---------------------------------------------------------------
// Evaluation
// ---------------------------------------------------------------
type Row = {
  id: string;
  concept: string;
  cost: string;
  exposure: string;
  legibility: string;
  mobile: string;
};

const ROWS: Row[] = [
  {
    id: 'A',
    concept: 'Pinned rail',
    cost: '48px of viewport, for the whole session',
    exposure: 'Every session, continuously',
    legibility:
      'All ten clear the fade from ~1090px; below that they drop into it one at a time',
    mobile:
      'Poor — at 375px the 210px lockup leaves no partner clear of the fade, and it lands on the browser’s own bottom chrome',
  },
  {
    id: 'B',
    concept: 'Inline rail',
    cost: '44px once, above the fold',
    exposure: 'Until the first scroll',
    legibility: 'Same ~1090px threshold as A',
    mobile: 'Weak — no partner clears the fade at 375px',
  },
  {
    id: 'C',
    concept: 'Feed band',
    cost: '56px at 1440px, 89px at 768px, 179px at 375px',
    exposure: 'On scroll past, then gone',
    legibility:
      'All ten at every width — ten columns wide, five then three as it narrows',
    mobile: 'Good — wraps under the lockup',
  },
  {
    id: 'D',
    concept: 'Card slot',
    cost: 'One post card — 406px at 1440px',
    exposure: 'On scroll past, then gone',
    legibility: 'All ten — two-column grid, no clipping',
    mobile: 'Good — full-width card',
  },
  {
    id: 'E',
    concept: 'Side rail',
    cost: 'None',
    exposure: 'Whole session, in the periphery',
    legibility: 'All ten — two-column grid',
    mobile: 'Absent — no rail below laptop',
  },
];

const Cell = ({ children }: { children: ReactNode }): ReactElement => (
  <td className="border-b border-border-subtlest-tertiary px-3 py-3 align-top text-text-secondary typo-footnote">
    {children}
  </td>
);

const Head = ({ children }: { children: ReactNode }): ReactElement => (
  <th className="border-b border-border-subtlest-tertiary px-3 py-2 text-left font-bold text-text-primary typo-caption1">
    {children}
  </th>
);

export const Evaluation: Story = {
  render: () => (
    <ExtensionProviders>
      <Page>
        <div className="mx-auto flex max-w-[64rem] flex-col gap-6 p-6">
          <div>
            <h1 className="font-bold text-text-primary typo-title2">
              Sponsored strip — how it lands on the feed
            </h1>
            <p className="mt-2 text-text-tertiary typo-callout">
              One presenting sponsor plus ten partner logos, in five placements.
              The columns below are geometry, measured off these very stories at
              375px and 1440px. They are not performance data — nothing here has
              been A/B tested.
            </p>
          </div>

          <table className="w-full border-collapse text-left">
            <thead>
              <tr>
                <Head>Concept</Head>
                <Head>Feed it costs</Head>
                <Head>Exposure</Head>
                <Head>10 logos legible?</Head>
                <Head>Mobile / narrow</Head>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.id}>
                  <Cell>
                    <span className="font-bold text-text-primary">
                      {row.id} · {row.concept}
                    </span>
                  </Cell>
                  <Cell>{row.cost}</Cell>
                  <Cell>{row.exposure}</Cell>
                  <Cell>{row.legibility}</Cell>
                  <Cell>{row.mobile}</Cell>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex flex-col gap-3 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-5">
            <h2 className="font-bold text-text-primary typo-callout">
              What the reference does that a feed cannot
            </h2>
            <p className="text-text-secondary typo-footnote">
              A broadcast lower third is free real estate: the video is already
              letterboxed, and a viewer who is watching is not reading. A pinned
              rail on the new tab spends feed on every session instead, and a
              moving ticker spends attention on every session — which is why
              every concept here is static, and why only A and E persist.
            </p>
            <h2 className="mt-2 font-bold text-text-primary typo-callout">
              Where the ten-logo wall breaks
            </h2>
            <p className="text-text-secondary typo-footnote">
              The wall is spread with `justify-between`, so a wide new tab hands
              the slack to the gaps rather than stacking the logos on the left.
              At a 16px cap their own ink measures a 746px minimum run, and the
              “Made possible by” lockup takes another 210px, so a rail needs
              about 1090px of viewport before the last mark reaches the fade —
              below that the rails quietly show fewer slots than were sold, and
              at 375px the lockup alone leaves none of them clear of it. Some of
              that is the copy: a shorter label buys back real estate the wall
              can use. The rest is the price of legible logos: dropping the cap
              to 13px buys back about 120px of it, at marks small enough to be
              decoration. The wrapping concepts (C, D, E) hold all ten at every
              width instead. If the inventory has to be exactly ten on one line,
              the rails need a smaller cap height or fewer slots — not a
              marquee.
            </p>
            <h2 className="mt-2 font-bold text-text-primary typo-callout">
              The asset spec matters more than the layout
            </h2>
            <p className="text-text-secondary typo-footnote">
              Every concept renders logos as silhouettes so one asset works in
              both themes. That only holds if the file is a clean vector: in the
              current advertiser library 31 of 66 wordmarks are raster images
              wrapped in an .svg and mask to a solid block, and several more
              carry knockouts that fill in. See the LogoTreatment story. Whoever
              sells this slot needs a single-colour vector in the spec.
            </p>
            <h2 className="mt-2 font-bold text-text-primary typo-callout">
              Suggested pairing
            </h2>
            <p className="text-text-secondary typo-footnote">
              C or D for the partner wall, since they hold all ten and give the
              space back on scroll, with the lead sponsor also carried in E
              where the rail exists. A is the only option that guarantees a
              session-long impression, and the only one that never returns the
              pixels — worth testing against the header-ad experiment rather
              than shipping alongside it.
            </p>
          </div>
        </div>
      </Page>
    </ExtensionProviders>
  ),
};
