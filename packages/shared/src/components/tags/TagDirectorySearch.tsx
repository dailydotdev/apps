import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import classNames from 'classnames';
import { SearchField } from '../fields/SearchField';
import { ShellField } from '../shell/ShellField';
import { getTagPageLink } from '../../lib/links';
import useDebounceFn from '../../hooks/useDebounceFn';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import Link from '../utilities/Link';

interface TagDirectorySearchProps {
  // Reports the (debounced, trimmed) query so the directory below can filter
  // live as the user types.
  onQueryChange: (query: string) => void;
  recommendedTags?: string[];
  className?: string;
}

export function TagDirectorySearch({
  onQueryChange,
  recommendedTags = [],
  className,
}: TagDirectorySearchProps): ReactElement {
  const router = useRouter();
  const [inputValue, setInputValue] = useState('');
  const [debouncedReport] = useDebounceFn((value?: string) => {
    onQueryChange((value ?? '').trim());
  }, 150);
  // The phone's field keeps what was typed in the address, so a reload or
  // a shared link opens the same list.
  const [debouncedAddress] = useDebounceFn((value?: string) => {
    const query = (value ?? '').trim();
    router.replace(
      { pathname: router.pathname, query: query ? { q: query } : {} },
      undefined,
      { shallow: true, scroll: false },
    );
  }, 300);

  const onValueChange = (value: string): void => {
    setInputValue(value);
    debouncedReport(value);
  };

  const addressQuery =
    router?.isReady && typeof router.query.q === 'string' ? router.query.q : '';
  useEffect(() => {
    if (addressQuery) {
      setInputValue(addressQuery);
      onQueryChange(addressQuery.trim());
    }
    // The address seeds the field once; typing owns it from there.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addressQuery]);

  return (
    <div className={classNames('flex w-full flex-col gap-3', className)}>
      <SearchField
        className="hidden tablet:flex"
        inputId="tag-directory-search"
        placeholder="Search all tags"
        value={inputValue}
        valueChanged={onValueChange}
        aria-label="Search all tags"
        autoComplete="off"
      />
      <ShellField
        placeholder="Search tags"
        value={inputValue}
        onChange={(value) => {
          onValueChange(value);
          debouncedAddress(value);
        }}
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
