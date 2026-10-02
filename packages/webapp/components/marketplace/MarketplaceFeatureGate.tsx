import type { ReactElement, ReactNode } from 'react';
import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useConditionalFeature } from '@dailydotdev/shared/src/hooks/useConditionalFeature';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { featurePluginMarketplace } from '@dailydotdev/shared/src/lib/featureManagement';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';

interface MarketplaceFeatureGateProps {
  children: ReactNode;
}

export const MarketplaceFeatureGate = ({
  children,
}: MarketplaceFeatureGateProps): ReactElement | null => {
  const router = useRouter();
  const { isAuthReady } = useAuthContext();
  const { value: isMarketplaceEnabled, isLoading } = useConditionalFeature({
    feature: featurePluginMarketplace,
    shouldEvaluate: isAuthReady,
  });
  const isGatedOut = !isLoading && !isMarketplaceEnabled;

  useEffect(() => {
    if (isGatedOut) {
      router.replace(webappUrl);
    }
  }, [isGatedOut, router]);

  if (isLoading || !isMarketplaceEnabled) {
    return null;
  }

  return <>{children}</>;
};
