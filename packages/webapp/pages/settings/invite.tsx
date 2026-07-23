import type { ReactElement } from 'react';
import React, { useMemo, useRef } from 'react';
import classNames from 'classnames';
import {
  ReferralCampaignKey,
  useReferralCampaign,
} from '@dailydotdev/shared/src/hooks';
import { link } from '@dailydotdev/shared/src/lib/links';
import { labels } from '@dailydotdev/shared/src/lib';
import {
  cloudinaryCharmGiveback,
  cloudinaryCharmInviteFriends,
} from '@dailydotdev/shared/src/lib/image';
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
import { TruncateText } from '@dailydotdev/shared/src/components/utilities';
import type { NextSeoProps } from 'next-seo';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  AddUserIcon,
  DevPlusIcon,
  VIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  ProfileImageSize,
  ProfilePicture,
} from '@dailydotdev/shared/src/components/ProfilePicture';
import { usePlusSubscription } from '@dailydotdev/shared/src/hooks/usePlusSubscription';
import { useConditionalFeature } from '@dailydotdev/shared/src/hooks/useConditionalFeature';
import { featureGiveback } from '@dailydotdev/shared/src/lib/featureManagement';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';
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

const INVITE_GOAL = 3;

interface InviteProgressProps {
  joinedCount: number;
  isCompleted: boolean;
  referredUsers: UserShortProfile[];
}

const InviteProgress = ({
  joinedCount,
  isCompleted,
  referredUsers,
}: InviteProgressProps): ReactElement => (
  <div className="mt-4 flex flex-col items-start gap-2">
    <Typography type={TypographyType.Footnote} color={TypographyColor.Tertiary}>
      {isCompleted
        ? `${INVITE_GOAL} of ${INVITE_GOAL} friends joined — Plus unlocked`
        : `${joinedCount} of ${INVITE_GOAL} friends joined`}
    </Typography>
    <div
      className="flex items-center gap-2"
      aria-label={`${joinedCount} of ${INVITE_GOAL} friends joined`}
    >
      {Array.from({ length: INVITE_GOAL }, (_, index) => {
        const isFilled = index < joinedCount;
        const referredUser = referredUsers[index];

        if (isFilled && referredUser) {
          return (
            <ProfilePicture
              key={referredUser.id}
              user={referredUser}
              size={ProfileImageSize.Medium}
            />
          );
        }

        return (
          <span
            aria-hidden
            key={`invite-slot-${index}`}
            className={classNames(
              'flex size-8 items-center justify-center rounded-10',
              isFilled
                ? 'bg-surface-float text-text-secondary'
                : 'border border-dashed border-border-subtlest-primary text-text-quaternary',
            )}
          >
            {isFilled ? <VIcon /> : <AddUserIcon secondary />}
          </span>
        );
      })}
      <span aria-hidden className="h-px w-3 bg-border-subtlest-tertiary" />
      <span
        className={classNames(
          'flex h-8 items-center gap-1 rounded-10 bg-action-plus-float px-3 font-bold text-action-plus-default typo-footnote',
          isCompleted && 'border border-action-plus-default',
        )}
      >
        <DevPlusIcon secondary size={IconSize.Size16} />1 month of Plus
      </span>
    </div>
  </div>
);

const AccountInvitePage = (): ReactElement => {
  const { user } = useAuthContext();
  const { isPlus } = usePlusSubscription();
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
  }, [usersResult]);

  const joinedCount = Math.min(referredUsersCount, INVITE_GOAL);
  const isCompleted = referredUsersCount >= INVITE_GOAL;

  const onLogShare = (provider: ShareProvider) => {
    logEvent({
      event_name: LogEvent.InviteReferral,
      target_id: provider,
      target_type: TargetType.InviteFriendsPage,
    });
  };

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
        title="Invite 3 friends, get 1 month of Plus"
        description={
          isCompleted
            ? '3 friends joined. Your free month of Plus is unlocked.'
            : 'When 3 developers join daily.dev through your link, your free month of Plus starts.'
        }
      >
        {isPlus && !isCompleted && (
          <Typography
            className="mt-1"
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            Already on Plus? The free month is added to your subscription.
          </Typography>
        )}
        <InviteProgress
          joinedCount={joinedCount}
          isCompleted={isCompleted}
          referredUsers={users}
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
      {isGivebackEnabled && (
        <AccountContentSection
          title="More ways to give back"
          description="Inviting friends isn't the only way to push the community forward."
        >
          {/* Same treatment as the giveback founding-reward card: a 1px
              gradient frame over an opaque base, washed with the same gradient
              at a true 8% via color-mix. */}
          <div className="mt-4 rounded-16 bg-gradient-to-r from-accent-avocado-default via-accent-cabbage-default to-accent-cheese-default p-px shadow-2">
            <div
              className="flex flex-col items-start gap-3 rounded-[15px] bg-background-default p-4 tablet:flex-row tablet:items-center"
              style={{
                backgroundImage:
                  'linear-gradient(to right, color-mix(in srgb, var(--theme-accent-avocado-default) 8%, transparent), color-mix(in srgb, var(--theme-accent-cabbage-default) 8%, transparent), color-mix(in srgb, var(--theme-accent-cheese-default) 8%, transparent))',
              }}
            >
              <div className="flex min-w-0 flex-1 flex-col items-start gap-0.5">
                <span className="bg-gradient-to-r from-accent-avocado-default via-accent-cabbage-default to-accent-cheese-default bg-clip-text font-bold uppercase tracking-wide text-transparent typo-caption2">
                  Community giveback
                </span>
                <Typography type={TypographyType.Callout} bold>
                  Turn community actions into real donations
                </Typography>
                <Typography
                  type={TypographyType.Footnote}
                  color={TypographyColor.Secondary}
                  className="[text-wrap:pretty]"
                >
                  We redirect our growth budget to causes the community picks —
                  you never pay a cent.
                </Typography>
                <Button
                  tag="a"
                  href={`${webappUrl}giveback`}
                  variant={ButtonVariant.Primary}
                  size={ButtonSize.Small}
                  className="mt-3"
                  onClick={onGivebackClick}
                >
                  Explore Giveback
                </Button>
              </div>
              {/* The charm artwork sits on black; screen-blend drops the black
                  on the dark card. */}
              <span className="relative mx-auto flex size-24 shrink-0 items-center justify-center tablet:mx-0">
                <span
                  aria-hidden
                  className="bg-accent-cabbage-default/25 absolute inset-0 m-auto size-3/4 rounded-full blur-2xl motion-safe:animate-glow-pulse"
                />
                <img
                  src={cloudinaryCharmGiveback}
                  alt="daily.dev Giveback charm"
                  loading="lazy"
                  className="relative size-full select-none object-contain mix-blend-screen"
                />
              </span>
            </div>
          </div>
        </AccountContentSection>
      )}
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
