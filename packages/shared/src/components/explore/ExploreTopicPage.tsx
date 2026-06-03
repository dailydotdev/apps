import type { ReactElement, ReactNode } from 'react';
import React, { useContext, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import Head from 'next/head';
import Feed from '../Feed';
import {
  MOST_DISCUSSED_FEED_QUERY,
  MOST_UPVOTED_FEED_QUERY,
  TAG_FEED_QUERY,
} from '../../graphql/feed';
import type { TopPost } from '../../graphql/feed';
import AuthContext from '../../contexts/AuthContext';
import type { ButtonProps } from '../buttons/Button';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import useTagAndSource from '../../hooks/useTagAndSource';
import { AuthTriggers } from '../../lib/auth';
import { OtherFeedPage, RequestKey, StaleTime } from '../../lib/query';
import { LogEvent, Origin } from '../../lib/log';
import type { Keyword } from '../../graphql/keywords';
import { IconSize } from '../Icon';
import {
  BlockIcon,
  DiscussIcon,
  MiniCloseIcon as XIcon,
  OpenLinkIcon,
  PlusIcon,
  UpvoteIcon,
} from '../icons';
import type { TagsData } from '../../graphql/feedSettings';
import useFeedSettings from '../../hooks/useFeedSettings';
import { ReferralCampaignKey, useFeedLayout } from '../../hooks';
import type { Source } from '../../graphql/sources';
import { SOURCES_BY_TAG_QUERY } from '../../graphql/sources';
import type { Connection } from '../../graphql/common';
import { gqlClient } from '../../graphql/common';
import { ActiveFeedNameContext } from '../../contexts';
import HorizontalFeed from '../feeds/HorizontalFeed';
import { PostType } from '../../graphql/posts';
import { useFeature } from '../GrowthBookProvider';
import { feature } from '../../lib/featureManagement';
import { cloudinarySourceRoadmap } from '../../lib/image';
import { anchorDefaultRel, formatKeyword } from '../../lib/strings';
import Link from '../utilities/Link';
import CustomFeedOptionsMenu from '../CustomFeedOptionsMenu';
import { ArchiveEntryCard } from '../archive/ArchiveEntryCard';
import { ArchiveScopeType } from '../../graphql/archive';
import { useContentPreference } from '../../hooks/contentPreference/useContentPreference';
import { ContentPreferenceType } from '../../graphql/contentPreference';
import { TOP_CREATORS_BY_TAG_QUERY } from '../../graphql/users';
import type { UserShortProfile } from '../../lib/user';
import { SponsoredTagHero } from '../brand/SponsoredTagHero';
import { RelatedEntities } from '../RelatedEntities';
import { ElementPlaceholder } from '../ElementPlaceholder';
import UserEntityCard from '../cards/entity/UserEntityCard';
import { largeNumberFormat } from '../../lib';
import { getExploreTagPageLink } from '../../lib/links';
import { webappUrl } from '../../lib/constants';
import { useChipBarNavigation } from './useChipBarNavigation';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';

const SUPPORTED_TYPES = [
  PostType.Article,
  PostType.VideoYouTube,
  PostType.Collection,
  PostType.Share,
  PostType.Freeform,
  PostType.LiveRoom,
];

export interface ExploreTopicPageProps {
  tag: string;
  initialData: Keyword | null;
  topPosts: TopPost[];
  recommendedTags: TagsData['tags'];
  topContributors: UserShortProfile[];
  jsonLd?: string | null;
}

const SectionHeading = ({
  children,
}: {
  children: ReactNode;
}): ReactElement => (
  <Typography
    tag={TypographyTag.H2}
    type={TypographyType.Title3}
    color={TypographyColor.Primary}
    bold
    className="mb-4 mt-2"
  >
    {children}
  </Typography>
);

const RelatedTagsBar = ({
  tag,
  tags,
}: {
  tag: string;
  tags: TagsData['tags'];
}): ReactElement | null => {
  const { ref, onKeyDown } = useChipBarNavigation();
  const names = (tags ?? [])
    .map((item) => item.name)
    .filter((name): name is string => !!name);

  if (names.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Related topics" className="relative mx-4">
      <div
        ref={ref}
        onKeyDown={onKeyDown}
        role="toolbar"
        aria-orientation="horizontal"
        className="no-scrollbar flex items-center gap-2 overflow-x-auto pr-12"
      >
        <Link href={getExploreTagPageLink(tag)} legacyBehavior>
          <Button
            tag="a"
            href={getExploreTagPageLink(tag)}
            aria-current="page"
            pressed
            size={ButtonSize.Small}
            variant={ButtonVariant.Float}
          >
            #{tag}
          </Button>
        </Link>
        {names.map((name) => (
          <Link key={name} href={getExploreTagPageLink(name)} legacyBehavior>
            <Button
              tag="a"
              href={getExploreTagPageLink(name)}
              size={ButtonSize.Small}
              variant={ButtonVariant.Tertiary}
            >
              #{name}
            </Button>
          </Link>
        ))}
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-r from-transparent to-background-default"
      />
    </nav>
  );
};

const TagTopSources = ({ tag }: { tag: string }): ReactElement | null => {
  const { data: topSources, isPending } = useQuery({
    queryKey: [RequestKey.SourceByTag, null, tag],
    queryFn: async () =>
      gqlClient.request<{ sourcesByTag: Connection<Source> }>(
        SOURCES_BY_TAG_QUERY,
        { tag, first: 6 },
      ),
    enabled: !!tag,
    staleTime: StaleTime.OneHour,
  });

  const sources = topSources?.sourcesByTag?.edges?.map((edge) => edge.node);
  if (!sources || sources.length === 0) {
    return null;
  }

  return (
    <RelatedEntities
      isLoading={isPending}
      items={sources.map((source) => ({
        id: source.id,
        image: source.image,
        imageAlt: `${source.name} logo`,
        name: source.name,
        permalink: source.permalink,
      }))}
      title="🔔 Top sources covering it"
      className="mx-4"
    />
  );
};

const WhoToFollow = ({
  tag,
  initialUsers = [],
}: {
  tag: string;
  initialUsers?: UserShortProfile[];
}): ReactElement | null => {
  const { data: topContributors, isPending } = useQuery({
    queryKey: [RequestKey.TopCreatorsByTag, null, tag],
    queryFn: async () =>
      gqlClient.request<{ topCreatorsByTag: UserShortProfile[] }>(
        TOP_CREATORS_BY_TAG_QUERY,
        { tag, limit: 6 },
      ),
    enabled: !!tag,
    staleTime: StaleTime.OneHour,
  });

  const users = topContributors?.topCreatorsByTag ?? initialUsers;
  const isLoading = isPending && initialUsers.length === 0;

  if (!isLoading && (!users || users.length === 0)) {
    return null;
  }

  return (
    <section className="mx-4 mb-10 flex flex-col gap-3">
      <Typography
        tag={TypographyTag.H2}
        type={TypographyType.Title3}
        color={TypographyColor.Primary}
        bold
      >
        Who to follow
      </Typography>
      <div className="no-scrollbar flex gap-4 overflow-x-auto">
        {isLoading
          ? Array.from({ length: 3 }).map((_, index) => (
              <ElementPlaceholder
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                className="h-40 w-80 shrink-0 rounded-16"
              />
            ))
          : users.map((user) => (
              <UserEntityCard
                key={user.id}
                user={user}
                className={{ container: 'shrink-0' }}
              />
            ))}
      </div>
    </section>
  );
};

export const ExploreTopicPage = ({
  tag,
  initialData,
  topPosts,
  recommendedTags,
  topContributors,
  jsonLd,
}: ExploreTopicPageProps): ReactElement => {
  const { push } = useRouter();
  const showRoadmap = useFeature(feature.showRoadmap);
  const { user, showLogin } = useContext(AuthContext);
  const { feedSettings } = useFeedSettings();
  const { FeedPageLayoutComponent } = useFeedLayout();
  const { onFollowTags, onUnfollowTags, onBlockTags, onUnblockTags } =
    useTagAndSource({ origin: Origin.TagPage });
  const { follow, unfollow } = useContentPreference({
    showToastOnSuccess: false,
  });

  const title = initialData?.flags?.title || formatKeyword(tag);
  const followers = initialData?.followers;
  const occurrences = initialData?.occurrences ?? 0;

  const topPostsQueryVariables = useMemo(
    () => ({ tag, ranking: 'POPULARITY', supportedTypes: SUPPORTED_TYPES }),
    [tag],
  );
  const mostUpvotedQueryVariables = useMemo(
    () => ({ tag, supportedTypes: SUPPORTED_TYPES, period: 365 }),
    [tag],
  );
  const bestDiscussedQueryVariables = useMemo(
    () => ({ tag, period: 365, supportedTypes: SUPPORTED_TYPES }),
    [tag],
  );
  const mainFeedQueryVariables = useMemo(
    () => ({ tag, ranking: 'TIME', supportedTypes: SUPPORTED_TYPES }),
    [tag],
  );

  const tagStatus = useMemo(() => {
    if (!feedSettings) {
      return 'unfollowed';
    }
    if ((feedSettings.blockedTags ?? []).includes(tag)) {
      return 'blocked';
    }
    if ((feedSettings.includeTags ?? []).includes(tag)) {
      return 'followed';
    }
    return 'unfollowed';
  }, [feedSettings, tag]);

  const followButtonProps: ButtonProps<'button'> = {
    size: ButtonSize.Small,
    icon: tagStatus === 'followed' ? <XIcon /> : <PlusIcon />,
    onClick: async (): Promise<void> => {
      if (!user) {
        showLogin({ trigger: AuthTriggers.Filter });
        return;
      }
      if (tagStatus === 'followed') {
        await onUnfollowTags({ tags: [tag] });
      } else {
        await onFollowTags({ tags: [tag] });
      }
    },
  };

  const blockButtonProps: ButtonProps<'button'> = {
    size: ButtonSize.Small,
    icon: tagStatus === 'blocked' ? <XIcon /> : <BlockIcon />,
    onClick: async (): Promise<void> => {
      if (!user) {
        showLogin({ trigger: AuthTriggers.Filter });
        return;
      }
      if (tagStatus === 'blocked') {
        await onUnblockTags({ tags: [tag] });
      } else {
        await onBlockTags({ tags: [tag] });
      }
    },
  };

  const statParts: ReactNode[] = [];
  if (typeof followers === 'number') {
    statParts.push(
      <span key="followers">{largeNumberFormat(followers)} followers</span>,
    );
  }
  statParts.push(
    <span key="stories">{largeNumberFormat(occurrences)} stories</span>,
  );

  return (
    <FeedPageLayoutComponent>
      {jsonLd && (
        <Head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: jsonLd }}
          />
        </Head>
      )}
      <div className="mx-auto flex w-full max-w-screen-laptop flex-col px-4 py-6">
        <RelatedTagsBar tag={tag} tags={recommendedTags} />

        {/* Identity header — centered, editorial. */}
        <header className="mx-auto flex w-full max-w-screen-tablet flex-col items-center gap-4 py-8 text-center">
          <SponsoredTagHero tag={tag} />
          <Typography
            tag={TypographyTag.H1}
            type={TypographyType.LargeTitle}
            color={TypographyColor.Primary}
            bold
            center
          >
            {title}
          </Typography>
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
            className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1"
          >
            <span>Topic</span>
            {statParts.map((part) => (
              <React.Fragment key={(part as ReactElement).key}>
                <span aria-hidden>·</span>
                {part}
              </React.Fragment>
            ))}
          </Typography>
          {initialData?.flags?.description && (
            <Typography
              type={TypographyType.Body}
              color={TypographyColor.Secondary}
              center
              className="max-w-[34rem]"
            >
              {initialData.flags.description}
            </Typography>
          )}
          <div className="mt-1 flex flex-row items-center justify-center gap-3">
            {tagStatus !== 'blocked' && (
              <Button
                variant={ButtonVariant.Primary}
                {...followButtonProps}
                aria-label={tagStatus === 'followed' ? 'Unfollow' : 'Follow'}
              >
                {tagStatus === 'followed' ? 'Following' : 'Follow'}
              </Button>
            )}
            {tagStatus !== 'followed' && (
              <Button
                variant={ButtonVariant.Float}
                {...blockButtonProps}
                aria-label={tagStatus === 'blocked' ? 'Unblock' : 'Block'}
              >
                {tagStatus === 'blocked' ? 'Unblock' : 'Block'}
              </Button>
            )}
            <CustomFeedOptionsMenu
              onCreateNewFeed={() =>
                push(
                  `${webappUrl}feeds/new?entityId=${tag}&entityType=${ContentPreferenceType.Keyword}`,
                )
              }
              onAdd={(feedId) =>
                follow({
                  id: tag,
                  entity: ContentPreferenceType.Keyword,
                  entityName: tag,
                  feedId,
                })
              }
              onUndo={(feedId) =>
                unfollow({
                  id: tag,
                  entity: ContentPreferenceType.Keyword,
                  entityName: tag,
                  feedId,
                })
              }
              shareProps={{
                text: `Check out the ${tag} tag on daily.dev`,
                link: globalThis?.location?.href,
                cid: ReferralCampaignKey.ShareTag,
                logObject: () => ({
                  event_name: LogEvent.ShareTag,
                  target_id: tag,
                }),
              }}
            />
          </div>
          {showRoadmap && initialData?.flags?.roadmap && (
            <Link href={initialData.flags.roadmap} passHref prefetch={false}>
              <a
                target="_blank"
                rel={anchorDefaultRel}
                className="mt-2 flex w-full max-w-sm cursor-pointer items-center rounded-12 border border-border-subtlest-tertiary p-4"
              >
                <img
                  src={cloudinarySourceRoadmap}
                  alt="roadmap.sh logo"
                  className="size-10 rounded-full"
                />
                <div className="mx-3 flex-1 text-left">
                  <p className="font-bold typo-callout">
                    Comprehensive roadmap for {title}
                  </p>
                  <p className="text-text-tertiary typo-footnote">
                    By roadmap.sh
                  </p>
                </div>
                <Button
                  icon={<OpenLinkIcon />}
                  size={ButtonSize.Small}
                  variant={ButtonVariant.Tertiary}
                />
              </a>
            </Link>
          )}
          {/* SEO crawl paths preserved from the legacy tag page. */}
          {topPosts.length > 0 && (
            <div className="sr-only">
              {topPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`${webappUrl}posts/${post.slug || post.id}`}
                  prefetch={false}
                >
                  <a>{post.title}</a>
                </Link>
              ))}
            </div>
          )}
          {topContributors.length > 0 && (
            <div className="sr-only">
              {topContributors.map((contributor) => (
                <Link
                  key={contributor.id}
                  href={contributor.permalink}
                  prefetch={false}
                >
                  <a>Posts by {contributor.name}</a>
                </Link>
              ))}
            </div>
          )}
        </header>

        <div className="mb-2 h-px w-full bg-border-subtlest-tertiary" />

        {/* Recommended stories */}
        <SectionHeading>Recommended stories</SectionHeading>
        <ActiveFeedNameContext.Provider
          value={{ feedName: OtherFeedPage.TagsTopPosts }}
        >
          <HorizontalFeed
            feedName={OtherFeedPage.TagsTopPosts}
            feedQueryKey={[
              'tagsTopPosts',
              user?.id ?? 'anonymous',
              Object.values(topPostsQueryVariables),
            ]}
            query={TAG_FEED_QUERY}
            variables={topPostsQueryVariables}
            title={{ copy: 'Top posts' }}
            className="!mx-0"
            emptyScreen={<></>}
          />
        </ActiveFeedNameContext.Provider>

        <WhoToFollow tag={tag} initialUsers={topContributors} />
        <TagTopSources tag={tag} />

        <ActiveFeedNameContext.Provider
          value={{ feedName: OtherFeedPage.TagsMostUpvoted }}
        >
          <HorizontalFeed
            feedName={OtherFeedPage.TagsMostUpvoted}
            feedQueryKey={[
              'tagsMostUpvoted',
              user?.id ?? 'anonymous',
              Object.values(mostUpvotedQueryVariables),
            ]}
            query={MOST_UPVOTED_FEED_QUERY}
            variables={mostUpvotedQueryVariables}
            title={{
              copy: 'Most upvoted posts',
              icon: <UpvoteIcon size={IconSize.Medium} className="mr-1.5" />,
            }}
            className="!mx-0"
            emptyScreen={<></>}
          />
        </ActiveFeedNameContext.Provider>
        <ActiveFeedNameContext.Provider
          value={{ feedName: OtherFeedPage.TagsBestDiscussed }}
        >
          <HorizontalFeed
            feedName={OtherFeedPage.TagsBestDiscussed}
            feedQueryKey={[
              'tagsBestDiscussed',
              user?.id ?? 'anonymous',
              Object.values(bestDiscussedQueryVariables),
            ]}
            query={MOST_DISCUSSED_FEED_QUERY}
            variables={bestDiscussedQueryVariables}
            title={{
              copy: 'Best discussed posts',
              icon: <DiscussIcon size={IconSize.Medium} className="mr-1.5" />,
            }}
            className="!mx-0"
            emptyScreen={<></>}
          />
        </ActiveFeedNameContext.Provider>
        <ArchiveEntryCard
          scopeType={ArchiveScopeType.Tag}
          scopeId={tag}
          scopeName={title}
          className="mb-6"
        />

        <div className="my-2 h-px w-full bg-border-subtlest-tertiary" />

        <SectionHeading>All posts about {title}</SectionHeading>
        <Feed
          feedName={OtherFeedPage.Tag}
          feedQueryKey={['tagFeed', user?.id ?? 'anonymous', tag]}
          query={TAG_FEED_QUERY}
          variables={mainFeedQueryVariables}
          className="!mx-0 !w-auto"
        />
      </div>
    </FeedPageLayoutComponent>
  );
};
