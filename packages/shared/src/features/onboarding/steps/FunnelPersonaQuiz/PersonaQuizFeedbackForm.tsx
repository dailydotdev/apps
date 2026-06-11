import type { ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../../components/typography/Typography';

interface PersonaQuizFeedbackFormProps {
  placeholder?: string;
  onSubmit: (text: string) => void;
  onCancel: () => void;
}

export const PersonaQuizFeedbackForm = ({
  placeholder = 'Tell us what we got wrong — we’re listening',
  onSubmit,
  onCancel,
}: PersonaQuizFeedbackFormProps): ReactElement => {
  const [value, setValue] = useState('');
  const ref = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  const trimmed = value.trim();
  const canSubmit = trimmed.length > 0;

  return (
    <form
      className="flex w-full flex-col gap-3 rounded-12 border border-border-subtlest-tertiary bg-background-subtle p-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (!canSubmit) {
          return;
        }
        onSubmit(trimmed);
      }}
    >
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
      >
        Help us tune this — the more specific the better.
      </Typography>
      <textarea
        ref={ref}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full resize-none rounded-8 border border-border-subtlest-tertiary bg-background-default px-3 py-2 text-text-primary typo-body placeholder:text-text-quaternary focus:border-text-tertiary focus:outline-none"
      />
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Small}
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant={ButtonVariant.Secondary}
          size={ButtonSize.Small}
          disabled={!canSubmit}
        >
          Send feedback
        </Button>
      </div>
    </form>
  );
};
