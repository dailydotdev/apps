import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { Mock } from 'storybook/test';
import { fn } from 'storybook/test';
import { useRouter } from 'next/router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { AuthContextData } from '@dailydotdev/shared/src/contexts/AuthContext';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { getLogContextStatic } from '@dailydotdev/shared/src/contexts/LogContext';
import type { LogContextData } from '@dailydotdev/shared/src/hooks/log/useLogContextData';
import { featureMobileAppSheet } from '@dailydotdev/shared/src/lib/featureManagement';
import { PersistentContextKeys } from '@dailydotdev/shared/src/hooks/usePersistentContext';
import { MobileAppFooter } from '@dailydotdev/shared/src/features/getApp/components/MobileAppFooter';
import { MobileAppSheet } from '@dailydotdev/shared/src/features/getApp/components/MobileAppSheet';
import { FeatureOverrides } from '../../mock/GrowthBookProvider';

const LogContext = getLogContextStatic();

const titles = [
  'See all posts',
  'See all comments',
  'See all tags',
  'See all sources',
  'See all squads',
  'See full squad',
  'See full profile',
  'See full leaderboard',
];

interface Args {
  title: string;
}

const Providers = ({
  isLoggedIn,
  children,
}: {
  isLoggedIn: boolean;
  children: ReactNode;
}): ReactElement => (
  <QueryClientProvider client={new QueryClient()}>
    <AuthContext.Provider
      value={
        {
          isAuthReady: true,
          isLoggedIn,
          isAndroidApp: false,
          showLogin: fn().mockName('showLogin'),
        } as unknown as AuthContextData
      }
    >
      <LogContext.Provider
        value={{ logEvent: fn() } as unknown as LogContextData}
      >
        <FeatureOverrides values={{ [featureMobileAppSheet.id]: true }}>
          <div className="min-h-screen bg-background-default">{children}</div>
        </FeatureOverrides>
      </LogContext.Provider>
    </AuthContext.Provider>
  </QueryClientProvider>
);

const PageBehind = (): ReactElement => (
  <div className="flex flex-col gap-4 p-4">
    {[1, 2, 3, 4, 5, 6].map((row) => (
      <div
        key={row}
        className="h-24 rounded-16 border border-border-subtlest-tertiary bg-surface-float"
      />
    ))}
  </div>
);

const meta: Meta<Args> = {
  title: 'Mobile Sticky Footer/Implementation',
  args: { title: titles[1] },
  argTypes: { title: { control: 'select', options: titles } },
  parameters: { layout: 'fullscreen' },
  globals: { viewport: { value: 'mobile2', isRotated: false } },
  beforeEach: () => {
    (useRouter as unknown as Mock).mockReturnValue({
      isReady: true,
      pathname: '/posts',
      asPath: '/posts',
      query: {},
      push: fn(),
      replace: fn(),
      back: fn(),
    });
  },
};

export default meta;

type Story = StoryObj<Args>;

export const CharmFooter: Story = {
  name: 'Logged out: Charm footer',
  render: ({ title }) => (
    <Providers isLoggedIn={false}>
      <PageBehind />
      <div className="fixed inset-x-0 bottom-0">
        <MobileAppFooter title={title} />
      </div>
    </Providers>
  ),
};

export const EveryTitle: Story = {
  name: 'Logged out: every title',
  render: () => (
    <Providers isLoggedIn={false}>
      <div className="flex flex-col gap-6 py-4">
        {titles.map((title) => (
          <MobileAppFooter key={title} title={title} />
        ))}
      </div>
    </Providers>
  ),
};

// Open and Continue are remembered in the app's IndexedDB store; forget
// them so the story shows the sheet on every visit.
const forgetSheetChoice = async (): Promise<void> => {
  const databases = (await indexedDB.databases?.()) ?? [];
  if (!databases.some(({ name }) => name === 'keyval-store')) {
    return;
  }

  await new Promise<void>((resolve) => {
    const request = indexedDB.open('keyval-store');
    request.onerror = () => resolve();
    request.onsuccess = () => {
      const db = request.result;
      try {
        const transaction = db.transaction('keyval', 'readwrite');
        transaction
          .objectStore('keyval')
          .delete(PersistentContextKeys.MobileAppSheet);
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => resolve();
      } catch {
        resolve();
      } finally {
        db.close();
      }
    };
  });
};

export const ContinueSheet: Story = {
  name: 'Logged in: See daily.dev in…',
  beforeEach: forgetSheetChoice,
  render: () => (
    <Providers isLoggedIn>
      <PageBehind />
      <MobileAppSheet />
    </Providers>
  ),
};
