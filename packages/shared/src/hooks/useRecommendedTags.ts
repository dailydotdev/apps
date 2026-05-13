import type { MutableRefObject } from 'react';
import type { QueryKey, UseMutationResult } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { gqlClient } from '../graphql/common';
import type {
  AllTagCategoriesData,
  Tag,
  TagsData,
} from '../graphql/feedSettings';
import {
  GET_RECOMMENDED_TAGS_QUERY,
  ONBOARDING_RECOMMEND_TAGS_MUTATION,
} from '../graphql/feedSettings';
import type { LoggedUser } from '../lib/user';
import { getFeedSettingsQueryKey } from './useFeedSettings';

export interface RecommendTagsArgs {
  /**
   * One or more seed tag names. Each seed triggers an independent
   * `recommendedTags` query in parallel; results are deduped and merged.
   */
  seeds: string[];
  /**
   * If set and present in the cache, recommendations are spliced after
   * this tag. Used by manual single-tag clicks. Persona fan-outs leave
   * it undefined and the recommendations are appended.
   */
  anchorTag?: string;
  /**
   * When true, the previous recommendation batch (minus anything now
   * selected) is evicted from the screen with a fade-out. When false
   * (the default), new recommendations are added on top of the
   * existing ones — adding is immediate, eviction is deferred.
   */
  evictPrevious?: boolean;
}

export interface UseRecommendedTagsArgs {
  onboardingTagsQueryKey: QueryKey;
  excludedTags: string[];
  /** Cap on the visible recommendations after dedupe. Default: 8. */
  limit?: number;
  recommendedRef: MutableRefObject<Set<string>>;
  /**
   * Names that are currently selected by the user. Tags in this set are
   * never evicted, even if a new recommendation batch supersedes them.
   */
  selectedRef?: MutableRefObject<Set<string>>;
  /**
   * When set, the hook routes through ONBOARDING_RECOMMEND_TAGS_MUTATION
   * (sending the current selection as a single payload) instead of the
   * per-tag fan-out against GET_RECOMMENDED_TAGS_QUERY. Used by the
   * onboarding tag recommender experiment.
   */
  useTagRecommenderMutation?: boolean;
  /** User + feedId for the cache lookup the recommender mutation needs. */
  user?: LoggedUser;
  feedId?: string;
  /**
   * Called with the full accumulated recommendation set after each
   * mutation — drives `recommendedNames` state for highlighting.
   */
  onRecommended?: (tagNames: string[]) => void;
  /**
   * Called with only the freshly-fetched recommendation names (the
   * additions in this mutation), not the accumulated set. Drives the
   * pop/spark animation so previously-shown tags don't re-pop.
   */
  onFreshRecommendations?: (tagNames: string[]) => void;
  /**
   * Called before the new batch is committed, with the names from the
   * previous batch that should now play their fade-out animation.
   */
  onEvicting?: (tagNames: string[]) => void;
}

export type UseRecommendedTagsResult = UseMutationResult<
  Set<string>,
  Error,
  RecommendTagsArgs
>;

export function useRecommendedTags({
  onboardingTagsQueryKey,
  excludedTags,
  limit = 12,
  recommendedRef,
  selectedRef,
  useTagRecommenderMutation = false,
  user,
  feedId,
  onRecommended,
  onFreshRecommendations,
  onEvicting,
}: UseRecommendedTagsArgs): UseRecommendedTagsResult {
  const queryClient = useQueryClient();

  return useMutation<Set<string>, Error, RecommendTagsArgs>({
    mutationFn: async ({ seeds, anchorTag, evictPrevious = false }) => {
      const uniqueSeeds = Array.from(new Set(seeds.filter(Boolean)));
      if (!uniqueSeeds.length) {
        return new Set();
      }

      const excludedSet = new Set(excludedTags);
      const dedupedNames = new Set<string>();
      const dedupedTags: Tag[] = [];

      if (useTagRecommenderMutation) {
        // Onboarding tag recommender experiment: send the current
        // selection as one payload and trust the backend's ranking.
        const cached = queryClient.getQueryData<AllTagCategoriesData>(
          getFeedSettingsQueryKey(user, feedId),
        );
        const currentSelection = cached?.feedSettings?.includeTags ?? [];
        const seedNames = new Set(uniqueSeeds);
        const selectedForMutation = new Set([
          ...currentSelection,
          ...uniqueSeeds,
        ]);
        const result = await gqlClient.request<{
          onboardingRecommendTags: { tags: string[] };
        }>(ONBOARDING_RECOMMEND_TAGS_MUTATION, {
          selectedTags: Array.from(selectedForMutation),
          n: limit,
        });

        result.onboardingRecommendTags.tags.forEach((name) => {
          if (
            name &&
            !dedupedNames.has(name) &&
            !excludedSet.has(name) &&
            !seedNames.has(name) &&
            !recommendedRef.current.has(name) &&
            dedupedTags.length < limit
          ) {
            dedupedNames.add(name);
            dedupedTags.push({ name });
          }
        });
      } else {
        const responses = await Promise.all(
          uniqueSeeds.map((seed) =>
            gqlClient.request<{ recommendedTags: TagsData }>(
              GET_RECOMMENDED_TAGS_QUERY,
              { tags: [seed], excludedTags },
            ),
          ),
        );

        // Round-robin across the per-seed responses so every seed
        // contributes before any one seed's later results are picked up.
        // This avoids a single sub-cluster dominating the recommendations
        // for personas whose tags overlap heavily (e.g., AI/ML).
        const responseTagLists = responses.map(
          (response) => response.recommendedTags.tags,
        );
        const maxResultsPerSeed = responseTagLists.reduce(
          (max, tags) => Math.max(max, tags.length),
          0,
        );
        for (let rank = 0; rank < maxResultsPerSeed; rank += 1) {
          for (
            let seedIdx = 0;
            seedIdx < responseTagLists.length;
            seedIdx += 1
          ) {
            if (dedupedTags.length >= limit) {
              break;
            }
            const tag = responseTagLists[seedIdx][rank];
            if (
              tag?.name &&
              !dedupedNames.has(tag.name) &&
              !excludedSet.has(tag.name) &&
              !recommendedRef.current.has(tag.name)
            ) {
              dedupedNames.add(tag.name);
              dedupedTags.push(tag);
            }
          }
          if (dedupedTags.length >= limit) {
            break;
          }
        }
      }

      if (evictPrevious) {
        const previousRecommendations = Array.from(recommendedRef.current);
        const selectedNow = selectedRef?.current ?? new Set<string>();
        const evicting = previousRecommendations.filter(
          (name) => !dedupedNames.has(name) && !selectedNow.has(name),
        );
        if (evicting.length) {
          onEvicting?.(evicting);
        }
      }

      queryClient.setQueryData<TagsData>(onboardingTagsQueryKey, (current) => {
        if (!current) {
          return current;
        }

        const freshTags = dedupedTags.filter(
          (tag) =>
            tag.name &&
            !current.tags.some((existing) => existing.name === tag.name),
        );

        if (!freshTags.length) {
          return current;
        }

        const insertIndex = anchorTag
          ? current.tags.findIndex((tag) => tag.name === anchorTag)
          : -1;

        if (insertIndex >= 0) {
          return {
            tags: [
              ...current.tags.slice(0, insertIndex + 1),
              ...freshTags,
              ...current.tags.slice(insertIndex + 1),
            ],
          };
        }

        return { tags: [...current.tags, ...freshTags] };
      });

      if (evictPrevious) {
        recommendedRef.current.clear();
      }
      dedupedNames.forEach((name) => recommendedRef.current.add(name));
      onRecommended?.(Array.from(recommendedRef.current));
      onFreshRecommendations?.(Array.from(dedupedNames));
      return dedupedNames;
    },
  });
}
