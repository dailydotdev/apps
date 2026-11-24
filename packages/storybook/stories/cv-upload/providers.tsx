import type { ReactElement, ReactNode } from 'react';
import React, { useMemo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthContextProvider } from '@dailydotdev/shared/src/contexts/AuthContext';
import { getLogContextStatic } from '@dailydotdev/shared/src/contexts/LogContext';
import { SettingsContextProvider } from '@dailydotdev/shared/src/contexts/SettingsContext';
import type { ProfileCompletion } from '@dailydotdev/shared/src/lib/user';
import {
  generateQueryKey,
  RequestKey,
} from '@dailydotdev/shared/src/lib/query';
import { UserExperienceType } from '@dailydotdev/shared/src/graphql/user/profile';

// A logged-in user 40% through their profile, with no network: enough for
// the profile completion card and the CV banner to render. The cache says
// they have no CV and no work or education, so the production components
// take their empty, CV-asking paths.

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

export const user = {
  id: 'sb-user',
  name: 'Dev Dana',
  username: 'dana',
  image: avatar,
  bio: 'Frontend developer',
  permalink: 'https://app.daily.dev/dana',
  createdAt: '2024-03-01T00:00:00.000Z',
  reputation: 120,
  providers: ['github'],
  profileCompletion: completion,
};

const seed = (client: QueryClient): void => {
  client.setQueryData(generateQueryKey(RequestKey.Actions, user), {
    actions: [],
    serverLoaded: true,
  });
  [UserExperienceType.Work, UserExperienceType.Education].forEach((type) =>
    client.setQueryData(
      generateQueryKey(RequestKey.UserExperience, user, type, 'settings'),
      { edges: [], pageInfo: { hasNextPage: false } },
    ),
  );
};

export const CvProviders = ({
  children,
}: {
  children: ReactNode;
}): ReactElement => {
  const LogContext = getLogContextStatic();
  const queryClient = useMemo(() => {
    const client = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          refetchOnWindowFocus: false,
          staleTime: Infinity,
        },
      },
    });
    seed(client);
    return client;
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContextProvider
        user={user as never}
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
        {/* Not loaded, so it leaves the theme to Storybook's toolbar. */}
        <SettingsContextProvider loadedSettings={false}>
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
        </SettingsContextProvider>
      </AuthContextProvider>
    </QueryClientProvider>
  );
};
