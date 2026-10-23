import type { FunnelBootData } from '../types/funnelBoot';
import type { FunnelStep } from '../types/funnel';
import type { LoggedUser } from '../../../lib/user';
import {
  COMPLETED_STEP_ID,
  FunnelStepTransitionType,
  FunnelStepType,
  NEXT_STEP_ID,
} from '../types/funnel';

type BootUser = FunnelBootData['user'];

const isLoggedIn = (user: BootUser): user is LoggedUser =>
  !!user && 'providers' in user;

/**
 * Sign-in steps a user has nothing to do on, and the rule for when. Each of
 * these steps completes itself on mount for such a user, so starting on one
 * only shows it for a moment before the funnel moves on.
 */
const passedSignInSteps: Partial<
  Record<FunnelStepType, (user: BootUser) => boolean>
> = {
  [FunnelStepType.HeroLanding]: (user) =>
    isLoggedIn(user) && !!user.infoConfirmed,
  [FunnelStepType.OrganicSignup]: (user) =>
    isLoggedIn(user) && !!user.infoConfirmed,
  [FunnelStepType.Signup]: isLoggedIn,
};

export interface OnboardingStart {
  /** The step the funnel should open on. */
  stepId: string | null;
  /** Sign-in steps passed on the way there. */
  passedStepIds: string[];
}

/**
 * Where the onboarding funnel should open: the session's current step, moved
 * past any sign-in step the user has nothing to do on (following each one's
 * complete transition), so those steps never mount just to navigate away.
 */
export const getOnboardingStart = ({
  funnelState,
  user,
}: Pick<FunnelBootData, 'funnelState' | 'user'>): OnboardingStart => {
  const sessionStepId = funnelState?.session?.currentStep ?? null;
  const steps: FunnelStep[] =
    funnelState?.funnel?.chapters?.flatMap((chapter) => chapter.steps) ?? [];
  const passedStepIds: string[] = [];
  let index = sessionStepId
    ? steps.findIndex(({ id }) => id === sessionStepId)
    : 0;

  // bounded by the number of steps, so a cycle in the config cannot spin
  while (passedStepIds.length < steps.length) {
    const step = steps[index];

    if (!step || !passedSignInSteps[step.type]?.(user)) {
      break;
    }

    const destination = step.transitions.find(
      ({ on }) => on === FunnelStepTransitionType.Complete,
    )?.destination;
    const nextStepId =
      destination === NEXT_STEP_ID ? steps[index + 1]?.id : destination;
    const nextIndex = steps.findIndex(({ id }) => id === nextStepId);

    // completing the funnel, or a destination the funnel does not have, stays
    // with the step's own handling
    if (nextStepId === COMPLETED_STEP_ID || nextIndex === -1) {
      break;
    }

    passedStepIds.push(step.id);
    index = nextIndex;
  }

  return {
    stepId: passedStepIds.length ? steps[index].id : sessionStepId,
    passedStepIds,
  };
};
