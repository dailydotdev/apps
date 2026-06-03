import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import { SearchField } from '../fields/SearchField';
import { getTagPageLink } from '../../lib/links';
import useDebounceFn from '../../hooks/useDebounceFn';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import Link from '../utilities/Link';

interface ExploreTopicSearchProps {
  // Reports the (debounced, trimmed) query so the directory below can filter
  // live as the user types.
  onQueryChange: (query: string) => void;
  recommendedTags?: string[];
  className?: string;
}

export function ExploreTopicSearch({
  onQueryChange,
  recommendedTags = [],
  className,
}: ExploreTopicSearchProps): ReactElement {
  const [inputValue, setInputValue] = useState('');
  const [debouncedReport] = useDebounceFn((value?: string) => {
    onQueryChange((value ?? '').trim());
  }, 150);

  const onValueChange = (value: string): void => {
    setInputValue(value);
    debouncedReport(value);
  };

  return (
    <div className={classNames('flex w-full flex-col gap-3', className)}>
      <SearchField
        inputId="explore-topic-search"
        placeholder="Search all topics"
        value={inputValue}
        valueChanged={onValueChange}
        aria-label="Search all topics"
        autoComplete="off"
      />
      {!inputValue && recommendedTags.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            Recommended:
          </Typography>
          {recommendedTags.map((tag) => (
            <Link key={tag} href={getTagPageLink(tag)} passHref>
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
