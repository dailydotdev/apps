import { getBasicUserInfo } from '@dailydotdev/shared/src/graphql/users';
import { getFunnelBootData } from '@dailydotdev/shared/src/features/onboarding/funnelBoot';
import {
  FunnelStepTransitionType,
  FunnelStepType,
  NEXT_STEP_ID,
} from '@dailydotdev/shared/src/features/onboarding/types/funnel';
import { getServerSideProps } from '../pages/onboarding';

jest.mock('@dailydotdev/shared/src/features/onboarding/funnelBoot', () => ({
  ...jest.requireActual(
    '@dailydotdev/shared/src/features/onboarding/funnelBoot',
  ),
  getFunnelBootData: jest.fn(() =>
    Promise.resolve({ data: {}, response: { headers: new Headers() } }),
  ),
}));

jest.mock('@dailydotdev/shared/src/graphql/users', () => ({
  ...jest.requireActual('@dailydotdev/shared/src/graphql/users'),
  getBasicUserInfo: jest.fn(),
}));

const mockGetBasicUserInfo = getBasicUserInfo as jest.Mock;
const mockGetFunnelBootData = getFunnelBootData as jest.Mock;

const callServerSideProps = (
  query: Record<string, string>,
  resolvedUrl = '/onboarding',
) =>
  getServerSideProps({
    query,
    resolvedUrl,
    req: { headers: {}, socket: {} },
    res: { setHeader: jest.fn() },
  } as never);

const runServerSideProps = async (
  query: Record<string, string>,
  resolvedUrl?: string,
) => {
  const result = await callServerSideProps(query, resolvedUrl);

  if (!('props' in result)) {
    throw new Error('Expected props');
  }

  return result.props;
};

describe('onboarding page server side props', () => {
  beforeEach(() => {
    mockGetBasicUserInfo.mockReset();
  });

  it('should render the inviter link preview for an invite', async () => {
    mockGetBasicUserInfo.mockResolvedValue({ id: 'u1', name: 'Sam Porter' });

    const props = await runServerSideProps({ cid: 'generic', userid: 'u1' });

    expect(mockGetBasicUserInfo).toHaveBeenCalledWith('u1');
    expect(props.seo).toMatchObject({
      title: 'Sam Porter invites you to use daily.dev',
      openGraph: {
        title: 'Sam Porter invites you to use daily.dev',
        images: [{ url: 'http://localhost:3000/og/invite/u1.png' }],
      },
    });
    expect(
      props.dehydratedState.queries.map(({ state }) => state.data),
    ).toContainEqual({ id: 'u1', name: 'Sam Porter' });
  });

  it('should keep the default preview when the inviter is not found', async () => {
    mockGetBasicUserInfo.mockRejectedValue(new Error('user not found'));

    const props = await runServerSideProps({ cid: 'generic', userid: 'u1' });

    expect(props.seo).toBeUndefined();
  });

  it('should not look up an inviter without a referral', async () => {
    const props = await runServerSideProps({ cid: 'generic' });

    expect(mockGetBasicUserInfo).not.toHaveBeenCalled();
    expect(props.seo).toBeUndefined();
  });

  describe('start step', () => {
    const transitions = [
      { on: FunnelStepTransitionType.Complete, destination: NEXT_STEP_ID },
    ];
    const mockBoot = (user: Record<string, unknown>) =>
      mockGetFunnelBootData.mockResolvedValueOnce({
        response: { headers: new Headers() },
        data: {
          user,
          funnelState: {
            session: { id: 's1', currentStep: 'wall' },
            funnel: {
              chapters: [
                {
                  id: 'c1',
                  steps: [
                    {
                      id: 'wall',
                      type: FunnelStepType.HeroLanding,
                      transitions,
                    },
                    { id: 'role', type: FunnelStepType.UserRole, transitions },
                  ],
                },
              ],
            },
          },
        },
      });
    const confirmedUser = { id: 'u1', providers: [null], infoConfirmed: true };

    it('should start past the signup wall for a logged-in user with confirmed info', async () => {
      mockBoot(confirmedUser);

      const props = await runServerSideProps({});

      expect(props.initialStepId).toBe('role');
    });

    it('should start on the signup wall for an anonymous visitor', async () => {
      mockBoot({ id: 'anon' });

      const props = await runServerSideProps({});

      expect(props.initialStepId).toBe('wall');
    });

    it('should drop a stale signup wall stepId from the URL', async () => {
      mockBoot(confirmedUser);

      const result = await callServerSideProps(
        { stepId: 'wall', after_auth: '/my-feed' },
        '/onboarding?stepId=wall&after_auth=%2Fmy-feed',
      );

      expect(result).toEqual({
        redirect: {
          destination: '/onboarding?after_auth=%2Fmy-feed',
          permanent: false,
        },
      });
    });

    it('should keep a stepId that is not the passed signup wall', async () => {
      mockBoot(confirmedUser);

      const props = await runServerSideProps(
        { stepId: 'role' },
        '/onboarding?stepId=role',
      );

      expect(props.initialStepId).toBe('role');
    });
  });
});
