import {
  ClipboardEventHandler,
  DragEventHandler,
  FormEventHandler,
  HTMLAttributes,
  KeyboardEventHandler,
  MutableRefObject,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useQuery } from 'react-query';
import {
  CursorType,
  getCloseWord,
  getCursorType,
  GetReplacementFn,
  getTemporaryUploadString,
  TextareaCommand,
} from '../../lib/textarea';
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
import { handleRegex } from '../../graphql/users';
import { UploadState, useSyncUploader } from './useSyncUploader';
import { useToastNotification } from '../useToastNotification';
import { allowedContentImage, allowedFileSize } from '../../graphql/posts';

export interface UseMarkdownInputProps
  extends Pick<HTMLAttributes<HTMLTextAreaElement>, 'onSubmit'> {
  textareaRef: MutableRefObject<HTMLTextAreaElement>;
  postId?: string;
  sourceId?: string;
  enableUpload?: boolean;
  initialContent?: string;
}

type InputCallbacks = Pick<
  HTMLAttributes<HTMLTextAreaElement>,
  'onSubmit' | 'onKeyDown' | 'onKeyUp' | 'onDrop' | 'onInput' | 'onPaste'
>;

interface UseMarkdownInput {
  input: string;
  query: string;
  offset: number[];
  selected: number;
  onLinkCommand: () => Promise<unknown>;
  onMentionCommand: () => Promise<void>;
  onUploadCommand: (files: FileList) => void;
  onApplyMention: (username: string) => Promise<void>;
  checkMention: (position?: number[]) => void;
  mentions: UserShortProfile[];
  callbacks: InputCallbacks;
  uploadingCount: number;
  uploadedCount: number;
}

export const useMarkdownInput = ({
  textareaRef,
  postId,
  sourceId,
  onSubmit,
  enableUpload,
  initialContent = '',
}: UseMarkdownInputProps): UseMarkdownInput => {
  const textarea = textareaRef?.current;
  const [command, setCommand] = useState<TextareaCommand>();
  const [input, setInput] = useState(initialContent);
  const [query, setQuery] = useState<string>(undefined);
  const [offset, setOffset] = useState([0, 0]);
  const [selected, setSelected] = useState(0);
  const { requestMethod } = useRequestProtocol();
  const key = ['user', query, postId, sourceId];
  const { user } = useAuthContext();
  const { displayToast } = useToastNotification();
  const { uploadedCount, queueCount, pushUpload, startUploading } =
    useSyncUploader({
      onStarted: async (file) => {
        const temporary = getTemporaryUploadString(file.name);
        const replace: GetReplacementFn = (_, { trailingChar }) => ({
          replacement: `${!trailingChar ? '' : '\n\n'}${temporary}\n\n`,
        });
        const type = getCursorType(textarea);
        const allowedType =
          type === CursorType.Adjacent ? CursorType.Isolated : type;
        await command.replaceWord(replace, setInput, allowedType);
      },
      onFinish: async (status, file, url) => {
        if (status === UploadState.Failed) {
          return displayToast(
            'File type is not allowed or the size exceeded the limit',
          );
        }

        return setInput(command.onReplaceUpload(url, file.name));
      },
    });

  useEffect(() => {
    if (!textareaRef?.current) return;

    setCommand(new TextareaCommand(textareaRef));
  }, [setCommand, textareaRef]);

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
    const getReplacement = () => ({ replacement: `@${username} ` });
    await command.replaceWord(getReplacement, setInput, CursorType.Adjacent);
    updateQuery(undefined);
  };

  const onLinkCommand = async () => {
    await command.replaceWord(getLinkReplacement, setInput);
  };

  const onMentionCommand = async () => {
    const replaced = await command.replaceWord(getMentionReplacement, setInput);
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

  const verifyFile = (file: File) => {
    const isValidType = allowedContentImage.includes(file.type);

    if (file.size > allowedFileSize || !isValidType) return;

    pushUpload(file);
  };

  const onDrop: DragEventHandler<HTMLTextAreaElement> = async (e) => {
    e.preventDefault();
    const items = e.dataTransfer.files;

    if (!items.length || !enableUpload) return;

    Array.from(items).forEach(verifyFile);

    startUploading();
  };

  const onUploadCommand = (files: FileList) => {
    Array.from(files).forEach(verifyFile);

    startUploading();
  };

  const onPaste: ClipboardEventHandler<HTMLTextAreaElement> = (e) => {
    e.preventDefault();

    Array.from(e.clipboardData.files).forEach(verifyFile);

    startUploading();
  };

  return {
    input,
    query,
    offset,
    selected,
    uploadedCount,
    uploadingCount: queueCount,
    checkMention,
    onLinkCommand,
    onUploadCommand,
    onMentionCommand,
    onApplyMention,
    callbacks: {
      onInput,
      onKeyUp,
      onKeyDown,
      onPaste,
      onDrop: enableUpload && onDrop,
    },
    mentions: useMemo(() => data?.recommendedMentions ?? [], [data]),
  };
};
