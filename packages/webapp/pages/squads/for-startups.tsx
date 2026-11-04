import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import type { NextSeoProps } from 'next-seo';
import { useRouter } from 'next/router';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { useConditionalFeature } from '@dailydotdev/shared/src/hooks/useConditionalFeature';
import { featureStartupsCheckout } from '@dailydotdev/shared/src/lib/featureManagement';
import { StartupsCheckout } from '@dailydotdev/shared/src/features/squads/components/checkout/StartupsCheckout';
import ProtectedPage from '../../components/ProtectedPage';
import { getLayout } from '../../components/layouts/MainLayout';
import { noindexSeoProps } from '../../next-seo';

const StartupsCheckoutContent = (): ReactElement | null => {
  const router = useRouter();
  const { user } = useAuthContext();
  const { value: isEnabled, isLoading } = useConditionalFeature({
    feature: featureStartupsCheckout,
    shouldEvaluate: !!user,
  });

  useEffect(() => {
    if (user && !isLoading && !isEnabled) {
      router.replace('/squads');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isLoading, isEnabled]);

  if (!user || !router.isReady || isLoading || !isEnabled) {
    return null;
  }

  return (
    <StartupsCheckout
      initialPlan={router.query.plan as string | undefined}
      initialSquadId={router.query.squad as string | undefined}
    />
  );
};

// ProtectedPage comes first so a visitor from the landing page signs up and
// comes back here, instead of being bounced by the flag check.
const StartupsCheckoutPage = (): ReactElement => (
  <ProtectedPage>
    <StartupsCheckoutContent />
  </ProtectedPage>
);

const seo: NextSeoProps = {
  title: 'daily.dev for Startups',
  ...noindexSeoProps,
};

StartupsCheckoutPage.getLayout = getLayout;
StartupsCheckoutPage.layoutProps = { seo };

export default StartupsCheckoutPage;
