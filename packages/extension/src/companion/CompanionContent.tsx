import React, { ReactElement, useContext, useState } from 'react';
import LogoIcon from '@dailydotdev/shared/src/svg/LogoIcon';
import CopyIcon from '@dailydotdev/shared/icons/copy.svg';
import {
  HotLabel,
  TLDRText,
} from '@dailydotdev/shared/src/components/utilities';
import '@dailydotdev/shared/src/styles/globals.css';
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
import { CompanionDiscussion } from './CompanionDiscussion';
import { useBackgroundRequest } from './useBackgroundRequest';
import { getCompanionWrapper } from './common';

type CompanionContentProps = {
  post: PostBootData;
};

export default function CompanionContent({
  post,
}: CompanionContentProps): ReactElement {
  const queryKey = ['post_comments', post?.id];
  useBackgroundRequest(queryKey);
  const { user } = useContext(AuthContext);
  const { notification, onMessage } = useNotification();
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [copying, copyLink] = useCopyLink(() => post.commentsPermalink);
  const copyLinkAndNotify = () => {
    copyLink();
    onMessage('✅ Copied link to clipboard');
  };
  const {
    onNewComment,
    closeNewComment,
    openNewComment,
    onCommentClick,
    parentComment,
  } = usePostComment(post);

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
        isCommentsOpen={isCommentsOpen}
        onCommentsClick={() => setIsCommentsOpen(!isCommentsOpen)}
      />
      {isCommentsOpen && (
        <div
          className="absolute top-full right-0 -left-px p-6 border border-r-0 bg-theme-bg-primary border-theme-label-primary border-t-theme-divider-tertiary"
          style={{ maxHeight: '55rem' }}
        >
          <NewComment user={user} onNewComment={openNewComment} />
          <PostComments post={post} onClick={onCommentClick} />
        </div>
      )}
      {parentComment && (
        <NewCommentModal
          isOpen={!!parentComment}
          parentSelector={getCompanionWrapper}
          onRequestClose={closeNewComment}
          {...parentComment}
          onComment={onNewComment}
        />
      )}
    </div>
  );
}
