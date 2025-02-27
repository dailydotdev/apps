import { useCallback, useMemo } from 'react';
import type { Post } from '../../graphql/posts';
import useFeedSettings from '../useFeedSettings';
import { featurePostTagSorting } from '../../lib/featureManagement';
import { useConditionalFeature } from '../useConditionalFeature';
import { useAuthContext } from '../../contexts/AuthContext';
import useTagAndSource from '../useTagAndSource';
import { Origin } from '../../lib/log';

interface UseFollowPostTagsProps {
  post: Post;
}

interface UseFollowPostTags {
  isTagExperiment: boolean;
  onFollowTag: (tag: string) => void;
  tags: Record<'all' | 'followed' | 'notFollowed', string[]>;
}

export const useFollowPostTags = ({
  post,
}: UseFollowPostTagsProps): UseFollowPostTags => {
  const { isLoggedIn } = useAuthContext();
  const { feedSettings } = useFeedSettings();
  const isNotModerationItem = !!post.permalink;
  const hasFollowedTags = !!feedSettings?.includeTags?.length;

  const { value: isTagExperiment } = useConditionalFeature({
    feature: featurePostTagSorting,
    shouldEvaluate: isLoggedIn && isNotModerationItem && hasFollowedTags,
  });

  const tags = useMemo(() => {
    const all = post.tags ?? [];
    const followed = feedSettings?.includeTags || [];
    return all.reduce(
      (acc, tag) => {
        const isFollowing = followed.includes(tag);
        const key = isFollowing ? 'followed' : 'notFollowed';
        acc[key].push(tag);
        return acc;
      },
      {
        all,
        followed: [],
        notFollowed: [],
      },
    );
  }, [post.tags, feedSettings?.includeTags]);

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
