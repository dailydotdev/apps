import { useQuery, useQueryClient } from 'react-query';
import {
  useState,
  useContext,
  KeyboardEvent as ReactKeyboardEvent,
  useEffect,
  MutableRefObject,
  useRef,
  useMemo,
} from 'react';
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
  parentClassContains,
  getSelectionStart,
} from '../lib/element';
import { nextTick } from '../lib/func';
import { useRequestProtocol } from './useRequestProtocol';

interface UseUserMention {
  mentionQuery?: string;
  onMentionKeypress: (event: ReactKeyboardEvent) => unknown;
  selected: number;
  mentions: UserShortProfile[];
  offset: CaretOffset;
  onInputClick?: () => unknown;
  onMentionClick?: (username: string) => unknown;
  onInitializeMention: () => unknown;
  commentRef?: MutableRefObject<HTMLTextAreaElement>;
}

interface UseUserMentionProps {
  postId: string;
  onInput: (content: string) => unknown;
}

export const UPDOWN_ARROW_KEYS = ['ArrowUp', 'ArrowDown'];
const LEFTRIGHT_ARROW_KEYS = ['ArrowLeft', 'ArrowRight'];

/* eslint-disable no-param-reassign */
export const fixHeight = (el: HTMLElement): void => {
  const attr = el.getAttribute('data-min-height');
  const minHeight = parseInt(attr, 10);
  el.style.height = 'auto';
  el.style.height = `${Math.max(el.scrollHeight, minHeight)}px`;
};

export function useUserMention({
  postId,
  onInput,
}: UseUserMentionProps): UseUserMention {
  const key = ['user-mention', postId];
  const commentRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useContext(AuthContext);
  const client = useQueryClient();
  const [selected, setSelected] = useState(0);
  const [offset, setOffset] = useState<CaretOffset>([0, 0]);
  const [position, setPosition] = useState<CaretPosition>([0, 0]);
  const [query, setQuery] = useState<string>();
  const { requestMethod } = useRequestProtocol();
  const { data = { recommendedMentions: [] }, refetch } =
    useQuery<RecommendedMentionsData>(
      key,
      () =>
        requestMethod(
          `${apiUrl}/graphql`,
          RECOMMEND_MENTIONS_QUERY,
          { postId, query },
          { requestKey: JSON.stringify(key) },
        ),
      {
        enabled: !!user && typeof query !== 'undefined',
        refetchOnWindowFocus: false,
        refetchOnMount: false,
      },
    );
  const { recommendedMentions: mentions } = data || {};
  const [fetchUsers] = useDebounce(refetch, 100);

  const initializeMention = async (isInvalidCallback?: () => unknown) => {
    await nextTick();
    const textarea = commentRef.current;
    const [col, row] = getCaretPostition(textarea);
    const [isValidTrigger, word, charAt] = hasSpaceBeforeWord(textarea, [
      col,
      row,
    ]);

    if (!isValidTrigger) {
      isInvalidCallback?.();
      return;
    }

    const currentCoordinates = getCaretOffset(textarea);

    if (word === query) {
      return;
    }

    setQuery(word);
    setPosition([charAt, row]);
    setOffset(currentCoordinates);
  };

  const onMention = (username: string) => {
    if (!mentions?.length) {
      return;
    }

    const element = commentRef.current;
    const mention = `@${query}`;
    const replacement = `@${username}`;
    replaceWord(element, position, mention, replacement);
    const start = getSelectionStart(element.value, position);
    element.focus();
    element.selectionEnd = start + replacement.length;
    setQuery(undefined);
    client.setQueryData(key, []);
    onInput(element.value);
    fixHeight(element);
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
      (query === '' && backspaced === '') ||
      query === backspaced ||
      el.value.length === 0
        ? undefined
        : backspaced;
    setQuery(value);
    fetchUsers();
  };

  const onInputClick = () => {
    const isInvalidCallback = () => setQuery(undefined);

    initializeMention(isInvalidCallback);
  };

  const onKeypress = async (
    event: ReactKeyboardEvent<HTMLTextAreaElement>,
  ): Promise<unknown> => {
    if (LEFTRIGHT_ARROW_KEYS.indexOf(event.key) !== -1) {
      return onInputClick();
    }

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

    if (UPDOWN_ARROW_KEYS.indexOf(event.key) !== -1) {
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
    const userClicked = (event: MouseEvent) => {
      event.stopPropagation();
      if (typeof query === 'undefined') {
        return;
      }

      const el = event.target as HTMLElement;
      const isTextarea = el.tagName.toLocaleLowerCase() === 'textarea';
      const isTooltip = parentClassContains(el, 'tippy-content');
      if (isTextarea || isTooltip) {
        return;
      }

      setQuery(undefined);
    };

    const dom = commentRef.current?.getRootNode();
    dom.addEventListener('mousedown', userClicked);

    return () => {
      dom.removeEventListener('mousedown', userClicked);
    };
  }, [query]);

  useEffect(() => {
    setSelected(0);
  }, [query]);

  return useMemo(
    () => ({
      commentRef,
      offset,
      selected,
      mentions,
      mentionQuery: query,
      onInputClick,
      onMentionClick: onMention,
      onMentionKeypress: onKeypress,
      onInitializeMention: onInitializeMentionButtonClick,
    }),
    [commentRef, offset, selected, mentions, query],
  );
}
