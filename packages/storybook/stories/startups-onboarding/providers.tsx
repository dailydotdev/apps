import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { SpotlightProvider } from '@dailydotdev/shared/src/components/spotlight/SpotlightContext';
import { featureStartupsCheckout } from '@dailydotdev/shared/src/lib/featureManagement';
import { FeatureOverrides } from '../../mock/GrowthBookProvider';
import ExtensionProviders from '../extension/_providers';

/** What every screen in this folder renders inside. */
export const Providers = ({
  children,
}: {
  children: ReactNode;
}): ReactElement => (
  <ExtensionProviders>
    <FeatureOverrides values={{ [featureStartupsCheckout.id]: true }}>
      <SpotlightProvider>{children}</SpotlightProvider>
    </FeatureOverrides>
  </ExtensionProviders>
);
