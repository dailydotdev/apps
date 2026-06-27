import type { ReactElement } from 'react';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { FlexCol, FlexRow } from '../../../components/utilities';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { ButtonIconPosition } from '../../../components/buttons/common';
import { ArrowIcon } from '../../../components/icons';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent } from '../../../lib/log';
import type { ContributionAction } from '../types';
import { useContributionActions } from '../hooks/useContributionActions';
import { GivebackActionCard } from './GivebackActionCard';
import { GivebackActionSubmissionModal } from './GivebackActionSubmissionModal';
import { GivebackFilterChip } from './GivebackFilterChip';

const ALL_FILTER = 'all';

// Keep the initial grid short so the tab opens scannable; the rest expand on
// demand. 12 fills four clean rows on the 3-column breakpoint.
const INITIAL_VISIBLE_ACTIONS = 12;

const ActionGrid = ({
  actions,
  onSubmit,
}: {
  actions: ContributionAction[];
  onSubmit: (action: ContributionAction) => void;
}): ReactElement => (
  <div className="grid gap-3 tablet:grid-cols-2 laptop:grid-cols-3">
    {actions.map((action) => (
      <GivebackActionCard key={action.id} action={action} onSubmit={onSubmit} />
    ))}
  </div>
);

interface GivebackActionCatalogProps {
  // Scrolls the tab strip back to the top so a filtered list always starts in
  // view (no jump from the previous scroll position).
  onFilter?: () => void;
}

export const GivebackActionCatalog = ({
  onFilter,
}: GivebackActionCatalogProps): ReactElement => {
  const { logEvent } = useLogContext();
  const { actions, categories, isPending } = useContributionActions(true);
  const [selectedCategory, setSelectedCategory] = useState<string>(ALL_FILTER);
  const [showAll, setShowAll] = useState(false);
  const [submissionAction, setSubmissionAction] =
    useState<ContributionAction | null>(null);

  // A new filter always opens to the short, scannable list.
  useEffect(() => {
    setShowAll(false);
  }, [selectedCategory]);

  const openAction = (action: ContributionAction) => {
    logEvent({
      event_name: LogEvent.OpenGivebackAction,
      target_id: action.id,
      extra: JSON.stringify({
        platform: action.metadata.platform,
        points: action.points,
        is_love: action.metadata.isLoveAction,
      }),
    });
    setSubmissionAction(action);
  };

  const selectCategory = (categoryId: string) => {
    logEvent({
      event_name: LogEvent.FilterGivebackActions,
      extra: JSON.stringify({ category_id: categoryId }),
    });
    setSelectedCategory(categoryId);
    onFilter?.();
  };

  const toggleShowAll = () => {
    setShowAll((value) => {
      if (!value) {
        logEvent({ event_name: LogEvent.ClickGivebackShowMoreActions });
      }
      return !value;
    });
  };

  const { paidActions, loveActions } = useMemo(() => {
    const paid: ContributionAction[] = [];
    const love: ContributionAction[] = [];
    actions.forEach((action) => {
      (action.metadata.isLoveAction ? love : paid).push(action);
    });
    return { paidActions: paid, loveActions: love };
  }, [actions]);

  const filteredPaid = useMemo(
    () =>
      selectedCategory === ALL_FILTER
        ? paidActions
        : paidActions.filter(
            (action) => action.categoryId === selectedCategory,
          ),
    [paidActions, selectedCategory],
  );

  if (isPending) {
    return (
      <div
        role="status"
        aria-label="Loading actions"
        className="grid gap-3 tablet:grid-cols-2 laptop:grid-cols-3"
      >
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            className="h-32 animate-pulse rounded-16 bg-surface-float"
          />
        ))}
      </div>
    );
  }

  if (!actions.length) {
    return (
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Secondary}
      >
        No actions are available yet. Check back soon.
      </Typography>
    );
  }

  const visiblePaid = showAll
    ? filteredPaid
    : filteredPaid.slice(0, INITIAL_VISIBLE_ACTIONS);
  const hiddenCount = filteredPaid.length - visiblePaid.length;

  return (
    <FlexCol className="gap-6">
      <FlexRow className="flex-wrap gap-2">
        <GivebackFilterChip
          isSelected={selectedCategory === ALL_FILTER}
          label="All"
          onClick={() => selectCategory(ALL_FILTER)}
        />
        {categories.map((category) => (
          <GivebackFilterChip
            key={category.id}
            isSelected={selectedCategory === category.id}
            label={category.title}
            onClick={() => selectCategory(category.id)}
          />
        ))}
      </FlexRow>

      {filteredPaid.length > 0 ? (
        <FlexCol className="gap-4">
          <ActionGrid actions={visiblePaid} onSubmit={openAction} />
          {hiddenCount > 0 && (
            <FlexRow className="justify-center">
              <Button
                type="button"
                size={ButtonSize.Medium}
                variant={ButtonVariant.Secondary}
                icon={
                  <ArrowIcon className={showAll ? undefined : 'rotate-180'} />
                }
                iconPosition={ButtonIconPosition.Right}
                onClick={toggleShowAll}
              >
                {showAll ? 'Show fewer' : `Show more actions (${hiddenCount})`}
              </Button>
            </FlexRow>
          )}
        </FlexCol>
      ) : (
        <FlexCol className="items-center gap-1 py-10 text-center">
          <Typography bold type={TypographyType.Callout}>
            No actions match this filter
          </Typography>
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            Try another filter.
          </Typography>
        </FlexCol>
      )}

      {loveActions.length > 0 && (
        <FlexCol className="gap-3">
          <FlexCol className="gap-0.5">
            <Typography
              bold
              type={TypographyType.Footnote}
              className="text-accent-cabbage-default"
            >
              Just for love
            </Typography>
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
            >
              No donation rides on these — they just help us out. We&apos;d love
              you for it.
            </Typography>
          </FlexCol>
          <ActionGrid actions={loveActions} onSubmit={setSubmissionAction} />
        </FlexCol>
      )}

      {submissionAction && (
        <GivebackActionSubmissionModal
          action={submissionAction}
          onClose={() => setSubmissionAction(null)}
        />
      )}
    </FlexCol>
  );
};
