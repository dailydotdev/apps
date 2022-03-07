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

interface UseUserMention {
  mentionQuery?: string;
  onMentionKeypress: (event: KeyboardEvent) => unknown;
  selected: number;
  mentions: UserShortProfile[];
  offset: [number, number];
  onMentionClick?: (username: string) => unknown;
}

interface UseUserMentionProps {
  postId: string;
  onInput: (content: string) => unknown;
  commentRef?: MutableRefObject<HTMLDivElement>;
}

const IGNORE_KEY = ['Shift', 'CapsLock'];
const shouldIgnoreKey = (event: KeyboardEvent) =>
  IGNORE_KEY.indexOf(event.key) !== -1;

const isBreakLine = (node: ChildNode) => !node.nodeValue;

const getNode = (
  el: HTMLElement,
  query: string,
): [ChildNode, { x: number; y: number }] => {
  const index = Array.from(el.childNodes).findIndex((child) => {
    const element = child.nodeValue ? child : child.childNodes[0];

    if (isBreakLine(element)) {
      return false;
    }

    const strings = element.nodeValue.split(' ');

    return strings.some((string) => string === query);
  });
  const child = el.childNodes[index];
  const node = child.nodeValue ? child : child.childNodes[0];
  const start = node.nodeValue.indexOf(query);

  return [node, { x: start, y: index }];
};

function setCaret(el: HTMLElement, replacement: string) {
  const range = document.createRange();
  const sel = window.getSelection();
  const [node, { x }] = getNode(el, replacement);

  range.setStart(node, x + replacement.length);
  range.collapse(true);

  sel.removeAllRanges();
  sel.addRange(range);
}

function getCaretPost(el: Element): [number, number] {
  const sel = window.getSelection();
  const row = Array.from(el.childNodes).findIndex((child) => {
    const element = child.nodeValue ? child : child.childNodes[0];

    return sel.anchorNode === element;
  });
  return [sel.anchorOffset, row];
}

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
  const [mentionQuery, setMentionQuery] = useState<string>();
  const { data = { recommendedMentions: [] }, refetch } =
    useQuery<RecommendedMentionsData>(
      key,
      () =>
        request(`${apiUrl}/graphql`, RECOMMEND_MENTIONS_QUERY, {
          postId,
          query: mentionQuery,
        }),
      {
        enabled: !!user && mentionQuery !== undefined,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
      },
    );
  const { recommendedMentions: mentions } = data;
  const fetchUsers = useDebounce(refetch, 300);

  const onMention = (username: string) => {
    const query = `@${mentionQuery}`;
    const replacement = `@${username}`;
    const element = commentRef?.current;
    const content = element.innerHTML.replace(query, replacement);
    // eslint-disable-next-line no-param-reassign
    element.innerHTML = content;
    setMentionQuery(undefined);
    client.setQueryData(key, []);
    setTimeout(() => {
      setCaret(element, replacement);
      onInput(element.innerText);
    });
  };

  const onKeypress = (event: KeyboardEvent) => {
    if (mentionQuery !== undefined) {
      if (event.key === 'ArrowUp' && selected > 0) {
        setSelected(selected - 1);
        event.preventDefault();
        return;
      }
      if (event.key === 'ArrowDown' && selected < mentions.length - 1) {
        setSelected(selected + 1);
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
        ? mentionQuery + event.key
        : undefined;

      setMentionQuery(value);

      if (value) {
        setTimeout(() => {
          fetchUsers();
        });
      }
    } else if (event.key === '@') {
      setTimeout(() => {
        const position = getCaretPost(commentRef.current);
        setOffset(position);
        setMentionQuery('');
      });
    }
  };

  useEffect(() => {
    setSelected(0);
  }, [mentionQuery]);

  return {
    offset,
    selected,
    mentions,
    mentionQuery,
    onMentionClick: onMention,
    onMentionKeypress: onKeypress,
  };
}
