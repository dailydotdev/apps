import React, { ReactElement } from 'react';
import { sanitize } from 'dompurify';
import styles from './markdown.module.css';

export default function Markdown({
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
