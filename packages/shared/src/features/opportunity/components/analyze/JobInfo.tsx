import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../../components/typography/Typography';
import { useOpportunityPreviewContext } from '../../context/OpportunityPreviewContext';
import { SeniorityLevel } from '../../protobuf/opportunity';
import { seniorityLevelMap } from '../../common';
import { ElementPlaceholder } from '../../../../components/ElementPlaceholder';
import { Chip } from '../../../../components/cards/common/PostTags';

type JobInfoProps = {
  loadingStep: number;
};

export const JobInfo = ({ loadingStep }: JobInfoProps) => {
  const { opportunity } = useOpportunityPreviewContext();

  if (!opportunity || loadingStep < 1) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <ElementPlaceholder className="rounded h-5 w-48" />
          <ElementPlaceholder className="rounded h-3 w-32" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <ElementPlaceholder className="h-6 w-16 rounded-8" />
          <ElementPlaceholder className="h-6 w-20 rounded-8" />
          <ElementPlaceholder className="h-6 w-14 rounded-8" />
        </div>
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
      .join(' · ') || 'Location not specified';

  const seniorityLabel =
    seniorityLevelMap[
      opportunity.meta?.seniorityLevel ?? SeniorityLevel.UNSPECIFIED
    ];

  return (
    <div className="flex flex-col gap-4">
      {/* Title and meta */}
      <div>
        <Typography type={TypographyType.Title3} bold>
          {opportunity.title}
        </Typography>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            {locationString}
          </Typography>
          {seniorityLabel && (
            <>
              <span className="text-text-quaternary">·</span>
              <Typography
                type={TypographyType.Footnote}
                color={TypographyColor.Tertiary}
              >
                {seniorityLabel}
              </Typography>
            </>
          )}
        </div>
      </div>

      {/* Tech stack */}
      {opportunity.keywords && opportunity.keywords.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {opportunity.keywords.slice(0, 10).map((tag) => (
            <Chip key={tag.keyword} className="!my-0">
              #{tag.keyword}
            </Chip>
          ))}
          {opportunity.keywords.length > 10 && (
            <Chip className="!my-0">+{opportunity.keywords.length - 10}</Chip>
          )}
        </div>
      )}

      {/* Footer note */}
      <div className="rounded-8 bg-surface-float px-3 py-2">
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
        >
          ✨ We&apos;ll refine these details in the next step
        </Typography>
      </div>
    </div>
  );
};
