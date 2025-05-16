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

export const FunnelFactCentered = (props: FunnelStepFact): ReactElement => {
  const { parameters, transitions, onTransition } = props;
  const skip = useMemo(
    () => transitions.find((t) => t.on === FunnelStepTransitionType.Skip),
    [transitions],
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
        {parameters?.visualUrl && (
          <>
            <Head>
              <link rel="preload" as="image" href={parameters.visualUrl} />
            </Head>
            <LazyImage
              aria-hidden
              eager
              imgSrc={parameters?.visualUrl}
              className="max-h-[25rem] w-full flex-1"
              imgAlt="Supportive illustration for the information"
              fit="contain"
            />
          </>
        )}
        <StepHeadline
          className="!gap-6"
          heading={parameters?.headline}
          description={parameters?.explainer}
          align={parameters?.align}
        />
      </div>
    </FunnelFactWrapper>
  );
};
