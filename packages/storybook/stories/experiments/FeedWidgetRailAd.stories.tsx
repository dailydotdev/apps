import type { ReactElement } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { Ad } from '@dailydotdev/shared/src/graphql/posts';
import {
  adImprovementsV3Feature,
  featureAutorotateAds,
  featureGridCardTldr,
} from '@dailydotdev/shared/src/lib/featureManagement';
import { FeedWidgetAdSlot } from '@dailydotdev/shared/src/features/feedWidgets/widgets/FeedWidgetAdSlot';
import { RAIL_HEIGHT } from '@dailydotdev/shared/src/features/feedWidgets/FeedWidgetRailFrame';
import { FeatureOverrides } from '../../mock/GrowthBookProvider';
import { AdProviders, baseAd, Page, Section } from './adLabel.mocks';

// ---------------------------------------------------------------------------
// The ad in the feed widget rail. The rail has a fixed height (a feed card
// with a three-line title), so the ad card has to fit it whatever the copy:
// a long title with the v3 tag row must not push the actions out of the card.
// ---------------------------------------------------------------------------

const longTaggedAd: Ad = {
  ...baseAd,
  callToAction: undefined,
  description:
    'Meet the free framework for building agents with rich app interfaces.',
  matchingTags: ['react', 'nestjs', 'ai-coding', 'typescript', 'agents', 'ai'],
};

const shortAd: Ad = { ...baseAd, callToAction: undefined };

const RailColumn = ({ ad, label }: { ad: Ad; label: string }): ReactElement => (
  <div className="flex flex-col gap-2">
    <span className="text-text-tertiary typo-footnote">{label}</span>
    <div className="flex w-80" style={{ height: RAIL_HEIGHT }}>
      <FeedWidgetAdSlot ad={ad} isEditing={false} className="flex-1" />
    </div>
  </div>
);

const meta: Meta = {
  title: 'Experiments/Feed widget rail ad',
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const RailAd: StoryObj = {
  name: 'Ad in the rail',
  render: () => (
    <AdProviders>
      <FeatureOverrides
        values={{
          [adImprovementsV3Feature.id]: true,
          [featureAutorotateAds.id]: 0,
          [featureGridCardTldr.id]: false,
        }}
      >
        <Page>
          <Section
            title="Ad in the feed widget rail"
            description="The rail is a fixed height, so the ad fits it: the creative gives up height when the copy runs long, so the actions stay inside the card."
          >
            <div className="flex flex-wrap items-start gap-8">
              <RailColumn ad={longTaggedAd} label="Long title + tags" />
              <RailColumn ad={shortAd} label="Short title, no tags" />
            </div>
          </Section>
        </Page>
      </FeatureOverrides>
    </AdProviders>
  ),
};
