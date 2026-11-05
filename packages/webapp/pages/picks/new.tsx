import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import type { NextSeoProps } from 'next-seo';
import { useRouter } from 'next/router';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { useConditionalFeature } from '@dailydotdev/shared/src/hooks/useConditionalFeature';
import { featureWeeklyPicks } from '@dailydotdev/shared/src/lib/featureManagement';
import { PicksEditor } from '@dailydotdev/shared/src/components/picks/PicksEditor';
import { getPicksOrigin } from '@dailydotdev/shared/src/hooks/picks/usePicksEditor';
import ProtectedPage from '../../components/ProtectedPage';
import { getLayout } from '../../components/layouts/MainLayout';
import { noindexSeoProps } from '../../next-seo';

const NewPicksContent = (): ReactElement | null => {
  const router = useRouter();
  const { user } = useAuthContext();
  const { value: isEnabled, isLoading } = useConditionalFeature({
    feature: featureWeeklyPicks,
  });

  useEffect(() => {
    if (user && !isLoading && !isEnabled) {
      router.replace('/');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isLoading, isEnabled]);

  if (!user || !router.isReady || isLoading || !isEnabled) {
    return null;
  }

  return <PicksEditor origin={getPicksOrigin(router.query.origin)} />;
};

// ProtectedPage comes first so a logged-out visitor is sent to auth, not
// bounced to the feed by the flag check.
const NewPicksPage = (): ReactElement => (
  <ProtectedPage>
    <NewPicksContent />
  </ProtectedPage>
);

const seo: NextSeoProps = {
  title: 'Weekly picks',
  ...noindexSeoProps,
};

NewPicksPage.getLayout = getLayout;
NewPicksPage.layoutProps = { seo };

export default NewPicksPage;
