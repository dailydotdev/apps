import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement } from 'react';
import React from 'react';
import { fn } from 'storybook/test';
import { ArticleGrid } from '@dailydotdev/shared/src/components/cards/article/ArticleGrid';
import { ExploreChipsBar } from '@dailydotdev/shared/src/components/feeds/ExploreChipsBar';
import { FeedHeroSection } from '@dailydotdev/shared/src/components/feeds/hero/FeedHeroSection';
import { FeedSectionToolbar } from '@dailydotdev/shared/src/components/feeds/hero/FeedSectionToolbar';
import {
  cardHandlers,
  exploreCategories,
  feedPosts,
  FeedHeroProviders,
  heroAd,
  heroPosts,
  highlights,
} from './feedHero.mocks';

const Page = ({ children }: { children: React.ReactNode }): ReactElement => (
  <FeedHeroProviders>
    <div className="min-h-screen bg-background-default p-4 laptop:p-8">
      <div className="mx-auto flex max-w-[76rem] flex-col gap-8">
        {children}
      </div>
    </div>
  </FeedHeroProviders>
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
        exploreHref="/tags"
        cardProps={cardHandlers}
        onAdLinkClick={fn()}
        onHighlightClick={fn()}
        onReadAllClick={fn()}
      />
      <div className="flex flex-col gap-4">
        <FeedSectionToolbar
          title="All posts"
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
        exploreHref="/tags"
        cardProps={cardHandlers}
      />
    </Page>
  ),
};

export const WithoutAd: Story = {
  name: 'Hero without ad placement',
  render: () => (
    <Page>
      <FeedHeroSection
        posts={heroPosts}
        highlights={highlights}
        exploreHref="/tags"
        cardProps={cardHandlers}
      />
    </Page>
  ),
};

export const SingleHeroPost: Story = {
  name: 'Hero with a single post',
  render: () => (
    <Page>
      <FeedHeroSection
        posts={heroPosts.slice(0, 1)}
        highlights={highlights}
        ad={heroAd}
        exploreHref="/tags"
        cardProps={cardHandlers}
      />
    </Page>
  ),
};
