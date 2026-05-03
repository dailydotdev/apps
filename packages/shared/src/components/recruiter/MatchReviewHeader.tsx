import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import {
  ButtonV2,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '../buttons/ButtonV2';
import { FlexCol, FlexRow } from '../utilities';
import { ArrowIcon, MiniCloseIcon } from '../icons';

export interface MatchReviewHeaderProps {
  currentMatch: number;
  totalMatches: number;
  name: string;
  onReject?: () => void;
  onApprove?: () => void;
  disabled?: boolean;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export const MatchReviewHeader = ({
  currentMatch,
  totalMatches,
  name,
  onReject,
  onApprove,
  disabled = false,
  onPrevious,
  onNext,
  hasPrevious = false,
  hasNext = false,
}: MatchReviewHeaderProps): ReactElement => {
  return (
    <FlexRow className="items-center justify-between border-b border-border-subtlest-tertiary p-4">
      <FlexCol>
        {onReject && onApprove && (
          <FlexRow className="items-center gap-2">
            <ButtonV2
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.XSmall}
              icon={<ArrowIcon className="-rotate-90" />}
              onClick={onPrevious}
              disabled={!hasPrevious}
              aria-label="Previous match"
            />
            <Typography
              type={TypographyType.Footnote}
              bold
              color={TypographyColor.Tertiary}
            >
              {currentMatch} of {totalMatches} for review
            </Typography>
            <ButtonV2
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.XSmall}
              icon={<ArrowIcon className="rotate-90" />}
              onClick={onNext}
              disabled={!hasNext}
              aria-label="Next match"
            />
          </FlexRow>
        )}
        <Typography type={TypographyType.Title3} bold>
          {name}
        </Typography>
      </FlexCol>
      <FlexRow className="gap-2">
        {onReject && (
          <ButtonV2
            variant={ButtonVariant.Secondary}
            icon={<MiniCloseIcon />}
            size={ButtonSize.Small}
            onClick={onReject}
            disabled={disabled}
          >
            Reject
          </ButtonV2>
        )}
        {onApprove && (
          <ButtonV2
            variant={ButtonVariant.Primary}
            size={ButtonSize.Small}
            color={ButtonColor.Cabbage}
            onClick={onApprove}
            disabled={disabled}
          >
            Approve &amp; Request intro
          </ButtonV2>
        )}
      </FlexRow>
    </FlexRow>
  );
};
