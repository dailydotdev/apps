import classNames from 'classnames';
import type { ReactElement } from 'react';
import React from 'react';

interface PostTopicChipsProps {
  topics: string[];
  className?: string;
}

export const PostTopicChips = ({
  topics,
  className,
}: PostTopicChipsProps): ReactElement | null => {
  if (!topics.length) {
    return null;
  }

  return (
    <div className={classNames('flex flex-wrap gap-2', className)}>
      {topics.map((topic) => (
        <span
          className="rounded-8 bg-surface-float px-2.5 py-1 text-text-secondary typo-footnote"
          key={topic}
        >
          {topic}
        </span>
      ))}
    </div>
  );
};
