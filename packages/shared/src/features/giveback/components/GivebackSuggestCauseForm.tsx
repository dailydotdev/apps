import type { ReactElement } from 'react';
import React, { useId, useState } from 'react';
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
import { useToastNotification } from '../../../hooks/useToastNotification';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent } from '../../../lib/log';
import { labels } from '../../../lib/labels';
import { isValidHttpUrl } from '../../../lib/links';
import { useSuggestContributionCause } from '../hooks/useSuggestContributionCause';

interface GivebackSuggestCauseFormProps {
  onClose: () => void;
  // Where the form was opened from ('reward_reveal' | 'causes_tab'), for logging.
  origin: string;
}

const NOTE_MAX_LENGTH = 1000;

// The cause-nomination form used inside GivebackSuggestCauseModal (both entry
// points open that modal). Collects a required URL and an optional note, submits
// it for review, then swaps to a confirmation — the backend only pings the team,
// so there's nothing to track after submit.
export const GivebackSuggestCauseForm = ({
  onClose,
  origin,
}: GivebackSuggestCauseFormProps): ReactElement => {
  const { displayToast } = useToastNotification();
  const { logEvent } = useLogContext();
  const { suggest, isPending } = useSuggestContributionCause();
  const fieldId = useId();
  const urlInputId = `${fieldId}-url`;
  const noteInputId = `${fieldId}-note`;

  const [url, setUrl] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const trimmedUrl = url.trim();
  const canSubmit = isValidHttpUrl(trimmedUrl);

  const onSubmit = async () => {
    if (!canSubmit || isPending) {
      return;
    }

    const trimmedNote = note.trim();
    try {
      await suggest({ url: trimmedUrl, note: trimmedNote || undefined });
      logEvent({
        event_name: LogEvent.SubmitGivebackCauseSuggestion,
        extra: JSON.stringify({ origin, has_note: !!trimmedNote }),
      });
      setIsSubmitted(true);
    } catch {
      logEvent({
        event_name: LogEvent.SubmitGivebackCauseSuggestionError,
        extra: JSON.stringify({ origin }),
      });
      displayToast(labels.error.generic);
    }
  };

  if (isSubmitted) {
    return (
      <FlexCol className="gap-4">
        <FlexCol className="gap-2 rounded-18 border border-accent-cabbage-default bg-accent-cabbage-flat p-5">
          <Typography bold tag={TypographyTag.H2} type={TypographyType.Title3}>
            Thanks, we&apos;ll take a look
          </Typography>
          <Typography
            type={TypographyType.Callout}
            className="text-text-tertiary [text-wrap:pretty]"
          >
            We review every suggestion. If it&apos;s a fit, it joins the causes
            everyone can back.
          </Typography>
        </FlexCol>
        <FlexRow className="justify-end">
          <Button
            type="button"
            size={ButtonSize.Small}
            variant={ButtonVariant.Primary}
            onClick={onClose}
          >
            Done
          </Button>
        </FlexRow>
      </FlexCol>
    );
  }

  return (
    <FlexCol className="gap-4">
      <FlexCol className="gap-1.5">
        <Typography bold tag={TypographyTag.H2} type={TypographyType.Title3}>
          Suggest a cause
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Secondary}
          className="[text-wrap:pretty]"
        >
          Drop a link to a nonprofit or open-source fund you care about. We
          review every suggestion before it goes live.
        </Typography>
      </FlexCol>

      <label htmlFor={urlInputId} className="flex flex-col gap-2">
        <Typography bold type={TypographyType.Footnote}>
          Cause URL
        </Typography>
        <input
          id={urlInputId}
          type="url"
          inputMode="url"
          className="rounded-12 border border-border-subtlest-tertiary bg-surface-float px-3 py-2 text-text-primary typo-callout"
          placeholder="https://..."
          value={url}
          onChange={(event) => setUrl(event.target.value)}
        />
      </label>

      <label htmlFor={noteInputId} className="flex flex-col gap-2">
        <Typography bold type={TypographyType.Footnote}>
          Why this cause?{' '}
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            (optional)
          </Typography>
        </Typography>
        <textarea
          id={noteInputId}
          maxLength={NOTE_MAX_LENGTH}
          className="min-h-24 rounded-12 border border-border-subtlest-tertiary bg-surface-float px-3 py-2 text-text-primary typo-callout"
          placeholder="Tell us a bit about it, so we can review it faster."
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />
      </label>

      <FlexRow className="justify-end gap-2">
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
          disabled={!canSubmit}
          loading={isPending}
          onClick={onSubmit}
        >
          Submit for review
        </Button>
      </FlexRow>
    </FlexCol>
  );
};
