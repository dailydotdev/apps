import React, { ReactElement, useContext, useEffect } from 'react';
import {
  Button,
  ButtonColor,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  UpvoteIcon,
  DiscussIcon as CommentIcon,
  MenuIcon,
  ShareIcon,
  BookmarkIcon,
} from '@dailydotdev/shared/src/components/icons';
import SimpleTooltip from '@dailydotdev/shared/src/components/tooltips/SimpleTooltip';
import Modal from 'react-modal';
import { useContextMenu } from '@dailydotdev/react-contexify';
import { isTesting } from '@dailydotdev/shared/src/lib/constants';
import { PostBootData } from '@dailydotdev/shared/src/lib/boot';
import { LogEvent, Origin } from '@dailydotdev/shared/src/lib/log';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import usePersistentContext from '@dailydotdev/shared/src/hooks/usePersistentContext';
import LogContext from '@dailydotdev/shared/src/contexts/LogContext';
import { postLogEvent } from '@dailydotdev/shared/src/lib/feed';
import { useKeyboardNavigation } from '@dailydotdev/shared/src/hooks/useKeyboardNavigation';
import { useSharePost } from '@dailydotdev/shared/src/hooks/useSharePost';
import { LazyModal } from '@dailydotdev/shared/src/components/modals/common/types';
import { useLazyModal } from '@dailydotdev/shared/src/hooks/useLazyModal';
import { UserVote } from '@dailydotdev/shared/src/graphql/posts';
import { useVotePost } from '@dailydotdev/shared/src/hooks';
import UpvotedPopupModal, {
  UpvotedPopupModalProps,
} from '@dailydotdev/shared/src/components/modals/UpvotedPopupModal';
import { getCompanionWrapper } from '@dailydotdev/shared/src/lib/extension';
import ShareModal from '@dailydotdev/shared/src/components/modals/ShareModal';
import { ShareProps } from '@dailydotdev/shared/src/components/modals/post/common';
import CompanionContextMenu from './CompanionContextMenu';
import '@dailydotdev/shared/src/styles/globals.css';
import useCompanionActions from './useCompanionActions';
import CompanionToggle from './CompanionToggle';

if (!isTesting) {
  Modal.setAppElement('daily-companion-app');
}

type CompanionMenuProps = {
  post: PostBootData;
  companionHelper: boolean;
  setPost: (T) => void;
  companionState: boolean;
  onOptOut: () => void;
  setCompanionState: (T) => void;
  onOpenComments?: () => void;
};

export default function CompanionMenu({
  post,
  companionHelper,
  setPost,
  companionState,
  onOptOut,
  setCompanionState,
}: CompanionMenuProps): ReactElement {
  const { modal, closeModal } = useLazyModal();
  const { logEvent } = useContext(LogContext);
  const { user } = useContext(AuthContext);
  const [showCompanionHelper, setShowCompanionHelper] = usePersistentContext(
    'companion_helper',
    companionHelper,
  );
  const updatePost = async ({ update, event }) => {
    const oldPost = post;
    setPost({
      ...post,
      ...update,
    });
    logEvent(
      postLogEvent(event, post, {
        extra: { origin: Origin.CompanionContextMenu },
      }),
    );
    return () => setPost(oldPost);
  };

  const { toggleUpvote, toggleDownvote } = useVotePost();
  const { openSharePost } = useSharePost(Origin.Companion);
  const {
    bookmark,
    removeBookmark,
    blockSource,
    disableCompanion,
    removeCompanionHelper,
    toggleCompanionExpanded,
  } = useCompanionActions({
    onBookmarkMutate: () =>
      updatePost({
        update: { bookmarked: true },
        event: LogEvent.BookmarkPost,
      }),
    onRemoveBookmarkMutate: () =>
      updatePost({
        update: { bookmarked: false },
        event: LogEvent.RemovePostBookmark,
      }),
  });

  /**
   * Use a cleanup effect to always set the local cache helper state to false on destroy
   */
  useEffect(() => {
    if (user) {
      removeCompanionHelper({});
    }
    const cleanup = () => {
      setShowCompanionHelper(false);
    };
    window.addEventListener('beforeunload', cleanup);
    return () => cleanup();
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleCompanion = () => {
    setShowCompanionHelper(false);
    logEvent({
      event_name: `${companionState ? 'close' : 'open'} companion`,
    });
    toggleCompanionExpanded({ companionExpandedValue: !companionState });
    setCompanionState((state) => !state);
  };

  const onShare = () => openSharePost({ post });

  const optOut = () => {
    disableCompanion({});
    onOptOut();
  };

  const onToggleUpvote = async () => {
    if (!user) {
      window.open(
        `${process.env.NEXT_PUBLIC_WEBAPP_URL}signup?close=true`,
        '_blank',
      );

      return;
    }

    await toggleUpvote({ payload: post, origin: Origin.CompanionContextMenu });
  };

  const onToggleDownvote = async () => {
    if (!user) {
      window.open(
        `${process.env.NEXT_PUBLIC_WEBAPP_URL}signup?close=true`,
        '_blank',
      );

      return;
    }

    await toggleDownvote({
      payload: post,
      origin: Origin.CompanionContextMenu,
    });
  };

  const toggleBookmark = async () => {
    if (user) {
      if (!post.bookmarked) {
        await bookmark({ id: post.id });
      } else {
        await removeBookmark({ id: post.id });
      }
    } else {
      window.open(
        `${process.env.NEXT_PUBLIC_WEBAPP_URL}signup?close=true`,
        '_blank',
      );
    }
  };

  const { show: showCompanionOptionsMenu } = useContextMenu({
    id: 'companion-options-context',
  });
  const onContextOptions = (event: React.MouseEvent): void => {
    showCompanionOptionsMenu(event, {
      position: { x: 48, y: 318 },
    });
  };

  const tooltipContainerProps = { className: 'shadow-2 whitespace-nowrap' };

  const onEscape = () => {
    if (!companionState) {
      return;
    }

    logEvent({ event_name: 'close companion' });
    toggleCompanionExpanded({ companionExpandedValue: false });
    setCompanionState(false);
  };

  useKeyboardNavigation(window, [['Escape', onEscape]], {
    disabledModalOpened: true,
  });

  return (
    <div className="group relative my-6 flex w-14 flex-col gap-2 self-center rounded-l-16 border border-border-subtlest-quaternary bg-background-default p-2">
      <CompanionToggle
        companionState={companionState}
        isAlertDisabled={!showCompanionHelper}
        tooltipContainerProps={tooltipContainerProps}
        onToggleCompanion={toggleCompanion}
      />
      <SimpleTooltip
        placement="left"
        content={
          post?.userState?.vote === UserVote.Up ? 'Remove upvote' : 'Upvote'
        }
        appendTo="parent"
        container={tooltipContainerProps}
      >
        <Button
          icon={
            <UpvoteIcon secondary={post?.userState?.vote === UserVote.Up} />
          }
          pressed={post?.userState?.vote === UserVote.Up}
          onClick={onToggleUpvote}
          variant={ButtonVariant.Tertiary}
          color={ButtonColor.Avocado}
        />
      </SimpleTooltip>
      <SimpleTooltip
        placement="left"
        content="Add comment"
        appendTo="parent"
        container={tooltipContainerProps}
      >
        <Button
          variant={ButtonVariant.Tertiary}
          color={ButtonColor.BlueCheese}
          pressed={post?.commented}
          icon={<CommentIcon />}
          onClick={() => {
            setCompanionState(true);

            const commentBox =
              getCompanionWrapper()?.querySelector<HTMLElement>(
                '.companion-new-comment-button',
              );

            if (commentBox) {
              commentBox.click();
            }
          }}
        />
      </SimpleTooltip>
      <SimpleTooltip
        placement="left"
        content={`${post?.bookmarked ? 'Remove from' : 'Save to'} bookmarks`}
        appendTo="parent"
        container={tooltipContainerProps}
      >
        <Button
          icon={<BookmarkIcon secondary={post?.bookmarked} />}
          pressed={post?.bookmarked}
          onClick={toggleBookmark}
          variant={ButtonVariant.Tertiary}
          color={ButtonColor.Bun}
        />
      </SimpleTooltip>
      <SimpleTooltip
        placement="left"
        content="Share post"
        appendTo="parent"
        container={tooltipContainerProps}
      >
        <Button
          variant={ButtonVariant.Tertiary}
          color={ButtonColor.Cabbage}
          onClick={onShare}
          icon={<ShareIcon />}
        />
      </SimpleTooltip>
      <SimpleTooltip
        placement="left"
        content="More options"
        appendTo="parent"
        container={tooltipContainerProps}
      >
        <Button
          variant={ButtonVariant.Tertiary}
          icon={<MenuIcon />}
          onClick={onContextOptions}
        />
      </SimpleTooltip>
      <CompanionContextMenu
        onShare={onShare}
        postData={post}
        onBlockSource={blockSource}
        onDisableCompanion={optOut}
        onDownvote={onToggleDownvote}
      />
      {modal?.type === LazyModal.Share && (
        <ShareModal
          isOpen
          parentSelector={getCompanionWrapper}
          onRequestClose={closeModal}
          {...(modal.props as ShareProps)}
        />
      )}
      {modal?.type === LazyModal.UpvotedPopup && (
        <UpvotedPopupModal
          isOpen
          parentSelector={getCompanionWrapper}
          onRequestClose={closeModal}
          {...(modal.props as UpvotedPopupModalProps)}
        />
      )}
    </div>
  );
}
