import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { screen, userEvent } from 'storybook/test';
import { addMonths, format } from 'date-fns';
import type { InviteRewardPeriod } from '@dailydotdev/shared/src/components/referral/InviteRewardProgress';
import {
  INVITE_GOAL,
  InviteRewardProgress,
} from '@dailydotdev/shared/src/components/referral/InviteRewardProgress';
import { GivebackInviteCard } from '@dailydotdev/shared/src/features/giveback/components/GivebackInviteCard';
import { InviteLinkInput } from '@dailydotdev/shared/src/components/referral/InviteLinkInput';
import { ShareActions } from '@dailydotdev/shared/src/components/share/ShareActions';
import {
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import UserList from '@dailydotdev/shared/src/components/profile/UserList';
import { TruncateText } from '@dailydotdev/shared/src/components/utilities';
import { Separator } from '@dailydotdev/shared/src/components/cards/common/common';
import { Image } from '@dailydotdev/shared/src/components/image/Image';
import { cloudinaryCharmInviteFriends } from '@dailydotdev/shared/src/lib/image';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { LogEvent, TargetId } from '@dailydotdev/shared/src/lib/log';
import type { UserShortProfile } from '@dailydotdev/shared/src/lib/user';
import NotificationItem from '@dailydotdev/shared/src/components/notifications/NotificationItem';
import { referralNotifications } from '../../components/notifications/_mock';
import {
  INVITE_LINK,
  INVITE_TEXT,
  mockReferredUsers,
  withInvite,
} from './inviteFriends.mocks';

// Stand-ins for the webapp settings chrome (AccountPageContainer /
// AccountContentSection), so the real components can be judged in the layout
// they actually ship in. The page body itself lives in the webapp package and
// can't be imported here.
const SettingsCard = ({ children }: { children: ReactNode }): ReactElement => (
  <div className="mx-auto w-full max-w-3xl">
    <main className="flex h-fit flex-1 flex-col rounded-16 border-border-subtlest-tertiary tablet:border">
      <h1 className="flex h-14 w-full flex-row items-center border-b border-border-subtlest-tertiary px-4 font-bold typo-body tablet:px-6 tablet:typo-title3">
        Invite friends
      </h1>
      <section className="flex w-full flex-col overflow-x-hidden p-6">
        {children}
      </section>
    </main>
  </div>
);

const Section = ({
  title,
  description,
  isFirst = false,
  children,
}: {
  title: string;
  description?: string;
  isFirst?: boolean;
  children?: ReactNode;
}): ReactElement => (
  <>
    <h2 className={`font-bold typo-body ${isFirst ? 'mt-0' : 'mt-10'}`}>
      {title}
    </h2>
    {description && (
      <p className="mt-1 text-text-tertiary typo-callout">{description}</p>
    )}
    {children}
  </>
);

interface InvitePageProps {
  joinedCount?: number;
  isPlus?: boolean;
  showGiveback?: boolean;
}

// Mirrors packages/webapp/pages/settings/invite.tsx section for section.
const rewardDescription = (isUnlocked: boolean): string =>
  isUnlocked
    ? 'Keep inviting. Every developer you bring makes the feed sharper.'
    : `When ${INVITE_GOAL} developers join daily.dev through your link, your free month of Plus starts.`;

// Same derivation as the page: the free month runs from the join date of the
// INVITE_GOALth developer.
const rewardPeriodFor = (
  referredUsers: UserShortProfile[],
): InviteRewardPeriod | undefined => {
  const completing = referredUsers[INVITE_GOAL - 1];

  if (!completing) {
    return undefined;
  }

  const startsAt = new Date(completing.createdAt);

  return { startsAt, endsAt: addMonths(startsAt, 1) };
};

const InvitePage = ({
  joinedCount = 0,
  isPlus = false,
  showGiveback = true,
}: InvitePageProps): ReactElement => {
  const referredUsers = mockReferredUsers().slice(0, joinedCount);
  const isUnlocked = joinedCount >= INVITE_GOAL;

  return (
    <SettingsCard>
      <Section
        isFirst
        title={`Invite ${INVITE_GOAL} friends, get 1 month of Plus`}
        description={rewardDescription(isUnlocked)}
      >
        {isPlus && !isUnlocked && (
          <Typography
            className="mt-1"
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            Already on Plus? The free month is added to your subscription.
          </Typography>
        )}
        <InviteRewardProgress
          className="mt-4"
          joinedCount={joinedCount}
          referredUsers={referredUsers}
          rewardPeriod={rewardPeriodFor(referredUsers)}
        />
      </Section>
      <Section title="Your invitation link">
        <InviteLinkInput
          className={{ container: 'mt-4' }}
          link={INVITE_LINK}
          logProps={{
            event_name: LogEvent.CopyReferralLink,
            target_id: TargetId.InviteFriendsPage,
          }}
          actionButton={
            <ShareActions
              variant="split"
              link={INVITE_LINK}
              text={INVITE_TEXT}
              buttonVariant={ButtonVariant.Primary}
              buttonSize={ButtonSize.Small}
              triggerText="Copy link"
              dropdownLabel="More ways to share"
              shortenUrl={false}
            />
          }
        />
      </Section>
      {showGiveback && (
        <Section
          title="More ways to give back"
          description="Inviting friends isn't the only way to push the community forward."
        >
          <GivebackInviteCard className="mt-4" />
        </Section>
      )}
      <Section
        title="Your referrals"
        description="Developers who joined through your invite link"
      >
        <div className="-mx-6 mt-4">
          <UserList
            users={referredUsers}
            scrollingProps={{
              isFetchingNextPage: false,
              canFetchMore: false,
              fetchNextPage: () => Promise.resolve(),
            }}
            emptyPlaceholder={
              <div className="flex items-center gap-3 px-6 text-text-secondary">
                <Image
                  className="h-16 w-16 shrink-0 object-contain"
                  src={cloudinaryCharmInviteFriends}
                  alt=""
                  loading="lazy"
                />
                <p className="typo-callout">
                  No one has joined yet. Share your link!
                </p>
              </div>
            }
            userInfoProps={{
              transformUsername({
                username,
                createdAt,
              }: UserShortProfile): ReactNode {
                return (
                  <span className="flex text-text-secondary typo-callout">
                    <TruncateText>@{username}</TruncateText>
                    <Separator />
                    <time dateTime={createdAt}>
                      {format(new Date(createdAt), 'dd MMM yyyy')}
                    </time>
                  </span>
                );
              },
            }}
          />
        </div>
      </Section>
    </SettingsCard>
  );
};

const meta: Meta<typeof InvitePage> = {
  title: 'Features/Referral/Invite friends page',
  component: InvitePage,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Every state of the "Invite friends" settings page (/settings/invite): referral progress from zero to unlocked, the Plus-member variant, and the giveback cross-promo on and off. The reward chip is framing only: no backend grants Plus at 3 referrals yet.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-background-default p-6 text-text-primary">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof InvitePage>;

export const NoInvitesYet: Story = {
  name: '0 of 3 (nobody joined)',
  args: { joinedCount: 0 },
  decorators: [withInvite()],
};

export const OneFriendJoined: Story = {
  name: '1 of 3 (first join)',
  args: { joinedCount: 1 },
  decorators: [withInvite()],
};

export const TwoFriendsJoined: Story = {
  name: '2 of 3 (one to go)',
  args: { joinedCount: 2 },
  decorators: [withInvite()],
};

export const RewardUnlocked: Story = {
  name: '3 of 3 (Plus unlocked)',
  args: { joinedCount: 3 },
  decorators: [withInvite()],
};

export const BeyondTheGoal: Story = {
  name: '4 joined (past the goal)',
  args: { joinedCount: 4 },
  decorators: [withInvite()],
  parameters: {
    docs: {
      description: {
        story:
          'Progress caps at three slots while the referrals list keeps growing.',
      },
    },
  },
};

export const ExistingPlusMember: Story = {
  name: 'Already a Plus member',
  args: { joinedCount: 1, isPlus: true },
  decorators: [withInvite()],
  parameters: {
    docs: {
      description: {
        story:
          'Plus subscribers get a note that the free month stacks on their current subscription. It disappears once the reward unlocks.',
      },
    },
  },
};

export const GivebackDisabled: Story = {
  name: 'Giveback flag off',
  args: { joinedCount: 1, showGiveback: false },
  decorators: [withInvite()],
};

export const Mobile: Story = {
  name: 'Mobile width',
  args: { joinedCount: 2 },
  decorators: [withInvite()],
  globals: { viewport: { value: 'mobile1' } },
};

// Component-level states, side by side, for judging the tracker on its own.
export const ProgressStates: StoryObj = {
  name: 'Reward progress (all steps)',
  render: () => (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 rounded-16 border border-border-subtlest-tertiary p-6">
      {[0, 1, 2, 3].map((count) => (
        <div key={count} className="flex flex-col gap-2">
          <span className="text-text-tertiary typo-caption1">
            joinedCount = {count}
          </span>
          <InviteRewardProgress
            joinedCount={count}
            referredUsers={mockReferredUsers().slice(0, count)}
            rewardPeriod={rewardPeriodFor(mockReferredUsers().slice(0, count))}
          />
        </div>
      ))}
    </div>
  ),
  decorators: [withInvite()],
  parameters: { controls: { disable: true } },
};

// The two notifications this feature emits, in the row layout the
// /notifications page renders them in. They also sit in the shared
// notifications mock, so "Components/Notifications/Full page" shows them in
// context alongside the rest of the feed.
export const Notifications: StoryObj = {
  name: 'Notifications',
  render: () => (
    <div className="mx-auto w-full max-w-[42.5rem] rounded-16 border border-border-subtlest-tertiary bg-background-default py-2">
      {referralNotifications.map((notification) => (
        <NotificationItem key={notification.referenceId} {...notification} />
      ))}
    </div>
  ),
  decorators: [withInvite()],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Both rows deep-link to /settings/invite. `referral_friend_joined` fires per join and carries the running count; `referral_plus_unlocked` fires once on the third and states the period the free month covers. Unread rows sit on the raised surface, same as the rest of the feed. Neither type is emitted by the backend yet.',
      },
    },
  },
};

// The share control on its own, with the menu already open, so the dropdown can
// be judged without hunting for it in the full page.
export const ShareMenuOpen: StoryObj = {
  name: 'Invite link (share menu open)',
  render: () => (
    <div className="mx-auto w-full max-w-3xl">
      <InviteLinkInput
        link={INVITE_LINK}
        logProps={{
          event_name: LogEvent.CopyReferralLink,
          target_id: TargetId.InviteFriendsPage,
        }}
        actionButton={
          <ShareActions
            variant="split"
            link={INVITE_LINK}
            text={INVITE_TEXT}
            buttonVariant={ButtonVariant.Primary}
            buttonSize={ButtonSize.Small}
            triggerText="Copy link"
            dropdownLabel="More ways to share"
            shortenUrl={false}
          />
        }
      />
    </div>
  ),
  decorators: [withInvite()],
  play: async () => {
    await userEvent.click(await screen.findByLabelText('More ways to share'));
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Left half copies the link and swaps the glyph to a checkmark for a second. Right half opens the share list. Below laptop width the control collapses to a single button that opens the native share sheet, so there is no menu to open.',
      },
    },
  },
};

export const GivebackCard: StoryObj = {
  name: 'Giveback cross-promo card',
  render: () => (
    <div className="mx-auto w-full max-w-3xl">
      <GivebackInviteCard />
    </div>
  ),
  decorators: [withInvite()],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Wears the same treatment as the giveback founding-reward card: a 1px gradient frame over an opaque base washed with the same gradient at 8%.',
      },
    },
  },
};
