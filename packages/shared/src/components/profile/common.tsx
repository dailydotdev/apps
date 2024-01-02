import React, { HTMLAttributes, ReactElement } from 'react';
import classNames from 'classnames';
import classed from '../../lib/classed';
import styles from './common.module.css';

export const EmptyMessage = classed(
  'span',
  'typo-callout text-theme-label-tertiary',
);

export const commentContainerClass =
  'flex py-3 items-start tablet:items-center';

export const CommentContainer = classed('article', commentContainerClass);

export const commentInfoClass =
  'flex flex-col flex-1 ml-4 no-underline tablet:flex-row tablet:items-center';

export function CommentContent({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>): ReactElement {
  return (
    <p
      {...props}
      className={classNames(
        className,
        'theme-label-primary multi-truncate m-0 whitespace-pre-wrap break-words p-0 typo-callout tablet:mr-6 tablet:flex-1',
        styles.commentContent,
      )}
    />
  );
}

export const CommentTime = classed(
  'time',
  'mt-2 text-theme-label-tertiary typo-subhead tablet:mt-0',
);
