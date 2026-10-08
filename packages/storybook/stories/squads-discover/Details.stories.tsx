import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { PlaceholderSquadListList } from '@dailydotdev/shared/src/components/cards/squad/PlaceholderSquadList';
import { PlaceholderSquadGridList } from '@dailydotdev/shared/src/components/cards/squad/PlaceholderSquadGrid';
import { SearchField } from '@dailydotdev/shared/src/components/fields/SearchField';
import { Callout, DocPage, DocSection } from './doc';
import { JoinButton, JoinProvider, JoinToastHost, SquadRow } from './kit';
import { ImageCard, arrowLooks } from './featured';
import { PackRow } from './packs';
import { Device, DevicePair } from './shell';
import {
  SquadSearchDemo,
  squadSearchHandlers,
  verifiedPromotedSearchHandlers,
} from './search';
import { grouped, slotsFor } from './parts';
import { CategoryHub } from './layouts/CategoryHub';
import type { ArrowLook } from './kit';
import { PromotedKind, promotedByKind, squad, starterPacks } from './data';

const promoted = (kind: PromotedKind) => promotedByKind[kind];

const kinds = [
  PromotedKind.Verified,
  PromotedKind.Featured,
  PromotedKind.VerifiedFeatured,
  PromotedKind.Regular,
];

const meta: Meta = {
  title: 'Squads Discover/3. Details',
  parameters: { layout: 'fullscreen' },
  globals: { theme: 'dark' },
};

export default meta;

const Stage = ({
  label,
  children,
  className = 'w-80',
}: {
  label: string;
  children: ReactNode;
  className?: string;
}): ReactElement => (
  <div className="flex flex-col gap-2">
    <span className="font-bold text-text-tertiary typo-caption1">{label}</span>
    <div className={className}>{children}</div>
  </div>
);

const Sandbox = ({ children }: { children: ReactNode }): ReactElement => (
  <JoinProvider initial={[]}>
    <div className="relative">
      {children}
      <JoinToastHost className="!absolute !top-0" />
    </div>
  </JoinProvider>
);

/* ----------------------------------------------------------- promoted */

const slotRows = [
  {
    layout: 'Today',
    where: 'First card of the Featured row (the first item in the phone list)',
    per: '1 per page view, only if Featured loads',
  },
  {
    layout: 'Discover tab',
    where:
      'The 2nd tile of the Featured mosaic (a featured campaign) and the 2nd row of Trending',
    per: '2 per page view',
  },
  {
    layout: 'A topic or Featured tab',
    where:
      'The 2nd community row of the list (after the verified group), plus a second campaign: the Promoted widget from laptop, the first row after the starter pack below it',
    per: '2 per tab opened, at every width',
  },
  {
    layout: 'My Squads tab',
    where: 'The Promoted widget, from laptop',
    per: '1 from laptop, none on phones',
  },
];

export const Promoted: StoryObj = {
  name: 'Promoted squads',
  render: () => (
    <DocPage
      eyebrow="Monetization"
      title="Promoted squads: a better slot, clearly labelled"
      intro={
        <>
          <p>
            Today a boosted squad gets one slot, the first card of the Featured
            row. That is the only row most people see, but it is also a
            carousel, and promotion only fills it when the ad query resolves.
            Plus members never see it.
          </p>
          <p>
            Every surface uses the same card for promoted and organic squads
            (native, so nobody skims past it) and the same disclosure: the word
            first, before the name&apos;s meta, in the colour of the line it
            opens, never hidden in a tooltip. The word itself
            (&quot;Promoted&quot; or &quot;Ad&quot;) should follow the running{' '}
            <code>ad_label</code> experiment rather than be decided here.
          </p>
        </>
      }
    >
      <DocSection
        title="Four kinds of promoted squad, one treatment"
        lead="A boosted squad can be a Verified Company Squad, a squad the team also featured, a verified squad that is also featured, or a regular community squad. All four take the same slot and the same label, and keep what they already are: verified keeps its seal, featured squads, boosted or not, appear only in the Featured area, so a featured campaign takes the second tile of the Featured mosaic and never shows in the lists below. Same card as organic squads, no outline or colour, and the label as the first word of the meta line on rows. Readers recognise 'Sponsored' about 7x more often than 'Presented by', and the FTC guide calls 'Promoted' potentially unclear, which is one more reason to let the ad_label experiment pick the word."
      >
        <Sandbox>
          <div className="flex flex-col gap-8">
            <div className="flex flex-wrap items-start gap-8">
              <Stage
                label="Featured mosaic · a featured campaign"
                className="h-56 w-80"
              >
                <ImageCard
                  slot={{
                    squad: promoted(PromotedKind.Featured),
                    promoted: true,
                  }}
                  size="large"
                  className="size-full"
                />
              </Stage>
              <Stage
                label="Featured mosaic · verified and featured"
                className="aspect-square w-56"
              >
                <ImageCard
                  slot={{
                    squad: promoted(PromotedKind.VerifiedFeatured),
                    promoted: true,
                  }}
                  size="small"
                  className="size-full"
                />
              </Stage>
            </div>
            <div className="flex flex-wrap items-start gap-8">
              <Stage
                label="Row with description · topic lists"
                className="w-[26rem]"
              >
                {kinds.map((kind) => (
                  <SquadRow
                    key={kind}
                    squad={promoted(kind)}
                    promoted
                    description
                    size="large"
                  />
                ))}
              </Stage>
              <Stage
                label="Compact row · Trending, widgets"
                className="w-[22rem]"
              >
                {kinds.map((kind) => (
                  <SquadRow key={kind} squad={promoted(kind)} promoted />
                ))}
              </Stage>
            </div>
          </div>
        </Sandbox>
      </DocSection>

      <DocSection title="Where the slot sits">
        <div className="overflow-hidden rounded-16 border border-border-subtlest-tertiary">
          <table className="w-full text-left typo-callout">
            <thead className="bg-surface-float text-text-tertiary typo-footnote">
              <tr>
                <th className="px-4 py-2">Surface</th>
                <th className="px-4 py-2">Slot</th>
                <th className="px-4 py-2">Inventory</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtlest-quaternary">
              {slotRows.map((row) => (
                <tr key={row.layout}>
                  <td className="px-4 py-3 font-bold">{row.layout}</td>
                  <td className="px-4 py-3 text-text-secondary">{row.where}</td>
                  <td className="px-4 py-3 text-text-secondary">{row.per}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DocSection>

      <div className="grid grid-cols-1 gap-4 laptop:grid-cols-3">
        <Callout title="Placement rules">
          <ul className="flex list-disc flex-col gap-1 pl-5">
            <li>Second position, never first: the first item earns trust.</li>
            <li>At most one promoted squad per screen, never two in a row.</li>
            <li>Don&apos;t show it to people who already joined.</li>
            <li>
              The organic copy of a promoted squad is removed from the list.
            </li>
            <li>Target by chip: an AI campaign on AI and For you only.</li>
          </ul>
        </Callout>
        <Callout title="Small-squad problem">
          A promoted brand squad is often new (Infisical has 4 members). &quot;4
          members&quot; next to &quot;Promoted&quot; reads as a warning. Below
          50 members, cards say &quot;New Squad&quot; instead (see{' '}
          <code>NEW_SQUAD_MEMBER_THRESHOLD</code> in the kit), and the sponsor
          brings the banner and description.
        </Callout>
        <Callout title="What sponsors get reported">
          Impressions, IAB viewable impressions (<code>AdViewability</code>) and
          opens are logged today, and a Join inside the promoted card already
          carries the generation id through <code>LogExtraContext</code>. Put
          joins in the sponsor report next to opens, because a join is the
          outcome a squad owner is paying for.
        </Callout>
      </div>
    </DocPage>
  ),
};

/* ------------------------------------------------------------ states */

const JoinStates = (): ReactElement => (
  <JoinProvider initial={[]}>
    <div className="flex flex-wrap items-end gap-8">
      <Stage label="Join (Primary)" className="w-auto">
        <JoinButton squad={squad('nextjs')} />
      </Stage>
      <Stage
        label="Banned from the Squad (disabled, tooltip)"
        className="w-auto"
      >
        <JoinButton squad={squad('mlnews')} />
      </Stage>
    </div>
  </JoinProvider>
);

export const States: StoryObj = {
  name: 'Components & states',
  render: () => (
    <DocPage
      eyebrow="Components"
      title="Cards and join states"
      intro={
        <p>
          The chosen design is built from five cards and one Join button, using
          the design system&apos;s Button, Typography, Image, ProfilePicture,
          the verified badge and the production toast. Nothing here needs a new
          primitive.
        </p>
      }
    >
      <DocSection
        title="The cards"
        lead="Every surface is built from these. One row everywhere: with its description it lists squads on the inner pages, without it it carries Trending and the widgets; the mosaic tiles carry Featured; the pack row is every starter pack."
      >
        <Sandbox>
          <div className="flex flex-col gap-8">
            <div className="flex flex-wrap items-start gap-8">
              <Stage label="Mosaic · lead tile" className="h-64 w-96">
                <ImageCard
                  slot={{ squad: squad('opensourcesquad'), promoted: false }}
                  size="large"
                  className="size-full"
                />
              </Stage>
              <Stage label="Mosaic · small tile" className="aspect-square w-56">
                <ImageCard
                  slot={{ squad: squad('game_developers'), promoted: false }}
                  size="small"
                  className="size-full"
                />
              </Stage>
            </div>
            <div className="flex flex-wrap items-start gap-8">
              <Stage
                label="Row with description · topic lists"
                className="w-[26rem]"
              >
                <SquadRow squad={squad('nextjs')} description size="large" />
                <SquadRow squad={squad('roadmap')} description size="large" />
              </Stage>
              <Stage
                label="Compact row · Trending, widgets"
                className="w-[22rem]"
              >
                <SquadRow squad={squad('nextjs')} />
                <SquadRow squad={squad('ai')} />
                <SquadRow squad={squad('lpython')} />
              </Stage>
              <Stage label="Pack row · starter packs" className="w-[26rem]">
                <ul>
                  <PackRow pack={starterPacks[0]} />
                </ul>
              </Stage>
            </div>
          </div>
        </Sandbox>
      </DocSection>

      <DocSection
        title="Join: instant and reversible"
        lead="Join changes state immediately (optimistic, as SquadActionButton already does), shows a toast with Undo instead of a confirmation dialog. Once joined, a row drops its button; leaving happens on the Squad's own page."
      >
        <Sandbox>
          <div className="flex flex-col gap-8">
            <JoinStates />
          </div>
        </Sandbox>
      </DocSection>

      <DocSection
        title="Loading and empty"
        lead="Production skeletons, matched to the new cards. A search with no results suggests another word or the topics."
      >
        <div className="grid grid-cols-1 gap-8 laptop:grid-cols-3">
          <Stage
            label="Phone loading (PlaceholderSquadList)"
            className="w-full"
          >
            <div className="flex flex-col gap-3">
              <PlaceholderSquadListList />
            </div>
          </Stage>
          <Stage label="Card loading (PlaceholderSquadGrid)" className="w-full">
            <div className="flex gap-4 overflow-hidden">
              <PlaceholderSquadGridList className="w-60" />
            </div>
          </Stage>
          <Stage label="No results" className="w-full">
            <div className="flex flex-col items-center gap-3 rounded-16 border border-border-subtlest-tertiary p-6 text-center">
              <SearchField
                inputId="no-results"
                placeholder="Search Squads"
                value="htmx"
                readOnly
                fieldSize="medium"
                className="w-full"
                isFloating
              />
              <strong className="typo-body">
                No Squads for &quot;htmx&quot; yet
              </strong>
              <span className="text-text-tertiary typo-callout">
                Try another word, or browse the topics.
              </span>
            </div>
          </Stage>
        </div>
      </DocSection>

      <DocSection
        title="A topic in action"
        lead="The topic hub on the AI tab, in the squad page frame: Verified Company Squads under their own label, the AI campaign in the second community slot, the rest by members, the topic's own starter pack opening the list, and the other packs in the widget column."
      >
        <DevicePair render={() => <CategoryHub initialCategory="ai" />} />
      </DocSection>
    </DocPage>
  ),
};

/* ------------------------------------------------------------ verified */

const TopicRows = ({ chip }: { chip: string }): ReactElement => (
  <div className="flex flex-col">
    {slotsFor(chip, 7).map((slot) =>
      grouped(slot, <SquadRow squad={slot.squad} promoted={slot.promoted} />),
    )}
  </div>
);

export const FeaturedArrows: StoryObj = {
  name: 'Featured arrows',
  render: () => (
    <DocPage
      eyebrow="Featured carousel"
      title="Arrow looks"
      intro={
        <p>
          Today&apos;s white Primary circle is the brightest thing on the page
          and competes with the banners it sits on. Four quieter options, each
          on the real mosaic, held on a middle block so both arrows show. Arrows
          appear from laptop; phones and tablets swipe.
        </p>
      }
    >
      {(Object.keys(arrowLooks) as ArrowLook[]).map((look) => (
        <DocSection
          key={look}
          title={arrowLooks[look].label}
          lead={arrowLooks[look].note}
        >
          <Device
            fit
            width={1440}
            height={560}
            preview={{
              arrowLook: look,
              featuredAt: 'middle',
              autoAdvance: false,
            }}
          >
            <CategoryHub />
          </Device>
        </DocSection>
      ))}
    </DocPage>
  ),
};

export const Verified: StoryObj = {
  name: 'Verified company Squads',
  render: () => (
    <DocPage
      eyebrow="Verified company Squads"
      title="Keep the verified lead, and say why it's there"
      intro={
        <>
          <p>
            A Verified Company Squad is a company&apos;s official, paid home on
            daily.dev. Its seal shows in the directory, search, post pages and
            tool pages, and the docs promise that{' '}
            <q>verified Squads rank ahead of regular ones</q> when browsing the
            directory. So the lead is a product promise, not a sorting bug, and
            every layout here keeps it.
          </p>
          <p>
            The problem is that nothing on today&apos;s page explains it: AI
            opens with a 14-member squad above a 30K community, and it reads
            like a broken ranking. The fix is a label, not a re-sort.
          </p>
        </>
      }
    >
      <DocSection
        title="On a topic: a labelled group, then everyone else"
        lead="Verified company Squads lead under their own label; each keeps its seal on its own row. A promoted squad never splits the group: it takes the second community slot. Squads under 50 members say “New Squad” instead of a small number."
      >
        <Sandbox>
          <div className="flex flex-wrap items-start gap-8">
            <Stage label="AI" className="w-[22rem]">
              <TopicRows chip="ai" />
            </Stage>
            <Stage label="DevOps & Cloud" className="w-[22rem]">
              <TopicRows chip="devops-cloud" />
            </Stage>
            <Stage label="DevTools (no verified squads)" className="w-[22rem]">
              <TopicRows chip="devtools" />
            </Stage>
          </div>
        </Sandbox>
      </DocSection>
      <div className="grid grid-cols-1 gap-4 laptop:grid-cols-3">
        <Callout title="Where the lead applies">
          Topic views, as the docs describe for directory browsing. Trending is
          not a topic view, so it stays ordered by joins this week.
        </Callout>
        <Callout title="To confirm with product">
          Should verified squads also lead Trending? It is a ranking by
          definition, so here it stays purely by joins. If the paid promise
          covers it too, apply the same group label there.
        </Callout>
        <Callout title="Verified and promoted, or featured">
          A verified squad can also buy a boost. It shows once, in the promoted
          slot, with both the seal and the Promoted label, and its organic copy
          in the verified group is removed. A verified squad that is also
          featured lives in the Featured area with its seal, like every featured
          squad, and is not repeated in its topic&apos;s verified group.
        </Callout>
      </div>
      <p className="text-text-quaternary typo-footnote">
        Source: docs.daily.dev/verified-company-squads
      </p>
    </DocPage>
  ),
};

/* -------------------------------------------------------------- search */

const searchStory = (query?: string, phone = false): StoryObj => ({
  parameters: {
    msw: { handlers: squadSearchHandlers },
    docs: {
      description: {
        story:
          'Production Spotlight, opened from the page’s search button already scoped to Squads. Backspace on an empty field removes the Squads pill and widens to all of daily.dev; the rail’s search and ⌘K open it unscoped, as in production. Squads come from the public directory fixture; actions, posts, people and tags are a small hand-written sample with made-up people.',
      },
    },
  },
  ...(phone && { globals: { viewport: { value: 'mobile2' } } }),
  render: () => <SquadSearchDemo query={query} />,
});

// Names on the story objects themselves: the sidebar index reads them
// statically, so a name set inside searchStory would not show.
export const SearchDesktop: StoryObj = {
  ...searchStory(),
  name: 'Search · desktop',
};
export const SearchDesktopTyped: StoryObj = {
  ...searchStory('react'),
  name: 'Search · desktop, typed "react"',
};
export const SearchPhone: StoryObj = {
  ...searchStory(undefined, true),
  name: 'Search · phone',
};

export const SearchVerifiedPromotedToday: StoryObj = {
  name: 'Search · verified and promoted (today)',
  parameters: {
    msw: { handlers: verifiedPromotedSearchHandlers(false) },
    docs: {
      description: {
        story:
          'How production Spotlight shows Squads today. A verified Squad gets the seal after its name (AgentField.ai, Ahurasense). Search has no promoted placement, so a campaign (builder.io, Ahurasense) looks like any other result.',
      },
    },
  },
  render: () => <SquadSearchDemo query="ai" />,
};

export const SearchVerifiedPromotedProposal: StoryObj = {
  name: 'Search · verified and promoted (proposal)',
  parameters: {
    msw: { handlers: verifiedPromotedSearchHandlers(true) },
    docs: {
      description: {
        story:
          'The proposal: a campaign that matches the search keeps its place by relevance, and its handle line opens with "Promoted", as on every other surface. A verified campaign shows both the seal and the label.',
      },
    },
  },
  render: () => <SquadSearchDemo query="ai" />,
};
