import React, { ReactNode, useMemo } from 'react';
import { Post } from '../../graphql/posts';
import { usePostShareLoop } from '../post/usePostShareLoop';
import { CardCoverShare } from '../../components/cards/common/CardCoverShare';
import { CardCoverContainer } from '../../components/cards/common/CardCoverContainer';
import { PostReminderOptions } from '../../components/post/common/PostReminderOptions';
import { ButtonSize, ButtonVariant } from '../../components/buttons/common';

interface UseCardCover {
  overlay: ReactNode;
}

interface UseCardCoverProps {
  post: Post;
  onShare?: (post: Post) => void;
  className?: {
    bookmark?: {
      container?: string;
    };
  };
}

export const useCardCover = ({
  post,
  onShare,
  className = {},
}: UseCardCoverProps): UseCardCover => {
  const {
    shouldShowOverlay,
    onInteract,
    currentInteraction,
    shouldShowReminder,
  } = usePostShareLoop(post);

  const overlay = useMemo(() => {
    if (shouldShowOverlay && onShare && currentInteraction === 'upvote') {
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

    if (shouldShowReminder && currentInteraction === 'bookmark') {
      return (
        <CardCoverContainer
          title="Don’t have time now? Set a reminder"
          className={className?.bookmark?.container}
        >
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
  }, [
    className?.bookmark?.container,
    onInteract,
    onShare,
    post,
    shouldShowOverlay,
    shouldShowReminder,
    currentInteraction,
  ]);

  return { overlay };
};
