import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { FlexCol } from '../../../components/utilities';
import {
  jobsHowItWorksOne,
  jobsHowItWorksThree,
  jobsHowItWorksTwo,
} from '../../../lib/image';

const VIDEO_ID = '80GzyJ3ejgU';

const howItWorks = [
  {
    image: jobsHowItWorksOne,
    title: 'Review the job in private',
    description:
      'You see the role, the context, and the company. You decide if it is worth your attention. No one knows you have been approached unless you say yes.',
  },
  {
    image: jobsHowItWorksTwo,
    title: 'We check real mutual interest',
    description:
      'We talk directly with the recruiter to confirm they are aligned with your expectations, and ready to respect your time before you invest another minute.',
  },
  {
    image: jobsHowItWorksThree,
    title: 'We make a warm intro',
    description:
      'Only if both sides say yes do we connect you directly. Every conversation starts with clear intent and good vibes.',
  },
];
export const OpportunityHowItWorks = (): ReactElement => {
  return (
    <FlexCol className="gap-7 text-center">
      <Typography type={TypographyType.Title3} bold>
        How it works
      </Typography>
      <div className="mx-auto w-full max-w-md overflow-hidden rounded-16">
        <div className="relative pt-[56.25%]">
          <iframe
            title="A developer-first way to find your next job"
            src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}`}
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="absolute inset-0 size-full border-0"
          />
        </div>
      </div>
      <div className="flex flex-col gap-4 text-left tablet:flex-row">
        {howItWorks.map(({ image, title, description }, index) => (
          <div
            className="flex flex-1 flex-row gap-4 tablet:flex-col tablet:gap-1"
            key={title}
          >
            <div className="relative mb-3">
              <img
                src={image}
                alt={title}
                className="h-24 w-24 rounded-16 object-cover tablet:w-full"
              />
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
