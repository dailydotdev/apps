import type { ReactElement } from 'react';
import React from 'react';
import Link from '../../utilities/Link';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import { Tooltip } from '../../tooltip/Tooltip';
import type {
  ReputationTarget,
  ReputationTopSource,
} from '../../../graphql/reputation';
import { ReputationTargetType } from '../../../graphql/reputation';
import { formatSignedAmount, REPUTATION_GRANT_THRESHOLD } from './common';

const targetPrefix: Record<ReputationTargetType, string> = {
  [ReputationTargetType.Post]: 'Post',
  [ReputationTargetType.Comment]: 'Comment on',
  [ReputationTargetType.Source]: 'Source',
};

const countedCopy = `Only upvotes from members with ${REPUTATION_GRANT_THRESHOLD}+ reputation give reputation, up to a few per member each day.`;

interface ReputationTopSourcesProps {
  sources: ReputationTopSource[];
}

export const ReputationTopSources = ({
  sources,
}: ReputationTopSourcesProps): ReactElement => {
  // A deleted post or comment has nothing to open, so it drops off the list.
  const available = sources.filter(
    (source): source is ReputationTopSource & { target: ReputationTarget } =>
      !!source.target,
  );

  if (!available.length) {
    return (
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Tertiary}
      >
        Posts and comments that earn you reputation show up here
      </Typography>
    );
  }

  return (
    <ol className="flex flex-col">
      {available.map(({ target, amount, upvotes, countedUpvotes }) => (
        <li
          key={target.id}
          className="flex items-center gap-3 border-t border-border-subtlest-tertiary py-2.5 first:border-t-0 first:pt-0"
        >
          <Typography
            type={TypographyType.Footnote}
            bold
            className="w-12 shrink-0 tabular-nums text-status-success"
          >
            {formatSignedAmount(amount)}
          </Typography>
          <div className="flex min-w-0 flex-1 flex-col">
            <Link href={target.permalink} passHref>
              <a className="min-w-0 shrink truncate text-text-primary typo-footnote hover:underline">
                <span className="text-text-tertiary">
                  {targetPrefix[target.type]}{' '}
                </span>
                {target.title}
              </a>
            </Link>
            {upvotes !== null && countedUpvotes !== null && (
              <Tooltip content={countedCopy}>
                <Typography
                  type={TypographyType.Caption1}
                  color={TypographyColor.Tertiary}
                  className="w-fit tabular-nums"
                >
                  {countedUpvotes.toLocaleString('en-US')} of{' '}
                  {upvotes.toLocaleString('en-US')} upvotes counted
                </Typography>
              </Tooltip>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
};
