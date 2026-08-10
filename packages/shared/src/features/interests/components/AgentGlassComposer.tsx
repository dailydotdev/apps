import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { FlexRow } from '../../../components/utilities';
import { MagicIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { AgentSendButton } from './AgentSendButton';

export const AgentGlassComposer = ({
  value,
  onChange,
  onSubmit,
  status,
  pending,
  placeholder = 'Spawn an agent to hunt something…',
  isBusy,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  status?: ReactNode;
  pending?: ReactNode;
  placeholder?: string;
  isBusy?: boolean;
  className?: string;
}): ReactElement => (
  <div className={classNames('relative w-full', className)}>
    <span
      aria-hidden
      className="agent-glass-bloom pointer-events-none absolute inset-x-10 bottom-0 top-4 rounded-24"
    />
    <div className="agent-glass-frame relative flex flex-col gap-1.5 rounded-20 p-1.5">
      {pending}
      <FlexRow className="agent-glass-field items-center gap-2 rounded-14 px-3 py-2">
        <MagicIcon
          size={IconSize.Size16}
          className="shrink-0 text-brand-default"
          aria-hidden
        />
        <input
          id="agent-feed-prompt"
          name="agent-feed-prompt"
          aria-label="What should the agent hunt for?"
          placeholder={placeholder}
          value={value}
          className="min-w-0 flex-1 bg-transparent text-text-primary outline-none typo-callout placeholder:text-text-quaternary"
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              onSubmit();
            }
          }}
        />
        <AgentSendButton
          label="Spawn the agent"
          loading={isBusy}
          disabled={!value.trim()}
          onClick={onSubmit}
        />
      </FlexRow>
      {status}
    </div>
  </div>
);
