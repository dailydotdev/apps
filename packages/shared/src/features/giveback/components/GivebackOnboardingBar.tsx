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
import { useGivebackContext } from '../GivebackContext';

interface GivebackOnboardingBarProps {
  /** Confirms the picked causes and advances out of onboarding. */
  onContinue: () => void;
  continueLabel?: string;
}

// Sticky bottom bar for the cause-picker onboarding step, mirroring the level
// bar (GivebackFundingBar). Rendered at the page root so it pins to the viewport
// bottom and keeps the confirm CTA one tap away while scrolling the cause list.
export const GivebackOnboardingBar = ({
  onContinue,
  continueLabel = 'Continue',
}: GivebackOnboardingBarProps): ReactElement => {
  const { userProfile } = useGivebackContext();
  const selectedCount = userProfile.selectedCauseIds.length;

  return (
    <div className="pointer-events-none sticky bottom-0 z-3">
      <div className="bg-background-default/80 pointer-events-auto relative mx-auto w-full max-w-6xl border-t border-border-subtlest-secondary px-4 py-3 backdrop-blur-xl tablet:rounded-t-16 tablet:border-x">
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
            disabled={selectedCount === 0}
            onClick={onContinue}
            className="shrink-0"
          >
            {continueLabel}
          </Button>
        </FlexRow>
      </div>
    </div>
  );
};
