import type { ReactElement } from 'react';
import React, { useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import type { NextSeoProps } from 'next-seo';
import { OnboardingHeader } from '@dailydotdev/shared/src/components/onboarding/OnboardingHeader';
import { NewTabActivationPrimer } from '@dailydotdev/shared/src/features/onboarding/components/NewTabActivationPrimer';
import { ErrorBoundary } from '@dailydotdev/shared/src/components/ErrorBoundary';
import { useConditionalFeature } from '@dailydotdev/shared/src/hooks/useConditionalFeature';
import { featureOnboardingPermissionPrimer } from '@dailydotdev/shared/src/lib/featureManagement';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import { LogEvent } from '@dailydotdev/shared/src/lib/log';
import { getPageSeoTitles } from '../components/layouts/utils';
import { defaultOpenGraph, defaultSeo } from '../next-seo';

const seoTitles = getPageSeoTitles('Activate your new tab');
const seo: NextSeoProps = {
  title: seoTitles.title,
  openGraph: { ...seoTitles.openGraph, ...defaultOpenGraph },
  ...defaultSeo,
  noindex: true,
};

function ActivatePage(): ReactElement | null {
  const router = useRouter();
  const { logEvent } = useLogContext();
  const { value: isPrimerEnabled, isLoading } = useConditionalFeature({
    feature: featureOnboardingPermissionPrimer,
  });

  useEffect(() => {
    if (isLoading || isPrimerEnabled) {
      return;
    }
    logEvent({ event_name: LogEvent.ExtensionPrimerSkipped });
    router.replace('/onboarding');
  }, [isLoading, isPrimerEnabled, logEvent, router]);

  const handleComplete = useCallback((): void => {
    router.replace('/onboarding');
  }, [router]);

  if (isLoading || !isPrimerEnabled) {
    return null;
  }

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
