import React from 'react';
import type { ReactElement } from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { WarningIcon } from '../icons';
import { IconSize } from '../Icon';
import type { Opportunity } from '../../features/opportunity/types';

export interface OpportunityCompletenessBarProps {
  opportunity: Opportunity;
  className?: string;
  excludeChecks?: string[];
  onMissingClick?: (sectionId: string) => void;
}

const checkKeyToSectionId: Record<string, string> = {
  title: 'roleInfo',
  tldr: 'roleInfo',
  keywords: 'roleInfo',
  location: 'roleInfo',
  employmentType: 'roleInfo',
  teamSize: 'roleInfo',
  salary: 'roleInfo',
  seniorityLevel: 'roleInfo',
  roleType: 'roleInfo',
  overview: 'overview',
  responsibilities: 'responsibilities',
  requirements: 'requirements',
  organization: 'company',
  whatYoullDo: 'whatYoullDo',
  interviewProcess: 'interviewProcess',
};

export interface CompletenessCheck {
  key: string;
  label: string;
  isComplete: boolean;
  required: boolean;
}

export const getCompletenessChecks = (
  opportunity: Opportunity,
): CompletenessCheck[] => {
  return [
    {
      key: 'title',
      label: 'Job title',
      isComplete: !!opportunity.title,
      required: true,
    },
    {
      key: 'tldr',
      label: 'Role TLDR',
      isComplete: !!opportunity.tldr,
      required: true,
    },
    {
      key: 'keywords',
      label: 'Tech stack / Keywords',
      isComplete: (opportunity.keywords?.length ?? 0) > 0,
      required: true,
    },
    {
      key: 'location',
      label: 'Location',
      isComplete: (opportunity.locations?.length ?? 0) > 0,
      required: true,
    },
    {
      key: 'employmentType',
      label: 'Employment type',
      isComplete: (opportunity.meta?.employmentType ?? 0) > 0,
      required: true,
    },
    {
      key: 'teamSize',
      label: 'Team size',
      isComplete: (opportunity.meta?.teamSize ?? 0) > 0,
      required: true,
    },
    {
      key: 'salary',
      label: 'Salary',
      isComplete:
        (opportunity.meta?.salary?.min ?? 0) > 0 &&
        (opportunity.meta?.salary?.max ?? 0) > 0 &&
        (opportunity.meta?.salary?.period ?? 0) > 0,
      required: true,
    },
    {
      key: 'seniorityLevel',
      label: 'Seniority level',
      isComplete: (opportunity.meta?.seniorityLevel ?? 0) > 0,
      required: true,
    },
    {
      key: 'roleType',
      label: 'Role type',
      isComplete: opportunity.meta?.roleType != null,
      required: true,
    },
    {
      key: 'overview',
      label: 'Overview',
      isComplete: !!opportunity.content?.overview?.html,
      required: true,
    },
    {
      key: 'responsibilities',
      label: 'Responsibilities',
      isComplete: !!opportunity.content?.responsibilities?.html,
      required: true,
    },
    {
      key: 'requirements',
      label: 'Requirements',
      isComplete: !!opportunity.content?.requirements?.html,
      required: true,
    },
    {
      key: 'organization',
      label: 'Company info',
      isComplete: !!opportunity.organization?.name,
      required: true,
    },
    {
      key: 'whatYoullDo',
      label: "What you'll do",
      isComplete: !!opportunity.content?.whatYoullDo?.html,
      required: false,
    },
    {
      key: 'interviewProcess',
      label: 'Interview process',
      isComplete: !!opportunity.content?.interviewProcess?.html,
      required: false,
    },
    {
      key: 'questions',
      label: 'Screening questions',
      isComplete: (opportunity.questions?.length ?? 0) > 0,
      required: false,
    },
  ];
};

/**
 * Check if the opportunity has missing required fields.
 * @param opportunity - The opportunity to check
 * @param excludeChecks - Keys to exclude from the check
 * @returns true if there are missing required fields
 */
export const hasMissingRequiredFields = (
  opportunity: Opportunity | undefined,
  excludeChecks: string[] = [],
): boolean => {
  if (!opportunity) {
    return true;
  }
  const checks = getCompletenessChecks(opportunity).filter(
    (c) => !excludeChecks.includes(c.key),
  );
  const requiredChecks = checks.filter((c) => c.required);
  const missingRequired = requiredChecks.filter((c) => !c.isComplete);
  return missingRequired.length > 0;
};

export const OpportunityCompletenessBar = ({
  opportunity,
  className,
  excludeChecks = [],
  onMissingClick,
}: OpportunityCompletenessBarProps): ReactElement | null => {
  const checks = getCompletenessChecks(opportunity).filter(
    (c) => !excludeChecks.includes(c.key),
  );
  const requiredChecks = checks.filter((c) => c.required);
  const completedRequired = requiredChecks.filter((c) => c.isComplete);
  const missingRequired = requiredChecks.filter((c) => !c.isComplete);

  const completionPercentage = Math.round(
    (completedRequired.length / requiredChecks.length) * 100,
  );

  const isComplete = missingRequired.length === 0;

  if (isComplete) {
    return null;
  }

  return (
    <div
      className={classNames(
        'sticky top-4 z-header flex flex-col gap-3 rounded-12 border border-status-warning bg-background-default p-4',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <WarningIcon className="text-status-warning" size={IconSize.Small} />
        <Typography type={TypographyType.Callout} bold>
          Job posting is {completionPercentage}% complete
        </Typography>
      </div>

      <div className="h-2 overflow-hidden rounded-4 bg-surface-float">
        <div
          className="h-full rounded-4 bg-status-warning transition-all duration-300"
          style={{ width: `${completionPercentage}%` }}
        />
      </div>

      {missingRequired.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
          >
            Missing:
          </Typography>
          {missingRequired.map((check, index) => {
            const hasSection = checkKeyToSectionId[check.key];
            const isClickable = onMissingClick && hasSection;

            if (isClickable) {
              return (
                <button
                  key={check.key}
                  type="button"
                  className="text-text-link underline decoration-1 underline-offset-4 typo-caption1 hover:text-text-link"
                  onClick={() => onMissingClick(check.key)}
                >
                  {check.label}
                  {index < missingRequired.length - 1 ? ',' : ''}
                </button>
              );
            }

            return (
              <Typography
                key={check.key}
                type={TypographyType.Caption1}
                color={TypographyColor.Primary}
              >
                {check.label}
                {index < missingRequired.length - 1 ? ',' : ''}
              </Typography>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OpportunityCompletenessBar;
