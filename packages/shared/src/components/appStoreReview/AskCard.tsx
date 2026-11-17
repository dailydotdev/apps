import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { AppleIcon } from '../icons';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import { useAppStoreReviewAsk } from '../../hooks/useAppStoreReviewAsk';
import { appStoreReviewCopy, AskHeadline } from './common';

interface AskCardProps {
  targetId: string;
  requestDelayMs?: number;
  onRequestClose?: (event: React.MouseEvent | React.KeyboardEvent) => void;
  className?: string;
}

export const AskCard = ({
  targetId,
  requestDelayMs,
  onRequestClose,
  className,
}: AskCardProps): ReactElement => {
  const { onRate } = useAppStoreReviewAsk({
    targetId,
    requestDelayMs,
    onRequestClose,
  });

  return (
    <div
      className={classNames(
        'flex w-full flex-col gap-1 rounded-16 bg-surface-float p-4 text-left',
        className,
      )}
    >
      <Typography type={TypographyType.Callout} tag={TypographyTag.H3} bold>
        <AskHeadline />
      </Typography>
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
      >
        {appStoreReviewCopy.shortText}
      </Typography>
      <Button
        variant={ButtonVariant.Secondary}
        size={ButtonSize.Small}
        icon={<AppleIcon />}
        aria-label={appStoreReviewCopy.ctaLabel}
        className="mt-2 w-fit"
        onClick={onRate}
      >
        {appStoreReviewCopy.cta}
      </Button>
    </div>
  );
};
