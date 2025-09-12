import React from 'react';
import type { PollOption } from '../../../graphql/posts';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import { VIcon } from '../../icons';

type PollOptionsProps = {
  options: PollOption[];
  userVote?: string;
  numPollVotes: number;
  onClick: (optionId: string) => void;
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
  options,
  userVote,
  numPollVotes,
  onClick,
}: PollOptionsProps) => {
  const orderedOptions = options.sort((a, b) => a.order - b.order);

  return (
    <div className="flex h-44 w-full flex-col justify-end gap-2 px-2">
      {orderedOptions.map((option) => {
        const percentage = getPercentage(numPollVotes, option.numVotes || 0);
        const isVotedOption = isUserChoice(userVote, option.id);

        if (userVote) {
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
                <div className="w-8 shrink-0">
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
