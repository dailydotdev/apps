import React, { ReactElement, useState } from 'react';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import UpvoteIcon from '@dailydotdev/shared/icons/upvote.svg';
import CommentIcon from '@dailydotdev/shared/icons/comment.svg';
import BookmarkIcon from '@dailydotdev/shared/icons/bookmark.svg';
import MenuIcon from '@dailydotdev/shared/icons/menu.svg';
import ArrowIcon from '@dailydotdev/shared/icons/arrow.svg';
import LogoIcon from '@dailydotdev/shared/src/svg/LogoIcon';
import {
  HotLabel,
  TLDRText,
} from '@dailydotdev/shared/src/components/utilities';
import classNames from 'classnames';
import SimpleTooltip from '@dailydotdev/shared/src/components/tooltips/SimpleTooltip';
import { QueryClient, QueryClientProvider } from 'react-query';
import Modal from 'react-modal';
import { useContextMenu } from '@dailydotdev/react-contexify';
import useNotification from '@dailydotdev/shared/src/hooks/useNotification';
import { CardNotification } from '@dailydotdev/shared/src/components/cards/Card';
import CompanionContextMenu from './CompanionContextMenu';
import { BootData } from './common';
import '@dailydotdev/shared/src/styles/globals.css';
import useCompanionActions from './useCompanionActions';

const queryClient = new QueryClient();
Modal.setAppElement('daily-companion-app');

function InternalApp({ postData, onOptOut }: { postData: BootData; onOptOut }) {
  const [post, setPost] = useState<BootData>(postData);
  const [companionState, setCompanionState] = useState<boolean>(false);
  const { notification, onMessage } = useNotification();

  const updatePost = async (update) => {
    const oldPost = post;
    setPost({
      ...post,
      ...update,
    });
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
    <div
      className={classNames(
        'flex fixed flex-row top-[7.5rem] transition-transform items-start right-0 z-[999999]',
        companionState ? 'translate-x-0' : 'translate-x-[22.5rem]',
      )}
    >
      <div className="flex relative flex-col gap-2 p-2 my-6 w-14 rounded-l-16 border border-theme-label-tertiary bg-theme-bg-primary">
        {notification && (
          <CardNotification className="absolute right-full bottom-3 z-2 mr-2 w-max text-center shadow-2">
            {notification}
          </CardNotification>
        )}
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
          onClick={() => setCompanionState(!companionState)}
        />
        <SimpleTooltip placement="left" content="Upvote">
          <Button
            buttonSize="medium"
            icon={<UpvoteIcon />}
            pressed={post?.upvoted}
            onClick={toggleUpvote}
            className="btn-tertiary-avocado"
          />
        </SimpleTooltip>
        <SimpleTooltip placement="left" content="Comments">
          <Button
            href={post?.commentsPermalink}
            tag="a"
            buttonSize="medium"
            className="btn-tertiary"
            icon={<CommentIcon />}
          />
        </SimpleTooltip>
        <SimpleTooltip placement="left" content="Bookmark">
          <Button
            buttonSize="medium"
            pressed={post?.bookmarked}
            className="btn-tertiary-bun"
            onClick={toggleBookmark}
            icon={<BookmarkIcon />}
          />
        </SimpleTooltip>
        <SimpleTooltip placement="left" content="Options">
          <Button
            buttonSize="medium"
            className="btn-tertiary"
            icon={<MenuIcon />}
            onClick={onContextOptions}
          />
        </SimpleTooltip>
        <CompanionContextMenu
          onMessage={onMessage}
          postData={postData}
          onReport={report}
          onBlockSource={blockSource}
          onDisableCompanion={optOut}
        />
      </div>
      <div className="flex flex-col p-6 rounded-l-16 border w-[22.5rem] border-theme-label-tertiary bg-theme-bg-primary">
        <div className="flex flex-row gap-3 items-center">
          <a href={post?.commentsPermalink} target="_parent">
            <LogoIcon className="w-8 rounded-8" />
          </a>
          {post?.trending && <HotLabel />}
        </div>
        <p className="flex-1 my-4 typo-body">
          <TLDRText>TLDR -</TLDRText>
          {post?.summary ??
            `Oops, edge case alert! Our AI-powered TLDR engine couldn't generate a summary for this article. Anyway, we thought it would be an excellent reminder for us all to strive for progress over perfection! Be relentless about learning, growing, and improving. Sometimes shipping an imperfect feature is better than not shipping at all. Enjoy the article!`}
        </p>
        <div
          className="flex gap-x-4 items-center text-theme-label-tertiary typo-callout"
          data-testid="statsBar"
        >
          {post?.numUpvotes > 0 && (
            <a
              href={post?.commentsPermalink}
              className="flex flex-row items-center hover:underline focus:underline cursor-pointer typo-callout"
            >
              {post?.numUpvotes} Upvote{post?.numUpvotes > 1 ? 's' : ''}
            </a>
          )}
          {post?.numComments > 0 && (
            <span>
              {post?.numComments.toLocaleString()}
              {` Comment${post?.numComments === 1 ? '' : 's'}`}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function App({
  postData,
  settings,
}: {
  postData: BootData;
  settings;
}): ReactElement {
  const [isOptOutCompanion, setIsOptOutCompanion] = useState<boolean>(
    settings?.optOutCompanion,
  );
  if (isOptOutCompanion) {
    return <></>;
  }

  return (
    <div>
      <style>
        @import
        &quot;chrome-extension://dhhaojmcngfjmoinjljlkdknbcildjlg/css/companion.css&quot;;
      </style>
      <QueryClientProvider client={queryClient}>
        <InternalApp
          postData={postData}
          onOptOut={() => setIsOptOutCompanion(true)}
        />
      </QueryClientProvider>
    </div>
  );
}
