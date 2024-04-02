import { useMemo, useState } from 'react';
import { useActiveFeedNameContext } from '../../contexts';
import { useFeature } from '../../components/GrowthBookProvider';
import { feature } from '../../lib/featureManagement';
import { useMutationSubscription } from '../mutationSubscription';
import { upvoteMutationKey, UseVoteMutationProps } from '../vote';
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
  const key = useMemo(
    () => [...upvoteMutationKey, { feedName }].toString(),
    [feedName],
  );

  useMutationSubscription({
    matcher: ({ status, mutation }) =>
      status === 'success' &&
      mutation?.options?.mutationKey?.toString() === key,
    callback: ({ variables }) => {
      const vars = variables as UseVoteMutationProps;

      if (vars.id !== post?.id || !shareLoopsEnabled) {
        return;
      }

      setJustUpvoted(!!vars.vote);
    },
  });

  return { shouldShowOverlay, onInteract: () => setHasInteracted(true) };
};
