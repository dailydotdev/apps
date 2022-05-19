import React, { ReactElement, useState } from 'react';
import { useQuery } from 'react-query';
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
import classNames from 'classnames';
import useNotification from '@dailydotdev/shared/src/hooks/useNotification';
import { CardNotification } from '@dailydotdev/shared/src/components/cards/Card';
import { useUpvoteQuery } from '@dailydotdev/shared/src/hooks/useUpvoteQuery';
import UpvotedPopupModal from '@dailydotdev/shared/src/components/modals/UpvotedPopupModal';
import { CompanionEngagements } from './CompanionEngagements';
import { CompanionDiscussion } from './CompanionDiscussion';
import { useBackgroundPaginatedRequest } from './useBackgroundPaginatedRequest';
import { getCompanionWrapper } from './common';

type CompanionContentProps = {
  post: PostBootData;
};

export default function CompanionContent({
  post,
}: CompanionContentProps): ReactElement {
  const { notification, onMessage } = useNotification();
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [copying, copyLink] = useCopyLink(() => post.commentsPermalink);
  const [heightRem, setHeightRem] = useState('0');
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
  useBackgroundPaginatedRequest(upvotedPopup.requestQuery?.queryKey);
  const postCommentNumKey = ['post_comments_num', post?.id];
  const { data: commentsNum = 0 } = useQuery(
    postCommentNumKey,
    () => post.numComments,
    { refetchOnWindowFocus: false },
  );

  const onContainerChange = async (el: HTMLElement) => {
    if (!el) {
      return;
    }

    const { height } = el.getBoundingClientRect();
    const topOffset = 7.5;
    const remValue = height / 16;
    const rem = `${remValue + topOffset}rem`;
    setHeightRem(rem);
  };

  return (
    <div
      ref={onContainerChange}
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
      <CompanionEngagements
        post={post}
        commentsNum={commentsNum}
        isCommentsOpen={isCommentsOpen}
        onCommentsClick={() => setIsCommentsOpen(!isCommentsOpen)}
        onUpvotesClick={() => onShowUpvotedPost(post.id, post.numUpvotes)}
      />
      {isCommentsOpen && (
        <CompanionDiscussion
          className="overflow-auto absolute top-full right-0 -left-px min-h-[14rem]"
          style={{ maxHeight: `calc(100vh - ${heightRem}` }}
          post={post}
          onShowUpvoted={onShowUpvotedComment}
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
