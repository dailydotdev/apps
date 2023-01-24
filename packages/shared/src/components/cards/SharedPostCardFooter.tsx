import classNames from 'classnames';
import React, { ReactElement } from 'react';
import { Post } from '../../graphql/posts';

type SharedPostCardFooterProps = {
  isShort: boolean;
} & Pick<Post, 'sharedPost'>;

export const SharedPostCardFooter = ({
  sharedPost,
  isShort,
}: SharedPostCardFooterProps): ReactElement => {
  return (
    <div
      className={classNames(
        'flex flex-1 gap-2 p-3 mb-2 rounded-12 border border-theme-divider-tertiary',
        isShort ? 'flex-row items-center' : 'flex-col',
      )}
    >
      <span
        className={classNames(
          'typo-footnote text-theme-label-secondary',
          isShort ? 'line-clamp-4 flex-1' : 'line-clamp-2',
        )}
      >
        {sharedPost.title}
      </span>
      <div
        className={classNames(
          'rounded-xl',
          isShort ? 'h-full aspect-square' : 'flex-1',
        )}
        style={{ background: `url(${sharedPost.image}) center center / cover` }}
      />
    </div>
  );
};
