import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useRef } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SelectionShareBar } from '@dailydotdev/shared/src/components/post/SelectionShareBar';
import { getLogContextStatic } from '@dailydotdev/shared/src/contexts/LogContext';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import {
  FeaturesReadyContext,
  GrowthBookProvider,
} from '@dailydotdev/shared/src/components/GrowthBookProvider';
import { BootApp } from '@dailydotdev/shared/src/lib/boot';
import type { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { fn } from 'storybook/test';

const mockUser = {
  id: '1',
  name: 'Test User',
  username: 'testuser',
  email: 'test@example.com',
  image: 'https://daily-now-res.cloudinary.com/image/upload/placeholder.jpg',
  providers: ['google'],
  createdAt: '2024-01-01T00:00:00.000Z',
  permalink: 'https://daily.dev/testuser',
} as unknown as LoggedUser;

const post = {
  id: 'post-1',
  title: 'How to ship fast without breaking everything',
  commentsPermalink: 'https://daily.dev/posts/how-to-ship-fast',
  permalink: 'https://daily.dev/r/how-to-ship-fast',
  source: { id: 'daily', name: 'daily.dev', handle: 'daily' },
  author: { id: '1', name: 'Ido Shamun' },
} as unknown as Post;

const body = [
  'Shipping fast is not about typing faster. It is about shrinking the distance',
  'between a decision and the moment a real developer feels its effect. Select',
  'any part of this paragraph to raise the floating share bar — copy a link to',
  'the post, copy the selection itself, or turn it into a quote image.',
].join(' ');

// The bar only reacts to selections made inside the container it is handed, so
// every story renders a fake post body to select from.
const SelectionPlayground = ({ compact = false }: { compact?: boolean }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className={
        compact
          ? 'mx-auto flex max-w-2xl flex-col gap-4'
          : 'mx-auto flex max-w-2xl flex-col gap-4 p-6'
      }
    >
      {!compact && (
        <p className="text-text-tertiary typo-footnote">
          Select text inside the card below.
        </p>
      )}
      <div
        ref={containerRef}
        className="select-text rounded-16 border border-border-subtlest-tertiary bg-surface-float p-6 text-text-primary typo-body"
      >
        <h1 className="mb-3 font-bold typo-title2">{post.title}</h1>
        <p>{body}</p>
      </div>
      <p className="text-text-tertiary typo-footnote">
        Selecting text outside the card does nothing.
      </p>
      <p className="text-text-secondary typo-body">{body}</p>
      <SelectionShareBar containerRef={containerRef} post={post} />
    </div>
  );
};

// Storybook aliases `@growthbook/growthbook` to a mock whose `getFeatureValue`
// coerces every falsy default to the truthy string `'control'`, so a flag can't
// be evaluated as `false` here. Flag-off is therefore simulated by holding the
// features context as "not ready", which is the exact path
// `useConditionalFeature` takes to fall back to the (false) default value.
const withProviders =
  (enabled: boolean) =>
  (Story: React.ComponentType): React.ReactElement => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, staleTime: Infinity } },
    });
    // Mock the short-URL resolution so copy/share actions don't hit network.
    queryClient.setQueryData(['shortUrl'], 'https://dly.to/abc123');

    const LogContext = getLogContextStatic();

    return (
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider
          value={
            {
              user: mockUser,
              shouldShowLogin: false,
              isLoggedIn: true,
              isAuthReady: true,
              showLogin: fn(),
              closeLogin: fn(),
              logout: fn(),
              updateUser: fn(),
              tokenRefreshed: true,
              getRedirectUri: fn(),
              loadingUser: false,
              loadedUserFromCache: true,
              refetchBoot: fn(),
              squads: [],
              isAndroidApp: false,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any
          }
        >
          <GrowthBookProvider
            app={BootApp.Webapp}
            user={mockUser}
            deviceId="storybook"
          >
            <FeaturesReadyContext.Provider
              value={{
                ready: enabled,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                getFeatureValue: (feature) => feature.defaultValue as any,
              }}
            >
              <LogContext.Provider
                value={{
                  logEvent: fn(),
                  logEventStart: fn(),
                  logEventEnd: fn(),
                  sendBeacon: () => false,
                }}
              >
                <Story />
              </LogContext.Provider>
            </FeaturesReadyContext.Provider>
          </GrowthBookProvider>
        </AuthContext.Provider>
      </QueryClientProvider>
    );
  };

const meta: Meta<typeof SelectionShareBar> = {
  title: 'Components/Share/SelectionShareBar',
  component: SelectionShareBar,
  parameters: {
    docs: {
      description: {
        component:
          'Floating share bar anchored to a text selection inside a post body. Behind the `share_text_selection` flag plus the `sharing_visibility` master gate.',
      },
    },
  },
  decorators: [withProviders(true)],
};

export default meta;

type Story = StoryObj<typeof SelectionShareBar>;

// Desktop: the bar floats above the selection and follows it while scrolling.
export const Desktop: Story = {
  render: () => <SelectionPlayground />,
};

// Mobile: same bar, but "Copy link" hands off to the native share sheet when
// the device exposes one, and the bar clamps to the visual viewport.
export const Mobile: Story = {
  render: () => <SelectionPlayground />,
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};

// A selection near the very top of the viewport has no room above it, so the
// bar flips underneath the selection instead.
export const FlippedBelow: Story = {
  render: () => <SelectionPlayground compact />,
};

// Control: selecting text raises nothing at all — no bar, no listeners.
export const FlagOff: Story = {
  render: () => <SelectionPlayground />,
  decorators: [withProviders(false)],
};
