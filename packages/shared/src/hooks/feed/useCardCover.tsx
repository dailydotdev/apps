import React, { ReactNode, useMemo } from 'react';
import { Post } from '../../graphql/posts';
import { usePostShareLoop } from '../post/usePostShareLoop';
import { CardCoverShare } from '../../components/cards/common/CardCoverShare';
import { CardCoverContainer } from '../../components/cards/common/CardCoverContainer';
import { PostReminderOptions } from '../../components/post/common/PostReminderOptions';
import { ButtonSize, ButtonVariant } from '../../components/buttons/common';
import { useJustBookmarked } from '../bookmark';

interface UseCardCover {
  overlay: ReactNode;
}

interface UseCardCoverProps {
  post: Post;
  onShare: (post: Post) => void;
}

export const useCardCover = ({
  post,
  onShare,
}: UseCardCoverProps): UseCardCover => {
  const { shouldShowOverlay, onInteract } = usePostShareLoop(post);
  const { justBookmarked: shouldShowReminder } = useJustBookmarked({
    bookmarked: post?.bookmarked,
  });

  const overlay = useMemo(() => {
    if (shouldShowOverlay && onShare) {
      return (
        <CardCoverShare
          post={post}
          onCopy={onInteract}
          onShare={() => {
            onInteract();
            onShare(post);
          }}
        />
      );
    }

    if (shouldShowReminder) {
      return (
        <CardCoverContainer title="Remind about this post later?">
          <PostReminderOptions
            post={post}
            className="mt-2"
            buttonProps={{
              variant: ButtonVariant.Secondary,
              size: ButtonSize.Small,
            }}
          />
        </CardCoverContainer>
      );
    }

    return undefined;
  }, [onInteract, onShare, post, shouldShowOverlay, shouldShowReminder]);

  return { overlay };
};
