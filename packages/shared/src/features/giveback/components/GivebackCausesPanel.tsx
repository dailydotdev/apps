import type { ReactElement } from 'react';
import React, { useMemo, useState } from 'react';
import classNames from 'classnames';
import { FlexCol, FlexRow } from '../../../components/utilities';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import {
  MiniCloseIcon,
  OpenLinkIcon,
  PlusIcon,
} from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { anchorDefaultRel } from '../../../lib/strings';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent } from '../../../lib/log';
import { useGivebackCauseSelection } from '../hooks/useGivebackCauseSelection';
import type { ContributionCause } from '../types';
import { GivebackFilterChip } from './GivebackFilterChip';
import { GivebackCauseCard } from './GivebackCauseCard';
import { GivebackTabHeading } from './GivebackTabHeading';
import { CauseEmblem } from './CauseEmblem';

const ALL_FILTER = 'all';

interface CauseWithIndex {
  cause: ContributionCause;
  index: number;
}

// On the management tab each cause is a compact row (not the tall onboarding
// card): emblem, name, an optional "learn more", and a select toggle on the
// right. The toggles line up in a single right-hand column so the whole list
// scans cleanly and stays short - the onboarding funnel keeps the rich cards.
const CauseRow = ({
  cause,
  index,
  selected,
  onToggle,
  onLearnMore,
}: {
  cause: ContributionCause;
  index: number;
  selected: boolean;
  onToggle: (id: string) => void;
  onLearnMore: (id: string) => void;
}): ReactElement => (
  <FlexRow className="items-center gap-3 rounded-12 border border-border-subtlest-tertiary bg-surface-float p-2.5 transition-colors hover:border-border-subtlest-secondary">
    <CauseEmblem cause={cause} index={index} />
    <FlexCol className="min-w-0 flex-1">
      <Typography bold type={TypographyType.Footnote} className="truncate">
        {cause.title}
      </Typography>
      {cause.category && (
        <Typography
          tag={TypographyTag.Span}
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
          className="truncate"
        >
          {cause.category}
        </Typography>
      )}
    </FlexCol>
    {cause.url && (
      <a
        href={cause.url}
        target="_blank"
        rel={anchorDefaultRel}
        aria-label={`Learn more about ${cause.title}`}
        onClick={() => onLearnMore(cause.id)}
        className="flex size-8 shrink-0 items-center justify-center rounded-10 text-text-tertiary transition-colors hover:bg-surface-hover hover:text-text-primary"
      >
        <OpenLinkIcon size={IconSize.Small} />
      </a>
    )}
    <button
      type="button"
      aria-pressed={selected}
      aria-label={`${selected ? 'Remove' : 'Add'} ${cause.title}`}
      onClick={() => onToggle(cause.id)}
      className={classNames(
        'flex size-8 shrink-0 items-center justify-center rounded-10 border transition-colors [&_svg]:size-4',
        selected
          ? 'border-border-subtlest-secondary text-text-tertiary hover:border-status-error hover:bg-status-error hover:text-white'
          : 'border-border-subtlest-secondary text-text-tertiary hover:border-accent-cabbage-default hover:text-accent-cabbage-default',
      )}
    >
      {selected ? <MiniCloseIcon /> : <PlusIcon />}
    </button>
  </FlexRow>
);

interface GivebackCausesPanelProps {
  // Scrolls the tab strip to the top when the filter changes, so the narrowed
  // "more causes" list always starts in view.
  onFilter?: () => void;
}

// Manage-your-causes tab: the ones you back sit up top, everything else is right
// below ready to add. Adding/removing auto-saves.
export const GivebackCausesPanel = ({
  onFilter,
}: GivebackCausesPanelProps): ReactElement => {
  const { logEvent } = useLogContext();
  const { causes, isLoading, selectedIds, toggleAndSave, selectedCount } =
    useGivebackCauseSelection(true);
  const [activeFilter, setActiveFilter] = useState<string>(ALL_FILTER);

  const selectFilter = (filter: string) => {
    setActiveFilter(filter);
    onFilter?.();
  };

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

  const matchesFilter = (cause: { category?: string | null }) =>
    activeFilter === ALL_FILTER || cause.category === activeFilter;

  const indexed = useMemo<CauseWithIndex[]>(
    () => causes.map((cause, index) => ({ cause, index })),
    [causes],
  );
  // Your causes always show every pick, regardless of the filter; the filter
  // only narrows the "more causes to explore" list below.
  const selectedCauses = indexed.filter(({ cause }) =>
    selectedIds.has(cause.id),
  );
  const otherCauses = indexed.filter(
    ({ cause }) => !selectedIds.has(cause.id) && matchesFilter(cause),
  );
  // Unfiltered: keeps the filter strip visible even when the active category has
  // no unselected causes, so the user can always switch back.
  const hasOtherCauses = indexed.some(
    ({ cause }) => !selectedIds.has(cause.id),
  );

  const onLearnMore = (causeId: string) =>
    logEvent({ event_name: LogEvent.ClickGivebackCause, target_id: causeId });

  // Auto-saved on every toggle, so each add/remove is also logged here.
  const onToggle = (causeId: string) => {
    toggleAndSave(causeId);
    logEvent({
      event_name: LogEvent.SaveGivebackCauses,
      extra: JSON.stringify({ cause_id: causeId, origin: 'causes_tab' }),
    });
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-2 tablet:grid-cols-2 laptop:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            className="h-16 animate-pulse rounded-12 bg-surface-float"
          />
        ))}
      </div>
    );
  }

  return (
    <FlexCol className="gap-8">
      <GivebackTabHeading
        title="Your causes, your call"
        description="Every action you take sends real money to the causes you pick here. Back as many as you like, change them whenever you want. daily.dev funds every donation, so it never costs you a thing."
      />

      <FlexCol className="gap-3">
        <Typography
          tag={TypographyTag.Span}
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
          bold
          className="uppercase tracking-wider"
        >
          Your causes · {selectedCount}
        </Typography>

        {selectedCauses.length > 0 ? (
          <div className="grid grid-cols-1 gap-2 tablet:grid-cols-2 laptop:grid-cols-3">
            {selectedCauses.map(({ cause, index }) => (
              <CauseRow
                key={cause.id}
                cause={cause}
                index={index}
                selected
                onToggle={onToggle}
                onLearnMore={onLearnMore}
              />
            ))}
          </div>
        ) : (
          <FlexCol className="items-start gap-1 rounded-16 border border-dashed border-border-subtlest-tertiary p-6">
            <Typography bold type={TypographyType.Callout}>
              You haven&apos;t backed any causes yet
            </Typography>
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
            >
              Pick one below and your next action starts funding it.
            </Typography>
          </FlexCol>
        )}
      </FlexCol>

      {/* Filters sit just above the discovery grid they control (and below your
          own causes), so the connection is obvious. */}
      {hasOtherCauses && (
        <FlexCol className="gap-3">
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
            bold
            className="uppercase tracking-wider"
          >
            More causes to explore
          </Typography>
          {categories.length > 0 && (
            <FlexRow className="flex-wrap gap-2">
              <GivebackFilterChip
                isSelected={activeFilter === ALL_FILTER}
                label="All"
                onClick={() => selectFilter(ALL_FILTER)}
              />
              {categories.map((category) => (
                <GivebackFilterChip
                  key={category}
                  isSelected={activeFilter === category}
                  label={category}
                  onClick={() => selectFilter(category)}
                />
              ))}
            </FlexRow>
          )}
          {otherCauses.length > 0 ? (
            // Richer detail cards (like the funnel) so people have enough context
            // to decide; only the "+" adds, so the card isn't a big toggle.
            <div className="grid grid-cols-1 gap-3 tablet:grid-cols-2 laptop:grid-cols-3">
              {otherCauses.map(({ cause, index }) => (
                <GivebackCauseCard
                  key={cause.id}
                  cause={cause}
                  index={index}
                  selected={false}
                  onToggle={onToggle}
                  buttonToggle
                />
              ))}
            </div>
          ) : (
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
            >
              No more causes in this category.
            </Typography>
          )}
        </FlexCol>
      )}
    </FlexCol>
  );
};
