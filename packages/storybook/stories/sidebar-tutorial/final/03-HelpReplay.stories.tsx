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
import { FinalStage, SupportMenu } from './finalRail';
import { GameCenterPanel, SIDEBAR_TOUR_STEPS, SidebarTour } from './tourSteps';

const HelpReplayDemo = (): JSX.Element => {
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [step, setStep] = useState<number | null>(null);
  const [compact, setCompact] = useState(false);
  const [replays, setReplays] = useState(0);

  const currentStep = step === null ? undefined : SIDEBAR_TOUR_STEPS[step];

  const startTour = () => {
    setIsMenuOpen(false);
    setStep(0);
    setReplays((current) => current + 1);
  };

  const endTour = () => setStep(null);

  const reset = () => {
    setIsMenuOpen(true);
    setStep(null);
    setCompact(false);
    setReplays(0);
  };

  return (
    <div className="flex flex-col gap-3">
      <FinalStage
        spotlight={!!currentStep}
        rail={{
          compact,
          glow: currentStep?.glow ?? null,
          activeTab:
            currentStep?.extra === 'gameCenterPanel' ? 'Streak' : 'You',
          streakPanel: currentStep?.extra === 'gameCenterPanel' && (
            <GameCenterPanel />
          ),
          onHelpClick: () => setIsMenuOpen((current) => !current),
        }}
      >
        {isMenuOpen && (
          <>
            <button
              type="button"
              aria-label="Close the support menu"
              className="absolute inset-0 z-2 cursor-default"
              onClick={() => setIsMenuOpen(false)}
            />
            <SupportMenu
              highlightedId="tour"
              items={[
                {
                  id: 'tour',
                  label: 'Learn the sidebar',
                  onClick: startTour,
                },
                { id: 'docs', label: 'Docs' },
                { id: 'bug', label: 'Report a bug' },
              ]}
            />
          </>
        )}

        {step !== null && (
          <SidebarTour
            step={step}
            onStepChange={setStep}
            onFinish={endTour}
            onSkip={endTour}
            compact={compact}
            onCompactChange={setCompact}
            switchId="final-replay-compact"
          />
        )}
      </FinalStage>

      <div className="flex items-center gap-3">
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
          {`Tour launched from help: ${replays} · ${
            currentStep ? `running (step ${(step ?? 0) + 1})` : 'idle'
          }`}
        </Typography>
      </div>
    </div>
  );
};

const meta: Meta = {
  title: 'Sidebar Tutorial/Final/03 Replay from help',
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
        The way back in. The tour never advertises itself, but it stays
        available: the support menu at the foot of the rail carries a
        &quot;Learn the sidebar&quot; item that restarts it from step one — for
        the people who skipped it, closed it, or never got it because they
        signed up after the switch. Click it to launch the tour; skip or finish
        and you land exactly where you were, menu closed, nothing else changed.
        Click the &quot;?&quot; to open the menu again.
      </Typography>
      <HelpReplayDemo />
    </div>
  ),
};
