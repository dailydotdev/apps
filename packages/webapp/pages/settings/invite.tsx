import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import {
  ReferralCampaignKey,
  useReferralCampaign,
} from '@dailydotdev/shared/src/hooks';
import { link } from '@dailydotdev/shared/src/lib/links';
import { labels } from '@dailydotdev/shared/src/lib';
import { cloudinaryCharmInviteFriends } from '@dailydotdev/shared/src/lib/image';
import { Image } from '@dailydotdev/shared/src/components/image/Image';
import {
  generateQueryKey,
  getNextPageParam,
  RequestKey,
} from '@dailydotdev/shared/src/lib/query';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { REFERRED_USERS_QUERY } from '@dailydotdev/shared/src/graphql/users';
import UserList from '@dailydotdev/shared/src/components/profile/UserList';
import { checkFetchMore } from '@dailydotdev/shared/src/components/containers/InfiniteScrolling';
import type { ReferredUsersData } from '@dailydotdev/shared/src/graphql/common';
import { gqlClient } from '@dailydotdev/shared/src/graphql/common';
import { Separator } from '@dailydotdev/shared/src/components/cards/common/common';
import type { UserShortProfile } from '@dailydotdev/shared/src/lib/user';
import { addMonths, format } from 'date-fns';
import { useInfiniteQuery } from '@tanstack/react-query';
import {
  LogEvent,
  TargetId,
  TargetType,
} from '@dailydotdev/shared/src/lib/log';
import { ShareProvider } from '@dailydotdev/shared/src/lib/share';
import { ShareActions } from '@dailydotdev/shared/src/components/share/ShareActions';
import {
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { InviteLinkInput } from '@dailydotdev/shared/src/components/referral/InviteLinkInput';
import { TruncateText } from '@dailydotdev/shared/src/components/utilities';
import type { NextSeoProps } from 'next-seo';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import { usePlusSubscription } from '@dailydotdev/shared/src/hooks/usePlusSubscription';
import { useConditionalFeature } from '@dailydotdev/shared/src/hooks/useConditionalFeature';
import { featureGiveback } from '@dailydotdev/shared/src/lib/featureManagement';
import {
  INVITE_GOAL,
  InviteRewardProgress,
} from '@dailydotdev/shared/src/components/referral/InviteRewardProgress';
import { GivebackInviteCard } from '@dailydotdev/shared/src/features/giveback/components/GivebackInviteCard';
import AccountContentSection from '../../components/layouts/SettingsLayout/AccountContentSection';
import { AccountPageContainer } from '../../components/layouts/SettingsLayout/AccountPageContainer';
import { getSettingsLayout } from '../../components/layouts/SettingsLayout';
import { defaultSeo, noindexSeoProps } from '../../next-seo';
import { getPageSeoTitles } from '../../components/layouts/utils';

const seo: NextSeoProps = {
  ...defaultSeo,
  ...getPageSeoTitles('Invite Friends'),
  ...noindexSeoProps,
};

const AccountInvitePage = (): ReactElement => {
  const { user } = useAuthContext();
  const { isPlus } = usePlusSubscription();
  const referredKey = generateQueryKey(RequestKey.ReferredUsers, user);
  const { url, referredUsersCount } = useReferralCampaign({
    campaignKey: ReferralCampaignKey.Generic,
  });
  const { logEvent } = useLogContext();
  const inviteLink = url || link.referral.defaultUrl;
  const { value: isGivebackEnabled } = useConditionalFeature({
    feature: featureGiveback,
    shouldEvaluate: !!user,
  });
  const usersResult = useInfiniteQuery<ReferredUsersData>({
    queryKey: referredKey,
    queryFn: ({ pageParam }) =>
      gqlClient.request(REFERRED_USERS_QUERY, {
        after: typeof pageParam === 'string' ? pageParam : undefined,
      }),
    initialPageParam: '',
    getNextPageParam: ({ referredUsers }) =>
      getNextPageParam(referredUsers?.pageInfo),
  });
  const users: UserShortProfile[] = useMemo(() => {
    const list: UserShortProfile[] = [];
    usersResult.data?.pages.forEach((page) => {
      page?.referredUsers.edges.forEach(({ node }) => {
        list.push(node as UserShortProfile);
      });
    }, []);

    return list;
  }, [usersResult.data]);

  const isRewardUnlocked = referredUsersCount >= INVITE_GOAL;

  // The free month runs from the moment the goal was met — i.e. the join date
  // of the INVITE_GOALth developer. Derived on the client because no backend
  // field carries the grant yet; when one lands, read it here instead. Sorts a
  // copy rather than trusting the list order, which the query doesn't specify.
  const rewardPeriod = useMemo(() => {
    if (!isRewardUnlocked) {
      return undefined;
    }

    const completing = [...users].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    )[INVITE_GOAL - 1];

    if (!completing) {
      return undefined;
    }

    const startsAt = new Date(completing.createdAt);

    return { startsAt, endsAt: addMonths(startsAt, 1) };
  }, [isRewardUnlocked, users]);

  // One handler for every route out of the split control: a copy keeps the
  // page's existing copy event, anything else logs as a share with the provider.
  const onShare = (provider: ShareProvider) => {
    if (provider === ShareProvider.CopyLink) {
      logEvent({
        event_name: LogEvent.CopyReferralLink,
        target_id: TargetId.InviteFriendsPage,
      });

      return;
    }

    logEvent({
      event_name: LogEvent.InviteReferral,
      target_id: provider,
      target_type: TargetType.InviteFriendsPage,
    });
  };

  // The card below already announces the reward, so the unlocked copy only has
  // to give a reason to keep going.
  const rewardDescription = isRewardUnlocked
    ? 'Keep inviting. Every developer you bring makes the feed sharper.'
    : `When ${INVITE_GOAL} developers join daily.dev through your link, your free month of Plus starts.`;

  const onGivebackClick = () => {
    logEvent({
      event_name: LogEvent.ClickGivebackGiftEntry,
      target_id: TargetId.InviteFriendsPage,
    });
  };

  return (
    <AccountPageContainer title="Invite friends">
      <AccountContentSection
        className={{ heading: 'mt-0' }}
        title={`Invite ${INVITE_GOAL} friends, get 1 month of Plus`}
        description={rewardDescription}
      >
        {isPlus && !isRewardUnlocked && (
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
          joinedCount={referredUsersCount}
          referredUsers={users}
          rewardPeriod={rewardPeriod}
        />
      </AccountContentSection>
      <AccountContentSection title="Your invitation link">
        <InviteLinkInput
          className={{ container: 'mt-4' }}
          link={inviteLink}
          logProps={{
            event_name: LogEvent.CopyReferralLink,
            target_id: TargetId.InviteFriendsPage,
          }}
          // The split control copies on the left half and drops the full share
          // list on the right, so the field alone covers every share route.
          actionButton={
            <ShareActions
              variant="split"
              link={inviteLink}
              text={labels.referral.generic.inviteText}
              buttonVariant={ButtonVariant.Primary}
              buttonSize={ButtonSize.Small}
              triggerText="Copy link"
              dropdownLabel="More ways to share"
              // The referral URL carries the attribution, so it goes out as-is.
              shortenUrl={false}
              onShare={onShare}
            />
          }
        />
      </AccountContentSection>
      {isGivebackEnabled && (
        <AccountContentSection
          title="More ways to give back"
          description="Inviting friends isn't the only way to push the community forward."
        >
          <GivebackInviteCard className="mt-4" onClick={onGivebackClick} />
        </AccountContentSection>
      )}
      <AccountContentSection
        title="Your referrals"
        description="Developers who joined through your invite link"
      >
        {/* UserList hard-codes px-6 on its rows and on the loading placeholder,
            so cancel the section's own p-6 around the whole list. That keeps
            every state (rows, skeletons, empty) aligned with the headings and
            lets the row hover highlight run the full width of the card. */}
        <div className="-mx-6 mt-4">
          <UserList
            users={users}
            isLoading={usersResult.isLoading}
            scrollingProps={{
              isFetchingNextPage: usersResult.isFetchingNextPage,
              canFetchMore: checkFetchMore(usersResult),
              fetchNextPage: usersResult.fetchNextPage,
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
              }: UserShortProfile): React.ReactNode {
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
            placeholderAmount={referredUsersCount}
          />
        </div>
      </AccountContentSection>
    </AccountPageContainer>
  );
};

AccountInvitePage.getLayout = getSettingsLayout;
AccountInvitePage.layoutProps = { seo };

export default AccountInvitePage;
