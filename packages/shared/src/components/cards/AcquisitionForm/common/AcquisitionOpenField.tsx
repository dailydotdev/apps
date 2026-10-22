import type { ReactElement } from 'react';
import React, { useEffect, useRef } from 'react';
import { TextField } from '../../../fields/TextField';
import { FieldSize } from '../../../fields/fieldSizes';
import { Button, ButtonSize, ButtonVariant } from '../../../buttons/Button';
import { MiniCloseIcon } from '../../../icons/MiniClose';
import { OTHER_DETAIL_MAX_LENGTH } from '../../../../graphql/users';
import { isTouchDevice } from '../../../../lib/tooltip';

// No example channels: whatever the field suggests is what people answer.
const PLACEHOLDER = 'Type your answer';
const HINT = 'A few words is enough.';
const LIMIT_HINT = "That's the character limit.";

interface AcquisitionOpenFieldProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
  // Enter submits once there is something to send.
  onSubmit?: () => void;
  label?: string;
  // The funnel step is the whole screen; the feed card is one slot of many.
  isCompact?: boolean;
  autoFocus?: boolean;
  disabled?: boolean;
}

export const AcquisitionOpenField = ({
  name,
  value,
  onChange,
  onSubmit,
  label = 'How did you hear about us?',
  isCompact,
  autoFocus,
  disabled,
}: AcquisitionOpenFieldProps): ReactElement => {
  const inputRef = useRef<HTMLInputElement>();

  // Only with a mouse and keyboard: phones either ignore it or show a focused
  // field with no keyboard, which reads as broken.
  useEffect(() => {
    if (autoFocus && !isTouchDevice()) {
      inputRef.current?.focus();
    }
  }, [autoFocus]);

  return (
    <TextField
      aria-label={label}
      autoComplete="off"
      // Feed cards turn pointer events off for everything but links, buttons
      // and labels.
      className={{ container: '!pointer-events-auto w-full' }}
      disabled={disabled}
      enterKeyHint="go"
      fieldSize={isCompact ? FieldSize.Medium : FieldSize.Large}
      fieldType="tertiary"
      hint={value.length >= OTHER_DETAIL_MAX_LENGTH ? LIMIT_HINT : HINT}
      inputId={`${name}-answer`}
      inputRef={(input) => {
        inputRef.current = input;
      }}
      label={PLACEHOLDER}
      maxLength={OTHER_DETAIL_MAX_LENGTH}
      name={`${name}-answer`}
      onKeyDown={(event) => {
        if (event.key === 'Enter' && value.trim()) {
          event.preventDefault();
          onSubmit?.();
        }
      }}
      placeholder={PLACEHOLDER}
      showMaxLength={false}
      value={value}
      valueChanged={onChange}
      actionButton={
        value ? (
          <Button
            aria-label="Clear answer"
            icon={<MiniCloseIcon />}
            onClick={(event: React.MouseEvent) => {
              // The field focuses itself on any click inside it.
              event.stopPropagation();
              onChange('');
              inputRef.current?.focus();
            }}
            size={ButtonSize.XSmall}
            type="button"
            variant={ButtonVariant.Tertiary}
          />
        ) : undefined
      }
    />
  );
};
