import React, { ReactElement, useEffect, useRef, useState } from 'react';
import HashtagIcon from '@dailydotdev/shared/icons/hashtag.svg';
import LinkIcon from '@dailydotdev/shared/icons/link.svg';
import { IconsSwitch } from '@dailydotdev/shared/src/components/fields/IconsSwitch';
import { SearchField } from '@dailydotdev/shared/src/components/fields/SearchField';
import TagsFilter from './TagsFilter';
import SourcesFilter from './SourcesFilter';

export default function FeedFilters({
  enableQueries = true,
}: {
  enableQueries?: boolean;
}): ReactElement {
  const searchRef = useRef<HTMLDivElement>(null);
  const [showSources, setShowSources] = useState(false);
  const [query, setQuery] = useState<string>(null);

  useEffect(() => {
    const input = searchRef.current?.querySelector('input') as HTMLInputElement;
    input.value = '';
    input.dispatchEvent(new Event('input'));
  }, [showSources]);

  return (
    <div className="flex flex-col">
      <IconsSwitch
        inputId="icons-switch"
        name="icons-switch"
        leftIcon={HashtagIcon}
        rightIcon={LinkIcon}
        checked={showSources}
        className="self-center my-6"
        onToggle={() => setShowSources(!showSources)}
      />
      <SearchField
        inputId="search-filters"
        placeholder="Search"
        valueChanged={setQuery}
        className="mx-6"
        ref={searchRef}
      />
      {showSources ? (
        <SourcesFilter query={query} enableQueries={enableQueries} />
      ) : (
        <TagsFilter query={query} enableQueries={enableQueries} />
      )}
    </div>
  );
}
