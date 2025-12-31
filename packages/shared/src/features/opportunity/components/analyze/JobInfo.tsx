import type { ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../../components/typography/Typography';
import { useOpportunityPreviewContext } from '../../context/OpportunityPreviewContext';
import { SeniorityLevel } from '../../protobuf/opportunity';
import { seniorityLevelMap } from '../../common';
import { ElementPlaceholder } from '../../../../components/ElementPlaceholder';

type JobInfoItemProps = {
  label: string;
  value?: string;
  children?: ReactNode;
  className?: string;
};

const JobInfoItem = ({
  label,
  value,
  children,
  className,
}: JobInfoItemProps) => {
  return (
    <div className={classNames('flex flex-col gap-1', className)}>
      <Typography
        type={TypographyType.Caption1}
        color={TypographyColor.Tertiary}
        className="uppercase tracking-wider"
      >
        {label}
      </Typography>
      {value && (
        <Typography type={TypographyType.Body} color={TypographyColor.Primary}>
          {value}
        </Typography>
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
      <div className="grid gap-4 tablet:grid-cols-2">
        <div className="flex flex-col gap-2">
          <ElementPlaceholder className="h-3 w-16 rounded-4" />
          <ElementPlaceholder className="h-5 w-48 rounded-4" />
        </div>
        <div className="flex flex-col gap-2">
          <ElementPlaceholder className="h-3 w-16 rounded-4" />
          <ElementPlaceholder className="h-5 w-36 rounded-4" />
        </div>
        <div className="flex flex-col gap-2">
          <ElementPlaceholder className="h-3 w-16 rounded-4" />
          <ElementPlaceholder className="h-5 w-24 rounded-4" />
        </div>
        <div className="flex flex-col gap-2">
          <ElementPlaceholder className="h-3 w-16 rounded-4" />
          <div className="flex flex-wrap gap-2">
            <ElementPlaceholder className="h-6 w-16 rounded-6" />
            <ElementPlaceholder className="h-6 w-20 rounded-6" />
            <ElementPlaceholder className="h-6 w-14 rounded-6" />
          </div>
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
      .join(' · ') || 'Not specified';

  const seniorityLabel =
    seniorityLevelMap[
      opportunity.meta?.seniorityLevel ?? SeniorityLevel.UNSPECIFIED
    ];

  const requirements = opportunity.content?.overview?.content
    ? opportunity.content.overview.content.split('\n').filter(Boolean)
    : [];

  return (
    <div className="flex flex-col gap-5">
      {/* Primary info grid */}
      <div className="grid gap-4 tablet:grid-cols-2">
        <JobInfoItem label="Position" value={opportunity.title} />
        <JobInfoItem label="Location" value={locationString} />
        <JobInfoItem label="Seniority" value={seniorityLabel} />

        {opportunity.keywords && opportunity.keywords.length > 0 && (
          <JobInfoItem label="Tech Stack">
            <div className="flex flex-wrap gap-1.5">
              {opportunity.keywords.slice(0, 8).map((tag) => (
                <Typography
                  key={tag.keyword}
                  type={TypographyType.Footnote}
                  color={TypographyColor.Secondary}
                  className="rounded-6 bg-surface-float px-2 py-0.5"
                >
                  {tag.keyword}
                </Typography>
              ))}
              {opportunity.keywords.length > 8 && (
                <Typography
                  type={TypographyType.Footnote}
                  color={TypographyColor.Tertiary}
                  className="rounded-6 border border-border-subtlest-tertiary bg-surface-float px-2 py-0.5"
                >
                  +{opportunity.keywords.length - 8}
                </Typography>
              )}
            </div>
          </JobInfoItem>
        )}
      </div>

      {/* Requirements section */}
      {requirements.length > 0 && (
        <div className="border-t border-border-subtlest-tertiary pt-4">
          <JobInfoItem label="Key requirements">
            <ul className="mt-1 space-y-1.5">
              {requirements.slice(0, 3).map((req) => (
                <li key={req} className="flex items-start gap-2">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-text-tertiary" />
                  <Typography
                    type={TypographyType.Callout}
                    color={TypographyColor.Secondary}
                    className="min-w-0 flex-1"
                  >
                    {req}
                  </Typography>
                </li>
              ))}
            </ul>
          </JobInfoItem>
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
