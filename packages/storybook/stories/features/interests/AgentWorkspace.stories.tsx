import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthContextProvider } from '@dailydotdev/shared/src/contexts/AuthContext';
import { getLogContextStatic } from '@dailydotdev/shared/src/contexts/LogContext';
import SettingsContext from '@dailydotdev/shared/src/contexts/SettingsContext';
import { AgentProvider } from '@dailydotdev/shared/src/features/interests/AgentContext';
import { AgentWorkspace } from '@dailydotdev/shared/src/features/interests/components/AgentWorkspace';
import {
  mockAgentPosts,
  mockInterest,
} from '@dailydotdev/shared/src/features/interests/mock';
import { mockConversation } from '@dailydotdev/shared/src/features/interests/chat';
import { mockFeedItems } from '@dailydotdev/shared/src/features/interests/mockFeed';

const noop = (): void => undefined;

const MOCK_USER = {
  id: 'sb-user',
  name: 'Dev Dana',
  username: 'devdana',
  image:
    'https://media.daily.dev/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile',
  permalink: 'https://app.daily.dev/devdana',
  createdAt: '2021-01-01T00:00:00.000Z',
  reputation: 42,
  providers: ['github'],
} as const;

const Providers = ({ children }: { children: ReactNode }): ReactElement => {
  const LogContext = getLogContextStatic();

  return (
    <QueryClientProvider client={new QueryClient()}>
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
          <SettingsContext.Provider
            value={
              {
                insaneMode: false,
                spaciness: 'roomy',
                loadedSettings: true,
                openNewTab: false,
                flags: {},
              } as never
            }
          >
            <div className="bg-background-default text-text-primary">
              {children}
            </div>
          </SettingsContext.Provider>
        </LogContext.Provider>
      </AuthContextProvider>
    </QueryClientProvider>
  );
};

const meta: Meta<typeof AgentWorkspace> = {
  title: 'Features/Interests/AgentWorkspace',
  component: AgentWorkspace,
  parameters: { layout: 'fullscreen' },
  render: () => (
    <Providers>
      <AgentProvider
        id="demo"
        interest={mockInterest}
        isDemo
        initialMessages={mockConversation}
      >
        <AgentWorkspace
          items={mockFeedItems}
          postsCount={mockAgentPosts.length}
          onDelete={noop}
          isDeleting={false}
        />
      </AgentProvider>
    </Providers>
  ),
};

export default meta;

export const Default: StoryObj<typeof AgentWorkspace> = {};
