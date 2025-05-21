import React, { useMemo } from 'react';
import type { ReactElement } from 'react';
import Head from 'next/head';
import { StepHeadline } from '../../shared';
import type { FunnelStepFact } from '../../types/funnel';
import { FunnelStepTransitionType } from '../../types/funnel';
import { FunnelStepCtaWrapper } from '../../shared/FunnelStepCtaWrapper';
import { LazyImage } from '../../../../components/LazyImage';
import { ReputationLightningIcon } from '../../../../components/icons';
import { Badge } from '../../../../components/Badge';
import { useIsLightTheme } from '../../../../hooks/utils';

export const FunnelFactCentered = ({
  parameters,
  onTransition,
}: FunnelStepFact): ReactElement => {
  const isLightMode = useIsLightTheme();

  const primaryImage = isLightMode
    ? parameters?.visualUrlLightMode
    : parameters?.visualUrl;

  const fallbackImage = isLightMode
    ? parameters?.visualUrl
    : parameters?.visualUrlLightMode;

  const image = primaryImage || fallbackImage;

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
      containerClassName="flex max-h-screen"
      cta={{ label: parameters?.cta ?? 'Next' }}
      onClick={() =>
        onTransition({
          type: FunnelStepTransitionType.Complete,
        })
      }
    >
      <div
        data-testid="step-content"
        className="flex flex-1 flex-col items-center justify-center gap-6 p-6 laptop:mb-10"
      >
        {image && (
          <>
            <Head>
              <link rel="preload" as="image" href={image} />
            </Head>
            <LazyImage
              aria-hidden
              eager
              imgSrc={image}
              fallbackSrc={fallbackImage}
              className="max-h-[25rem] w-full flex-1"
              imgAlt="Supportive illustration for the information"
              fit="contain"
            />
          </>
        )}
        <div className="flex flex-col items-center gap-4">
          {badge?.placement === 'top' && badgeComponent}
          <StepHeadline
            className="!gap-6"
            heading={parameters?.headline}
            description={parameters?.explainer}
            align={parameters?.align}
          />
          {badge?.placement === 'bottom' && badgeComponent}
        </div>
      </div>
    </FunnelStepCtaWrapper>
  );
};
