import type { ReactElement } from 'react';
import React, { Fragment, useMemo, useRef } from 'react';
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
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  AddUserIcon,
  CopyIcon,
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

const HOW_IT_WORKS_STEPS = [
  {
    title: 'Share your link',
    description:
      'Send your personal invite link to developers who would appreciate signal over noise.',
  },
  {
    title: 'They join daily.dev',
    description:
      'Every developer who signs up through your link shows up in your referrals below.',
  },
  {
    title: 'Plus unlocks',
    description:
      'Hit three joins and we upgrade you to Plus for a full month, on us.',
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
              className={classNames(
                'h-px w-3 tablet:w-5',
                isFilled
                  ? 'bg-accent-cabbage-default'
                  : 'bg-border-subtlest-primary',
              )}
            />
          )}
          {isFilled && referredUser ? (
            <ProfilePicture
              user={referredUser}
              size={ProfileImageSize.Large}
              className="border-2 border-accent-cabbage-default"
            />
          ) : (
            <span
              aria-hidden
              className={classNames(
                'flex size-10 items-center justify-center rounded-full',
                isFilled
                  ? 'bg-surface-float text-accent-cabbage-default'
                  : 'border border-dashed border-border-subtlest-primary text-text-quaternary',
              )}
            >
              {isFilled ? <VIcon /> : <AddUserIcon secondary />}
            </span>
          )}
        </Fragment>
      );
    })}
    <span
      aria-hidden
      className={classNames(
        'h-px w-3 tablet:w-5',
        isCompleted
          ? 'bg-accent-cabbage-default'
          : 'bg-border-subtlest-primary',
      )}
    />
    <span
      className={classNames(
        'flex items-center gap-1 rounded-full bg-action-plus-float px-3 py-1.5 font-bold text-action-plus-default typo-callout',
        isCompleted &&
          'border border-action-plus-default motion-safe:animate-reward-pop',
      )}
    >
      <DevPlusIcon secondary size={IconSize.Small} />1 month
    </span>
  </div>
);

const GivebackPromoCard = ({
  onClick,
}: {
  onClick: () => void;
}): ReactElement => (
  <div className="relative mt-4 flex flex-col items-stretch gap-4 overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-gradient-to-br from-accent-cabbage-flat to-background-popover p-5 tablet:flex-row tablet:items-center">
    <div className="flex min-w-0 flex-1 flex-col items-start gap-2">
      <span className="font-medium uppercase tracking-wide text-accent-cabbage-default typo-caption2">
        Raised together
      </span>
      <Typography
        tag={TypographyTag.H3}
        type={TypographyType.Title3}
        bold
        className="[text-wrap:balance]"
      >
        Turn community actions into real-world donations
      </Typography>
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Secondary}
        className="[text-wrap:pretty]"
      >
        Developers spread the word about daily.dev, and we redirect our growth
        budget to causes the community picks. You never pay a cent.
      </Typography>
      <Button
        tag="a"
        href={`${webappUrl}giveback`}
        variant={ButtonVariant.Primary}
        color={ButtonColor.Cabbage}
        size={ButtonSize.Small}
        className="mt-1"
        onClick={onClick}
      >
        Explore Giveback →
      </Button>
    </div>
    {/* The charm artwork sits on black; screen-blend drops the black onto the card. */}
    <div className="relative mx-auto flex h-32 w-32 shrink-0 items-center justify-center">
      <span
        aria-hidden
        className="bg-accent-cabbage-default/20 absolute left-1/2 top-1/2 size-24 -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl"
      />
      <img
        src={cloudinaryCharmGiveback}
        alt="daily.dev Giveback charm"
        loading="lazy"
        className="relative h-full w-full animate-mascot-bob object-contain mix-blend-screen"
      />
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
  const [isCopying, onShareOrCopyLink] = useShareOrCopyLink({
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
      <section className="relative overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-5 tablet:p-8">
        {/* Aurora glows echoing the marketing landing hero. */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <span className="bg-accent-cabbage-default/25 absolute -right-10 -top-24 size-64 rounded-full blur-3xl motion-safe:animate-glow-pulse" />
          <span
            className="bg-accent-onion-default/20 absolute -bottom-28 -left-16 size-72 rounded-full blur-3xl motion-safe:animate-glow-pulse"
            style={{ animationDelay: '1.2s' }}
          />
        </div>
        <div className="relative flex flex-col items-start gap-4">
          <span className="flex items-center gap-1 font-medium uppercase tracking-wide text-action-plus-default typo-caption2">
            <DevPlusIcon secondary size={IconSize.Size16} />
            {isCompleted ? 'Reward unlocked' : 'Referral reward'}
          </span>
          <Typography
            tag={TypographyTag.H2}
            type={TypographyType.LargeTitle}
            bold
            className="[text-wrap:balance] tablet:typo-mega3"
          >
            Invite 3 friends,
            <span className="block bg-gradient-to-r from-accent-cabbage-default to-accent-onion-default bg-clip-text text-transparent">
              get 1 month of Plus free
            </span>
          </Typography>
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Secondary}
            className="max-w-md [text-wrap:pretty]"
          >
            {isCompleted
              ? 'Three friends in — your free month of Plus is unlocked. Your invites still count, and every developer you bring makes the feed sharper for everyone.'
              : 'Know developers still digging through noise for good content? Send them your link. When three of them join daily.dev, your next month of Plus is on us.'}
          </Typography>
          {isPlus && !isCompleted && (
            <Typography
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
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            {isCompleted
              ? `${INVITE_GOAL} of ${INVITE_GOAL} friends joined — enjoy your free month`
              : `${joinedCount} of ${INVITE_GOAL} friends joined`}
          </Typography>
          <Button
            className="mt-2 w-full tablet:w-auto"
            variant={ButtonVariant.Primary}
            size={ButtonSize.Large}
            icon={<CopyIcon secondary={isCopying} />}
            onClick={() => onShareOrCopyLink()}
          >
            {isCopying ? 'Link copied!' : 'Copy invite link'}
          </Button>
        </div>
      </section>
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
        title="How it works"
        description="Three steps between you and a free month of Plus."
      >
        <div className="mt-4 grid grid-cols-1 gap-3 tablet:grid-cols-3">
          {HOW_IT_WORKS_STEPS.map((step, index) => (
            <div
              key={step.title}
              className="flex flex-col gap-1 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4"
            >
              <span
                aria-hidden
                className="bg-gradient-to-r from-accent-cabbage-default to-accent-onion-default bg-clip-text font-bold text-transparent typo-title2"
              >
                {index + 1}
              </span>
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
          ))}
        </div>
      </AccountContentSection>
      {isGivebackEnabled && (
        <AccountContentSection
          title="More ways to give back"
          description="Inviting friends isn't the only way to push the community forward."
        >
          <GivebackPromoCard onClick={onGivebackClick} />
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
