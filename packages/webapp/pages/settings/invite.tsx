import type { ReactElement } from 'react';
import React, { Fragment, useMemo, useRef } from 'react';
import classNames from 'classnames';
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
  GiftIcon,
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

const HOW_IT_WORKS_STEPS = [
  {
    title: 'Share your link',
    description: 'Copy it or send it through any of the platforms above.',
  },
  {
    title: 'They join daily.dev',
    description:
      'Each signup through your link appears in your referrals below.',
  },
  {
    title: 'Plus unlocks',
    description: 'After three joins, your free month of Plus kicks in.',
  },
] as const;

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
  <div className="mt-4 flex flex-wrap items-center gap-3">
    <div
      className="flex items-center"
      aria-label={`${joinedCount} of ${INVITE_GOAL} friends joined`}
    >
      {Array.from({ length: INVITE_GOAL }, (_, index) => {
        const isFilled = index < joinedCount;
        const referredUser = referredUsers[index];

        return (
          <Fragment key={referredUser?.id ?? `invite-slot-${index}`}>
            {index > 0 && (
              <span
                aria-hidden
                className="h-px w-3 bg-border-subtlest-tertiary"
              />
            )}
            {isFilled && referredUser ? (
              <ProfilePicture
                user={referredUser}
                size={ProfileImageSize.Medium}
              />
            ) : (
              <span
                aria-hidden
                className={classNames(
                  'flex size-8 items-center justify-center rounded-full',
                  isFilled
                    ? 'bg-surface-float text-text-secondary'
                    : 'border border-dashed border-border-subtlest-primary text-text-quaternary',
                )}
              >
                {isFilled ? <VIcon /> : <AddUserIcon secondary />}
              </span>
            )}
          </Fragment>
        );
      })}
      <span aria-hidden className="h-px w-3 bg-border-subtlest-tertiary" />
      <span
        className={classNames(
          'flex items-center gap-0.5 rounded-full bg-action-plus-float px-2 py-0.5 font-bold text-action-plus-default typo-footnote',
          isCompleted && 'border border-action-plus-default',
        )}
      >
        <DevPlusIcon secondary size={IconSize.Size16} />1 month
      </span>
    </div>
    <Typography type={TypographyType.Footnote} color={TypographyColor.Tertiary}>
      {isCompleted
        ? `${INVITE_GOAL} of ${INVITE_GOAL} friends joined — free month unlocked`
        : `${joinedCount} of ${INVITE_GOAL} friends joined`}
    </Typography>
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
        title="Invite 3 friends, get 1 month of Plus free"
        description={
          isCompleted
            ? 'Three developers joined through your link — your free month of Plus is unlocked. Invites keep counting toward the community.'
            : 'Share your personal link with developers you rate. Once three of them join daily.dev, your next month of Plus is on us.'
        }
      >
        {isPlus && !isCompleted && (
          <Typography
            className="mt-1"
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            Already on Plus? Your free month gets added on top of your current
            subscription.
          </Typography>
        )}
        <InviteProgress
          joinedCount={joinedCount}
          isCompleted={isCompleted}
          referredUsers={users}
        />
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
      <AccountContentSection title="How it works">
        <ol className="mt-4 flex flex-col gap-3">
          {HOW_IT_WORKS_STEPS.map((step, index) => (
            <li key={step.title} className="flex items-start gap-3">
              <span
                aria-hidden
                className="flex size-6 shrink-0 items-center justify-center rounded-full bg-surface-float font-bold text-text-secondary typo-footnote"
              >
                {index + 1}
              </span>
              <div className="flex min-w-0 flex-col">
                <Typography type={TypographyType.Callout} bold>
                  {step.title}
                </Typography>
                <Typography
                  type={TypographyType.Footnote}
                  color={TypographyColor.Tertiary}
                >
                  {step.description}
                </Typography>
              </div>
            </li>
          ))}
        </ol>
      </AccountContentSection>
      {isGivebackEnabled && (
        <AccountContentSection
          title="More ways to give back"
          description="Inviting friends isn't the only way to push the community forward."
        >
          <div className="mt-4 flex flex-col items-start gap-3 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4 tablet:flex-row tablet:items-center">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-background-subtle text-text-secondary">
              <GiftIcon secondary size={IconSize.Small} />
            </span>
            <div className="flex min-w-0 flex-1 flex-col">
              <Typography type={TypographyType.Callout} bold>
                Turn community actions into real donations
              </Typography>
              <Typography
                type={TypographyType.Footnote}
                color={TypographyColor.Tertiary}
              >
                We redirect our growth budget to causes the community picks —
                you never pay a cent.
              </Typography>
            </div>
            <Button
              tag="a"
              href={`${webappUrl}giveback`}
              variant={ButtonVariant.Secondary}
              size={ButtonSize.Small}
              onClick={onGivebackClick}
            >
              Explore Giveback
            </Button>
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
