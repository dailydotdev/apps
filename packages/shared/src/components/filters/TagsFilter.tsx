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
import ArrowIcon from '../../../icons/arrow.svg';
import { Button } from '../buttons/Button';
import PlusIcon from '../../../icons/plus.svg';
import { apiUrl } from '../../lib/config';
import AuthContext from '../../contexts/AuthContext';
import useMutateFilters, {
  getSearchTagsQueryKey,
  getTagsSettingsQueryKey,
  getTagsFiltersQueryKey,
} from '../../hooks/useMutateFilters';
import {
  SearchTagsData,
  SEARCH_TAGS_QUERY,
  ALL_TAG_CATEGORIES_QUERY,
} from '../../graphql/feedSettings';

export default function TagsFilter(): ReactElement {
  const searchRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState<string>(null);
  const { user, showLogin } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const filtersKey = getTagsFiltersQueryKey(user);
  const searchKey = getSearchTagsQueryKey(query);
  const { followTags, unfollowTags } = useMutateFilters(user);

  const { data: { tagsCategories, feedSettings } = {} } = useQuery(
    filtersKey,
    () =>
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
    return feedSettings?.includeTags;
  }, [feedSettings]);

  const onFollow = async (tags: Array<string>): Promise<void> => {
    if (!user) {
      showLogin('filter');
      return;
    }

    // trackEvent({
    //   category: 'Tags',
    //   action: 'Toggle',
    //   label: 'Check',
    // });
    await followTags({ tags });
  };

  const onUnfollow = async (tags: Array<string>): Promise<void> => {
    // trackEvent({
    //   category: 'Tags',
    //   action: 'Toggle',
    //   label: 'Uncheck',
    // });
    await unfollowTags({ tags });
  };

  const CategoryButton = ({ category }) => {
    let action = () => onFollow(category.tags);
    let btnText = 'Follow all';
    let btnClass = 'btn-primary';

    const tagMatches = category?.tags.filter(
      (tag) => followedTags.indexOf(tag) !== -1,
    );

    if (tagMatches.length > 0) {
      action = () => onUnfollow(tagMatches);
      btnText = `Clear (${tagMatches.length})`;
      btnClass = 'btn-secondary';
    }

    return (
      <Button onClick={action} className={btnClass}>
        {btnText}
      </Button>
    );
  };

  const TagButton = ({ tag }) => {
    let action = () => onFollow([tag]);
    let btnClasses = 'btn-tag';
    let iconClasses = 'rotate-0';
    if (followedTags.includes(tag)) {
      action = () => onUnfollow([tag]);
      btnClasses = 'btn-primary';
      iconClasses = 'rotate-45';
    }

    return (
      <Button
        className={`mb-3 mr-3 font-bold ${btnClasses} typo-callout`}
        onClick={action}
        rightIcon={
          <PlusIcon
            className={`ml-2 transition-transform text-xl transform icon ${iconClasses}`}
          />
        }
      >
        #{tag}
      </Button>
    );
  };

  return (
    <div>
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
              <TagButton key={tag.name} tag={tag.name} />
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
          <details
            key={tagCategory.id}
            className="p-6 border-t border-b border-theme-divider-tertiary right-icon"
          >
            <summary className="flex justify-between items-center">
              <div className="flex items-center">
                <ArrowIcon className="mr-2 text-xl transition-transform transform rotate-90 icon text-theme-label-tertiary" />{' '}
                <span className="mr-3 typo-title1">{tagCategory.emoji}</span>{' '}
                <h4 className="font-bold typo-callout">{tagCategory.title}</h4>{' '}
              </div>
              <CategoryButton category={tagCategory} />
            </summary>
            <div className="flex flex-wrap py-6 pt-8">
              {tagCategory.tags.map((tag) => (
                <TagButton key={tag} tag={tag} />
              ))}
            </div>
          </details>
        ))}
    </div>
  );
}
