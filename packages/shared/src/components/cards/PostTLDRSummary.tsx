import React, { ReactElement, ReactNode, useMemo } from 'react';
import classNames from 'classnames';
import { Post } from '../../graphql/posts';
import classed from '../../lib/classed';
import { TLDRSummary } from '../utilities';

interface PostTLDRSummaryProps {
  post: Post;
  children?: ReactNode;
}

export default function PostTLDRSummary({
  post,
  children,
}: PostTLDRSummaryProps): ReactElement {
  return (
    <TLDRSummary>
      <span>{post.summary}</span>
      {children}
    </TLDRSummary>
  );
}
