import React, { ReactElement, useMemo } from 'react';
import classNames from 'classnames';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
import { disabledRefetch, getRandomNumber } from '../../lib/func';
import { Button, ButtonColor, ButtonVariant } from '../buttons/Button';
import { AlertColor, AlertDot } from '../AlertDot';
import { SearchField } from '../fields/SearchField';
import useDebounce from '../../hooks/useDebounce';
import { useTagSearch } from '../../hooks';
import type { FilterOnboardingProps } from './FilterOnboarding';
import useTagAndSource from '../../hooks/useTagAndSource';
import { Origin } from '../../lib/analytics';
import { ElementPlaceholder } from '../ElementPlaceholder';

type OnSelectTagProps = {
  tag: Tag;
};

const tagsSelector = (data: TagsData) => data?.tags || [];

const [minPlaceholder, maxPlaceholder] = [2, 10];
const placeholderTags = new Array(24)
  .fill(null)
  .map(
    (_, index) =>
      new Array(getRandomNumber(minPlaceholder, maxPlaceholder)).join('-') +
      index,
  );

export function FilterOnboardingV4({
  shouldUpdateAlerts = true,
  className,
}: FilterOnboardingProps): ReactElement {
  const queryClient = useQueryClient();

  const { feedSettings } = useFeedSettings();
  const selectedTags = useMemo(() => {
    return new Set(feedSettings?.includeTags || []);
  }, [feedSettings?.includeTags]);
  const { onFollowTags, onUnfollowTags } = useTagAndSource({
    origin: Origin.Onboarding,
    shouldUpdateAlerts,
  });

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
  const { data: onboardingTags, isLoading } = useQuery(
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
    origin: Origin.EditTag,
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
            if (!excludedTags.includes(tag.name)) {
              return {
                ...current,
                tags: [...current.tags, tag],
              };
            }

            return current;
          },
        );
      }

      recommendTags({ tag });

      await onFollowTags({ tags: [tag.name] });
    } else {
      await onUnfollowTags({ tags: [tag.name] });
    }

    refetchFeed();
  };

  const tags = searchQuery && !isSearchLoading ? searchTags : onboardingTags;

  return (
    <div className={classNames(className, 'flex w-full flex-col items-center')}>
      <SearchField
        inputId="search-filters"
        placeholder="javascript, php, git, etc…"
        className="mb-10 w-full max-w-xs"
        valueChanged={onSearch}
      />
      <div className="flex flex-row flex-wrap justify-center gap-4">
        {isLoading &&
          placeholderTags.map((item) => (
            <ElementPlaceholder key={item} className="btn btn-tag h-10">
              <span className="invisible">{item}</span>
            </ElementPlaceholder>
          ))}
        {!isLoading &&
          tags?.map((tag) => {
            const isSelected = selectedTags.has(tag.name);
            return (
              <Button
                key={tag.name}
                className={classNames(
                  {
                    'btn-tag': !isSelected,
                  },
                  'relative',
                )}
                variant={
                  isSelected ? ButtonVariant.Primary : ButtonVariant.Float
                }
                color={isSelected ? ButtonColor.Cabbage : undefined}
                onClick={() => {
                  onClickTag({ tag });
                }}
              >
                {tag.name}
                {!searchQuery && !!recommendedTags?.has(tag.name) && (
                  <AlertDot
                    className="absolute right-1 top-1"
                    color={AlertColor.Cabbage}
                  />
                )}
              </Button>
            );
          })}
      </div>
    </div>
  );
}
