'use client';

import type { PropsWithChildren, ReactElement } from 'react';
import React, { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { getQueryClient } from '@dailydotdev/shared/src/graphql/queryClient';
import { AppSubscriptionContextProvider } from '@dailydotdev/shared/src/contexts/SubscriptionContext';
import { ProgressiveEnhancementContextProvider } from '@dailydotdev/shared/src/contexts/ProgressiveEnhancementContext';
import { BootApp } from '@dailydotdev/shared/src/lib/boot';
import { BootDataProvider } from '@dailydotdev/shared/src/contexts/BootProvider';
import useDeviceId from '@dailydotdev/shared/src/hooks/log/useDeviceId';
import { PixelsProvider } from '../context/PixelsContext';
import useWebappVersion from '../hooks/useWebappVersion';
import { getPage, getRedirectUri } from '../pages/_app';

export default function Providers({
  children,
}: PropsWithChildren): ReactElement {
  const [queryClient] = useState(() => getQueryClient());
  const version = useWebappVersion();
  const deviceId = useDeviceId();

  return (
    <ProgressiveEnhancementContextProvider>
      <QueryClientProvider client={queryClient}>
        <BootDataProvider
          app={BootApp.Webapp}
          getRedirectUri={getRedirectUri}
          getPage={getPage}
          version={version}
          deviceId={deviceId}
        >
          <PixelsProvider>
            <AppSubscriptionContextProvider>
              {children}
            </AppSubscriptionContextProvider>
          </PixelsProvider>
        </BootDataProvider>
      </QueryClientProvider>
    </ProgressiveEnhancementContextProvider>
  );
}
