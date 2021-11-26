import React, { CSSProperties, ReactElement } from 'react';
import classNames from 'classnames';
import { Post } from '../../graphql/posts';
import { TooltipPosition } from '../tooltips/BaseTooltipContainer';
import { LinkWithTooltip } from '../tooltips/LinkWithTooltip';

export default function SourceButton({
  post,
  className,
  style,
  tooltipPosition = 'bottom',
}: {
  post: Post;
  className?: string;
  style?: CSSProperties;
  tooltipPosition?: TooltipPosition;
}): ReactElement {
  return (
    <LinkWithTooltip
      href={`${process.env.NEXT_PUBLIC_WEBAPP_URL}sources/${post.source.id}`}
      prefetch={false}
      tooltip={{ content: post.source.name, placement: tooltipPosition }}
    >
      <a className={classNames('flex cursor-pointer', className)} style={style}>
        <img
          src={post.source.image}
          alt={post.source.name}
          className="w-6 h-6 rounded-full bg-theme-bg-tertiary"
        />
      </a>
    </LinkWithTooltip>
  );
}
