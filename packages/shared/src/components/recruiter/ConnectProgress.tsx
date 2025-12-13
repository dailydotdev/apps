import type { ReactElement } from 'react';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { ArrowIcon, InfoIcon } from '../icons';
import { IconSize } from '../Icon';
import { FlexCol, FlexRow } from '../utilities';
import { Tooltip } from '../tooltip/Tooltip';
import { opportunityStatsOptions } from '../../features/opportunity/queries';

interface ProgressStep {
  label: string;
  count: number;
  info: string;
}

export const ConnectProgress = (): ReactElement => {
  const router = useRouter();
  const { opportunityId } = router.query;
  const { data: stats } = useQuery({
    ...opportunityStatsOptions({ opportunityId: opportunityId as string }),
    enabled: !!opportunityId,
  });
  const steps: ProgressStep[] = [
    {
      label: 'Reached',
      count: stats?.reached ?? 0,
      info: 'Candidates who have been notified about your opportunity and received the job details',
    },
    {
      label: 'Considered',
      count: stats?.considered ?? 0,
      info: 'Developers actively reviewing your opportunity and deciding whether to apply',
    },
    {
      label: 'Decided',
      count: stats?.decided ?? 0,
      info: 'Candidates who have made a decision to either apply or pass on this opportunity',
    },
    {
      label: 'For review',
      count: stats?.forReview ?? 0,
      info: 'Applications ready for your review - these candidates have expressed interest and completed screening questions',
    },
    {
      label: 'Introduced',
      count: stats?.introduced ?? 0,
      info: 'Candidates you have moved forward and introduced to your hiring team',
    },
  ];

  return (
    <FlexRow className="items-center p-4">
      {steps.map((step, index) => (
        <React.Fragment key={step.label}>
          <Tooltip content={step.info}>
            <div className="flex flex-1 flex-row justify-between gap-1 rounded-16 border border-border-subtlest-tertiary bg-background-default px-4 py-2">
              <FlexCol className="gap-1">
                <Typography
                  type={TypographyType.Footnote}
                  color={TypographyColor.Tertiary}
                >
                  {step.label}
                </Typography>
                <Typography type={TypographyType.Title3} bold>
                  {step.count}
                </Typography>
              </FlexCol>
              <InfoIcon size={IconSize.Size16} className="text-text-tertiary" />
            </div>
          </Tooltip>

          {index < steps.length - 1 && (
            <div className="z-3 -mx-2 flex items-center rounded-10 border border-border-subtlest-tertiary bg-background-default p-0.5">
              <ArrowIcon
                size={IconSize.Small}
                className="rotate-90 text-text-tertiary"
              />
            </div>
          )}
        </React.Fragment>
      ))}
    </FlexRow>
  );
};
