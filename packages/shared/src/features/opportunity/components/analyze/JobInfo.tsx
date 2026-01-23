import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../../components/typography/Typography';
import { useOpportunityPreviewContext } from '../../context/OpportunityPreviewContext';
import { SeniorityLevel, SalaryPeriod } from '../../protobuf/opportunity';
import { LocationType } from '../../protobuf/util';
import { seniorityLevelMap } from '../../common';
import { ElementPlaceholder } from '../../../../components/ElementPlaceholder';
import { Chip } from '../../../../components/cards/common/PostTags';
import type { Salary } from '../../types';

const locationTypeMap: Record<LocationType, string | null> = {
  [LocationType.UNSPECIFIED]: null,
  [LocationType.REMOTE]: 'Remote',
  [LocationType.OFFICE]: 'On-site',
  [LocationType.HYBRID]: 'Hybrid',
};

const salaryPeriodMap: Record<SalaryPeriod, string> = {
  [SalaryPeriod.UNSPECIFIED]: 'year',
  [SalaryPeriod.ANNUAL]: 'year',
  [SalaryPeriod.MONTHLY]: 'month',
  [SalaryPeriod.WEEKLY]: 'week',
  [SalaryPeriod.DAILY]: 'day',
  [SalaryPeriod.HOURLY]: 'hour',
};

const formatSalary = (salary?: Salary): string | null => {
  if (!salary?.min || !salary?.max) {
    return null;
  }
  const min = salary.min / 1000;
  const max = salary.max / 1000;
  const period = salaryPeriodMap[salary.period ?? SalaryPeriod.UNSPECIFIED];
  return `$${min}k - $${max}k/${period}`;
};

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

  const { locations, meta, title, tldr, keywords } = opportunity;

  const locationString =
    locations
      ?.map((item) =>
        [
          item.location?.city,
          item.location?.subdivision,
          item.location?.country,
        ]
          .filter(Boolean)
          .join(', '),
      )
      .join(' · ') || null;

  const seniorityLabel =
    seniorityLevelMap[meta?.seniorityLevel ?? SeniorityLevel.UNSPECIFIED];

  const workArrangement =
    locationTypeMap[locations?.[0]?.type ?? LocationType.UNSPECIFIED];

  const salaryRange = formatSalary(meta?.salary);

  // Build meta items array for clean rendering
  const metaItems = [
    locationString,
    seniorityLabel !== 'N/A' ? seniorityLabel : null,
    workArrangement,
    salaryRange,
  ].filter(Boolean);

  return (
    <div className="flex flex-col gap-4">
      {/* Title and meta */}
      <div>
        <Typography type={TypographyType.Title3} bold>
          {title}
        </Typography>
        {metaItems.length > 0 && (
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
            {metaItems.map((item, index) => (
              <React.Fragment key={item}>
                {index > 0 && <span className="text-text-quaternary">·</span>}
                <Typography
                  type={TypographyType.Footnote}
                  color={TypographyColor.Tertiary}
                  truncate
                >
                  {item}
                </Typography>
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      {/* TLDR */}
      {tldr && (
        <Typography
          type={TypographyType.Body}
          color={TypographyColor.Secondary}
        >
          <span className="font-bold text-text-primary">TLDR</span> {tldr}
        </Typography>
      )}

      {/* Tech stack */}
      {keywords && keywords.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {keywords.slice(0, 10).map((tag) => (
            <Chip key={tag.keyword} className="!my-0">
              #{tag.keyword}
            </Chip>
          ))}
          {keywords.length > 10 && (
            <Chip className="!my-0">+{keywords.length - 10}</Chip>
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
