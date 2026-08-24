import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { fn } from 'storybook/test';
import { ArticleGrid } from '@dailydotdev/shared/src/components/cards/article/ArticleGrid';
import { ExploreChipsBar } from '@dailydotdev/shared/src/components/feeds/ExploreChipsBar';
import { FeedHeroAd } from '@dailydotdev/shared/src/components/feeds/hero/FeedHeroAd';
import { FeedHeroCarousel } from '@dailydotdev/shared/src/components/feeds/hero/FeedHeroCarousel';
import { FeedHeroSection } from '@dailydotdev/shared/src/components/feeds/hero/FeedHeroSection';
import { FeedSectionToolbar } from '@dailydotdev/shared/src/components/feeds/hero/FeedSectionToolbar';
import {
  adWithLongCopy,
  adWithoutAdvertiser,
  adWithoutImage,
  adWithoutTags,
  cardHandlers,
  exploreCategories,
  feedPosts,
  FeedHeroProviders,
  heroAd,
  heroPosts,
  highlights,
  mixedTypeHeroPosts,
  noImageHeroPost,
  readHeroPost,
} from './feedHero.mocks';

const Page = ({ children }: { children: ReactNode }): ReactElement => (
  <FeedHeroProviders>
    <div className="min-h-screen bg-background-default p-4 laptop:p-8">
      <div className="mx-auto flex max-w-[80rem] flex-col gap-8">
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
        cardProps={cardHandlers}
        onAdLinkClick={fn()}
        onHighlightClick={fn()}
        onReadAllClick={fn()}
      />
      <div className="flex flex-col gap-4">
        <FeedSectionToolbar
          title="Recommended"
          searchHref="/search"
          bookmarksHref="/bookmarks"
          onFiltersClick={fn()}
        />
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
        cardProps={cardHandlers}
      />
    </Page>
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
        The same story rendered at each breakpoint. Laptop and up is the
        two-column hero; below that the rail stacks under the carousel.
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

export const HeroStates: Story = {
  name: 'Hero section states',
  render: () => (
    <Page>
      <Case title="With a direct ad placement">
        <FeedHeroSection
          posts={heroPosts}
          highlights={highlights}
          ad={heroAd}
          cardProps={cardHandlers}
        />
      </Case>
      <Case
        title="No ad to serve"
        note="The rail drops the placement and the highlights card takes the full height."
      >
        <FeedHeroSection
          posts={heroPosts}
          highlights={highlights}
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
        <FeedHeroCarousel posts={mixedTypeHeroPosts} {...cardHandlers} />
      </Case>
      <Case
        title="Fast autoplay"
        note="Two seconds per slide instead of six, so the indicator fill is easy to watch. Hovering or focusing the carousel pauses it."
      >
        <FeedHeroCarousel
          posts={heroPosts}
          autoplayMs={2000}
          {...cardHandlers}
        />
      </Case>
      <Case
        title="Read and bookmarked"
        note="Carries the same read/bookmark treatment as any feed card."
      >
        <FeedHeroCarousel posts={[readHeroPost]} {...cardHandlers} />
      </Case>
      <Case
        title="No cover image"
        note="The card falls back to a single column."
      >
        <FeedHeroCarousel posts={[noImageHeroPost]} {...cardHandlers} />
      </Case>
      <Case
        title="Wider text column"
        note="wideColSpan={3} gives the headline two thirds of the card."
      >
        <FeedHeroCarousel posts={heroPosts} wideColSpan={3} {...cardHandlers} />
      </Case>
    </Page>
  ),
};

export const AdPlacement: Story = {
  name: 'Ad placement cases',
  render: () => (
    <Page>
      <Case
        title="Advertiser, title, tags and cover"
        note="Rail width (20rem). Same elements as the feed ad card, in the same order: advertiser, title, tags, then the cover."
        width="20rem"
      >
        <FeedHeroAd ad={heroAd} onLinkClick={fn()} />
      </Case>
      <Case title="No matching tags" width="20rem">
        <FeedHeroAd ad={adWithoutTags} onLinkClick={fn()} />
      </Case>
      <Case
        title="No cover image"
        note="The copy takes the full width."
        width="20rem"
      >
        <FeedHeroAd ad={adWithoutImage} onLinkClick={fn()} />
      </Case>
      <Case
        title="Advertiser hidden"
        note="No referral link, so the disclosure is a bare “Promoted”."
        width="20rem"
      >
        <FeedHeroAd ad={adWithoutAdvertiser} onLinkClick={fn()} />
      </Case>
      <Case
        title="Long copy"
        note="Title clamps at two lines; the tag row keeps what fits."
        width="20rem"
      >
        <FeedHeroAd ad={adWithLongCopy} onLinkClick={fn()} />
      </Case>
      <Case
        title="Full-width (mobile rail)"
        note="How the placement looks once the rail stacks under the carousel."
      >
        <FeedHeroAd ad={heroAd} onLinkClick={fn()} />
      </Case>
    </Page>
  ),
};

export const Toolbar: Story = {
  name: 'Section toolbar',
  render: () => (
    <Page>
      <Case title="All actions">
        <FeedSectionToolbar
          title="Recommended"
          searchHref="/search"
          bookmarksHref="/bookmarks"
          onFiltersClick={fn()}
        />
      </Case>
      <Case title="Title only" note="Every action is opt-in.">
        <FeedSectionToolbar title="Recommended" />
      </Case>
      <Case title="With the tag chips below">
        <div className="flex flex-col gap-4">
          <FeedSectionToolbar
            title="Recommended"
            searchHref="/search"
            bookmarksHref="/bookmarks"
            onFiltersClick={fn()}
          />
          <ExploreChipsBar categories={exploreCategories} />
        </div>
      </Case>
    </Page>
  ),
};
