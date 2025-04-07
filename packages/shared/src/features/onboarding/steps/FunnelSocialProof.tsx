import React from 'react';
import type { ReactElement } from 'react';
import {
  FunnelStepBackground,
  FunnelBackgroundVariant,
} from '../shared/FunnelStepBackground';
import { FunnelStepCtaWrapper } from '../shared/FunnelStepCtaWrapper';
import { Reviews } from '../shared/Reviews';
import type { FunnelStepSocialProof } from '../types/funnel';
import { FunnelStepTransitionType } from '../types/funnel';
import { LazyImage } from '../../../components/LazyImage';

export const FunnelSocialProof = ({
  imageUrl,
  rating,
  reviews,
  reviewSubtitle,
  onTransition,
  parameters,
}: FunnelStepSocialProof): ReactElement => {
  return (
    <FunnelStepBackground variant={FunnelBackgroundVariant.Top}>
      <FunnelStepCtaWrapper
        onClick={() =>
          onTransition({
            type: FunnelStepTransitionType.Complete,
          })
        }
        cta={{ label: parameters?.cta ?? 'Next' }}
      >
        <div className="flex flex-col gap-4 py-6">
          <LazyImage
            eager
            imgSrc={imageUrl}
            imgAlt="Social proof illustration"
            className="mx-6 object-cover"
            ratio="64%"
          />
          <Reviews
            rating={rating}
            reviews={reviews}
            reviewSubtitle={reviewSubtitle}
          />
        </div>
      </FunnelStepCtaWrapper>
    </FunnelStepBackground>
  );
};
