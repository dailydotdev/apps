import type { ReactElement } from 'react';
import React, { useMemo, useState } from 'react';
import { FlexCol, FlexRow } from '../../../components/utilities';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { GivebackFilterChip } from './GivebackFilterChip';
import { GivebackCauseCard } from './GivebackCauseCard';
import type { ContributionCause } from '../types';

const ALL_FILTER = 'all';

interface GivebackCauseSelectionProps {
  causes: ContributionCause[];
  isLoading: boolean;
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
}

export const GivebackCauseSelection = ({
  causes,
  isLoading,
  selectedIds,
  onToggle,
}: GivebackCauseSelectionProps): ReactElement => {
  const [activeFilter, setActiveFilter] = useState<string>(ALL_FILTER);

  const categories = useMemo(
    () =>
      Array.from(
        new Set(
          causes
            .map((cause) => cause.category)
            .filter((category): category is string => Boolean(category)),
        ),
      ),
    [causes],
  );

  const visibleCauses = useMemo(
    () =>
      causes
        .map((cause, index) => ({ cause, index }))
        .filter(({ cause }) =>
          activeFilter === ALL_FILTER ? true : cause.category === activeFilter,
        ),
    [causes, activeFilter],
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-3 tablet:grid-cols-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            className="h-36 animate-pulse rounded-16 bg-surface-float"
          />
        ))}
      </div>
    );
  }

  if (!causes.length) {
    return (
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Secondary}
      >
        No causes are available right now. Check back soon.
      </Typography>
    );
  }

  return (
    <FlexCol className="gap-6">
      {categories.length > 0 && (
        <FlexRow className="flex-wrap gap-1.5 tablet:gap-2">
          <GivebackFilterChip
            isSelected={activeFilter === ALL_FILTER}
            label="All"
            onClick={() => setActiveFilter(ALL_FILTER)}
          />
          {categories.map((category) => (
            <GivebackFilterChip
              key={category}
              isSelected={activeFilter === category}
              label={category}
              onClick={() => setActiveFilter(category)}
            />
          ))}
        </FlexRow>
      )}

      <div className="grid grid-cols-1 gap-3 tablet:grid-cols-2">
        {visibleCauses.map(({ cause, index }) => (
          <GivebackCauseCard
            key={cause.id}
            cause={cause}
            index={index}
            selected={selectedIds.has(cause.id)}
            onToggle={onToggle}
          />
        ))}
      </div>
    </FlexCol>
  );
};
