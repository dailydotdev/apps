import type { ReactElement, ReactNode } from 'react';
import React, { useMemo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthContextProvider } from '@dailydotdev/shared/src/contexts/AuthContext';
import { getLogContextStatic } from '@dailydotdev/shared/src/contexts/LogContext';
import type { ProfileCompletion } from '@dailydotdev/shared/src/lib/user';

// A logged-in user 40% through their profile, with no network: enough for
// the profile completion card and the CV banner to render.

const noop = (): void => undefined;

export const avatar =
  'https://media.daily.dev/image/upload/f_auto,q_auto/v1/placeholders/1';

export const completion: ProfileCompletion = {
  percentage: 40,
  hasProfileImage: true,
  hasHeadline: true,
  hasExperienceLevel: false,
  hasWork: false,
  hasEducation: false,
};

export const CvProviders = ({
  children,
}: {
  children: ReactNode;
}): ReactElement => {
  const LogContext = getLogContextStatic();
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: false, refetchOnWindowFocus: false },
        },
      }),
    [],
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContextProvider
        user={
          {
            id: 'sb-user',
            name: 'Dev Dana',
            username: 'dana',
            image: avatar,
            providers: ['github'],
            profileCompletion: completion,
          } as never
        }
        firstLoad={false}
        isFetched
        loadingUser={false}
        tokenRefreshed
        loadedUserFromCache
        getRedirectUri={() => ''}
        updateUser={noop as never}
        refetchBoot={noop as never}
        visit={{ visitId: 'sb', sessionId: 'sb' } as never}
        accessToken={null as never}
        squads={[]}
        feeds={undefined}
        geo={{} as never}
        isAndroidApp={false}
      >
        <LogContext.Provider
          value={{
            logEvent: noop,
            logEventStart: noop,
            logEventEnd: noop,
            sendBeacon: noop,
          }}
        >
          {children}
        </LogContext.Provider>
      </AuthContextProvider>
    </QueryClientProvider>
  );
};
