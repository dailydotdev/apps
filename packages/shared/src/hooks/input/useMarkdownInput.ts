import {
  FormEventHandler,
  HTMLAttributes,
  KeyboardEventHandler,
  MutableRefObject,
  useState,
} from 'react';
import { useQuery } from 'react-query';
import { CursorType, getCloseWord, replaceWord } from '../../lib/textarea';
import { useRequestProtocol } from '../useRequestProtocol';
import { useAuthContext } from '../../contexts/AuthContext';
import {
  RECOMMEND_MENTIONS_QUERY,
  RecommendedMentionsData,
} from '../../graphql/comments';
import { graphqlUrl } from '../../lib/config';
import { isNullOrUndefined } from '../../lib/func';
import {
  ArrowKey,
  arrowKeys,
  getCaretOffset,
  KeyboardCommand,
  Y_AXIS_KEYS,
} from '../../lib/element';
import { UserShortProfile } from '../../lib/user';
import { getLinkReplacement, getMentionReplacement } from '../../lib/markdown';

export interface UseMarkdownInputProps
  extends Pick<HTMLAttributes<HTMLTextAreaElement>, 'onSubmit'> {
  textareaRef: MutableRefObject<HTMLTextAreaElement>;
  postId?: string;
  sourceId?: string;
  initialContent?: string;
}

interface UseMarkdownInput
  extends Pick<
    HTMLAttributes<HTMLTextAreaElement>,
    'onSubmit' | 'onKeyDown' | 'onKeyUp'
  > {
  input: string;
  query: string;
  onInput: FormEventHandler<HTMLTextAreaElement>;
  offset: number[];
  selected: number;
  onLinkCommand: () => Promise<void>;
  onMentionCommand: () => Promise<void>;
  onApplyMention: (username: string) => Promise<void>;
  checkMention: (position?: number[]) => void;
  mentions: UserShortProfile[];
}

export const useMarkdownInput = ({
  textareaRef,
  postId,
  sourceId,
  onSubmit,
}: UseMarkdownInputProps): UseMarkdownInput => {
  const textarea = textareaRef?.current;
  const [input, setInput] = useState('');
  const [query, setQuery] = useState<string>(undefined);
  const [offset, setOffset] = useState([0, 0]);
  const [selected, setSelected] = useState(0);
  const { requestMethod } = useRequestProtocol();
  const key = ['user', query, postId, sourceId];
  const { user } = useAuthContext();

  const { data = { recommendedMentions: [] } } =
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
  const mentions = data?.recommendedMentions;

  const updateQuery = (value: string) => {
    if (value === query) return;

    if (isNullOrUndefined(query) && !isNullOrUndefined(value)) {
      setOffset(getCaretOffset(textarea));
    }

    setQuery(value);
  };

  const onApplyMention = async (username: string) => {
    const getUsernameReplacement = () => ({
      type: CursorType.Adjacent,
      replacement: `@${username} `,
    });
    await replaceWord(textarea, getUsernameReplacement, setInput);
    updateQuery(undefined);
  };

  const onLinkCommand = async () => {
    await replaceWord(textarea, getLinkReplacement, setInput);
  };

  const onMentionCommand = async () => {
    const replaced = await replaceWord(
      textarea,
      getMentionReplacement,
      setInput,
    );

    const mention = replaced.trim().substring(1);
    setQuery(mention);
  };

  const checkMention = (position?: number[]) => {
    const current = [textarea.selectionStart, textarea.selectionEnd];
    const selection = position ?? current;
    const [word] = getCloseWord(textarea, selection);

    if (isNullOrUndefined(query)) {
      if (word.charAt(0) === '@') updateQuery(word.substring(1) ?? '');
      return;
    }

    const handleRegex = new RegExp(/^@?([\w-]){1,39}$/i);
    const mention = word.substring(1);
    const isValid = word.charAt(0) === '@' && handleRegex.test(mention);
    updateQuery(isValid ? mention : undefined);
  };

  const onKeyUp: KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (!arrowKeys.includes(e.key as ArrowKey)) return;

    const selection = [textarea.selectionStart, textarea.selectionEnd];
    const [start, end] = selection;
    const { selectionStart, selectionEnd } = e.currentTarget;

    if (selectionStart === start && selectionEnd === end) return;

    const position = [selectionStart, selectionEnd];
    checkMention(position);
  };

  const onKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = async (e) => {
    const isSpecialKey = e.ctrlKey || e.metaKey;
    if (isSpecialKey && e.key === KeyboardCommand.Enter && input?.length) {
      return onSubmit(e);
    }

    const isNavigatingPopup =
      e.key === KeyboardCommand.Enter ||
      Y_AXIS_KEYS.includes(e.key as ArrowKey);

    if (!isNavigatingPopup || !mentions?.length) {
      return e.stopPropagation(); // to stop app navigation
    }

    e.preventDefault();

    const arrowKey = e.key as ArrowKey;

    if (Y_AXIS_KEYS.includes(e.key as ArrowKey)) {
      if (arrowKey === ArrowKey.Up) {
        if (selected > 0) setSelected(selected - 1);
      } else if (selected < mentions.length - 1) {
        setSelected(selected + 1);
      }
    }

    const mention = mentions[selected];
    if (mention && e.key === KeyboardCommand.Enter) {
      await onApplyMention(mention.username);
    }

    return null;
  };

  const onInput: FormEventHandler<HTMLTextAreaElement> = (e) => {
    const target = e.currentTarget;

    if (!target) return;

    setInput(target.value);
    checkMention();
  };

  return {
    onInput,
    input,
    query,
    offset,
    selected,
    checkMention,
    onKeyUp,
    onKeyDown,
    onLinkCommand,
    onMentionCommand,
    onApplyMention,
    mentions: mentions ?? [],
  };
};
