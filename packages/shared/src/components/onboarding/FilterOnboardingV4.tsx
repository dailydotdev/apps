import React, { ReactElement, useContext, useMemo } from 'react';
import classNames from 'classnames';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import request from 'graphql-request';
import useFeedSettings from '../../hooks/useFeedSettings';
import { RequestKey, generateQueryKey } from '../../lib/query';
import {
  GET_ONBOARDING_TAGS_QUERY,
  GET_RECOMMENDED_TAGS_QUERY,
  Tag,
  TagsData,
} from '../../graphql/feedSettings';
import { graphqlUrl } from '../../lib/config';
import { disabledRefetch } from '../../lib/func';
import { Button } from '../buttons/Button';
import { AlertColor, AlertDot } from '../AlertDot';
import useMutateFilters from '../../hooks/useMutateFilters';
import AuthContext from '../../contexts/AuthContext';
import { SearchField } from '../fields/SearchField';
import useDebounce from '../../hooks/useDebounce';
import { useTagSearch } from '../../hooks';
import type { FilterOnboardingProps } from './FilterOnboarding';

type OnSelectTagProps = {
  tag: Tag;
};

const tagsSelector = (data: TagsData) => data?.tags || [];

export function FilterOnboardingV4({
  className,
}: FilterOnboardingProps): ReactElement {
  const { user } = useContext(AuthContext);
  const queryClient = useQueryClient();

  const { feedSettings } = useFeedSettings();
  const selectedTags = useMemo(() => {
    return new Set(feedSettings?.includeTags || []);
  }, [feedSettings?.includeTags]);
  const { followTags, unfollowTags } = useMutateFilters(user);

  const [refetchFeed] = useDebounce(() => {
    const feedQueryKey = [RequestKey.FeedPreview];
    queryClient.cancelQueries(feedQueryKey);
    queryClient.invalidateQueries(feedQueryKey);
  }, 1000);

  const onboardingTagsQueryKey = generateQueryKey(
    RequestKey.Tags,
    undefined,
    'onboardingTags',
  );
  const { data: onboardingTags } = useQuery(
    onboardingTagsQueryKey,
    async () => {
      const result = await request<{
        onboardingTags: TagsData;
      }>(graphqlUrl, GET_ONBOARDING_TAGS_QUERY, {});

      return result.onboardingTags;
    },
    {
      ...disabledRefetch,
      staleTime: Infinity,
      select: tagsSelector,
    },
  );
  const excludedTags = useMemo(() => {
    if (!onboardingTags) {
      return [];
    }

    return [...onboardingTags.map((item) => item.name)];
  }, [onboardingTags]);

  const [searchQuery, setSearchQuery] = React.useState<string>();
  const [onSearch] = useDebounce(setSearchQuery, 200);

  const { data: searchResult, isLoading: isSearchLoading } = useTagSearch({
    value: searchQuery,
  });
  const searchTags = searchResult?.searchTags.tags || [];

  const { mutate: recommendTags, data: recommendedTags } = useMutation(
    async ({ tag }: OnSelectTagProps) => {
      const result = await request<{
        recommendedTags: TagsData;
      }>(graphqlUrl, GET_RECOMMENDED_TAGS_QUERY, {
        tags: [tag.name],
        excludedTags,
      });

      const recommendedTagsSet = new Set(
        result.recommendedTags.tags.map((item) => item.name),
      );

      queryClient.setQueryData<TagsData>(onboardingTagsQueryKey, (current) => {
        const newTags = [...current.tags];
        const insertIndex = newTags.findIndex((item) => item.name === tag.name);

        newTags.splice(insertIndex + 1, 0, ...result.recommendedTags.tags);

        return {
          tags: newTags,
        };
      });

      return recommendedTagsSet;
    },
  );

  const onClickTag = async ({ tag }: OnSelectTagProps) => {
    const isSearchMode = !!searchQuery;

    if (!selectedTags.has(tag.name)) {
      if (isSearchMode) {
        queryClient.setQueryData<TagsData>(
          onboardingTagsQueryKey,
          (current) => {
            const newTags = [...current.tags];
            newTags.push(tag);

            return {
              tags: newTags,
            };
          },
        );
      }

      recommendTags({ tag });

      await followTags({ tags: [tag.name] });
    } else {
      await unfollowTags({ tags: [tag.name] });
    }

    refetchFeed();
  };

  const tags = searchQuery && !isSearchLoading ? searchTags : onboardingTags;

  return (
    <div className={classNames(className, 'w-full flex flex-col items-center')}>
      <SearchField
        inputId="search-filters"
        placeholder="Search"
        className="mb-6 max-w-xs"
        valueChanged={onSearch}
      />
      <div className="flex flex-row flex-wrap gap-4 justify-center">
        {tags?.map((tag) => (
          <Button
            key={tag.name}
            className={classNames(
              'btn',
              selectedTags.has(tag.name) ? 'btn-primary-cabbage' : 'btn-tag',
            )}
            onClick={() => {
              onClickTag({ tag });
            }}
          >
            {tag.name}
            {!!recommendedTags?.has(tag.name) && (
              <AlertDot
                className="absolute top-1 right-1"
                color={AlertColor.Cabbage}
              />
            )}
          </Button>
        ))}
      </div>
    </div>
  );
}
