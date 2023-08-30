import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { RenderMarkdown, RenderMarkdownProps } from '../RenderMarkdown';
import styles from './SearchMessage.module.css';

export type SearchMessageProps = Pick<
  RenderMarkdownProps,
  'content' | 'className' | 'isLoading'
>;

export const SearchMessage = ({
  className,
  content,
  isLoading = false,
}: SearchMessageProps): ReactElement => {
  return (
    <RenderMarkdown
      className={classNames(className, isLoading && styles.caret)}
      isLoading={isLoading}
      content={content}
    />
  );
};
