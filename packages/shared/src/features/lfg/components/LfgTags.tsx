import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';

// Tags read as their normalized value, like everywhere else on daily.dev
// (#ai, #education-technology), not the humanized title.
export const getLfgTagLabel = (tag: string): string => `#${tag}`;

export const LfgTagList = ({
  tags,
  className,
}: {
  tags: string[];
  className?: string;
}): ReactElement | null => {
  if (!tags.length) {
    return null;
  }

  // max-w-full: flex items don't shrink by default (base.css), so without it
  // the list keeps its one-line width and runs out of narrow containers.
  return (
    <ul className={classNames('flex max-w-full flex-wrap gap-1', className)}>
      {tags.map((tag) => (
        <li
          key={tag}
          className="rounded-8 border border-border-subtlest-tertiary px-2 py-0.5 text-text-tertiary typo-caption1"
        >
          {getLfgTagLabel(tag)}
        </li>
      ))}
    </ul>
  );
};
