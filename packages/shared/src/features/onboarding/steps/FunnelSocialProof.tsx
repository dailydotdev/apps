import React from 'react';
import type { ReactElement } from 'react';
import Head from 'next/head';
import { FunnelStepCtaWrapper, Reviews } from '../shared';
import type { FunnelStepSocialProof } from '../types/funnel';
import { FunnelStepTransitionType } from '../types/funnel';
import { LazyImage } from '../../../components/LazyImage';

export const FunnelSocialProof = ({
  onTransition,
  parameters,
}: FunnelStepSocialProof): ReactElement => {
  const {
    imageUrl,
    rating,
    reviews,
    reviewSubtitle,
    cta = 'Next',
  } = parameters;
  return (
    <FunnelStepCtaWrapper
      onClick={() =>
        onTransition({
          type: FunnelStepTransitionType.Complete,
        })
      }
      cta={{ label: cta }}
    >
      <div className="flex flex-col gap-4 py-6">
        <Head>
          <link rel="preload" as="image" href={imageUrl} />
        </Head>
        <LazyImage
          aria-hidden
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
  );
};
