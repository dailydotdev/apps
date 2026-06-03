import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Post } from '../../../graphql/posts';

interface SharedLinkContainerProps {
  children: ReactNode;
  post?: Post;
  summary?: string;
  className?: string;
  Wrapper?: React.ComponentType<{ children: ReactNode }>;
}

export function SharedLinkContainer({
  children,
  post,
  summary,
  className,
  Wrapper,
}: SharedLinkContainerProps): ReactElement {
  const postSummary = post?.summary ? (
    <div className="mb-4 overflow-hidden px-4 text-text-secondary">
      <p
        className="select-text break-words typo-markdown"
        data-testid="tldr-container"
      >
        {post.summary}
      </p>
    </div>
  ) : null;

  return (
    <div
      className={classNames(
        'flex flex-col rounded-16 border border-border-subtlest-tertiary hover:border-border-subtlest-secondary',
        className,
      )}
    >
      {children}
      {Wrapper && summary ? <Wrapper>{postSummary}</Wrapper> : postSummary}
    </div>
  );
}
