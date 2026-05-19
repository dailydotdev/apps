import type { ReactElement } from 'react';
import React from 'react';
import type { NextSeoProps } from 'next-seo';

import { useConditionalFeature } from '@dailydotdev/shared/src/hooks';
import { featureBriefingHome } from '@dailydotdev/shared/src/lib/featureManagement';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { Loader } from '@dailydotdev/shared/src/components/Loader';
import { getLayout } from '../components/layouts/MainLayout';
import ProtectedPage from '../components/ProtectedPage';
import { getPageSeoTitles } from '../components/layouts/utils';
import { BriefingHomePage } from '../components/briefingHome/BriefingHomePage';

const BriefPage = (): ReactElement => {
  const { isAuthReady, isLoggedIn } = useAuthContext();
  const { value: enabled } = useConditionalFeature({
    feature: featureBriefingHome,
    shouldEvaluate: isLoggedIn,
  });

  if (!isAuthReady) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!enabled) {
    return (
      <div className="mx-auto max-w-md p-12 text-center text-text-tertiary">
        The new briefing experience is not enabled for your account yet.
      </div>
    );
  }

  return (
    <ProtectedPage>
      <BriefingHomePage />
    </ProtectedPage>
  );
};

const seo: NextSeoProps = {
  ...getPageSeoTitles('Your brief'),
  description:
    'Your daily brief. The conversations and topics from your circles, condensed to a few minutes of reading.',
  nofollow: true,
  noindex: true,
};

BriefPage.getLayout = getLayout;
BriefPage.layoutProps = { seo };

export default BriefPage;
