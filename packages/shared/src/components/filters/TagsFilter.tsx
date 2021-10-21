import React, {
  ReactElement,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useQuery, useQueryClient } from 'react-query';
import request from 'graphql-request';
import { SearchField } from '../fields/SearchField';
import { apiUrl } from '../../lib/config';
import AuthContext from '../../contexts/AuthContext';
import {
  getSearchTagsQueryKey,
  getTagsSettingsQueryKey,
  getTagsFiltersQueryKey,
} from '../../hooks/useMutateFilters';
import {
  SearchTagsData,
  SEARCH_TAGS_QUERY,
  ALL_TAG_CATEGORIES_QUERY,
  AllTagCategoriesData,
} from '../../graphql/feedSettings';
import TagButton from './TagButton';
import TagCategoryDropdown from './TagCategoryDropdown';

export default function TagsFilter(): ReactElement {
  const searchRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState<string>(null);
  const { user } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const filtersKey = getTagsFiltersQueryKey(user);
  const searchKey = getSearchTagsQueryKey(query);

  const {
    data: { tagsCategories, feedSettings } = {},
    isLoading: isLoadingQuery,
  } = useQuery<AllTagCategoriesData>(filtersKey, () =>
    request(`${apiUrl}/graphql`, ALL_TAG_CATEGORIES_QUERY, {
      loggedIn: !!user?.id,
    }),
  );

  const { data: searchResults } = useQuery<SearchTagsData>(
    searchKey,
    () => request(`${apiUrl}/graphql`, SEARCH_TAGS_QUERY, { query }),
    {
      enabled: query?.length > 0,
    },
  );

  useEffect(() => {
    if (user && feedSettings) {
      queryClient.setQueryData(getTagsSettingsQueryKey(user), {
        feedSettings,
      });
    }
  }, [feedSettings, user]);

  const followedTags = useMemo(() => {
    return feedSettings?.includeTags ?? [];
  }, [feedSettings]);

  return (
    <div aria-busy={isLoadingQuery}>
      <div className="px-6 pb-6">
        <SearchField
          inputId="search-filters"
          placeholder="Search"
          className="mb-6 "
          ref={searchRef}
          valueChanged={setQuery}
        />
        {query?.length > 0 ? (
          <>
            {searchResults?.searchTags.tags.map((tag) => (
              <TagButton
                followedTags={followedTags}
                key={tag.name}
                tag={tag.name}
              />
            ))}
          </>
        ) : (
          <>
            <h3 className="mb-3 typo-headline">Choose tags to follow</h3>
            <p className="typo-callout text-theme-label-tertiary">
              Let’s super-charge your feed with relevant content! Start by
              choosing tags you want to follow, and we will curate your feed
              accordingly.
            </p>
          </>
        )}
      </div>
      {(!query || query.length <= 0) &&
        tagsCategories?.categories.map((tagCategory) => (
          <TagCategoryDropdown
            key={tagCategory.id}
            tagCategory={tagCategory}
            followedTags={followedTags}
          />
        ))}
    </div>
  );
}
