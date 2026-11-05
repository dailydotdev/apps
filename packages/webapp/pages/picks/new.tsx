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

const getQueryValue = (value?: string | string[]): string | undefined =>
  Array.isArray(value) ? value[0] : value;

const NewPicksContent = (): ReactElement | null => {
  const router = useRouter();
  const { user } = useAuthContext();
  const fromPicksId = getQueryValue(router.query.from);
  const addPostId = getQueryValue(router.query.add);
  // Arriving from a picks page opens the editor outside the rollout, so a
  // viewer can make a list of their own; the flag only gates the entry points.
  const { value: isEnabled, isLoading } = useConditionalFeature({
    feature: featureWeeklyPicks,
    shouldEvaluate: router.isReady && !fromPicksId,
  });
  const canOpen = !!fromPicksId || (!isLoading && isEnabled);

  useEffect(() => {
    if (user && router.isReady && !isLoading && !canOpen) {
      router.replace('/');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, router.isReady, isLoading, canOpen]);

  if (!user || !router.isReady || !canOpen) {
    return null;
  }

  return (
    <PicksEditor
      origin={getPicksOrigin(router.query.origin)}
      fromPicksId={fromPicksId}
      addPostId={addPostId}
    />
  );
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
