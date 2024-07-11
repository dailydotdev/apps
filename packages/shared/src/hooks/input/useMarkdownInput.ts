import {
  ClipboardEventHandler,
  DragEventHandler,
  FormEventHandler,
  HTMLAttributes,
  KeyboardEventHandler,
  MutableRefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useQuery } from '@tanstack/react-query';
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
import {
  allowedContentImage,
  allowedFileSize,
  uploadNotAcceptedMessage,
} from '../../graphql/posts';

export enum MarkdownCommand {
  Upload = 'upload',
  Link = 'link',
  Mention = 'mention',
}

export interface UseMarkdownInputProps
  extends Pick<HTMLAttributes<HTMLTextAreaElement>, 'onSubmit'> {
  textareaRef: MutableRefObject<HTMLTextAreaElement>;
  postId?: string;
  sourceId?: string;
  initialContent?: string;
  onValueUpdate?: (value: string) => void;
  enabledCommand?: Partial<Record<MarkdownCommand, boolean>>;
}

type InputCallbacks = Pick<
  HTMLAttributes<HTMLTextAreaElement>,
  'onSubmit' | 'onKeyDown' | 'onKeyUp' | 'onDrop' | 'onInput' | 'onPaste'
>;

export interface UseMarkdownInput {
  input: string;
  query?: string;
  offset?: number[];
  selected?: number;
  onLinkCommand?: () => Promise<unknown>;
  onMentionCommand?: () => Promise<void>;
  onUploadCommand?: (files: FileList) => void;
  onApplyMention?: (username: string) => Promise<void>;
  checkMention?: (position?: number[]) => void;
  onCloseMention?: () => void;
  mentions?: UserShortProfile[];
  callbacks: InputCallbacks;
  uploadingCount: number;
  uploadedCount: number;
}

export const defaultMarkdownCommands = {
  link: true,
  mention: true,
};

export const useMarkdownInput = ({
  textareaRef,
  postId,
  sourceId,
  onSubmit,
  onValueUpdate,
  initialContent = '',
  enabledCommand = {},
}: UseMarkdownInputProps): UseMarkdownInput => {
  const dirtyRef = useRef(false);
  const textarea = textareaRef?.current;
  const isLinkEnabled = enabledCommand[MarkdownCommand.Link];
  const isUploadEnabled = enabledCommand[MarkdownCommand.Upload];
  const isMentionEnabled = enabledCommand[MarkdownCommand.Mention];
  const [command, setCommand] = useState<TextareaCommand>();
  const [input, setInput] = useState(initialContent);
  const [query, setQuery] = useState<string>(undefined);
  const [offset, setOffset] = useState([0, 0]);
  const [selected, setSelected] = useState(0);
  const { requestMethod } = useRequestProtocol();
  const key = ['user', query, postId, sourceId];
  const { user } = useAuthContext();
  const { displayToast } = useToastNotification();

  useEffect(() => {
    if (dirtyRef.current) {
      return;
    }

    if (input?.length === 0 && initialContent?.length > 0) {
      setInput(initialContent);
    }
  }, [input, initialContent]);

  const onUpdate = (value: string) => {
    if (!dirtyRef.current) {
      dirtyRef.current = true;
    }

    setInput(value);
    if (onValueUpdate) {
      onValueUpdate(value);
    }
  };

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
        await command.replaceWord(replace, onUpdate, allowedType);
      },
      onFinish: async (status, file, url) => {
        if (status === UploadState.Failed) {
          return displayToast(uploadNotAcceptedMessage);
        }

        return onUpdate(command.onReplaceUpload(url, file.name));
      },
    });

  useEffect(() => {
    if (!textareaRef?.current) {
      return;
    }

    setCommand(new TextareaCommand(textareaRef));
  }, [setCommand, textareaRef]);

  const { data = { recommendedMentions: [] } } =
    useQuery<RecommendedMentionsData>(
      key,
      () =>
        requestMethod(
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
    if (!isMentionEnabled || value === query) {
      return;
    }

    if (isNullOrUndefined(query) && !isNullOrUndefined(value)) {
      setOffset(getCaretOffset(textarea));
    }

    setQuery(value);
  };

  const onApplyMention = async (username: string) => {
    const getReplacement = () => ({ replacement: `@${username} ` });
    await command.replaceWord(getReplacement, onUpdate, CursorType.Adjacent);
    updateQuery(undefined);
  };

  const onLinkCommand = () => command.replaceWord(getLinkReplacement, onUpdate);

  const onMentionCommand = async () => {
    const { replacement } = await command.replaceWord(
      getMentionReplacement,
      onUpdate,
    );
    const mention = replacement.trim().substring(1);
    updateQuery(mention);
  };

  const checkMention = (position?: number[]) => {
    const current = [textarea.selectionStart, textarea.selectionEnd];
    const selection = position ?? current;
    const [word] = getCloseWord(textarea, selection);
    const mention = word.substring(1);
    const isValid =
      word.charAt(0) === '@' &&
      (mention.length === 0 || handleRegex.test(mention));

    if (!isValid) {
      return updateQuery(undefined);
    }

    if (isNullOrUndefined(query)) {
      return updateQuery(mention ?? '');
    }

    return updateQuery(mention);
  };

  const onKeyUp: KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    const pressed = e.key as ArrowKey;

    if (!arrowKeys.includes(pressed)) {
      return;
    }

    if (Y_AXIS_KEYS.includes(pressed) && mentions?.length) {
      return;
    }

    const { selectionStart, selectionEnd } = e.currentTarget;
    checkMention([selectionStart, selectionEnd]);
  };

  const onKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = async (e) => {
    const isSpecialKey = e.ctrlKey || e.metaKey;
    const isSubmitting =
      isSpecialKey && e.key === KeyboardCommand.Enter && input?.length;

    if (onSubmit && isSubmitting) {
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
        if (selected > 0) {
          setSelected(selected - 1);
        }
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

    if (!target) {
      return;
    }

    onUpdate(target.value);
    checkMention();
  };

  const verifyFile = (file: File) => {
    const isValidType = allowedContentImage.includes(file.type);

    if (file.size > allowedFileSize || !isValidType) {
      displayToast(uploadNotAcceptedMessage);
      return;
    }

    pushUpload(file);
  };

  const onDrop: DragEventHandler<HTMLTextAreaElement> = async (e) => {
    e.preventDefault();
    const items = e.dataTransfer.files;

    if (!items.length || !isUploadEnabled) {
      return;
    }

    Array.from(items).forEach(verifyFile);

    startUploading();
  };

  const onUploadCommand = (files: FileList) => {
    Array.from(files).forEach(verifyFile);

    startUploading();
  };

  const onPaste: ClipboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (!e.clipboardData.files?.length || !isUploadEnabled) {
      return;
    }

    e.preventDefault();

    Array.from(e.clipboardData.files).forEach(verifyFile);

    startUploading();
  };

  const onCloseMention = useCallback(() => setQuery(undefined), []);
  const uploadCommands = isUploadEnabled ? { onDrop, onPaste } : {};
  const uploadProps = isUploadEnabled
    ? { uploadedCount, uploadingCount: queueCount, onUploadCommand }
    : { uploadedCount: 0, uploadingCount: 0 };

  const queryMentions = useMemo(() => data?.recommendedMentions ?? [], [data]);
  const mentionProps = isMentionEnabled
    ? {
        query,
        offset,
        selected,
        checkMention,
        onCloseMention,
        onMentionCommand,
        onApplyMention,
        mentions: queryMentions,
      }
    : {};

  return {
    ...uploadProps,
    ...mentionProps,
    input,
    onLinkCommand: isLinkEnabled ? onLinkCommand : null,
    callbacks: {
      onInput,
      onKeyUp,
      onKeyDown,
      ...uploadCommands,
    },
  };
};
