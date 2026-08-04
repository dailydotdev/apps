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
import { FINAL_ANCHORS, FinalStage } from './finalRail';
import {
  GameCenterPanel,
  SIDEBAR_TOUR_STEPS,
  SidebarTour,
  TOUR_STEP_COUNT,
} from './tourSteps';

const FINISHED_STEP = TOUR_STEP_COUNT;

const TourDemo = (): JSX.Element => {
  const [step, setStep] = useState(0);
  const [compact, setCompact] = useState(false);

  const isRunning = step < FINISHED_STEP;
  const currentStep = SIDEBAR_TOUR_STEPS[step];

  const reset = () => {
    setStep(0);
    setCompact(false);
  };

  return (
    <div className="flex flex-col gap-3">
      <FinalStage
        spotlight={isRunning}
        rail={{
          compact,
          glow: isRunning ? currentStep.glow : null,
          activeTab:
            currentStep?.extra === 'gameCenterPanel' ? 'Streak' : 'You',
          streakPanel: currentStep?.extra === 'gameCenterPanel' && (
            <GameCenterPanel />
          ),
        }}
      >
        {isRunning ? (
          <SidebarTour
            step={step}
            onStepChange={setStep}
            onFinish={() => setStep(FINISHED_STEP)}
            onSkip={() => setStep(FINISHED_STEP)}
            compact={compact}
            onCompactChange={setCompact}
          />
        ) : (
          <div
            className="absolute z-2 flex items-center gap-3 rounded-12 border border-border-subtlest-tertiary bg-background-subtle px-3 py-2 shadow-2-black"
            style={{ left: 76, top: FINAL_ANCHORS.tabs }}
          >
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
            >
              Tour complete
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

      <div className="flex items-center gap-2">
        <Button
          size={ButtonSize.Small}
          variant={ButtonVariant.Tertiary}
          onClick={reset}
        >
          Reset
        </Button>
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Quaternary}
        >
          Jump to step
        </Typography>
        {SIDEBAR_TOUR_STEPS.map((tourStep, index) => (
          <Button
            key={tourStep.id}
            size={ButtonSize.XSmall}
            variant={
              index === step ? ButtonVariant.Primary : ButtonVariant.Float
            }
            onClick={() => setStep(index)}
          >
            {index + 1}
          </Button>
        ))}
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Quaternary}
        >
          {isRunning
            ? `Step ${step + 1} of ${TOUR_STEP_COUNT}`
            : 'Finished — seen-flag set'}
        </Typography>
      </div>
    </div>
  );
};

const meta: Meta = {
  title: 'Sidebar Tutorial/Final/01 Tour (existing users)',
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
        The one sanctioned push, shown once to users who already had the old
        sidebar: three steps, one sentence each, an X to leave on every one of
        them. The scrim spotlights the rail, the pointer ties the card to the
        region it is talking about, step 1 carries the compact setting as a live
        switch and step 3 opens the Game Center panel. Use the step buttons
        under the stage to review each step on its own.
      </Typography>
      <TourDemo />
    </div>
  ),
};
