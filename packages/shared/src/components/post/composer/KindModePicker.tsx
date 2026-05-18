import type { ReactElement } from 'react';
import React, { cloneElement, useState } from 'react';
import classNames from 'classnames';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../dropdown/DropdownMenu';
import { IconSize } from '../../Icon';
import { ArrowIcon, EditIcon, LinkIcon, PollIcon } from '../../icons';
import type { ComposerKind } from './types';

interface KindOption {
  kind: ComposerKind;
  label: string;
  icon: ReactElement;
}

const KIND_OPTIONS: KindOption[] = [
  { kind: 'text', label: 'Free form', icon: <EditIcon /> },
  { kind: 'link', label: 'Share a link', icon: <LinkIcon /> },
  { kind: 'poll', label: 'Poll', icon: <PollIcon /> },
];

const findOption = (kind: ComposerKind): KindOption =>
  KIND_OPTIONS.find((option) => option.kind === kind) ?? KIND_OPTIONS[0];

interface KindModePickerProps {
  value: ComposerKind;
  onChange: (kind: ComposerKind) => void;
  disabled?: boolean;
}

export const KindModePicker = ({
  value,
  onChange,
  disabled,
}: KindModePickerProps): ReactElement => {
  const [open, setOpen] = useState(false);
  const active = findOption(value);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label={`${active.label} — change post type`}
          className={classNames(
            'inline-flex h-8 shrink-0 items-center gap-1.5 rounded-8 border border-accent-cabbage-default px-2 text-text-primary transition-colors',
            'hover:border-accent-cabbage-bolder',
            open ? 'bg-surface-float' : 'bg-transparent hover:bg-surface-float',
            disabled && 'opacity-60 cursor-default',
          )}
        >
          {cloneElement(active.icon, { size: IconSize.Size16 })}
          <span className="whitespace-nowrap typo-caption1">
            {active.label}
          </span>
          <ArrowIcon
            size={IconSize.Size16}
            className={classNames(
              'shrink-0 text-accent-cabbage-default transition-transform',
              open ? 'rotate-180' : 'rotate-0',
            )}
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        side="top"
        variant="action"
        className="!min-w-48"
      >
        {KIND_OPTIONS.map((option) => {
          const isActive = option.kind === value;
          return (
            <DropdownMenuItem
              key={option.kind}
              onSelect={(event: Event) => {
                event.preventDefault();
                onChange(option.kind);
                setOpen(false);
              }}
              aria-checked={isActive}
              className="!gap-2"
            >
              {cloneElement(option.icon, {
                size: IconSize.XXSmall,
                className: 'shrink-0 text-text-primary',
              })}
              <span
                className={classNames(
                  'min-w-0 flex-1 truncate text-left text-text-primary',
                  isActive && 'font-bold',
                )}
              >
                {option.label}
              </span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
