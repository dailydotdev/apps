import React, { CSSProperties, ReactElement } from 'react';
import { sanitize } from 'dompurify';
import classNames from 'classnames';
import styles from './markdown.module.css';

interface MarkdownProps {
  content: string;
  style?: CSSProperties;
  className?: string;
}

export default function Markdown({
  content,
  style,
  className,
}: MarkdownProps): ReactElement {
  return (
    <div
      className={classNames(styles.markdown, className)}
      style={style}
      dangerouslySetInnerHTML={{
        __html: sanitize(content, { ADD_ATTR: ['target'] }),
      }}
    />
  );
}
