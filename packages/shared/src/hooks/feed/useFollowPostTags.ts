import { useCallback, useMemo } from 'react';
import type { Post } from '../../graphql/posts';
import useFeedSettings from '../useFeedSettings';
import { featurePostTagSorting } from '../../lib/featureManagement';
import { useConditionalFeature } from '../useConditionalFeature';
import useTagAndSource from '../useTagAndSource';
import { Origin } from '../../lib/log';
import { useAuthContext } from '../../contexts/AuthContext';
import { useCustomFeed } from './useCustomFeed';

interface UseFollowPostTagsProps {
  post: Post;
  shouldEvaluateExperiment?: boolean;
}

interface UseFollowPostTags {
  isTagExperiment: boolean;
  onFollowTag: (tag: string) => void;
  tags: Record<'all' | 'followed' | 'notFollowed', string[]>;
}

export const useFollowPostTags = ({
  post,
  shouldEvaluateExperiment = false,
}: UseFollowPostTagsProps): UseFollowPostTags => {
  const { isLoggedIn } = useAuthContext();
  const { feedId, isCustomFeed } = useCustomFeed();
  const { feedSettings } = useFeedSettings({
    feedId: isCustomFeed ? feedId : undefined,
  });
  const isModerationItem = !post.permalink;
  const hasFollowedTags = !!feedSettings?.includeTags?.length;
  const shouldEvaluate =
    shouldEvaluateExperiment && !isModerationItem && hasFollowedTags;

  const { value: isTagExperiment, isLoading } = useConditionalFeature({
    feature: featurePostTagSorting,
    shouldEvaluate,
  });

  const tags = useMemo(() => {
    if (!isLoggedIn || isModerationItem) {
      return {
        all: post?.tags,
        followed: [],
        notFollowed: post?.tags,
      };
    }

    const all = isLoading && shouldEvaluate ? [] : post.tags ?? [];
    const followedTags = new Set(feedSettings?.includeTags || []);
    return all.reduce(
      (acc, tag) => {
        const isFollowing = followedTags.has(tag);
        const group = isFollowing ? 'followed' : 'notFollowed';
        acc[group].push(tag);
        return acc;
      },
      {
        all,
        followed: [],
        notFollowed: [],
      },
    );
  }, [
    feedSettings?.includeTags,
    isLoading,
    isLoggedIn,
    isModerationItem,
    post.tags,
    shouldEvaluate,
  ]);

  const { onFollowTags } = useTagAndSource({
    origin: Origin.PostTags,
    postId: post.id,
  });

  const onFollowTag = useCallback(
    (tag: string) =>
      onFollowTags({
        tags: [tag],
        requireLogin: true,
      }),
    [onFollowTags],
  );

  return {
    isTagExperiment,
    onFollowTag,
    tags,
  };
};
