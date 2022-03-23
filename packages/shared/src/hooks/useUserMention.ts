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
  replaceWord,
  getCaretOffset,
  CaretOffset,
} from '../lib/element';
import { nextTick } from '../lib/func';

interface UseUserMention {
  mentionQuery?: string;
  onMentionKeypress: (event: ReactKeyboardEvent) => unknown;
  selected: number;
  mentions: UserShortProfile[];
  offset: CaretOffset;
  onInputClick?: () => unknown;
  onMentionClick?: (username: string) => unknown;
  onInitializeMention: () => unknown;
}

interface UseUserMentionProps {
  postId: string;
  onInput: (content: string) => unknown;
  commentRef?: MutableRefObject<HTMLTextAreaElement>;
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
  const [position, setPosition] = useState<CaretPosition>([0, 0, 0]);
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
        enabled: !!user && typeof query !== 'undefined',
        refetchOnWindowFocus: false,
        refetchOnMount: false,
      },
    );
  const { recommendedMentions: mentions } = data;
  const fetchUsers = useDebounce(refetch, 100);

  const initializeMention = async (isInvalidCallback?: () => unknown) => {
    await nextTick();
    const textarea = commentRef.current;
    const [col, row, start] = getCaretPostition(textarea);
    const [isValidTrigger, word, charAt] = hasSpaceBeforeWord(textarea, [
      col,
      row,
      start,
    ]);

    if (!isValidTrigger) {
      isInvalidCallback?.();
      return;
    }

    const currentCoordinates = getCaretOffset(textarea);

    setQuery(word);
    setPosition([charAt, row, start]);
    setOffset(currentCoordinates);
  };

  const onMention = (username: string) => {
    if (!mentions?.length) {
      return;
    }

    const [, , start] = position;
    const element = commentRef.current;
    const mention = `@${query}`;
    const replacement = `@${username}`;
    replaceWord(element, position, mention, replacement);
    element.focus();
    element.selectionEnd = start + replacement.length;
    setQuery(undefined);
    client.setQueryData(key, []);
    onInput(element.value);
  };

  const onArrowKey = (arrowKey: string) => {
    if (arrowKey === 'ArrowUp' && selected > 0) {
      setSelected(selected - 1);
    } else if (arrowKey === 'ArrowDown' && selected < mentions.length - 1) {
      setSelected(selected + 1);
    }
  };

  const onBackspace = (el: HTMLTextAreaElement) => {
    const backspaced = getWord(el, position);
    const value =
      (query === '' && backspaced === '') || query === backspaced
        ? undefined
        : backspaced;
    setQuery(value);
    fetchUsers();
  };

  const onKeypress = async (
    event: ReactKeyboardEvent<HTMLTextAreaElement>,
  ): Promise<unknown> => {
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

    await nextTick();

    if (event.key === 'Backspace') {
      return onBackspace(commentRef.current);
    }

    const value = isSpecialCharacter(event.key)
      ? undefined
      : getWord(commentRef.current, position);

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

  const onInitializeMentionButtonClick = () => {
    if (typeof query !== 'undefined') {
      return;
    }
    const textarea = commentRef.current;
    const start = textarea.selectionStart;
    const left = textarea.value.substring(0, start);
    const right = textarea.value.substring(start);
    textarea.value = `${left} @ ${right}`;
    textarea.focus();
    textarea.selectionEnd = start + 2;

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
