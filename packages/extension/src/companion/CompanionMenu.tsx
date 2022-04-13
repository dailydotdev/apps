import React, { ReactElement, useContext } from 'react';
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
import CompanionContextMenu from './CompanionContextMenu';
import '@dailydotdev/shared/src/styles/globals.css';
import useCompanionActions from './useCompanionActions';
import { postAnalyticsEvent } from '@dailydotdev/shared/src/lib/feed';
import AnalyticsContext from '@dailydotdev/shared/src/contexts/AnalyticsContext';

if (!isTesting) {
  Modal.setAppElement('daily-companion-app');
}

const postEventName = (
  update: Pick<PostBootData, 'upvoted' | 'bookmarked'>,
): string => {
  if ('upvoted' in update) {
    return `${!update.upvoted ? 'remove ' : ''}upvote post`;
  }
  return `${!update.bookmarked ? 'remove ' : ''}post bookmark`;
};

interface CompanionMenuProps {
  post: PostBootData;
  setPost: (T) => void;
  companionState: boolean;
  onOptOut: () => void;
  setCompanionState: (T) => void;
}
export default function CompanionMenu({
  post,
  setPost,
  companionState,
  onOptOut,
  setCompanionState,
}: CompanionMenuProps): ReactElement {
  const { trackEvent } = useContext(AnalyticsContext);
  const { notification, onMessage } = useNotification();

  const toggleCompanion = () => {
    trackEvent({
      event_name: `${companionState ? 'close' : 'open'} companion`,
    });
    setCompanionState((state) => !state);
  };

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
  } = useCompanionActions({
    onBookmarkMutate: () => updatePost({ bookmarked: true }),
    onRemoveBookmarkMutate: () => updatePost({ bookmarked: false }),
    onUpvoteMutate: () =>
      updatePost({ upvoted: true, numUpvotes: post.numUpvotes + 1 }),
    onRemoveUpvoteMutate: () =>
      updatePost({ upvoted: false, numUpvotes: post.numUpvotes + -1 }),
  });

  const optOut = () => {
    disableCompanion({});
    onOptOut();
  };

  const toggleUpvote = async () => {
    if (!post.upvoted) {
      await upvote({ id: post.id });
    } else {
      await removeUpvote({ id: post.id });
    }
  };

  const toggleBookmark = async () => {
    if (!post.bookmarked) {
      await bookmark({ id: post.id });
    } else {
      await removeBookmark({ id: post.id });
    }
  };

  const { show: showCompanionOptionsMenu } = useContextMenu({
    id: 'companion-options-context',
  });
  const onContextOptions = (event: React.MouseEvent): void => {
    showCompanionOptionsMenu(event, {
      position: { x: 48, y: 265 },
    });
  };

  return (
    <div className="flex relative flex-col gap-2 self-center p-2 my-6 w-14 rounded-l-16 border border-theme-label-tertiary bg-theme-bg-primary">
      {notification && (
        <CardNotification className="absolute right-full bottom-3 z-2 mr-2 w-max text-center shadow-2">
          {notification}
        </CardNotification>
      )}
      <SimpleTooltip
        placement="left"
        content={companionState ? 'Close summary' : 'Open summary'}
        appendTo="parent"
      >
        <Button
          buttonSize="medium"
          className={classNames(
            'group',
            companionState
              ? 'btn-secondary'
              : 'btn-tertiary hover:btn-secondary',
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
      >
        <Button
          buttonSize="medium"
          icon={<UpvoteIcon />}
          pressed={post?.upvoted}
          onClick={toggleUpvote}
          className="btn-tertiary-avocado"
        />
      </SimpleTooltip>
      <SimpleTooltip placement="left" content="Comments" appendTo="parent">
        <Button
          href={post?.commentsPermalink}
          tag="a"
          buttonSize="medium"
          className="btn-tertiary"
          icon={<CommentIcon />}
        />
      </SimpleTooltip>
      <SimpleTooltip
        placement="left"
        content={post?.bookmarked ? 'Remove bookmark' : 'Bookmark'}
        appendTo="parent"
      >
        <Button
          buttonSize="medium"
          pressed={post?.bookmarked}
          className="btn-tertiary-bun"
          onClick={toggleBookmark}
          icon={<BookmarkIcon />}
        />
      </SimpleTooltip>
      <SimpleTooltip placement="left" content="More options" appendTo="parent">
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
      />
    </div>
  );
}
