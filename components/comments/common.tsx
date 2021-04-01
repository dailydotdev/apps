import React, { ReactElement } from 'react';
import Linkify from 'linkifyjs/react';
import classed from '../../lib/classed';
import styles from '../../styles/comments.module.css';

export const CommentPublishDate = classed(
  'time',
  'text-theme-label-tertiary typo-callout',
);

export const commentBoxClassNames = `py-3 px-4 bg-theme-bg-secondary rounded-lg whitespace-pre-wrap break-words typo-callout ${styles.commentBox}`;

const StyledLinkfy = classed(Linkify, commentBoxClassNames);

export const CommentBox = (props?: unknown): ReactElement => (
  <StyledLinkfy
    tagName="div"
    options={{ attributes: { rel: 'noopener nofollow' } }}
    {...props}
  />
);
