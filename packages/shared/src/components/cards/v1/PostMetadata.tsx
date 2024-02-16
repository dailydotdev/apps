import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { Separator } from '../common';
import PostDate from './PostDate';

export interface PostMetadataProps {
  className?: string;
  topLabel?: ReactElement | string;
  bottomLabel?: ReactElement | string;
  createdAt?: string;
}

export default function PostMetadata({
  className,
  createdAt,
  topLabel,
  bottomLabel,
}: PostMetadataProps): ReactElement {
  return (
    <div className={classNames('grid items-center', className)}>
      {topLabel && (
        <div className="line-clamp-1 font-bold typo-footnote">{topLabel}</div>
      )}
      <div className="line-clamp-1 flex items-center text-theme-label-tertiary typo-footnote">
        {bottomLabel}
        {!!bottomLabel && !!createdAt && <Separator />}
        {!!createdAt && <PostDate createdAt={createdAt} />}
      </div>
    </div>
  );
}
