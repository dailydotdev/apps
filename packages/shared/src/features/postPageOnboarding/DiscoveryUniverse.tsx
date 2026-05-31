import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import { useQuery } from '@tanstack/react-query';
import type { Post } from '../../graphql/posts';
import { gqlClient } from '../../graphql/common';
import { FEED_BY_TAGS_QUERY, type FeedData } from '../../graphql/feed';
import { capitalize } from '../../lib/strings';
import { HotIcon, StarIcon, TrendingIcon } from '../../components/icons';
import { IconSize } from '../../components/Icon';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../components/typography/Typography';
import { onboardingGradientClasses } from '../../components/onboarding/common';
import { authGradientBg } from '../../components/marketing/banners/common';
import { useAnonPostOnboarding } from './useAnonPostOnboarding';
import { useAnonFeedTags } from './useAnonFeedTags';
import { useBuildFeedSignup } from './useBuildFeedSignup';
import { BuildFeedAuthOptions } from './BuildFeedAuthOptions';
import { DiscoveryRow } from './DiscoveryRow';
import { SocialProofBand } from './SocialProofBand';
import { FeedConversionBanner } from './FeedConversionBanner';
import { mockDiscussions, mockTools, mockTrending } from './mockFeed';

interface DiscoveryUniverseProps {
  post: Post;
}

const REAL_ROW_SIZE = 10;

/**
 * The anonymous post page's discovery experience — the doorway to "a whole
 * world built for you". Below the article it opens into an immersive band:
 * a hero invite, Netflix-style content rows (trending, discussions), a locked
 * row that teases the volume behind signup, social proof, and a final CTA.
 */
export const DiscoveryUniverse = ({
  post,
}: DiscoveryUniverseProps): ReactElement | null => {
  const { isEnabled } = useAnonPostOnboarding();
  const { previewTags, selectedTags } = useAnonFeedTags({
    postTags: post?.tags ?? [],
    enabled: isEnabled,
  });
  const { triggerSignup } = useBuildFeedSignup();

  const { data } = useQuery({
    queryKey: ['discoveryUniverse', post?.id, previewTags],
    queryFn: () =>
      gqlClient.request<FeedData>(FEED_BY_TAGS_QUERY, {
        tags: previewTags,
        first: REAL_ROW_SIZE,
      }),
    enabled: isEnabled && previewTags.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  const realPosts = useMemo(() => {
    const nodes = data?.page?.edges?.map((edge) => edge.node) ?? [];
    return nodes.filter((item) => item.id !== post?.id);
  }, [data, post?.id]);

  if (!isEnabled) {
    return null;
  }

  const topic = previewTags[0] ? capitalize(previewTags[0]) : 'your stack';
  const trendingRow = realPosts.length >= 4 ? realPosts : mockTrending;

  return (
    <section className="mt-10 flex flex-col gap-10">
      <div
        className={classNames(
          authGradientBg,
          'relative overflow-hidden rounded-16 border border-accent-cabbage-default p-6 shadow-2 tablet:p-8',
        )}
      >
        <Typography
          bold
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
          className="uppercase tracking-wider"
        >
          You just read one post
        </Typography>
        <Typography
          bold
          tag={TypographyTag.H2}
          type={TypographyType.LargeTitle}
          className={classNames(onboardingGradientClasses, 'mt-1')}
        >
          Your dev world is waiting
        </Typography>
        <Typography
          type={TypographyType.Body}
          color={TypographyColor.Secondary}
          className="mt-2 max-w-xl"
        >
          One feed with the best of {topic} and your whole stack — news, tools,
          and the discussions that matter, curated daily and built around you.
          Free, forever.
        </Typography>
        <div className="mt-5 max-w-md">
          <BuildFeedAuthOptions tags={selectedTags} origin="feed" />
        </div>
      </div>

      <DiscoveryRow
        title={`Trending in ${topic}`}
        subtitle="What developers are reading right now"
        icon={
          <TrendingIcon
            size={IconSize.Medium}
            className="text-accent-cabbage-default"
          />
        }
        posts={trendingRow}
      />

      <DiscoveryRow
        title="Hottest discussions"
        subtitle="Where the dev community is talking"
        icon={
          <HotIcon
            size={IconSize.Medium}
            className="text-accent-ketchup-default"
          />
        }
        posts={mockDiscussions}
      />

      <DiscoveryRow
        title="Tools developers swear by"
        subtitle="And hundreds more in your feed"
        icon={
          <StarIcon
            size={IconSize.Medium}
            className="text-accent-cheese-default"
          />
        }
        posts={mockTools}
        locked
        onUnlock={() => triggerSignup(selectedTags, 'feed')}
      />

      <SocialProofBand />

      <FeedConversionBanner tags={selectedTags} />
    </section>
  );
};
