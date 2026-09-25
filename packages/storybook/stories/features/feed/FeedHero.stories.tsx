import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { fn } from 'storybook/test';
import { ArticleGrid } from '@dailydotdev/shared/src/components/cards/article/ArticleGrid';
import { ExploreChipsBar } from '@dailydotdev/shared/src/components/feeds/ExploreChipsBar';
import { FeedHeroAdCard } from '@dailydotdev/shared/src/components/feeds/hero/FeedHeroAdCard';
import { FeedHeroCarousel } from '@dailydotdev/shared/src/components/feeds/hero/FeedHeroCarousel';
import { FeedHeroSection } from '@dailydotdev/shared/src/components/feeds/hero/FeedHeroSection';
import { feedHeroShape } from '@dailydotdev/shared/src/components/feeds/hero/feedHeroShape';
import {
  adWithLongCopy,
  adWithoutAdvertiser,
  adWithoutCta,
  adWithoutImage,
  adWithoutTags,
  cardHandlers,
  exploreCategories,
  feedPosts,
  FeedHeroProviders,
  heroAd,
  heroPosts,
  highlights,
  longTitleHeroPost,
  mixedTypeHeroPosts,
  noImageHeroPost,
  readHeroPost,
} from './feedHero.mocks';

const Page = ({ children }: { children: ReactNode }): ReactElement => (
  <FeedHeroProviders>
    <div className="min-h-screen bg-background-default p-4 laptop:p-8">
      {/* A four-card feed, the narrowest one the ad column appears in. */}
      <div className="mx-auto flex max-w-[91rem] flex-col gap-8">
        {children}
      </div>
    </div>
  </FeedHeroProviders>
);

const Case = ({
  title,
  note,
  width,
  children,
}: {
  title: string;
  note?: string;
  width?: string;
  children: ReactNode;
}): ReactElement => (
  <section className="flex flex-col gap-2">
    <h3 className="font-bold text-text-primary typo-callout">{title}</h3>
    {!!note && <p className="text-text-tertiary typo-footnote">{note}</p>}
    <div style={width ? { width, maxWidth: '100%' } : undefined}>
      {children}
    </div>
  </section>
);

const FeedGrid = (): ReactElement => (
  <div className="grid grid-cols-1 gap-6 tablet:grid-cols-2 laptop:grid-cols-3">
    {feedPosts.map((post) => (
      <ArticleGrid key={post.id} post={post} {...cardHandlers} />
    ))}
  </div>
);

const meta: Meta = {
  title: 'Features/Feed/Hero',
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

type Story = StoryObj;

export const FullLayout: Story = {
  name: 'Hero + all posts',
  render: () => (
    <Page>
      <FeedHeroSection
        posts={heroPosts}
        highlights={highlights}
        ad={heroAd}
        adPlacement="column"
        shape={feedHeroShape(4)}
        cardProps={cardHandlers}
        onAdLinkClick={fn()}
        onHighlightClick={fn()}
        onReadAllClick={fn()}
      />
      <div className="flex flex-col gap-4">
        <ExploreChipsBar categories={exploreCategories} />
        <FeedGrid />
      </div>
    </Page>
  ),
};

export const HeroOnly: Story = {
  name: 'Hero section',
  render: () => (
    <Page>
      <FeedHeroSection
        posts={heroPosts}
        highlights={highlights}
        ad={heroAd}
        adPlacement="column"
        shape={feedHeroShape(4)}
        cardProps={cardHandlers}
      />
    </Page>
  ),
};

// The hero lays out on the feed grid's own columns, so its stage is a column
// count rather than a width — the same count the grid under it is using, which
// `FeedContext` derives from the viewport, the sidebar's state and the reader's
// card-count setting together. The widths here are only what that many columns
// come to at a typical window; the shape does not depend on them.
const FEED_STAGES = [
  {
    columns: 2,
    px: 720,
    note: 'the featured post takes one column — the feed card at its own size — and the feed below keeps the ad',
  },
  {
    columns: 3,
    px: 980,
    note: 'the featured card takes two columns and turns wide; a third for the ad would leave every column too narrow, so the feed keeps it',
  },
  {
    columns: 4,
    px: 1250,
    note: 'the ad earns a column, at the 270px the card was drawn for',
  },
  {
    columns: 5,
    px: 1560,
    note: 'the slack goes to the featured card',
  },
  {
    columns: 6,
    px: 1880,
    note: 'wide enough that the headline list earns a second column too',
  },
];

export const WideFeed: Story = {
  name: 'Hero at each stage',
  render: () => (
    <FeedHeroProviders>
      <div className="flex min-h-screen flex-col gap-10 bg-background-default p-8">
        {FEED_STAGES.map(({ columns, px, note }) => {
          const shape = feedHeroShape(columns);

          return (
            <section key={columns} className="flex flex-col gap-2">
              <h3 className="font-bold text-text-primary typo-callout">
                {columns} columns · about {px}px of feed
              </h3>
              <p className="text-text-tertiary typo-footnote">{note}</p>
              <div style={{ width: px, maxWidth: '100%' }}>
                <FeedHeroSection
                  posts={heroPosts}
                  highlights={highlights}
                  ad={adWithoutCta}
                  adPlacement={shape.adPlacement}
                  shape={shape}
                  cardProps={cardHandlers}
                />
              </div>
            </section>
          );
        })}
      </div>
    </FeedHeroProviders>
  ),
};

// Each breakpoint gets its own iframe so Tailwind's media queries resolve
// against a real viewport width, not a resized container.
const BREAKPOINTS = [
  { label: 'Mobile', width: 390, height: 900 },
  { label: 'Tablet', width: 768, height: 900 },
  { label: 'Laptop', width: 1024, height: 760 },
  { label: 'Desktop', width: 1440, height: 760 },
];

export const Responsive: Story = {
  name: 'Responsive breakpoints',
  render: (args, { globals }) => (
    <div className="flex flex-col gap-6 bg-background-default p-6">
      <p className="text-text-tertiary typo-callout">
        The four-column shape rendered at each breakpoint, so what these show is
        the section holding that shape as the window narrows — not which shape a
        window picks. That comes from the feed grid&apos;s column count, which
        no story can set from a viewport: see &ldquo;Hero at each stage&rdquo;
        for the stages themselves, and &ldquo;Hero in list view&rdquo; for the
        one-column list shape.
      </p>
      <div className="flex flex-wrap items-start gap-6">
        {BREAKPOINTS.map(({ label, width, height }) => (
          <div key={label} className="flex flex-col gap-2">
            <span className="font-bold text-text-primary typo-footnote">
              {label} · {width}px
            </span>
            <iframe
              title={`${label} preview`}
              src={`iframe.html?id=features-feed-hero--hero-only&globals=theme:${
                globals.theme ?? 'light'
              }`}
              width={width}
              height={height}
              className="rounded-16 border border-border-subtlest-tertiary"
            />
          </div>
        ))}
      </div>
    </div>
  ),
};

// Phone widths that actually ship, the narrowest one anything still has to
// work at, and a tablet — the list shape is not only a phone's.
const LIST_WIDTHS = [
  { label: 'Small phone', px: 320 },
  { label: 'iPhone', px: 390 },
  { label: 'Large phone', px: 430 },
  { label: 'Tablet', px: 720 },
];

export const TouchLayout: Story = {
  name: 'Hero in list view',
  render: () => (
    <FeedHeroProviders>
      <div className="flex min-h-screen flex-col gap-10 bg-background-default p-6">
        <p className="max-w-[40rem] text-text-tertiary typo-callout">
          Wherever the feed renders as a list — every width below laptop, and
          laptop up with list mode on — the section takes the same shape: the
          lead story as a list card, the headline list under it. Before this a
          tablet ran a two-card hero over a list, and list mode at a wide window
          ran a three-column one. There is no paging: a slide has to stop short
          of the edge for the next one to peek, which is what says “carousel”,
          and at these widths that left every card too narrow to read. The
          stories it would have paged through are the list’s first rows anyway,
          and the placement goes back to the feed.
        </p>
        {LIST_WIDTHS.map(({ label, px }) => (
          <section key={px} className="flex flex-col gap-2">
            <h3 className="font-bold text-text-primary typo-callout">
              {label} · {px}px
            </h3>
            <div
              style={{ width: px }}
              className="border border-border-subtlest-tertiary"
            >
              <FeedHeroSection
                posts={heroPosts}
                highlights={highlights.slice(1)}
                cardProps={cardHandlers}
              />
            </div>
          </section>
        ))}
      </div>
    </FeedHeroProviders>
  ),
};

export const HeroStates: Story = {
  name: 'Hero section states',
  render: () => (
    <Page>
      <Case
        title="With the ad column"
        note="The placement takes a fourth column beside the headline list."
      >
        <FeedHeroSection
          posts={heroPosts}
          highlights={highlights}
          ad={heroAd}
          adPlacement="column"
          shape={feedHeroShape(4)}
          cardProps={cardHandlers}
        />
      </Case>
      <Case
        title="No ad column"
        note="Nothing served, or a feed too narrow to seat one. The section drops to three columns and ends at the headline list; the feed below keeps its own first-row placement."
      >
        <FeedHeroSection
          posts={heroPosts}
          highlights={highlights}
          shape={feedHeroShape(3)}
          cardProps={cardHandlers}
        />
      </Case>
      <Case
        title="A single featured post"
        note="Indicators and paging controls are hidden."
      >
        <FeedHeroSection
          posts={heroPosts.slice(0, 1)}
          highlights={highlights}
          ad={heroAd}
          adPlacement="column"
          shape={feedHeroShape(4)}
          cardProps={cardHandlers}
        />
      </Case>
      <Case
        title="Headline long enough to fill the column"
        note="The summary gives up lines so the action row keeps its place instead of being clipped off the bottom of the card."
      >
        <FeedHeroSection
          posts={[longTitleHeroPost]}
          highlights={highlights}
          ad={heroAd}
          adPlacement="column"
          shape={feedHeroShape(4)}
          cardProps={cardHandlers}
        />
      </Case>
      <Case
        title="Two highlights"
        note="The list is short enough that nothing scrolls."
      >
        <FeedHeroSection
          posts={heroPosts}
          highlights={highlights.slice(0, 2)}
          ad={heroAd}
          adPlacement="column"
          shape={feedHeroShape(4)}
          cardProps={cardHandlers}
        />
      </Case>
    </Page>
  ),
};

export const Carousel: Story = {
  name: 'Carousel cases',
  render: () => (
    <Page>
      <Case
        title="Mixed post types"
        note="Page through it: article, squad share, collection and freeform each render their own featured-wide card."
      >
        <FeedHeroCarousel
          posts={mixedTypeHeroPosts}
          layout="wide"
          {...cardHandlers}
        />
      </Case>
      <Case
        title="Fast autoplay"
        note="Two seconds per slide instead of six, so the indicator fill is easy to watch. Hovering or focusing the carousel pauses it."
      >
        <FeedHeroCarousel
          posts={heroPosts}
          layout="wide"
          autoplayMs={2000}
          {...cardHandlers}
        />
      </Case>
      <Case
        title="Read and bookmarked"
        note="Carries the same read/bookmark treatment as any feed card."
      >
        <FeedHeroCarousel
          posts={[readHeroPost]}
          layout="wide"
          {...cardHandlers}
        />
      </Case>
      <Case
        title="No cover image"
        note="The card falls back to a single column."
      >
        <FeedHeroCarousel
          posts={[noImageHeroPost]}
          layout="wide"
          {...cardHandlers}
        />
      </Case>
      <Case
        title="Narrow card — cover below the copy"
        note="Under 40rem the split stops being worth it and the cover moves under the headline. The card decides this from its own width, so it holds whatever the reader's card-count setting leaves the hero."
        width="30rem"
      >
        <FeedHeroCarousel posts={heroPosts} layout="wide" {...cardHandlers} />
      </Case>
      <Case
        title="Even split"
        note="From 40rem the cover takes a column beside the copy."
        width="44rem"
      >
        <FeedHeroCarousel posts={heroPosts} layout="wide" {...cardHandlers} />
      </Case>
      <Case
        title="40/60"
        note="From 52rem the copy keeps two of five columns."
        width="60rem"
      >
        <FeedHeroCarousel posts={heroPosts} layout="wide" {...cardHandlers} />
      </Case>
    </Page>
  ),
};

export const AdPlacement: Story = {
  name: 'Ad placement cases',
  render: () => (
    <Page>
      <Case
        title="In its own column"
        note="Column width (19rem) on the section's height. Copy, then the disclosure in the headline rows' timestamp colour, then tags, then a cover that takes whatever height the copy leaves."
        width="19rem"
      >
        <div className="h-[27.5rem]">
          <FeedHeroAdCard ad={heroAd} onLinkClick={fn()} />
        </div>
      </Case>
      <Case title="No matching tags" width="19rem">
        <div className="h-[27.5rem]">
          <FeedHeroAdCard ad={adWithoutTags} onLinkClick={fn()} />
        </div>
      </Case>
      <Case
        title="No cover image"
        note="Nothing left to absorb the column's height, so the action row falls to the bottom on its own."
        width="19rem"
      >
        <div className="h-[27.5rem]">
          <FeedHeroAdCard ad={adWithoutImage} onLinkClick={fn()} />
        </div>
      </Case>
      <Case
        title="Advertiser hidden"
        note="No referral link, so the disclosure is a bare “Promoted”."
        width="19rem"
      >
        <div className="h-[27.5rem]">
          <FeedHeroAdCard ad={adWithoutAdvertiser} onLinkClick={fn()} />
        </div>
      </Case>
      <Case
        title="Long copy"
        note="Title clamps at three lines; the tag row keeps what fits."
        width="19rem"
      >
        <div className="h-[27.5rem]">
          <FeedHeroAdCard ad={adWithLongCopy} onLinkClick={fn()} />
        </div>
      </Case>
      <Case
        title="No call to action"
        note="Only “Remove” is left in the action row."
        width="19rem"
      >
        <div className="h-[27.5rem]">
          <FeedHeroAdCard ad={adWithoutCta} onLinkClick={fn()} />
        </div>
      </Case>
      <Case
        title="Auto height"
        note="Off the section's row the cover has no slack to take, so the card ends at its content instead of stretching."
        width="19rem"
      >
        <FeedHeroAdCard ad={heroAd} onLinkClick={fn()} />
      </Case>
    </Page>
  ),
};
