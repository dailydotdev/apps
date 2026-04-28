import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import { Origin } from '../../lib/log';
import { TagSelection } from '../tags/TagSelection';
import useDebounceFn from '../../hooks/useDebounceFn';
import { useTagSearch } from '../../hooks/useTagSearch';
import { useViewSize, ViewSize } from '../../hooks/useViewSize';
import { SearchField } from '../fields/SearchField';

interface EditTagProps {
  headline?: string;
  headlineClassName?: string;
}
export const EditTag = ({
  headline,
  headlineClassName,
}: EditTagProps): ReactElement => {
  const isMobile = useViewSize(ViewSize.MobileL);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onSearch] = useDebounceFn((value?: string) => {
    setSearchQuery(value ?? '');
  }, 350);

  const { data: searchResult } = useTagSearch({
    value: searchQuery,
    origin: Origin.EditTag,
  });
  const searchTags = searchResult?.searchTags.tags || [];

  return (
    <>
      <h2
        className={classNames(
          'text-center font-bold',
          headlineClassName ?? 'typo-large-title',
        )}
      >
        {headline || 'Pick tags that are relevant to you'}
      </h2>
      <TagSelection
        className="mt-10 max-w-4xl"
        searchElement={
          <SearchField
            aria-label="Pick tags that are relevant to you"
            autoFocus={!isMobile}
            className="mb-10 w-full tablet:max-w-xs"
            inputId="search-filters"
            placeholder="Search javascript, php, git, etc…"
            valueChanged={onSearch}
          />
        }
        searchQuery={searchQuery}
        searchTags={searchTags}
      />
    </>
  );
};
