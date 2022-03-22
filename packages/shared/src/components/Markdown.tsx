import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { sanitize } from 'dompurify';
import styles from './markdown.module.css';

interface MarkdownProps {
  content: string;
  className?: string;
}

export default function Markdown({
  content,
  className,
}: MarkdownProps): ReactElement {
  return (
    <div
      className={classNames(styles.markdown, className)}
      dangerouslySetInnerHTML={{
        __html: sanitize(content, { ADD_ATTR: ['target'] }),
      }}
    />
  );
}
