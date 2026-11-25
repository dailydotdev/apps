import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { SpotlightProvider } from '@dailydotdev/shared/src/components/spotlight/SpotlightContext';
import ExtensionProviders from '../extension/_providers';

/** What every screen in this folder renders inside. */
export const Providers = ({
  children,
}: {
  children: ReactNode;
}): ReactElement => (
  <ExtensionProviders>
    <SpotlightProvider>{children}</SpotlightProvider>
  </ExtensionProviders>
);
