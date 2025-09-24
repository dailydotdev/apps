import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { isAfter } from 'date-fns';
import type { PollOption } from '../../../graphql/posts';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import { VIcon } from '../../icons';
import { getPercentage, isNullOrUndefined } from '../../../lib/func';

type PollOptionsProps = {
  className?: {
    container?: string;
  };
  options: PollOption[];
  userVote?: string;
  numPollVotes: number;
  onClick: (optionId: string, text: string) => void;
  endsAt?: string;
  shouldAnimateResults?: boolean;
};

const PollResults = ({
  options,
  userVote,
  numPollVotes,
  shouldAnimate = false,
}: {
  options: PollOption[];
  userVote?: string;
  numPollVotes: number;
  shouldAnimate?: boolean;
}) => {
  const [animatedWidths, setAnimatedWidths] = useState<Record<string, number>>(
    {},
  );

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (shouldAnimate) {
      timer = setTimeout(() => {
        const finalWidths = options.reduce((acc, option) => {
          acc[option.id] = getPercentage(numPollVotes, option.numVotes || 0);
          return acc;
        }, {} as Record<string, number>);
        setAnimatedWidths(finalWidths);
      }, 100);
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [shouldAnimate, options, numPollVotes]);

  return options.map((option) => {
    const percentage = getPercentage(numPollVotes, option.numVotes || 0);
    const animatedPercentage =
      animatedWidths[option.id] ?? (shouldAnimate ? 0 : percentage);
    const isVotedOption = userVote === option.id;

    return (
      <div
        key={option.order}
        className="relative flex w-full flex-1 items-center overflow-hidden rounded-12 border-none p-2"
      >
        {animatedPercentage === 0 && (
          <div className="absolute bottom-0 left-0 top-0 w-5 rounded-12 bg-surface-float" />
        )}
        <div
          className={`absolute bottom-0 left-0 top-0 rounded-12 transition-all duration-700 ease-out ${
            isVotedOption ? 'bg-brand-active' : 'bg-surface-float'
          }`}
          style={{
            width: `${animatedPercentage}%`,
          }}
        />
        <div className="relative flex w-full items-center gap-2">
          <div className="w-10 shrink-0 text-right">
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
              <VIcon secondary className="size-4" />
            </div>
          )}
        </div>
      </div>
    );
  });
};

export const PollOptionButtons = ({
  options,
  onClick,
}: {
  options: PollOption[];
  onClick?: (optionId: string, text: string) => void;
}) => {
  return options.map((option) => (
    <button
      disabled={isNullOrUndefined(onClick)}
      onClick={() => onClick(option.id, option.text)}
      key={option.order}
      type="button"
      className="flex w-full flex-1 items-center justify-center rounded-12 border border-border-subtlest-tertiary p-2 text-center text-text-secondary typo-callout hover:bg-surface-hover"
    >
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Secondary}
      >
        {option.text}
      </Typography>
    </button>
  ));
};

const PollOptions = ({
  className,
  options,
  userVote,
  numPollVotes,
  onClick,
  endsAt,
  shouldAnimateResults = false,
}: PollOptionsProps) => {
  const hasEnded = endsAt && isAfter(new Date(), new Date(endsAt));

  return (
    <div
      className={classNames(
        'z-1 flex h-44 w-full flex-col justify-end gap-2',
        className?.container,
      )}
    >
      {userVote || hasEnded ? (
        <PollResults
          options={options}
          userVote={userVote}
          numPollVotes={numPollVotes}
          shouldAnimate={shouldAnimateResults}
        />
      ) : (
        <PollOptionButtons options={options} onClick={onClick} />
      )}
    </div>
  );
};

export default PollOptions;
