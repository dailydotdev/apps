import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { RenderMarkdownProps } from '../RenderMarkdown';
import { RenderMarkdown } from '../RenderMarkdown';
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
