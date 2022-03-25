import React, { ReactElement } from 'react';
import LogoIcon from '@dailydotdev/shared/src/svg/LogoIcon';
import {
  HotLabel,
  TLDRText,
} from '@dailydotdev/shared/src/components/utilities';
import '@dailydotdev/shared/src/styles/globals.css';
import { PostBootData } from '@dailydotdev/shared/src/lib/boot';

interface CompanionContentProps {
  post: PostBootData;
}
export default function CompanionContent({
  post,
}: CompanionContentProps): ReactElement {
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
  );
}
