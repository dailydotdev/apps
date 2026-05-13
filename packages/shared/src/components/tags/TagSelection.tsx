import type { ReactElement, ReactNode } from 'react';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames';
import type { QueryFilters } from '@tanstack/react-query';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import useFeedSettings from '../../hooks/useFeedSettings';
import { RequestKey, generateQueryKey } from '../../lib/query';
import type { TagsData } from '../../graphql/feedSettings';
import { useAuthContext } from '../../contexts/AuthContext';
import { GET_ONBOARDING_TAGS_QUERY } from '../../graphql/feedSettings';
import { useConditionalFeature } from '../../hooks/useConditionalFeature';
import {
  featureOnboardingPersonas,
  featureOnboardingTagRecommender,
} from '../../lib/featureManagement';
import { disabledRefetch, getRandomNumber } from '../../lib/func';
import useDebounceFn from '../../hooks/useDebounceFn';
import type { FilterOnboardingProps } from '../onboarding/FilterOnboarding';
import useTagAndSource from '../../hooks/useTagAndSource';
import { useRecommendedTags } from '../../hooks/useRecommendedTags';
import { Origin } from '../../lib/log';
import { REQUIRED_TAGS_THRESHOLD } from '../onboarding/common';
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
import {
  broadcastPersonaSelection,
  subscribeRecommendRequest,
} from '../onboarding/onboardingPopBus';

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

    return onboardingTags
      .map((item) => item.name)
      .filter((name): name is string => !!name);
  }, [onboardingTags]);

  const recommendedTagsRef = useRef<Set<string>>(new Set());
  const [recommendedNames, setRecommendedNames] = useState<Set<string>>(
    new Set(),
  );

  const selectedTagsRef = useRef<Set<string>>(selectedTags);
  useEffect(() => {
    selectedTagsRef.current = selectedTags;
  }, [selectedTags]);

  const manualClickCounterRef = useRef<number>(0);
  const RECOMMEND_THROTTLE = 10;

  const curatedNamesRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (onboardingTagsRaw && curatedNamesRef.current.size === 0) {
      onboardingTagsRaw.forEach((tag) => {
        if (tag.name) {
          curatedNamesRef.current.add(tag.name);
        }
      });
    }
  }, [onboardingTagsRaw]);

  const [manualSelectCount, setManualSelectCount] = useState(0);
  const [curatedHidden, setCuratedHidden] = useState(false);
  useEffect(() => {
    if (!curatedHidden && manualSelectCount >= REQUIRED_TAGS_THRESHOLD) {
      setCuratedHidden(true);
    }
  }, [curatedHidden, manualSelectCount]);

  const [exitingTags, setExitingTags] = useState<Set<string>>(new Set());
  const [removedTags, setRemovedTags] = useState<Set<string>>(new Set());

  // When the curated baseline crosses the threshold, mark unselected curated
  // tags as exiting so they can play the fade-out animation.
  useEffect(() => {
    if (!curatedHidden) {
      return;
    }
    setExitingTags((prev) => {
      let next = prev;
      curatedNamesRef.current.forEach((name) => {
        if (
          !selectedTags.has(name) &&
          !removedTags.has(name) &&
          !next.has(name)
        ) {
          if (next === prev) {
            next = new Set(prev);
          }
          next.add(name);
        }
      });
      return next;
    });
  }, [curatedHidden, selectedTags, removedTags]);

  const handleTagExited = useCallback((tagName: string) => {
    setExitingTags((prev) => {
      if (!prev.has(tagName)) {
        return prev;
      }
      const next = new Set(prev);
      next.delete(tagName);
      return next;
    });
    setRemovedTags((prev) => {
      if (prev.has(tagName)) {
        return prev;
      }
      const next = new Set(prev);
      next.add(tagName);
      return next;
    });
  }, []);

  const { mutate: recommendTags } = useRecommendedTags({
    onboardingTagsQueryKey,
    excludedTags,
    recommendedRef: recommendedTagsRef,
    selectedRef: selectedTagsRef,
    useTagRecommenderMutation: shouldUseTagRecommender,
    user,
    feedId,
    onRecommended: (names) => {
      setRecommendedNames(new Set(names));
    },
    onFreshRecommendations: (names) => {
      if (names.length) {
        broadcastPersonaSelection(names);
      }
    },
    onEvicting: (names) => {
      setExitingTags((prev) => {
        let next = prev;
        names.forEach((name) => {
          if (next.has(name)) {
            return;
          }
          if (next === prev) {
            next = new Set(prev);
          }
          next.add(name);
        });
        return next;
      });
    },
  });

  useEffect(() => {
    return subscribeRecommendRequest((tags) => {
      recommendTags({ seeds: tags });
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

      setManualSelectCount((count) => count + 1);
      const clickIndex = manualClickCounterRef.current;
      manualClickCounterRef.current = clickIndex + 1;
      // New recommendations always fetch and add to the screen. The
      // eviction sweep — removing previously-shown recommendations the
      // user didn't pick — only runs every Nth click.
      const shouldEvict =
        clickIndex > 0 && clickIndex % RECOMMEND_THROTTLE === 0;
      recommendTags({
        seeds: [tagName],
        anchorTag: tagName,
        evictPrevious: shouldEvict,
      });

      await onFollowTags({ tags: [tagName] });
    } else {
      await onUnfollowTags({ tags: [tagName] });
    }

    if (onClickTag) {
      onClickTag({ tag, action: isSelected ? 'unfollow' : 'follow' });
    }

    refetchFeed();
  };

  const tags = searchQuery ? searchTags : onboardingTags;
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
            if (removedTags.has(tagName)) {
              return null;
            }
            const isSelected = selectedTags.has(tagName);
            const isExiting = exitingTags.has(tagName);
            renderedTags[tagName] = true;

            return (
              <TagElement
                key={`tag-${tagName}`}
                tag={tag}
                onClick={handleClickTag}
                isSelected={isSelected}
                isHighlighted={!searchQuery && recommendedNames.has(tagName)}
                isExiting={isExiting}
                onExited={handleTagExited}
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
