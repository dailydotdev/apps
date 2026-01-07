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
}

interface CompletenessCheck {
  key: string;
  label: string;
  isComplete: boolean;
  required: boolean;
}

const getCompletenessChecks = (
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
      key: 'recruiter',
      label: 'Recruiter profile',
      isComplete: (opportunity.recruiters?.length ?? 0) > 0,
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

export const OpportunityCompletenessBar = ({
  opportunity,
  className,
}: OpportunityCompletenessBarProps): ReactElement | null => {
  const checks = getCompletenessChecks(opportunity);
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
        'bg-status-warning/10 flex flex-col gap-3 rounded-12 border border-status-warning p-4',
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
          {missingRequired.map((check, index) => (
            <Typography
              key={check.key}
              type={TypographyType.Caption1}
              color={TypographyColor.Primary}
            >
              {check.label}
              {index < missingRequired.length - 1 ? ',' : ''}
            </Typography>
          ))}
        </div>
      )}
    </div>
  );
};

export default OpportunityCompletenessBar;
