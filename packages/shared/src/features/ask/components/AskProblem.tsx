import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { FlexCol } from '../../../components/utilities';
import { SearchIcon, AiIcon, ShieldCheckIcon } from '../../../components/icons';

const problems = [
  {
    icon: <SearchIcon secondary />,
    title: 'Web search is noisy',
    description:
      "Your tools pull from random blogs, outdated StackOverflow answers, and SEO filler. Hard to tell what's actually trustworthy.",
  },
  {
    icon: <AiIcon />,
    title: 'AI makes things up',
    description:
      "Without good sources, AI tools confidently give you wrong answers. The code looks right but doesn't work.",
  },
  {
    icon: <ShieldCheckIcon secondary />,
    title: 'You need a quality filter',
    description:
      'daily-dev-ask only searches articles that real developers have read and upvoted. The community does the filtering for you.',
  },
];

export const AskProblem = (): ReactElement => {
  return (
    <FlexCol className="gap-4">
      <Typography type={TypographyType.Title3} bold center>
        Why not just use web search?
      </Typography>
      <div className="flex flex-col gap-4 text-center tablet:flex-row">
        {problems.map(({ icon, title, description }) => (
          <FlexCol className="flex-1 items-center gap-1" key={title}>
            {icon}
            <Typography type={TypographyType.Callout} bold className="mt-1.5">
              {title}
            </Typography>
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Secondary}
            >
              {description}
            </Typography>
          </FlexCol>
        ))}
      </div>
    </FlexCol>
  );
};
