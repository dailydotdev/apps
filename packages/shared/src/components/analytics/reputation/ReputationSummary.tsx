import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../typography/Typography';
import { ReputationIcon, VIcon } from '../../icons';
import { IconSize } from '../../Icon';
import { reputation as reputationDocsUrl } from '../../../lib/constants';
import type { ReputationPeriod } from '../../../graphql/reputation';
import {
  amountColor,
  formatSignedAmount,
  getMilestoneProgress,
  reputationPeriodLabel,
} from './common';

interface ReputationSummaryProps {
  reputation: number;
  periodChange: number;
  period: ReputationPeriod;
}

export const ReputationSummary = ({
  reputation,
  periodChange,
  period,
}: ReputationSummaryProps): ReactElement => {
  const { reached, next, progress } = getMilestoneProgress(reputation);
  const unlocked = reached.flatMap((milestone) => milestone.unlocks);

  return (
    <div className="flex flex-col gap-5 rounded-16 border border-border-subtlest-tertiary p-4 tablet:flex-row tablet:gap-6 tablet:p-5">
      <div className="flex flex-col gap-1 tablet:w-48">
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          Your reputation
        </Typography>
        <span className="flex items-center gap-1">
          <ReputationIcon
            size={IconSize.Large}
            className="text-accent-onion-default"
          />
          <Typography
            type={TypographyType.LargeTitle}
            tag={TypographyTag.P}
            bold
            className="tabular-nums"
          >
            {reputation.toLocaleString('en-US')}
          </Typography>
        </span>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          <span
            className={`font-bold tabular-nums ${amountColor(periodChange)}`}
          >
            {formatSignedAmount(periodChange)}
          </span>{' '}
          {reputationPeriodLabel[period].toLowerCase()}
        </Typography>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        {next ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between gap-2">
              <Typography type={TypographyType.Callout} bold>
                Next at {next.reputation.toLocaleString('en-US')}
              </Typography>
              <Typography
                type={TypographyType.Footnote}
                color={TypographyColor.Tertiary}
                className="tabular-nums"
              >
                {(next.reputation - reputation).toLocaleString('en-US')} to go
              </Typography>
            </div>
            <div
              className="h-2 overflow-hidden rounded-4 bg-surface-float"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progress * 100)}
              aria-label={`Progress to ${next.reputation} reputation`}
            >
              <div
                className="h-full rounded-4 bg-accent-onion-default"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
            <ul className="flex flex-col gap-1">
              {next.unlocks.map((unlock) => (
                <li key={unlock}>
                  <Typography
                    type={TypographyType.Footnote}
                    color={TypographyColor.Secondary}
                  >
                    {unlock}
                  </Typography>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <Typography type={TypographyType.Callout} bold>
            You have unlocked everything reputation gives
          </Typography>
        )}
        {unlocked.length > 0 && (
          <details className="group">
            <summary className="cursor-pointer list-none text-text-tertiary typo-footnote hover:text-text-primary">
              {unlocked.length} unlocked so far
            </summary>
            <ul className="mt-2 flex flex-col gap-1">
              {unlocked.map((unlock) => (
                <li key={unlock} className="flex items-start gap-1">
                  <VIcon
                    size={IconSize.Size16}
                    className="text-status-success"
                  />
                  <Typography
                    type={TypographyType.Footnote}
                    color={TypographyColor.Secondary}
                    className="min-w-0 flex-1"
                  >
                    {unlock}
                  </Typography>
                </li>
              ))}
            </ul>
          </details>
        )}
        <a
          href={reputationDocsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-text-link typo-footnote hover:underline"
        >
          How reputation works
        </a>
      </div>
    </div>
  );
};
