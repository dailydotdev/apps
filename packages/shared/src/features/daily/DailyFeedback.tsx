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
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../components/buttons/Button';

type Vote = 'up' | 'down';

export interface DailyFeedbackProps {
  prompt: string;
  upLabel?: string;
  downLabel?: string;
  thanksLabel?: string;
  size?: 'sm' | 'md';
  align?: 'start' | 'center';
  className?: string;
  onVote?: (vote: Vote) => void;
}

export const DailyFeedback = ({
  prompt,
  upLabel = 'Yes',
  downLabel = 'No',
  thanksLabel = 'Thanks, noted',
  size = 'sm',
  align = 'start',
  className,
  onVote,
}: DailyFeedbackProps): ReactElement => {
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

  const buttonSize = size === 'md' ? ButtonSize.Small : ButtonSize.XSmall;

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
      <Button
        type="button"
        variant={ButtonVariant.Subtle}
        size={buttonSize}
        icon={<UpvoteIcon size={iconSize} />}
        onClick={handleVote('up')}
        aria-label={upLabel}
        className="hover:!text-accent-avocado-default"
      >
        <Typography type={labelType}>{upLabel}</Typography>
      </Button>
      <Button
        type="button"
        variant={ButtonVariant.Subtle}
        size={buttonSize}
        icon={<DownvoteIcon size={iconSize} />}
        onClick={handleVote('down')}
        aria-label={downLabel}
        className="hover:!text-accent-ketchup-default"
      >
        <Typography type={labelType}>{downLabel}</Typography>
      </Button>
    </div>
  );
};
