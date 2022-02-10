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
        'p-0 m-0 theme-label-primary multi-truncate break-words whitespace-pre-wrap typo-callout tablet:flex-1 tablet:mr-6',
        styles.commentContent,
      )}
    />
  );
}

export const CommentTime = classed(
  'time',
  'mt-2 text-theme-label-tertiary typo-subhead tablet:mt-0',
);
