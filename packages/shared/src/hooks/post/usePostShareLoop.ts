import { useState } from 'react';
import { useActiveFeedNameContext } from '../../contexts';
import { useFeatureIsOn } from '../../components/GrowthBookProvider';
import { feature } from '../../lib/featureManagement';
import { useMutationSubscription } from '../mutationSubscription';
import { upvoteMutationKey, UseVotePostMutationProps } from '../vote';
import { Post } from '../../graphql/posts';

interface UsePostShareLoop {
  shouldShowOverlay: boolean;
  onInteract: () => void;
}

export const usePostShareLoop = (post: Post): UsePostShareLoop => {
  const { feedName } = useActiveFeedNameContext();
  const [justUpvoted, setJustUpvoted] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const shareLoopsEnabled = useFeature(feature.shareLoops);
  const shouldShowOverlay = justUpvoted && !hasInteracted && shareLoopsEnabled;

  useMutationSubscription({
    matcher: ({ status, mutation }) => {
      const key = [...upvoteMutationKey, { feedName }];

      return (
        status === 'success' &&
        mutation?.options?.mutationKey?.toString() === key.toString()
      );
    },
    callback: ({ variables }) => {
      const vars = variables as UseVotePostMutationProps;

      if (vars.id !== post.id || !shareLoopsEnabled) {
        return;
      }

      setJustUpvoted(!!vars.vote);
    },
  });

  return { shouldShowOverlay, onInteract: () => setHasInteracted(true) };
};
