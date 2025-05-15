'use client';

import React from 'react';
import type { ReactElement } from 'react';
import classNames from 'classnames';
import Head from 'next/head';
import { StepHeadline } from '../../shared';
import type { FunnelStepFact } from '../../types/funnel';
import { FunnelStepTransitionType } from '../../types/funnel';
import { FunnelStepCtaWrapper } from '../../shared/FunnelStepCtaWrapper';
import { LazyImage } from '../../../../components/LazyImage';

export const FunnelFactDefault = ({
  parameters,
  onTransition,
}: FunnelStepFact): ReactElement => {
  const isLayoutReversed =
    parameters.layout === 'reversed' || parameters.reverse;

  return (
    <FunnelStepCtaWrapper
      containerClassName="flex"
      cta={{ label: parameters?.cta ?? 'Next' }}
      onClick={() =>
        onTransition({
          type: FunnelStepTransitionType.Complete,
        })
      }
    >
      <div
        data-testid="step-content"
        className={classNames(
          'flex flex-1 items-center gap-12 px-4 pt-6 laptop:mb-10',
          isLayoutReversed
            ? 'flex-col-reverse justify-end'
            : 'flex-col justify-between',
        )}
      >
        <StepHeadline
          heading={parameters?.headline}
          description={parameters?.explainer}
          align={parameters?.align}
        />
        {parameters?.visualUrl && (
          <>
            <Head>
              <link rel="preload" as="image" href={parameters.visualUrl} />
            </Head>
            <LazyImage
              aria-hidden
              eager
              imgSrc={parameters?.visualUrl}
              className="h-auto w-full object-cover"
              ratio="64%"
              imgAlt="Supportive illustration for the information"
            />
          </>
        )}
      </div>
    </FunnelStepCtaWrapper>
  );
};
