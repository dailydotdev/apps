import React, { ReactElement, useContext, useEffect } from 'react';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import UpvoteIcon from '@dailydotdev/shared/icons/upvote.svg';
import CommentIcon from '@dailydotdev/shared/icons/comment.svg';
import BookmarkIcon from '@dailydotdev/shared/icons/bookmark.svg';
import MenuIcon from '@dailydotdev/shared/icons/menu.svg';
import ArrowIcon from '@dailydotdev/shared/icons/arrow.svg';
import LogoIcon from '@dailydotdev/shared/src/svg/LogoIcon';
import classNames from 'classnames';
import SimpleTooltip from '@dailydotdev/shared/src/components/tooltips/SimpleTooltip';
import Modal from 'react-modal';
import { useContextMenu } from '@dailydotdev/react-contexify';
import useNotification from '@dailydotdev/shared/src/hooks/useNotification';
import { CardNotification } from '@dailydotdev/shared/src/components/cards/Card';
import { isTesting } from '@dailydotdev/shared/src/lib/constants';
import { PostBootData } from '@dailydotdev/shared/src/lib/boot';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import usePersistentContext from '@dailydotdev/shared/src/hooks/usePersistentContext';
import AnalyticsContext from '@dailydotdev/shared/src/contexts/AnalyticsContext';
import { postAnalyticsEvent } from '@dailydotdev/shared/src/lib/feed';
import { postEventName } from '@dailydotdev/shared/src/components/utilities';
import NewCommentModal from '@dailydotdev/shared/src/components/modals/NewCommentModal';
import CompanionContextMenu from './CompanionContextMenu';
import '@dailydotdev/shared/src/styles/globals.css';
import { CompanionHelper, getCompanionWrapper } from './common';
import useCompanionActions from './useCompanionActions';
import { useCompanionPostComment } from './useCompanionPostComment';

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
  onOpenComments,
}: CompanionMenuProps): ReactElement {
  const { trackEvent } = useContext(AnalyticsContext);
  const { user, showLogin } = useContext(AuthContext);
  const { notification, onMessage } = useNotification();
  const [showCompanionHelper, setShowCompanionHelper] = usePersistentContext(
    'companion_helper',
    companionHelper,
  );
  const updatePost = async (update) => {
    const oldPost = post;
    setPost({
      ...post,
      ...update,
    });
    trackEvent(
      postAnalyticsEvent(postEventName(update), post, {
        extra: { origin: 'companion context menu' },
      }),
    );
    return () => setPost(oldPost);
  };
  const {
    bookmark,
    removeBookmark,
    upvote,
    removeUpvote,
    report,
    blockSource,
    disableCompanion,
    removeCompanionHelper,
    toggleCompanionExpanded,
  } = useCompanionActions({
    onBookmarkMutate: () => updatePost({ bookmarked: true }),
    onRemoveBookmarkMutate: () => updatePost({ bookmarked: false }),
    onUpvoteMutate: () =>
      updatePost({ upvoted: true, numUpvotes: post.numUpvotes + 1 }),
    onRemoveUpvoteMutate: () =>
      updatePost({ upvoted: false, numUpvotes: post.numUpvotes + -1 }),
  });
  const { parentComment, closeNewComment, openNewComment, onInput } =
    useCompanionPostComment(post, { onCommentSuccess: onOpenComments });

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
  }, []);

  const toggleCompanion = () => {
    setShowCompanionHelper(false);
    trackEvent({
      event_name: `${companionState ? 'close' : 'open'} companion`,
    });
    toggleCompanionExpanded({ companionExpandedValue: !companionState });
    setCompanionState((state) => !state);
  };

  const optOut = () => {
    disableCompanion({});
    onOptOut();
  };

  const toggleUpvote = async () => {
    if (user) {
      if (!post.upvoted) {
        await upvote({ id: post.id });
      } else {
        await removeUpvote({ id: post.id });
      }
    }

    showLogin('companion');
  };

  const toggleBookmark = async () => {
    if (user) {
      if (!post.bookmarked) {
        await bookmark({ id: post.id });
      } else {
        await removeBookmark({ id: post.id });
      }
    }
    showLogin('companion');
  };

  const { show: showCompanionOptionsMenu } = useContextMenu({
    id: 'companion-options-context',
  });
  const onContextOptions = (event: React.MouseEvent): void => {
    showCompanionOptionsMenu(event, {
      position: { x: 48, y: 265 },
    });
  };

  const tooltipContainerProps = { className: 'shadow-2 whitespace-nowrap' };

  return (
    <div className="group flex relative flex-col gap-2 self-center p-2 my-6 w-14 rounded-l-16 border border-theme-divider-quaternary bg-theme-bg-primary">
      {notification && (
        <CardNotification className="absolute right-full bottom-3 z-2 mr-2 w-max text-center shadow-2">
          {notification}
        </CardNotification>
      )}
      {showCompanionHelper && <CompanionHelper />}
      <SimpleTooltip
        placement="left"
        content={companionState ? 'Close summary' : 'Open summary'}
        appendTo="parent"
        container={tooltipContainerProps}
      >
        <Button
          buttonSize="medium"
          className={classNames(
            companionState
              ? 'btn-secondary'
              : 'btn-tertiary group-hover:btn-secondary',
          )}
          icon={
            <>
              <LogoIcon
                className={classNames(
                  'w-6',
                  companionState ? 'hidden' : 'group-hover:hidden',
                )}
              />
              <ArrowIcon
                className={classNames(
                  'icon ',
                  companionState
                    ? 'block rotate-90'
                    : 'hidden group-hover:block -rotate-90',
                )}
              />
            </>
          }
          onClick={toggleCompanion}
        />
      </SimpleTooltip>
      <SimpleTooltip
        placement="left"
        content={post?.upvoted ? 'Remove upvote' : 'Upvote'}
        appendTo="parent"
        container={tooltipContainerProps}
      >
        <Button
          buttonSize="medium"
          icon={<UpvoteIcon />}
          pressed={post?.upvoted}
          onClick={toggleUpvote}
          className="btn-tertiary-avocado"
        />
      </SimpleTooltip>
      <SimpleTooltip
        placement="left"
        content="Comments"
        appendTo="parent"
        container={tooltipContainerProps}
      >
        <Button
          buttonSize="medium"
          className="btn-tertiary"
          icon={<CommentIcon />}
          onClick={openNewComment}
        />
      </SimpleTooltip>
      <SimpleTooltip
        placement="left"
        content={post?.bookmarked ? 'Remove bookmark' : 'Bookmark'}
        appendTo="parent"
        container={tooltipContainerProps}
      >
        <Button
          buttonSize="medium"
          pressed={post?.bookmarked}
          className="btn-tertiary-bun"
          onClick={toggleBookmark}
          icon={<BookmarkIcon />}
        />
      </SimpleTooltip>
      <SimpleTooltip
        placement="left"
        content="More options"
        appendTo="parent"
        container={tooltipContainerProps}
      >
        <Button
          buttonSize="medium"
          className="btn-tertiary"
          icon={<MenuIcon />}
          onClick={onContextOptions}
        />
      </SimpleTooltip>
      <CompanionContextMenu
        onMessage={onMessage}
        postData={post}
        onReport={report}
        onBlockSource={blockSource}
        onDisableCompanion={optOut}
        onViewDiscussion={onOpenComments}
      />
      {parentComment && (
        <NewCommentModal
          isOpen={!!parentComment}
          parentSelector={getCompanionWrapper}
          onRequestClose={closeNewComment}
          onInputChange={onInput}
          {...parentComment}
        />
      )}
    </div>
  );
}
