import { useQuery, useQueryClient } from 'react-query';
import {
  useState,
  useContext,
  KeyboardEvent as ReactKeyboardEvent,
  useEffect,
  MutableRefObject,
  useCallback,
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
  anyElementClassContains,
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
}

interface UseUserMentionProps {
  postId: string;
  onInput: (content: string) => unknown;
  commentRef?: MutableRefObject<HTMLDivElement>;
}

const UPDOWN_ARROW_KEYS = ['ArrowUp', 'ArrowDown'];
const LEFTRIGHT_ARROW_KEYS = ['ArrowLeft', 'ArrowRight'];

export function useUserMention({
  postId,
  commentRef,
  onInput,
}: UseUserMentionProps): UseUserMention {
  const key = ['user-mention', postId];
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

  const onBackspace = (el: HTMLDivElement) => {
    const backspaced = getWord(el, position);
    const value =
      (query === '' && backspaced === '') ||
      query === backspaced ||
      el.textContent.length === 0
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

    const [col, row] = getCaretPostition(commentRef.current);
    replaceWord(commentRef.current, [col + 1, row], '', '@', true);

    commentRef.current.dispatchEvent(
      new KeyboardEvent('keydown', { key: '@' }),
    );
  };

  const userClicked = useCallback(
    (event: MouseEvent & { path: HTMLElement[] }) => {
      event.stopPropagation();
      if (typeof query === 'undefined') {
        return;
      }

      const el = event.target as HTMLElement;
      const isTextarea = el.tagName.toLocaleLowerCase() === 'textarea';
      const isTooltip = anyElementClassContains(event.path, 'tippy-content');

      if (isTextarea || isTooltip) {
        return;
      }

      setQuery(undefined);
    },
    [query],
  );

  useEffect(() => {
    document.addEventListener('mousedown', userClicked);

    return () => {
      document.removeEventListener('mousedown', userClicked);
    };
  }, [userClicked]);

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
