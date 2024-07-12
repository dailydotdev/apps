import React, { ReactElement, useMemo } from 'react';
import classNames from 'classnames';
import {
  QueryFilters,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import useFeedSettings from '../../hooks/useFeedSettings';
import { RequestKey, generateQueryKey } from '../../lib/query';
import {
  GET_ONBOARDING_TAGS_QUERY,
  GET_RECOMMENDED_TAGS_QUERY,
  TagsData,
} from '../../graphql/feedSettings';
import { disabledRefetch, getRandomNumber } from '../../lib/func';
import { SearchField } from '../fields/SearchField';
import useDebounce from '../../hooks/useDebounce';
import { useTagSearch } from '../../hooks';
import type { FilterOnboardingProps } from './FilterOnboarding';
import useTagAndSource from '../../hooks/useTagAndSource';
import { Origin } from '../../lib/log';
import { ElementPlaceholder } from '../ElementPlaceholder';
import { OnSelectTagProps } from './common';
import { OnboardingTag } from './OnboardingTag';
import { gqlClient } from '../../graphql/common';

const tagsSelector = (data: TagsData) => data?.tags || [];

const [minPlaceholder, maxPlaceholder] = [6, 12];
const placeholderTags = new Array(24)
  .fill(null)
  .map(
    (_, index) =>
      new Array(getRandomNumber(minPlaceholder, maxPlaceholder)).join('-') +
      index,
  );

export type FilterOnboardingV4Props = {
  onClickTag?: ({ tag, action }: OnSelectTagProps) => void;
  origin?: Origin;
  searchOrigin?: Origin;
} & Omit<FilterOnboardingProps, 'onSelectedTopics'>;

export function FilterOnboardingV4({
  shouldUpdateAlerts = true,
  className,
  shouldFilterLocally,
  feedId,
  onClickTag,
  origin = Origin.Onboarding,
  searchOrigin = Origin.EditTag,
}: FilterOnboardingV4Props): ReactElement {
  const queryClient = useQueryClient();

  const { feedSettings } = useFeedSettings({ feedId });
  const selectedTags = useMemo(() => {
    return new Set(feedSettings?.includeTags || []);
  }, [feedSettings?.includeTags]);
  const { onFollowTags, onUnfollowTags } = useTagAndSource({
    origin,
    shouldUpdateAlerts,
    feedId,
    shouldFilterLocally,
  });

  const [refetchFeed] = useDebounce(() => {
    const feedQueryKey = [RequestKey.FeedPreview];
    const feedQueryKeyPredicate: QueryFilters['predicate'] = (query) => {
      return !query.queryKey.includes(RequestKey.FeedPreviewCustom);
    };

    queryClient.cancelQueries({
      queryKey: feedQueryKey,
      predicate: feedQueryKeyPredicate,
    });
    queryClient.invalidateQueries({
      queryKey: feedQueryKey,
      predicate: feedQueryKeyPredicate,
    });
  }, 1000);

  const onboardingTagsQueryKey = generateQueryKey(
    RequestKey.Tags,
    undefined,
    'onboardingTags',
    feedId,
  );

  const { data: onboardingTags, isLoading } = useQuery(
    onboardingTagsQueryKey,
    async () => {
      const result = await gqlClient.request<{
        onboardingTags: TagsData;
      }>(GET_ONBOARDING_TAGS_QUERY, {});

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
    origin: searchOrigin,
  });
  const searchTags = searchResult?.searchTags.tags || [];

  const { mutate: recommendTags, data: recommendedTags } = useMutation(
    async ({ tag }: Pick<OnSelectTagProps, 'tag'>) => {
      const result = await gqlClient.request<{
        recommendedTags: TagsData;
      }>(GET_RECOMMENDED_TAGS_QUERY, {
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

  const handleClickTag = async ({ tag }: Pick<OnSelectTagProps, 'tag'>) => {
    const isSearchMode = !!searchQuery;
    const isSelected = selectedTags.has(tag.name);

    if (!isSelected) {
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

    if (onClickTag) {
      onClickTag({ tag, action: isSelected ? 'unfollow' : 'follow' });
    }

    refetchFeed();
  };

  const tags = searchQuery && !isSearchLoading ? searchTags : onboardingTags;
  const renderedTags = {};

  return (
    <div className={classNames(className, 'flex w-full flex-col items-center')}>
      <SearchField
        inputId="search-filters"
        placeholder="javascript, php, git, etc…"
        className="mb-10 w-full tablet:max-w-xs"
        valueChanged={onSearch}
      />
      <div className="flex flex-row flex-wrap justify-center gap-4">
        {isLoading &&
          placeholderTags.map((item) => (
            <ElementPlaceholder
              key={item}
              className="btn btn-tag h-10 rounded-12"
            >
              <span className="invisible">{item}</span>
            </ElementPlaceholder>
          ))}
        {!isLoading &&
          tags?.map((tag) => {
            const isSelected = selectedTags.has(tag.name);
            renderedTags[tag.name] = true;

            return (
              <OnboardingTag
                key={`tag-${tag.name}`}
                tag={tag}
                onClick={handleClickTag}
                isSelected={isSelected}
                isHighlighted={!searchQuery && !!recommendedTags?.has(tag.name)}
              />
            );
          })}
        {/* render leftover tags not rendered in initial recommendations but selected */}
        {!isLoading &&
          !searchQuery &&
          feedSettings?.includeTags?.map((tag) => {
            if (renderedTags[tag]) {
              return null;
            }

            return (
              <OnboardingTag
                key={`feed-settings-${tag}`}
                tag={{ name: tag }}
                onClick={handleClickTag}
                isSelected
              />
            );
          })}
      </div>
    </div>
  );
}
