import type {
  ClipboardEventHandler,
  Dispatch,
  DragEventHandler,
  FormEventHandler,
  HTMLAttributes,
  KeyboardEventHandler,
  MutableRefObject,
  SetStateAction,
} from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { search as emojiSearch } from 'node-emoji';
import type { GetReplacementFn } from '../../lib/textarea';
import {
  CursorType,
  getCloseWord,
  getCursorType,
  getTemporaryUploadString,
  TextareaCommand,
} from '../../lib/textarea';
import { useRequestProtocol } from '../useRequestProtocol';
import { useAuthContext } from '../../contexts/AuthContext';
import type { RecommendedMentionsData } from '../../graphql/comments';
import { RECOMMEND_MENTIONS_QUERY } from '../../graphql/comments';
import { isNullOrUndefined } from '../../lib/func';
import {
  ArrowKey,
  arrowKeys,
  getCaretOffset,
  KeyboardCommand,
  Y_AXIS_KEYS,
} from '../../lib/element';
import type { UserShortProfile } from '../../lib/user';
import {
  getLinkReplacement,
  getMentionReplacement,
  getStyleReplacement,
  isSelectionInMarkdownLink,
} from '../../lib/markdown';
import { handleRegex } from '../../graphql/users';
import { UploadState, useSyncUploader } from './useSyncUploader';
import { useToastNotification } from '../useToastNotification';
import {
  allowedContentImage,
  allowedFileSize,
  uploadNotAcceptedMessage,
} from '../../graphql/posts';
import { isValidHttpUrl } from '../../lib';

export enum MarkdownCommand {
  Upload = 'upload',
  Link = 'link',
  Mention = 'mention',
  Emoji = 'emoji',
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
  emojiQuery?: string;
  offset?: number[];
  selected?: number;
  emojiData?: Array<{ emoji: string; name: string }>;
  selectedEmoji?: number;
  onLinkCommand?: () => Promise<unknown>;
  onMentionCommand?: () => Promise<void>;
  onUploadCommand?: (files: FileList) => void;
  onApplyMention?: (user: UserShortProfile) => Promise<void>;
  onApplyEmoji?: (emoji: string) => Promise<void>;
  checkMention?: (position?: number[]) => void;
  checkEmoji?: (position?: number[]) => void;
  onCloseMention?: () => void;
  onCloseEmoji?: () => void;
  mentions?: UserShortProfile[];
  callbacks: InputCallbacks;
  uploadingCount: number;
  uploadedCount: number;
  setInput: Dispatch<SetStateAction<string>>;
}

export const defaultMarkdownCommands = {
  link: true,
  mention: true,
  emoji: true,
};

const specialCharsRegex = new RegExp(/[^A-Za-z0-9_.]/);

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
  const isEmojiEnabled = enabledCommand[MarkdownCommand.Emoji];
  const [command, setCommand] = useState<TextareaCommand>();
  const [input, setInput] = useState(initialContent);
  const [query, setQuery] = useState<string>(undefined);
  const [emojiQuery, setEmojiQuery] = useState<string>(undefined);
  const [offset, setOffset] = useState([0, 0]);
  const [selected, setSelected] = useState(0);
  const [selectedEmoji, setSelectedEmoji] = useState(0);
  const { requestMethod } = useRequestProtocol();
  const key = ['user', query, postId, sourceId];
  const { user } = useAuthContext();
  const { displayToast } = useToastNotification();

  const emojiData = useMemo(
    () =>
      emojiQuery ? emojiSearch(emojiQuery.toLowerCase()).slice(0, 20) : [],
    [emojiQuery],
  );

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
    useQuery<RecommendedMentionsData>({
      queryKey: key,
      queryFn: () =>
        requestMethod(
          RECOMMEND_MENTIONS_QUERY,
          { postId, query, sourceId },
          { requestKey: JSON.stringify(key) },
        ),

      enabled: !!user && typeof query !== 'undefined',
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    });
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

  const updateEmojiQuery = (value: string) => {
    if (
      !isEmojiEnabled ||
      value === emojiQuery ||
      specialCharsRegex.test(value)
    ) {
      return;
    }

    if (isNullOrUndefined(emojiQuery) && !isNullOrUndefined(value)) {
      setOffset(getCaretOffset(textarea));
      setSelectedEmoji(0);
    }

    setEmojiQuery(value);
  };

  const onApplyMention = async (mention: UserShortProfile) => {
    const getReplacement = () => ({ replacement: `@${mention.username} ` });
    await command.replaceWord(getReplacement, onUpdate, CursorType.Adjacent);
    updateQuery(undefined);
  };

  const onApplyEmoji = async (emoji: string) => {
    const getReplacement = () => ({ replacement: `${emoji} ` });
    await command.replaceWord(getReplacement, onUpdate, CursorType.Adjacent);
    updateEmojiQuery(undefined);
  };

  const onLinkCommand = () => command.replaceWord(getLinkReplacement, onUpdate);
  const onLinkPaste = (pastedLink: string) => {
    const onLinkPasteCommand: GetReplacementFn = (type, props) =>
      getLinkReplacement(type, { ...props, url: pastedLink });

    return command.replaceWord(onLinkPasteCommand, onUpdate);
  };

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

  const checkEmoji = (position?: number[]) => {
    const current = [textarea.selectionStart, textarea.selectionEnd];
    const selection = position ?? current;
    const [word] = getCloseWord(textarea, selection);
    const colon = word.substring(1);
    const isValid = word.charAt(0) === ':';

    if (!isValid) {
      return updateEmojiQuery(undefined);
    }

    if (isNullOrUndefined(emojiQuery)) {
      return updateEmojiQuery(colon ?? '');
    }

    return updateEmojiQuery(colon);
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
    checkEmoji([selectionStart, selectionEnd]);
  };

  const onKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = async (e) => {
    const isSpecialKey = e.ctrlKey || e.metaKey;

    if (isSpecialKey) {
      switch (e.key) {
        case 'b': {
          e.preventDefault();
          return await command.replaceWord(getStyleReplacement('**'), onUpdate);
        }
        case 'i': {
          e.preventDefault();
          return await command.replaceWord(getStyleReplacement('_'), onUpdate);
        }
        case 'k': {
          e.preventDefault();
          e.stopPropagation();
          return await onLinkCommand?.();
        }
        default:
          break;
      }
    }

    const isSubmitting =
      isSpecialKey && e.key === KeyboardCommand.Enter && input?.length;

    if (onSubmit && isSubmitting) {
      return onSubmit(e);
    }

    const isNavigatingPopup =
      e.key === KeyboardCommand.Enter ||
      Y_AXIS_KEYS.includes(e.key as ArrowKey);

    const hasMentions = mentions?.length > 0;
    const hasEmojis = !!emojiQuery;

    if (!isNavigatingPopup || (!hasMentions && !hasEmojis)) {
      return e.stopPropagation(); // to stop app navigation
    }

    e.preventDefault();

    const arrowKey = e.key as ArrowKey;

    if (Y_AXIS_KEYS.includes(e.key as ArrowKey)) {
      if (arrowKey === ArrowKey.Up) {
        if (hasMentions) {
          setSelected((selected - 1 + mentions.length) % mentions.length);
        } else if (hasEmojis) {
          setSelectedEmoji(
            (selectedEmoji - 1 + emojiData.length) % emojiData.length,
          );
        }
      } else if (hasMentions) {
        setSelected((selected + 1) % mentions.length);
      } else if (hasEmojis) {
        setSelectedEmoji((selectedEmoji + 1) % emojiData.length);
      }
    }

    if (e.key === KeyboardCommand.Enter) {
      if (hasMentions) {
        const mention = mentions[selected];
        if (mention) {
          await onApplyMention(mention);
        }
      } else if (hasEmojis) {
        const emoji = emojiData[selectedEmoji];
        if (emoji) {
          await onApplyEmoji(emoji.emoji);
        }
      }
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
    checkEmoji();
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

  const onPaste: ClipboardEventHandler<HTMLTextAreaElement> = async (e) => {
    const pastedText = e.clipboardData.getData('text');
    if (isValidHttpUrl(pastedText)) {
      const cursor = getCursorType(textarea);

      if (cursor === CursorType.Highlighted) {
        const isInMarkdownLink = isSelectionInMarkdownLink(
          textarea,
          textarea.selectionStart,
          textarea.selectionEnd,
        );

        if (!isInMarkdownLink) {
          e.preventDefault();
          await onLinkPaste(pastedText);
          return;
        }
      }
    }

    if (e.clipboardData.files?.length && isUploadEnabled) {
      e.preventDefault();

      Array.from(e.clipboardData.files).forEach(verifyFile);

      startUploading();
    }
  };

  const onCloseMention = useCallback(() => setQuery(undefined), []);
  const onCloseEmoji = useCallback(() => setEmojiQuery(undefined), []);
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
  const emojiProps = isEmojiEnabled
    ? {
        emojiQuery,
        emojiData,
        offset,
        selectedEmoji,
        checkEmoji,
        onApplyEmoji,
        onCloseEmoji,
      }
    : {};

  return {
    ...uploadProps,
    ...mentionProps,
    ...emojiProps,
    input,
    onLinkCommand: isLinkEnabled ? onLinkCommand : null,
    callbacks: {
      onInput,
      onKeyUp,
      onKeyDown,
      onPaste,
      ...uploadCommands,
    },
    setInput,
  };
};

export default useMarkdownInput;
