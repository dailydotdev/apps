import React from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { Switch } from '@dailydotdev/shared/src/components/fields/Switch';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import type { FinalRailRegion } from './finalRail';
import {
  CoachCard,
  FINAL_ANCHORS,
  PANEL_TOP_OFFSET,
  PANEL_WIDTH,
  RAIL_WIDTH,
  STAGE_HEIGHT,
  tabTop,
} from './finalRail';

export interface SidebarTourStep {
  id: string;
  message: string;
  glow: FinalRailRegion;
  anchor: FinalRailRegion;
  extra?: 'compactSwitch' | 'gameCenterPanel';
}

export const SIDEBAR_TOUR_STEPS: SidebarTourStep[] = [
  {
    id: 'rail',
    message:
      'Your navigation now lives in this rail — hover any tab to open it.',
    glow: 'tabs',
    anchor: 'tabs',
    extra: 'compactSwitch',
  },
  {
    id: 'dock',
    message:
      'Pin the pages you use most — drag them here or add them from •••.',
    glow: 'dock',
    anchor: 'dock',
  },
  {
    id: 'gameCenter',
    message: 'Your streak and quests now share one Game Center.',
    glow: 'streak',
    anchor: 'streak',
    extra: 'gameCenterPanel',
  },
];

export const TOUR_STEP_COUNT = SIDEBAR_TOUR_STEPS.length;

const CARD_LEFT = 76;
const CARD_LEFT_BESIDE_PANEL = RAIL_WIDTH + PANEL_WIDTH + 12;
const CARD_MARGIN = 16;

// Heights are stable because the copy is fixed: two rows plus the switch row on
// step 1. Knowing them up front keeps the card and its pointer from jumping on
// the first paint.
const cardHeight = (step: SidebarTourStep): number =>
  step.extra === 'compactSwitch' ? 216 : 172;

export const tourCardTop = (step: SidebarTourStep): number => {
  const height = cardHeight(step);
  const centered = FINAL_ANCHORS[step.anchor] - height / 2;

  return Math.min(
    Math.max(centered, CARD_MARGIN),
    STAGE_HEIGHT - height - CARD_MARGIN,
  );
};

export const tourCardLeft = (step: SidebarTourStep): number =>
  step.extra === 'gameCenterPanel' ? CARD_LEFT_BESIDE_PANEL : CARD_LEFT;

const STREAK_DAYS = 12;

const QUESTS = [
  { id: 'read', label: 'Read 5 posts', done: 3, total: 5 },
  { id: 'comment', label: 'Leave a comment', done: 0, total: 1 },
];

const QuestRow = ({
  label,
  done,
  total,
}: (typeof QUESTS)[number]): JSX.Element => (
  <div className="flex flex-col gap-1">
    <div className="flex items-center gap-2">
      <Typography
        className="flex-1"
        type={TypographyType.Footnote}
        color={TypographyColor.Secondary}
      >
        {label}
      </Typography>
      <Typography
        type={TypographyType.Caption2}
        color={TypographyColor.Quaternary}
      >
        {done}/{total}
      </Typography>
    </div>
    <span className="h-1 w-full rounded-2 bg-surface-float">
      <span
        className="block h-1 rounded-2 bg-accent-cabbage-default"
        style={{ width: `${(done / total) * 100}%` }}
      />
    </span>
  </div>
);

export const GameCenterPanel = (): JSX.Element => (
  <div
    className="absolute z-2 flex flex-col gap-3 rounded-r-14 border border-border-subtlest-tertiary bg-background-subtle p-3 shadow-2-black"
    style={{
      left: RAIL_WIDTH,
      top: tabTop('Streak') - PANEL_TOP_OFFSET,
      width: PANEL_WIDTH,
    }}
  >
    <div className="flex items-center gap-3">
      <span className="flex size-10 items-center justify-center rounded-full bg-accent-cabbage-flat font-bold text-accent-cabbage-default typo-callout">
        {STREAK_DAYS}
      </span>
      <div className="flex flex-1 flex-col">
        <Typography bold type={TypographyType.Footnote}>
          Reading streak
        </Typography>
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Quaternary}
        >
          {STREAK_DAYS} days in a row
        </Typography>
      </div>
    </div>

    <span className="h-px w-full bg-border-subtlest-tertiary" />

    <div className="flex flex-col gap-2">
      <Typography
        type={TypographyType.Caption1}
        color={TypographyColor.Quaternary}
      >
        Quests
      </Typography>
      {QUESTS.map((quest) => (
        <QuestRow key={quest.id} {...quest} />
      ))}
      <Typography
        type={TypographyType.Caption1}
        color={TypographyColor.Tertiary}
      >
        480 XP this week
      </Typography>
    </div>
  </div>
);

export interface SidebarTourProps {
  step: number;
  onStepChange: (step: number) => void;
  onFinish: () => void;
  onSkip: () => void;
  compact: boolean;
  onCompactChange: (compact: boolean) => void;
  switchId?: string;
}

export const SidebarTour = ({
  step,
  onStepChange,
  onFinish,
  onSkip,
  compact,
  onCompactChange,
  switchId = 'final-tour-compact',
}: SidebarTourProps): JSX.Element | null => {
  const currentStep = SIDEBAR_TOUR_STEPS[step];

  if (!currentStep) {
    return null;
  }

  const isLastStep = step === TOUR_STEP_COUNT - 1;
  const top = tourCardTop(currentStep);

  return (
    <CoachCard
      key={currentStep.id}
      message={currentStep.message}
      dots={{ total: TOUR_STEP_COUNT, active: step }}
      onClose={onSkip}
      closeLabel="Skip tour"
      pointerTop={FINAL_ANCHORS[currentStep.anchor] - top}
      style={{ left: tourCardLeft(currentStep), top }}
      control={
        currentStep.extra === 'compactSwitch' && (
          <Switch
            inputId={switchId}
            name={switchId}
            checked={compact}
            onToggle={() => onCompactChange(!compact)}
          >
            Compact mode
          </Switch>
        )
      }
      actions={
        <>
          {step === 0 ? (
            <span />
          ) : (
            <Button
              size={ButtonSize.Medium}
              variant={ButtonVariant.Tertiary}
              onClick={() => onStepChange(step - 1)}
            >
              Back
            </Button>
          )}
          <Button
            size={ButtonSize.Medium}
            variant={ButtonVariant.Primary}
            style={{ minWidth: 96 }}
            onClick={() => (isLastStep ? onFinish() : onStepChange(step + 1))}
          >
            {isLastStep ? 'Got it' : 'Next'}
          </Button>
        </>
      }
    />
  );
};
