import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import classNames from 'classnames';
import { ArticleGrid } from '@dailydotdev/shared/src/components/cards/article/ArticleGrid';
import { TopHero } from '@dailydotdev/shared/src/components/marketing/banners/HeroBottomBanner';
import { ButtonVariant } from '@dailydotdev/shared/src/components/buttons/Button';
import { GoogleIcon } from '@dailydotdev/shared/src/components/icons';
import { ReviewProviders, reviewPost } from './_providers';
import { feedPosts, cardHandlers } from './_feed';

type Args = { variant: 'current' | 'proposed' };

/**
 * The homepage hero, in the layout-v2 top-banner slot where the reading
 * reminder and CV heroes already live (`HomepageTopBanners`). Real `TopHero`;
 * no grey label — one bold line and the button. Shown once, closes forever.
 */
const FeedHeader = () => (
  <div className="mb-4 flex items-center gap-2 border-b border-border-subtlest-tertiary pb-3">
    {['For you', 'Following', 'Popular', 'Latest'].map((tab, i) => (
      <span
        key={tab}
        className={classNames(
          'rounded-10 px-3 py-1.5 typo-callout',
          i === 0
            ? 'bg-surface-float font-bold text-text-primary'
            : 'text-text-tertiary',
        )}
      >
        {tab}
      </span>
    ))}
  </div>
);

const meta: Meta<Args> = {
  title: 'Preferred Sources/Review/6. Homepage: hero (layout v2)',
  args: { variant: 'proposed' },
  argTypes: {
    variant: { control: 'radio', options: ['current', 'proposed'] },
  },
  parameters: { layout: 'fullscreen' },
  render: ({ variant }) => (
    <ReviewProviders loggedIn>
      <div className="min-h-screen bg-background-default px-4 pt-4 text-text-primary laptop:px-8">
        {variant === 'proposed' && (
          <TopHero
            className="mb-4"
            subtitle="Add daily.dev and it shows up more often in Top Stories and AI Overviews."
            ctaLabel="Add as preferred source"
            ctaVariant={ButtonVariant.Primary}
            onCtaClick={fn()}
            onClose={fn()}
            illustration={
              <span className="flex size-24 shrink-0 items-center justify-center self-center rounded-12 bg-surface-float">
                <GoogleIcon secondary className="size-14" />
              </span>
            }
          />
        )}
        <FeedHeader />
        <div
          className="grid grid-cols-1 gap-8 tablet:grid-cols-2 laptop:grid-cols-3"
          style={
            { '--num-cards': 3, '--feed-gap': '2rem' } as React.CSSProperties
          }
        >
          <ArticleGrid post={reviewPost} {...cardHandlers} />
          {feedPosts.slice(0, 5).map((post) => (
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
