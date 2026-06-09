import type { ReactElement } from 'react';
import React, { useState } from 'react';
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
import { useGivebackContext } from '../GivebackContext';
import { GivebackUserActionStatus } from '../types';
import { getUserActionStatusLabel } from '../statusLabels';

const GOAL_PRESETS = [0, 25, 50, 99, 100];
const LEVEL_PRESETS = [1, 2, 3, 4, 5];

const ACTION_STATUS_PRESETS = [
  GivebackUserActionStatus.PendingReview,
  GivebackUserActionStatus.Approved,
  GivebackUserActionStatus.Rejected,
  GivebackUserActionStatus.NeedsMoreInfo,
  GivebackUserActionStatus.CountedTowardGoal,
];

export const GivebackReviewToggle = (): ReactElement => {
  const [isOpen, setIsOpen] = useState(true);
  const {
    actions,
    celebrate,
    celebrationState,
    dismissCelebration,
    geoAvailability,
    goalPercentage,
    setCelebrationState,
    setGeoAvailability,
    setGoalPercentage,
    setShowCommunityFeed,
    setUserActionStatus,
    setUserLevel,
    showCommunityFeed,
    userLevel,
  } = useGivebackContext();
  const [selectedActionId, setSelectedActionId] = useState(
    actions[0]?.id ?? '',
  );

  return (
    <FlexCol className="fixed bottom-4 right-4 z-modal max-h-[calc(100vh-2rem)] w-[19rem] gap-3 overflow-y-auto rounded-16 border border-border-subtlest-secondary bg-background-popover p-4 shadow-2">
      <FlexRow className="items-center justify-between gap-2">
        <Typography
          tag={TypographyTag.Span}
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
          bold
        >
          Giveback QA panel
        </Typography>
        <Button
          type="button"
          size={ButtonSize.XSmall}
          variant={ButtonVariant.Subtle}
          onClick={() => setIsOpen((prev) => !prev)}
        >
          {isOpen ? 'Hide' : 'Show'}
        </Button>
      </FlexRow>

      {isOpen && (
        <>
          <FlexCol className="gap-1.5">
            <Typography
              tag={TypographyTag.Span}
              type={TypographyType.Caption2}
              color={TypographyColor.Tertiary}
            >
              Community goal
            </Typography>
            <FlexRow className="flex-wrap gap-1">
              {GOAL_PRESETS.map((preset) => (
                <Button
                  key={preset}
                  type="button"
                  size={ButtonSize.XSmall}
                  variant={
                    goalPercentage === preset
                      ? ButtonVariant.Primary
                      : ButtonVariant.Float
                  }
                  onClick={() => setGoalPercentage(preset)}
                  className={classNames('min-w-12')}
                >
                  {preset}%
                </Button>
              ))}
            </FlexRow>
          </FlexCol>

          <FlexCol className="gap-1.5">
            <Typography
              tag={TypographyTag.Span}
              type={TypographyType.Caption2}
              color={TypographyColor.Tertiary}
            >
              Your level
            </Typography>
            <FlexRow className="flex-wrap gap-1">
              {LEVEL_PRESETS.map((preset) => (
                <Button
                  key={preset}
                  type="button"
                  size={ButtonSize.XSmall}
                  variant={
                    userLevel === preset
                      ? ButtonVariant.Primary
                      : ButtonVariant.Float
                  }
                  onClick={() => setUserLevel(preset)}
                >
                  {preset}
                </Button>
              ))}
            </FlexRow>
          </FlexCol>

          <FlexCol className="gap-1.5">
            <Typography
              tag={TypographyTag.Span}
              type={TypographyType.Caption2}
              color={TypographyColor.Tertiary}
            >
              Action state
            </Typography>
            <select
              className="rounded-8 border border-border-subtlest-tertiary bg-surface-float px-2 py-1 text-text-primary typo-caption1"
              value={selectedActionId}
              onChange={(event) => setSelectedActionId(event.target.value)}
            >
              {actions.map((action) => (
                <option key={action.id} value={action.id}>
                  {action.title}
                </option>
              ))}
            </select>
            <FlexRow className="flex-wrap gap-1">
              {ACTION_STATUS_PRESETS.map((status) => (
                <Button
                  key={status}
                  type="button"
                  size={ButtonSize.XSmall}
                  variant={ButtonVariant.Float}
                  onClick={() => setUserActionStatus(selectedActionId, status)}
                >
                  {getUserActionStatusLabel(status)}
                </Button>
              ))}
            </FlexRow>
          </FlexCol>

          <FlexCol className="gap-1.5">
            <Typography
              tag={TypographyTag.Span}
              type={TypographyType.Caption2}
              color={TypographyColor.Tertiary}
            >
              Community feed
            </Typography>
            <FlexRow className="flex-wrap gap-1">
              {[true, false].map((value) => (
                <Button
                  key={value ? 'show-feed' : 'hide-feed'}
                  type="button"
                  size={ButtonSize.XSmall}
                  variant={
                    showCommunityFeed === value
                      ? ButtonVariant.Primary
                      : ButtonVariant.Float
                  }
                  onClick={() => setShowCommunityFeed(value)}
                >
                  {value ? 'Show feed' : 'Hide feed'}
                </Button>
              ))}
            </FlexRow>
          </FlexCol>

          <FlexCol className="gap-1.5">
            <Typography
              tag={TypographyTag.Span}
              type={TypographyType.Caption2}
              color={TypographyColor.Tertiary}
            >
              Celebration
            </Typography>
            <FlexRow className="flex-wrap gap-1">
              {(['none', 'milestone', 'complete'] as const).map((value) => (
                <Button
                  key={value}
                  type="button"
                  size={ButtonSize.XSmall}
                  variant={
                    celebrationState === value
                      ? ButtonVariant.Primary
                      : ButtonVariant.Float
                  }
                  onClick={() => {
                    setCelebrationState(value);
                    if (value === 'none') {
                      dismissCelebration();
                      return;
                    }
                    celebrate({
                      amount: 40,
                      milestone: value === 'milestone' ? 50 : 100,
                      complete: value === 'complete',
                    });
                  }}
                >
                  {value}
                </Button>
              ))}
            </FlexRow>
          </FlexCol>

          <FlexCol className="gap-1.5">
            <Typography
              tag={TypographyTag.Span}
              type={TypographyType.Caption2}
              color={TypographyColor.Tertiary}
            >
              Geo availability
            </Typography>
            <FlexRow className="flex-wrap gap-1">
              {(['available', 'waitlist'] as const).map((value) => (
                <Button
                  key={value}
                  type="button"
                  size={ButtonSize.XSmall}
                  variant={
                    geoAvailability === value
                      ? ButtonVariant.Primary
                      : ButtonVariant.Float
                  }
                  onClick={() => setGeoAvailability(value)}
                >
                  {value}
                </Button>
              ))}
            </FlexRow>
          </FlexCol>
        </>
      )}
    </FlexCol>
  );
};
