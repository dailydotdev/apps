import type { ReactNode } from 'react';
import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  COACH_SHADOW_STRONG,
  CoachAnchor,
  CoachMotionStyles,
  CoachPointer,
  FINAL_ANCHORS,
  FinalStage,
} from './finalRail';
import type { TourCardProps } from './tourSteps';
import {
  BackButton,
  CompactSwitch,
  GameCenterPanel,
  NextButton,
  SIDEBAR_TOUR_STEPS,
  SkipTourButton,
  TOUR_STEP_COUNT,
  TourCoachCard,
  tourCardLeft,
  tourCardTop,
} from './tourSteps';

const GALLERY_STEP = 1;

interface CoachSentenceProps {
  type?: TypographyType;
  children: ReactNode;
}

const CoachSentence = ({
  type = TypographyType.Footnote,
  children,
}: CoachSentenceProps): JSX.Element => (
  <Typography
    className="text-balance"
    type={type}
    color={TypographyColor.Primary}
  >
    {children}
  </Typography>
);

// B. Counter: the step count as plain text in a header row that also carries
// the skip control, so the body is nothing but the sentence and the actions.
const CounterCard = ({
  step,
  onStepChange,
  onFinish,
  onSkip,
  compact,
  onCompactChange,
  switchId = 'variation-counter',
  pointer,
}: TourCardProps): JSX.Element => {
  const currentStep = SIDEBAR_TOUR_STEPS[step];

  return (
    <div className="coach-card-in relative flex w-72 flex-col gap-2.5 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-3.5 shadow-2-black">
      <CoachMotionStyles />
      {pointer !== undefined && <CoachPointer bordered top={pointer} />}

      <div className="flex items-center justify-between">
        <Typography
          className="tabular-nums"
          type={TypographyType.Caption1}
          color={TypographyColor.Quaternary}
        >
          {`${step + 1}/${TOUR_STEP_COUNT}`}
        </Typography>
        <SkipTourButton onSkip={onSkip} />
      </div>

      <div key={currentStep.id} className="coach-card-in flex flex-col gap-2.5">
        <CoachSentence>{currentStep.message}</CoachSentence>

        {currentStep.extra === 'compactSwitch' && (
          <CompactSwitch
            switchId={switchId}
            compact={compact}
            onCompactChange={onCompactChange}
          />
        )}

        <div className="flex items-center justify-end gap-2">
          <BackButton step={step} onStepChange={onStepChange} />
          <NextButton
            step={step}
            onStepChange={onStepChange}
            onFinish={onFinish}
          />
        </div>
      </div>
    </div>
  );
};

// C. Segments: three equal ticks, square ends, so progress reads as a meter
// rather than as a row of pills.
const SegmentsCard = ({
  step,
  onStepChange,
  onFinish,
  onSkip,
  compact,
  onCompactChange,
  switchId = 'variation-segments',
  pointer,
}: TourCardProps): JSX.Element => {
  const currentStep = SIDEBAR_TOUR_STEPS[step];

  return (
    <div className="coach-card-in relative flex w-72 flex-col gap-2.5 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-3.5 shadow-2-black">
      <CoachMotionStyles />
      {pointer !== undefined && <CoachPointer bordered top={pointer} />}

      <span aria-hidden className="flex items-center gap-1">
        {SIDEBAR_TOUR_STEPS.map((tourStep, index) => (
          <span
            key={tourStep.id}
            className={`h-0.5 w-6 rounded-2 transition-colors ${
              index <= step ? 'bg-accent-cabbage-default' : 'bg-surface-float'
            }`}
          />
        ))}
      </span>

      <div key={currentStep.id} className="coach-card-in flex flex-col gap-2.5">
        <CoachSentence>{currentStep.message}</CoachSentence>

        {currentStep.extra === 'compactSwitch' && (
          <CompactSwitch
            switchId={switchId}
            compact={compact}
            onCompactChange={onCompactChange}
          />
        )}

        <div className="flex items-center justify-between gap-2">
          <SkipTourButton onSkip={onSkip} />
          <span className="flex items-center gap-2">
            <BackButton step={step} onStepChange={onStepChange} />
            <NextButton
              step={step}
              onStepChange={onStepChange}
              onFinish={onFinish}
            />
          </span>
        </div>
      </div>
    </div>
  );
};

// D. Dialog footer: progress as a sentence in a tinted footer bar. The most
// product-dialog of the five, and the only one without a Back control.
const DialogFooterCard = ({
  step,
  onStepChange,
  onFinish,
  onSkip,
  compact,
  onCompactChange,
  switchId = 'variation-dialog',
  pointer,
}: TourCardProps): JSX.Element => {
  const currentStep = SIDEBAR_TOUR_STEPS[step];

  return (
    <div className="coach-card-in relative flex w-80 flex-col rounded-16 border border-border-subtlest-tertiary bg-background-subtle shadow-2-black">
      <CoachMotionStyles />
      {pointer !== undefined && <CoachPointer bordered top={pointer} />}

      <div
        key={currentStep.id}
        className="coach-card-in flex flex-col gap-2.5 p-3.5"
      >
        <CoachSentence>{currentStep.message}</CoachSentence>

        {currentStep.extra === 'compactSwitch' && (
          <CompactSwitch
            switchId={switchId}
            compact={compact}
            onCompactChange={onCompactChange}
          />
        )}
      </div>

      <div className="flex items-center gap-2 rounded-b-16 border-t border-border-subtlest-tertiary bg-surface-float px-3.5 py-2.5">
        <Typography
          className="flex-1 tabular-nums"
          type={TypographyType.Caption1}
          color={TypographyColor.Quaternary}
        >
          {`Step ${step + 1} of ${TOUR_STEP_COUNT}`}
        </Typography>
        <SkipTourButton onSkip={onSkip} />
        <NextButton
          step={step}
          onStepChange={onStepChange}
          onFinish={onFinish}
        />
      </div>
    </div>
  );
};

// E. Wayfinding: no progress element at all. The primary button names where it
// is taking you, which is the same information without a second widget.
const WAYFINDING_LABELS: Record<string, string> = {
  rail: 'The rail',
  dock: 'Shortcuts',
  gameCenter: 'Game Center',
};

const WayfindingCard = ({
  step,
  onStepChange,
  onFinish,
  onSkip,
  compact,
  onCompactChange,
  switchId = 'variation-wayfinding',
  pointer,
}: TourCardProps): JSX.Element => {
  const currentStep = SIDEBAR_TOUR_STEPS[step];
  const nextStep = SIDEBAR_TOUR_STEPS[step + 1];

  return (
    <div
      className="coach-card-in relative flex w-60 flex-col gap-2 rounded-12 bg-background-subtle p-3"
      style={COACH_SHADOW_STRONG}
    >
      <CoachMotionStyles />
      {pointer !== undefined && <CoachPointer top={pointer} />}

      <div key={currentStep.id} className="coach-card-in flex flex-col gap-2">
        <CoachSentence type={TypographyType.Caption1}>
          {currentStep.message}
        </CoachSentence>

        {currentStep.extra === 'compactSwitch' && (
          <CompactSwitch
            switchId={switchId}
            compact={compact}
            onCompactChange={onCompactChange}
          />
        )}

        <div className="flex items-center justify-between gap-1">
          <SkipTourButton tight onSkip={onSkip} />
          <NextButton
            step={step}
            onStepChange={onStepChange}
            onFinish={onFinish}
            label={nextStep && `Next: ${WAYFINDING_LABELS[nextStep.id]}`}
          />
        </div>
      </div>
    </div>
  );
};

interface Variation {
  id: string;
  label: string;
  progress: string;
  dimensions: string;
  Card: (props: TourCardProps) => JSX.Element | null;
}

const VARIATIONS: Variation[] = [
  {
    id: 'quiet',
    label: 'A Quiet',
    progress: 'Progress: a 2px rail on the bottom edge',
    dimensions: '256 wide · 12 padding · Footnote copy · Small buttons',
    Card: TourCoachCard,
  },
  {
    id: 'counter',
    label: 'B Counter',
    progress: 'Progress: a 1/3 counter in the header',
    dimensions: '288 wide · 14 padding · Footnote copy · Small buttons',
    Card: CounterCard,
  },
  {
    id: 'segments',
    label: 'C Segments',
    progress: 'Progress: three square-ended ticks',
    dimensions: '288 wide · 14 padding · Footnote copy · Small buttons',
    Card: SegmentsCard,
  },
  {
    id: 'dialog',
    label: 'D Dialog footer',
    progress: 'Progress: "Step 1 of 3" in a tinted footer',
    dimensions: '320 wide · 14 padding · Footnote copy · Small buttons',
    Card: DialogFooterCard,
  },
  {
    id: 'wayfinding',
    label: 'E Wayfinding',
    progress: 'Progress: none, the button names the destination',
    dimensions: '240 wide · 12 padding · Caption1 copy · Small buttons',
    Card: WayfindingCard,
  },
];

const VariationsDemo = (): JSX.Element => {
  const [variationId, setVariationId] = useState(VARIATIONS[0].id);
  const [step, setStep] = useState(0);
  const [compact, setCompact] = useState(false);

  const variation =
    VARIATIONS.find((item) => item.id === variationId) ?? VARIATIONS[0];
  const { Card } = variation;
  const currentStep = SIDEBAR_TOUR_STEPS[step];
  const isRunning = !!currentStep;

  const reset = () => {
    setStep(0);
    setCompact(false);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Quaternary}
        >
          Variation
        </Typography>
        {VARIATIONS.map((item) => (
          <Button
            key={item.id}
            size={ButtonSize.Small}
            variant={
              item.id === variationId
                ? ButtonVariant.Primary
                : ButtonVariant.Float
            }
            onClick={() => setVariationId(item.id)}
          >
            {item.label}
          </Button>
        ))}
        <Button
          size={ButtonSize.Small}
          variant={ButtonVariant.Tertiary}
          onClick={reset}
        >
          Reset
        </Button>
      </div>

      <FinalStage
        spotlight={isRunning}
        rail={{
          compact,
          glow: currentStep?.glow ?? null,
          activeTab:
            currentStep?.extra === 'gameCenterPanel' ? 'Streak' : 'You',
          streakPanel: currentStep?.extra === 'gameCenterPanel' && (
            <GameCenterPanel />
          ),
        }}
      >
        {isRunning ? (
          <CoachAnchor
            centered
            left={tourCardLeft(currentStep)}
            top={tourCardTop(currentStep)}
          >
            <Card
              pointer="center"
              step={step}
              onStepChange={setStep}
              onFinish={() => setStep(TOUR_STEP_COUNT)}
              onSkip={() => setStep(TOUR_STEP_COUNT)}
              compact={compact}
              onCompactChange={setCompact}
              switchId={`variation-stage-${variation.id}`}
            />
          </CoachAnchor>
        ) : (
          <div
            className="absolute z-2 flex items-center gap-3 rounded-12 border border-border-subtlest-tertiary bg-background-subtle px-3 py-2 shadow-2-black"
            style={{ left: 76, top: FINAL_ANCHORS.tabs }}
          >
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
            >
              Tour ended
            </Typography>
            <Button
              size={ButtonSize.Small}
              variant={ButtonVariant.Tertiary}
              onClick={() => setStep(0)}
            >
              Replay
            </Button>
          </div>
        )}
      </FinalStage>

      <div className="flex flex-wrap items-center gap-3">
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Quaternary}
        >
          {variation.progress}
        </Typography>
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Quaternary}
        >
          {variation.dimensions}
        </Typography>
      </div>
    </div>
  );
};

const GalleryGrid = (): JSX.Element => {
  const [step, setStep] = useState(GALLERY_STEP);
  const [compact, setCompact] = useState(false);

  return (
    <div className="flex flex-wrap items-start gap-6">
      {VARIATIONS.map((item) => {
        const { Card } = item;

        return (
          <div key={item.id} className="flex w-80 flex-col gap-2">
            <div className="flex flex-col">
              <Typography bold type={TypographyType.Footnote}>
                {item.label}
              </Typography>
              <Typography
                type={TypographyType.Caption2}
                color={TypographyColor.Quaternary}
              >
                {item.dimensions}
              </Typography>
              <Typography
                type={TypographyType.Caption2}
                color={TypographyColor.Quaternary}
              >
                {item.progress}
              </Typography>
            </div>

            <Card
              step={step}
              onStepChange={setStep}
              onFinish={() => setStep(0)}
              onSkip={() => setStep(0)}
              compact={compact}
              onCompactChange={setCompact}
              switchId={`variation-gallery-${item.id}`}
            />
          </div>
        );
      })}
    </div>
  );
};

const meta: Meta = {
  title: 'Sidebar Tutorial/Final/04 Card variations',
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <div className="flex flex-col gap-4 bg-background-default p-6">
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Tertiary}
        className="max-w-3xl"
      >
        Five takes on the same coach card, all driving the same three-step tour
        on the same stage, so they can be judged in place rather than on a
        swatch board. Every one of them is tighter than the card we reviewed,
        keeps the primary action at 32px, replaces the corner X with a
        &quot;Skip tour&quot; control that says what it abandons, and carries
        progress in a different way. Switch variation at any step: the tour
        keeps its place, so you can compare the same moment across all five.
      </Typography>
      <VariationsDemo />
    </div>
  ),
};

export const Gallery: Story = {
  render: () => (
    <div className="flex flex-col gap-4 bg-background-default p-6">
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Tertiary}
        className="max-w-3xl"
      >
        All five at step 2, off the stage and side by side, with the numbers
        that separate them. The controls are live and move all five together, so
        you can walk the whole set through the tour and watch how each progress
        treatment behaves. The pointer is left off here; it belongs to the stage
        in the Default story.
      </Typography>
      <GalleryGrid />
    </div>
  ),
};
