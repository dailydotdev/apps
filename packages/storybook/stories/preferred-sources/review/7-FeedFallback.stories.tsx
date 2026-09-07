import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { ArticleGrid } from '@dailydotdev/shared/src/components/cards/article/ArticleGrid';
import { PlaceholderGrid } from '@dailydotdev/shared/src/components/cards/placeholder/PlaceholderGrid';
import { ReviewProviders, reviewPost } from './_providers';
import { feedPosts, cardHandlers } from './_feed';
import { PreferredSearchCard } from './_PreferredSearchCard';

type Args = { variant: 'current' | 'proposed' };

/**
 * The feed's ad position when the ad server has nothing: today a grey
 * placeholder. Agreed replacement: a card that shows the reader what they
 * get — their Google results with daily.dev marked Preferred — and one
 * primary button.
 */
const meta: Meta<Args> = {
  title: 'Preferred Sources/Review/7. Feed: empty ad slot',
  args: { variant: 'proposed' },
  argTypes: {
    variant: { control: 'radio', options: ['current', 'proposed'] },
  },
  parameters: { layout: 'fullscreen' },
  render: ({ variant }) => (
    <ReviewProviders loggedIn>
      <div className="min-h-screen bg-background-default px-4 pt-6 text-text-primary laptop:px-0">
        <div
          className="mx-auto grid max-w-[calc(20rem*3+2rem*2)] grid-cols-1 gap-8 tablet:grid-cols-2 laptop:grid-cols-3"
          style={
            { '--num-cards': 3, '--feed-gap': '2rem' } as React.CSSProperties
          }
        >
          <ArticleGrid post={reviewPost} {...cardHandlers} />
          <ArticleGrid post={feedPosts[0]} {...cardHandlers} />
          {variant === 'proposed' ? (
            <PreferredSearchCard onDismiss={fn()} onAdd={fn()} />
          ) : (
            <PlaceholderGrid />
          )}
          {feedPosts.slice(1, 6).map((post) => (
            <ArticleGrid key={post.id} post={post} {...cardHandlers} />
          ))}
        </div>
      </div>
    </ReviewProviders>
  ),
};

export default meta;

export const Current: StoryObj<Args> = { args: { variant: 'current' } };
export const Proposed: StoryObj<Args> = { args: { variant: 'proposed' } };
