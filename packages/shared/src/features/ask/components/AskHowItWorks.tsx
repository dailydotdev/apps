import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { FlexCol } from '../../../components/utilities';

const steps = [
  {
    emoji: '💬',
    title: 'You ask a question',
    description:
      'Just type your question, like "How do I set up auth in Next.js?" or "What\'s the best way to handle state in React?"',
  },
  {
    emoji: '🔍',
    title: 'Your agent searches daily.dev',
    description:
      'Instead of searching the whole internet, it looks through developer articles that have been upvoted by the community.',
  },
  {
    emoji: '✅',
    title: 'You get a real answer',
    description:
      'Every answer links back to the actual articles so you can read them yourself. Nothing made up.',
  },
];

export const AskHowItWorks = (): ReactElement => {
  return (
    <FlexCol className="gap-7 text-center">
      <Typography type={TypographyType.Title3} bold>
        How it works
      </Typography>
      <div className="flex flex-col gap-4 text-left tablet:flex-row">
        {steps.map(({ emoji, title, description }, index) => (
          <div
            className="flex flex-1 flex-row gap-4 tablet:flex-col tablet:gap-1 tablet:text-center"
            key={title}
          >
            <div className="relative mb-3 flex h-24 w-24 items-center justify-center rounded-16 bg-surface-float tablet:w-full">
              <span className="text-4xl">{emoji}</span>
              <div className="absolute bottom-[0.625rem] left-[0.625rem] size-[1.875rem] rounded-10 bg-surface-invert">
                <div className="flex size-full items-center justify-center">
                  <Typography type={TypographyType.Body} bold>
                    {index + 1}
                  </Typography>
                </div>
              </div>
            </div>
            <div className="flex flex-shrink flex-col gap-1">
              <Typography type={TypographyType.Callout} bold>
                {title}
              </Typography>
              <Typography
                type={TypographyType.Footnote}
                color={TypographyColor.Secondary}
              >
                {description}
              </Typography>
            </div>
          </div>
        ))}
      </div>
    </FlexCol>
  );
};
