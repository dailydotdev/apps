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
import { CoachCard, DemoStage } from './mockSidebar';

interface GlowStep {
  region: RailRegion;
  caption: string;
}

const GLOW_SEQUENCE: GlowStep[] = [
  { region: 'logo', caption: 'The logo — Home moved here.' },
  { region: 'tabs', caption: 'The tabs — Explore, You, Squads and Streak.' },
  { region: 'dock', caption: 'The dock — your pinned pages.' },
];

const GLOW_DURATION_MS = 600;
const PANEL_LEFT = 72;
const IDLE_CAPTION =
  'Press “See what changed” to walk the three regions that moved.';

// The stage clips its overflow, so the quiet banner and its explainer sit just
// above the dock rather than at the dock's own y, which would run off the edge.
const BANNER_TOP = 380;
const EXPLAINER_TOP = 424;

const NewPill = (): JSX.Element => (
  <span className="w-fit rounded-6 bg-accent-cabbage-flat px-1.5 py-0.5 text-accent-cabbage-default typo-caption2">
    NEW
  </span>
);

const WhatsNewCard = (): JSX.Element => {
  const [dismissed, setDismissed] = useState(false);
  const [glowIndex, setGlowIndex] = useState(-1);

  const isPlaying = glowIndex >= 0 && glowIndex < GLOW_SEQUENCE.length;
  const activeStep = isPlaying ? GLOW_SEQUENCE[glowIndex] : null;

  useEffect(() => {
    if (!isPlaying) {
      return undefined;
    }

    const timer = setTimeout(
      () => setGlowIndex(glowIndex + 1),
      GLOW_DURATION_MS,
    );

    return () => clearTimeout(timer);
  }, [glowIndex, isPlaying]);

  const reset = () => {
    setDismissed(false);
    setGlowIndex(-1);
  };

  const captionForState = () => {
    if (activeStep) {
      return activeStep.caption;
    }

    return glowIndex >= GLOW_SEQUENCE.length
      ? 'That is the whole reorg — three regions, nothing else moved.'
      : IDLE_CAPTION;
  };

  return (
    <div className="flex flex-col gap-4 bg-background-default p-6">
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Tertiary}
      >
        In-flow announcement, delivered through the sidebar announcements slot
        rather than an overlay. It shows up on the first session after the
        switch, states the change in one benefit-framed line, and its CTA
        replays the reorg on the real rail instead of opening a changelog.
      </Typography>

      <DemoStage rail={{ glow: activeStep?.region ?? null }}>
        <div
          className="z-20 absolute flex w-80 flex-col gap-3 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-3"
          style={{ left: PANEL_LEFT, top: 24 }}
        >
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Quaternary}
          >
            Sidebar panel
          </Typography>

          {dismissed ? (
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Quaternary}
            >
              Announcement dismissed — it will not come back this session.
            </Typography>
          ) : (
            <div className="relative flex flex-col gap-2 rounded-14 border border-border-subtlest-tertiary bg-surface-float p-3">
              <NewPill />
              <Typography bold type={TypographyType.Callout}>
                Your sidebar, reorganized
              </Typography>
              <Typography
                type={TypographyType.Footnote}
                color={TypographyColor.Tertiary}
              >
                Navigation moved into the rail on the left, and Home now lives
                on the logo.
              </Typography>
              <Button
                className="mt-1 w-fit"
                size={ButtonSize.XSmall}
                variant={ButtonVariant.Primary}
                onClick={() => setGlowIndex(0)}
              >
                See what changed
              </Button>
              <CloseButton
                size={ButtonSize.XSmall}
                className="z-10 absolute right-1 top-1"
                onClick={() => setDismissed(true)}
              />
            </div>
          )}
        </div>
      </DemoStage>

      <div className="flex items-center gap-3">
        <Typography
          type={TypographyType.Footnote}
          color={
            activeStep ? TypographyColor.Primary : TypographyColor.Quaternary
          }
        >
          {captionForState()}
        </Typography>
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

const MinimalBanner = (): JSX.Element => {
  const [dismissed, setDismissed] = useState(false);
  const [explained, setExplained] = useState(false);

  const reset = () => {
    setDismissed(false);
    setExplained(false);
  };

  return (
    <div className="flex flex-col gap-4 bg-background-default p-6">
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Tertiary}
      >
        The quiet end of the same idea: one line above the dock, no card, no
        pill, no CTA competing with the feed. The “?” carries the explanation
        for whoever wants it, which keeps the announcement retrievable without
        ever interrupting.
      </Typography>

      <DemoStage>
        {!dismissed && (
          <div
            className="z-20 absolute flex items-center gap-2 rounded-10 border border-border-subtlest-tertiary bg-background-subtle px-2 py-1 shadow-2-black"
            style={{ left: PANEL_LEFT, top: BANNER_TOP }}
          >
            <Typography
              type={TypographyType.Caption1}
              color={TypographyColor.Tertiary}
            >
              Your sidebar was reorganized
            </Typography>
            <button
              type="button"
              aria-label="What changed"
              onClick={() => setExplained((current) => !current)}
              className="flex size-5 items-center justify-center rounded-full bg-surface-float text-text-tertiary typo-caption2"
            >
              ?
            </button>
            <CloseButton
              size={ButtonSize.XSmall}
              onClick={() => setDismissed(true)}
            />
          </div>
        )}

        {!dismissed && explained && (
          <CoachCard
            title="What moved"
            body="Home is on the logo, navigation became rail tabs with hover panels, and your pinned pages live in the dock below."
            style={{ left: PANEL_LEFT, top: EXPLAINER_TOP }}
          />
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
  title: "Sidebar Tutorial/07 What's-new card",
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj;

export const Default: Story = { render: () => <WhatsNewCard /> };

export const Minimal: Story = { render: () => <MinimalBanner /> };
