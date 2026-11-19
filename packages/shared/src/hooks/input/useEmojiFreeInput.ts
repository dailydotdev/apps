import type { SyntheticEvent } from 'react';
import { useCallback, useState } from 'react';
import { stripEmojis } from '../../lib/strings';

type TextInputElement = HTMLInputElement | HTMLTextAreaElement;

export const EMOJI_FREE_TITLE_HINT = "Emojis aren't allowed in post titles";

export const stripEmojisFromInput = (input: TextInputElement): boolean => {
  const { value, selectionEnd } = input;
  const nextValue = stripEmojis(value);
  if (nextValue === value) {
    return false;
  }

  const caret =
    selectionEnd === null
      ? nextValue.length
      : stripEmojis(value.slice(0, selectionEnd)).length;
  // eslint-disable-next-line no-param-reassign
  input.value = nextValue;
  input.setSelectionRange(caret, caret);
  return true;
};

interface UseEmojiFreeInput {
  hasStrippedEmojis: boolean;
  onEmojiFreeInput: (event: SyntheticEvent<TextInputElement>) => void;
  resetEmojiHint: () => void;
}

export const useEmojiFreeInput = (): UseEmojiFreeInput => {
  const [hasStrippedEmojis, setHasStrippedEmojis] = useState(false);

  const onEmojiFreeInput = useCallback(
    (event: SyntheticEvent<TextInputElement>) => {
      if (stripEmojisFromInput(event.currentTarget)) {
        setHasStrippedEmojis(true);
      }
    },
    [],
  );

  const resetEmojiHint = useCallback(() => setHasStrippedEmojis(false), []);

  return { hasStrippedEmojis, onEmojiFreeInput, resetEmojiHint };
};
