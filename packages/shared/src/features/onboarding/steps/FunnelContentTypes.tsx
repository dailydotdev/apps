import type { ReactElement } from 'react';
import React, { useEffect, useMemo } from 'react';
import type { FunnelStepContentTypes } from '../types/funnel';
import { FunnelStepTransitionType } from '../types/funnel';
import { ContentTypes } from '../../../components/onboarding';
import { FunnelStepCtaWrapper } from '../shared';
import { useActions } from '../../../hooks';
import { ActionType } from '../../../graphql/actions';
import { withIsActiveGuard } from '../shared/withActiveGuard';
import { useAuthContext } from '../../../contexts/AuthContext';

function FunnelContentTypesComponent({
  parameters: { headline, cta },
  onTransition,
}: FunnelStepContentTypes): ReactElement | null {
  const { completeAction, checkHasCompleted } = useActions();
  const { isLoggedIn, user } = useAuthContext();
  const hasCompleted = useMemo(
    () => user && checkHasCompleted(ActionType.ContentTypes),
    [checkHasCompleted, user],
  );

  const handleComplete = () => {
    completeAction(ActionType.ContentTypes);
    onTransition({ type: FunnelStepTransitionType.Complete });
  };

  useEffect(() => {
    if (hasCompleted) {
      onTransition({ type: FunnelStepTransitionType.Skip });
    }
  }, [hasCompleted, onTransition]);

  if (!isLoggedIn || hasCompleted) {
    return null;
  }

  return (
    <FunnelStepCtaWrapper
      cta={{ label: cta || 'Next' }}
      onClick={handleComplete}
      containerClassName="flex w-full flex-1 flex-col items-center justify-center overflow-hidden"
    >
      <div className="flex w-full flex-col items-center gap-6 p-6 pt-10 laptop:max-w-screen-laptop">
        <ContentTypes headline={headline} />
      </div>
    </FunnelStepCtaWrapper>
  );
}

export const FunnelContentTypes = withIsActiveGuard(
  FunnelContentTypesComponent,
);
