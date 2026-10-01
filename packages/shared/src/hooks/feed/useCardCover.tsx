import type { ReactNode } from 'react';
import React, { useMemo } from 'react';
import type { Post } from '../../graphql/posts';
import { usePostActions } from '../post/usePostActions';
import { CardCoverShare } from '../../components/cards/common/CardCoverShare';
import { CardCoverContainer } from '../../components/cards/common/CardCoverContainer';
import { PostReminderOptions } from '../../components/post/common/PostReminderOptions';
import { ButtonSize, ButtonVariant } from '../../components/buttons/common';
import { socials } from '../../lib/socialMedia';
import SocialIconButton from '../../components/cards/socials/SocialIconButton';
import { useBookmarkReminderCover } from '../bookmark/useBookmarkReminderCover';
import { CardCoverCopySlack } from '../../components/cards/common/CardCoverCopySlack';
import { useAuthContext } from '../../contexts/AuthContext';
import { useConditionalFeature } from '../useConditionalFeature';
import { featureCardCopySlack } from '../../lib/featureManagement';

interface UseCardCover {
  overlay: ReactNode;
  shouldDimImage: boolean;
}

export interface UseCardCoverProps {
  post?: Post;
  onShare?: (post: Post) => void;
  hasImage?: boolean;
  className?: {
    bookmark?: {
      container?: string;
    };
    copy?: {
      container?: string;
    };
  };
}

export const useCardCover = ({
  post,
  onShare,
  hasImage = true,
  className = {},
}: UseCardCoverProps): UseCardCover => {
  const { user } = useAuthContext();
  const { onInteract, interaction } = usePostActions({ post });
  const shouldShowReminder = useBookmarkReminderCover(post);
  const { value: isCopySlackEnabled } = useConditionalFeature({
    feature: featureCardCopySlack,
    shouldEvaluate: interaction === 'copy' && hasImage && !!user,
  });
  const isCopySlackCover = interaction === 'copy' && isCopySlackEnabled;

  const overlay = useMemo(() => {
    if (!post) {
      return undefined;
    }

    if (isCopySlackCover) {
      return (
        <CardCoverCopySlack
          post={post}
          onShareToSlack={() => onInteract('none')}
          className={className?.copy?.container}
        />
      );
    }

    if (interaction === 'copy') {
      return (
        <CardCoverContainer title="Why not share it on social, too?">
          <div className="mt-2 flex flex-row gap-2">
            {socials.map((social) => (
              <SocialIconButton
                variant={ButtonVariant.Primary}
                key={social}
                post={post}
                platform={social}
              />
            ))}
          </div>
        </CardCoverContainer>
      );
    }
    if (onShare && interaction === 'upvote') {
      return (
        <CardCoverShare
          post={post}
          onCopy={() => onInteract('none')}
          onShare={() => {
            onInteract('none');
            onShare(post);
          }}
        />
      );
    }

    if (interaction === 'bookmark' || shouldShowReminder) {
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
    className?.copy?.container,
    interaction,
    isCopySlackCover,
    onInteract,
    onShare,
    post,
    shouldShowReminder,
  ]);

  return { overlay, shouldDimImage: !!overlay && !isCopySlackCover };
};
