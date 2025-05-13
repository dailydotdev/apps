import type { ReactElement } from 'react';
import React from 'react';
import type { FunnelStepContentTypes } from '../types/funnel';
import { FunnelStepTransitionType } from '../types/funnel';
import { ContentTypes } from '../../../components/onboarding/ContentTypes/ContentTypes';
import { FunnelStepCtaWrapper } from '../shared/FunnelStepCtaWrapper';
import { useActions } from '../../../hooks';
import { ActionType } from '../../../graphql/actions';
import { withIsActiveGuard } from '../shared/withActiveGuard';

function FunnelContentTypesComponent({
  parameters: { headline, cta },
  onTransition,
}: FunnelStepContentTypes): ReactElement | null {
  const { completeAction } = useActions();

  const handleComplete = () => {
    completeAction(ActionType.ContentTypes);
    onTransition({ type: FunnelStepTransitionType.Complete });
  };

  return (
    <FunnelStepCtaWrapper
      cta={{ label: cta || 'Next' }}
      onClick={handleComplete}
      containerClassName="flex w-full flex-1 flex-col items-center justify-center overflow-hidden"
    >
      <div className="flex w-full flex-col items-center gap-6 p-6 pt-10 tablet:max-w-96">
        <ContentTypes headline={headline} />
      </div>
    </FunnelStepCtaWrapper>
  );
}

export const FunnelContentTypes = withIsActiveGuard(
  FunnelContentTypesComponent,
);
