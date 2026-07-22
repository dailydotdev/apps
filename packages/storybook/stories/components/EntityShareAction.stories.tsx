import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fn } from 'storybook/test';
import { EntityShareAction } from '@dailydotdev/shared/src/components/share/EntityShareAction';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  BlockIcon,
  MenuIcon,
  MiniCloseIcon,
  PlusIcon,
} from '@dailydotdev/shared/src/components/icons';
import { getLogContextStatic } from '@dailydotdev/shared/src/contexts/LogContext';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import {
  FeaturesReadyContext,
  GrowthBookProvider,
} from '@dailydotdev/shared/src/components/GrowthBookProvider';
import { BootApp } from '@dailydotdev/shared/src/lib/boot';
import { useShareTagsSources } from '@dailydotdev/shared/src/hooks/useShareTagsSources';
import { LogEvent, Origin } from '@dailydotdev/shared/src/lib/log';
import { ReferralCampaignKey } from '@dailydotdev/shared/src/lib/referral';
import { getShortLinkProps } from '@dailydotdev/shared/src/hooks/utils/useGetShortUrl';
import type { LoggedUser } from '@dailydotdev/shared/src/lib/user';

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

const SHORT_LINK = 'https://dly.to/abc123';

type Entity = 'tag' | 'source';

const entityConfig: Record<
  Entity,
  {
    link: string;
    text: string;
    cid: ReferralCampaignKey;
    event: LogEvent;
    targetId: string;
    origin: Origin;
    /** Matches the gap the real header action row uses on each surface. */
    rowClassName: string;
  }
> = {
  tag: {
    link: 'https://daily.dev/tags/webdev',
    text: 'Check out the webdev tag on daily.dev',
    cid: ReferralCampaignKey.ShareTag,
    event: LogEvent.ShareTag,
    targetId: 'webdev',
    origin: Origin.TagPage,
    rowClassName: 'gap-3',
  },
  source: {
    link: 'https://app.daily.dev/sources/tds',
    text: 'Check out tds on daily.dev',
    cid: ReferralCampaignKey.ShareSource,
    event: LogEvent.ShareSource,
    targetId: 'tds',
    origin: Origin.SourcePage,
    rowClassName: 'gap-2',
  },
};

interface ActionRowProps {
  entity: Entity;
  isFollowing: boolean;
}

// Mirrors how the real surfaces gate: the parent resolves the flag and either
// renders the promoted control (and drops the in-menu entry) or falls back to
// the "…"-menu-only control.
const ActionRow = ({ entity, isFollowing }: ActionRowProps) => {
  const config = entityConfig[entity];
  const isShareVisible = useShareTagsSources();

  return (
    <div className={`inline-flex flex-row items-center ${config.rowClassName}`}>
      <Button
        type="button"
        size={ButtonSize.Small}
        variant={ButtonVariant.Primary}
        icon={isFollowing ? <MiniCloseIcon /> : <PlusIcon />}
      >
        {isFollowing ? 'Following' : 'Follow'}
      </Button>
      {!isFollowing && (
        <Button
          type="button"
          size={ButtonSize.Small}
          variant={ButtonVariant.Float}
          icon={<BlockIcon />}
        >
          Block
        </Button>
      )}
      {isShareVisible && (
        <EntityShareAction
          link={config.link}
          text={config.text}
          cid={config.cid}
          event={config.event}
          targetId={config.targetId}
          origin={config.origin}
        />
      )}
      <Button
        type="button"
        size={ButtonSize.Small}
        variant={ButtonVariant.Float}
        icon={<MenuIcon />}
        aria-label="Options"
      />
    </div>
  );
};

// Storybook aliases `@growthbook/growthbook` to a mock whose `getFeatureValue`
// coerces every falsy default to the truthy string `'control'`, so a flag can't
// evaluate to `false` here. Flag-off is therefore simulated by holding the
// features context as "not ready", which is the exact path
// `useConditionalFeature` takes to fall back to the (false) default value.
const withProviders =
  (enabled: boolean) =>
  (Story: React.ComponentType): React.ReactElement => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, staleTime: Infinity } },
    });

    // Seed the resolved short URL for both campaigns so nothing hits network.
    [ReferralCampaignKey.ShareTag, ReferralCampaignKey.ShareSource].forEach(
      (cid) => {
        Object.values(entityConfig).forEach((config) => {
          const { queryKey } = getShortLinkProps(config.link, cid, mockUser);
          queryClient.setQueryData(queryKey, SHORT_LINK);
        });
      },
    );

    const LogContext = getLogContextStatic();

    return (
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider
          value={
            {
              user: mockUser,
              isLoggedIn: true,
              isAuthReady: true,
              tokenRefreshed: true,
              shouldShowLogin: false,
              showLogin: fn(),
              closeLogin: fn(),
              logout: fn(),
              updateUser: fn(),
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
                getFeatureValue: (feature) =>
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  feature.defaultValue as any,
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
                <div className="flex min-h-40 items-center justify-center p-4">
                  <Story />
                </div>
              </LogContext.Provider>
            </FeaturesReadyContext.Provider>
          </GrowthBookProvider>
        </AuthContext.Provider>
      </QueryClientProvider>
    );
  };

const meta: Meta<typeof ActionRow> = {
  title: 'Components/Share/EntityShareAction',
  component: ActionRow,
  args: { entity: 'tag', isFollowing: false },
  argTypes: {
    entity: { control: 'inline-radio', options: ['tag', 'source'] },
    isFollowing: { control: 'boolean' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Promotes share out of the tag/source "…" options menu into the header action row. A vertical rule and a ghost icon button keep it distinct from the filled Follow/Following button. Gated by `share_tags_sources` plus the `sharing_visibility` master flag.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof ActionRow>;

// Flag on — tag page row, not following yet (Follow + Block + share).
export const TagNotFollowing: Story = {
  decorators: [withProviders(true)],
  args: { entity: 'tag', isFollowing: false },
};

// Flag on — tag page row for a followed tag (Block is replaced by nothing).
export const TagFollowing: Story = {
  decorators: [withProviders(true)],
  args: { entity: 'tag', isFollowing: true },
};

// Flag on — source page row, tighter `gap-2` action row.
export const SourceNotFollowing: Story = {
  decorators: [withProviders(true)],
  args: { entity: 'source', isFollowing: false },
};

export const SourceFollowing: Story = {
  decorators: [withProviders(true)],
  args: { entity: 'source', isFollowing: true },
};

// Flag off — must render exactly what ships today: share stays in the "…" menu.
export const Control: Story = {
  decorators: [withProviders(false)],
  args: { entity: 'tag', isFollowing: false },
};

// Mobile: a single tap opens the native share sheet instead of the popover.
export const TagMobile: Story = {
  decorators: [withProviders(true)],
  args: { entity: 'tag', isFollowing: true },
  globals: { viewport: { value: 'mobile1' } },
};
