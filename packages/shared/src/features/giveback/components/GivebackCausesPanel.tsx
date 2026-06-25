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
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
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
import { useContributionCausePicker } from '../hooks/useContributionCausePicker';
import type { ContributionCause } from '../types';
import { GivebackFilterChip } from './GivebackFilterChip';
import { GivebackCauseCard } from './GivebackCauseCard';
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

// Manage-your-causes tab: the ones you back sit up top, everything else is right
// below ready to add. Toggles update an in-memory working set; "Save changes"
// persists it (the button only lights up when the set actually differs).
export const GivebackCausesPanel = (): ReactElement => {
  const { logEvent } = useLogContext();
  const {
    causes,
    isLoading,
    selectedIds,
    toggleCause,
    selectedCount,
    save,
    isSaving,
  } = useGivebackCauseSelection(true);
  const { selectedCauseIds } = useContributionCausePicker(true);
  const [activeFilter, setActiveFilter] = useState<string>(ALL_FILTER);

  const savedSet = useMemo(() => new Set(selectedCauseIds), [selectedCauseIds]);
  const isDirty =
    selectedIds.size !== savedSet.size ||
    [...selectedIds].some((id) => !savedSet.has(id));

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
  const selectedCauses = indexed.filter(
    ({ cause }) => selectedIds.has(cause.id) && matchesFilter(cause),
  );
  const otherCauses = indexed.filter(
    ({ cause }) => !selectedIds.has(cause.id) && matchesFilter(cause),
  );

  const onLearnMore = (causeId: string) =>
    logEvent({ event_name: LogEvent.ClickGivebackCause, target_id: causeId });

  const onSave = async () => {
    const saved = await save();
    if (!saved) {
      return;
    }
    logEvent({
      event_name: LogEvent.SaveGivebackCauses,
      extra: JSON.stringify({
        cause_count: selectedIds.size,
        cause_ids: [...selectedIds],
        origin: 'causes_tab',
      }),
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
      <FlexCol className="gap-2">
        <Typography tag={TypographyTag.H2} type={TypographyType.Title2} bold>
          Your causes, your call
        </Typography>
        <Typography
          tag={TypographyTag.P}
          type={TypographyType.Callout}
          color={TypographyColor.Secondary}
          className="max-w-2xl"
        >
          Every action you take sends real money to the causes you pick here.
          Back as many as you like, change them whenever you want. daily.dev
          funds every donation, so it never costs you a thing.
        </Typography>
      </FlexCol>

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

      <FlexCol className="gap-3">
        <FlexRow className="items-center justify-between gap-3">
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
            bold
            className="uppercase tracking-wider"
          >
            Your causes · {selectedCount}
          </Typography>
          {isDirty && (
            <Button
              type="button"
              size={ButtonSize.Small}
              variant={ButtonVariant.Primary}
              onClick={onSave}
              loading={isSaving}
              disabled={selectedCount === 0}
            >
              Save changes
            </Button>
          )}
        </FlexRow>

        {selectedCauses.length > 0 ? (
          <div className="grid grid-cols-1 gap-2 tablet:grid-cols-2 laptop:grid-cols-3">
            {selectedCauses.map(({ cause, index }) => (
              <CauseRow
                key={cause.id}
                cause={cause}
                index={index}
                selected
                onToggle={toggleCause}
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

      {otherCauses.length > 0 && (
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
          {/* Richer detail cards here (like the funnel) so people have enough
              context to decide what to add — your picks above stay compact. */}
          <div className="grid grid-cols-1 gap-3 tablet:grid-cols-2 laptop:grid-cols-3">
            {otherCauses.map(({ cause, index }) => (
              <GivebackCauseCard
                key={cause.id}
                cause={cause}
                index={index}
                selected={false}
                onToggle={toggleCause}
              />
            ))}
          </div>
        </FlexCol>
      )}
    </FlexCol>
  );
};
