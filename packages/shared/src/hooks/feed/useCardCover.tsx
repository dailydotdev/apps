import type { ReactNode } from 'react';
import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import type { Post } from '../../graphql/posts';
import { usePostActions } from '../post/usePostActions';
import { CardCoverShare } from '../../components/cards/common/CardCoverShare';
import { CardCoverContainer } from '../../components/cards/common/CardCoverContainer';
import { PostReminderOptions } from '../../components/post/common/PostReminderOptions';
import { ButtonSize, ButtonVariant } from '../../components/buttons/common';
import { socials } from '../../lib/socialMedia';
import SocialIconButton from '../../components/cards/socials/SocialIconButton';
import { useBookmarkReminderCover } from '../bookmark/useBookmarkReminderCover';
import useInteractiveFeed from './useInteractiveFeed';

const InteractiveFeedCardCover = dynamic(
  () => import('../../components/cards/common/InteractiveFeedCardCover'),
  { ssr: false },
);

interface UseCardCover {
  overlay: ReactNode;
}

interface UseCardCoverProps {
  post: Post;
  isHoveringCard?: boolean;
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
  isHoveringCard,
  className = {},
}: UseCardCoverProps): UseCardCover => {
  const { onInteract, interaction } = usePostActions({ post });
  const shouldShowReminder = useBookmarkReminderCover(post);
  const { showCover, interactiveFeedExp } = useInteractiveFeed({ post });

  const overlay = useMemo(() => {
    if (showCover && isHoveringCard) {
      return <InteractiveFeedCardCover post={post} />;
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

    if (
      interaction === 'bookmark' ||
      (shouldShowReminder && !interactiveFeedExp)
    ) {
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
    interaction,
    onInteract,
    onShare,
    post,
    shouldShowReminder,
    isHoveringCard,
    interactiveFeedExp,
    showCover,
  ]);

  return { overlay };
};
