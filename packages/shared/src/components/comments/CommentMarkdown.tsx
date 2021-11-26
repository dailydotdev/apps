import React, { ReactElement } from 'react';
import { sanitize } from 'dompurify';
import styles from './comments.module.css';

export default function CommentMarkdown({
  children,
}: {
  children: string;
}): ReactElement {
  return (
    <div
      className={styles.markdown}
      dangerouslySetInnerHTML={{ __html: sanitize(children) }}
    />
  );
}
