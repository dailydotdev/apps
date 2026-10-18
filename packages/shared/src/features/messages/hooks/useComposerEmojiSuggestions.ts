import type { KeyboardEvent, RefObject } from 'react';
import { useMemo, useState } from 'react';
import { search as emojiSearch } from 'node-emoji';
import { getCloseWord } from '../../../lib/textarea';
import { specialCharsRegex } from '../../../lib/strings';

const maxSuggestions = 20;

type EmojiSuggestion = { emoji: string; name: string };

interface UseComposerEmojiSuggestions {
  suggestions: EmojiSuggestion[];
  selected: number;
  check: () => void;
  close: () => void;
  apply: (emoji: string) => void;
  // Returns true when the key drove the suggestion list, so the caller skips
  // its own handling (Enter must pick the emoji, not send the message).
  onKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => boolean;
}

export const useComposerEmojiSuggestions = ({
  inputRef,
  setValue,
  onApplied,
}: {
  inputRef: RefObject<HTMLTextAreaElement>;
  setValue: (value: string) => void;
  onApplied?: () => void;
}): UseComposerEmojiSuggestions => {
  const [query, setQuery] = useState<string>();
  const [selected, setSelected] = useState(0);
  const suggestions = useMemo(
    () =>
      query ? emojiSearch(query.toLowerCase()).slice(0, maxSuggestions) : [],
    [query],
  );

  const close = () => setQuery(undefined);

  const check = () => {
    const input = inputRef.current;

    if (!input || input.selectionStart !== input.selectionEnd) {
      close();
      return;
    }

    const [word] = getCloseWord(input, [
      input.selectionStart,
      input.selectionEnd,
    ]);
    const next = word.substring(1);

    if (word.charAt(0) !== ':' || specialCharsRegex.test(next)) {
      close();
      return;
    }

    if (next !== query) {
      setSelected(0);
    }

    setQuery(next);
  };

  const apply = (emoji: string) => {
    const input = inputRef.current;

    if (!input) {
      return;
    }

    const [word, start] = getCloseWord(input, [
      input.selectionStart,
      input.selectionEnd,
    ]);
    const replacement = `${emoji} `;
    const caret = start + replacement.length;

    setValue(
      `${input.value.slice(0, start)}${replacement}${input.value.slice(
        start + word.length,
      )}`,
    );
    close();
    requestAnimationFrame(() => {
      input.focus();
      input.setSelectionRange(caret, caret);
      onApplied?.();
    });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>): boolean => {
    if (!suggestions.length || event.nativeEvent.isComposing) {
      return false;
    }

    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        setSelected(
          (current) => (current - 1 + suggestions.length) % suggestions.length,
        );
        return true;
      case 'ArrowDown':
        event.preventDefault();
        setSelected((current) => (current + 1) % suggestions.length);
        return true;
      case 'Enter':
      case 'Tab':
        event.preventDefault();
        apply(suggestions[selected].emoji);
        return true;
      case 'Escape':
        event.preventDefault();
        event.stopPropagation();
        close();
        return true;
      default:
        return false;
    }
  };

  return { suggestions, selected, check, close, apply, onKeyDown };
};
