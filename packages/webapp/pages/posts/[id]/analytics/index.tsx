import type { ReactElement } from 'react';
import React from 'react';
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
import { BoostPostButton } from '@dailydotdev/shared/src/features/boost/BoostPostButton';
import type { Post, PostData } from '@dailydotdev/shared/src/graphql/posts';
import {
  POST_BY_ID_STATIC_FIELDS_QUERY,
  postAnalyticsQueryOptions,
} from '@dailydotdev/shared/src/graphql/posts';
import type { PublicProfile } from '@dailydotdev/shared/src/lib/user';
import { ApiError, gqlClient } from '@dailydotdev/shared/src/graphql/common';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';
import { StaleTime } from '@dailydotdev/shared/src/lib/query';
import { usePostById } from '@dailydotdev/shared/src/hooks';
import { AnalyticsNumbersList } from '@dailydotdev/shared/src/components/analytics/AnalyticsNumbersList';
import { DataTile } from '@dailydotdev/shared/src/components/DataTile';
import { ClickableText } from '@dailydotdev/shared/src/components/buttons/ClickableText';
import classed from '@dailydotdev/shared/src/lib/classed';
import { PostShortInfo } from '@dailydotdev/shared/src/components/post/analytics/PostShortInfo';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { formatDataTileValue } from '@dailydotdev/shared/src/lib';
import { ProgressBar } from '@dailydotdev/shared/src/components/fields/ProgressBar';
import { TimeFormatType } from '@dailydotdev/shared/src/lib/dateFormat';
import { useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
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
      title: getTemplatedTitle(seoTitle(post)),
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
  const { post } = usePostById({
    id,
    options: {
      initialData,
      retry: false,
    },
  });

  const { data: postAnalytics } = useQuery(
    postAnalyticsQueryOptions({ id: post?.id }),
  );

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
      tooltip: 'The ratio of upvotes to downvotes for this post.',
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

  return (
    <div className="mx-auto w-full max-w-[48rem]">
      <LayoutHeader
        className={classNames('!mb-0 gap-2 border-b px-4', pageBorders)}
      >
        <Button
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Medium}
          icon={<ArrowIcon className="-rotate-90" />}
        />
        <Typography
          type={TypographyType.Title3}
          bold
          color={TypographyColor.Primary}
          className="flex-1"
        >
          Analytics
        </Typography>
        <BoostPostButton post={post} buttonProps={{ size: ButtonSize.Small }} />
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
              info="TODO post-analytics: Put the right info here"
              className={{
                container: 'flex-1',
              }}
              subtitle={
                // TODO post-analytics enable boosting data
                false && (
                  <Typography
                    type={TypographyType.Caption2}
                    bold
                    color={TypographyColor.Boost}
                    className="flex items-center gap-0.5"
                  >
                    <ArrowIcon size={IconSize.XXSmall} /> +3,089 boosted
                  </Typography>
                )
              }
            />
            <DataTile
              label="Unique reach"
              value={postAnalytics?.reach ?? 0}
              info="TODO post-analytics: Put the right info here"
              className={{
                container: 'flex-1',
              }}
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
        <SectionContainer>
          <SectionHeader>Boost your post</SectionHeader>
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            Give your content the spotlight it deserves. Our auto-targeting
            engine gets your post in front of developers most likely to care.
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
        {/* TODO post-analytics enable boosting data */}
        {false && (
          <SectionContainer>
            <SectionHeader>Boosting in progress</SectionHeader>
            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Tertiary}
            >
              Your post is actively being promoted to developers who are most
              likely to engage based on our targeting engine. We&apos;re making
              sure it gets prime placement where it matters most, so you can
              focus on creating while we drive the visibility.
            </Typography>
            <div>
              <Typography
                type={TypographyType.Callout}
                className="mb-1.5 flex flex-row items-center"
              >
                <CoreIcon className="mr-1" size={IconSize.Size16} />{' '}
                {formatDataTileValue(6000)} | 6 days
              </Typography>
              <div className="flex flex-col gap-1">
                <ProgressBar
                  percentage={20}
                  shouldShowBg
                  className={{ wrapper: 'h-2 rounded-6' }}
                />
                <span className="flex flex-row justify-between">
                  <Typography
                    type={TypographyType.Subhead}
                    color={TypographyColor.Secondary}
                  >
                    Started{' '}
                    <DateFormat date={new Date()} type={TimeFormatType.Post} />
                  </Typography>
                  <Typography
                    type={TypographyType.Subhead}
                    color={TypographyColor.Secondary}
                  >
                    Ends in 7 days
                  </Typography>
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
                  June 23, 2025
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
                  {formatDataTileValue(2148)}
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
                  June 31, 2025
                </Typography>
              </FlexRow>
              <FlexRow className="order-4 gap-1">
                <Typography
                  type={TypographyType.Callout}
                  color={TypographyColor.Secondary}
                >
                  Estimated daily reach:
                </Typography>
                <Typography
                  type={TypographyType.Callout}
                  bold
                  color={TypographyColor.Primary}
                >
                  {formatDataTileValue(5500)} - {formatDataTileValue(15000)}
                </Typography>
              </FlexRow>
            </div>
            <Button
              variant={ButtonVariant.Float}
              className="mr-auto bg-action-downvote-float hover:bg-action-downvote-hover"
              color={ButtonColor.Ketchup}
            >
              Stop boost
            </Button>
          </SectionContainer>
        )}
        {/* TODO post-analytics enable boosting data */}
        {false && <Divider className={dividerClassName} />}
        <SectionContainer>
          <div className="flex justify-between">
            <SectionHeader>Profile activity</SectionHeader>
            <ClickableText tag="a">
              <ArrowIcon />
              Profile analytics
            </ClickableText>
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
