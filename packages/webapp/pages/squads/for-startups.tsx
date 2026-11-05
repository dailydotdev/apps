import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import type { NextSeoProps } from 'next-seo';
import { useRouter } from 'next/router';
import Toast from '@dailydotdev/shared/src/components/notifications/Toast';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { useConditionalFeature } from '@dailydotdev/shared/src/hooks/useConditionalFeature';
import { featureStartupsCheckout } from '@dailydotdev/shared/src/lib/featureManagement';
import {
  StartupsCheckout,
  StartupsCheckoutStep,
} from '@dailydotdev/shared/src/features/squads/components/checkout/StartupsCheckout';
import { noindexSeoProps } from '../../next-seo';

const StartupsCheckoutPage = (): ReactElement | null => {
  const router = useRouter();
  const { user, isAuthReady } = useAuthContext();
  // A new social account has a user before its profile is complete; it stays
  // on the account step until then.
  const isSignedUp = !!user?.infoConfirmed;
  const { value: isEnabled, isLoading } = useConditionalFeature({
    feature: featureStartupsCheckout,
    shouldEvaluate: isSignedUp,
  });

  // The flag targets accounts, so a visitor from the landing page signs up
  // first and is checked after.
  useEffect(() => {
    if (isSignedUp && !isLoading && !isEnabled) {
      router.replace('/squads');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedUp, isLoading, isEnabled]);

  if (!isAuthReady || !router.isReady || (isSignedUp && !isEnabled)) {
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
