import type { ReactElement } from 'react';
import React, { forwardRef } from 'react';
import type { Post } from '../../graphql/posts';
import { formatDate, TimeFormatType } from '../../lib/dateFormat';
import { SnapshotFrame } from './SnapshotFrame';
import { SnapshotContent } from './SnapshotContent';

interface PostSnapshotCardProps {
  post: Post;
  seed?: string;
}

function PostSnapshotCardComponent(
  { post, seed }: PostSnapshotCardProps,
  ref: React.Ref<HTMLDivElement>,
): ReactElement {
  const meta = [
    post.createdAt &&
      formatDate({ value: post.createdAt, type: TimeFormatType.Post }),
    post.readTime && `${post.readTime}m read time`,
    post.domain,
  ].filter(Boolean) as string[];

  return (
    // The summary is the reason to share a post, so the frame grows to carry
    // all of it rather than clamping it to the square.
    <SnapshotFrame grow ref={ref} seed={seed ?? post.id}>
      <SnapshotContent
        bodyLines={0}
        titleLines={0}
        avatar={
          post.source?.name
            ? { src: post.source.image, name: post.source.name }
            : undefined
        }
        body={post.summary}
        meta={meta}
        title={post.title ?? ''}
      />
    </SnapshotFrame>
  );
}

export const PostSnapshotCard = forwardRef(PostSnapshotCardComponent);
