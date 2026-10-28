import type { KeyboardEvent, ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import { FlexCol, FlexRow } from '../../../components/utilities';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { DM_MAX_LENGTH } from '../types';
import { isSubmitEnter } from '../keyboard';

const maxEditorHeight = 160;

// Replaces a bubble while its text is being corrected. Enter saves (a new
// line on touch screens), Escape cancels, like the composer.
export const MessageEditor = ({
  initialValue,
  onSave,
  onCancel,
}: {
  initialValue: string;
  onSave: (value: string) => void;
  onCancel: () => void;
}): ReactElement => {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const trimmed = value.trim();
  const canSave = !!trimmed && trimmed !== initialValue;

  const resize = () => {
    const input = inputRef.current;
    if (!input) {
      return;
    }

    input.style.height = 'auto';
    input.style.height = `${Math.min(input.scrollHeight, maxEditorHeight)}px`;
  };

  useEffect(() => {
    const input = inputRef.current;
    input?.focus({ preventScroll: true });
    input?.setSelectionRange(input.value.length, input.value.length);
    resize();
  }, []);

  const save = () => {
    if (canSave) {
      onSave(trimmed);
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onCancel();
      return;
    }

    if (isSubmitEnter(event)) {
      event.preventDefault();
      save();
    }
  };

  return (
    <FlexCol className="w-full gap-2 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-2">
      <textarea
        ref={inputRef}
        rows={1}
        aria-label="Edit message"
        maxLength={DM_MAX_LENGTH}
        value={value}
        className="block min-h-8 w-full resize-none bg-transparent px-1 py-1.5 text-text-primary outline-none typo-body tablet:typo-callout"
        onChange={(event) => {
          setValue(event.target.value);
          resize();
        }}
        onKeyDown={onKeyDown}
      />
      <FlexRow className="items-center justify-end gap-2">
        <Button
          type="button"
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.XSmall}
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant={ButtonVariant.Primary}
          size={ButtonSize.XSmall}
          disabled={!canSave}
          onClick={save}
        >
          Save
        </Button>
      </FlexRow>
    </FlexCol>
  );
};
