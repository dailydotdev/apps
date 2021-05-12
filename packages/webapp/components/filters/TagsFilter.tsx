import React, {
  HTMLAttributes,
  ReactElement,
  useContext,
  useEffect,
  useMemo,
} from 'react';
import AuthContext from '../../../shared/src/contexts/AuthContext';
import { useQuery, useQueryClient } from 'react-query';
import {
  ALL_TAGS_AND_SETTINGS_QUERY,
  ALL_TAGS_QUERY,
  FeedSettingsData,
  SEARCH_TAGS_QUERY,
  SearchTagsData,
  TagsData,
} from '../../graphql/feedSettings';
import request from 'graphql-request';
import { apiUrl } from '@dailydotdev/shared/src/lib/config';
import useMutateFilters, {
  getTagsSettingsQueryKey,
  getTagsFiltersQueryKey,
  getSearchTagsQueryKey,
} from '@dailydotdev/shared/src/hooks/useMutateFilters';
import { trackEvent } from '@dailydotdev/shared/src/lib/analytics';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import { getTooltipProps } from '@dailydotdev/shared/src/lib/tooltip';
import {
  FiltersContainer,
  FiltersPlaceholder,
  FiltersSection,
  FiltersHeadline,
  FiltersList,
  FilterLine,
  GoToFilterButton,
  FilterItem,
  FilterProps,
} from './common';

const Tag = ({
  tag,
  selected,
  onClick,
  ...props
}: {
  tag: string;
  selected?: boolean;
  onClick?: (tag: string) => unknown;
} & Omit<HTMLAttributes<HTMLButtonElement>, 'onClick'>): ReactElement => (
  <FilterItem className="my-2">
    <Button
      buttonSize="small"
      pressed={selected}
      onClick={() => onClick?.(tag)}
      className="btn-secondary"
      {...props}
    >
      #{tag}
    </Button>
    <FilterLine />
    <GoToFilterButton href={`/tags/${tag}`} tooltip={`${tag} feed`} />
  </FilterItem>
);

export default function TagsFilter({
  enableQueries = true,
  query,
}: FilterProps): ReactElement {
  const { user, showLogin, tokenRefreshed } = useContext(AuthContext);
  const enabledSearch = query?.length > 0;
  const queryClient = useQueryClient();

  const filtersKey = getTagsFiltersQueryKey(user);
  const { data: settingsAndTags, isLoading: isLoadingQuery } = useQuery<
    FeedSettingsData & TagsData
  >(
    filtersKey,
    () =>
      request(
        `${apiUrl}/graphql`,
        user ? ALL_TAGS_AND_SETTINGS_QUERY : ALL_TAGS_QUERY,
      ),
    {
      enabled: tokenRefreshed && enableQueries,
    },
  );

  const searchKey = getSearchTagsQueryKey(query);
  const { data: searchResults } = useQuery<SearchTagsData>(
    searchKey,
    () => request(`${apiUrl}/graphql`, SEARCH_TAGS_QUERY, { query: query }),
    {
      enabled: enabledSearch,
    },
  );

  const { followTag, unfollowTag } = useMutateFilters(user);

  const isLoading = isLoadingQuery || !settingsAndTags;

  const allFollowedTags = settingsAndTags?.feedSettings?.includeTags;

  useEffect(() => {
    if (user && settingsAndTags) {
      queryClient.setQueryData(getTagsSettingsQueryKey(user), {
        feedSettings: settingsAndTags.feedSettings,
      });
    }
  }, [settingsAndTags, user]);

  const [availableTags, followedTags] = useMemo(() => {
    const tags = enabledSearch
      ? searchResults?.searchTags.tags
      : settingsAndTags?.tags;
    return (tags ?? []).reduce(
      ([notFollowed, followed], tag) => {
        const isFollowing = allFollowedTags?.indexOf(tag.name) >= 0;
        if (isFollowing) {
          followed.push(tag.name);
        } else {
          notFollowed.push(tag.name);
        }
        return [notFollowed, followed];
      },
      [[], []],
    );
  }, [settingsAndTags, searchResults]);

  const onFollowTag = async (tag: string): Promise<void> => {
    if (!user) {
      showLogin();
      return;
    }

    trackEvent({
      category: 'Tags',
      action: 'Toggle',
      label: 'Check',
    });
    await followTag({ tag });
  };

  const onUnfollowTag = async (tag: string): Promise<void> => {
    trackEvent({
      category: 'Tags',
      action: 'Toggle',
      label: 'Uncheck',
    });
    await unfollowTag({ tag });
  };

  return (
    <FiltersContainer aria-busy={isLoading}>
      {isLoading ? (
        <FiltersPlaceholder />
      ) : (
        <>
          {followedTags?.length > 0 && (
            <FiltersSection>
              <FiltersHeadline className="text-theme-label-primary">
                Tags you follow
              </FiltersHeadline>
              <FiltersList className="-my-2">
                {followedTags.map((tag) => (
                  <Tag
                    tag={tag}
                    selected
                    key={tag}
                    onClick={onUnfollowTag}
                    {...getTooltipProps('Unfollow tag')}
                  />
                ))}
              </FiltersList>
            </FiltersSection>
          )}
          {availableTags?.length > 0 && (
            <FiltersSection>
              <FiltersHeadline className="text-theme-label-tertiary">
                {followedTags?.length > 0
                  ? 'Everything else'
                  : 'Choose tags to follow'}
              </FiltersHeadline>
              <FiltersList className="-my-2">
                {availableTags?.map((tag) => (
                  <Tag
                    tag={tag}
                    key={tag}
                    onClick={onFollowTag}
                    {...getTooltipProps('Follow tag')}
                  />
                ))}
              </FiltersList>
            </FiltersSection>
          )}
        </>
      )}
    </FiltersContainer>
  );
}
