import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import {
  Typography,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { FlexCol, FlexRow } from '../../../components/utilities';
import { RootPortal } from '../../../components/tooltips/Portal';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent } from '../../../lib/log';
import { useGivebackCauseSelection } from '../hooks/useGivebackCauseSelection';
import { GivebackCauseSelection } from './GivebackCauseSelection';

interface GivebackEditCausesModalProps {
  onClose: () => void;
}

// Edits the visitor's cause preferences in place, reusing the onboarding picker
// grid and its save hook. Seeds from the saved selection, so opening it shows
// the current picks ready to toggle.
export const GivebackEditCausesModal = ({
  onClose,
}: GivebackEditCausesModalProps): ReactElement => {
  const { logEvent } = useLogContext();
  const {
    causes,
    isLoading,
    selectedIds,
    toggleCause,
    selectedCount,
    save,
    isSaving,
  } = useGivebackCauseSelection(true);

  // Close on Escape, matching the backdrop click below.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const onSave = async () => {
    const saved = await save();
    if (!saved) {
      return;
    }
    logEvent({
      event_name: LogEvent.SaveGivebackCauses,
      extra: JSON.stringify({
        cause_count: selectedIds.size,
        cause_ids: [...selectedIds],
      }),
    });
    onClose();
  };

  return (
    <RootPortal>
      <div className="fixed inset-0 z-modal flex items-center justify-center bg-overlay-primary-pepper px-4 backdrop-blur-sm">
        <button
          type="button"
          aria-label="Close"
          tabIndex={-1}
          className="absolute inset-0 cursor-default"
          onClick={onClose}
        />
        <section
          aria-modal="true"
          role="dialog"
          aria-labelledby="giveback-edit-causes-title"
          className="relative z-1 flex max-h-[calc(100vh-2rem)] w-full max-w-[42rem] flex-col overflow-hidden rounded-24 border border-border-subtlest-secondary bg-background-default shadow-2"
        >
          <FlexCol className="gap-1 border-b border-border-subtlest-tertiary p-5 tablet:p-6">
            <Typography
              id="giveback-edit-causes-title"
              tag={TypographyTag.H2}
              type={TypographyType.Title2}
              bold
            >
              Edit your causes
            </Typography>
            <Typography type={TypographyType.Callout} bold={false}>
              Choose where your actions send the money.
            </Typography>
          </FlexCol>

          <div className="overflow-y-auto p-5 tablet:p-6">
            <GivebackCauseSelection
              causes={causes}
              isLoading={isLoading}
              selectedIds={selectedIds}
              onToggle={toggleCause}
            />
          </div>

          <FlexRow className="items-center justify-end gap-3 border-t border-border-subtlest-tertiary p-5 tablet:p-6">
            <Button
              type="button"
              size={ButtonSize.Medium}
              variant={ButtonVariant.Float}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size={ButtonSize.Medium}
              variant={ButtonVariant.Primary}
              onClick={onSave}
              loading={isSaving}
              disabled={selectedCount === 0}
            >
              Save causes
            </Button>
          </FlexRow>
        </section>
      </div>
    </RootPortal>
  );
};
