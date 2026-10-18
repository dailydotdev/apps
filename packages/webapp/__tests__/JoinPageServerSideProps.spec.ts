import { ReferralCampaignKey } from '@dailydotdev/shared/src/lib/referral';
import { getServerSideProps } from '../pages/join';

const runServerSideProps = (query: Record<string, string>) => {
  const setHeader = jest.fn();
  const result = getServerSideProps({
    query,
    res: { setHeader },
  } as never);

  return { result, setHeader };
};

describe('join page server side props', () => {
  it.each(Object.values(ReferralCampaignKey))(
    'should redirect a %s invite to onboarding with its referral',
    async (campaign) => {
      const { result, setHeader } = runServerSideProps({
        cid: campaign,
        userid: 'u1',
      });

      expect(await result).toEqual({
        redirect: {
          destination: `/onboarding?cid=${campaign}&userid=u1`,
          permanent: false,
        },
      });
      expect(setHeader).toHaveBeenCalledWith(
        'Set-Cookie',
        expect.stringContaining(
          `join_referral=${encodeURIComponent(`u1:${campaign}`)}; Path=/;`,
        ),
      );
    },
  );

  it('should keep other params but drop the feature invite token', async () => {
    const { result } = runServerSideProps({
      cid: 'generic',
      userid: 'u1',
      ctoken: 'token',
      utm_source: 'x',
    });

    expect(await result).toEqual({
      redirect: {
        destination: '/onboarding?cid=generic&userid=u1&utm_source=x',
        permanent: false,
      },
    });
  });

  it.each([
    ['a missing user', { cid: 'generic' }],
    ['the 404 user', { cid: 'generic', userid: '404' }],
    ['a missing campaign', { userid: 'u1' }],
    ['an unknown campaign', { cid: 'unknown', userid: 'u1' }],
  ])('should redirect %s home', async (_, query) => {
    const { result, setHeader } = runServerSideProps(query);

    expect(await result).toEqual({
      redirect: { destination: '/', permanent: false },
    });
    expect(setHeader).not.toHaveBeenCalled();
  });
});
