'use client';

import {
  isServer,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { defaultQueryClientConfig } from '@dailydotdev/shared/src/lib/query';
import { BootApp } from '@dailydotdev/shared/src/lib/boot';
import { BootDataProvider } from '@dailydotdev/shared/src/contexts/BootProvider';
import useWebappVersion from '../hooks/useWebappVersion';
import useDeviceId from '@dailydotdev/shared/src/hooks/log/useDeviceId';

function makeQueryClient() {
  return new QueryClient(defaultQueryClientConfig);
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (isServer) {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    // This is very important, so we don't re-make a new client if React
    // suspends during the initial render. This may not be needed if we
    // have a suspense boundary BELOW the creation of the query client
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

const getRedirectUri = () =>
  `${window.location.origin}${window.location.pathname}`;

const getPage = () => window.location.pathname;

export default function Providers({ children }: { children: React.ReactNode }) {
  // NOTE: Avoid useState when initializing the query client if you don't
  //       have a suspense boundary between this and the code that may
  //       suspend because React will throw away the client on the initial
  //       render if it suspends and there is no boundary
  const queryClient = getQueryClient();
  const version = useWebappVersion();
  const deviceId = useDeviceId();

  return (
    <QueryClientProvider client={queryClient}>
      <BootDataProvider
        app={BootApp.Webapp}
        getRedirectUri={getRedirectUri}
        getPage={getPage}
        version={version}
        deviceId={deviceId}
      >
        {children}
      </BootDataProvider>
    </QueryClientProvider>
  );
}
