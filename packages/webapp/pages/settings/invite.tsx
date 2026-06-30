import type { ReactElement } from 'react';
import React, { useMemo, useRef } from 'react';
import { ReferralCampaignKey, useReferralCampaign } from '@dailydotdev/shared/src/hooks/referral/useReferralCampaign';
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
import { SocialShareList } from '@dailydotdev/shared/src/components/widgets/SocialShareList';
import { Separator } from '@dailydotdev/shared/src/components/cards/common/common';
import type { UserShortProfile } from '@dailydotdev/shared/src/lib/user';
import { format } from 'date-fns';
import { useInfiniteQuery } from '@tanstack/react-query';
import {
  LogEvent,
  TargetId,
  TargetType,
} from '@dailydotdev/shared/src/lib/log';
import type { ShareProvider } from '@dailydotdev/shared/src/lib/share';
import { useShareOrCopyLink } from '@dailydotdev/shared/src/hooks/useShareOrCopyLink';
import { InviteLinkInput } from '@dailydotdev/shared/src/components/referral';
import { TruncateText } from '@dailydotdev/shared/src/components/utilities/common';
import type { NextSeoProps } from 'next-seo';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import AccountContentSection from '../../components/layouts/SettingsLayout/AccountContentSection';
import { AccountPageContainer } from '../../components/layouts/SettingsLayout/AccountPageContainer';
import { getSettingsLayout } from '../../components/layouts/SettingsLayout';
import { defaultSeo } from '../../next-seo';
import { getPageSeoTitles } from '../../components/layouts/utils';

const seo: NextSeoProps = {
  ...defaultSeo,
  ...getPageSeoTitles('Invite Friends'),
};

const AccountInvitePage = (): ReactElement => {
  const { user } = useAuthContext();
  const container = useRef<HTMLDivElement>();
  const referredKey = generateQueryKey(RequestKey.ReferredUsers, user);
  const { url, referredUsersCount } = useReferralCampaign({
    campaignKey: ReferralCampaignKey.Generic,
  });
  const { logEvent } = useLogContext();
  const inviteLink = url || link.referral.defaultUrl;
  const [, onShareOrCopyLink] = useShareOrCopyLink({
    text: labels.referral.generic.inviteText,
    link: inviteLink,
    logObject: () => ({
      event_name: LogEvent.CopyReferralLink,
      target_id: TargetId.InviteFriendsPage,
    }),
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
  }, [usersResult]);

  const onLogShare = (provider: ShareProvider) => {
    logEvent({
      event_name: LogEvent.InviteReferral,
      target_id: provider,
      target_type: TargetType.InviteFriendsPage,
    });
  };

  return (
    <AccountPageContainer title="Invite friends">
      <AccountContentSection
        className={{ heading: 'mt-0' }}
        title="Grow the community"
        description="Share daily.dev with developers you know. When they join through your link, they'll show up in your referrals list below."
      />
      <AccountContentSection
        title="Share your invite link"
        description="Copy your personal link or share it directly on social platforms."
      >
        <InviteLinkInput
          className={{ container: 'mt-4' }}
          link={inviteLink}
          logProps={{
            event_name: LogEvent.CopyReferralLink,
            target_id: TargetId.InviteFriendsPage,
          }}
        />
        <Typography
          tag={TypographyTag.Span}
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
          bold
          className="my-4 p-0.5"
        >
          or invite via
        </Typography>
        <div className="flex flex-row flex-wrap gap-2 gap-y-4">
          <SocialShareList
            link={inviteLink}
            description={labels.referral.generic.inviteText}
            onNativeShare={onShareOrCopyLink}
            onClickSocial={onLogShare}
            shortenUrl={false}
          />
        </div>
      </AccountContentSection>
      <AccountContentSection
        title="Your referrals"
        description="Developers who joined through your invite link"
      >
        <UserList
          users={users}
          isLoading={usersResult?.isLoading}
          scrollingProps={{
            isFetchingNextPage: usersResult.isFetchingNextPage,
            canFetchMore: checkFetchMore(usersResult),
            fetchNextPage: usersResult.fetchNextPage,
            className: 'mt-4',
          }}
          emptyPlaceholder={
            <div className="mt-16 flex flex-col items-center text-text-secondary">
              <Image
                className="h-40 w-40 object-contain"
                src={cloudinaryCharmInviteFriends}
                alt="daily.dev charm inviting your friends"
                loading="lazy"
              />
              <p className="mt-2 typo-body">
                No one has joined yet. Share your link!
              </p>
            </div>
          }
          userInfoProps={{
            scrollingContainer: container.current,
            className: {
              container: 'px-0 py-3 items-center',
              textWrapper: 'flex-none',
            },
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
      </AccountContentSection>
    </AccountPageContainer>
  );
};

AccountInvitePage.getLayout = getSettingsLayout;
AccountInvitePage.layoutProps = { seo };

export default AccountInvitePage;
