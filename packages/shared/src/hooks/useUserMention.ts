import { useQuery, useQueryClient } from 'react-query';
import {
  useState,
  useContext,
  useEffect,
  MutableRefObject,
  useRef,
  useMemo,
} from 'react';
import {
  RecommendedMentionsData,
  RECOMMEND_MENTIONS_QUERY,
} from '../graphql/comments';
import { graphqlUrl } from '../lib/config';
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
  CommentInputEvent,
  X_AXIS_KEYS,
  ArrowKey,
  Y_AXIS_KEYS,
  KeyboardCommand,
  deleteInputs,
  InputEventType,
} from '../lib/element';
import { nextTick } from '../lib/func';
import { useRequestProtocol } from './useRequestProtocol';

export interface UseUserMentionOptions {
  mentionQuery?: string;
  onMentionKeypress: (key: string, event: CommentInputEvent) => unknown;
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
  sourceId?: string;
  onInput: (content: string) => unknown;
}

/* eslint-disable no-param-reassign */
export const fixHeight = (el: HTMLElement): void => {
  const attr = el.getAttribute('data-min-height');
  const minHeight = parseInt(attr, 10);
  el.style.height = 'auto';
  el.style.height = `${Math.max(el.scrollHeight, minHeight)}px`;
};

export function useUserMention({
  postId,
  sourceId,
  onInput,
}: UseUserMentionProps): UseUserMentionOptions {
  const commentRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useContext(AuthContext);
  const client = useQueryClient();
  const [selected, setSelected] = useState(0);
  const [offset, setOffset] = useState<CaretOffset>([0, 0]);
  const [position, setPosition] = useState<CaretPosition>([0, 0]);
  const [query, setQuery] = useState<string>();
  const key = ['user-mention', postId, sourceId, query];
  const { requestMethod } = useRequestProtocol();
  const { data = { recommendedMentions: [] }, refetch } =
    useQuery<RecommendedMentionsData>(
      key,
      () =>
        requestMethod(
          graphqlUrl,
          RECOMMEND_MENTIONS_QUERY,
          { postId, query, sourceId },
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
    commentRef.current.focus();
  };

  const onArrowKey = (arrowKey: ArrowKey) => {
    if (arrowKey === ArrowKey.Up && selected > 0) {
      setSelected(selected - 1);
    } else if (arrowKey === ArrowKey.Down && selected < mentions.length - 1) {
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
    pressed: string,
    event: CommentInputEvent,
  ): Promise<unknown> => {
    if (X_AXIS_KEYS.includes(pressed as ArrowKey)) {
      return onInputClick();
    }

    const isBackspace =
      pressed === KeyboardCommand.Backspace ||
      (event.inputType && deleteInputs.includes(event.inputType));
    const isEnter =
      pressed === KeyboardCommand.Enter ||
      event.inputType === InputEventType.InsertLineBreak;

    if (typeof query === 'undefined') {
      if (!isAlphaNumeric(pressed ?? '') && pressed !== '@' && !isBackspace) {
        return null;
      }

      return initializeMention();
    }

    if (Y_AXIS_KEYS.includes(pressed as ArrowKey)) {
      onArrowKey(pressed as ArrowKey);
      return event.preventDefault();
    }

    if (pressed === ' ') {
      return setQuery(undefined);
    }

    if (isEnter) {
      event.preventDefault();
      return onMention(mentions[selected].username);
    }

    await nextTick();

    if (isBackspace) {
      return onBackspace(commentRef.current);
    }

    const value = isSpecialCharacter(pressed)
      ? undefined
      : getWord(commentRef.current, position);

    setQuery(value);

    if (value) {
      fetchUsers();
    }

    return null;
  };

  const onInitializeMentionButtonClick = () => {
    if (typeof query !== 'undefined' || !commentRef.current) {
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
    dom?.addEventListener('mousedown', userClicked);

    return () => {
      dom?.removeEventListener('mousedown', userClicked);
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
