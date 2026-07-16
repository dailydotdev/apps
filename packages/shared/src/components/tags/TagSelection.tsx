import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import type { QueryFilters } from '@tanstack/react-query';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import useFeedSettings, {
  getFeedSettingsQueryKey,
} from '../../hooks/useFeedSettings';
import { RequestKey, generateQueryKey } from '../../lib/query';
import type {
  AllTagCategoriesData,
  TagsData,
} from '../../graphql/feedSettings';
import { useAuthContext } from '../../contexts/AuthContext';
import {
  GET_ONBOARDING_TAGS_QUERY,
  GET_RECOMMENDED_TAGS_QUERY,
  ONBOARDING_RECOMMEND_TAGS_MUTATION,
} from '../../graphql/feedSettings';
import { useConditionalFeature } from '../../hooks/useConditionalFeature';
import {
  featureOnboardingPersonas,
  featureOnboardingTagRecommender,
} from '../../lib/featureManagement';
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
import { FunnelTargetId } from '../../features/onboarding/types/funnelEvents';
import { subscribeRecommendRequest } from '../onboarding/onboardingPopBus';

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
  // Tag names to pin to the front of the (otherwise shuffled) list, e.g. for a
  // campaign funnel that wants cloud-related tags surfaced first. Missing tags
  // are prepended so they always appear.
  featuredTags?: string[];
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
  featuredTags,
}: TagSelectionProps): ReactElement {
  const [isShuffled, setIsShuffled] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuthContext();
  const { feedSettings } = useFeedSettings({ feedId });
  const selectedTags = useMemo(() => {
    return new Set(feedSettings?.includeTags || []);
  }, [feedSettings?.includeTags]);
  const { value: isTagRecommenderEnabled } = useConditionalFeature({
    feature: featureOnboardingTagRecommender,
    shouldEvaluate: origin === Origin.Onboarding,
  });
  // Personas always use the recswipe-backed recommender; ops doesn't need
  // to enroll users in both experiments.
  const { value: isPersonasEnabled } = useConditionalFeature({
    feature: featureOnboardingPersonas,
    shouldEvaluate: origin === Origin.Onboarding,
  });
  const shouldUseTagRecommender = isTagRecommenderEnabled || isPersonasEnabled;
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

  // Pin funnel-specified tags to the front (preserving their given order);
  // prepend any that aren't in the fetched set so they still appear first.
  const orderedTags = useMemo(() => {
    if (!onboardingTags || !featuredTags?.length) {
      return onboardingTags;
    }

    const featuredSet = new Set(featuredTags);
    const featuredFirst = featuredTags.map(
      (name) => onboardingTags.find((item) => item.name === name) ?? { name },
    );
    const rest = onboardingTags.filter(
      (item) => !item.name || !featuredSet.has(item.name),
    );

    return [...featuredFirst, ...rest];
  }, [onboardingTags, featuredTags]);

  const { mutate: recommendTags, data: recommendedTags } = useMutation({
    mutationFn: async ({ tag }: Pick<OnSelectTagProps, 'tag'>) => {
      const tagName = tag.name;
      if (!tagName) {
        return new Set<string>();
      }

      let recommended: TagsData['tags'];

      if (shouldUseTagRecommender) {
        // Read the freshest selection from the cache rather than the closure-bound
        // memo: collaborative-filtering quality depends on an accurate input set.
        // onFollowTags runs after recommendTags, so the just-clicked tag isn't
        // yet in the cache. Append it to satisfy the [String!]! min-1 constraint.
        const cached = queryClient.getQueryData<AllTagCategoriesData>(
          getFeedSettingsQueryKey(user, feedId),
        );
        const currentSelection = cached?.feedSettings?.includeTags ?? [];
        const selectedForMutation = currentSelection.includes(tagName)
          ? currentSelection
          : [...currentSelection, tagName];

        const result = await gqlClient.request<{
          onboardingRecommendTags: { tags: string[] };
        }>(ONBOARDING_RECOMMEND_TAGS_MUTATION, {
          selectedTags: selectedForMutation,
          n: 10,
        });

        recommended = result.onboardingRecommendTags.tags.map((name) => ({
          name,
        }));
      } else {
        const result = await gqlClient.request<{
          recommendedTags: TagsData;
        }>(GET_RECOMMENDED_TAGS_QUERY, {
          tags: [tagName],
          excludedTags,
        });
        recommended = result.recommendedTags.tags;
      }

      const recommendedTagsSet = new Set(
        recommended
          .map((item) => item.name)
          .filter((name): name is string => !!name),
      );

      queryClient.setQueryData<TagsData>(onboardingTagsQueryKey, (current) => {
        if (!current) {
          return current;
        }
        const existingNames = new Set(current.tags.map((item) => item.name));
        const newRecommended = recommended.filter(
          (item) => item.name && !existingNames.has(item.name),
        );

        if (!newRecommended.length) {
          return current;
        }

        const newTags = [...current.tags];
        const insertIndex = newTags.findIndex((item) => item.name === tagName);

        newTags.splice(insertIndex + 1, 0, ...newRecommended);

        return {
          tags: newTags,
        };
      });

      return recommendedTagsSet;
    },
  });

  useEffect(() => {
    return subscribeRecommendRequest((tags) => {
      tags.forEach((tagName) => {
        if (tagName) {
          recommendTags({ tag: { name: tagName } });
        }
      });
    });
  }, [recommendTags]);

  const handleClickTag = async ({ tag }: Pick<OnSelectTagProps, 'tag'>) => {
    const tagName = tag.name;
    if (!tagName) {
      return;
    }
    const isSearchMode = !!searchQuery;
    const isSelected = selectedTags.has(tagName);

    if (!isSelected) {
      if (isSearchMode) {
        queryClient.setQueryData<TagsData>(
          onboardingTagsQueryKey,
          (current) => {
            if (!current) {
              return current;
            }
            if (!excludedTags.includes(tagName)) {
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

      await onFollowTags({ tags: [tagName] });
    } else {
      await onUnfollowTags({ tags: [tagName] });
    }

    if (onClickTag) {
      onClickTag({ tag, action: isSelected ? 'unfollow' : 'follow' });
    }

    refetchFeed();
  };

  const tags = searchQuery ? searchTags : orderedTags;
  const renderedTags: Record<string, boolean> = {};

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
            if (!tag.name) {
              return null;
            }
            const tagName = tag.name;
            const isSelected = selectedTags.has(tagName);
            renderedTags[tagName] = true;

            return (
              <TagElement
                key={`tag-${tagName}`}
                tag={tag}
                onClick={handleClickTag}
                isSelected={isSelected}
                isHighlighted={!searchQuery && !!recommendedTags?.has(tagName)}
                data-funnel-track={FunnelTargetId.FeedTag}
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
