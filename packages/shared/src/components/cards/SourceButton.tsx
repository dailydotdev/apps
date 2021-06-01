import { Post } from '../../graphql/posts';
import React, { CSSProperties, ReactElement } from 'react';
import { getTooltipProps } from '../../lib/tooltip';
import Link from 'next/link';
import classNames from 'classnames';

export default function SourceButton({
  post,
  className,
  style,
  tooltipPosition = 'down',
}: {
  post: Post;
  className?: string;
  style?: CSSProperties;
  tooltipPosition?: 'up' | 'down' | 'left' | 'right';
}): ReactElement {
  return (
    <Link
      href={`${process.env.NEXT_PUBLIC_WEBAPP_URL}sources/${post.source.id}`}
      prefetch={false}
    >
      <a
        {...getTooltipProps(post.source.name, { position: tooltipPosition })}
        className={classNames('flex cursor-pointer', className)}
        style={style}
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
