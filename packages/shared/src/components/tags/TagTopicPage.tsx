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
import type { SourceTooltip } from '../../graphql/sources';
import { SOURCES_BY_TAG_QUERY } from '../../graphql/sources';
import type { Connection } from '../../graphql/common';
import { gqlClient } from '../../graphql/common';
import { ActiveFeedNameContext } from '../../contexts';
import FeedContext from '../../contexts/FeedContext';
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
import UserEntityCard from '../cards/entity/UserEntityCard';
import SourceEntityCard from '../cards/entity/SourceEntityCard';
import EntityCardSkeleton from '../cards/entity/EntityCardSkeleton';
import { TagPageNavbar } from './TagPageNavbar';
import { PublicPageSignupBanner } from '../auth/PublicPageSignupBanner';
import { largeNumberFormat } from '../../lib/numberFormat';
import { webappUrl } from '../../lib/constants';
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

export interface TagTopicPageProps {
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

// Wraps a horizontal post rail with a right-edge gradient so the last card
// blends into the background instead of being hard-cut by the scroll overflow.
const RailWithFade = ({ children }: { children: ReactNode }): ReactElement => (
  <div className="relative mb-10">
    {children}
    <div
      aria-hidden
      className="pointer-events-none absolute bottom-0 right-0 top-11 w-12 bg-gradient-to-r from-transparent to-background-default"
    />
  </div>
);

// Render the user/source cards in the same grid the post feed uses (same
// column count + card width) so every card on the page lines up identically.
const ENTITY_CARD_CLASS = { container: '!w-full !max-w-[21.5rem] h-full' };

const EntityFeedGrid = ({
  children,
}: {
  children: ReactNode;
}): ReactElement => {
  const { numCards } = useContext(FeedContext);
  const columns = numCards?.eco ?? 1;

  return (
    <div
      className="grid gap-8"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {children}
    </div>
  );
};

const EntityGridSkeleton = (): ReactElement => (
  <EntityFeedGrid>
    {Array.from({ length: 3 }).map((_, index) => (
      <EntityCardSkeleton
        // eslint-disable-next-line react/no-array-index-key
        key={index}
        className={ENTITY_CARD_CLASS}
      />
    ))}
  </EntityFeedGrid>
);

const TagTopSources = ({ tag }: { tag: string }): ReactElement | null => {
  const { data: topSources, isPending } = useQuery({
    queryKey: [RequestKey.SourceByTag, null, tag],
    queryFn: async () =>
      gqlClient.request<{ sourcesByTag: Connection<SourceTooltip> }>(
        SOURCES_BY_TAG_QUERY,
        { tag, first: 6 },
      ),
    enabled: !!tag,
    staleTime: StaleTime.OneHour,
  });

  const sources =
    topSources?.sourcesByTag?.edges?.map((edge) => edge.node) ?? [];
  if (!isPending && sources.length === 0) {
    return null;
  }

  return (
    <section className="mb-10">
      <SectionHeading>Top sources covering it</SectionHeading>
      {isPending ? (
        <EntityGridSkeleton />
      ) : (
        <EntityFeedGrid>
          {sources.map((source) => (
            <SourceEntityCard
              key={source.id}
              source={source}
              className={ENTITY_CARD_CLASS}
            />
          ))}
        </EntityFeedGrid>
      )}
    </section>
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
    <section className="mb-10">
      <SectionHeading>Who to follow</SectionHeading>
      {isLoading ? (
        <EntityGridSkeleton />
      ) : (
        <EntityFeedGrid>
          {users.map((user) => (
            <UserEntityCard
              key={user.id}
              user={user}
              className={ENTITY_CARD_CLASS}
            />
          ))}
        </EntityFeedGrid>
      )}
    </section>
  );
};

export const TagTopicPage = ({
  tag,
  initialData,
  topPosts,
  recommendedTags,
  topContributors,
  jsonLd,
}: TagTopicPageProps): ReactElement => {
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
    <>
      {jsonLd && (
        <Head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: jsonLd }}
          />
        </Head>
      )}
      {/* Full-bleed header strip — rendered outside the padded feed container
          so it spans flush to the edges like the main feed nav. */}
      <TagPageNavbar
        activeTag={tag}
        recommendedTags={recommendedTags
          .map((relatedTag) => relatedTag.name)
          .filter((name): name is string => !!name)}
      />
      <FeedPageLayoutComponent>
        <div className="flex w-full flex-col px-4 py-6 tablet:px-6">
          {/* Hero cover — centered on the page; content below spans full width. */}
          <header className="mx-auto flex w-full max-w-[48rem] flex-col items-center gap-4 py-8 text-center">
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
              <span>Tag</span>
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
                className="max-w-[44rem]"
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

          {showRoadmap && initialData?.flags?.roadmap && (
            <section className="mb-10">
              <SectionHeading>Roadmaps</SectionHeading>
              <Link href={initialData.flags.roadmap} passHref prefetch={false}>
                <a
                  target="_blank"
                  rel={anchorDefaultRel}
                  className="flex w-full max-w-sm cursor-pointer items-center rounded-12 border border-border-subtlest-tertiary p-4"
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
            </section>
          )}

          {/* Recommended stories */}
          <ActiveFeedNameContext.Provider
            value={{ feedName: OtherFeedPage.TagsTopPosts }}
          >
            <RailWithFade>
              <HorizontalFeed
                feedName={OtherFeedPage.TagsTopPosts}
                feedQueryKey={[
                  'tagsTopPosts',
                  user?.id ?? 'anonymous',
                  Object.values(topPostsQueryVariables),
                ]}
                query={TAG_FEED_QUERY}
                variables={topPostsQueryVariables}
                title={{ copy: 'Recommended stories' }}
                className="!mx-0 !mb-0"
                emptyScreen={<></>}
              />
            </RailWithFade>
          </ActiveFeedNameContext.Provider>

          <WhoToFollow tag={tag} initialUsers={topContributors} />
          <TagTopSources tag={tag} />

          <ActiveFeedNameContext.Provider
            value={{ feedName: OtherFeedPage.TagsMostUpvoted }}
          >
            <RailWithFade>
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
                  icon: (
                    <UpvoteIcon size={IconSize.Medium} className="mr-1.5" />
                  ),
                }}
                className="!mx-0 !mb-0"
                emptyScreen={<></>}
              />
            </RailWithFade>
          </ActiveFeedNameContext.Provider>
          <ActiveFeedNameContext.Provider
            value={{ feedName: OtherFeedPage.TagsBestDiscussed }}
          >
            <RailWithFade>
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
                  icon: (
                    <DiscussIcon size={IconSize.Medium} className="mr-1.5" />
                  ),
                }}
                className="!mx-0 !mb-0"
                emptyScreen={<></>}
              />
            </RailWithFade>
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
        <PublicPageSignupBanner />
      </FeedPageLayoutComponent>
    </>
  );
};
