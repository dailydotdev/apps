import { Post } from '../../graphql/posts';
import React, { ReactElement } from 'react';
import { getTooltipProps } from '../../lib/tooltip';
import Link from 'next/link';
import classNames from 'classnames';

export default function SourceButton({
  post,
  className,
  tooltipPosition = 'down',
}: {
  post: Post;
  className?: string;
  tooltipPosition?: 'up' | 'down' | 'left' | 'right';
}): ReactElement {
  return (
    <Link href={`/sources/${post.source.id}`} prefetch={false}>
      <a
        {...getTooltipProps(post.source.name, { position: tooltipPosition })}
        className={classNames('flex cursor-pointer', className)}
      >
        <img
          src={post.source.image}
          alt={post.source.name}
          className="w-6 h-6 rounded-full bg-theme-bg-tertiary"
        />
      </a>
    </Link>
  );
}
