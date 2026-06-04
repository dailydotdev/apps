import type { ReactElement } from 'react';
import React, { useMemo, useState } from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import ImageInput from '../../../components/fields/ImageInput';
import {
  Typography,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { FlexCol, FlexRow } from '../../../components/utilities';
import type { GivebackAction } from '../types';
import { useGivebackContext } from '../GivebackContext';
import { formatDonationAmount } from '../utils';
import { actionCategoryLabels, actionValidationLabels } from '../statusLabels';

interface GivebackSubmissionModalProps {
  action: GivebackAction;
  onClose: () => void;
}

export const GivebackSubmissionModal = ({
  action,
  onClose,
}: GivebackSubmissionModalProps): ReactElement => {
  const { submitAction } = useGivebackContext();
  const linkInputId = `giveback-proof-link-${action.id}`;
  const noteInputId = `giveback-proof-note-${action.id}`;
  const [evidenceLink, setEvidenceLink] = useState('');
  const [evidenceImage, setEvidenceImage] = useState<string>();
  const [note, setNote] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const canSubmit = useMemo(() => {
    const hasLink = !action.requiresLink || evidenceLink.trim().length > 0;
    const hasImage = !action.requiresImage || !!evidenceImage;
    const hasNote = !action.requiresNote || note.trim().length > 0;

    return hasLink && hasImage && hasNote;
  }, [
    action.requiresImage,
    action.requiresLink,
    action.requiresNote,
    evidenceImage,
    evidenceLink,
    note,
  ]);

  const onSubmit = () => {
    if (!canSubmit) {
      return;
    }

    submitAction({
      actionId: action.id,
      evidenceLink: evidenceLink.trim() || undefined,
      evidenceImage,
      note: note.trim() || undefined,
    });
    setIsSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center bg-overlay-primary-pepper px-4 backdrop-blur-sm">
      <section
        aria-modal="true"
        role="dialog"
        aria-labelledby="giveback-submission-title"
        className="relative flex max-h-[calc(100vh-2rem)] w-full max-w-[35rem] flex-col overflow-hidden rounded-24 border border-border-subtlest-secondary bg-background-default shadow-2"
      >
        <div
          aria-hidden
          className="bg-accent-cabbage-default/20 pointer-events-none absolute -right-20 -top-20 size-56 rounded-full blur-3xl"
        />
        <div
          aria-hidden
          className="bg-accent-onion-default/20 pointer-events-none absolute -bottom-24 -left-16 size-56 rounded-full blur-3xl"
        />
        <FlexCol className="gap-5 p-5 tablet:p-6">
          <FlexCol className="gap-2">
            <Typography
              bold
              id="giveback-submission-title"
              tag={TypographyTag.H2}
              type={TypographyType.Title3}
            >
              {isSubmitted ? 'Proof submitted' : 'Submit proof'}
            </Typography>
            <Typography
              type={TypographyType.Callout}
              className="text-text-tertiary"
            >
              {isSubmitted
                ? "Added to your contribution. We'll only subtract it if validation fails."
                : action.title}
            </Typography>
          </FlexCol>

          {isSubmitted ? (
            <FlexCol className="relative gap-4 overflow-hidden rounded-18 border border-accent-cabbage-default bg-accent-cabbage-flat p-5 shadow-2-cabbage">
              <div
                aria-hidden
                className="border-accent-cabbage-default/30 pointer-events-none absolute right-4 top-4 size-16 rounded-full border"
              />
              <Typography bold type={TypographyType.Title4}>
                You helped unlock{' '}
                {formatDonationAmount(action.donationAmount, action.currency)}
              </Typography>
              <Typography
                type={TypographyType.Callout}
                className="text-text-tertiary"
              >
                It already counts toward your contribution. If it&apos;s
                rejected, we&apos;ll subtract it.
              </Typography>
            </FlexCol>
          ) : (
            <FlexCol className="gap-4">
              <FlexCol className="gap-3 border-b border-border-subtlest-tertiary pb-4">
                <FlexRow className="items-center justify-between gap-3">
                  <FlexRow className="flex-wrap items-center gap-x-2 gap-y-1">
                    <Typography
                      type={TypographyType.Caption1}
                      className="text-text-tertiary"
                    >
                      {actionCategoryLabels[action.category]}
                    </Typography>
                    <span
                      aria-hidden
                      className="size-1 rounded-full bg-border-subtlest-secondary"
                    />
                    <Typography
                      type={TypographyType.Caption1}
                      className="text-text-tertiary"
                    >
                      {actionValidationLabels[action.validationType]}
                    </Typography>
                  </FlexRow>
                  <Typography
                    bold
                    type={TypographyType.Callout}
                    className="shrink-0 tabular-nums text-status-success"
                  >
                    +
                    {formatDonationAmount(
                      action.donationAmount,
                      action.currency,
                    )}
                  </Typography>
                </FlexRow>
                {action.description && (
                  <Typography
                    type={TypographyType.Footnote}
                    className="text-text-tertiary"
                  >
                    {action.description}
                  </Typography>
                )}
                {action.instructions && (
                  <Typography
                    type={TypographyType.Footnote}
                    className="text-text-tertiary"
                  >
                    {action.instructions}
                  </Typography>
                )}
                <Typography
                  type={TypographyType.Caption1}
                  className="text-text-tertiary"
                >
                  Counts toward your contribution the moment you submit.
                  We&apos;ll only subtract it if it&apos;s rejected.
                </Typography>
              </FlexCol>

              {action.requiresLink && (
                <label htmlFor={linkInputId} className="flex flex-col gap-2">
                  <Typography bold type={TypographyType.Footnote}>
                    Public link
                  </Typography>
                  <input
                    id={linkInputId}
                    className="rounded-12 border border-border-subtlest-tertiary bg-surface-float px-3 py-2 text-text-primary typo-callout"
                    placeholder="https://..."
                    value={evidenceLink}
                    onChange={(event) => setEvidenceLink(event.target.value)}
                  />
                </label>
              )}

              {action.requiresImage && (
                <FlexCol className="gap-2">
                  <Typography bold type={TypographyType.Footnote}>
                    Screenshot
                  </Typography>
                  <ImageInput
                    id={`giveback-proof-${action.id}`}
                    size="cover"
                    fallbackImage={null}
                    uploadButton
                    onChange={(base64) => setEvidenceImage(base64 ?? undefined)}
                  >
                    <Typography
                      type={TypographyType.Footnote}
                      className="px-4 text-center text-text-tertiary"
                    >
                      Upload proof screenshot
                    </Typography>
                  </ImageInput>
                </FlexCol>
              )}

              {action.requiresNote && (
                <label htmlFor={noteInputId} className="flex flex-col gap-2">
                  <Typography bold type={TypographyType.Footnote}>
                    Note
                  </Typography>
                  <textarea
                    id={noteInputId}
                    className="min-h-24 rounded-12 border border-border-subtlest-tertiary bg-surface-float px-3 py-2 text-text-primary typo-callout"
                    placeholder="Add any context that helps us validate this."
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                  />
                </label>
              )}
            </FlexCol>
          )}

          <FlexRow className="justify-end gap-2">
            <Button
              type="button"
              size={ButtonSize.Small}
              variant={ButtonVariant.Tertiary}
              onClick={onClose}
            >
              {isSubmitted ? 'Done' : 'Cancel'}
            </Button>
            {!isSubmitted && (
              <Button
                type="button"
                size={ButtonSize.Small}
                variant={ButtonVariant.Primary}
                disabled={!canSubmit}
                onClick={onSubmit}
              >
                Submit for review
              </Button>
            )}
          </FlexRow>
        </FlexCol>
      </section>
    </div>
  );
};
