import React, { useMemo } from 'react';
import type { ReactElement } from 'react';
import Head from 'next/head';
import { StepHeadline } from '../../shared';
import type { FunnelStepFact } from '../../types/funnel';
import { FunnelStepTransitionType } from '../../types/funnel';
import { LazyImage } from '../../../../components/LazyImage';
import { FunnelFactWrapper } from './FunnelFactWrapper';
import { Button } from '../../../../components/buttons/Button';
import {
  ButtonVariant,
  ButtonIconPosition,
} from '../../../../components/buttons/common';
import { MoveToIcon } from '../../../../components/icons';
import { FunnelTargetId } from '../../types/funnelEvents';
import { ReputationLightningIcon } from '../../../../components/icons';
import { Badge } from '../../../../components/Badge';

export const FunnelFactCentered = (props: FunnelStepFact): ReactElement => {
  const { parameters, transitions, onTransition } = props;
  const { badge, headline, explainer, align, visualUrl } = parameters;
  const skip = useMemo(
    () => transitions.find((t) => t.on === FunnelStepTransitionType.Skip),
    [transitions],
  );
  const badgeComponent =!badge?.cta
    ? null
    : (
      <Badge
        label={badge.cta}
        icon={<ReputationLightningIcon className="h-6 w-6" secondary />}
        variant={badge.variant}
      />
    );

  return (
    <FunnelFactWrapper {...props}>
      <div
        data-testid="step-content"
        className="flex flex-1 flex-col items-center justify-center gap-6 p-6 laptop:mb-10"
      >
        {skip?.placement === 'top' && (
          <Button
            className="w-fit"
            data-funnel-track={FunnelTargetId.StepCta}
            variant={ButtonVariant.Float}
            type="button"
            icon={<MoveToIcon />}
            iconPosition={ButtonIconPosition.Right}
            onClick={() =>
              onTransition({ type: FunnelStepTransitionType.Skip })
            }
          >
            {skip?.cta ?? 'Skip'}
          </Button>
        )}
        {visualUrl && (
          <>
            <Head>
              <link rel="preload" as="image" href={visualUrl} />
            </Head>
            <LazyImage
              aria-hidden
              eager
              imgSrc={visualUrl}
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
            heading={headline}
            description={explainer}
            align={align}
          />
          {badge?.placement === 'bottom' && badgeComponent}
        </div>
      </div>
    </FunnelFactWrapper>
  );
};
