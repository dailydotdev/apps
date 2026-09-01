import type { ReactElement, ReactNode } from 'react';
import React, { useContext, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
import {
  generateQueryKey,
  OtherFeedPage,
  RequestKey,
  StaleTime,
} from '../../lib/query';
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
import { useContentPreferenceStatusQuery } from '../../hooks/contentPreference/useContentPreferenceStatusQuery';
import {
  ContentPreferenceStatus,
  ContentPreferenceType,
} from '../../graphql/contentPreference';
import SourceActionsNotify from '../sources/SourceActions/SourceActionsNotify';
import { TOP_CREATORS_BY_TAG_QUERY } from '../../graphql/users';
import type { UserShortProfile } from '../../lib/user';
import { SponsoredTagHero } from '../brand/SponsoredTagHero';
import { EngagementFeedStrip } from '../brand/EngagementFeedStrip';
import { useEngagementAdsContext } from '../../contexts/EngagementAdsContext';
import { EngagementPlacement } from '../../lib/engagementAds';
import UserEntityCard from '../cards/entity/UserEntityCard';
import SourceEntityCard from '../cards/entity/SourceEntityCard';
import EntityCardSkeleton from '../cards/entity/EntityCardSkeleton';
import { EntitySectionHeading } from '../entity/EntitySectionHeading';
import { EntityRailWithFade } from '../entity/EntityRailWithFade';
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

const TagTopSources = ({
  tag,
  title,
}: {
  tag: string;
  title: string;
}): ReactElement | null => {
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
      <EntitySectionHeading>Top sources covering {title}</EntitySectionHeading>
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
  title,
  initialUsers = [],
}: {
  tag: string;
  title: string;
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
      <EntitySectionHeading>Who to follow for {title}</EntitySectionHeading>
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
  const queryClient = useQueryClient();
  const showRoadmap = useFeature(feature.showRoadmap);
  const { user, showLogin } = useContext(AuthContext);
  const { feedSettings } = useFeedSettings();
  const { FeedPageLayoutComponent } = useFeedLayout();
  const { getCreativeForPlacement } = useEngagementAdsContext();
  // A campaign that opted into the feed-strip placement takes over the tag
  // page's engagement slot: render the strip (below the header) instead of the
  // SponsoredTagHero, so there's a single ad.
  const engagementStripCreative = getCreativeForPlacement(
    EngagementPlacement.FeedStrip,
  );
  const { onFollowTags, onUnfollowTags, onBlockTags, onUnblockTags } =
    useTagAndSource({ origin: Origin.TagPage });
  const { follow, unfollow, subscribe, unsubscribe } = useContentPreference({
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

  // Follow state for tags lives in feed settings (`includeTags`), which can't
  // tell "following" apart from "subscribed" — read the keyword's content
  // preference so the notify bell knows which state it's in. Only followed
  // tags render the bell, so don't spend a request on every other visitor.
  const tagPreferenceQueryKey = generateQueryKey(
    RequestKey.ContentPreference,
    user,
    { id: tag, entity: ContentPreferenceType.Keyword },
  );
  const { data: tagPreference } = useContentPreferenceStatusQuery({
    id: tag,
    entity: ContentPreferenceType.Keyword,
    queryOptions: { enabled: tagStatus === 'followed' },
  });

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
      // Following here goes through feed settings, which never touches the
      // keyword's content-preference status key. Drop the cached entry rather
      // than invalidating it: the query is disabled the moment the tag is
      // unfollowed, so an invalidated-but-present entry would just be replayed
      // on re-follow and render a stale `subscribed` bell.
      queryClient.removeQueries({ queryKey: tagPreferenceQueryKey });
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

  const isSubscribedToTag =
    tagPreference?.status === ContentPreferenceStatus.Subscribed;

  const { mutate: onNotifyClick, isPending: isNotifyPending } = useMutation({
    mutationFn: async (): Promise<void> => {
      const params = {
        id: tag,
        entity: ContentPreferenceType.Keyword,
        entityName: title,
        opts: { extra: { origin: Origin.TagPage } },
      };

      if (isSubscribedToTag) {
        await unsubscribe(params);
      } else {
        await subscribe(params);
      }
    },
  });

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
            {!engagementStripCreative && <SponsoredTagHero tag={tag} />}
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
              {tagStatus === 'followed' && (
                <SourceActionsNotify
                  haveNotificationsOn={isSubscribedToTag}
                  onClick={() => onNotifyClick()}
                  disabled={isNotifyPending}
                />
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

          {engagementStripCreative && (
            <EngagementFeedStrip
              creative={engagementStripCreative}
              className="mb-10 w-full"
            />
          )}

          {showRoadmap && initialData?.flags?.roadmap && (
            <section className="mb-10">
              <EntitySectionHeading>Roadmaps</EntitySectionHeading>
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

          <ActiveFeedNameContext.Provider
            value={{ feedName: OtherFeedPage.TagsTopPosts }}
          >
            <EntitySectionHeading>
              Recommended {title} stories
            </EntitySectionHeading>
            <EntityRailWithFade>
              <HorizontalFeed
                feedName={OtherFeedPage.TagsTopPosts}
                feedQueryKey={[
                  'tagsTopPosts',
                  user?.id ?? 'anonymous',
                  Object.values(topPostsQueryVariables),
                ]}
                query={TAG_FEED_QUERY}
                variables={topPostsQueryVariables}
                className="!mx-0 !mb-0"
                emptyScreen={<></>}
              />
            </EntityRailWithFade>
          </ActiveFeedNameContext.Provider>

          <WhoToFollow tag={tag} title={title} initialUsers={topContributors} />
          <TagTopSources tag={tag} title={title} />

          <ActiveFeedNameContext.Provider
            value={{ feedName: OtherFeedPage.TagsMostUpvoted }}
          >
            <EntitySectionHeading
              icon={<UpvoteIcon size={IconSize.Medium} className="shrink-0" />}
            >
              Most upvoted {title} posts
            </EntitySectionHeading>
            <EntityRailWithFade>
              <HorizontalFeed
                feedName={OtherFeedPage.TagsMostUpvoted}
                feedQueryKey={[
                  'tagsMostUpvoted',
                  user?.id ?? 'anonymous',
                  Object.values(mostUpvotedQueryVariables),
                ]}
                query={MOST_UPVOTED_FEED_QUERY}
                variables={mostUpvotedQueryVariables}
                className="!mx-0 !mb-0"
                emptyScreen={<></>}
              />
            </EntityRailWithFade>
          </ActiveFeedNameContext.Provider>
          <ActiveFeedNameContext.Provider
            value={{ feedName: OtherFeedPage.TagsBestDiscussed }}
          >
            <EntitySectionHeading
              icon={<DiscussIcon size={IconSize.Medium} className="shrink-0" />}
            >
              Best discussed {title} posts
            </EntitySectionHeading>
            <EntityRailWithFade>
              <HorizontalFeed
                feedName={OtherFeedPage.TagsBestDiscussed}
                feedQueryKey={[
                  'tagsBestDiscussed',
                  user?.id ?? 'anonymous',
                  Object.values(bestDiscussedQueryVariables),
                ]}
                query={MOST_DISCUSSED_FEED_QUERY}
                variables={bestDiscussedQueryVariables}
                className="!mx-0 !mb-0"
                emptyScreen={<></>}
              />
            </EntityRailWithFade>
          </ActiveFeedNameContext.Provider>
          <ArchiveEntryCard
            scopeType={ArchiveScopeType.Tag}
            scopeId={tag}
            scopeName={title}
            className="mb-6"
          />

          <div className="my-2 h-px w-full bg-border-subtlest-tertiary" />

          <EntitySectionHeading>All posts about {title}</EntitySectionHeading>
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
