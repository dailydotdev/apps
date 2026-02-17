import { useCallback, useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Editor } from '@tiptap/react';
import type { UserShortProfile } from '../../../lib/user';
import type { RecommendedMentionsData } from '../../../graphql/comments';
import { RECOMMEND_MENTIONS_QUERY } from '../../../graphql/comments';
import { handleRegex } from '../../../graphql/users';
import { isValidHttpUrl } from '../../../lib';
import { useRequestProtocol } from '../../../hooks/useRequestProtocol';

type EditorRange = { from: number; to: number } | null;

interface UseMentionAutocompleteProps {
  enabled: boolean;
  postId?: string;
  sourceId?: string;
  userId?: string;
  onOffsetUpdate: (editor: Editor) => void;
}

export function useMentionAutocomplete({
  enabled,
  postId,
  sourceId,
  userId,
  onOffsetUpdate,
}: UseMentionAutocompleteProps) {
  const { requestMethod } = useRequestProtocol();
  const [query, setQuery] = useState<string>(undefined);
  const [selected, setSelected] = useState(0);
  const mentionRangeRef = useRef<EditorRange>(null);
  const queryRef = useRef<string>(undefined);
  const selectedRef = useRef(0);
  const mentionsRef = useRef<UserShortProfile[]>([]);

  const key = ['user', query, postId, sourceId];
  const { data = { recommendedMentions: [] } } =
    useQuery<RecommendedMentionsData>({
      queryKey: key,
      queryFn: () =>
        requestMethod(
          RECOMMEND_MENTIONS_QUERY,
          { postId, query, sourceId },
          { requestKey: JSON.stringify(key) },
        ),
      enabled: !!userId && typeof query !== 'undefined',
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    });

  const mentions = data?.recommendedMentions;

  useEffect(() => {
    queryRef.current = query;
  }, [query]);

  useEffect(() => {
    mentionsRef.current = mentions || [];
  }, [mentions]);

  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  const updateFromEditor = useCallback(
    (editor: Editor | null) => {
      if (!editor || !enabled) {
        return;
      }

      if (!editor.state.selection.empty) {
        setQuery(undefined);
        mentionRangeRef.current = null;
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

      if (word.startsWith('@')) {
        const mention = word.slice(1);
        const isValid = mention.length === 0 || handleRegex.test(mention);
        const looksLikeUrl =
          isValidHttpUrl(word) ||
          word.startsWith('www.') ||
          /^[a-zA-Z0-9-]+\.[a-zA-Z0-9-]+/i.test(word);

        if (isValid && !looksLikeUrl && !editor.isActive('link')) {
          if (typeof queryRef.current === 'undefined') {
            onOffsetUpdate(editor);
            setSelected(0);
          }

          const from = editor.state.selection.from - word.length;
          mentionRangeRef.current = {
            from,
            to: editor.state.selection.from,
          };
          queryRef.current = mention;
          setQuery(mention);
        } else if (typeof queryRef.current !== 'undefined') {
          queryRef.current = undefined;
          setQuery(undefined);
          mentionRangeRef.current = null;
        }
      } else if (typeof queryRef.current !== 'undefined') {
        queryRef.current = undefined;
        setQuery(undefined);
        mentionRangeRef.current = null;
      }
    },
    [enabled, onOffsetUpdate],
  );

  const applyMention = useCallback(
    (editor: Editor, mention: UserShortProfile) => {
      if (!mentionRangeRef.current) {
        return;
      }

      editor
        .chain()
        .focus()
        .insertContentAt(mentionRangeRef.current, `@${mention.username} `)
        .run();

      queryRef.current = undefined;
      setQuery(undefined);
      mentionRangeRef.current = null;
    },
    [],
  );

  const clearMention = useCallback(() => {
    queryRef.current = undefined;
    setQuery(undefined);
    mentionRangeRef.current = null;
  }, []);

  return {
    query,
    mentions,
    selected,
    setSelected,
    mentionRangeRef,
    queryRef,
    mentionsRef,
    selectedRef,
    updateFromEditor,
    applyMention,
    clearMention,
  };
}
