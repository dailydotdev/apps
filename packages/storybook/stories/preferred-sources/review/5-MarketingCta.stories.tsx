import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { MarketingCtaCard } from '@dailydotdev/shared/src/components/marketing/cta/MarketingCtaCard';
import type { MarketingCta } from '@dailydotdev/shared/src/components/marketing/cta/common';
import { MarketingCtaVariant } from '@dailydotdev/shared/src/components/marketing/cta/common';
import { ArticleGrid } from '@dailydotdev/shared/src/components/cards/article/ArticleGrid';
import { getPreferredSourceUrl } from '@dailydotdev/shared/src/lib/preferredSources';
import { ReviewProviders, reviewPost } from './_providers';
import { feedPosts, cardHandlers } from './_feed';

type Args = { variant: 'card' };

/**
 * The marketing-CTA route — the same delivery the CV and reminder campaigns
 * already use, so this one ships with **no app code at all**.
 *
 * The whole thing is a Customer.io campaign: `flags` below are the fields the
 * campaign sets, and `CTAButton` renders them as a plain
 * `<a href={ctaUrl} target="_blank">`. Google's deeplink is an ordinary URL,
 * so it needs none of the publisher script the in-app placements depend on —
 * which is also why this one works on iOS and Android, where the script does
 * not run.
 *
 * The only constraint worth remembering: `tagColor` is not free-form. The map
 * in `marketing/cta/common.tsx` accepts `avocado` and `cabbage`; anything else
 * silently falls back to avocado.
 */
const preferredSourceCampaign: MarketingCta = {
  campaignId: 'preferred-source-google',
  createdAt: new Date(),
  variant: MarketingCtaVariant.Card,
  flags: {
    title: 'See daily.dev in your Google results',
    description:
      'Add daily.dev as a preferred source and the posts you already read show up more often in Top Stories and AI Overviews.',
    // Local copy so the mock-up renders. The campaign points at the hosted
    // asset — upload `packages/storybook/public/preferred-source-cover.png`
    // to Cloudinary and paste that URL into Customer.io instead.
    image: '/preferred-source-cover.png',
    tagText: 'New',
    tagColor: 'cabbage',
    ctaUrl: getPreferredSourceUrl('daily.dev'),
    ctaText: 'Add as preferred source',
  },
  targets: { webapp: true, extension: true, ios: true, android: true },
};

const meta: Meta<Args> = {
  title: 'Preferred Sources/Review/5. Marketing CTA (Customer.io)',
  args: { variant: 'card' },
  parameters: { layout: 'fullscreen' },
  render: () => (
    <ReviewProviders loggedIn>
      <div className="min-h-screen bg-background-default px-4 pt-6 text-text-primary">
        <div
          className="mx-auto grid max-w-[calc(20rem*3+2rem*2)] grid-cols-1 gap-8 tablet:grid-cols-2 laptop:grid-cols-3"
          style={
            { '--num-cards': 3, '--feed-gap': '2rem' } as React.CSSProperties
          }
        >
          <ArticleGrid post={reviewPost} {...cardHandlers} />
          <MarketingCtaCard marketingCta={preferredSourceCampaign} />
          <ArticleGrid post={feedPosts[0]} {...cardHandlers} />
        </div>
      </div>
    </ReviewProviders>
  ),
};

export default meta;

export const Card: StoryObj<Args> = { args: { variant: 'card' } };
