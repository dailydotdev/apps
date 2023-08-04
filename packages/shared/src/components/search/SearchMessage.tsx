import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { RenderMarkdown } from '../RenderMarkdown';
import styles from './SearchMessage.module.css';

export type SearchMessageProps = {
  className?: string;
  content: string;
  isLoading?: boolean;
};

export const SearchMessage = ({
  className,
  content,
  isLoading = false,
}: SearchMessageProps): ReactElement => {
  return (
    <RenderMarkdown
      className={classNames(className, isLoading && styles.caret)}
      content={content}
    />
  );
};
