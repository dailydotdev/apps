import React, { ReactElement, useContext, useEffect } from 'react';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import UpvoteIcon from '@dailydotdev/shared/src/components/icons/Upvote';
import CommentIcon from '@dailydotdev/shared/src/components/icons/Discuss';
import BookmarkIcon from '@dailydotdev/shared/src/components/icons/Bookmark';
import MenuIcon from '@dailydotdev/shared/src/components/icons/Menu';
import ArrowIcon from '@dailydotdev/shared/src/components/icons/Arrow';
import ShareIcon from '@dailydotdev/shared/src/components/icons/Share';
import LogoIcon from '@dailydotdev/shared/src/svg/LogoIcon';
import classNames from 'classnames';
import SimpleTooltip from '@dailydotdev/shared/src/components/tooltips/SimpleTooltip';
import Modal from 'react-modal';
import { useContextMenu } from '@dailydotdev/react-contexify';
import { isTesting } from '@dailydotdev/shared/src/lib/constants';
import { PostBootData } from '@dailydotdev/shared/src/lib/boot';
import { Origin } from '@dailydotdev/shared/src/lib/analytics';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import usePersistentContext from '@dailydotdev/shared/src/hooks/usePersistentContext';
import AnalyticsContext from '@dailydotdev/shared/src/contexts/AnalyticsContext';
import { postAnalyticsEvent } from '@dailydotdev/shared/src/lib/feed';
import { postEventName } from '@dailydotdev/shared/src/components/utilities';
import { useKeyboardNavigation } from '@dailydotdev/shared/src/hooks/useKeyboardNavigation';
import { useSharePost } from '@dailydotdev/shared/src/hooks/useSharePost';
import FeaturesContext from '@dailydotdev/shared/src/contexts/FeaturesContext';
import { AdditionalInteractionButtons } from '@dailydotdev/shared/src/lib/featureValues';
import NewCommentModal from '@dailydotdev/shared/src/components/modals/NewCommentModal';
import ShareModal from '@dailydotdev/shared/src/components/modals/ShareModal';

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
  const { additionalInteractionButtonFeature } = useContext(FeaturesContext);
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
  const { sharePost, openSharePost, closeSharePost } = useSharePost(
    Origin.Companion,
  );
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

  const onShare = () => openSharePost(post);

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

  const onEscape = () => {
    if (!companionState) {
      return;
    }

    trackEvent({ event_name: 'close companion' });
    toggleCompanionExpanded({ companionExpandedValue: false });
    setCompanionState(false);
  };

  useKeyboardNavigation(window, [['Escape', onEscape]], {
    disabledModalOpened: true,
  });

  return (
    <div className="group flex relative flex-col gap-2 self-center p-2 my-6 w-14 rounded-l-16 border border-theme-divider-quaternary bg-theme-bg-primary">
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
          icon={<UpvoteIcon secondary={post?.upvoted} />}
          pressed={post?.upvoted}
          onClick={toggleUpvote}
          className="btn-tertiary-avocado"
        />
      </SimpleTooltip>
      <SimpleTooltip
        placement="left"
        content="Add comment"
        appendTo="parent"
        container={tooltipContainerProps}
      >
        <Button
          buttonSize="medium"
          className="btn-tertiary"
          icon={<CommentIcon />}
          onClick={() => openNewComment('comment button')}
        />
      </SimpleTooltip>
      {additionalInteractionButtonFeature ===
      AdditionalInteractionButtons.Bookmark ? (
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
            icon={<BookmarkIcon secondary={post?.bookmarked} />}
          />
        </SimpleTooltip>
      ) : (
        <SimpleTooltip
          placement="left"
          content="Share post"
          appendTo="parent"
          container={tooltipContainerProps}
        >
          <Button
            buttonSize="medium"
            className="btn-tertiary-cabbage"
            onClick={onShare}
            icon={<ShareIcon />}
          />
        </SimpleTooltip>
      )}
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
        additionalInteractionButtonFeature={additionalInteractionButtonFeature}
        onBookmark={toggleBookmark}
        onShare={onShare}
        postData={post}
        onReport={report}
        onBlockSource={blockSource}
        onDisableCompanion={optOut}
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
      {sharePost && (
        <ShareModal
          isOpen={!!sharePost}
          parentSelector={getCompanionWrapper}
          post={sharePost}
          origin={Origin.Companion}
          onRequestClose={closeSharePost}
        />
      )}
    </div>
  );
}
