import React, { useMemo } from 'react';
import type { PropsWithChildren } from 'react';
import type { FunnelStepFact } from '../../types/funnel';
import { FunnelStepTransitionType } from '../../types/funnel';
import { FunnelStepCtaWrapper } from '../../shared';
import { Button } from '../../../../components/buttons/Button';
import { ButtonVariant } from '../../../../components/buttons/common';
import { FunnelTargetId } from '../../types/funnelEvents';
import { StraightArrowIcon } from '../../../../components/icons';

export const FunnelFactWrapper = ({
  children,
  ...props
}: PropsWithChildren<FunnelStepFact>) => {
  const { parameters, onTransition, transitions } = props;
  const skip = useMemo(
    () => transitions.find((t) => t.on === FunnelStepTransitionType.Skip),
    [transitions],
  );

  return (
    <FunnelStepCtaWrapper
      containerClassName="flex"
      cta={{ label: parameters?.cta ?? 'Next' }}
      onClick={() =>
        onTransition({
          type: FunnelStepTransitionType.Complete,
        })
      }
      skip={skip?.placement === 'bottom' ? { cta: skip.cta } : undefined}
    >
      {skip?.placement === 'top' && (
        <Button
          data-funnel-track={FunnelTargetId.StepCta}
          variant={ButtonVariant.Float}
          type="button"
          icon={<StraightArrowIcon className="-rotate-90" />}
        >
          {skip?.cta ?? 'Skip'}
        </Button>
      )}
      {children}
    </FunnelStepCtaWrapper>
  );
};
