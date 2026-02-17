import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Editor } from '@tiptap/react';
import { search as emojiSearch } from 'node-emoji';
import { specialCharsRegex } from '../../../lib/strings';

type EditorRange = { from: number; to: number } | null;

interface UseEmojiAutocompleteProps {
  enabled: boolean;
  onOffsetUpdate: (editor: Editor) => void;
}

export function useEmojiAutocomplete({
  enabled,
  onOffsetUpdate,
}: UseEmojiAutocompleteProps) {
  const [emojiQuery, setEmojiQuery] = useState<string>(undefined);
  const [selectedEmoji, setSelectedEmoji] = useState(0);
  const emojiRangeRef = useRef<EditorRange>(null);
  const emojiQueryRef = useRef<string>(undefined);
  const selectedEmojiRef = useRef(0);
  const emojiDataRef = useRef<Array<{ emoji: string; name: string }>>([]);

  const emojiData = useMemo(
    () =>
      emojiQuery ? emojiSearch(emojiQuery.toLowerCase()).slice(0, 20) : [],
    [emojiQuery],
  );

  useEffect(() => {
    emojiDataRef.current = emojiData;
  }, [emojiData]);

  useEffect(() => {
    emojiQueryRef.current = emojiQuery;
  }, [emojiQuery]);

  useEffect(() => {
    selectedEmojiRef.current = selectedEmoji;
  }, [selectedEmoji]);

  const updateFromEditor = useCallback(
    (editor: Editor | null) => {
      if (!editor || !enabled) {
        return;
      }

      if (!editor.state.selection.empty) {
        setEmojiQuery(undefined);
        emojiRangeRef.current = null;
        return;
      }

      const { $from } = editor.state.selection;
      const parentText = $from.parent.textBetween(
        0,
        $from.parent.content.size,
        '\n',
        '\n',
      );
      const cursorOffset = $from.parentOffset;
      const textBefore = parentText.slice(0, cursorOffset);
      const wordMatch = /(?:^|\s)(\S+)$/.exec(textBefore);
      const word = wordMatch?.[1] || '';

      if (word.startsWith(':')) {
        const emojiValue = word.slice(1);
        if (!specialCharsRegex.test(emojiValue)) {
          if (typeof emojiQueryRef.current === 'undefined') {
            onOffsetUpdate(editor);
            setSelectedEmoji(0);
          }

          const from = editor.state.selection.from - word.length;
          emojiRangeRef.current = {
            from,
            to: editor.state.selection.from,
          };
          emojiQueryRef.current = emojiValue;
          setEmojiQuery(emojiValue);
          return;
        }
      }

      if (typeof emojiQueryRef.current !== 'undefined') {
        emojiQueryRef.current = undefined;
        setEmojiQuery(undefined);
        emojiRangeRef.current = null;
      }
    },
    [enabled, onOffsetUpdate],
  );

  const applyEmoji = useCallback((editor: Editor, emoji: string) => {
    if (!emojiRangeRef.current) {
      return;
    }

    editor
      .chain()
      .focus()
      .insertContentAt(emojiRangeRef.current, `${emoji} `)
      .run();

    emojiQueryRef.current = undefined;
    setEmojiQuery(undefined);
    emojiRangeRef.current = null;
  }, []);

  const clearEmoji = useCallback(() => {
    emojiQueryRef.current = undefined;
    setEmojiQuery(undefined);
    emojiRangeRef.current = null;
  }, []);

  return {
    emojiQuery,
    emojiData,
    selectedEmoji,
    setSelectedEmoji,
    emojiRangeRef,
    emojiQueryRef,
    emojiDataRef,
    selectedEmojiRef,
    updateFromEditor,
    applyEmoji,
    clearEmoji,
  };
}
