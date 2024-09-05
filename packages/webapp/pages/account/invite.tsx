import { Separator } from '@dailydotdev/shared/src/components/cards/common';
import { checkFetchMore } from '@dailydotdev/shared/src/components/containers/InfiniteScrolling';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import UserList from '@dailydotdev/shared/src/components/profile/UserList';
import { InviteLinkInput } from '@dailydotdev/shared/src/components/referral';
import { TruncateText } from '@dailydotdev/shared/src/components/utilities';
import { SocialShareList } from '@dailydotdev/shared/src/components/widgets/SocialShareList';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import {
  gqlClient,
  ReferredUsersData,
} from '@dailydotdev/shared/src/graphql/common';
import { REFERRED_USERS_QUERY } from '@dailydotdev/shared/src/graphql/users';
import {
  ReferralCampaignKey,
  useReferralCampaign,
} from '@dailydotdev/shared/src/hooks';
import { useShareOrCopyLink } from '@dailydotdev/shared/src/hooks/useShareOrCopyLink';
import { labels } from '@dailydotdev/shared/src/lib';
import { link } from '@dailydotdev/shared/src/lib/links';
import {
  LogEvent,
  TargetId,
  TargetType,
} from '@dailydotdev/shared/src/lib/log';
import {
  generateQueryKey,
  RequestKey,
} from '@dailydotdev/shared/src/lib/query';
import { ShareProvider } from '@dailydotdev/shared/src/lib/share';
import { UserShortProfile } from '@dailydotdev/shared/src/lib/user';
import { useInfiniteQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import React, { ReactElement, useMemo, useRef } from 'react';

import { InviteIcon } from '../../../shared/src/components/icons';
import { getAccountLayout } from '../../components/layouts/AccountLayout';
import AccountContentSection from '../../components/layouts/AccountLayout/AccountContentSection';
import { AccountPageContainer } from '../../components/layouts/AccountLayout/AccountPageContainer';

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
  const usersResult = useInfiniteQuery<ReferredUsersData>(
    referredKey,
    ({ pageParam }) =>
      gqlClient.request(REFERRED_USERS_QUERY, {
        after: typeof pageParam === 'string' ? pageParam : undefined,
      }),
    {
      getNextPageParam: (lastPage) =>
        lastPage?.referredUsers?.pageInfo?.hasNextPage &&
        lastPage?.referredUsers?.pageInfo?.endCursor,
    },
  );
  const users: UserShortProfile[] = useMemo(() => {
    const list = [];
    usersResult.data?.pages.forEach((page) => {
      page?.referredUsers.edges.forEach(({ node }) => {
        list.push(node);
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
      <InviteLinkInput
        link={inviteLink}
        logProps={{
          event_name: LogEvent.CopyReferralLink,
          target_id: TargetId.InviteFriendsPage,
        }}
      />
      <span className="my-4 p-0.5 font-bold text-text-tertiary typo-callout">
        or invite via
      </span>
      <div className="flex flex-row flex-wrap gap-2 gap-y-4">
        <SocialShareList
          link={inviteLink}
          description={labels.referral.generic.inviteText}
          onNativeShare={onShareOrCopyLink}
          onClickSocial={onLogShare}
          shortenUrl={false}
        />
      </div>
      <AccountContentSection
        title="Buddies you brought onboard"
        description="Meet the developers who joined daily.dev through your invite. They might just be your ticket to future rewards 😉"
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
              <InviteIcon size={IconSize.XXXLarge} />
              <p className="mt-2 typo-body">No referred members found</p>
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

AccountInvitePage.getLayout = getAccountLayout;

export default AccountInvitePage;
