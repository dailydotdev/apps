import type { ReactElement } from 'react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import { FlexCol, FlexRow } from '../../../components/utilities';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import {
  Button,
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { ArrowIcon, OpenLinkIcon, VIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { useToastNotification } from '../../../hooks/useToastNotification';
import { useContributionCauses } from '../hooks/useContributionCauses';
import { useContributionCausePreferences } from '../hooks/useContributionCausePreferences';
import { useUpdateContributionCausePreferences } from '../hooks/useUpdateContributionCausePreferences';
import { CauseEmblem } from './CauseEmblem';
import { GivebackFilterChip } from './GivebackFilterChip';

const ALL_FILTER = 'all';

interface GivebackCauseSelectionProps {
  // Called after the visitor's picks are saved, to advance the join flow.
  onComplete?: () => void;
}

export const GivebackCauseSelection = ({
  onComplete,
}: GivebackCauseSelectionProps): ReactElement => {
  const { displayToast } = useToastNotification();
  const { causes, isPending: isLoadingCauses } = useContributionCauses(true);
  const { selectedCauseIds, isPending: isLoadingPreferences } =
    useContributionCausePreferences(true);
  const { saveCausePreferences, isPending: isSaving } =
    useUpdateContributionCausePreferences();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeFilter, setActiveFilter] = useState<string>(ALL_FILTER);

  // Seed the picker from the saved preferences once they arrive, so editing
  // starts from the visitor's current selection. Only runs the first time the
  // preferences resolve, never stomping later in-picker toggles.
  const didSeedRef = useRef(false);
  useEffect(() => {
    if (didSeedRef.current || isLoadingPreferences) {
      return;
    }
    didSeedRef.current = true;
    setSelectedIds(new Set(selectedCauseIds));
  }, [isLoadingPreferences, selectedCauseIds]);

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

  const toggleCause = (id: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleContinue = async () => {
    await saveCausePreferences([...selectedIds]);
    displayToast('Your causes are saved');
    onComplete?.();
  };

  if (isLoadingCauses) {
    return (
      <div className="grid grid-cols-2 gap-3 tablet:grid-cols-3">
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

  const selectedCount = selectedIds.size;

  return (
    <FlexCol className="gap-6">
      <Typography
        tag={TypographyTag.P}
        type={TypographyType.Callout}
        color={TypographyColor.Secondary}
        className="max-w-2xl"
      >
        Pick as many as you like. daily.dev funds every donation, and you can
        change them anytime.
      </Typography>

      {categories.length > 0 && (
        <FlexRow className="flex-wrap gap-2">
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

      <div className="grid grid-cols-2 gap-3 tablet:grid-cols-3">
        {visibleCauses.map(({ cause, index }) => {
          const selected = selectedIds.has(cause.id);

          return (
            <div
              key={cause.id}
              className={classNames(
                'group relative flex flex-col gap-3 rounded-16 border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-2 active:translate-y-0 active:scale-[0.99] motion-reduce:transform-none',
                selected
                  ? 'border-accent-cabbage-default bg-accent-cabbage-flat'
                  : 'border-border-subtlest-tertiary hover:bg-surface-hover',
              )}
            >
              {/* Full-card overlay drives the toggle so the "Learn more" link
                  can live inside the card without nesting interactives. */}
              <button
                type="button"
                aria-pressed={selected}
                aria-label={`${selected ? 'Deselect' : 'Select'} ${
                  cause.title
                }`}
                onClick={() => toggleCause(cause.id)}
                className="absolute inset-0 z-0 rounded-16"
              />

              <FlexRow className="pointer-events-none relative z-1 items-start justify-between gap-2">
                <CauseEmblem
                  cause={cause}
                  index={index}
                  className="transition-transform duration-200 group-hover:scale-105"
                />
                <span
                  className={classNames(
                    'flex size-5 shrink-0 items-center justify-center rounded-full transition-colors',
                    selected
                      ? 'bg-accent-cabbage-default text-white'
                      : 'border border-border-subtlest-secondary',
                  )}
                >
                  {selected && <VIcon secondary size={IconSize.XXSmall} />}
                </span>
              </FlexRow>

              <FlexCol className="pointer-events-none relative z-1 min-w-0 flex-1 gap-1">
                <Typography bold type={TypographyType.Callout}>
                  {cause.title}
                </Typography>
                {cause.category && (
                  <Typography
                    tag={TypographyTag.Span}
                    type={TypographyType.Caption1}
                    color={TypographyColor.Tertiary}
                  >
                    {cause.category}
                  </Typography>
                )}
                {cause.description && (
                  <Typography
                    type={TypographyType.Caption1}
                    color={TypographyColor.Tertiary}
                    className="line-clamp-2 pt-1"
                  >
                    {cause.description}
                  </Typography>
                )}
              </FlexCol>

              {cause.url && (
                <a
                  href={cause.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(event) => event.stopPropagation()}
                  className="group/learn relative z-1 inline-flex w-fit items-center gap-1 font-bold text-text-link underline-offset-2 typo-footnote hover:underline focus-visible:underline"
                >
                  Learn more
                  <OpenLinkIcon
                    size={IconSize.XSmall}
                    className="transition-transform duration-200 group-hover/learn:-translate-y-0.5 group-hover/learn:translate-x-0.5"
                  />
                </a>
              )}
            </div>
          );
        })}
      </div>

      <FlexRow className="flex-wrap items-center justify-between gap-3">
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
        >
          {selectedCount} selected
        </Typography>
        <Button
          type="button"
          variant={ButtonVariant.Primary}
          size={ButtonSize.Large}
          icon={<ArrowIcon className="rotate-90" />}
          iconPosition={ButtonIconPosition.Right}
          disabled={selectedCount === 0 || isSaving}
          loading={isSaving}
          onClick={handleContinue}
          className="w-full tablet:w-fit"
        >
          Continue
        </Button>
      </FlexRow>
    </FlexCol>
  );
};
