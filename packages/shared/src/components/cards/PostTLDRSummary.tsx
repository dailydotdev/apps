import React, { ReactElement, ReactNode } from 'react';
import { Post } from '../../graphql/posts';
import { TLDRSummary } from '../utilities';
import PostReadMore from './ShowMoreContent';

interface PostTLDRSummaryProps {
  post: Post;
  children?: ReactNode;
}

export default function PostTLDRSummary({
  post
}: PostTLDRSummaryProps): ReactElement {
  return (
    <TLDRSummary>
      <PostReadMore content={post.summary} charactersLimit={300}/>
    </TLDRSummary>
  );
}
