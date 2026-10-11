import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { ArticleGrid } from '@dailydotdev/shared/src/components/cards/article/ArticleGrid';
import { ArticleList } from '@dailydotdev/shared/src/components/cards/article/ArticleList';
import { AdGrid } from '@dailydotdev/shared/src/components/cards/ad/AdGrid';
import { ExploreChipsBar } from '@dailydotdev/shared/src/components/feeds/ExploreChipsBar';
import {
  adWithoutCta,
  cardHandlers,
  exploreCategories,
} from '../features/feed/feedHero.mocks';
import type { HeroColumns } from './parts';
import { gridColsClass, HeroCover, Page } from './parts';
import { realAgentUpdates, realHeroPosts, realPosts } from './realData';

const viewports = {
  desktop1920: {
    name: 'Desktop · 1920',
    styles: { width: '1920px', height: '1080px' },
  },
  laptopXL1680: {
    name: 'Laptop XL · 1680',
    styles: { width: '1680px', height: '1050px' },
  },
  laptopL1440: {
    name: 'Laptop L · 1440',
    styles: { width: '1440px', height: '900px' },
  },
  laptop1280: {
    name: 'Laptop · 1280',
    styles: { width: '1280px', height: '800px' },
  },
  tablet768: {
    name: 'Tablet · 768',
    styles: { width: '768px', height: '1024px' },
  },
  mobile375: {
    name: 'Mobile · 375',
    styles: { width: '375px', height: '812px' },
  },
};

const meta: Meta = {
  title: 'Hero Cover/5. In the feed',
  parameters: { layout: 'fullscreen', viewport: { options: viewports } },
};

export default meta;

/**
 * The column count production lays the feed out on at each breakpoint, at the
 * default density (`FeedContext`), with the feed's own width at that window.
 */
const breakpoints: {
  columns: HeroColumns;
  device: string;
  viewport: keyof typeof viewports;
  note: string;
}[] = [
  {
    columns: 6,
    device: 'Desktop · 1920px',
    viewport: 'desktop1920',
    note: "Six columns. The sixth takes the next story as a regular card, so the row runs the grid's full width.",
  },
  {
    columns: 5,
    device: 'Laptop XL · 1680px',
    viewport: 'laptopXL1680',
    note: 'The full cover: featured, ad, agent updates, strip.',
  },
  {
    columns: 4,
    device: 'Laptop L · 1440px',
    viewport: 'laptopL1440',
    note: 'Agent updates step out. The ad and the strip keep their columns.',
  },
  {
    columns: 3,
    device: 'Laptop · 1280px',
    viewport: 'laptop1280',
    note: 'Featured and ad share the row; the strip runs under it as three bars.',
  },
  {
    columns: 2,
    device: 'Tablet · 768px',
    viewport: 'tablet768',
    note: 'The featured card takes the full row. The ad goes back to its own slot in the feed.',
  },
  {
    columns: 1,
    device: 'Mobile · 375px',
    viewport: 'mobile375',
    note: 'The list card the feed uses on phones, then the strip as a swipeable row. The ad stays in the feed.',
  },
];

const FeedBelow = ({
  columns,
  offset,
}: {
  columns: HeroColumns;
  offset: number;
}): ReactElement => {
  const isPhone = columns === 1;
  const posts = realPosts.slice(offset, offset + (isPhone ? 4 : columns * 2));
  const cards = posts.map((post) =>
    isPhone ? (
      <ArticleList key={post.id} post={post} {...cardHandlers} />
    ) : (
      <ArticleGrid key={post.id} post={post} {...cardHandlers} />
    ),
  );

  // Below three columns the hero has no room for the ad, so the feed keeps it.
  if (columns <= 2) {
    cards.splice(
      1,
      0,
      <AdGrid key="ad" ad={adWithoutCta} index={1} feedIndex={1} />,
    );
  }

  return (
    <div
      className={classNames(
        isPhone ? 'flex flex-col' : 'grid gap-8',
        !isPhone && gridColsClass[columns],
      )}
    >
      {cards}
    </div>
  );
};

const FeedFrame = ({
  columns,
  flat,
}: {
  columns: HeroColumns;
  flat?: boolean;
}): ReactElement => {
  const isPhone = columns === 1;
  const sidePosts = columns === 6 ? realPosts.slice(0, 1) : [];

  return (
    <div>
      <div
        className={classNames(
          'flex flex-col gap-6 bg-background-default',
          // The v2 floating card the feed sits in from laptop up.
          !isPhone &&
            'rounded-24 border border-border-subtlest-quaternary p-6 [&_article:hover]:!border-border-subtlest-tertiary [&_article]:!border-border-subtlest-quaternary',
        )}
      >
        <HeroCover
          columns={columns}
          posts={realHeroPosts}
          updates={realAgentUpdates}
          sidePosts={sidePosts}
          flat={flat}
        />
        <ExploreChipsBar categories={exploreCategories} />
        <FeedBelow columns={columns} offset={sidePosts.length} />
      </div>
    </div>
  );
};

const breakpointStory = (columns: HeroColumns, flat = false): StoryObj => {
  const breakpoint = breakpoints.find((item) => item.columns === columns)!;

  return {
    name: `${breakpoint.device}${flat ? ' · flat' : ''}`,
    globals: { viewport: { value: breakpoint.viewport, isRotated: false } },
    render: () => (
      <Page
        chapter="5"
        question="How does the cover sit on the real feed?"
        title={breakpoint.device}
        goal={breakpoint.note}
        metric="Nothing to measure yet: these pages sign off the layout rules in chapter 4 against real content."
      >
        <FeedFrame columns={columns} flat={flat} />
      </Page>
    ),
  };
};

// Real data, snapshotted from production on 11 October 2026: the carousel is
// what feedHero served, the feed is Popular as an anonymous reader saw it, and
// agent updates are the agents highlights channel with each post's summary.
export const Desktop = breakpointStory(6);
export const LaptopXL = breakpointStory(5);
export const LaptopL = breakpointStory(4);
export const Laptop = breakpointStory(3);
export const Tablet = breakpointStory(2);
export const Mobile = breakpointStory(1);
export const LaptopXLFlat = breakpointStory(5, true);
