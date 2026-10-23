import { getOnboardingStart } from './startStep';
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

const startStepId = (data: Parameters<typeof getOnboardingStart>[0]) =>
  getOnboardingStart(data).stepId;

describe('getOnboardingStart', () => {
  it('should start past the signup wall for a logged-in user with confirmed info', () => {
    expect(startStepId(boot())).toBe('role');
  });

  it('should follow an explicit complete destination', () => {
    expect(
      startStepId(
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
    expect(startStepId(boot({ currentStep: null }))).toBe('role');
  });

  it('should keep the signup wall for a user who has not confirmed their info', () => {
    expect(
      startStepId(boot({ user: { ...loggedUser, infoConfirmed: false } })),
    ).toBe('wall');
  });

  it('should keep the signup wall for a logged-out visitor', () => {
    expect(startStepId(boot({ user: { id: 'anon' } }))).toBe('wall');
  });

  it('should keep a session that is not on the signup wall', () => {
    expect(startStepId(boot({ currentStep: 'role' }))).toBe('role');
  });

  it('should keep the signup wall when it completes the funnel', () => {
    expect(
      startStepId(
        boot({
          steps: [step('wall', FunnelStepType.HeroLanding, COMPLETED_STEP_ID)],
        }),
      ),
    ).toBe('wall');
  });

  it('should keep the signup wall when its destination is not in the funnel', () => {
    expect(
      startStepId(
        boot({
          steps: [
            step('wall', FunnelStepType.HeroLanding, 'missing'),
            step('role', FunnelStepType.UserRole),
          ],
        }),
      ),
    ).toBe('wall');
  });

  it('should report the sign-in steps it passed', () => {
    expect(getOnboardingStart(boot())).toEqual({
      stepId: 'role',
      passedStepIds: ['wall'],
    });
    expect(getOnboardingStart(boot({ currentStep: 'role' }))).toEqual({
      stepId: 'role',
      passedStepIds: [],
    });
  });

  it('should start past organic registration for a logged-in user with confirmed info', () => {
    expect(
      startStepId(
        boot({
          currentStep: 'signup',
          steps: [
            step('signup', FunnelStepType.OrganicSignup),
            step('role', FunnelStepType.UserRole),
          ],
        }),
      ),
    ).toBe('role');
  });

  it('should start past registration for any logged-in user', () => {
    expect(
      startStepId(
        boot({
          currentStep: 'signup',
          steps: [
            step('signup', FunnelStepType.Signup),
            step('role', FunnelStepType.UserRole),
          ],
          user: { ...loggedUser, infoConfirmed: false },
        }),
      ),
    ).toBe('role');
  });

  it('should pass a chain of sign-in steps', () => {
    expect(
      getOnboardingStart(
        boot({
          steps: [
            step('wall', FunnelStepType.HeroLanding),
            step('signup', FunnelStepType.Signup),
            step('role', FunnelStepType.UserRole),
          ],
        }),
      ),
    ).toEqual({ stepId: 'role', passedStepIds: ['wall', 'signup'] });
  });

  it('should stop at a sign-in step the user still has to do', () => {
    expect(
      startStepId(
        boot({
          currentStep: 'signup',
          steps: [
            step('signup', FunnelStepType.Signup),
            step('wall', FunnelStepType.HeroLanding),
            step('role', FunnelStepType.UserRole),
          ],
          user: { ...loggedUser, infoConfirmed: false },
        }),
      ),
    ).toBe('wall');
  });

  it('should not loop on sign-in steps that point at each other', () => {
    const { stepId, passedStepIds } = getOnboardingStart(
      boot({
        steps: [
          step('wall', FunnelStepType.HeroLanding, 'signup'),
          step('signup', FunnelStepType.Signup, 'wall'),
        ],
      }),
    );

    expect(passedStepIds).toHaveLength(2);
    expect(stepId).toBe('wall');
  });
});
