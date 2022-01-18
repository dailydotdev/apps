import React, { ReactElement } from 'react';
import { Post } from '../../graphql/posts';
import { TLDRSummary } from '../utilities';
import ShowMoreContent from './ShowMoreContent';

interface PostTLDRSummaryProps {
  post: Post;
}

export default function PostTLDRSummary({
  post,
}: PostTLDRSummaryProps): ReactElement {
  return (
    <TLDRSummary>
      <ShowMoreContent
        content={post.summary}
        charactersLimit={300}
        contentPrefix={
          <span className="pr-1 typo-headline text-theme-status-cabbage">
            TLDR
          </span>
        }
      />
    </TLDRSummary>
  );
}
