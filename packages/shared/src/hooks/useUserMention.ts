import { useQuery, useQueryClient } from 'react-query';
import {
  useState,
  useContext,
  KeyboardEvent as ReactKeyboardEvent,
  useEffect,
  MutableRefObject,
} from 'react';
import request from 'graphql-request';
import {
  RecommendedMentionsData,
  RECOMMEND_MENTIONS_QUERY,
} from '../graphql/comments';
import { apiUrl } from '../lib/config';
import { UserShortProfile } from '../lib/user';
import AuthContext from '../contexts/AuthContext';
import useDebounce from './useDebounce';
import { isAlphaNumeric, isSpecialCharacter } from '../lib/strings';
import {
  CaretPosition,
  getCaretPostition,
  getWord,
  hasSpaceBeforeWord,
  isBreakLine,
  replaceWord,
  setCaretPosition,
} from '../lib/element';
import { nextTick } from '../lib/func';

interface UseUserMention {
  mentionQuery?: string;
  onMentionKeypress: (event: ReactKeyboardEvent) => unknown;
  selected: number;
  mentions: UserShortProfile[];
  offset: CaretPosition;
  onMentionClick?: (username: string) => unknown;
  onInitializeMention: () => unknown;
}

interface UseUserMentionProps {
  postId: string;
  onInput: (content: string) => unknown;
  commentRef?: MutableRefObject<HTMLDivElement>;
}

const ARROW_KEYS = ['ArrowUp', 'ArrowDown'];
const IGNORE_KEYS = ['Shift', 'CapsLock', 'Alt', 'Tab'];
const shouldIgnoreKey = (event: ReactKeyboardEvent) =>
  IGNORE_KEYS.indexOf(event.key) !== -1;

export function useUserMention({
  postId,
  commentRef,
  onInput,
}: UseUserMentionProps): UseUserMention {
  const key = ['user-mention', postId];
  const { user } = useContext(AuthContext);
  const client = useQueryClient();
  const [selected, setSelected] = useState(0);
  const [offset, setOffset] = useState<[number, number]>([0, 0]);
  const [query, setQuery] = useState<string>();
  const { data = { recommendedMentions: [] }, refetch } =
    useQuery<RecommendedMentionsData>(
      key,
      () =>
        request(`${apiUrl}/graphql`, RECOMMEND_MENTIONS_QUERY, {
          postId,
          query,
        }),
      {
        enabled: !!user && query !== undefined,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        onSuccess: ({ recommendedMentions }) => {
          if (recommendedMentions.length === 0 && query.length > 0) {
            setQuery(undefined);
          }
        },
      },
    );
  const { recommendedMentions: mentions } = data;
  const fetchUsers = useDebounce(refetch, 100);

  const onMention = (username: string) => {
    const element = commentRef.current;
    const mention = `@${query}`;
    const replacement = `@${username}`;
    replaceWord(element, offset, mention, replacement);
    setQuery(undefined);
    client.invalidateQueries(key);
    onInput(element.innerText);
  };

  const onArrowKey = (arrowKey: string) => {
    if (arrowKey === 'ArrowUp' && selected > 0) {
      setSelected(selected - 1);
    } else if (arrowKey === 'ArrowDown' && selected < mentions.length - 1) {
      setSelected(selected + 1);
    }
  };

  const onKeypress = async (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (query !== undefined) {
      if (ARROW_KEYS.indexOf(event.key) !== -1) {
        onArrowKey(event.key);
        event.preventDefault();
        return;
      }

      if (event.key === ' ') {
        setQuery(undefined);
        return;
      }

      if (shouldIgnoreKey(event)) {
        return;
      }

      if (event.key === 'Enter') {
        if (mentions.length === 0) {
          return;
        }

        event.preventDefault();
        onMention(mentions[selected].username);
        return;
      }

      if (event.key === ' ' && query.length === 0) {
        setQuery(undefined);
        return;
      }

      if (event.key === 'Backspace') {
        await nextTick();
        const backspaced = getWord(commentRef.current, offset, query);
        const value =
          (query === '' && backspaced === '') || query === backspaced
            ? undefined
            : backspaced;
        setQuery(value);
        fetchUsers();
        return;
      }

      const isSpecialCharacterKey = isSpecialCharacter(event.key);

      if (!isAlphaNumeric && !isSpecialCharacterKey) {
        return;
      }

      await nextTick();
      const value = isSpecialCharacterKey
        ? undefined
        : getWord(commentRef.current, offset, query);

      setQuery(value);

      if (value) {
        await nextTick();
        fetchUsers();
      }
    } else {
      if (
        !isAlphaNumeric(event.key) &&
        event.key !== '@' &&
        event.key !== 'Backspace'
      ) {
        return;
      }

      await nextTick();
      const [col, row] = getCaretPostition(commentRef.current);
      const [isValidTrigger, word, charAt] = hasSpaceBeforeWord(
        commentRef.current,
        [col, row],
      );

      if (!isValidTrigger) {
        return;
      }

      setQuery(word);
      setOffset([charAt, row]);
    }
  };

  const setTextarea = (value: string) => {
    const textarea = commentRef.current;
    onInput(value);
    textarea.innerHTML = value;
    setCaretPosition(
      value.length === 1 ? textarea : textarea.firstChild,
      value.length,
    );
  };

  const onInitializeMention = () => {
    if (query !== undefined) {
      return;
    }

    const textarea = commentRef.current;
    const value = commentRef.current.innerText;
    const trimmed = value.trim();
    const lines = value.split('\n');

    if (trimmed.length === 0) {
      setTextarea('@');
    } else if (lines.length === 1) {
      const text = `${trimmed} @`;
      setTextarea(text);
    } else {
      const [lastLine] = lines.reverse();
      const text = `${lastLine.trim()} @`;
      onInput(value + text);
      const node = textarea.lastElementChild;
      if (isBreakLine(node.firstChild)) {
        node.innerHTML = text + node.innerHTML;
      } else {
        node.firstChild.nodeValue = text;
      }
      setCaretPosition(node.firstChild, text.length);
    }
    textarea.dispatchEvent(new KeyboardEvent('keydown', { key: '@' }));
  };

  useEffect(() => {
    setSelected(0);
  }, [query]);

  return {
    offset,
    selected,
    mentions,
    mentionQuery: query,
    onMentionClick: onMention,
    onMentionKeypress: onKeypress,
    onInitializeMention,
  };
}
