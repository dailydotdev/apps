import React, { useCallback, useEffect, useState } from 'react';
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
import type { RailRegion } from './mockSidebar';
import { CoachCard, DemoStage, REGION_ANCHORS } from './mockSidebar';

interface TourStep {
  region: RailRegion;
  title: string;
  body: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    region: 'tabs',
    title: 'Everything moved into this rail',
    body: 'Explore, You, Squads and Streak are tabs now — their panels open on hover, and Home lives on the logo.',
  },
  {
    region: 'dock',
    title: 'Your shortcuts dock',
    body: 'The pages you use most sit right below the rail, one click away.',
  },
  {
    region: 'dock',
    title: 'Make it yours',
    body: 'Drag any page out of a panel and drop it into the dock, or add it from the ••• tray.',
  },
];

const CARD_LEFT = 76;
const STEP_DURATION_MS = 2500;
const PROGRESS_TICK_MS = 50;

// The stage clips its overflow, so a card anchored straight at the dock's own
// y would run off the bottom edge.
const LOWEST_CARD_TOP = 380;

const cardTop = (region: RailRegion): number =>
  Math.min(REGION_ANCHORS[region], LOWEST_CARD_TOP);

const FINISHED_STEP = TOUR_STEPS.length;

interface TourCompleteChipProps {
  onReplay: () => void;
}

const TourCompleteChip = ({ onReplay }: TourCompleteChipProps): JSX.Element => (
  <div
    className="z-20 absolute flex items-center gap-3 rounded-12 border border-border-subtlest-tertiary bg-background-subtle px-3 py-2 shadow-2-black"
    style={{ left: CARD_LEFT, top: REGION_ANCHORS.dock }}
  >
    <Typography type={TypographyType.Footnote} color={TypographyColor.Tertiary}>
      Tour complete
    </Typography>
    <Button
      size={ButtonSize.XSmall}
      variant={ButtonVariant.Tertiary}
      onClick={onReplay}
    >
      Replay
    </Button>
  </div>
);

interface SpotlightTourProps {
  autoplay?: boolean;
}

const SpotlightTour = ({
  autoplay = false,
}: SpotlightTourProps): JSX.Element => {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const isRunning = step < FINISHED_STEP;
  const currentStep = TOUR_STEPS[step];

  const reset = useCallback(() => {
    setStep(0);
    setProgress(0);
  }, []);

  const goTo = useCallback((next: number) => {
    setStep(next);
    setProgress(0);
  }, []);

  useEffect(() => {
    if (!autoplay || step >= FINISHED_STEP) {
      return undefined;
    }

    const ticker = setInterval(() => {
      setProgress((current) => current + PROGRESS_TICK_MS);
    }, PROGRESS_TICK_MS);
    const advance = setTimeout(() => goTo(step + 1), STEP_DURATION_MS);

    return () => {
      clearInterval(ticker);
      clearTimeout(advance);
    };
  }, [autoplay, goTo, step]);

  const progressRatio = Math.min(progress / STEP_DURATION_MS, 1);

  return (
    <div className="flex flex-col gap-4 bg-background-default p-6">
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Tertiary}
      >
        {autoplay
          ? 'The same three-step spotlight, but each step advances itself after 2.5 seconds so the tour plays like a short film. Use it to compare passive pacing against a user-driven one — passive removes the click cost but takes reading control away.'
          : 'The one sanctioned push: a three-step spotlight shown once, right after a user lands on the reorganized sidebar. It dims the feed, glows the region it is talking about, and stays skippable at every step — three steps is the ceiling before abandonment climbs.'}
      </Typography>

      <DemoStage
        contentDim={isRunning}
        rail={{ glow: isRunning ? currentStep.region : null }}
      >
        {isRunning ? (
          <CoachCard
            step={`${step + 1} of ${TOUR_STEPS.length}`}
            title={currentStep.title}
            body={currentStep.body}
            style={{ left: CARD_LEFT, top: cardTop(currentStep.region) }}
            actions={
              <>
                {autoplay ? (
                  <span className="h-1 flex-1 overflow-hidden rounded-2 bg-surface-float">
                    <span
                      className="block h-full rounded-2 bg-accent-cabbage-default"
                      style={{ width: `${progressRatio * 100}%` }}
                    />
                  </span>
                ) : (
                  <>
                    <Button
                      size={ButtonSize.XSmall}
                      variant={ButtonVariant.Tertiary}
                      disabled={step === 0}
                      onClick={() => goTo(step - 1)}
                    >
                      Back
                    </Button>
                    <Button
                      size={ButtonSize.XSmall}
                      variant={ButtonVariant.Primary}
                      onClick={() => goTo(step + 1)}
                    >
                      {step === FINISHED_STEP - 1 ? 'Try it now' : 'Next'}
                    </Button>
                  </>
                )}
                <Button
                  size={ButtonSize.XSmall}
                  variant={ButtonVariant.Tertiary}
                  onClick={() => goTo(FINISHED_STEP)}
                >
                  Skip tour
                </Button>
              </>
            }
          />
        ) : (
          <TourCompleteChip onReplay={reset} />
        )}
      </DemoStage>

      <div className="flex items-center gap-2">
        <Button
          size={ButtonSize.Small}
          variant={ButtonVariant.Tertiary}
          onClick={reset}
        >
          Reset
        </Button>
      </div>
    </div>
  );
};

const meta: Meta = {
  title: 'Sidebar Tutorial/01 Spotlight tour',
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj;

export const Default: Story = { render: () => <SpotlightTour /> };

export const Autoplay: Story = { render: () => <SpotlightTour autoplay /> };
