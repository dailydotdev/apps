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

interface UseUserMention {
  mentionQuery?: string;
  onMentionKeypress: (event: KeyboardEvent) => unknown;
  mentionUsers: UserShortProfile[];
  selected: number;
  mentions: string[];
  onMention?: (username: string) => unknown;
}

interface UseUserMentionProps {
  postId: string;
  commentRef?: MutableRefObject<HTMLDivElement>;
}

const isAlphaNumeric = (event: KeyboardEvent) => {
  const match = event.key.match(/^[a-z0-9]+$/i);

  return match && match[0].length === 1;
};

const IGNORE_KEY = ['Shift', 'CapsLock'];
const shouldIgnoreKey = (event: KeyboardEvent) =>
  IGNORE_KEY.indexOf(event.key) !== -1;

const getNodeOffset = (
  el: HTMLElement,
  query: string,
): [ChildNode, number, number] => {
  const index = Array.from(el.childNodes).findIndex((child) => {
    const element = child.nodeValue ? child : child.childNodes[0];

    if (!element.nodeValue) {
      return false;
    }

    const strings = element.nodeValue.split(' ');

    return strings.some((string) => string === query);
  });
  const child = el.childNodes[index];
  const node = child.nodeValue ? child : child.childNodes[0];
  const start = node.nodeValue.indexOf(query);

  return [node, start, index];
};

function setCaret(el: HTMLElement, replacement: string) {
  const range = document.createRange();
  const sel = window.getSelection();
  const [node, start] = getNodeOffset(el, replacement);

  range.setStart(node, start + replacement.length);
  range.collapse(true);

  sel.removeAllRanges();
  sel.addRange(range);
}

export function useUserMention({
  postId,
  commentRef,
}: UseUserMentionProps): UseUserMention {
  const key = ['user-mention', postId];
  const { user } = useContext(AuthContext);
  const client = useQueryClient();
  const [selected, setSelected] = useState(0);
  const [mentions, setMentions] = useState<string[]>([]);
  const [mentionQuery, setMentionQuery] = useState<string>();
  const { data = { recommendedMentions: [] }, refetch } =
    useQuery<RecommendedMentionsData>(
      key,
      () =>
        request(`${apiUrl}/graphql`, RECOMMEND_MENTIONS_QUERY, {
          postId,
          name: mentionQuery,
        }),
      {
        enabled: !!user,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
      },
    );
  const { recommendedMentions: mentionUsers } = data;
  const fetchUsers = useDebounce(refetch, 300);
  const filteredUsers = mentionUsers?.filter(
    (mentionUser) => mentions.indexOf(mentionUser.username) === -1,
  );

  const onMention = (username: string) => {
    setMentions((state) => [...state, username]);
    const query = `@${mentionQuery}`;
    const replacement = `@${username}`;
    const content = commentRef?.current?.innerHTML.replace(query, replacement);
    // eslint-disable-next-line no-param-reassign
    commentRef.current.innerHTML = content;
    setCaret(commentRef.current, replacement);
    setMentionQuery(undefined);
    client.setQueryData(key, []);
  };

  const onKeypress = (event: KeyboardEvent) => {
    if (mentionQuery !== undefined) {
      if (event.key === 'ArrowUp' && selected > 0) {
        setSelected(selected - 1);
        event.preventDefault();
        return;
      }
      if (event.key === 'ArrowDown' && selected < filteredUsers.length - 1) {
        setSelected(selected + 1);
        event.preventDefault();
        return;
      }

      if (shouldIgnoreKey(event)) {
        return;
      }

      if (event.key === 'Enter') {
        if (filteredUsers.length === 0) {
          return;
        }

        event.preventDefault();
        onMention(filteredUsers[selected].username);
        return;
      }

      const value = isAlphaNumeric(event)
        ? mentionQuery + event.key
        : undefined;

      setMentionQuery(value);

      if (value) {
        fetchUsers();
      }
    } else if (event.key === '@') {
      setMentionQuery('');
    }
  };

  useEffect(() => {
    setSelected(0);
  }, [mentionQuery]);

  return {
    selected,
    mentions,
    mentionQuery,
    mentionUsers: filteredUsers,
    onMention,
    onMentionKeypress: onKeypress,
  };
}
