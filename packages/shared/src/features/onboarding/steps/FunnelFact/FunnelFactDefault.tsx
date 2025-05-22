import React, { useMemo } from 'react';
import type { ReactElement } from 'react';
import classNames from 'classnames';
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

export const FunnelFactDefault = (props: FunnelStepFact): ReactElement => {
  const { parameters, transitions, onTransition } = props;
  const isLayoutReversed =
    parameters.layout === 'reversed' || parameters.reverse;
  const skip = useMemo(
    () => transitions.find((t) => t.on === FunnelStepTransitionType.Skip),
    [transitions],
  );
  const skipButton = (
    <Button
      className="w-fit"
      data-funnel-track={FunnelTargetId.StepCta}
      variant={ButtonVariant.Float}
      type="button"
      icon={<MoveToIcon />}
      iconPosition={ButtonIconPosition.Right}
      onClick={() => onTransition({ type: FunnelStepTransitionType.Skip })}
    >
      {skip?.cta ?? 'Skip'}
    </Button>
  );

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
        {skip?.placement === 'top' && !isLayoutReversed && skipButton}
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
        {skip?.placement === 'top' && isLayoutReversed && skipButton}
      </div>
    </FunnelFactWrapper>
  );
};
