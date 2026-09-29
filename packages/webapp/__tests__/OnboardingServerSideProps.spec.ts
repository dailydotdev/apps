import { getBasicUserInfo } from '@dailydotdev/shared/src/graphql/users';
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

const runServerSideProps = async (query: Record<string, string>) => {
  const result = await getServerSideProps({
    query,
    req: { headers: {}, socket: {} },
    res: { setHeader: jest.fn() },
  } as never);

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
});
