import type { ReactElement } from 'react';
import React, { useCallback } from 'react';
import { useRouter } from 'next/router';
import type { NextSeoProps } from 'next-seo';
import { OnboardingHeader } from '@dailydotdev/shared/src/components/onboarding';
import { NewTabActivationPrimer } from '@dailydotdev/shared/src/features/onboarding/components/NewTabActivationPrimer';
import { ErrorBoundary } from '@dailydotdev/shared/src/components/ErrorBoundary';
import { FooterLinks } from '@dailydotdev/shared/src/components';
import { getPageSeoTitles } from '../components/layouts/utils';
import { defaultOpenGraph, defaultSeo } from '../next-seo';

const seoTitles = getPageSeoTitles('Activate your new tab');
const seo: NextSeoProps = {
  title: seoTitles.title,
  openGraph: { ...seoTitles.openGraph, ...defaultOpenGraph },
  ...defaultSeo,
  noindex: true,
};

function ActivatePage(): ReactElement {
  const router = useRouter();

  // When the primer detects a successful activation (via the localStorage
  // bridge from the new tab page), advance to the regular onboarding flow
  // so signup/funnel kicks in. The user stays on the primer page as long
  // as they need to — no timeout boots them off.
  const handleComplete = useCallback((): void => {
    router.replace('/onboarding');
  }, [router]);

  return (
    <ErrorBoundary feature="onboarding">
      <div className="z-3 flex min-h-dvh w-full flex-1 flex-col items-center overflow-x-hidden">
        <OnboardingHeader />
        <NewTabActivationPrimer onComplete={handleComplete} />
        <FooterLinks className="mx-auto pb-6" />
      </div>
    </ErrorBoundary>
  );
}

ActivatePage.layoutProps = { seo };

export default ActivatePage;
