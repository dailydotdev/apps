import React, { ReactElement, useContext, useState } from 'react';
import { useQuery } from 'react-query';
import LogoIcon from '@dailydotdev/shared/src/svg/LogoIcon';
import CopyIcon from '@dailydotdev/shared/icons/copy.svg';
import {
  HotLabel,
  TLDRText,
} from '@dailydotdev/shared/src/components/utilities';
import '@dailydotdev/shared/src/styles/globals.css';
import UpvotedPopupModal from '@dailydotdev/shared/src/components/modals/UpvotedPopupModal';
import SimpleTooltip from '@dailydotdev/shared/src/components/tooltips/SimpleTooltip';
import { PostBootData } from '@dailydotdev/shared/src/lib/boot';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import { useCopyLink } from '@dailydotdev/shared/src/hooks/useCopyLink';
import { usePostComment } from '@dailydotdev/shared/src/hooks/usePostComment';
import classNames from 'classnames';
import useNotification from '@dailydotdev/shared/src/hooks/useNotification';
import { CardNotification } from '@dailydotdev/shared/src/components/cards/Card';
import { PostComments } from '@dailydotdev/shared/src/components/post/PostComments';
import { NewComment } from '@dailydotdev/shared/src/components/post/NewComment';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import NewCommentModal from '@dailydotdev/shared/src/components/modals/NewCommentModal';
import { useUpvoteQuery } from '@dailydotdev/shared/src/hooks/useUpvoteQuery';
import { CompanionDiscussion } from './CompanionDiscussion';
import { useBackgroundRequest } from './useBackgroundRequest';
import { getCompanionWrapper } from './common';
import { useBackgroundPaginatedRequest } from './useBackgroundPaginatedRequest';

type CompanionContentProps = {
  post: PostBootData;
};

export default function CompanionContent({
  post,
}: CompanionContentProps): ReactElement {
  const { user } = useContext(AuthContext);
  const { notification, onMessage } = useNotification();
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [copying, copyLink] = useCopyLink(() => post.commentsPermalink);
  const copyLinkAndNotify = () => {
    copyLink();
    onMessage('✅ Copied link to clipboard');
  };
  const {
    requestQuery: upvotedPopup,
    resetUpvoteQuery,
    onShowUpvotedPost,
    onShowUpvotedComment,
  } = useUpvoteQuery();
  const {
    closeNewComment,
    openNewComment,
    onCommentClick,
    updatePostComments,
    parentComment,
  } = usePostComment(post);
  const mutationKey = ['post_comments_mutations', post?.id];
  const postCommentsQueryKey = ['post_comments', post?.id];
  useBackgroundRequest(postCommentsQueryKey);
  useBackgroundPaginatedRequest(upvotedPopup.requestQuery?.queryKey);
  useBackgroundRequest(mutationKey, ({ req, res }) => {
    const isNew = req.variables.id !== res.comment.id;
    updatePostComments(res.comment, isNew);
    closeNewComment();
  });
  const postCommentNumKey = ['post_comments_num', post?.id];
  const { data: commentsNum = 0 } = useQuery(
    postCommentNumKey,
    () => post.numComments,
  );

  return (
    <div
      className={classNames(
        'flex relative flex-col p-6 h-auto rounded-tl-16 border w-[22.5rem] border-theme-label-tertiary bg-theme-bg-primary',
        !isCommentsOpen && 'rounded-bl-16',
      )}
    >
      {notification && (
        <CardNotification className="absolute -top-6 right-8 z-2 w-max text-center shadow-2">
          {notification}
        </CardNotification>
      )}
      <div className="flex flex-row gap-3 items-center">
        <a href={post?.commentsPermalink} target="_parent">
          <LogoIcon className="w-8 rounded-8" />
        </a>
        {post?.trending && <HotLabel />}
        {post?.summary && (
          <SimpleTooltip
            placement="top"
            content="Copy link"
            appendTo="parent"
            container={{ className: 'shadow-2 whitespace-nowrap' }}
          >
            <Button
              icon={<CopyIcon />}
              className={classNames(
                'ml-auto',
                copying ? 'btn-tertiary-avocado' : ' btn-tertiary',
              )}
              onClick={copyLinkAndNotify}
            />
          </SimpleTooltip>
        )}
      </div>
      <p className="flex-1 my-4 typo-body">
        <TLDRText>TLDR -</TLDRText>
        {post?.summary ??
          `Oops, edge case alert! Our AI-powered TLDR engine couldn't generate a summary for this article. Anyway, we thought it would be an excellent reminder for us all to strive for progress over perfection! Be relentless about learning, growing, and improving. Sometimes shipping an imperfect feature is better than not shipping at all. Enjoy the article!`}
      </p>
      <CompanionDiscussion
        post={post}
        commentsNum={commentsNum}
        isCommentsOpen={isCommentsOpen}
        onCommentsClick={() => setIsCommentsOpen(!isCommentsOpen)}
        onUpvotesClick={() => onShowUpvotedPost(post.id, post.numUpvotes)}
      />
      {isCommentsOpen && (
        <div className="overflow-auto absolute top-full right-0 -left-px p-6 rounded-bl-16 border border-r-0 max-h-[calc(100vh-30rem)] bg-theme-bg-primary border-theme-label-primary border-t-theme-divider-tertiary">
          <NewComment user={user} onNewComment={openNewComment} />
          <h3 className="my-8 font-bold typo-callout">Discussion</h3>
          <PostComments
            post={post}
            applyBottomMargin={false}
            onClick={onCommentClick}
            onClickUpvote={onShowUpvotedComment}
            modalParentSelector={getCompanionWrapper}
          />
        </div>
      )}
      {parentComment && (
        <NewCommentModal
          isOpen={!!parentComment}
          parentSelector={getCompanionWrapper}
          onRequestClose={closeNewComment}
          {...parentComment}
        />
      )}
      {upvotedPopup.modal && (
        <UpvotedPopupModal
          isOpen
          parentSelector={getCompanionWrapper}
          requestQuery={upvotedPopup.requestQuery}
          listPlaceholderProps={{ placeholderAmount: post?.numUpvotes }}
          onRequestClose={resetUpvoteQuery}
        />
      )}
    </div>
  );
}
