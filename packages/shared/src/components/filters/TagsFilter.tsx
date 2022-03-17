import React, {
  ReactElement,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useQuery } from 'react-query';
import request from 'graphql-request';
import { SearchField } from '../fields/SearchField';
import { apiUrl } from '../../lib/config';
import { getSearchTagsQueryKey } from '../../hooks/useMutateFilters';
import { SearchTagsData, SEARCH_TAGS_QUERY } from '../../graphql/feedSettings';
import TagCategoryDropdown from './TagCategoryDropdown';
import { useFeedSettings } from '../../hooks/useFeedSettings';
import TagItemList from './TagItemList';
import TagOptionsMenu from './TagOptionsMenu';
import useTagContext from '../../hooks/useTagContext';
import useTagAndSource, {
  TagActionArguments,
} from '../../hooks/useTagAndSource';
import { FilterMenuProps } from './common';
import MenuIcon from '../../../icons/menu.svg';
import AuthContext from '../../contexts/AuthContext';
import { useMyFeed } from '../../hooks/useMyFeed';

export default function TagsFilter({
  onUnblockItem,
}: FilterMenuProps): ReactElement {
  const searchRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState<string>(null);
  const searchKey = getSearchTagsQueryKey(query);
  const { user } = useContext(AuthContext);
  const { tagsCategories, feedSettings, isLoading } = useFeedSettings(true);
  const { shouldShowMyFeed } = useMyFeed();
  const { contextSelectedTag, setContextSelectedTag, onTagContextOptions } =
    useTagContext();
  const { onFollowTags, onUnfollowTags, onBlockTags, onUnblockTags } =
    useTagAndSource({
      origin: `tags ${query?.length > 0 ? 'search' : 'filter'}`,
    });
  const isTagBlocked = feedSettings?.blockedTags?.some(
    (tag) => tag === contextSelectedTag,
  );

  const { data: searchResults } = useQuery<SearchTagsData>(
    searchKey,
    () => request(`${apiUrl}/graphql`, SEARCH_TAGS_QUERY, { query }),
    {
      enabled: query?.length > 0,
    },
  );

  const { followedTags, blockedTags } = useMemo(() => {
    return {
      followedTags: feedSettings?.includeTags ?? [],
      blockedTags: feedSettings?.blockedTags ?? [],
    };
  }, [feedSettings]);

  const tagUnblockAction = ({ tags: [tag] }: TagActionArguments) => {
    if (shouldShowMyFeed && !user) {
      return onUnblockTags({ tags: [tag] });
    }

    return onUnblockItem({
      tag,
      action: () => onUnblockTags({ tags: [tag] }),
    });
  };
  return (
    <div
      className="flex flex-col"
      aria-busy={isLoading}
      data-testid="tagsFilter"
    >
      <SearchField
        inputId="search-filters"
        placeholder="Search"
        className="mx-6 mb-6"
        ref={searchRef}
        valueChanged={setQuery}
      />
      {query?.length > 0 ? (
        <>
          <TagItemList
            tags={searchResults?.searchTags.tags}
            emptyText="No matching tags."
            tooltip="Options"
            options={onTagContextOptions}
            followedTags={followedTags}
            blockedTags={blockedTags}
            onFollowTags={onFollowTags}
            onUnfollowTags={onUnfollowTags}
            onUnblockTags={tagUnblockAction}
            rowIcon={<MenuIcon />}
          />
          <TagOptionsMenu
            tag={contextSelectedTag}
            onBlock={
              !isTagBlocked &&
              (() => onBlockTags({ tags: [contextSelectedTag] }))
            }
            onUnblock={
              isTagBlocked &&
              (() => onUnblockTags({ tags: [contextSelectedTag] }))
            }
            onHidden={() => setContextSelectedTag(null)}
          />
        </>
      ) : (
        <div className="px-6 pb-6">
          <h3 className="mb-3 typo-headline">Choose tags to follow</h3>
          <p className="typo-callout text-theme-label-tertiary">
            Let’s super-charge your feed with relevant content! Start by
            choosing tags you want to follow, and we will curate your feed
            accordingly.
          </p>
        </div>
      )}
      {(!query || query.length <= 0) &&
        tagsCategories?.map((tagCategory) => (
          <TagCategoryDropdown
            key={tagCategory.id}
            tagCategory={tagCategory}
            followedTags={followedTags}
            blockedTags={blockedTags}
            onFollowTags={onFollowTags}
            onUnfollowTags={onUnfollowTags}
            onUnblockTags={tagUnblockAction}
          />
        ))}
    </div>
  );
}
