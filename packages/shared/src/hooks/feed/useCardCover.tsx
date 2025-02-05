import type { ReactNode } from 'react';
import React, { useMemo } from 'react';
import type { Post } from '../../graphql/posts';
import { usePostShareLoop } from '../post/usePostShareLoop';
import { CardCoverShare } from '../../components/cards/common/CardCoverShare';
import { CardCoverContainer } from '../../components/cards/common/CardCoverContainer';
import { PostReminderOptions } from '../../components/post/common/PostReminderOptions';
import { ButtonSize, ButtonVariant } from '../../components/buttons/common';
import { socials } from '../../lib/socialMedia';
import SocialIconButton from '../../components/cards/socials/SocialIconButton';

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
    if (currentInteraction === 'copy') {
      return (
        <CardCoverContainer title="Why not share it on social, too?">
          <div className="mt-2 flex flex-row gap-2">
            {socials.map((social) => (
              <SocialIconButton key={social} post={post} platform={social} />
            ))}
          </div>
        </CardCoverContainer>
      );
    }
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
