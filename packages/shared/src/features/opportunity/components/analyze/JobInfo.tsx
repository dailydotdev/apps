import type { ReactNode } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../../components/typography/Typography';
import { Chip } from '../../../../components/cards/common/PostTags';
import { useOpportunityPreviewContext } from '../../context/OpportunityPreviewContext';
import { SeniorityLevel } from '../../protobuf/opportunity';
import { seniorityLevelMap } from '../../common';
import { ElementPlaceholder } from '../../../../components/ElementPlaceholder';

type JobInfoItemProps = {
  title: string;
  description?: string;
  children?: ReactNode;
};

const JobInfoItem = ({ title, description, children }: JobInfoItemProps) => {
  return (
    <div className="flex flex-col gap-1">
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
      >
        {title}
      </Typography>
      {description && (
        <Typography type={TypographyType.Subhead}>{description}</Typography>
      )}
      {children}
    </div>
  );
};

type JobInfoProps = {
  loadingStep: number;
};

export const JobInfo = ({ loadingStep }: JobInfoProps) => {
  const { opportunity } = useOpportunityPreviewContext();

  // Show after step 1 completes (Reading job description)
  if (!opportunity || loadingStep < 1) {
    return (
      <div className="flex flex-col gap-2">
        <ElementPlaceholder className="h-60 w-full rounded-8" />
      </div>
    );
  }

  const locationString =
    opportunity.locations
      ?.map((item) =>
        [
          item.location?.city,
          item.location?.subdivision,
          item.location?.country,
        ]
          .filter(Boolean)
          .join(', '),
      )
      .join(' / ') || 'Not specified';

  const seniorityLabel =
    seniorityLevelMap[
      opportunity.meta?.seniorityLevel ?? SeniorityLevel.UNSPECIFIED
    ];

  const requirements = opportunity.content?.overview?.content
    ? opportunity.content.overview.content.split('\n').filter(Boolean)
    : [];

  return (
    <div className="animate-fade-in flex flex-col gap-4">
      <JobInfoItem title="Job Title" description={opportunity.title} />
      <JobInfoItem title="Location" description={locationString} />
      <JobInfoItem title="Seniority" description={seniorityLabel} />
      {opportunity.keywords && opportunity.keywords.length > 0 && (
        <JobInfoItem title="Tech Stack">
          <div className="flex flex-wrap gap-2">
            {opportunity.keywords.map((tag) => (
              <Chip key={tag.keyword} className="!my-0 !text-text-tertiary">
                {tag.keyword}
              </Chip>
            ))}
          </div>
        </JobInfoItem>
      )}
      {requirements.length > 0 && (
        <JobInfoItem title="Key requirements">
          <ul className="list-disc pl-4 typo-callout">
            {requirements.slice(0, 3).map((req) => (
              <li key={req}>{req}</li>
            ))}
          </ul>
        </JobInfoItem>
      )}
      <div className="flex flex-col gap-1 rounded-16 bg-background-subtle px-4 py-2">
        <Typography type={TypographyType.Footnote} bold>
          Job details extracted automatically
        </Typography>
        <Typography type={TypographyType.Footnote}>
          We’ll refine everything in the next step.
          <br />
          This is just the high-level overview.
        </Typography>
      </div>
    </div>
  );
};
