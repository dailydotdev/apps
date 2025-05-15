import React from 'react';
import type { ReactElement } from 'react';
import classNames from 'classnames';
import Head from 'next/head';
import { StepHeadline } from '../../shared';
import type { FunnelStepFact } from '../../types/funnel';
import { LazyImage } from '../../../../components/LazyImage';
import { FunnelFactWrapper } from './FunnelFactWrapper';

export const FunnelFactDefault = (props: FunnelStepFact): ReactElement => {
  const { parameters } = props;
  const isLayoutReversed =
    parameters.layout === 'reversed' || parameters.reverse;

  return (
    <FunnelFactWrapper {...props}>
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
    </FunnelFactWrapper>
  );
};
