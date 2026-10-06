import type { KeyboardEvent, ReactElement, ReactNode } from 'react';
import React, { useRef, useState } from 'react';
import { FlexCol, FlexRow } from '../../../components/utilities';
import { composerFrame } from '../../interests/components/AgentComposer';
import { AgentSendButton } from '../../interests/components/AgentSendButton';
import { DM_MAX_LENGTH } from '../types';

const maxComposerHeight = 160;

export const MessageComposer = ({
  username,
  attachment,
  onSend,
}: {
  username: string;
  attachment?: ReactNode;
  onSend: (body: string) => void;
}): ReactElement => {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const canSend = !!value.trim();

  const resize = () => {
    const input = inputRef.current;

    if (!input) {
      return;
    }

    input.style.height = 'auto';
    input.style.height = `${Math.min(input.scrollHeight, maxComposerHeight)}px`;
  };

  const onSubmit = () => {
    if (!canSend) {
      return;
    }

    onSend(value.trim());
    setValue('');
    requestAnimationFrame(resize);
    inputRef.current?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      event.key === 'Enter' &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="shrink-0 px-4 pb-4 tablet:px-6">
      <FlexCol className={composerFrame}>
        {attachment}
        <FlexRow className="items-end gap-1.5">
          <textarea
            ref={inputRef}
            id="dm-composer"
            name="dm-composer"
            rows={1}
            aria-label={`Message @${username}`}
            placeholder={`Message @${username}`}
            maxLength={DM_MAX_LENGTH}
            value={value}
            className="block min-h-8 w-full min-w-0 flex-1 resize-none bg-transparent py-1.5 text-text-primary outline-none typo-callout placeholder:text-text-quaternary"
            onChange={(event) => {
              setValue(event.target.value);
              resize();
            }}
            onKeyDown={onKeyDown}
          />
          <AgentSendButton
            label="Send message"
            className="shrink-0"
            disabled={!canSend}
            onClick={onSubmit}
          />
        </FlexRow>
      </FlexCol>
    </div>
  );
};
