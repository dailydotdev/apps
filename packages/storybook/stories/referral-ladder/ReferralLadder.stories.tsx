import type { Meta, StoryObj } from '@storybook/react-vite';
import type { PropsWithChildren, ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fn } from 'storybook/test';
import { delay, graphql, http, HttpResponse } from 'msw';
import { BootDataProvider } from '@dailydotdev/shared/src/contexts/BootProvider';
import { ActiveFeedContext } from '@dailydotdev/shared/src/contexts';
import { BootApp } from '@dailydotdev/shared/src/lib/boot';
import ProfileMenu from '@dailydotdev/shared/src/components/ProfileMenu/ProfileMenu';
import ReferralLadderModal from '@dailydotdev/shared/src/components/modals/referral/ReferralLadderModal';
import { useLazyModal } from '@dailydotdev/shared/src/hooks/useLazyModal';
import { useReferralReminderModal } from '@dailydotdev/shared/src/hooks/referral/useReferralReminderModal';
import { LazyModalElement } from '@dailydotdev/shared/src/components/modals/LazyModalElement';
import { referralLadderQueryOptions } from '@dailydotdev/shared/src/graphql/users';
import {
  generateQueryKey,
  RequestKey,
} from '@dailydotdev/shared/src/lib/query';
import { TargetId } from '@dailydotdev/shared/src/lib/log';
import defaultUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import AccountInvitePage from '../../../webapp/pages/settings/invite';
import { defaultBootData, getBootMock } from '../../mock/boot';
import { friends, getLadder, LadderState } from './_mock';

interface LadderArgs {
  state: LadderState;
}

const getLadderBoot = (state: LadderState) => ({
  ...defaultBootData,
  user: {
    ...defaultUser,
    isReferralLadderEligible: state !== LadderState.Ineligible,
  },
  accessToken: { token: '1', expiresIn: '1' },
  visit: { sessionId: '1', visitId: '1' },
  feeds: [],
});

const createClient = (state: LadderState): QueryClient => {
  const client = new QueryClient();
  const ladder = getLadder(state);

  if (ladder) {
    client.setQueryData(
      referralLadderQueryOptions(defaultUser).queryKey,
      ladder,
    );
  }

  // All-time referrals for the settings page list, which the ladder ignores.
  client.setQueryData(generateQueryKey(RequestKey.ReferredUsers, defaultUser), {
    pages: [
      {
        referredUsers: {
          pageInfo: { endCursor: null, hasNextPage: false },
          edges: friends
            .slice(0, ladder?.referredCount ?? 1)
            .map((friend, index) => ({
              node: {
                ...friend,
                createdAt: new Date(2026, 8, 21 + index).toISOString(),
              },
            })),
        },
      },
    ],
    pageParams: [''],
  });

  return client;
};

const LadderProviders = ({
  state,
  children,
}: PropsWithChildren<LadderArgs>): ReactElement => {
  const [queryClient] = useState(() => createClient(state));
  const [bootData] = useState(() => getLadderBoot(state));

  return (
    <QueryClientProvider client={queryClient}>
      <BootDataProvider
        app={BootApp.Extension}
        deviceId="123"
        getPage={fn()}
        getRedirectUri={fn()}
        version="pwa"
        localBootData={bootData}
      >
        <ActiveFeedContext.Provider value={{ items: [], queryKey: [] }}>
          <div id="__next" className="min-h-screen bg-background-default">
            {children}
            <LazyModalElement />
          </div>
        </ActiveFeedContext.Provider>
      </BootDataProvider>
    </QueryClientProvider>
  );
};

// Mirrors BootPopups: the reminder waits for the ladder before picking a popup.
const ReminderPopup = (): ReactElement => {
  const modal = useReferralReminderModal({ enabled: true });
  const { openModal } = useLazyModal();

  useEffect(() => {
    if (modal) {
      openModal({ type: modal, props: { isDrawerOnMobile: true } });
    }
  }, [modal, openModal]);

  return (
    <p className="p-6 text-text-tertiary typo-callout">
      {modal ? `Opened ${modal}` : 'Nothing opens until the ladder loads.'}
    </p>
  );
};

const meta: Meta<LadderArgs> = {
  title: 'Features/Referral Ladder',
  args: { state: LadderState.OneJoined },
  // The boot refetch would otherwise return the default, ineligible user.
  beforeEach: ({ args }) => {
    getBootMock.mockReturnValue(getLadderBoot(args.state));
  },
  argTypes: {
    state: {
      name: 'State',
      control: { type: 'select' },
      options: Object.values(LadderState),
    },
  },
  parameters: {
    layout: 'fullscreen',
    msw: {
      handlers: [
        // Only reached by the loading state, the others are seeded.
        graphql.query('ReferralLadder', async () => {
          await delay('infinite');
        }),
        graphql.query('ReferralCampaign', () =>
          HttpResponse.json({
            data: {
              referralCampaign: {
                referredUsersCount: 1,
                referralCountLimit: 0,
                referralToken: 'mock',
                url: `https://dly.to/${defaultUser.username}`,
              },
            },
          }),
        ),
        http.post('*/e', () => new HttpResponse(null, { status: 204 })),
      ],
    },
  },
};

export default meta;
type Story = StoryObj<LadderArgs>;

export const ProfileMenuEntry: Story = {
  name: 'Profile menu',
  render: ({ state }) => (
    <LadderProviders key={state} state={state}>
      <ProfileMenu onClose={fn()} />
    </LadderProviders>
  ),
};

export const Popup: Story = {
  argTypes: {
    state: {
      options: Object.values(LadderState).filter(
        (state) => state !== LadderState.Ineligible,
      ),
    },
  },
  render: ({ state }) => (
    <LadderProviders key={state} state={state}>
      <ReferralLadderModal
        isOpen
        origin={TargetId.ProfileDropdown}
        onRequestClose={fn()}
      />
    </LadderProviders>
  ),
};

export const ReminderPopupStory: Story = {
  name: 'Reminder popup',
  render: ({ state }) => (
    <LadderProviders key={state} state={state}>
      <ReminderPopup />
    </LadderProviders>
  ),
};

export const InvitePage: Story = {
  name: 'Settings invite page',
  render: ({ state }) => (
    <LadderProviders key={state} state={state}>
      <div className="mx-auto max-w-[40rem]">
        <AccountInvitePage />
      </div>
    </LadderProviders>
  ),
};
