import React, { ReactElement, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import { SearchField } from '../../fields/SearchField';
import { useViewSize, ViewSize } from '../../../hooks';
import useDebounceFn from '../../../hooks/useDebounceFn';
import { useSourceSearch } from '../../../hooks/useSourceSearch';
import { Origin } from '../../../lib/log';
import { gqlClient } from '../../../graphql/common';
import { disabledRefetch } from '../../../lib/func';
import { generateQueryKey, RequestKey } from '../../../lib/query';
import { ONBOARDING_SOURCES_QUERY, Source } from '../../../graphql/sources';
import { ElementPlaceholder } from '../../ElementPlaceholder';
import { ProfileImageSize, ProfilePicture } from '../../ProfilePicture';
import { PlusIcon, VIcon } from '../../icons';
import { IconSize } from '../../Icon';
import useFeedSettings from '../../../hooks/useFeedSettings';
import useTagAndSource from '../../../hooks/useTagAndSource';

const placeholderSources = new Array(5).fill(null).map((_, index) => index);

export const Sources = (): ReactElement => {
  const isMobile = useViewSize(ViewSize.MobileL);

  const [searchQuery, setSearchQuery] = React.useState<string>();
  const [onSearch] = useDebounceFn(setSearchQuery, 200);

  const { feedSettings } = useFeedSettings();

  const { onFollowSource, onUnfollowSource } = useTagAndSource({
    origin: Origin.Onboarding,
  });

  const selectedTags = feedSettings?.includeTags || [];

  const selectedSources = useMemo(() => {
    return feedSettings?.includeSources.map(({ id }) => id);
  }, [feedSettings?.includeSources]);

  const onToggleSource = useCallback(
    (source) => {
      if (selectedSources?.includes(source.id)) {
        onUnfollowSource({ source });
      } else {
        onFollowSource({ source });
      }
    },
    [onFollowSource, onUnfollowSource, selectedSources],
  );

  const { data: searchResult, isPending: isPendingSearch } = useSourceSearch({
    value: searchQuery,
  });

  const { data: onboardingSources, isPending } = useQuery({
    queryKey: generateQueryKey(RequestKey.OnboardingSources),

    queryFn: async () => {
      const result = await gqlClient.request<{
        sourceRecommendationByTags: Source[];
      }>(ONBOARDING_SOURCES_QUERY, { tags: selectedTags });

      return result.sourceRecommendationByTags;
    },
    ...disabledRefetch,
    staleTime: Infinity,
  });

  const sources = searchQuery ? searchResult : onboardingSources;

  const SourceTag = ({ source }: { source: Source }): ReactElement => {
    const checked = selectedSources?.includes(source.id);
    return (
      <div
        key={source.id}
        className={classNames(
          'flex w-full rounded-12 p-px',
          checked
            ? 'bg-gradient-to-b from-accent-onion-subtlest to-accent-cabbage-default'
            : 'bg-transparent',
        )}
      >
        <div className="w-full rounded-11 bg-background-default">
          <button
            type="button"
            className={classNames(
              'flex w-full gap-2 rounded-11 bg-surface-float px-3 py-2',
              checked
                ? undefined
                : 'hover:bg-surface-hover active:bg-surface-active',
            )}
            onClick={() => onToggleSource(source)}
          >
            <ProfilePicture
              size={ProfileImageSize.Medium}
              rounded="full"
              className="mt-2"
              user={{
                id: source.id,
                image: source.image,
                username: source.handle,
              }}
              nativeLazyLoading
            />
            <div className="flex-1 text-left">
              <Typography
                type={TypographyType.Title3}
                bold
                color={TypographyColor.Primary}
              >
                {source.name}
              </Typography>
              <Typography
                type={TypographyType.Body}
                color={TypographyColor.Secondary}
              >
                {source.handle}
              </Typography>
              <Typography
                type={TypographyType.Body}
                color={TypographyColor.Tertiary}
                className="multi-truncate line-clamp-2"
              >
                {source.description}
              </Typography>
            </div>
            <div className="mr-2 flex size-8 items-center justify-center self-center">
              {checked ? (
                <VIcon
                  className="text-brand-default"
                  size={IconSize.Small}
                  secondary
                />
              ) : (
                <PlusIcon size={IconSize.Small} />
              )}
            </div>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex w-full max-w-screen-laptop flex-col items-center tablet:px-10">
      <Typography
        type={TypographyType.LargeTitle}
        bold
        className="mb-10 text-center"
      >
        Things you would care to follow
      </Typography>
      <div className="w-full max-w-[35rem]">
        <SearchField
          aria-label="Pick tags that are relevant to you"
          autoFocus={!isMobile}
          className="mb-10 w-full"
          inputId="search-filters"
          placeholder="TechCrunch, Hacker News, GitHub, etc"
          valueChanged={onSearch}
        />
        <div
          role="list"
          aria-busy={isPending}
          className="flex flex-row flex-wrap justify-center gap-4"
        >
          {isPending &&
            placeholderSources.map((item) => (
              <ElementPlaceholder key={item} className="h-16 w-full rounded-12">
                <span className="invisible">{item}</span>
              </ElementPlaceholder>
            ))}
          {!isPending && !sources?.length && (
            <Typography
              type={TypographyType.Body}
              color={TypographyColor.Secondary}
              className="text-center"
            >
              No sources found
            </Typography>
          )}
          {!isPending &&
            sources?.map((source) => (
              <SourceTag source={source} key={source.id} />
            ))}
          {/* render leftover tags not rendered in initial recommendations but selected */}
          {!isPending &&
            !searchQuery &&
            feedSettings?.includeSources?.map((source) => {
              if (sources.find(({ id }) => id === source.id)) {
                return null;
              }

              return <SourceTag source={source} key={source.id} />;
            })}
        </div>
      </div>
    </div>
  );
};
