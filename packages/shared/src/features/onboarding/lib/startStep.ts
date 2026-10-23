import type { FunnelBootData } from '../types/funnelBoot';
import {
  COMPLETED_STEP_ID,
  FunnelStepTransitionType,
  FunnelStepType,
  NEXT_STEP_ID,
} from '../types/funnel';

/**
 * The step the onboarding funnel should open on.
 *
 * Normally the session's current step. The exception is the signup wall
 * (`heroLanding`): a logged-in user with confirmed info has nothing to do
 * there, so they start on the step the wall would complete to instead of
 * seeing the wall mount and immediately navigate away.
 */
export const getOnboardingStartStepId = ({
  funnelState,
  user,
}: Pick<FunnelBootData, 'funnelState' | 'user'>): string | null => {
  const currentStepId = funnelState?.session?.currentStep ?? null;
  const steps =
    funnelState?.funnel?.chapters?.flatMap(
      ({ steps: chapterSteps }) => chapterSteps,
    ) ?? [];
  const startIndex = currentStepId
    ? steps.findIndex(({ id }) => id === currentStepId)
    : 0;
  const startStep = steps[startIndex];
  const isConfirmedUser = !!user && 'providers' in user && !!user.infoConfirmed;

  if (!isConfirmedUser || startStep?.type !== FunnelStepType.HeroLanding) {
    return currentStepId;
  }

  const destination = startStep.transitions.find(
    ({ on }) => on === FunnelStepTransitionType.Complete,
  )?.destination;
  const nextStepId =
    destination === NEXT_STEP_ID ? steps[startIndex + 1]?.id : destination;

  // completing the funnel, or a destination the funnel does not have, stays
  // with the wall's own handling
  if (
    !nextStepId ||
    nextStepId === COMPLETED_STEP_ID ||
    !steps.some(({ id }) => id === nextStepId)
  ) {
    return currentStepId;
  }

  return nextStepId;
};
