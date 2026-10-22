import type { ReactElement } from 'react';
import React, { useRef } from 'react';
import classNames from 'classnames';
import { Button, ButtonSize, ButtonVariant } from '../../../buttons/Button';
import { MiniCloseIcon } from '../../../icons/MiniClose';
import { OTHER_DETAIL_MAX_LENGTH } from '../../../../graphql/users';

export const ACQUISITION_OPEN_FIELD_PLACEHOLDER = 'A friend, a video, Reddit…';
const HINT = 'A few words is plenty. We read every answer.';
const LIMIT_HINT = "That's the limit. We'll get the gist.";

interface AcquisitionOpenFieldProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
  // Enter submits once there is something to send.
  onSubmit?: () => void;
  label?: string;
  placeholder?: string;
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
  placeholder = ACQUISITION_OPEN_FIELD_PLACEHOLDER,
  isCompact,
  autoFocus,
  disabled,
}: AcquisitionOpenFieldProps): ReactElement => {
  const inputRef = useRef<HTMLInputElement>(null);
  const id = `${name}-answer`;
  const hintId = `${id}-hint`;
  const isAtLimit = value.length >= OTHER_DETAIL_MAX_LENGTH;

  return (
    <div className="flex w-full flex-col gap-2">
      <label
        className={classNames(
          'flex w-full cursor-text items-center gap-2 rounded-12 border border-solid border-border-subtlest-tertiary bg-surface-float pl-4 transition-colors focus-within:border-brand-default focus-within:bg-brand-active hover:border-border-subtlest-secondary',
          isCompact ? 'min-h-10 pr-1 typo-callout' : 'min-h-14 pr-2 typo-body',
          disabled && 'pointer-events-none opacity-64',
        )}
        htmlFor={id}
      >
        <input
          ref={inputRef}
          // The field is the step's only control, so typing is the next thing
          // they do.
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus={autoFocus}
          aria-describedby={hintId}
          aria-label={label}
          autoComplete="off"
          className="min-w-0 flex-1 bg-transparent py-3 text-text-primary outline-none placeholder:text-text-tertiary"
          disabled={disabled}
          enterKeyHint="done"
          id={id}
          maxLength={OTHER_DETAIL_MAX_LENGTH}
          name={id}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && value.trim()) {
              event.preventDefault();
              onSubmit?.();
            }
          }}
          placeholder={placeholder}
          type="text"
          value={value}
        />
        {!!value && (
          <Button
            aria-label="Clear answer"
            icon={<MiniCloseIcon />}
            onClick={() => {
              onChange('');
              inputRef.current?.focus();
            }}
            size={ButtonSize.XSmall}
            type="button"
            variant={ButtonVariant.Tertiary}
          />
        )}
      </label>
      <p
        aria-live="polite"
        className={classNames(
          'px-1',
          isCompact ? 'typo-caption1' : 'typo-footnote',
          isAtLimit ? 'text-text-secondary' : 'text-text-tertiary',
        )}
        id={hintId}
      >
        {isAtLimit ? LIMIT_HINT : HINT}
      </p>
    </div>
  );
};
