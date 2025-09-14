import React from 'react';
import classNames from 'classnames';
import { isAfter } from 'date-fns';
import type { PollOption } from '../../../graphql/posts';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import { VIcon } from '../../icons';

type PollOptionsProps = {
  className?: {
    container?: string;
  };
  options: PollOption[];
  userVote?: string;
  numPollVotes: number;
  onClick: (optionId: string) => void;
  endsAt?: string;
};

const getPercentage = (numPollVotes: number, optionVotes: number): number => {
  if (numPollVotes === 0) {
    return 0;
  }
  return Math.round((optionVotes / numPollVotes) * 100);
};

const isUserChoice = (userVote: string, optionId: string): boolean => {
  return userVote === optionId;
};

const PollOptions = ({
  className,
  options,
  userVote,
  numPollVotes,
  onClick,
  endsAt,
}: PollOptionsProps) => {
  const orderedOptions = options.sort((a, b) => a.order - b.order);
  const hasEnded = endsAt && isAfter(new Date(), new Date(endsAt));
  return (
    <div
      className={classNames(
        'z-1 flex h-44 w-full flex-col justify-end gap-2',
        className?.container,
      )}
    >
      {orderedOptions.map((option) => {
        const percentage = getPercentage(numPollVotes, option.numVotes || 0);
        const isVotedOption = isUserChoice(userVote, option.id);

        if (userVote || hasEnded) {
          return (
            <div
              key={option.order}
              className="relative flex w-full flex-1 items-center overflow-hidden rounded-12 border border-border-subtlest-tertiary p-2"
            >
              <div
                className={`absolute bottom-0 left-0 top-0 rounded-12 transition-all duration-300 ${
                  isVotedOption ? 'bg-brand-active' : 'bg-surface-float'
                }`}
                style={{
                  width: `${percentage}%`,
                }}
              />
              <div className="z-10 relative flex w-full items-center gap-2">
                <div className="w-10 shrink-0">
                  <Typography type={TypographyType.Callout} bold>
                    {percentage}%
                  </Typography>
                </div>
                <div className="flex-1">
                  <Typography
                    type={TypographyType.Callout}
                    color={
                      isVotedOption
                        ? TypographyColor.Primary
                        : TypographyColor.Secondary
                    }
                  >
                    {option.text}
                  </Typography>
                </div>

                {isVotedOption && (
                  <div className="ml-2 flex items-center justify-center rounded-full bg-brand-default">
                    <VIcon className="h-4 w-4" />
                  </div>
                )}
              </div>
            </div>
          );
        }

        return (
          <button
            onClick={() => onClick(option.id)}
            key={option.order}
            type="button"
            className="focus-visible:ring-accent-primary flex w-full flex-1 items-center justify-center rounded-12 border border-border-subtlest-tertiary bg-transparent p-2 text-center text-text-secondary transition-colors duration-200 ease-in-out typo-callout hover:bg-surface-hover focus:bg-surface-hover focus:outline-none focus-visible:ring-2"
          >
            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Secondary}
            >
              {option.text}
            </Typography>
          </button>
        );
      })}
    </div>
  );
};

export default PollOptions;
