import { useMemo } from 'react';
import type { Post } from '../../graphql/posts';
import useFeedSettings from '../useFeedSettings';
import { featurePostTagSorting } from '../../lib/featureManagement';
import { useConditionalFeature } from '../useConditionalFeature';
import { useAuthContext } from '../../contexts/AuthContext';

interface UseFollowPostTagsProps {
  post: Post;
}

interface UseFollowPostTags {
  isTagExperiment: boolean;
  onFollowTag: (tag: string) => void;
  tags: {
    all: string[];
    followed: string[];
    notFollowed: string[];
  };
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

  return {
    isTagExperiment,
    onFollowTag: () => undefined,
    tags,
  };
};
