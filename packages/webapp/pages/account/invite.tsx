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
import { useShareOrCopyLink } from '@dailydotdev/shared/src/hooks/useShareOrCopyLink';
import { AnalyticsEvent } from '@dailydotdev/shared/src/lib/analytics';
import { SocialShareIcon } from '@dailydotdev/shared/src/components/widgets/SocialShareIcon';
import { getTwitterShareLink } from '@dailydotdev/shared/src/lib/share';
import TwitterIcon from '@dailydotdev/shared/src/components/icons/Twitter';
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
  const [copyingLink, onShareOrCopyLink] = useShareOrCopyLink({
    text: labels.referral.generic.inviteText,
    link: inviteLink,
    trackObject: () => ({
      event_name: AnalyticsEvent.CopyReferralLink,
      // target_id: TargetId.GenericReferralPopup,
    }),
  });

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
            onClick={() => onShareOrCopyLink()}
          >
            {copyingLink ? 'Copying...' : 'Copy link'}
          </Button>
        }
        readOnly
      />
      <span className="my-2 font-bold typo-callout text-theme-label-tertiary">
        or invite with
      </span>
      <div className="flex flex-row gap-6">
        <SocialShareIcon
          href={getTwitterShareLink(
            inviteLink,
            labels.referral.generic.inviteText,
          )}
          icon={<TwitterIcon />}
          className="text-white bg-black"
          // onClick={() => trackClick(ShareProvider.Twitter)}
          label="X"
        />
        <SocialShareIcon
          href={getTwitterShareLink(
            inviteLink,
            labels.referral.generic.inviteText,
          )}
          icon={<TwitterIcon />}
          className="text-white bg-black"
          // onClick={() => trackClick(ShareProvider.Twitter)}
          label="X"
        />
        <SocialShareIcon
          href={getTwitterShareLink(
            inviteLink,
            labels.referral.generic.inviteText,
          )}
          icon={<TwitterIcon />}
          className="text-white bg-black"
          // onClick={() => trackClick(ShareProvider.Twitter)}
          label="X"
        />
        <SocialShareIcon
          href={getTwitterShareLink(
            inviteLink,
            labels.referral.generic.inviteText,
          )}
          icon={<TwitterIcon />}
          className="text-white bg-black"
          // onClick={() => trackClick(ShareProvider.Twitter)}
          label="X"
        />
        <SocialShareIcon
          href={getTwitterShareLink(
            inviteLink,
            labels.referral.generic.inviteText,
          )}
          icon={<TwitterIcon />}
          className="text-white bg-black"
          // onClick={() => trackClick(ShareProvider.Twitter)}
          label="X"
        />
        <SocialShareIcon
          href={getTwitterShareLink(
            inviteLink,
            labels.referral.generic.inviteText,
          )}
          icon={<TwitterIcon />}
          className="text-white bg-black"
          // onClick={() => trackClick(ShareProvider.Twitter)}
          label="X"
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
          }}
          scrollingContainer={container.current}
          placeholderAmount={referredUsersCount}
        />
      </AccountContentSection>
    </AccountPageContainer>
  );
};

AccountInvitePage.getLayout = getAccountLayout;

export default AccountInvitePage;
