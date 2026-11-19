import type { ReactElement } from 'react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import { Dropdown } from '../../fields/Dropdown';

import { useSquadCategories } from '../../../hooks/squads/useSquadCategories';

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
  const containerRef = useRef<HTMLDivElement>(null);
  const { data: categories } = useSquadCategories();
  const list = useMemo(
    () =>
      categories?.pages
        .flatMap((page) => page.categories.edges)
        .map(({ node }) => node) ?? [],
    [categories],
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

  useEffect(() => {
    // The dropdown sits below the fold on most forms
    if (categoryHint) {
      containerRef.current?.scrollIntoView?.({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [categoryHint]);

  return (
    <div ref={containerRef} className="ml-9 flex flex-col gap-4">
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
      {categoryHint && (
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.StatusError}
          role="alert"
        >
          {categoryHint}
        </Typography>
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
