import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useReferralLadderFeature } from '@dailydotdev/shared/src/hooks/referral/useReferralLadder';
import type { JoinPageProps } from './common';
import { Referral } from './Referral';

// With the referral ladder on, /join keeps rendering the inviter's link
// preview tags and forwards the friend to the regular signup page, which shows
// who invited them from `userid`.
export function ReferralSignupRedirect(
  props: JoinPageProps,
): ReactElement | null {
  const { referringUser, campaign } = props;
  const router = useRouter();
  const { isEnabled, isLoading } = useReferralLadderFeature();

  useEffect(() => {
    if (!isEnabled) {
      return;
    }

    router.replace({
      pathname: '/onboarding',
      query: { cid: campaign, userid: referringUser.id },
    });
    // router is an unstable dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEnabled, campaign, referringUser.id]);

  if (isLoading || isEnabled) {
    return null;
  }

  return <Referral {...props} />;
}
