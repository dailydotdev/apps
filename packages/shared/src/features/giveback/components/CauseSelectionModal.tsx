import type { ReactElement } from 'react';
import React, { useState } from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { FlexCol, FlexRow } from '../../../components/utilities';
import { useGivebackContext } from '../GivebackContext';

interface CauseSelectionModalProps {
  onClose: () => void;
}

// Focused "suggest a cause" modal. The full cause catalog is now the card grid
// on the Causes tab, so this is only the lightweight suggestion form.
export const CauseSelectionModal = ({
  onClose,
}: CauseSelectionModalProps): ReactElement => {
  const { suggestedCauses, suggestCause } = useGivebackContext();
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [note, setNote] = useState('');

  const onSuggest = () => {
    suggestCause({ name, url, note });
    setName('');
    setUrl('');
    setNote('');
    onClose();
  };

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
    <div
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-modal flex items-center justify-center bg-overlay-primary-pepper px-4 backdrop-blur-sm"
    >
      <section
        aria-modal="true"
        role="dialog"
        aria-labelledby="giveback-suggest-title"
        className="relative flex w-full max-w-[32rem] flex-col overflow-hidden rounded-24 border border-border-subtlest-secondary bg-background-default shadow-2"
      >
        <div
          aria-hidden
          className="bg-accent-cabbage-default/20 pointer-events-none absolute -right-20 -top-20 size-56 rounded-full blur-3xl"
        />

        <FlexCol className="relative gap-2 p-5 pb-3 tablet:px-6 tablet:pt-6">
          <Typography
            bold
            id="giveback-suggest-title"
            tag={TypographyTag.H2}
            type={TypographyType.Title3}
          >
            Suggest a cause
          </Typography>
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            Missing a cause you care about? Tell us — we review every suggestion
            before it goes live.
          </Typography>
        </FlexCol>

        <FlexCol className="relative gap-3 px-5 py-3 tablet:px-6">
          <div className="grid gap-3 tablet:grid-cols-2">
            <label
              htmlFor="giveback-cause-name"
              className="flex flex-col gap-2"
            >
              <Typography bold type={TypographyType.Footnote}>
                Cause name
              </Typography>
              <input
                id="giveback-cause-name"
                className="rounded-12 border border-border-subtlest-tertiary bg-surface-float px-3 py-2 text-text-primary typo-callout"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </label>

            <label htmlFor="giveback-cause-url" className="flex flex-col gap-2">
              <Typography bold type={TypographyType.Footnote}>
                Website
              </Typography>
              <input
                id="giveback-cause-url"
                className="rounded-12 border border-border-subtlest-tertiary bg-surface-float px-3 py-2 text-text-primary typo-callout"
                placeholder="https://..."
                value={url}
                onChange={(event) => setUrl(event.target.value)}
              />
            </label>
          </div>

          <label htmlFor="giveback-cause-note" className="flex flex-col gap-2">
            <Typography bold type={TypographyType.Footnote}>
              Why this cause?
            </Typography>
            <textarea
              id="giveback-cause-note"
              className="min-h-20 rounded-12 border border-border-subtlest-tertiary bg-surface-float px-3 py-2 text-text-primary typo-callout"
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </label>

          {suggestedCauses.length > 0 && (
            <FlexCol className="gap-1 border-t border-border-subtlest-tertiary pt-3">
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Tertiary}
              >
                Already suggested
              </Typography>
              {suggestedCauses.map((cause) => (
                <FlexRow
                  key={cause.id}
                  className="items-center justify-between gap-3"
                >
                  <Typography type={TypographyType.Footnote}>
                    {cause.name}
                  </Typography>
                  <Typography
                    type={TypographyType.Caption1}
                    color={TypographyColor.Tertiary}
                  >
                    pending review
                  </Typography>
                </FlexRow>
              ))}
            </FlexCol>
          )}
        </FlexCol>

        <FlexRow className="items-center justify-end gap-2 border-t border-border-subtlest-tertiary p-4 tablet:px-6">
          <Button
            type="button"
            size={ButtonSize.Small}
            variant={ButtonVariant.Tertiary}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size={ButtonSize.Small}
            variant={ButtonVariant.Primary}
            disabled={!name.trim() || !url.trim()}
            onClick={onSuggest}
          >
            Suggest cause
          </Button>
        </FlexRow>
      </section>
    </div>
  );
};
