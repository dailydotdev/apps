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
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { CoachCard, DemoStage, RAIL_TABS, REGION_ANCHORS } from './mockSidebar';

const TOUR_MAX_OPENS = 2;
const STREAK_DAYS = 12;

// MockRail is shared and must not be edited, so the tab box is derived from
// REGION_ANCHORS plus the rail's own spacing: the tab stack starts 86px above
// the tabs anchor with a 50px pitch.
const RAIL_WIDTH = 64;
const TABS_TOP = REGION_ANCHORS.tabs - 86;
const TAB_PITCH = 50;
const TAB_HEIGHT = 46;
const STREAK_TAB_TOP = TABS_TOP + RAIL_TABS.indexOf('Streak') * TAB_PITCH;

const PANEL_WIDTH = 256;
const PANEL_TOP_OFFSET = 8;
const STREAK_BLOCK_OFFSET = 12;
const QUESTS_BLOCK_OFFSET = 77;

const QUESTS = [
  { id: 'read', label: 'Read 5 posts', done: 3, total: 5 },
  { id: 'comment', label: 'Leave a comment', done: 0, total: 1 },
];

interface TourStep {
  title: string;
  body: string;
  offset: number;
  cta: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    title: 'Your streak lives here now',
    body: 'The flame used to sit in the top header. It moved into the rail with the rest of your stuff.',
    offset: STREAK_BLOCK_OFFSET,
    cta: 'Next',
  },
  {
    title: 'Quests moved in too',
    body: 'One Game Center for both: streak on top, quests underneath, same tab.',
    offset: QUESTS_BLOCK_OFFSET,
    cta: 'Got it',
  },
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

const GameCenterDemo = (): JSX.Element => {
  const [isPointerInside, setIsPointerInside] = useState(false);
  const [opens, setOpens] = useState(0);
  const [step, setStep] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const isTourDone = isFinished || opens > TOUR_MAX_OPENS;
  const isTourVisible = isPointerInside && !isTourDone;
  const currentStep = TOUR_STEPS[step];

  const openPanel = () => {
    if (isPointerInside) {
      return;
    }

    setIsPointerInside(true);
    setStep(0);
    setOpens((current) => current + 1);
  };

  const advance = () => {
    if (step < TOUR_STEPS.length - 1) {
      setStep(step + 1);
      return;
    }

    setIsFinished(true);
  };

  const reset = () => {
    setIsPointerInside(false);
    setOpens(0);
    setStep(0);
    setIsFinished(false);
  };

  return (
    <div className="flex flex-col gap-3">
      <DemoStage rail={{ activeTab: 'Streak' }}>
        {!isTourDone && !isPointerInside && (
          <Typography
            bold
            tag={TypographyTag.Span}
            type={TypographyType.Caption2}
            className="z-10 absolute rounded-6 bg-accent-cabbage-flat px-1.5 py-0.5 text-accent-cabbage-default"
            style={{ left: 38, top: STREAK_TAB_TOP - 4 }}
          >
            2-in-1
          </Typography>
        )}

        <div
          className="z-20 absolute"
          onMouseLeave={() => setIsPointerInside(false)}
          style={{
            left: 0,
            top: STREAK_TAB_TOP,
            width: RAIL_WIDTH + PANEL_WIDTH,
            height: TAB_HEIGHT,
          }}
        >
          <button
            type="button"
            aria-label="Open the Game Center panel"
            className="absolute inset-y-0 left-0 w-16"
            onMouseEnter={openPanel}
            onFocus={openPanel}
          />

          {isPointerInside && (
            <div
              className="absolute flex flex-col gap-3 rounded-r-14 border border-border-subtlest-tertiary bg-background-subtle p-3 shadow-2-black"
              style={{
                left: RAIL_WIDTH,
                top: -PANEL_TOP_OFFSET,
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
          )}

          {isTourVisible && (
            <CoachCard
              step={`${step + 1} of ${TOUR_STEPS.length}`}
              title={currentStep.title}
              body={currentStep.body}
              style={{
                left: RAIL_WIDTH + PANEL_WIDTH + 12,
                top: currentStep.offset - PANEL_TOP_OFFSET,
              }}
              actions={
                <Button
                  size={ButtonSize.XSmall}
                  variant={ButtonVariant.Primary}
                  onClick={advance}
                >
                  {currentStep.cta}
                </Button>
              }
            />
          )}
        </div>
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
        >
          {`Panel opens: ${opens} · ${
            isTourDone ? 'seen — pill and tour retired' : 'pill still showing'
          }`}
        </Typography>
      </div>

      <Typography
        type={TypographyType.Caption1}
        color={TypographyColor.Quaternary}
        className="max-w-2xl"
      >
        The merge is the whole lesson: users of the old layout knew streaks and
        quests as two separate surfaces. The pill is the only always-on signal,
        and it retires as soon as the tour is finished or the panel has been
        opened {TOUR_MAX_OPENS} times — after that the tab is just a tab.
      </Typography>
    </div>
  );
};

const meta: Meta = {
  title: 'Sidebar Tutorial/12 Game Center intro',
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
        Streaks and quests used to be two surfaces; in the new rail they share
        one Streak tab. A tiny 2-in-1 pill marks the tab until the user looks,
        and hovering it opens the Game Center panel with a two-step micro-tour
        that runs inside the panel — the streak block first, the quests block
        second — so the explanation sits on the thing it explains.
      </Typography>
      <GameCenterDemo />
    </div>
  ),
};
