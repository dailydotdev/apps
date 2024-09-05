import React, { ReactNode, useMemo } from 'react';

import { ButtonSize, ButtonVariant } from '../../components/buttons/common';
import { CardCoverContainer } from '../../components/cards/common/CardCoverContainer';
import { CardCoverShare } from '../../components/cards/common/CardCoverShare';
import { PostReminderOptions } from '../../components/post/common/PostReminderOptions';
import { Post } from '../../graphql/posts';
import { useBookmarkReminderCover } from '../bookmark/useBookmarkReminderCover';
import { usePostShareLoop } from '../post/usePostShareLoop';

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
  const { shouldShowOverlay, onInteract } = usePostShareLoop(post);
  const shouldShowReminder = useBookmarkReminderCover(post);

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
  ]);

  return { overlay };
};
