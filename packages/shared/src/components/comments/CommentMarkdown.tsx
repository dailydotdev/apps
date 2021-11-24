import React, { ReactElement } from 'react';
import ReactMarkdown from 'react-markdown';
import styles from './comments.module.css';

export default function CommentMarkdown({
  children,
}: {
  children: string;
}): ReactElement {
  return <ReactMarkdown className={styles.markdown}>{children}</ReactMarkdown>;
}
