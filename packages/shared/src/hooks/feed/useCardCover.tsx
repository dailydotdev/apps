import React, { ReactNode, useEffect, useMemo, useState } from 'react';
import { Post } from '../../graphql/posts';
import { usePostShareLoop } from '../post/usePostShareLoop';
import { CardCoverShare } from '../../components/cards/common/CardCoverShare';
import { CardCoverContainer } from '../../components/cards/common/CardCoverContainer';
import { PostReminderOptions } from '../../components/post/common/PostReminderOptions';
import { ButtonSize, ButtonVariant } from '../../components/buttons/common';
import { useBookmarkReminderCover } from '../bookmark/useBookmarkReminderCover';

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
  const [lastInteraction, setLastInteraction] = useState<'upvote' | 'bookmark' | null>(null);
  useEffect(() => {
    if (shouldShowOverlay) {
      setLastInteraction('upvote');
    }
  }, [shouldShowOverlay]);

  useEffect(() => {
    if (shouldShowReminder) {
      setLastInteraction('bookmark');
    }
  }, [shouldShowReminder]);

  const overlay = useMemo(() => {
    if (shouldShowOverlay && onShare && lastInteraction == 'upvote') {
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

    if (shouldShowReminder && lastInteraction == 'bookmark') {
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

     // Default case keeping same as original
     if (shouldShowReminder) {
      return (
        <CardCoverContainer
          title="Don't have time now? Set a reminder"
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

    if (shouldShowOverlay && onShare) {
      return (
        <CardCoverShare
          post={post}
          onCopy={() => {
            onInteract();
            setLastInteraction(null);
          }}
          onShare={() => {
            onInteract();
            onShare(post);
            setLastInteraction(null);
          }}
        />
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
    lastInteraction
  ]);

  return { overlay };
};
