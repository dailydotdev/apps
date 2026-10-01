import type { GetServerSideProps } from 'next';
import type { InviteReferral } from '@dailydotdev/shared/src/lib/referral';
import { getInviteReferral } from '@dailydotdev/shared/src/lib/referral';
import { isDevelopment } from '@dailydotdev/shared/src/lib/constants';
import { oneYear } from '@dailydotdev/shared/src/lib/dateFormat';

const getJoinReferralCookie = ({ userId, campaign }: InviteReferral): string =>
  [
    `join_referral=${encodeURIComponent(`${userId}:${campaign}`)}`,
    'Path=/',
    `Max-Age=${oneYear}`,
    process.env.NEXT_PUBLIC_DOMAIN &&
      `Domain=${process.env.NEXT_PUBLIC_DOMAIN}`,
    'SameSite=Lax',
    !isDevelopment && 'Secure',
  ]
    .filter(Boolean)
    .join('; ');

export const getServerSideProps: GetServerSideProps = async ({
  query,
  res,
}) => {
  const referral = getInviteReferral(query);

  if (!referral) {
    return { redirect: { destination: '/', permanent: false } };
  }

  res.setHeader('Set-Cookie', getJoinReferralCookie(referral));

  const { ctoken, ...forwardedQuery } = query;
  const params = new URLSearchParams();
  Object.entries(forwardedQuery).forEach(([key, value]) =>
    [value].flat().forEach((item) => item && params.append(key, item)),
  );
  params.set('cid', referral.campaign);
  params.set('userid', referral.userId);

  return {
    redirect: {
      destination: `/onboarding?${params.toString()}`,
      permanent: false,
    },
  };
};

const Page = (): null => null;

export default Page;
