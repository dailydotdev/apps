import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { format, parseISO } from 'date-fns';
import Link from '../../utilities/Link';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import { DateFormat } from '../../utilities/DateFormat';
import { TimeFormatType } from '../../../lib/dateFormat';
import { IconSize } from '../../Icon';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import type { ReputationEvent } from '../../../graphql/reputation';
import { ReputationEventFilter } from '../../../graphql/reputation';
import { amountColor, formatSignedAmount, getReasonMeta } from './common';

const filterLabel: Record<ReputationEventFilter, string> = {
  [ReputationEventFilter.All]: 'All',
  [ReputationEventFilter.Gains]: 'Gains',
  [ReputationEventFilter.Losses]: 'Losses',
};

const emptyText: Record<ReputationEventFilter, string> = {
  [ReputationEventFilter.All]: 'Nothing here yet',
  [ReputationEventFilter.Gains]: 'No reputation gained yet',
  [ReputationEventFilter.Losses]: 'No reputation lost yet',
};

const filters = Object.values(ReputationEventFilter);

interface ReputationActivityProps {
  /** Applied by the API, so every page holds matching events only. */
  filter: ReputationEventFilter;
  onFilterChange: (filter: ReputationEventFilter) => void;
  events: ReputationEvent[];
  /** Shown under the filter instead of the list, e.g. while it loads. */
  placeholder?: ReactNode;
  /** Shown after the last event so the log adds up to the balance. */
  untracked?: number;
  trackedSince?: string | null;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
}

export const ReputationActivity = ({
  filter,
  onFilterChange,
  events,
  placeholder,
  untracked = 0,
  trackedSince,
  hasMore,
  isLoadingMore,
  onLoadMore,
}: ReputationActivityProps): ReactElement => {
  const listed = placeholder ? [] : events;
  const showUntracked =
    !placeholder &&
    !hasMore &&
    untracked > 0 &&
    filter !== ReputationEventFilter.Losses;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-1" role="group" aria-label="Filter activity">
        {filters.map((option) => (
          <Button
            key={option}
            size={ButtonSize.XSmall}
            variant={
              option === filter ? ButtonVariant.Float : ButtonVariant.Tertiary
            }
            pressed={option === filter}
            onClick={() => onFilterChange(option)}
          >
            {filterLabel[option]}
          </Button>
        ))}
      </div>
      {placeholder}
      {!placeholder && !events.length && !showUntracked && (
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
        >
          {emptyText[filter]}
        </Typography>
      )}
      <ul className="flex flex-col">
        {listed.map((event) => {
          const { eventLabel, Icon } = getReasonMeta(event.reason);

          return (
            <li
              key={event.id}
              className="flex items-center gap-3 border-t border-border-subtlest-tertiary py-2.5 first:border-t-0"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-10 bg-surface-float text-text-tertiary">
                <Icon size={IconSize.Size16} />
              </span>
              <div className="flex min-w-0 flex-1 flex-col">
                <Typography type={TypographyType.Footnote}>
                  {eventLabel}
                </Typography>
                {event.target ? (
                  <Link href={event.target.permalink} passHref>
                    <a className="min-w-0 shrink truncate text-text-tertiary typo-caption1 hover:text-text-primary hover:underline">
                      {event.target.title}
                    </a>
                  </Link>
                ) : (
                  <Typography
                    type={TypographyType.Caption1}
                    color={TypographyColor.Quaternary}
                  >
                    No longer available
                  </Typography>
                )}
              </div>
              <div className="flex shrink-0 flex-col items-end gap-0.5">
                <Typography
                  type={TypographyType.Footnote}
                  bold
                  className={classNames(
                    'tabular-nums',
                    amountColor(event.amount),
                  )}
                >
                  {formatSignedAmount(event.amount)}
                </Typography>
                <DateFormat
                  date={event.createdAt}
                  type={TimeFormatType.Post}
                  className="text-text-quaternary typo-caption1"
                />
              </div>
            </li>
          );
        })}
        {showUntracked && (
          <li className="flex items-center gap-3 border-t border-border-subtlest-tertiary py-2.5 first:border-t-0">
            <span className="size-8 shrink-0" />
            <div className="flex min-w-0 flex-1 flex-col">
              <Typography type={TypographyType.Footnote}>
                Before tracking
              </Typography>
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Tertiary}
              >
                Your starting balance and reputation from before we kept a log
              </Typography>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-0.5">
              <Typography
                type={TypographyType.Footnote}
                bold
                className="tabular-nums text-text-tertiary"
              >
                {formatSignedAmount(untracked)}
              </Typography>
              {trackedSince && (
                <Typography
                  type={TypographyType.Caption1}
                  color={TypographyColor.Quaternary}
                >
                  Before {format(parseISO(trackedSince), 'MMM yyyy')}
                </Typography>
              )}
            </div>
          </li>
        )}
      </ul>
      {!placeholder && hasMore && (
        <Button
          size={ButtonSize.Small}
          variant={ButtonVariant.Float}
          onClick={onLoadMore}
          loading={isLoadingMore}
          className="self-center"
        >
          Show more
        </Button>
      )}
    </div>
  );
};
