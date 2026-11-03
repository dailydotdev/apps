import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import type { NextSeoProps } from 'next-seo';
import { useRouter } from 'next/router';
import { useConditionalFeature } from '@dailydotdev/shared/src/hooks/useConditionalFeature';
import { featureWeeklyPicks } from '@dailydotdev/shared/src/lib/featureManagement';
import { PicksEditor } from '@dailydotdev/shared/src/components/picks/PicksEditor';
import { getPicksOrigin } from '@dailydotdev/shared/src/hooks/picks/usePicksEditor';
import ProtectedPage from '../../components/ProtectedPage';
import { getLayout } from '../../components/layouts/MainLayout';
import { noindexSeoProps } from '../../next-seo';

const NewPicksPage = (): ReactElement | null => {
  const router = useRouter();
  const { value: isEnabled, isLoading } = useConditionalFeature({
    feature: featureWeeklyPicks,
  });

  useEffect(() => {
    if (!isLoading && !isEnabled) {
      router.replace('/');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, isEnabled]);

  if (!router.isReady || isLoading || !isEnabled) {
    return null;
  }

  return (
    <ProtectedPage>
      <PicksEditor origin={getPicksOrigin(router.query.origin)} />
    </ProtectedPage>
  );
};

const seo: NextSeoProps = {
  title: 'Weekly picks',
  ...noindexSeoProps,
};

NewPicksPage.getLayout = getLayout;
NewPicksPage.layoutProps = { seo };

export default NewPicksPage;
