import type { KeyboardEvent, ReactElement } from 'react';
import React, { useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import { composerFrame } from '../../interests/components/AgentComposer';
import { AgentSendButton } from '../../interests/components/AgentSendButton';
import { RecommendedMention } from '../../../components/RecommendedMention';
import type { UserShortProfile } from '../../../lib/user';
import { LIVE_CHAT_MESSAGE_MAX_LENGTH } from '../hooks/useLiveChatRoom';
import type { RoomPerson } from '../hooks/useRoomPeople';

const maxHeight = 120;
const maxSuggestions = 5;
// "@" plus whatever the viewer typed since, up to the caret.
const mentionAtCaret = /(?:^|\s)(@[A-Za-z0-9_.-]*)$/;

const toSuggestion = (person: RoomPerson): UserShortProfile => ({
  ...person,
  bio: '',
  createdAt: '',
  reputation: 0,
  companies: [],
  isPlus: false,
  plusMemberSince: undefined,
});

// Text only: the room keeps nothing, so there is nothing to attach it to.
// Typing "@" offers the people in the room, since they are who a mention
// can reach.
export const LiveChatComposer = ({
  people,
  viewerId,
  onSend,
  onDraftChange,
  onLeave,
  autoFocus,
}: {
  people: RoomPerson[];
  viewerId?: string;
  onSend: (body: string) => Promise<void>;
  onDraftChange: (hasText: boolean) => void;
  onLeave: () => void;
  autoFocus?: boolean;
}): ReactElement => {
  const [value, setValue] = useState('');
  const [caret, setCaret] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const canSend = !!value.trim() && !isSending;

  const mention = mentionAtCaret.exec(value.slice(0, caret));
  const query = mention?.[1].slice(1).toLowerCase();
  const suggestions = useMemo(() => {
    if (query === undefined) {
      return [];
    }

    return people
      .filter(
        (person) =>
          person.id !== viewerId &&
          person.username &&
          (person.username.toLowerCase().startsWith(query) ||
            person.name?.toLowerCase().startsWith(query)),
      )
      .slice(0, maxSuggestions)
      .map(toSuggestion);
  }, [people, query, viewerId]);
  const hasSuggestions = suggestions.length > 0;

  const resize = () => {
    const el = inputRef.current;
    if (!el) {
      return;
    }
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
  };

  const update = (next: string, nextCaret: number) => {
    setValue(next);
    setCaret(nextCaret);
    setSelected(0);
    onDraftChange(!!next.trim());
    requestAnimationFrame(resize);
  };

  const pick = (user: UserShortProfile) => {
    if (!mention) {
      return;
    }
    const start = caret - mention[1].length;
    const next = `${value.slice(0, start)}@${user.username} ${value.slice(
      caret,
    )}`;
    const nextCaret = start + user.username.length + 2;
    update(next, nextCaret);
    requestAnimationFrame(() => {
      const el = inputRef.current;
      el?.focus();
      el?.setSelectionRange(nextCaret, nextCaret);
    });
  };

  const send = async () => {
    if (!canSend) {
      return;
    }
    const body = value;
    update('', 0);
    setIsSending(true);
    try {
      await onSend(body);
    } catch {
      // The draft comes back so nothing typed is lost.
      update(body, body.length);
    } finally {
      setIsSending(false);
      requestAnimationFrame(() => {
        resize();
        inputRef.current?.focus();
      });
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (hasSuggestions) {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setSelected((current) => (current + 1) % suggestions.length);
        return;
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setSelected(
          (current) => (current - 1 + suggestions.length) % suggestions.length,
        );
        return;
      }
      if (event.key === 'Enter' || event.key === 'Tab') {
        event.preventDefault();
        pick(suggestions[selected]);
        return;
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        setCaret(0);
        return;
      }
    }
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
    <div className="relative flex flex-col gap-1.5 border-t border-border-subtlest-tertiary px-3 py-2">
      {hasSuggestions && (
        <RecommendedMention
          className="absolute bottom-full left-3 z-popup mb-1 w-64 bg-background-popover shadow-2"
          users={suggestions}
          selected={selected}
          onClick={pick}
        />
      )}
      <div className={classNames(composerFrame, 'flex items-end')}>
        <textarea
          aria-label="Message"
          ref={inputRef}
          value={value}
          rows={1}
          maxLength={LIVE_CHAT_MESSAGE_MAX_LENGTH}
          placeholder="Say something… @ to mention someone here"
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus={autoFocus}
          onChange={(event) =>
            update(event.target.value, event.target.selectionStart ?? 0)
          }
          onKeyUp={(event) => setCaret(event.currentTarget.selectionStart ?? 0)}
          onClick={(event) => setCaret(event.currentTarget.selectionStart ?? 0)}
          onKeyDown={onKeyDown}
          className="min-h-8 flex-1 resize-none bg-transparent py-1.5 text-text-primary typo-body focus:outline-none tablet:typo-callout"
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
