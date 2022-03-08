import { useQuery, useQueryClient } from 'react-query';
import {
  useState,
  useContext,
  KeyboardEvent,
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
import { isKeyAlphaNumeric } from '../lib/strings';
import {
  CaretPosition,
  getCaretPostition,
  setCaretPosition,
} from '../lib/element';

interface UseUserMention {
  mentionQuery?: string;
  onMentionKeypress: (event: KeyboardEvent) => unknown;
  selected: number;
  mentions: UserShortProfile[];
  offset: CaretPosition;
  onMentionClick?: (username: string) => unknown;
}

interface UseUserMentionProps {
  postId: string;
  onInput: (content: string) => unknown;
  commentRef?: MutableRefObject<HTMLDivElement>;
}

const ARROW_KEYS = ['ArrowUp', 'ArrowDown'];
const IGNORE_KEYS = ['Shift', 'CapsLock', 'Alt', 'Tab'];
const shouldIgnoreKey = (event: KeyboardEvent) =>
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
      },
    );
  const { recommendedMentions: mentions } = data;
  const fetchUsers = useDebounce(refetch, 300);

  const onMention = (username: string) => {
    const mention = `@${query}`;
    const replacement = `@${username}`;
    const element = commentRef?.current;
    const content = element.innerHTML.replace(mention, replacement);
    // eslint-disable-next-line no-param-reassign
    element.innerHTML = content;
    setQuery(undefined);
    client.setQueryData(key, []);
    setTimeout(() => {
      setCaretPosition(element, replacement);
      onInput(element.innerText);
    });
  };

  const onArrowKey = (arrowKey: string) => {
    if (arrowKey === 'ArrowUp' && selected > 0) {
      setSelected(selected - 1);
    } else if (arrowKey === 'ArrowDown' && selected < mentions.length - 1) {
      setSelected(selected + 1);
    }
  };

  const onKeypress = (event: KeyboardEvent) => {
    if (query !== undefined) {
      if (ARROW_KEYS.indexOf(event.key) !== -1) {
        onArrowKey(event.key);
        event.preventDefault();
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

      const value = isKeyAlphaNumeric(event.key)
        ? query + event.key
        : undefined;

      setQuery(value);

      if (value) {
        setTimeout(() => {
          fetchUsers();
        });
      }
    } else if (event.key === '@') {
      setTimeout(() => {
        const position = getCaretPostition(commentRef.current);
        setOffset(position);
        setQuery('');
      });
    }
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
  };
}
