import React, { ReactElement, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import { Dropdown } from '../../fields/Dropdown';
import { gqlClient } from '../../../graphql/common';
import {
  SourceCategoryData,
  SOURCE_CATEGORIES_QUERY,
} from '../../../graphql/sources';
import { generateQueryKey, RequestKey } from '../../../lib/query';

interface SquadCategoryDropdownProps {
  initialCategory: string;
  isDisabled: boolean;
  categoryHint?: string;
  onCategoryChange?: (category: string) => void;
}

export function SquadCategoryDropdown({
  initialCategory,
  isDisabled,
  categoryHint,
  onCategoryChange,
}: SquadCategoryDropdownProps): ReactElement {
  const [selected, setSelected] = useState(-1);
  const { data } = useQuery<SourceCategoryData>(
    generateQueryKey(RequestKey.Source, null, 'categories'),
    () => gqlClient.request(SOURCE_CATEGORIES_QUERY),
    { staleTime: Infinity },
  );
  const list = useMemo(
    () => data?.categories?.edges?.map(({ node }) => node),
    [data],
  );

  useEffect(() => {
    if (!list?.length) {
      return;
    }

    const index = list.findIndex(({ id }) => id === initialCategory);

    if (index === -1) {
      return;
    }

    setSelected(index);
  }, [initialCategory, list]);

  return (
    <div className="ml-9 flex flex-col gap-4">
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Secondary}
      >
        Squad is searchable, publicly listed in our squad directory, and open
        for everyone to join. It’s ideal for building a community or for content
        creators.
      </Typography>
      {list && (
        <Dropdown
          placeholder="Select category"
          className={{
            container: 'w-56',
            button: categoryHint && 'border border-status-error',
          }}
          options={list.map(({ title }) => title)}
          selectedIndex={selected}
          onChange={(_, index) => {
            setSelected(index);
            onCategoryChange?.(list[index].id);
          }}
          disabled={isDisabled}
        />
      )}
      {list && !isDisabled && (
        <input
          type="hidden"
          id="categoryId"
          name="categoryId"
          value={list[selected]?.id}
        />
      )}
    </div>
  );
}
