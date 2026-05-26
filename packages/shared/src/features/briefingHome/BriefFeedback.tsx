import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../components/typography/Typography';
import { UpvoteIcon, DownvoteIcon } from '../../components/icons';
import { IconSize } from '../../components/Icon';

type Vote = 'up' | 'down';

export interface BriefFeedbackProps {
  prompt: string;
  upLabel?: string;
  downLabel?: string;
  thanksLabel?: string;
  size?: 'sm' | 'md';
  align?: 'start' | 'center';
  className?: string;
  onVote?: (vote: Vote) => void;
}

export const BriefFeedback = ({
  prompt,
  upLabel = 'Yes',
  downLabel = 'No',
  thanksLabel = 'Thanks, noted',
  size = 'sm',
  align = 'start',
  className,
  onVote,
}: BriefFeedbackProps): ReactElement => {
  const [vote, setVote] = useState<Vote | null>(null);

  const handleVote = (next: Vote) => (e: React.MouseEvent) => {
    e.stopPropagation();
    setVote(next);
    onVote?.(next);
  };

  const iconSize = size === 'md' ? IconSize.Small : IconSize.XSmall;
  const labelType =
    size === 'md' ? TypographyType.Footnote : TypographyType.Caption1;

  if (vote) {
    return (
      <div
        className={classNames(
          'flex items-center gap-1.5 px-1.5 py-0.5',
          align === 'center' && 'justify-center',
          className,
        )}
        aria-live="polite"
      >
        {vote === 'up' ? (
          <UpvoteIcon
            size={iconSize}
            className="text-accent-avocado-default"
            secondary
          />
        ) : (
          <DownvoteIcon
            size={iconSize}
            className="text-accent-ketchup-default"
            secondary
          />
        )}
        <Typography type={labelType} color={TypographyColor.Tertiary}>
          {thanksLabel}
        </Typography>
      </div>
    );
  }

  return (
    <div
      className={classNames(
        'flex items-center gap-2',
        align === 'center' && 'justify-center',
        className,
      )}
    >
      <Typography type={labelType} color={TypographyColor.Tertiary}>
        {prompt}
      </Typography>
      <button
        type="button"
        onClick={handleVote('up')}
        aria-label={upLabel}
        className="inline-flex items-center gap-1 rounded-6 px-1.5 py-0.5 text-text-tertiary transition-colors hover:bg-surface-float hover:text-accent-avocado-default"
      >
        <UpvoteIcon size={iconSize} />
        <Typography type={labelType}>{upLabel}</Typography>
      </button>
      <button
        type="button"
        onClick={handleVote('down')}
        aria-label={downLabel}
        className="inline-flex items-center gap-1 rounded-6 px-1.5 py-0.5 text-text-tertiary transition-colors hover:bg-surface-float hover:text-accent-ketchup-default"
      >
        <DownvoteIcon size={iconSize} />
        <Typography type={labelType}>{downLabel}</Typography>
      </button>
    </div>
  );
};
