import { getOnboardingStartStepId } from './startStep';
import type { FunnelBootData } from '../types/funnelBoot';
import type { FunnelStep } from '../types/funnel';
import {
  COMPLETED_STEP_ID,
  FunnelStepTransitionType,
  FunnelStepType,
  NEXT_STEP_ID,
} from '../types/funnel';
import loggedUser from '../../../../__tests__/fixture/loggedUser';

const step = (
  id: string,
  type: FunnelStepType,
  destination: string = NEXT_STEP_ID,
): FunnelStep =>
  ({
    id,
    type,
    parameters: {},
    transitions: [{ on: FunnelStepTransitionType.Complete, destination }],
  } as unknown as FunnelStep);

const boot = ({
  currentStep = 'wall',
  steps = [
    step('wall', FunnelStepType.HeroLanding),
    step('role', FunnelStepType.UserRole),
  ],
  user = { ...loggedUser, infoConfirmed: true },
}: {
  currentStep?: string | null;
  steps?: FunnelStep[];
  user?: FunnelBootData['user'];
} = {}): Pick<FunnelBootData, 'funnelState' | 'user'> =>
  ({
    user,
    funnelState: {
      session: { id: 'session', userId: user.id, currentStep, steps: {} },
      funnel: {
        id: 'funnel',
        version: 1,
        parameters: {},
        entryPoint: steps[0].id,
        chapters: [{ id: 'chapter', steps }],
      },
    },
  } as Pick<FunnelBootData, 'funnelState' | 'user'>);

describe('getOnboardingStartStepId', () => {
  it('should start past the signup wall for a logged-in user with confirmed info', () => {
    expect(getOnboardingStartStepId(boot())).toBe('role');
  });

  it('should follow an explicit complete destination', () => {
    expect(
      getOnboardingStartStepId(
        boot({
          steps: [
            step('wall', FunnelStepType.HeroLanding, 'tags'),
            step('role', FunnelStepType.UserRole),
            step('tags', FunnelStepType.EditTags),
          ],
        }),
      ),
    ).toBe('tags');
  });

  it('should start past the signup wall when the session has no current step yet', () => {
    expect(getOnboardingStartStepId(boot({ currentStep: null }))).toBe('role');
  });

  it('should keep the signup wall for a user who has not confirmed their info', () => {
    expect(
      getOnboardingStartStepId(
        boot({ user: { ...loggedUser, infoConfirmed: false } }),
      ),
    ).toBe('wall');
  });

  it('should keep the signup wall for a logged-out visitor', () => {
    expect(getOnboardingStartStepId(boot({ user: { id: 'anon' } }))).toBe(
      'wall',
    );
  });

  it('should keep a session that is not on the signup wall', () => {
    expect(getOnboardingStartStepId(boot({ currentStep: 'role' }))).toBe(
      'role',
    );
  });

  it('should keep the signup wall when it completes the funnel', () => {
    expect(
      getOnboardingStartStepId(
        boot({
          steps: [step('wall', FunnelStepType.HeroLanding, COMPLETED_STEP_ID)],
        }),
      ),
    ).toBe('wall');
  });

  it('should keep the signup wall when its destination is not in the funnel', () => {
    expect(
      getOnboardingStartStepId(
        boot({
          steps: [
            step('wall', FunnelStepType.HeroLanding, 'missing'),
            step('role', FunnelStepType.UserRole),
          ],
        }),
      ),
    ).toBe('wall');
  });
});
