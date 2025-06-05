import React, { useMemo } from 'react';
import type { ReactElement } from 'react';
import classNames from 'classnames';
import Head from 'next/head';
import { StepHeadline } from '../../shared';
import type { FunnelStepFact } from '../../types/funnel';
import { FunnelStepTransitionType } from '../../types/funnel';
import { LazyImage } from '../../../../components/LazyImage';
import { Badge } from '../../../../components/Badge';
import {
  ReputationLightningIcon,
  MoveToIcon,
} from '../../../../components/icons';
import { FunnelFactWrapper } from './FunnelFactWrapper';
import { Button } from '../../../../components/buttons/Button';
import {
  ButtonVariant,
  ButtonIconPosition,
} from '../../../../components/buttons/common';
import { FunnelTargetId } from '../../types/funnelEvents';
import { useIsLightTheme } from '../../../../hooks/utils';

export const FunnelFactDefault = (props: FunnelStepFact): ReactElement => {
  const { parameters, transitions, onTransition } = props;
  const {
    badge,
    headline,
    explainer,
    align,
    reverse,
    layout,
    visualUrl,
    visualUrlLightMode,
  } = parameters;
  const isLightMode = useIsLightTheme();
  const image = isLightMode ? visualUrlLightMode : visualUrl;
  const isLayoutReversed = layout === 'reversed' || reverse;
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

  const badgeComponent = !badge?.cta ? null : (
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
        className={classNames(
          'flex flex-1 items-center gap-12 px-4 pt-6 laptop:mb-10',
          isLayoutReversed
            ? 'flex-col-reverse justify-end'
            : 'flex-col justify-between',
        )}
      >
        <div className="flex flex-col items-center gap-4">
          {badge?.placement === 'top' && badgeComponent}
          {skip?.placement === 'top' && !isLayoutReversed && skipButton}
          <StepHeadline
            heading={headline}
            description={explainer}
            align={align}
          />
          {badge?.placement === 'bottom' && badgeComponent}
        </div>
        {image && (
          <>
            <Head>
              <link rel="preload" as="image" href={image} />
            </Head>
            <LazyImage
              aria-hidden
              eager
              imgSrc={image}
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
