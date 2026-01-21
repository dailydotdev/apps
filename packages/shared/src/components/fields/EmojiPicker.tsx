import type { ReactElement } from 'react';
import React, { useState, useCallback } from 'react';
import { EmojiPicker as FrimousseEmojiPicker } from 'frimousse';
import classNames from 'classnames';
import { Button, ButtonVariant } from '../buttons/Button';
import {
  Typography,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';

type EmojiPickerProps = {
  value: string;
  onChange: (emoji: string) => void;
  label?: string;
  className?: string;
};

export const EmojiPicker = ({
  value,
  onChange,
  label = 'Icon (optional)',
  className,
}: EmojiPickerProps): ReactElement => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = useCallback(
    (emoji: string) => {
      onChange(emoji);
      setIsOpen(false);
    },
    [onChange],
  );

  return (
    <div className={classNames('flex flex-col gap-2', className)}>
      <Typography bold type={TypographyType.Callout}>
        {label}
      </Typography>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant={!value ? ButtonVariant.Primary : ButtonVariant.Float}
          onClick={() => {
            onChange('');
            setIsOpen(false);
          }}
          className="!size-10 shrink-0"
        >
          -
        </Button>

        {value && (
          <div className="flex items-center gap-2 rounded-10 border border-border-subtlest-tertiary bg-surface-float px-3 py-2">
            <Typography tag={TypographyTag.Span} type={TypographyType.Title2}>
              {value}
            </Typography>
          </div>
        )}

        <Button
          type="button"
          variant={ButtonVariant.Float}
          onClick={() => setIsOpen(!isOpen)}
          className="shrink-0"
        >
          {isOpen && 'Close'}
          {!isOpen && value && 'Change'}
          {!isOpen && !value && 'Pick emoji'}
        </Button>
      </div>

      {isOpen && (
        <div className="relative rounded-16 border border-border-subtlest-tertiary bg-background-default p-2">
          <FrimousseEmojiPicker.Root
            onEmojiSelect={(emoji) => handleSelect(emoji.emoji)}
            className="flex h-72 flex-col"
          >
            <FrimousseEmojiPicker.Search
              className="mb-2 w-full rounded-10 border border-border-subtlest-tertiary bg-surface-float px-3 py-2 text-text-primary placeholder:text-text-quaternary focus:border-border-subtlest-secondary focus:outline-none"
              placeholder="Search emojis..."
              autoFocus
            />
            <FrimousseEmojiPicker.Viewport className="flex-1 overflow-hidden">
              <FrimousseEmojiPicker.Loading className="flex h-full items-center justify-center text-text-tertiary">
                Loading emojis...
              </FrimousseEmojiPicker.Loading>
              <FrimousseEmojiPicker.Empty className="flex h-full items-center justify-center text-text-tertiary">
                No emojis found
              </FrimousseEmojiPicker.Empty>
              <FrimousseEmojiPicker.List
                className="select-none"
                components={{
                  CategoryHeader: ({ category }) => (
                    <div className="sticky top-0 bg-background-default px-1 py-2 text-text-tertiary typo-footnote">
                      {category.label}
                    </div>
                  ),
                  Emoji: ({ emoji, ...props }) => (
                    <button
                      type="button"
                      className={classNames(
                        'flex size-9 items-center justify-center rounded-8 text-xl transition-colors hover:bg-surface-hover',
                        value === emoji.emoji && 'bg-surface-active',
                      )}
                      {...props}
                    >
                      {emoji.emoji}
                    </button>
                  ),
                  Row: ({ children }) => <div className="flex">{children}</div>,
                }}
              />
            </FrimousseEmojiPicker.Viewport>
          </FrimousseEmojiPicker.Root>
        </div>
      )}
    </div>
  );
};

export default EmojiPicker;
