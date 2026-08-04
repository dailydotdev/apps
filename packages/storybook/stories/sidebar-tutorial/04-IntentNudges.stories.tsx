import React, { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import CloseButton from '@dailydotdev/shared/src/components/CloseButton';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import type { RailRegion } from './mockSidebar';
import { CoachCard, DemoStage, REGION_ANCHORS } from './mockSidebar';

const VISITS_BEFORE_NUDGE = 3;
const LINGER_MS = 2000;

const DockChip = (): JSX.Element => {
  const [isPoppedIn, setIsPoppedIn] = useState(false);

  useEffect(() => {
    setIsPoppedIn(true);
  }, []);

  return (
    <span
      title="History"
      className={`flex size-6 items-center justify-center rounded-8 bg-accent-cabbage-flat text-accent-cabbage-default transition-transform duration-300 typo-caption1 ${
        isPoppedIn ? 'scale-100' : 'scale-0'
      }`}
    >
      H
    </span>
  );
};

const IntentNudgesDemo = (): JSX.Element => {
  const [visits, setVisits] = useState(0);
  const [isNudgeDismissed, setIsNudgeDismissed] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [isLingering, setIsLingering] = useState(false);
  const [isHoverHintVisible, setIsHoverHintVisible] = useState(false);

  useEffect(() => {
    if (!isLingering) {
      return undefined;
    }

    const timer = setTimeout(() => {
      setIsLingering(false);
      setIsHoverHintVisible(true);
    }, LINGER_MS);

    return () => clearTimeout(timer);
  }, [isLingering]);

  const isNudgeVisible =
    visits >= VISITS_BEFORE_NUDGE && !isNudgeDismissed && !isPinned;

  const glowRegion = (): RailRegion | null => {
    if (isLingering || isHoverHintVisible) {
      return 'tabs';
    }

    return isNudgeVisible ? 'dock' : null;
  };

  const reset = () => {
    setVisits(0);
    setIsNudgeDismissed(false);
    setIsPinned(false);
    setIsLingering(false);
    setIsHoverHintVisible(false);
  };

  return (
    <div className="flex flex-col gap-3">
      <DemoStage
        rail={{
          glow: glowRegion(),
          dockExtra: isPinned ? <DockChip /> : null,
        }}
      >
        <div className="z-20 absolute right-4 top-4 flex w-56 flex-col gap-3 rounded-14 border border-border-subtlest-tertiary bg-surface-float p-3">
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Quaternary}
          >
            Simulation
          </Typography>

          <div className="flex flex-col items-start gap-1">
            <Button
              size={ButtonSize.XSmall}
              variant={ButtonVariant.Secondary}
              onClick={() =>
                setVisits((current) =>
                  Math.min(current + 1, VISITS_BEFORE_NUDGE),
                )
              }
            >
              Visit History
            </Button>
            <Typography
              type={TypographyType.Caption2}
              color={TypographyColor.Quaternary}
            >
              {visits} of {VISITS_BEFORE_NUDGE} visits this session
            </Typography>
          </div>

          <div className="flex flex-col items-start gap-1">
            <Button
              size={ButtonSize.XSmall}
              variant={ButtonVariant.Secondary}
              disabled={isLingering}
              onClick={() => setIsLingering(true)}
            >
              Hover the rail for 2s
            </Button>
            <Typography
              type={TypographyType.Caption2}
              color={TypographyColor.Quaternary}
            >
              {isLingering ? 'Pointer resting…' : 'Pointer on the tabs region'}
            </Typography>
          </div>
        </div>

        {isHoverHintVisible && (
          <div
            className="z-20 absolute flex items-center gap-1 rounded-10 border border-border-subtlest-tertiary bg-background-subtle py-1 pl-3 pr-1 shadow-2-black"
            style={{ top: REGION_ANCHORS.tabs, left: 76 }}
          >
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Secondary}
            >
              New here: panels open on hover
            </Typography>
            <CloseButton
              size={ButtonSize.XSmall}
              onClick={() => setIsHoverHintVisible(false)}
            />
          </div>
        )}

        {isNudgeVisible && (
          <CoachCard
            title="Pin History to your dock?"
            body="You've opened History 3 times this session. Pinned pages sit under the rail, one click away."
            style={{ top: REGION_ANCHORS.dock - 130, left: 76 }}
            actions={
              <>
                <Button
                  size={ButtonSize.XSmall}
                  variant={ButtonVariant.Primary}
                  onClick={() => setIsPinned(true)}
                >
                  Pin it
                </Button>
                <Button
                  size={ButtonSize.XSmall}
                  variant={ButtonVariant.Tertiary}
                  onClick={() => setIsNudgeDismissed(true)}
                >
                  Not now
                </Button>
              </>
            }
          />
        )}
      </DemoStage>

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
          className="max-w-2xl"
        >
          Real triggers: the pin nudge fires on the third visit to the same
          unpinned page in a session (navigation history), and the hover hint
          fires after a 2s pointer-linger over a rail region the user has never
          opened (pointer events). Both are one-shot per user.
        </Typography>
      </div>
    </div>
  );
};

const meta: Meta = {
  title: 'Sidebar Tutorial/04 Intent-based nudges',
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
        className="max-w-2xl"
      >
        Education that waits for the user to earn it (the Linear pattern):
        nothing shows on day one, and each lesson is triggered by a behaviour
        that already proves intent. The Simulation panel stands in for the real
        signals so the flow is clickable here — in production nothing in it
        would be visible.
      </Typography>
      <IntentNudgesDemo />
    </div>
  ),
};
