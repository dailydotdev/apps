import type { ReactElement, ReactNode } from 'react';
import React, { useMemo, useState } from 'react';
import classNames from 'classnames';
import type { QueryFilters } from '@tanstack/react-query';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import useFeedSettings from '../../hooks/useFeedSettings';
import { RequestKey, generateQueryKey } from '../../lib/query';
import type { TagsData } from '../../graphql/feedSettings';
import {
  GET_ONBOARDING_TAGS_QUERY,
  GET_RECOMMENDED_TAGS_QUERY,
} from '../../graphql/feedSettings';
import { disabledRefetch, getRandomNumber } from '../../lib/func';
import useDebounceFn from '../../hooks/useDebounceFn';
import type { FilterOnboardingProps } from '../onboarding/FilterOnboarding';
import useTagAndSource from '../../hooks/useTagAndSource';
import { Origin } from '../../lib/log';
import { ElementPlaceholder } from '../ElementPlaceholder';
import type { OnboardingTagProps } from './TagElement';
import { TagElement as TagElementDefault } from './TagElement';
import { gqlClient } from '../../graphql/common';
import type { OnSelectTagProps } from './common';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';

const tagsSelector = (data: TagsData) => data?.tags || [];

const [minPlaceholder, maxPlaceholder] = [6, 12];
const placeholderTags = new Array(24)
  .fill(null)
  .map(
    (_, index) =>
      new Array(getRandomNumber(minPlaceholder, maxPlaceholder)).join('-') +
      index,
  );

export type TagSelectionProps = {
  onClickTag?: ({ tag, action }: OnSelectTagProps) => void;
  origin?: Origin;
  searchOrigin?: Origin;
  searchElement?: ReactNode;
  searchQuery?: string;
  searchTags?: TagsData['tags'];
  TagElement?: React.ComponentType<OnboardingTagProps>;
  classNameTags?: string;
} & Omit<FilterOnboardingProps, 'onSelectedTopics'>;

export function TagSelection({
  shouldUpdateAlerts = true,
  className,
  classNameTags,
  shouldFilterLocally,
  feedId,
  onClickTag,
  origin = Origin.Onboarding,
  searchElement,
  searchQuery,
  searchTags,
  TagElement = TagElementDefault,
}: TagSelectionProps): ReactElement {
  const [isShuffled, setIsShuffled] = useState(false);
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

  const [refetchFeed] = useDebounceFn(() => {
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

  const { data: onboardingTagsRaw, isPending } = useQuery({
    queryKey: onboardingTagsQueryKey,

    queryFn: async () => {
      const result = await gqlClient.request<{
        onboardingTags: TagsData;
      }>(GET_ONBOARDING_TAGS_QUERY, {});

      return result.onboardingTags;
    },
    ...disabledRefetch,
    staleTime: Infinity,
    select: tagsSelector,
  });

  const onboardingTags = useMemo(() => {
    if (isShuffled || !onboardingTagsRaw) {
      return onboardingTagsRaw;
    }

    setIsShuffled(true);
    return onboardingTagsRaw?.sort(() => Math.random() - 0.5);
  }, [isShuffled, onboardingTagsRaw]);

  const excludedTags = useMemo(() => {
    if (!onboardingTags) {
      return [];
    }

    return [...onboardingTags.map((item) => item.name)];
  }, [onboardingTags]);

  const { mutate: recommendTags, data: recommendedTags } = useMutation({
    mutationFn: async ({ tag }: Pick<OnSelectTagProps, 'tag'>) => {
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
  });

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

  const tags = searchQuery ? searchTags : onboardingTags;
  const renderedTags = {};

  return (
    <div className={classNames(className, 'flex w-full flex-col items-center')}>
      {searchElement}
      <div
        role="list"
        aria-busy={isPending}
        className={classNames(
          classNameTags,
          'flex flex-row flex-wrap justify-center gap-4',
        )}
      >
        {isPending &&
          placeholderTags.map((item) => (
            <ElementPlaceholder
              key={item}
              className="btn btn-tag h-10 rounded-12"
            >
              <span className="invisible">{item}</span>
            </ElementPlaceholder>
          ))}
        {!isPending && !tags?.length && (
          <Typography
            type={TypographyType.Body}
            color={TypographyColor.Secondary}
            className="text-center"
          >
            No tags found
          </Typography>
        )}
        {!isPending &&
          tags?.map((tag) => {
            const isSelected = selectedTags.has(tag.name);
            renderedTags[tag.name] = true;

            return (
              <TagElement
                key={`tag-${tag.name}`}
                tag={tag}
                onClick={handleClickTag}
                isSelected={isSelected}
                isHighlighted={!searchQuery && !!recommendedTags?.has(tag.name)}
              />
            );
          })}
        {/* render leftover tags not rendered in initial recommendations but selected */}
        {!isPending &&
          !searchQuery &&
          feedSettings?.includeTags?.map((tag) => {
            if (renderedTags[tag]) {
              return null;
            }

            return (
              <TagElement
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
