import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '../buttons/Button';
import { FlexCol, FlexRow } from '../utilities';
import { MiniCloseIcon } from '../icons';

export interface MatchReviewHeaderProps {
  currentMatch: number;
  totalMatches: number;
  name: string;
  onReject?: () => void;
  onApprove?: () => void;
  disabled?: boolean;
}

export const MatchReviewHeader = ({
  currentMatch,
  totalMatches,
  name,
  onReject,
  onApprove,
  disabled = false,
}: MatchReviewHeaderProps): ReactElement => {
  return (
    <FlexRow className="items-center justify-between border-b border-border-subtlest-tertiary p-4">
      <FlexCol>
        {onReject && onApprove && (
          <Typography
            type={TypographyType.Footnote}
            bold
            color={TypographyColor.Tertiary}
          >
            {currentMatch} of {totalMatches} for review
          </Typography>
        )}
        <Typography type={TypographyType.Title3} bold>
          {name}
        </Typography>
      </FlexCol>
      <FlexRow className="gap-2">
        {onReject && (
          <Button
            variant={ButtonVariant.Subtle}
            icon={<MiniCloseIcon />}
            size={ButtonSize.Small}
            onClick={onReject}
            disabled={disabled}
          >
            Reject
          </Button>
        )}
        {onApprove && (
          <Button
            variant={ButtonVariant.Primary}
            size={ButtonSize.Small}
            color={ButtonColor.Cabbage}
            onClick={onApprove}
            disabled={disabled}
          >
            Approve &amp; Request intro
          </Button>
        )}
      </FlexRow>
    </FlexRow>
  );
};
