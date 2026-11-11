import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import type { NextSeoProps } from 'next-seo';
import { useRouter } from 'next/router';
import { PromptElement } from '@dailydotdev/shared/src/components/modals/Prompt';
import Toast from '@dailydotdev/shared/src/components/notifications/Toast';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import {
  StartupsCheckout,
  StartupsCheckoutStep,
} from '@dailydotdev/shared/src/features/squads/components/checkout/StartupsCheckout';
import { saveCheckoutAttribution } from '@dailydotdev/shared/src/features/squads/lib/checkoutAttribution';
import { noindexSeoProps } from '../../next-seo';

const StartupsCheckoutPage = (): ReactElement | null => {
  const router = useRouter();
  const { user, isAuthReady } = useAuthContext();
  // A new social account has a user before its profile is complete; it stays
  // on the account step until then.
  const isSignedUp = !!user?.infoConfirmed;

  useEffect(() => {
    if (router.isReady) {
      saveCheckoutAttribution(router.query);
    }
  }, [router.isReady, router.query]);

  if (!isAuthReady || !router.isReady) {
    return null;
  }

  // A focused page: no sidebar or header, as in the onboarding funnel.
  return (
    <>
      <StartupsCheckout
        key={isSignedUp ? 'checkout' : 'account'}
        initialPlan={router.query.plan as string | undefined}
        initialSquadId={router.query.squad as string | undefined}
        initialStep={
          isSignedUp
            ? StartupsCheckoutStep.Company
            : StartupsCheckoutStep.Account
        }
      />
      <PromptElement />
      <Toast autoDismissNotifications />
    </>
  );
};

const seo: NextSeoProps = {
  title: 'daily.dev for Startups',
  ...noindexSeoProps,
};

StartupsCheckoutPage.layoutProps = { seo };

export default StartupsCheckoutPage;
