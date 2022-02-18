import React, { ReactElement, useState } from 'react';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import UpvoteIcon from '@dailydotdev/shared/icons/upvote.svg';
import CommentIcon from '@dailydotdev/shared/icons/comment.svg';
import BookmarkIcon from '@dailydotdev/shared/icons/bookmark.svg';
import MenuIcon from '@dailydotdev/shared/icons/menu.svg';
import ArrowIcon from '@dailydotdev/shared/icons/arrow.svg';
import LogoIcon from '@dailydotdev/shared/src/svg/LogoIcon';
import { ClickableText } from '@dailydotdev/shared/src/components/buttons/ClickableText';
import {
  HotLabel,
  TLDRText,
} from '@dailydotdev/shared/src/components/utilities';
import classNames from 'classnames';
import SimpleTooltip from '@dailydotdev/shared/src/components/tooltips/SimpleTooltip';
import useBookmarkPost from '@dailydotdev/shared/src/hooks/useBookmarkPost';
import { QueryClient, QueryClientProvider } from 'react-query';
import useUpvotePost from '@dailydotdev/shared/src/hooks/useUpvotePost';
import { useContextMenu } from '@dailydotdev/react-contexify';
import useNotification from '@dailydotdev/shared/src/hooks/useNotification';
import { CardNotification } from '@dailydotdev/shared/src/components/cards/Card';
import CompanionContextMenu from './CompanionContextMenu';
import { BootData } from './common';

const queryClient = new QueryClient();

function InternalApp({ postData }: { postData: BootData }) {
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
  const { bookmark, removeBookmark } = useBookmarkPost({
    onBookmarkMutate: () => updatePost({ bookmarked: true }),
    onRemoveBookmarkMutate: () => updatePost({ bookmarked: false }),
  });
  const { upvotePost, cancelPostUpvote } = useUpvotePost({
    onUpvotePostMutate: () =>
      updatePost({ upvoted: true, numUpvotes: post.numUpvotes + 1 }),
    onCancelPostUpvoteMutate: () =>
      updatePost({ upvoted: false, numUpvotes: post.numUpvotes - 1 }),
  });

  const toggleUpvote = async () => {
    if (!post.upvoted) {
      await upvotePost({ id: post.id });
    } else {
      await cancelPostUpvote({ id: post.id });
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
    const { right, bottom } = event.currentTarget.getBoundingClientRect();
    showCompanionOptionsMenu(event, {
      position: { x: right, y: bottom + 4 },
    });
  };

  return (
    <div
      className={classNames(
        'flex absolute flex-row top-[7.5rem] transition-transform',
        companionState ? 'translate-x-0' : 'translate-x-[22.5rem]',
      )}
    >
      <div className="flex flex-col gap-2 p-2 my-6 w-14 rounded-l-16 border border-theme-label-tertiary bg-theme-bg-primary">
        {notification && (
          <CardNotification className="absolute right-full bottom-8 z-2 mr-2 text-center w-fit">
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
            target="_parent"
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
        <CompanionContextMenu onMessage={onMessage} />
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
          {post?.summary}
        </p>
        <div
          className="flex gap-x-4 items-center text-theme-label-tertiary typo-callout"
          data-testid="statsBar"
        >
          {post?.numUpvotes > 0 && (
            <ClickableText>
              {post?.numUpvotes} Upvote{post?.numUpvotes > 1 ? 's' : ''}
            </ClickableText>
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
}: {
  postData: BootData;
}): ReactElement {
  return (
    <QueryClientProvider client={queryClient}>
      <InternalApp postData={postData} />
    </QueryClientProvider>
  );
}
