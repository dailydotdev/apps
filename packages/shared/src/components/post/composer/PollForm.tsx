import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { MiniCloseIcon, PlusIcon, ArrowIcon } from '../../icons';
import { IconSize } from '../../Icon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuOptions,
  DropdownMenuTrigger,
} from '../../dropdown/DropdownMenu';
import { Tooltip } from '../../tooltip/Tooltip';
import {
  POLL_OPTIONS_MAX,
  POLL_OPTIONS_MIN,
  POLL_OPTION_MAX_LENGTH,
  TITLE_MAX_LENGTH,
  type PollFormState,
} from './types';

interface PollFormProps {
  value: PollFormState;
  onChange: (next: PollFormState) => void;
}

const DURATION_OPTIONS: Array<{ label: string; value: number | undefined }> = [
  { label: '1 day', value: 1 },
  { label: '3 days', value: 3 },
  { label: '7 days', value: 7 },
  { label: '14 days', value: 14 },
  { label: '30 days', value: 30 },
  { label: 'No end date', value: undefined },
];

const findDurationLabel = (value: number | undefined): string =>
  DURATION_OPTIONS.find((option) => option.value === value)?.label ?? '7 days';

export const PollForm = ({ value, onChange }: PollFormProps): ReactElement => {
  const [durationOpen, setDurationOpen] = useState(false);
  const questionRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    questionRef.current?.focus();
  }, []);

  const updateOption = useCallback(
    (index: number, next: string) => {
      const options = [...value.options];
      options[index] = next;
      onChange({ ...value, options });
    },
    [onChange, value],
  );

  const removeOption = useCallback(
    (index: number) => {
      if (value.options.length <= POLL_OPTIONS_MIN) {
        return;
      }
      onChange({
        ...value,
        options: value.options.filter((_, i) => i !== index),
      });
    },
    [onChange, value],
  );

  const addOption = useCallback(() => {
    if (value.options.length >= POLL_OPTIONS_MAX) {
      return;
    }
    onChange({ ...value, options: [...value.options, ''] });
  }, [onChange, value]);

  return (
    <div className="flex flex-col gap-4">
      <textarea
        ref={questionRef}
        name="question"
        placeholder="Ask a question…"
        maxLength={TITLE_MAX_LENGTH}
        rows={1}
        value={value.question}
        onChange={(e) =>
          onChange({
            ...value,
            question: e.currentTarget.value.replace(/\n/g, ''),
          })
        }
        aria-label="Poll question"
        className="w-full resize-none overflow-hidden break-words bg-transparent font-bold leading-tight text-text-primary outline-none typo-title2 placeholder:text-text-quaternary"
      />
      <div className="flex flex-col gap-2">
        {value.options.map((option, index) => {
          const canRemove = value.options.length > POLL_OPTIONS_MIN;
          return (
            <div
              // eslint-disable-next-line react/no-array-index-key
              key={index}
              className="flex items-center gap-2 rounded-12 border border-border-subtlest-tertiary bg-surface-float px-3 py-2 focus-within:border-border-subtlest-primary"
            >
              <span className="text-text-tertiary typo-callout">
                {index + 1}.
              </span>
              <input
                type="text"
                value={option}
                maxLength={POLL_OPTION_MAX_LENGTH}
                placeholder={`Option ${index + 1}`}
                onChange={(e) => updateOption(index, e.currentTarget.value)}
                aria-label={`Poll option ${index + 1}`}
                className="flex-1 bg-transparent text-text-primary outline-none typo-callout placeholder:text-text-quaternary"
              />
              {canRemove && (
                <Tooltip content="Remove option">
                  <Button
                    type="button"
                    size={ButtonSize.XSmall}
                    variant={ButtonVariant.Tertiary}
                    icon={<MiniCloseIcon size={IconSize.Size16} />}
                    onClick={() => removeOption(index)}
                    aria-label={`Remove option ${index + 1}`}
                  />
                </Tooltip>
              )}
            </div>
          );
        })}
        {value.options.length < POLL_OPTIONS_MAX && (
          <Button
            type="button"
            size={ButtonSize.Small}
            variant={ButtonVariant.Subtle}
            icon={<PlusIcon />}
            onClick={addOption}
            className="self-start"
          >
            Add option
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-text-tertiary typo-callout">
          Poll closes after
        </span>
        <DropdownMenu open={durationOpen} onOpenChange={setDurationOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              size={ButtonSize.Small}
              variant={ButtonVariant.Tertiary}
              className="!rounded-12 !border !border-border-subtlest-tertiary !px-3 !font-normal !typo-callout"
            >
              {findDurationLabel(value.durationDays)}
              <ArrowIcon
                className="ml-2 rotate-180 text-text-tertiary"
                secondary
                size={IconSize.Size16}
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            variant="field"
            className="min-w-44"
          >
            <DropdownMenuOptions
              options={DURATION_OPTIONS.map((option) => ({
                label: option.label,
                action: () => {
                  onChange({ ...value, durationDays: option.value });
                  setDurationOpen(false);
                },
              }))}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
