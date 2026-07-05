import type { ReactElement } from 'react';
import React, { useCallback } from 'react';
import { useRouter } from 'next/router';
import type { NextSeoProps } from 'next-seo';
import { OnboardingHeader } from '@dailydotdev/shared/src/components/onboarding/OnboardingHeader';
import { NewTabActivationPrimer } from '@dailydotdev/shared/src/features/onboarding/components/NewTabActivationPrimer';
import { ErrorBoundary } from '@dailydotdev/shared/src/components/ErrorBoundary';
import { getPageSeoTitles } from '../components/layouts/utils';
import { defaultOpenGraph, defaultSeo } from '../next-seo';

const seoTitles = getPageSeoTitles('Activate your new tab');
const seo: NextSeoProps = {
  title: seoTitles.title,
  openGraph: { ...seoTitles.openGraph, ...defaultOpenGraph },
  ...defaultSeo,
  noindex: true,
};

// Whether install referrals reach this page is decided upstream in `_app`
// via the permission primer flag. Once here, the primer stays put until the
// user acts on it — no per-user re-evaluation, so it never bounces out.
function ActivatePage(): ReactElement {
  const router = useRouter();

  const handleComplete = useCallback((): void => {
    router.replace('/onboarding');
  }, [router]);

  return (
    <ErrorBoundary feature="onboarding">
      <div className="z-3 flex min-h-dvh w-full flex-1 flex-col items-center overflow-x-hidden">
        <OnboardingHeader />
        <NewTabActivationPrimer onComplete={handleComplete} />
      </div>
    </ErrorBoundary>
  );
}

ActivatePage.layoutProps = { seo };

export default ActivatePage;
