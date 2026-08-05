import type { ReactElement } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { FlexCol, FlexRow } from '@dailydotdev/shared/src/components/utilities';
import { AgentThinkingOrb } from '@dailydotdev/shared/src/features/interests/components/AgentThinkingOrb';
import type { ThinkingOrbState } from '@dailydotdev/shared/src/features/interests/thinkingOrb';

/**
 * The thinking indicator, rebuilt as a particle system rather than a set of
 * keyframe tricks: the daily.dev mark is the attractor, and each state is a
 * different force field over the dots sampled around its outline.
 */
const states: {
  state: ThinkingOrbState;
  title: string;
  technique: string;
  description: string;
}[] = [
  {
    state: 'working',
    title: '1 · Working',
    technique: 'travelling attention beads, arc-length driven',
    description:
      'Three beads of attention — one per stroke — run the outlines at their own pace. Dots lift out of the plane and swell as a bead passes, so the mark reads as being traversed, not merely lit. The most literal "it is working through something".',
  },
  {
    state: 'thinking',
    title: '2 · Thinking',
    technique: 'per-dot orbits + smooth-noise focus',
    description:
      'Every dot circles its own home on its own radius, and the whole field tightens and loosens on value noise. The logo drifts in and out of focus and never lands on a beat, because there is no beat — nothing here is periodic.',
  },
  {
    state: 'searching',
    title: '3 · Searching',
    technique: 'sweeping meridian, settle-behind',
    description:
      'A raked line sweeps the mark. Ahead of it the dots hover unsettled; the line pushes them forward as it passes and they drop into place behind it. Directional, so it reads as progress rather than activity.',
  },
  {
    state: 'weaving',
    title: '4 · Weaving',
    technique: 'advection along the outline, alternating direction',
    description:
      'Nothing sits still: every dot travels around its own stroke, and neighbouring strokes run opposite ways. The mark is drawn entirely by traffic. The closest this set gets to reading as computation.',
  },
  {
    state: 'assembling',
    title: '5 · Assembling',
    technique: 'scatter and magnetic re-formation',
    description:
      'The field disperses and is pulled back, solid mark fading with it. The dispersal is a scatter, not a sphere — the logo is the only shape this system ever makes, so it always resolves to us.',
  },
];

const sizes = [20, 32, 96];

const StateCard = ({
  state,
  title,
  technique,
  description,
}: (typeof states)[number]): ReactElement => (
  <FlexCol className="gap-4 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-5">
    <FlexCol className="gap-1">
      <Typography type={TypographyType.Body} bold>
        {title}
      </Typography>
      <Typography type={TypographyType.Caption1} color={TypographyColor.Link}>
        {technique}
      </Typography>
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
      >
        {description}
      </Typography>
    </FlexCol>

    <FlexRow className="items-end gap-8">
      {sizes.map((size) => (
        <FlexCol key={size} className="items-center gap-2">
          <span className="text-brand-default">
            <AgentThinkingOrb state={state} size={size} />
          </span>
          <Typography
            type={TypographyType.Caption2}
            color={TypographyColor.Quaternary}
          >
            {size}px
          </Typography>
        </FlexCol>
      ))}
    </FlexRow>

    {/* The size that actually ships: inline on the transcript status strip. */}
    <FlexRow className="items-center gap-2 rounded-12 bg-surface-float px-3 py-2">
      <span className="shrink-0 text-brand-default">
        <AgentThinkingOrb state={state} size={22} />
      </span>
      <Typography type={TypographyType.Footnote} bold>
        Working
      </Typography>
      <Typography
        type={TypographyType.Caption1}
        color={TypographyColor.Tertiary}
        className="tabular-nums"
      >
        12s
      </Typography>
      <span className="size-0.5 rounded-6 bg-text-quaternary" />
      <Typography
        type={TypographyType.Caption1}
        color={TypographyColor.Tertiary}
      >
        Explore more
      </Typography>
    </FlexRow>
  </FlexCol>
);

const Lab = (): ReactElement => (
  <div className="min-h-screen bg-background-default p-6 text-text-primary">
    <FlexCol className="mx-auto max-w-[70rem] gap-6">
      <FlexCol className="gap-1">
        <Typography type={TypographyType.Title3} bold>
          Thinking indicator lab
        </Typography>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          One engine, five states. The mark is not animated as a picture — it is
          the attractor of a particle field sampled from its own outline, and
          each state is a different force over those dots. Nothing loops:
          positions come from travelling waves and smooth noise, so the logo is
          continuously assembling instead of replaying. Plain 2D canvas arcs,
          depth carried by size and alpha alone, theme-coloured through
          currentColor, paused when offscreen, static under reduced motion.
        </Typography>
      </FlexCol>
      <div className="grid grid-cols-1 gap-4 laptop:grid-cols-2">
        {states.map((entry) => (
          <StateCard key={entry.state} {...entry} />
        ))}
      </div>
    </FlexCol>
  </div>
);

const meta: Meta = {
  title: 'Features/Interests/AgentLogoLab',
  parameters: { layout: 'fullscreen' },
  render: () => <Lab />,
};

export default meta;

export const Default: StoryObj = {};
