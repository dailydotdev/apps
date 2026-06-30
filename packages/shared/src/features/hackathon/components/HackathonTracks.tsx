import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { FlexCol } from '../../../components/utilities/common';

const tracks = [
  {
    emoji: '🪞',
    name: 'Developer Identity',
    tagline: 'Tell developers something about themselves.',
    description:
      'Your daily.dev profile has a lot in it. What you read, what you save, what you follow, your tech stack, your career. Turn that into something a developer would want to showcase or share.',
    examples: [],
  },
  {
    emoji: '📊',
    name: 'Content Intelligence',
    tagline: 'Use daily.dev as a dataset.',
    description:
      'daily.dev pulls from 1,300+ sources. Tag feeds, source feeds, search, comments, recommendations. Turn all that data into something useful for other developers.',
    examples: [],
  },
  {
    emoji: '⚡',
    name: 'Content → Action',
    tagline: 'Turn reading into doing.',
    description:
      'Developers bookmark things for later and never come back to them. Build the bridge between reading on daily.dev and actually doing something with what you read.',
    examples: [],
  },
];

export const HackathonTracks = (): ReactElement => {
  return (
    <FlexCol className="w-full gap-7 text-center">
      <FlexCol className="items-center gap-2">
        <Typography type={TypographyType.Title3} bold>
          Three tracks. Pick one.
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Secondary}
          className="max-w-lg"
        >
          Each track is a different angle on the daily.dev API. Pick the one
          that fits what you want to build.
        </Typography>
      </FlexCol>
      <div className="flex flex-col gap-4 text-left tablet:flex-row">
        {tracks.map(({ emoji, name, tagline, description, examples }) => (
          <FlexCol
            key={name}
            className="flex-1 gap-3 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-5"
          >
            <span className="text-3xl">{emoji}</span>
            <Typography type={TypographyType.Title3} bold>
              {name}
            </Typography>
            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Secondary}
            >
              {tagline}
            </Typography>
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
            >
              {description}
            </Typography>
            {examples.length > 0 && (
              <FlexCol className="mt-1 gap-1">
                {examples.map((example) => (
                  <Typography
                    key={example}
                    type={TypographyType.Footnote}
                    color={TypographyColor.Tertiary}
                  >
                    {example}
                  </Typography>
                ))}
              </FlexCol>
            )}
          </FlexCol>
        ))}
      </div>
    </FlexCol>
  );
};
