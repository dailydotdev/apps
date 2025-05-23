import React, { useMemo } from 'react';
import type { PropsWithChildren } from 'react';
import type { FunnelStepFact } from '../../types/funnel';
import { FunnelStepTransitionType } from '../../types/funnel';
import { FunnelStepCtaWrapper } from '../../shared';

export const FunnelFactWrapper = ({
  children,
  ...props
}: PropsWithChildren<FunnelStepFact>) => {
  const { parameters, onTransition, transitions } = props;
  const { cta, ctaNote } = parameters;
  const skip = useMemo(
    () => transitions.find((t) => t.on === FunnelStepTransitionType.Skip),
    [transitions],
  );

  const skipButton = {
    cta: skip?.cta,
    onClick: () =>
      onTransition({
        type: FunnelStepTransitionType.Skip,
      }),
  };

  return (
    <FunnelStepCtaWrapper
      containerClassName="flex"
      cta={{ label: cta ?? 'Next', note: ctaNote }}
      onClick={() =>
        onTransition({
          type: FunnelStepTransitionType.Complete,
        })
      }
      skip={skip?.placement === 'bottom' ? skipButton : undefined}
    >
      {children}
    </FunnelStepCtaWrapper>
  );
};
