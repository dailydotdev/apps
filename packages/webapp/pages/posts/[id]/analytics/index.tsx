import type { ReactElement } from 'react';
import React, { useEffect, useMemo } from 'react';
import type { GetServerSideProps } from 'next';
import type { NextSeoProps } from 'next-seo';
import type { ClientError } from 'graphql-request';
import { LayoutHeader } from '@dailydotdev/shared/src/components/layout/common';
import {
  DateFormat,
  Divider,
  FlexRow,
  pageBorders,
  ResponsivePageContainer,
} from '@dailydotdev/shared/src/components/utilities';
import classNames from 'classnames';
import {
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/common';
import {
  AddUserIcon,
  ArrowIcon,
  BookmarkIcon,
  CoreFlatIcon,
  CoreIcon,
  DiscussIcon,
  MedalBadgeIcon,
  MergeIcon,
  RefreshIcon,
  ReputationIcon,
  ShareIcon,
  SquadIcon,
  UpvoteIcon,
  UserIcon,
} from '@dailydotdev/shared/src/components/icons';
import {
  Button,
  ButtonColor,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { BoostPostButton } from '@dailydotdev/shared/src/features/boost/BoostButton';
import type { Post, PostData } from '@dailydotdev/shared/src/graphql/posts';
import {
  POST_BY_ID_STATIC_FIELDS_QUERY,
  postAnalyticsQueryOptions,
} from '@dailydotdev/shared/src/graphql/posts';
import type { PublicProfile } from '@dailydotdev/shared/src/lib/user';
import { canViewPostAnalytics } from '@dailydotdev/shared/src/lib/user';
import { ApiError, gqlClient } from '@dailydotdev/shared/src/graphql/common';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';
import {
  getPostByIdKey,
  StaleTime,
  updatePostCache,
} from '@dailydotdev/shared/src/lib/query';
import { usePostById } from '@dailydotdev/shared/src/hooks';
import { AnalyticsNumbersList } from '@dailydotdev/shared/src/components/analytics/AnalyticsNumbersList';
import { DataTile } from '@dailydotdev/shared/src/components/DataTile';
import { ClickableText } from '@dailydotdev/shared/src/components/buttons/ClickableText';
import classed from '@dailydotdev/shared/src/lib/classed';
import { BoostingLabel } from '@dailydotdev/shared/src/components/post/analytics/BoostingLabel';
import { PostShortInfo } from '@dailydotdev/shared/src/components/post/analytics/PostShortInfo';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { formatDataTileValue, labels } from '@dailydotdev/shared/src/lib';
import { ProgressBar } from '@dailydotdev/shared/src/components/fields/ProgressBar';
import { TimeFormatType } from '@dailydotdev/shared/src/lib/dateFormat';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useShowBoostButton } from '@dailydotdev/shared/src/features/boost/useShowBoostButton';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import {
  CampaignState,
  CampaignType,
} from '@dailydotdev/shared/src/graphql/campaigns';
import { getAbsoluteDifferenceInDays } from '@dailydotdev/shared/src/features/boost/utils';
import { usePrompt } from '@dailydotdev/shared/src/hooks/usePrompt';
import { stopBoostPromptOptions } from '@dailydotdev/shared/src/features/boost/BoostedViewModal';
import { useCampaignMutation } from '@dailydotdev/shared/src/features/boost/useCampaignMutation';
import {
  dateFormatInTimezone,
  DEFAULT_TIMEZONE,
} from '@dailydotdev/shared/src/lib/timezones';
import { utcToZonedTime } from 'date-fns-tz';
import { useLazyModal } from '@dailydotdev/shared/src/hooks/useLazyModal';
import { LazyModal } from '@dailydotdev/shared/src/components/modals/common/types';
import { BoostIcon } from '@dailydotdev/shared/src/components/icons/Boost';
import { useCampaignEstimation } from '@dailydotdev/shared/src/features/boost/useCampaignEstimation';
import { useCampaigns } from '@dailydotdev/shared/src/features/boost/useCampaigns';
import { getSeoDescription } from '../../../../components/PostSEOSchema';
import type { Props } from '../index';
import { seoTitle } from '../index';
import { getTemplatedTitle } from '../../../../components/layouts/utils';
import { getLayout } from '../../../../components/layouts/MainLayout';
import type { SharePostPageProps } from '../share';
import type { AnalyticsNumberList } from '../../../../../shared/src/components/analytics/common';

const ImpressionsChart = dynamic(
  () =>
    import(
      '../../../../../shared/src/components/analytics/ImpressionsChart'
    ).then((mod) => mod.ImpressionsChart),
  {
    loading: () => <div className="h-40 w-full" />,
  },
);

interface SectionHeaderProps {
  children: React.ReactNode;
}
export type PostAnalyticsPageProps = Props;

export const getServerSideProps: GetServerSideProps<
  SharePostPageProps | { redirect: { destination: string } }
> = async ({ params, res }) => {
  const { id } = params;
  try {
    const promises: [Promise<PostData>, Promise<PublicProfile>?] = [
      gqlClient.request<PostData>(POST_BY_ID_STATIC_FIELDS_QUERY, { id }),
    ];

    const [initialData] = await Promise.all(promises);

    const post = initialData.post as Post;
    const seo: NextSeoProps = {
      canonical: post?.slug ? `${webappUrl}posts/${post.slug}` : undefined,
      title: getTemplatedTitle(
        [seoTitle(post), 'Analytics'].filter(Boolean).join(' | '),
      ),
      description: getSeoDescription(post),
      openGraph: {
        images: [
          {
            url: `https://og.daily.dev/api/posts/${post?.id}`,
          },
        ],
        article: {
          publishedTime: post?.createdAt,
          tags: post?.tags,
        },
      },
    };

    res.setHeader(
      'Cache-Control',
      `public, max-age=0, must-revalidate, s-maxage=${StaleTime.OneHour}`,
    );

    return {
      props: {
        id: initialData.post.id,
        initialData,
        seo,
      },
    };
  } catch (err) {
    const clientError = err as ClientError;
    const errors = Object.values(ApiError);
    if (errors.includes(clientError?.response?.errors?.[0]?.extensions?.code)) {
      const { postId } = clientError.response.errors[0].extensions;

      return {
        props: { id: postId || id },
      };
    }
    throw err;
  }
};

const dividerClassName = 'bg-border-subtlest-tertiary';
const SectionContainer = classed('div', 'flex flex-col gap-4');
const SectionHeader = ({ children }: SectionHeaderProps): ReactElement => {
  return (
    <Typography
      type={TypographyType.Body}
      bold
      tag={TypographyTag.H2}
      color={TypographyColor.Primary}
    >
      {children}
    </Typography>
  );
};

const PostAnalyticsPage = ({
  id,
  initialData,
}: PostAnalyticsPageProps): ReactElement => {
  const { openModal } = useLazyModal();
  const queryClient = useQueryClient();
  const { showPrompt } = usePrompt();
  const router = useRouter();
  const { user, isAuthReady } = useAuthContext();

  const { post, isLoading } = usePostById({
    id,
    options: {
      initialData,
      retry: false,
    },
  });
  const isAuthor = !!user?.id && user.id === post?.author?.id;

  const { data: postAnalytics } = useQuery({
    ...postAnalyticsQueryOptions({ id: post?.id }),
    enabled: canViewPostAnalytics({ post, user }),
  });

  // get latest campaign user created for this post
  const campaignQuery = useCampaigns({
    entityId: post?.id,
    first: 1,
    enabled: isAuthor && !!post?.id,
  });
  const campaign = campaignQuery.data?.pages[0]?.edges[0]?.node;

  const canBoost = useShowBoostButton({ post });
  const isBoosting = !!post?.flags?.campaignId;

  const profileActivityList: AnalyticsNumberList = [
    {
      icon: <ReputationIcon secondary />,
      label: 'Reputation earned',
      value: postAnalytics?.reputation ?? 0,
      tooltip:
        'The number of reputation points you gained from this post. Reputation increases your standing in the community.',
    },
    {
      icon: <CoreFlatIcon />,
      label: 'Cores earned',
      value: postAnalytics?.coresEarned ?? 0,
      tooltip:
        'The number of Cores you received from this post, including any awards given by other users.',
    },
    {
      icon: <UserIcon />,
      label: 'Profile viewers',
      value: postAnalytics?.profileViews ?? 0,
    },

    {
      icon: <AddUserIcon secondary={false} />,
      label: 'Followers gained',
      value: postAnalytics?.followers ?? 0,
    },
    {
      icon: <SquadIcon />,
      label: 'Squad members gained',
      value: postAnalytics?.squadJoins ?? 0,
    },
  ].filter((item) => typeof item.value !== 'undefined');

  const engagementActivityList: AnalyticsNumberList = [
    {
      icon: <UpvoteIcon />,
      label: 'Upvotes',
      value: postAnalytics?.upvotes ?? 0,
    },
    {
      icon: <MergeIcon />,
      label: 'Upvotes ratio',
      value: `${postAnalytics?.upvotesRatio ?? 0}%`,
      tooltip: 'The percentage of upvotes out of total votes.',
    },
    {
      icon: <DiscussIcon />,
      label: 'Comments',
      value: postAnalytics?.comments ?? 0,
    },

    {
      icon: <BookmarkIcon />,
      label: 'Bookmarks',
      value: postAnalytics?.bookmarks ?? 0,
    },
    {
      icon: <MedalBadgeIcon secondary />,
      label: 'Awards',
      value: postAnalytics?.awards ?? 0,
    },
    {
      icon: <ShareIcon />,
      label: 'Shares',
      value: postAnalytics?.shares ?? 0,
    },
  ];

  const postLink = post
    ? `${webappUrl}posts/${
        router?.query?.id === post.slug ? post.slug : post.id
      }`
    : webappUrl;

  useEffect(() => {
    if (!isAuthReady) {
      return;
    }

    if (isLoading) {
      return;
    }

    if (user?.isTeamMember) {
      return;
    }

    if (!canViewPostAnalytics({ user, post })) {
      router.replace(postLink);
    }
  }, [isLoading, isAuthReady, post, postLink, router, user]);

  const userTimezone = user?.timezone || DEFAULT_TIMEZONE;
  const campaignCompleted = campaign?.state !== CampaignState.Active;

  const campaignLengthDays = campaign
    ? getAbsoluteDifferenceInDays(
        utcToZonedTime(campaign.createdAt, userTimezone),
        utcToZonedTime(campaign.endedAt, userTimezone),
      )
    : 0;

  const campaignEndsInDays = useMemo(() => {
    if (!campaign?.endedAt) {
      return undefined;
    }

    if (campaignCompleted) {
      return 0;
    }

    const now = new Date();
    const endedAt = new Date(campaign?.endedAt);

    if (now >= endedAt) {
      return 0;
    }

    return getAbsoluteDifferenceInDays(
      utcToZonedTime(endedAt, userTimezone),
      utcToZonedTime(now, userTimezone),
    );
  }, [campaign?.endedAt, campaignCompleted, userTimezone]);

  const { estimatedReach } = useCampaignEstimation({
    type: CampaignType.Post,
    query: {
      budget: campaign?.flags?.budget * campaignLengthDays,
    },
    referenceId: post?.id,
    enabled: !!campaign?.flags?.budget && campaignLengthDays > 0 && isAuthor,
  });

  const { onCancelBoost, isLoadingCancel } = useCampaignMutation({
    onCancelSuccess: () => {
      const postId = campaign.referenceId;

      updatePostCache(queryClient, postId, (old) => ({
        flags: { ...old.flags, campaignId: null },
      }));

      queryClient.setQueryData<PostData>(getPostByIdKey(postId), (old) => {
        if (!old) {
          return old;
        }

        return {
          ...old,
          post: {
            ...old.post,
            flags: { ...old.post.flags, campaignId: null },
          },
        };
      });
    },
  });

  const onBoostClick = async () => {
    if (!campaignCompleted) {
      if (!(await showPrompt(stopBoostPromptOptions))) {
        return;
      }

      await onCancelBoost(campaign.id);

      return;
    }

    openModal({
      type: LazyModal.BoostPost,
      props: {
        post,
      },
    });
  };

  const percentage = useMemo(() => {
    if (!campaign) {
      return 0;
    }

    if (campaignCompleted) {
      return 100;
    }

    const now = Date.now();
    const startMs = new Date(campaign.createdAt).getTime();
    const endMs = new Date(campaign.endedAt).getTime();

    return Math.min(
      100,
      Math.max(0, ((now - startMs) / (endMs - startMs)) * 100),
    );
  }, [campaignCompleted, campaign]);

  return (
    <div className="mx-auto w-full max-w-[48rem]">
      <LayoutHeader
        className={classNames('!mb-0 gap-2 border-b px-4', pageBorders)}
      >
        <Button
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Medium}
          icon={<ArrowIcon className="-rotate-90" />}
          onClick={() => {
            router.back();
          }}
        />
        <Typography
          type={TypographyType.Title3}
          bold
          color={TypographyColor.Primary}
          className="flex-1"
        >
          Post analytics
        </Typography>
        {isBoosting ? (
          <BoostingLabel />
        ) : (
          <BoostPostButton
            buttonProps={{
              size: ButtonSize.Small,
            }}
            post={post}
          />
        )}
      </LayoutHeader>
      <ResponsivePageContainer className="!mx-0 !w-full !max-w-full gap-6">
        <SectionContainer>
          <PostShortInfo post={post} />
        </SectionContainer>
        <Divider className={dividerClassName} />
        <SectionContainer>
          <SectionHeader>Discovery</SectionHeader>
          <div className="flex gap-4">
            <DataTile
              label="Total impressions"
              value={postAnalytics?.impressions ?? 0}
              info="The number of times your post appeared in front of developers across the platform."
              className={{
                container: 'flex-1',
              }}
              subtitle={
                !!postAnalytics?.impressionsAds && (
                  <Typography
                    type={TypographyType.Caption2}
                    bold
                    color={TypographyColor.Boost}
                    className="flex items-center gap-0.5"
                  >
                    <BoostIcon size={IconSize.XXSmall} /> +
                    {formatDataTileValue(postAnalytics.impressionsAds)} boosted
                  </Typography>
                )
              }
            />
            <DataTile
              label="Unique reach"
              value={postAnalytics?.reach ?? 0}
              info="The number of distinct developers that saw your post. This number is an estimate and does not include repeat displays."
              className={{
                container: 'flex-1',
              }}
              subtitle={
                !!postAnalytics?.reachAds && (
                  <Typography
                    type={TypographyType.Caption2}
                    bold
                    color={TypographyColor.Boost}
                    className="flex items-center gap-0.5"
                  >
                    <BoostIcon size={IconSize.XXSmall} /> +
                    {formatDataTileValue(postAnalytics.reachAds)} boosted
                  </Typography>
                )
              }
            />
          </div>
          <div className="flex items-center">
            <Typography type={TypographyType.Footnote} bold>
              Impressions in the last 45 days
            </Typography>
            <div className="ml-auto flex gap-2">
              <div className="flex items-center gap-1">
                <div className="size-2 rounded-full bg-brand-default" />{' '}
                <Typography type={TypographyType.Footnote}>Organic</Typography>
              </div>
              <div className="flex items-center gap-1">
                <div className="size-2 rounded-full bg-accent-blueCheese-default" />{' '}
                <Typography type={TypographyType.Footnote}>Boosted</Typography>
              </div>
            </div>
          </div>
          <ImpressionsChart post={post} />
        </SectionContainer>
        <Divider className={dividerClassName} />
        {canBoost && !campaign && (
          <>
            <SectionContainer>
              <SectionHeader>Boost your post</SectionHeader>
              <Typography
                type={TypographyType.Callout}
                color={TypographyColor.Tertiary}
              >
                Give your content the spotlight it deserves. Our auto-targeting
                engine gets your post in front of developers most likely to
                care.
              </Typography>
              <Typography
                type={TypographyType.Footnote}
                color={TypographyColor.Boost}
              >
                Reach up to 100k more developers now
              </Typography>
              <BoostPostButton
                post={post}
                buttonProps={{ size: ButtonSize.Small, className: 'mr-auto' }}
              />
            </SectionContainer>
            <Divider className={dividerClassName} />
          </>
        )}
        {!!campaign && (
          <SectionContainer>
            <SectionHeader>
              {!campaignCompleted
                ? labels.analytics.boost.activeTitle
                : labels.analytics.boost.completedTitle}
            </SectionHeader>
            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Tertiary}
            >
              {!campaignCompleted
                ? labels.analytics.boost.activeDescription
                : labels.analytics.boost.completedDescription}
            </Typography>
            <div>
              <Typography
                type={TypographyType.Callout}
                className="mb-1.5 flex flex-row items-center"
              >
                <CoreIcon className="mr-1" size={IconSize.Size16} />{' '}
                {formatDataTileValue(campaign.flags?.budget)}
                {campaignLengthDays > 0 &&
                  ` | ${campaignLengthDays} day${
                    campaignLengthDays > 1 ? 's' : ''
                  }`}
              </Typography>
              <div className="flex flex-col gap-1">
                <ProgressBar
                  percentage={percentage}
                  shouldShowBg
                  className={{
                    wrapper: 'h-2 rounded-6',
                    barColor: 'bg-accent-blueCheese-default',
                  }}
                />
                <span className="flex flex-row justify-between">
                  <Typography
                    type={TypographyType.Subhead}
                    color={TypographyColor.Secondary}
                  >
                    {campaignCompleted ? 'Completed' : 'Started '}
                    {!campaignCompleted && (
                      <DateFormat
                        date={new Date(campaign.createdAt)}
                        type={TimeFormatType.Post}
                      />
                    )}
                  </Typography>
                  {campaignEndsInDays > 0 && (
                    <Typography
                      type={TypographyType.Subhead}
                      color={TypographyColor.Secondary}
                    >
                      Ends in {campaignEndsInDays} day
                      {campaignEndsInDays > 1 ? 's' : ''}
                    </Typography>
                  )}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2 laptop:grid-cols-2">
              <FlexRow className="order-1 gap-1">
                <Typography
                  type={TypographyType.Callout}
                  color={TypographyColor.Secondary}
                >
                  Start date:
                </Typography>
                <Typography
                  type={TypographyType.Callout}
                  bold
                  color={TypographyColor.Primary}
                >
                  {dateFormatInTimezone(
                    new Date(campaign?.createdAt),
                    'MMMM dd, yyyy',
                    userTimezone,
                  )}
                </Typography>
              </FlexRow>
              <FlexRow className="order-3 gap-1 laptop:order-2">
                <Typography
                  type={TypographyType.Callout}
                  color={TypographyColor.Secondary}
                >
                  Spend so far:
                </Typography>
                <CoreIcon />
                <Typography
                  type={TypographyType.Callout}
                  bold
                  color={TypographyColor.Primary}
                >
                  {formatDataTileValue(campaign.flags?.spend)}
                </Typography>
              </FlexRow>
              <FlexRow className="order-2 gap-1 laptop:order-3">
                <Typography
                  type={TypographyType.Callout}
                  color={TypographyColor.Secondary}
                >
                  End date:
                </Typography>
                <Typography
                  type={TypographyType.Callout}
                  bold
                  color={TypographyColor.Primary}
                >
                  {dateFormatInTimezone(
                    new Date(campaign?.endedAt),
                    'MMMM dd, yyyy',
                    userTimezone,
                  )}
                </Typography>
              </FlexRow>
              <FlexRow className="order-4 gap-1">
                <Typography
                  type={TypographyType.Callout}
                  color={TypographyColor.Secondary}
                >
                  Estimated daily reach:
                </Typography>
                {!!estimatedReach && (
                  <Typography
                    type={TypographyType.Callout}
                    bold
                    color={TypographyColor.Primary}
                  >
                    {[estimatedReach.min, estimatedReach.max]
                      .map((item) => formatDataTileValue(item))
                      .join(' - ')}
                  </Typography>
                )}
              </FlexRow>
            </div>
            <Button
              icon={campaignCompleted && <RefreshIcon />}
              size={ButtonSize.Small}
              variant={
                campaignCompleted
                  ? ButtonVariant.Secondary
                  : ButtonVariant.Float
              }
              pressed
              className={classNames(
                'mr-auto',
                !campaignCompleted &&
                  'bg-action-downvote-float hover:bg-action-downvote-hover',
                campaignCompleted && 'hover:bg-action-blueCheese-hober',
              )}
              color={
                !campaignCompleted
                  ? ButtonColor.Ketchup
                  : ButtonColor.BlueCheese
              }
              onClick={onBoostClick}
              loading={isLoadingCancel}
            >
              {!campaignCompleted ? 'Stop boost' : 'Boost again'}
            </Button>
          </SectionContainer>
        )}
        {!!campaign && <Divider className={dividerClassName} />}
        <SectionContainer>
          <div className="flex justify-between">
            <SectionHeader>Profile activity</SectionHeader>
            {/* TODO profile-analytics enable when profile analytics are ready */}
            {false && (
              <ClickableText tag="a">
                <ArrowIcon />
                Profile analytics
              </ClickableText>
            )}
          </div>
          <AnalyticsNumbersList data={profileActivityList} />
        </SectionContainer>
        <Divider className={dividerClassName} />
        <SectionContainer>
          <SectionHeader>Engagement</SectionHeader>
          <AnalyticsNumbersList data={engagementActivityList} />
        </SectionContainer>
      </ResponsivePageContainer>
    </div>
  );
};

PostAnalyticsPage.getLayout = getLayout;
PostAnalyticsPage.layoutProps = {
  screenCentered: false,
};

export default PostAnalyticsPage;
