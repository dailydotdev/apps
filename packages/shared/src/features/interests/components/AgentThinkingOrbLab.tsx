import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { FlexCol, FlexRow } from '../../../components/utilities';
import { AgentThinkingOrb } from './AgentThinkingOrb';

const sizes = [20, 32, 96];

const notes = [
  {
    title: 'It is the real mark until it moves',
    body: 'Discs wide enough to leave no holes also spill about a third of the mark’s own area past its edge, which is what makes a grain field look bloated sitting still. So the path carries the resting pose and the grains grow in behind it as it leaves.',
  },
  {
    title: 'The count follows the size',
    body: 'Twenty pixels cannot hold three hundred grains — they stop reading as dots and turn to mush. The grid coarsens as the indicator shrinks so a grain keeps roughly the same weight on screen at every size.',
  },
  {
    title: 'Depth is size and alpha, nothing else',
    body: 'Real circles in space with a perspective divide, drawn back to front as plain canvas arcs. No filters, no shadows, no WebGL: it costs almost nothing and looks identical in every browser.',
  },
  {
    title: 'It stops when nobody is looking',
    body: 'One shared clock, so several orbs on a page move as one system. Drawing pauses offscreen and while the tab is hidden, and reduced motion gets the resting mark and no animation at all.',
  },
];

export const AgentThinkingOrbLab = (): ReactElement => (
  <div className="min-h-screen bg-background-default p-6 text-text-primary">
    <FlexCol className="mx-auto max-w-[52rem] gap-6">
      <FlexCol className="gap-1">
        <Typography type={TypographyType.Title3} bold>
          Thinking indicator
        </Typography>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          The mark breaks into a few hundred grains, they fly out and take up
          station on a slowly turning sphere, a wave travels through the surface
          while they wait, and then they come home and reassemble. The same ink
          makes the trip both ways — nothing fades in or out.
        </Typography>
      </FlexCol>

      <FlexCol className="gap-6 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-6">
        <FlexRow className="items-end gap-10">
          {sizes.map((size) => (
            <FlexCol key={size} className="items-center gap-2">
              <span className="text-text-primary">
                <AgentThinkingOrb size={size} />
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
          <span className="shrink-0 text-text-primary">
            <AgentThinkingOrb size={22} />
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

      <div className="grid grid-cols-1 gap-4 laptop:grid-cols-2">
        {notes.map(({ title, body }) => (
          <FlexCol
            key={title}
            className="gap-1 rounded-16 border border-border-subtlest-tertiary p-5"
          >
            <Typography type={TypographyType.Callout} bold>
              {title}
            </Typography>
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
            >
              {body}
            </Typography>
          </FlexCol>
        ))}
      </div>
    </FlexCol>
  </div>
);
