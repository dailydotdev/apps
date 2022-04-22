import React, { ReactElement, useState } from 'react';
import LogoIcon from '@dailydotdev/shared/src/svg/LogoIcon';
import {
  getUpvotedPopupInitialState,
  HotLabel,
  TLDRText,
} from '@dailydotdev/shared/src/components/utilities';
import '@dailydotdev/shared/src/styles/globals.css';
import { PostBootData } from '@dailydotdev/shared/src/lib/boot';
import UpvotedPopupModal from '@dailydotdev/shared/src/components/modals/UpvotedPopupModal';
import { POST_UPVOTES_BY_ID_QUERY } from '@dailydotdev/shared/src/graphql/posts';
import { DEFAULT_UPVOTES_PER_PAGE } from '@dailydotdev/shared/src/graphql/common';
import { ClickableText } from '@dailydotdev/shared/src/components/buttons/ClickableText';
import { getCompanionWrapper } from './common';

interface CompanionContentProps {
  post: PostBootData;
}

export default function CompanionContent({
  post,
}: CompanionContentProps): ReactElement {
  const [upvotedPopup, setUpvotedPopup] = useState(getUpvotedPopupInitialState);

  return (
    <div className="flex flex-col p-6 h-auto rounded-l-16 border w-[22.5rem] border-theme-label-tertiary bg-theme-bg-primary">
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
        {post?.numUpvotes <= 0 && post?.numComments <= 0 && (
          <span>Be the first to upvote</span>
        )}
        {post?.numUpvotes > 0 && (
          <ClickableText
            onClick={() =>
              setUpvotedPopup({
                modal: true,
                upvotes: post.numUpvotes,
                requestQuery: {
                  queryKey: ['postUpvotes', post.id],
                  query: POST_UPVOTES_BY_ID_QUERY,
                  params: { id: post.id, first: DEFAULT_UPVOTES_PER_PAGE },
                },
              })
            }
            className="flex flex-row items-center hover:underline focus:underline cursor-pointer typo-callout"
          >
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
      {upvotedPopup.modal && (
        <UpvotedPopupModal
          parentSelector={getCompanionWrapper}
          requestQuery={upvotedPopup.requestQuery}
          isOpen={upvotedPopup.modal}
          listPlaceholderProps={{ placeholderAmount: post?.numUpvotes }}
          onRequestClose={() => setUpvotedPopup(getUpvotedPopupInitialState())}
        />
      )}
    </div>
  );
}
