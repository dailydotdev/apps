import type { ReactElement } from 'react';
import React from 'react';
import { FlexCol, FlexRow } from '../../../components/utilities';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import {
  Button,
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { ArrowIcon } from '../../../components/icons';

interface GivebackOnboardingBarProps {
  selectedCount: number;
  isSaving: boolean;
  onContinue: () => void;
}

// Sticky bottom bar that keeps the confirm CTA one tap away while scrolling the
// cause list. Rendered at the page root so it pins to the viewport bottom.
export const GivebackOnboardingBar = ({
  selectedCount,
  isSaving,
  onContinue,
}: GivebackOnboardingBarProps): ReactElement => {
  return (
    <div className="pointer-events-none sticky bottom-0 z-3">
      <div className="pointer-events-auto relative mx-auto w-full max-w-6xl border-t border-border-subtlest-secondary bg-background-default px-4 py-3 tablet:rounded-t-16 tablet:border-x">
        <FlexRow className="items-center justify-between gap-4">
          <FlexCol className="min-w-0 gap-0.5">
            <Typography
              tag={TypographyTag.Span}
              type={TypographyType.Callout}
              bold
            >
              {selectedCount} {selectedCount === 1 ? 'cause' : 'causes'}{' '}
              selected
            </Typography>
            <Typography
              tag={TypographyTag.Span}
              type={TypographyType.Caption1}
              color={TypographyColor.Tertiary}
              className="truncate"
            >
              daily.dev funds every donation. Pick at least one to continue.
            </Typography>
          </FlexCol>

          <Button
            type="button"
            variant={ButtonVariant.Primary}
            size={ButtonSize.Medium}
            icon={<ArrowIcon className="rotate-90" />}
            iconPosition={ButtonIconPosition.Right}
            disabled={selectedCount === 0 || isSaving}
            loading={isSaving}
            onClick={onContinue}
            className="shrink-0"
          >
            Continue
          </Button>
        </FlexRow>
      </div>
    </div>
  );
};
