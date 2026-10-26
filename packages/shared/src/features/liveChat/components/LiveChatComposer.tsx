import type { KeyboardEvent, ReactElement } from 'react';
import React, { useRef, useState } from 'react';
import classNames from 'classnames';
import { composerFrame } from '../../interests/components/AgentComposer';
import { AgentSendButton } from '../../interests/components/AgentSendButton';
import { LIVE_CHAT_MESSAGE_MAX_LENGTH } from '../hooks/useLiveChatRoom';

const maxHeight = 120;

// Text only: the room keeps nothing, so there is nothing to attach it to.
export const LiveChatComposer = ({
  onSend,
  onDraftChange,
  onLeave,
  autoFocus,
}: {
  onSend: (body: string) => Promise<void>;
  onDraftChange: (hasText: boolean) => void;
  onLeave: () => void;
  autoFocus?: boolean;
}): ReactElement => {
  const [value, setValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const canSend = !!value.trim() && !isSending;

  const resize = () => {
    const el = inputRef.current;
    if (!el) {
      return;
    }
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
  };

  const send = async () => {
    if (!canSend) {
      return;
    }
    const body = value;
    setValue('');
    onDraftChange(false);
    setIsSending(true);
    try {
      await onSend(body);
    } catch {
      // The draft comes back so nothing typed is lost.
      setValue(body);
    } finally {
      setIsSending(false);
      requestAnimationFrame(() => {
        resize();
        inputRef.current?.focus();
      });
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      event.key === 'Enter' &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      send();
    }
  };

  return (
    <div className="flex flex-col gap-1.5 border-t border-border-subtlest-tertiary px-3 py-2">
      <div className={classNames(composerFrame, 'flex items-end')}>
        <textarea
          aria-label="Message"
          ref={inputRef}
          value={value}
          rows={1}
          maxLength={LIVE_CHAT_MESSAGE_MAX_LENGTH}
          placeholder="Say something…"
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus={autoFocus}
          onChange={(event) => {
            setValue(event.target.value);
            onDraftChange(!!event.target.value.trim());
            resize();
          }}
          onKeyDown={onKeyDown}
          className="min-h-8 flex-1 resize-none bg-transparent py-1.5 text-text-primary typo-callout focus:outline-none"
        />
        <AgentSendButton
          label="Send"
          disabled={!canSend}
          loading={isSending}
          onClick={send}
        />
      </div>
      <div className="flex items-center justify-between text-text-quaternary typo-caption2">
        <span>
          Text and links, up to {LIVE_CHAT_MESSAGE_MAX_LENGTH} characters
        </span>
        <button
          type="button"
          onClick={onLeave}
          className="underline hover:text-text-tertiary"
        >
          Leave
        </button>
      </div>
    </div>
  );
};
