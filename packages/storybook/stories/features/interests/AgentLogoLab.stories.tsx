import type { ReactElement } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { FlexCol, FlexRow } from '@dailydotdev/shared/src/components/utilities';
import type { AgentThinkingMarkVariant } from '@dailydotdev/shared/src/features/interests/components/AgentThinkingMark';
import { AgentThinkingMark } from '@dailydotdev/shared/src/features/interests/components/AgentThinkingMark';

const variants: {
  variant: AgentThinkingMarkVariant;
  title: string;
  description: string;
}[] = [
  {
    variant: 'wave',
    title: '1 · Wave',
    description:
      'The current production pick. Each stroke hops with a small tilt, staggered left-to-right so one wave rolls across the mark, then the assembled logo rests for the back half of the loop.',
  },
  {
    variant: 'sheen',
    title: '2 · Sheen',
    description:
      'Nothing moves. A dim wave passes through the strokes like light sweeping an embossed mark. The quietest option — for surfaces where motion would compete.',
  },
  {
    variant: 'pulse',
    title: '3 · Pulse',
    description:
      'The whole logo breathes once per loop, tail flaring at the top of the breath. Calm, organic, reads at any size.',
  },
  {
    variant: 'blink',
    title: '4 · Blink',
    description:
      'The three strokes dim in sequence — the logo as its own typing indicator. The most instantly legible "thinking" signal.',
  },
  {
    variant: 'slide',
    title: '5 · Slide',
    description:
      "The outer strokes slide apart along the mark's own diagonal and lock back with a slight overshoot. Disassembly and reassembly on the logo's native axis.",
  },
  {
    variant: 'tilt',
    title: '6 · Tilt',
    description:
      'A metronome: the assembled logo swings a few degrees each way. Steady and rhythmic — deliberately mechanical, like a process ticking.',
  },
  {
    variant: 'heartbeat',
    title: '7 · Heartbeat',
    description:
      'Two quick scale thumps then a long rest, like a pulse monitor. The most "alive" of the whole-mark options.',
  },
  {
    variant: 'flip',
    title: '8 · Flip',
    description:
      'A card flip — the logo squashes flat on its vertical axis with a brightness kick at the flat point, then springs back. It never mirrors, so every visible frame stays readable.',
  },
  {
    variant: 'bloom',
    title: '9 · Bloom',
    description:
      'The strokes collapse toward the centre and bloom back out with an overshoot. A gather-and-release breath built from the pieces rather than the whole.',
  },
  {
    variant: 'wipe',
    title: '10 · Wipe',
    description:
      'The logo draws itself on with a left-to-right reveal, holds fully assembled, then cuts out and starts again. Feels like the mark being written.',
  },
];

const sizes = [
  { label: '20px — status strip', className: 'size-5' },
  { label: '32px', className: 'size-8' },
  { label: '96px', className: 'h-24 w-[10.5rem]' },
];

const VariantCard = ({
  variant,
  title,
  description,
}: (typeof variants)[number]): ReactElement => (
  <FlexCol className="gap-4 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-5">
    <FlexCol className="gap-1">
      <Typography type={TypographyType.Body} bold>
        {title}
      </Typography>
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
      >
        {description}
      </Typography>
    </FlexCol>

    <FlexRow className="items-end gap-8">
      {sizes.map(({ label, className }) => (
        <FlexCol key={label} className="items-center gap-2">
          <span className={`${className} text-brand-default`}>
            <AgentThinkingMark variant={variant} />
          </span>
          <Typography
            type={TypographyType.Caption2}
            color={TypographyColor.Quaternary}
          >
            {label}
          </Typography>
        </FlexCol>
      ))}
    </FlexRow>

    {/* The size that actually ships: inline on the transcript status strip. */}
    <FlexRow className="items-center gap-2 rounded-12 bg-surface-float px-3 py-2">
      <span className="size-5 shrink-0 text-brand-default">
        <AgentThinkingMark variant={variant} />
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
          Logo thinking-mark lab
        </Typography>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          Ten explorations of the daily.dev mark as a working indicator. Every
          loop presents the intact logo for part of its cycle; all are pure CSS
          on the same three-stroke SVG, so the pick is a one-prop change.
        </Typography>
      </FlexCol>
      <div className="grid grid-cols-1 gap-4 laptop:grid-cols-2">
        {variants.map((entry) => (
          <VariantCard key={entry.variant} {...entry} />
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
