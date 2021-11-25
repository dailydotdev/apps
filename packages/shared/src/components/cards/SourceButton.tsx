import React, { CSSProperties, ReactElement, useRef } from 'react';
import Link from 'next/link';
import classNames from 'classnames';
import { Post } from '../../graphql/posts';
import { TooltipPosition } from '../tooltips/BaseTooltipContainer';
import { BaseTooltip, getShouldLoadTooltip } from '../tooltips/BaseTooltip';

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
  const sourceRef = useRef();

  return (
    <>
      {getShouldLoadTooltip() && (
        <BaseTooltip
          placement={tooltipPosition}
          content={post.source.name}
          reference={sourceRef}
        />
      )}
      <Link
        href={`${process.env.NEXT_PUBLIC_WEBAPP_URL}sources/${post.source.id}`}
        prefetch={false}
      >
        <a
          className={classNames('flex cursor-pointer', className)}
          style={style}
          aria-label={post.source.name}
          ref={sourceRef}
        >
          <img
            src={post.source.image}
            alt={post.source.name}
            className="w-6 h-6 rounded-full bg-theme-bg-tertiary"
          />
        </a>
      </Link>
    </>
  );
}
