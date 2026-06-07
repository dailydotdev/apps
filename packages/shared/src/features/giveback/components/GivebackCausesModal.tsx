import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { FlexCol, FlexRow } from '../../../components/utilities';
import CloseButton from '../../../components/CloseButton';
import { ButtonSize } from '../../../components/buttons/Button';
import { CauseSelection } from './CauseSelection';

interface GivebackCausesModalProps {
  onClose: () => void;
}

// Settings-style popup for editing the causes the visitor supports. Reuses the
// same cause picker from onboarding; confirming closes the modal.
export const GivebackCausesModal = ({
  onClose,
}: GivebackCausesModalProps): ReactElement => {
  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
    <div
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-modal flex items-center justify-center bg-overlay-primary-pepper px-4 py-8 backdrop-blur-sm"
    >
      <section
        aria-modal="true"
        role="dialog"
        aria-labelledby="giveback-causes-title"
        className="relative flex max-h-full w-full max-w-3xl flex-col overflow-hidden rounded-24 border border-border-subtlest-secondary bg-background-default shadow-2"
      >
        <FlexRow className="items-start justify-between gap-3 border-b border-border-subtlest-tertiary p-5 tablet:px-6">
          <FlexCol className="gap-1">
            <Typography
              bold
              id="giveback-causes-title"
              tag={TypographyTag.H2}
              type={TypographyType.Title3}
            >
              Customize your causes
            </Typography>
            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Tertiary}
            >
              Choose where the community budget goes. Update these anytime.
            </Typography>
          </FlexCol>
          <CloseButton
            type="button"
            size={ButtonSize.Small}
            onClick={onClose}
          />
        </FlexRow>

        <div className="overflow-y-auto p-5 tablet:px-6">
          <CauseSelection onContinue={onClose} continueLabel="Done" />
        </div>
      </section>
    </div>
  );
};
