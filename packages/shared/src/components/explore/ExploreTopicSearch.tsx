import type { KeyboardEvent, ReactElement } from 'react';
import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import classNames from 'classnames';
import { SearchField } from '../fields/SearchField';
import { TagChip } from '../tags/TagChip';
import { gqlClient } from '../../graphql/common';
import { SEARCH_TAGS_QUERY } from '../../graphql/feedSettings';
import { StaleTime } from '../../lib/query';
import { getExploreTagPageLink } from '../../lib/links';
import useDebounceFn from '../../hooks/useDebounceFn';
import { ElementPlaceholder } from '../ElementPlaceholder';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import Link from '../utilities/Link';

interface SearchTagsResult {
  searchTags: { query: string; tags: { name: string }[] };
}

interface ExploreTopicSearchProps {
  followedTags: Set<string>;
  recommendedTags?: string[];
  className?: string;
}

// Autocomplete kicks in at 3 characters — short enough to feel responsive,
// long enough to avoid noisy single/double-letter matches.
const MIN_QUERY_LENGTH = 3;
const SKELETON_WIDTHS = ['w-20', 'w-16', 'w-24', 'w-20', 'w-28'];

export function ExploreTopicSearch({
  followedTags,
  recommendedTags = [],
  className,
}: ExploreTopicSearchProps): ReactElement {
  const router = useRouter();
  const [inputValue, setInputValue] = useState('');
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const [debouncedSetQuery] = useDebounceFn((value?: string) => {
    setQuery((value ?? '').trim());
  }, 300);

  const onValueChange = (value: string): void => {
    setInputValue(value);
    debouncedSetQuery(value);
  };

  const hasQuery = query.length >= MIN_QUERY_LENGTH;

  const { data, isFetching } = useQuery({
    queryKey: ['exploreSearchTags', query],
    queryFn: () =>
      gqlClient.request<SearchTagsResult>(SEARCH_TAGS_QUERY, { query }),
    enabled: hasQuery,
    staleTime: StaleTime.OneHour,
  });

  const results = useMemo(
    () => data?.searchTags?.tags?.map((tag) => tag.name) ?? [],
    [data],
  );

  // Reset the keyboard cursor whenever the result set changes.
  useEffect(() => {
    setActiveIndex(-1);
  }, [results]);

  const showEmpty = hasQuery && !isFetching && results.length === 0;
  const showSkeleton = hasQuery && isFetching && results.length === 0;

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (!results.length) {
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((prev) => (prev + 1) % results.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((prev) => (prev <= 0 ? results.length - 1 : prev - 1));
    } else if (event.key === 'Enter') {
      const target = results[activeIndex] ?? results[0];
      if (target) {
        event.preventDefault();
        router.push(getExploreTagPageLink(target));
      }
    }
  };

  return (
    <div className={classNames('flex w-full flex-col gap-4', className)}>
      <SearchField
        inputId="explore-topic-search"
        placeholder="Search all topics"
        value={inputValue}
        valueChanged={onValueChange}
        onKeyDown={onKeyDown}
        aria-label="Search all topics"
        aria-expanded={hasQuery && results.length > 0}
        autoComplete="off"
      />
      {showSkeleton && (
        <div className="flex flex-wrap justify-center gap-2" aria-hidden>
          {SKELETON_WIDTHS.map((width, index) => (
            <ElementPlaceholder
              // eslint-disable-next-line react/no-array-index-key
              key={index}
              className={classNames('h-8 rounded-10', width)}
            />
          ))}
        </div>
      )}
      {hasQuery && results.length > 0 && (
        <div role="listbox" className="flex flex-wrap justify-center gap-2">
          {results.map((tag, index) => (
            <TagChip
              key={tag}
              tag={tag}
              size="md"
              isFollowed={followedTags.has(tag)}
              link={getExploreTagPageLink(tag)}
              className={classNames(
                index === activeIndex && 'ring-2 ring-border-subtlest-primary',
              )}
            />
          ))}
        </div>
      )}
      {showEmpty && (
        <div className="flex flex-col items-center gap-2">
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            No topics match “{query}”.
          </Typography>
          {recommendedTags.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Typography
                tag={TypographyTag.Span}
                type={TypographyType.Footnote}
                color={TypographyColor.Tertiary}
              >
                Try a popular topic:
              </Typography>
              {recommendedTags.map((tag) => (
                <TagChip
                  key={tag}
                  tag={tag}
                  size="md"
                  isFollowed={followedTags.has(tag)}
                  link={getExploreTagPageLink(tag)}
                />
              ))}
            </div>
          )}
        </div>
      )}
      {!hasQuery && recommendedTags.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            Recommended:
          </Typography>
          {recommendedTags.map((tag) => (
            <Link key={tag} href={getExploreTagPageLink(tag)} passHref>
              <Typography
                tag={TypographyTag.Link}
                type={TypographyType.Footnote}
                color={TypographyColor.Primary}
                className="cursor-pointer no-underline hover:underline"
              >
                {tag}
              </Typography>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
