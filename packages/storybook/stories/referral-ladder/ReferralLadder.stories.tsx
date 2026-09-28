import type { Meta, StoryObj } from '@storybook/react-vite';
import type { PropsWithChildren, ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import ProfileMenu from '@dailydotdev/shared/src/components/ProfileMenu/ProfileMenu';
import ReferralLadderModal from '@dailydotdev/shared/src/components/modals/referral/ReferralLadderModal';
import {
  REFERRAL_LADDER_POPUP_TITLE,
  ReferralLadderPopupContent,
} from '@dailydotdev/shared/src/components/referral/ReferralLadderPopupContent';
import { LazyModalElement } from '@dailydotdev/shared/src/components/modals/LazyModalElement';
import { generateQueryKey, RequestKey } from '@dailydotdev/shared/src/lib/query';
import { ReferralCampaignKey } from '@dailydotdev/shared/src/lib/referral';
import { referredUsersPreviewQueryOptions } from '@dailydotdev/shared/src/graphql/users';
import { fn } from 'storybook/test';
import { ModalClose } from '@dailydotdev/shared/src/components/modals/common/ModalClose';
import { TargetId, TargetType } from '@dailydotdev/shared/src/lib/log';
import { graphql, http, HttpResponse } from 'msw';
import AccountInvitePage from '../../../webapp/pages/settings/invite';
import { featureReferralLadder } from '@dailydotdev/shared/src/lib/featureManagement';
import ExtensionProviders from '../extension/_providers';
import { FeatureOverrides } from '../../mock/GrowthBookProvider';
import { friends } from './_mock';

interface LadderArgs {
  referredCount: number;
}


const toFriendNode = (friend: (typeof friends)[number], index: number) => ({
  ...friend,
  id: `friend-${index}`,
  permalink: `https://app.daily.dev/${friend.username}`,
  createdAt: new Date(2026, 8, 20 + index).toISOString(),
});

const SeedReferrals = ({
  referredCount,
  children,
}: PropsWithChildren<LadderArgs>): ReactElement | null => {
  const client = useQueryClient();
  const { user } = useAuthContext();
  const [isSeeded, setIsSeeded] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }

    client.setQueryData(
      generateQueryKey(RequestKey.ReferralCampaigns, user, {
        referralOrigin: ReferralCampaignKey.Generic,
      }),
      {
        referredUsersCount: referredCount,
        referralCountLimit: 3,
        referralToken: 'mock',
        url: `https://dly.to/${user.username}`,
      },
    );
    client.setQueryData(
      referredUsersPreviewQueryOptions(user).queryKey,
      friends.slice(0, referredCount).map(toFriendNode),
    );
    setIsSeeded(true);
  }, [client, user, referredCount]);

  return isSeeded ? <>{children}</> : null;
};

const LadderProviders = ({
  referredCount,
  children,
}: PropsWithChildren<LadderArgs>): ReactElement => (
  <ExtensionProviders key={referredCount}>
    <FeatureOverrides values={{ [featureReferralLadder.id]: true }}>
      <div id="__next">
        <SeedReferrals referredCount={referredCount}>{children}</SeedReferrals>
      </div>
    </FeatureOverrides>
  </ExtensionProviders>
);


// Read by the ReferredUsers handler so the list matches the slider.
let mockReferredCount = 1;

const referredUsersHandler = graphql.query('ReferredUsers', () =>
  HttpResponse.json({
    data: {
      referredUsers: {
        pageInfo: { endCursor: null, hasNextPage: false },
        edges: friends
          .slice(0, mockReferredCount)
          .map((friend, index) => ({ node: toFriendNode(friend, index) })),
      },
    },
  }),
);

const meta: Meta<LadderArgs> = {
  title: 'Experiments/Referral Ladder',
  args: { referredCount: 1 },
  argTypes: {
    referredCount: {
      name: 'Friends joined',
      control: { type: 'range', min: 0, max: 3, step: 1 },
    },
  },
  parameters: {
    layout: 'fullscreen',
    msw: {
      handlers: [
        referredUsersHandler,
        http.post('*/e', () => new HttpResponse(null, { status: 204 })),
      ],
    },
  },
};

export default meta;
type Story = StoryObj<LadderArgs>;

export const ProfileMenuEntry: Story = {
  name: 'Profile menu (click the gift)',
  render: ({ referredCount }) => (
    <LadderProviders referredCount={referredCount}>
      <div className="min-h-screen bg-background-default">
        <ProfileMenu onClose={fn()} />
        <LazyModalElement />
      </div>
    </LadderProviders>
  ),
};

export const InvitePage: Story = {
  name: 'Settings invite page',
  render: ({ referredCount }) => {
    mockReferredCount = referredCount;

    return (
      <LadderProviders referredCount={referredCount}>
        <div className="mx-auto min-h-screen max-w-[40rem] bg-background-default">
          <AccountInvitePage />
        </div>
      </LadderProviders>
    );
  },
};

const popupStates = [
  { referredCount: 0, label: 'No invites yet' },
  { referredCount: 1, label: '1 friend joined' },
  { referredCount: 2, label: '2 friends joined' },
  { referredCount: 3, label: 'Ladder completed' },
];

export const AllPopupStates: Story = {
  name: 'Popup: all states',
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex min-h-screen flex-wrap items-start justify-center gap-8 bg-background-subtle p-8">
      {popupStates.map(({ referredCount, label }) => (
        <div key={referredCount} className="flex flex-col gap-3">
          <p className="font-bold text-text-tertiary typo-callout">{label}</p>
          <LadderProviders referredCount={referredCount}>
            <div className="w-[26.25rem] overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-default">
              <div className="relative border-b border-border-subtlest-tertiary px-5 py-4">
                <h2 className="font-bold typo-title3">
                  {REFERRAL_LADDER_POPUP_TITLE}
                </h2>
                <ModalClose top="3" right="3" onClick={fn()} />
              </div>
              <ReferralLadderPopupContent
                className="p-5"
                logTargetId={TargetId.ProfileDropdown}
                logTargetType={TargetType.ReferralPopup}
              />
            </div>
          </LadderProviders>
        </div>
      ))}
    </div>
  ),
};

const PopupStory = ({ referredCount }: LadderArgs): ReactElement => (
  <LadderProviders referredCount={referredCount}>
    <ReferralLadderModal isOpen onRequestClose={fn()} />
  </LadderProviders>
);

export const Popup: Story = {
  render: PopupStory,
};

export const NoInvitesYet: Story = {
  args: { referredCount: 0 },
  render: PopupStory,
};

export const TwoFriendsJoined: Story = {
  args: { referredCount: 2 },
  render: PopupStory,
};

export const LadderCompleted: Story = {
  args: { referredCount: 3 },
  render: PopupStory,
};
