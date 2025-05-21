import React, { useMemo } from 'react';
import type { ReactElement } from 'react';
import classNames from 'classnames';
import Head from 'next/head';
import { StepHeadline } from '../../shared';
import type { FunnelStepFact } from '../../types/funnel';
import { FunnelStepTransitionType } from '../../types/funnel';
import { FunnelStepCtaWrapper } from '../../shared/FunnelStepCtaWrapper';
import { LazyImage } from '../../../../components/LazyImage';
import { Badge } from '../../../../components/Badge';
import { ReputationLightningIcon } from '../../../../components/icons';
import { useIsLightTheme } from '../../../../hooks/utils';

export const FunnelFactDefault = ({
  parameters,
  onTransition,
}: FunnelStepFact): ReactElement => {
  const isLightMode = useIsLightTheme();

  const image = isLightMode
    ? parameters?.visualUrlLightMode
    : parameters?.visualUrl;
  const fallbackImage = parameters?.visualUrl || parameters?.visualUrlLightMode;

  const isLayoutReversed =
    parameters.layout === 'reversed' || parameters.reverse;

  const { badge } = parameters;

  const badgeComponent = useMemo(() => {
    if (!badge?.cta) {
      return null;
    }
    return (
      <Badge
        label={badge.cta}
        icon={<ReputationLightningIcon className="h-6 w-6" secondary />}
        variant={badge.variant}
      />
    );
  }, [badge?.cta, badge?.variant]);

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
        <div className="flex flex-col items-center gap-4">
          {badge?.placement === 'top' && badgeComponent}
          <StepHeadline
            heading={parameters?.headline}
            description={parameters?.explainer}
            align={parameters?.align}
          />
          {badge?.placement === 'bottom' && badgeComponent}
        </div>
        {parameters?.visualUrl && (
          <>
            <Head>
              <link rel="preload" as="image" href={parameters.visualUrl} />
            </Head>
            <LazyImage
              aria-hidden
              eager
              imgSrc={image}
              fallbackSrc={fallbackImage}
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
