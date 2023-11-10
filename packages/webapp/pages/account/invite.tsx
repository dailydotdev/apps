import React, { ReactElement, useRef } from 'react';
import { TextField } from '@dailydotdev/shared/src/components/fields/TextField';
import {
  ReferralCampaignKey,
  useReferralCampaign,
} from '@dailydotdev/shared/src/hooks';
import { link } from '@dailydotdev/shared/src/lib/links';
import {
  Button,
  ButtonSize,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { labels } from '@dailydotdev/shared/src/lib';
import {
  generateQueryKey,
  RequestKey,
} from '@dailydotdev/shared/src/lib/query';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { useInfiniteQuery } from 'react-query';
import request from 'graphql-request';
import { graphqlUrl } from '@dailydotdev/shared/src/lib/config';
import { REFERRED_USERS_QUERY } from '@dailydotdev/shared/src/graphql/users';
import UserList from '@dailydotdev/shared/src/components/profile/UserList';
import { checkFetchMore } from '@dailydotdev/shared/src/components/containers/InfiniteScrolling';
import { ReferredUsersData } from '@dailydotdev/shared/src/graphql/common';
import { SocialShareList } from '@dailydotdev/shared/src/components/widgets/SocialShareList';
import { useCopyLink } from '@dailydotdev/shared/src/hooks/useCopy';
import { Separator } from '@dailydotdev/shared/src/components/cards/common';
import { UserShortProfile } from '@dailydotdev/shared/src/lib/user';
import { format } from 'date-fns';
import AccountContentSection from '../../components/layouts/AccountLayout/AccountContentSection';
import { AccountPageContainer } from '../../components/layouts/AccountLayout/AccountPageContainer';
import { getAccountLayout } from '../../components/layouts/AccountLayout';

const AccountInvitePage = (): ReactElement => {
  const { user } = useAuthContext();
  const container = useRef<HTMLDivElement>();
  const referredKey = generateQueryKey(RequestKey.ReferredUsers, user);
  const { url, referredUsersCount } = useReferralCampaign({
    campaignKey: ReferralCampaignKey.Generic,
  });
  const inviteLink = url || link.referral.defaultUrl;
  const [copyingLink, onCopyLink] = useCopyLink(() => inviteLink);
  const usersResult = useInfiniteQuery<ReferredUsersData>(
    referredKey,
    ({ pageParam }) =>
      request(graphqlUrl, REFERRED_USERS_QUERY, {
        after: typeof pageParam === 'string' ? pageParam : undefined,
      }),
    {
      getNextPageParam: (lastPage) =>
        lastPage?.referredUsers?.pageInfo?.hasNextPage &&
        lastPage?.referredUsers?.pageInfo?.endCursor,
    },
  );

  const onNativeShare = async () => {
    await navigator.share({
      title: labels.referral.generic.inviteText,
      url: inviteLink,
    });
  };

  const onTrackShare = () => {
    // add tracking here
  };

  return (
    <AccountPageContainer title="Invite friends">
      <TextField
        name="inviteURL"
        inputId="inviteURL"
        label="Your unique invite URL"
        type="url"
        autoComplete="off"
        value={inviteLink}
        fieldType="tertiary"
        actionButton={
          <Button
            buttonSize={ButtonSize.Small}
            className="btn-primary"
            onClick={() => onCopyLink()}
          >
            {copyingLink ? 'Copying...' : 'Copy link'}
          </Button>
        }
        readOnly
      />
      <span className="p-0.5 my-4 font-bold typo-callout text-theme-label-tertiary">
        or invite with
      </span>
      <div className="flex flex-row flex-wrap gap-4">
        <SocialShareList
          link={inviteLink}
          description={labels.referral.generic.inviteText}
          onNativeShare={onNativeShare}
          onClickSocial={onTrackShare}
        />
      </div>
      <AccountContentSection
        title="Referred"
        description="Here you will see all your active members who joined to daily.dev. Who knows? maybe someday it will be worth something 😉"
      >
        <UserList
          users={usersResult.data?.pages.reduce((acc, p) => {
            p?.referredUsers.edges.forEach(({ node }) => {
              acc.push(node);
            });

            return acc;
          }, [])}
          scrollingProps={{
            isFetchingNextPage: usersResult.isFetchingNextPage,
            canFetchMore: checkFetchMore(usersResult),
            fetchNextPage: usersResult.fetchNextPage,
            className: 'mt-4',
          }}
          userInfoProps={{
            scrollingContainer: container.current,
            className: {
              container: 'px-0',
              textWrapper: 'flex-none',
            },
            transformUsername({
              username,
              createdAt,
            }: UserShortProfile): React.ReactNode {
              return (
                <span className="mt-2 typo-callout text-theme-label-secondary">
                  @{username}
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
