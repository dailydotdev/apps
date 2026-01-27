import { useState, useCallback } from 'react';
import type { Post } from '../../graphql/posts';
import { useAuthContext } from '../../contexts/AuthContext';
import usePoll from '../usePoll';
import { useViewPost } from './useViewPost';

interface UsePollVoteProps {
  post: Post;
}

interface UsePollVoteReturn {
  handleVote: (optionId: string, text: string) => void;
  shouldAnimateResults: boolean;
  isCastingVote: boolean;
}

/**
 * Hook to handle poll voting logic.
 * Extracted from PollGrid/PollList to reduce duplication.
 */
export const usePollVote = ({ post }: UsePollVoteProps): UsePollVoteReturn => {
  const { user } = useAuthContext();
  const { onVote, isCastingVote } = usePoll({ post });
  const [shouldAnimateResults, setShouldAnimateResults] = useState(false);
  const onSendViewPost = useViewPost();

  const handleVote = useCallback(
    (optionId: string, text: string) => {
      if (!isCastingVote) {
        onVote(optionId, text);
        setShouldAnimateResults(true);

        if (!post?.id || !user?.id) {
          return;
        }
        onSendViewPost(post.id);
      }
    },
    [isCastingVote, onVote, post?.id, user?.id, onSendViewPost],
  );

  return {
    handleVote,
    shouldAnimateResults,
    isCastingVote,
  };
};
