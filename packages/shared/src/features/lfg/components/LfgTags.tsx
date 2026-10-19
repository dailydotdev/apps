import type { ReactElement } from 'react';
import React, { useCallback } from 'react';
import classNames from 'classnames';
import { useQuery } from '@tanstack/react-query';
import { tagTitlesQueryOptions } from '../../../graphql/keywords';

// Tags render the backend title or the raw value, never a casing of ours.
export const useLfgTagLabel = (): ((tag: string) => string) => {
  const { data: tagTitles } = useQuery(tagTitlesQueryOptions());

  return useCallback(
    (tag: string) => tagTitles?.[tag] ?? `#${tag}`,
    [tagTitles],
  );
};

export const LfgTagList = ({
  tags,
  className,
}: {
  tags: string[];
  className?: string;
}): ReactElement => {
  const getLabel = useLfgTagLabel();

  return (
    <ul className={classNames('flex flex-wrap gap-1', className)}>
      {tags.map((tag) => (
        <li
          key={tag}
          className="rounded-8 border border-border-subtlest-tertiary px-2 py-0.5 text-text-tertiary typo-caption1"
        >
          {getLabel(tag)}
        </li>
      ))}
    </ul>
  );
};
