import type { ReactElement } from 'react';
import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import classNames from 'classnames';
import { SearchField } from '../fields/SearchField';
import { TagChip } from '../tags/TagChip';
import { gqlClient } from '../../graphql/common';
import { SEARCH_TAGS_QUERY } from '../../graphql/feedSettings';
import { StaleTime } from '../../lib/query';
import { getExploreTagPageLink } from '../../lib/links';
import useDebounceFn from '../../hooks/useDebounceFn';
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

export function ExploreTopicSearch({
  followedTags,
  recommendedTags = [],
  className,
}: ExploreTopicSearchProps): ReactElement {
  const [inputValue, setInputValue] = useState('');
  const [query, setQuery] = useState('');
  const [debouncedSetQuery] = useDebounceFn((value?: string) => {
    setQuery((value ?? '').trim());
  }, 300);

  const onValueChange = (value: string): void => {
    setInputValue(value);
    debouncedSetQuery(value);
  };

  const { data, isFetching } = useQuery({
    queryKey: ['exploreSearchTags', query],
    queryFn: () =>
      gqlClient.request<SearchTagsResult>(SEARCH_TAGS_QUERY, { query }),
    enabled: query.length > 1,
    staleTime: StaleTime.OneHour,
  });

  const results = useMemo(
    () => data?.searchTags?.tags?.map((tag) => tag.name) ?? [],
    [data],
  );

  const hasQuery = query.length > 1;
  const showEmpty = hasQuery && !isFetching && results.length === 0;

  return (
    <div className={classNames('flex w-full flex-col gap-4', className)}>
      <SearchField
        inputId="explore-topic-search"
        placeholder="Search all topics"
        value={inputValue}
        valueChanged={onValueChange}
        aria-label="Search all topics"
      />
      {hasQuery && (
        <div className="flex flex-wrap justify-center gap-2">
          {results.map((tag) => (
            <TagChip
              key={tag}
              tag={tag}
              size="md"
              isFollowed={followedTags.has(tag)}
              link={getExploreTagPageLink(tag)}
            />
          ))}
          {showEmpty && (
            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Tertiary}
            >
              No topics found for “{query}”.
            </Typography>
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
