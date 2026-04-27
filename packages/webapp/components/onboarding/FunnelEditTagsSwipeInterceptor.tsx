import type { ReactElement } from 'react';
import React from 'react';
import type { FunnelStepEditTags } from '@dailydotdev/shared/src/features/onboarding/types/funnel';
import { FunnelStepTransitionType } from '@dailydotdev/shared/src/features/onboarding/types/funnel';
import { withIsActiveGuard } from '@dailydotdev/shared/src/features/onboarding/shared/withActiveGuard';
import { SwipeOnboardingBody } from './SwipeOnboardingBody';

/**
 * Replaces the tags step with a swipe deck that still emits the same `Complete`
 * transition with `{ tags }` so downstream funnel logic is unchanged. The "Use
 * tags instead" opt-out is owned by SwipeOnboardingBody, which switches its
 * internal mode.
 *
 * The active-guard unmounts this step when the funnel advances. Required because
 * the swipe body renders HotAndColdModal via a React portal, which would otherwise
 * stay visible after the step is hidden.
 *
 * Gating is owned by the parent page (onboarding.tsx) — this module is only
 * loaded when `onboardingSwipeInterceptTagsFeature` is on for the user.
 */
function FunnelEditTagsSwipeInterceptorComponent(
  props: FunnelStepEditTags,
): ReactElement | null {
  return (
    <SwipeOnboardingBody
      standalonePageChrome={false}
      continueLabel={props.parameters.cta || 'Next'}
      onDone={(tags) => {
        props.onTransition({
          type: FunnelStepTransitionType.Complete,
          details: { tags },
        });
      }}
    />
  );
}

export const FunnelEditTagsSwipeInterceptor = withIsActiveGuard(
  FunnelEditTagsSwipeInterceptorComponent,
);
