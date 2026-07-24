import type { ReactElement, ReactNode } from 'react';
import React, { useMemo } from 'react';
import type { Decorator } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthContextProvider } from '@dailydotdev/shared/src/contexts/AuthContext';
import { getLogContextStatic } from '@dailydotdev/shared/src/contexts/LogContext';
import type { UserShortProfile } from '@dailydotdev/shared/src/lib/user';

const noop = (): void => undefined;

export const MOCK_USER = {
  id: 'sb-user',
  name: 'Dev Dana',
  username: 'devdana',
  image:
    'https://media.daily.dev/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile',
  permalink: 'https://app.daily.dev/devdana',
  bio: null,
  createdAt: '2021-01-01T00:00:00.000Z',
  reputation: 42,
  providers: ['github'],
} as const;

export const INVITE_LINK = 'https://api.daily.dev/get?r=devdana';

// Mirrors labels.referral.generic.inviteText, the text the real page shares.
export const INVITE_TEXT = `I'm using daily.dev to stay updated on developer news. I think you will find it helpful:`;

// The developers who joined through the link. Stories slice this list to get a
// given progress state, so slot N is always the same person.
export const mockReferredUsers = (): UserShortProfile[] =>
  [
    {
      id: 'ref-1',
      name: 'Ida Kern',
      username: 'idakern',
      image:
        'https://media.daily.dev/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile',
      permalink: 'https://app.daily.dev/idakern',
      createdAt: '2026-05-04T10:00:00.000Z',
      reputation: 120,
    },
    {
      id: 'ref-2',
      name: 'Ravi Menon',
      username: 'ravimenon',
      image:
        'https://media.daily.dev/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile',
      permalink: 'https://app.daily.dev/ravimenon',
      createdAt: '2026-06-11T10:00:00.000Z',
      reputation: 340,
    },
    {
      id: 'ref-3',
      name: 'Wren Halloway',
      username: 'wrenh',
      image:
        'https://media.daily.dev/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile',
      permalink: 'https://app.daily.dev/wrenh',
      createdAt: '2026-07-02T10:00:00.000Z',
      reputation: 88,
    },
    {
      id: 'ref-4',
      name: 'Søren Bakke',
      username: 'sorenb',
      image:
        'https://media.daily.dev/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile',
      permalink: 'https://app.daily.dev/sorenb',
      createdAt: '2026-07-19T10:00:00.000Z',
      reputation: 15,
    },
  ] as UserShortProfile[];

const InviteProviders = ({
  children,
}: {
  children: ReactNode;
}): ReactElement => {
  const queryClient = useMemo(() => new QueryClient(), []);
  const LogContext = getLogContextStatic();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContextProvider
        user={MOCK_USER as never}
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

// The stories drive Plus/flag state through args, so the providers only need to
// supply a signed-in user, a query client, and a no-op log context.
export const withInvite =
  (): Decorator =>
  (Story) =>
    (
      <InviteProviders>
        <Story />
      </InviteProviders>
    );
