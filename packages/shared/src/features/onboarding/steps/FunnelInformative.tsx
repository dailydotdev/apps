'use client';

import React from 'react';
import type { ReactElement } from 'react';
import classNames from 'classnames';
import type { StepHeadlineAlign } from '../shared/StepHeadline';
import StepHeadline from '../shared/StepHeadline';
import type { FunnelStepFact } from '../types/funnel';
import { FunnelStepTransitionType } from '../types/funnel';
import { FunnelStepCtaWrapper } from '../shared/FunnelStepCtaWrapper';
import {
  FunnelStepBackground,
  FunnelBackgroundVariant,
} from '../shared/FunnelStepBackground';
import { LazyImage } from '../../../components/LazyImage';

const FunnelInformative = ({
  parameters,
  onTransition,
}: FunnelStepFact): ReactElement => {
  const bgVariant = parameters?.reverse
    ? FunnelBackgroundVariant.Top
    : FunnelBackgroundVariant.Bottom;
  return (
    <FunnelStepBackground variant={bgVariant}>
      <FunnelStepCtaWrapper
        containerClassName="flex"
        onClick={() =>
          onTransition({
            type: FunnelStepTransitionType.Complete,
          })
        }
        cta={{ label: parameters?.cta ?? 'Next' }}
      >
        <div
          data-testid="informative-content"
          className={classNames(
            'flex flex-1 items-center gap-12 px-4 pt-6',
            parameters?.reverse
              ? 'flex-col-reverse justify-end'
              : 'flex-col justify-between',
          )}
        >
          <StepHeadline
            heading={parameters?.headline}
            description={parameters?.explainer}
            align={parameters?.align as StepHeadlineAlign}
          />
          {parameters?.visualUrl && (
            <LazyImage
              eager
              imgSrc={parameters?.visualUrl}
              className="h-auto w-full object-cover"
              ratio="64%"
              imgAlt="Supportive illustration for the information"
            />
          )}
        </div>
      </FunnelStepCtaWrapper>
    </FunnelStepBackground>
  );
};

export default FunnelInformative;
