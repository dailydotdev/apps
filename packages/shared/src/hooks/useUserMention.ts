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
  onInputClick?: () => unknown;
  onMentionClick?: (username: string) => unknown;
  onInitializeMention: () => unknown;
}

interface UseUserMentionProps {
  postId: string;
  onInput: (content: string) => unknown;
  commentRef?: MutableRefObject<HTMLDivElement>;
}

const ARROW_KEYS = ['ArrowUp', 'ArrowDown'];

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
      },
    );
  const { recommendedMentions: mentions } = data;
  const fetchUsers = useDebounce(refetch, 100);

  const initializeMention = async (isInvalidCallback?: () => unknown) => {
    await nextTick();
    const [col, row] = getCaretPostition(commentRef.current);
    const [isValidTrigger, word, charAt] = hasSpaceBeforeWord(
      commentRef.current,
      [col, row],
    );

    if (!isValidTrigger) {
      isInvalidCallback?.();
      return;
    }

    setQuery(word);
    setOffset([charAt, row]);
  };

  const onMention = (username: string) => {
    if (!mentions?.length) {
      return;
    }

    const element = commentRef.current;
    const mention = `@${query}`;
    const replacement = `@${username}`;
    replaceWord(element, offset, mention, replacement);
    setQuery(undefined);
    client.setQueryData(key, []);
    onInput(element.innerText);
  };

  const onArrowKey = (arrowKey: string) => {
    if (arrowKey === 'ArrowUp' && selected > 0) {
      setSelected(selected - 1);
    } else if (arrowKey === 'ArrowDown' && selected < mentions.length - 1) {
      setSelected(selected + 1);
    }
  };

  const onBackspace = (el: HTMLElement) => {
    const backspaced = getWord(el, offset, query);
    const value =
      (query === '' && backspaced === '') || query === backspaced
        ? undefined
        : backspaced;
    setQuery(value);
    fetchUsers();
  };

  const onKeypress = (event: ReactKeyboardEvent<HTMLDivElement>): unknown => {
    if (typeof query === 'undefined') {
      if (
        !isAlphaNumeric(event.key) &&
        event.key !== '@' &&
        event.key !== 'Backspace'
      ) {
        return null;
      }

      return initializeMention();
    }

    if (ARROW_KEYS.indexOf(event.key) !== -1) {
      onArrowKey(event.key);
      return event.preventDefault();
    }

    if (event.key === ' ') {
      return setQuery(undefined);
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      return onMention(mentions[selected].username);
    }

    if (event.key === 'Backspace') {
      return onBackspace(event.currentTarget);
    }

    const value = isSpecialCharacter(event.key)
      ? undefined
      : getWord(event.currentTarget, offset, query);

    setQuery(value);

    if (value) {
      fetchUsers();
    }

    return null;
  };

  const onInputClick = () => {
    const isInvalidCallback = () => setQuery(undefined);

    initializeMention(isInvalidCallback);
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

  const onInitializeMentionButtonClick = () => {
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
    onInputClick,
    onMentionClick: onMention,
    onMentionKeypress: onKeypress,
    onInitializeMention: onInitializeMentionButtonClick,
  };
}
