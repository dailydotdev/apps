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
import type { CoachPointerTop, FinalRailRegion } from './finalRail';
import {
  CoachAnchor,
  CoachCard,
  FINAL_ANCHORS,
  PANEL_TOP_OFFSET,
  PANEL_WIDTH,
  RAIL_WIDTH,
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
    message: 'Your navigation moved into this rail, and panels open on hover.',
    glow: 'tabs',
    anchor: 'tabs',
    extra: 'compactSwitch',
  },
  {
    id: 'dock',
    message: 'Drag any page into the dock below, or add it from the ••• menu.',
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

export const tourCardLeft = (step: SidebarTourStep): number =>
  step.extra === 'gameCenterPanel' ? CARD_LEFT_BESIDE_PANEL : CARD_LEFT;

export const tourCardTop = (step: SidebarTourStep): number =>
  FINAL_ANCHORS[step.anchor];

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

export interface TourCardProps {
  step: number;
  onStepChange: (step: number) => void;
  onFinish: () => void;
  onSkip: () => void;
  compact: boolean;
  onCompactChange: (compact: boolean) => void;
  switchId?: string;
  pointer?: CoachPointerTop;
}

export interface CompactSwitchProps {
  switchId: string;
  compact: boolean;
  onCompactChange: (compact: boolean) => void;
}

export const CompactSwitch = ({
  switchId,
  compact,
  onCompactChange,
}: CompactSwitchProps): JSX.Element => (
  <Switch
    inputId={switchId}
    name={switchId}
    checked={compact}
    onToggle={() => onCompactChange(!compact)}
  >
    Compact mode
  </Switch>
);

export const SkipTourButton = ({
  onSkip,
  tight = false,
}: {
  onSkip: () => void;
  // The narrowest variation pairs this with a primary button that spells out a
  // destination, so it trims its side padding rather than push the row out of
  // the card. A tertiary button has no fill, so the trim is invisible.
  tight?: boolean;
}): JSX.Element => (
  <Button
    className="active:scale-95"
    style={tight ? { paddingLeft: 4, paddingRight: 4 } : undefined}
    size={ButtonSize.Small}
    variant={ButtonVariant.Tertiary}
    onClick={onSkip}
  >
    Skip tour
  </Button>
);

export interface StepButtonProps {
  step: number;
  onStepChange: (step: number) => void;
  onFinish?: () => void;
  label?: string;
}

export const BackButton = ({
  step,
  onStepChange,
}: StepButtonProps): JSX.Element | null => {
  if (step === 0) {
    return null;
  }

  return (
    <Button
      className="active:scale-95"
      size={ButtonSize.Small}
      variant={ButtonVariant.Tertiary}
      onClick={() => onStepChange(step - 1)}
    >
      Back
    </Button>
  );
};

export const NextButton = ({
  step,
  onStepChange,
  onFinish,
  label,
}: StepButtonProps): JSX.Element => {
  const isLastStep = step === TOUR_STEP_COUNT - 1;

  return (
    <Button
      className="active:scale-95"
      size={ButtonSize.Small}
      variant={ButtonVariant.Primary}
      onClick={() => (isLastStep ? onFinish?.() : onStepChange(step + 1))}
    >
      {label ?? (isLastStep ? 'Got it' : 'Next')}
    </Button>
  );
};

// Variation A (Quiet). Story 04 holds the four alternatives that drive this
// same tour.
export const TourCoachCard = ({
  step,
  onStepChange,
  onFinish,
  onSkip,
  compact,
  onCompactChange,
  switchId = 'final-tour-compact',
  pointer,
}: TourCardProps): JSX.Element | null => {
  const currentStep = SIDEBAR_TOUR_STEPS[step];

  if (!currentStep) {
    return null;
  }

  return (
    <CoachCard
      stepKey={currentStep.id}
      message={currentStep.message}
      progress={{ total: TOUR_STEP_COUNT, active: step }}
      pointer={pointer}
      control={
        currentStep.extra === 'compactSwitch' && (
          <CompactSwitch
            switchId={switchId}
            compact={compact}
            onCompactChange={onCompactChange}
          />
        )
      }
      actions={
        <>
          <SkipTourButton onSkip={onSkip} />
          <span className="flex items-center gap-2">
            <BackButton step={step} onStepChange={onStepChange} />
            <NextButton
              step={step}
              onStepChange={onStepChange}
              onFinish={onFinish}
            />
          </span>
        </>
      }
    />
  );
};

export const SidebarTour = (props: TourCardProps): JSX.Element | null => {
  const { step } = props;
  const currentStep = SIDEBAR_TOUR_STEPS[step];

  if (!currentStep) {
    return null;
  }

  return (
    <CoachAnchor
      centered
      left={tourCardLeft(currentStep)}
      top={tourCardTop(currentStep)}
    >
      <TourCoachCard {...props} pointer="center" />
    </CoachAnchor>
  );
};
