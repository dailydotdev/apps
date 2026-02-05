import type {
  FormEventHandler,
  MutableRefObject,
  ReactElement,
  ReactNode,
  TextareaHTMLAttributes,
} from 'react';
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames';
import dynamic from 'next/dynamic';
import { useQuery } from '@tanstack/react-query';
import type { Editor } from '@tiptap/react';
import { useEditor, EditorContent } from '@tiptap/react';
import { Extension } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import Image from '@tiptap/extension-image';
import { search as emojiSearch } from 'node-emoji';
import { ImageIcon, AtIcon } from '../icons';
import { GifIcon } from '../icons/Gif';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '../buttons/Button';
import { RecommendedMentionTooltip } from '../tooltips/RecommendedMentionTooltip';
import type { UserShortProfile } from '../../lib/user';
import { SavingLabel } from './MarkdownInput/SavingLabel';
import { useAuthContext } from '../../contexts/AuthContext';
import { Loader } from '../Loader';
import { Divider } from '../utilities';
import { usePopupSelector } from '../../hooks/usePopupSelector';
import ConditionalWrapper from '../ConditionalWrapper';
import { ProfileImageSize, ProfilePicture } from '../ProfilePicture';
import CloseButton from '../CloseButton';
import GifPopover from '../popover/GifPopover';
import { useRequestProtocol } from '../../hooks/useRequestProtocol';
import type { RecommendedMentionsData } from '../../graphql/comments';
import { RECOMMEND_MENTIONS_QUERY } from '../../graphql/comments';
import { handleRegex } from '../../graphql/users';
import { isValidHttpUrl } from '../../lib';
import {
  UploadState,
  useSyncUploader,
} from '../../hooks/input/useSyncUploader';
import {
  allowedContentImage,
  allowedFileSize,
  uploadNotAcceptedMessage,
} from '../../graphql/posts';
import { useToastNotification } from '../../hooks/useToastNotification';
import { generateStorageKey, StorageTopic } from '../../lib/storage';
import { storageWrapper } from '../../lib/storageWrapper';
import {
  htmlToMarkdownBasic,
  markdownToHtmlBasic,
} from '../../lib/markdownConversion';
import { MarkdownCommand } from '../../hooks/input/useMarkdownInput';
import type { RichTextToolbarRef } from './RichTextEditor/RichTextToolbar';
import { RichTextToolbar } from './RichTextEditor/RichTextToolbar';
import { MarkdownInputRules } from './RichTextEditor/markdownInputRules';
import styles from './RichTextEditor/richtext.module.css';

const RecommendedEmojiTooltip = dynamic(
  () =>
    import(
      /* webpackChunkName: "lazyRecommendedEmojiTooltip" */ '../tooltips/RecommendedEmojiTooltip'
    ),
  { ssr: false },
);

interface ClassName {
  container?: string;
  input?: string;
  profile?: string;
}

interface RichTextInputProps {
  className?: ClassName;
  footer?: ReactNode;
  textareaProps?: Omit<
    TextareaHTMLAttributes<HTMLTextAreaElement>,
    'className'
  >;
  submitCopy?: string;
  showUserAvatar?: boolean;
  isUpdatingDraft?: boolean;
  timeline?: ReactNode;
  isLoading?: boolean;
  disabledSubmit?: boolean;
  maxInputLength?: number;
  onClose?: () => void;
  postId?: string;
  sourceId?: string;
  onSubmit?: FormEventHandler<HTMLTextAreaElement>;
  onValueUpdate?: (value: string) => void;
  initialContent?: string;
  enabledCommand?: Partial<Record<MarkdownCommand, boolean>>;
  editCommentId?: string;
  parentCommentId?: string;
}

type EditorRange = { from: number; to: number } | null;

export interface RichTextInputRef {
  onMentionCommand?: () => void;
  clearDraft: () => void;
  setInput: (value: string) => void;
  focus: () => void;
}

const specialCharsRegex = new RegExp(/[^A-Za-z0-9_.]/);

function RichTextInput(
  {
    className = {},
    footer,
    textareaProps = {},
    submitCopy,
    showUserAvatar,
    isUpdatingDraft,
    timeline,
    isLoading,
    disabledSubmit,
    maxInputLength,
    onClose,
    postId,
    sourceId,
    onSubmit,
    onValueUpdate,
    initialContent = '',
    enabledCommand = {},
    editCommentId,
    parentCommentId,
  }: RichTextInputProps,
  ref: MutableRefObject<RichTextInputRef>,
): ReactElement {
  const shouldShowSubmit = !!submitCopy;
  const { user } = useAuthContext();
  const { parentSelector } = usePopupSelector();
  const { displayToast } = useToastNotification();
  const { requestMethod } = useRequestProtocol();
  const toolbarRef = useRef<RichTextToolbarRef>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<Editor | null>(null);
  const uploadRef = useRef<HTMLInputElement>(null);
  const dirtyRef = useRef(false);
  const isSyncingRef = useRef(false);
  const inputRef = useRef('');
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const mentionRangeRef = useRef<EditorRange>(null);
  const emojiRangeRef = useRef<EditorRange>(null);
  const mentionsRef = useRef<UserShortProfile[]>([]);
  const emojiDataRef = useRef<Array<{ emoji: string; name: string }>>([]);
  const emojiQueryRef = useRef<string>(undefined);
  const queryRef = useRef<string>(undefined);
  const selectedRef = useRef(0);
  const selectedEmojiRef = useRef(0);
  const isUploadEnabled = enabledCommand[MarkdownCommand.Upload];
  const isMentionEnabled = enabledCommand[MarkdownCommand.Mention];
  const isEmojiEnabled = enabledCommand[MarkdownCommand.Emoji];
  const isGifEnabled = enabledCommand[MarkdownCommand.Gif];

  const headerActionSize = ButtonSize.XSmall;

  const draftStorageKey = useMemo(() => {
    if (!postId) {
      return null;
    }
    const identifier = editCommentId || parentCommentId || postId;
    return generateStorageKey(StorageTopic.Comment, 'draft', identifier);
  }, [postId, editCommentId, parentCommentId]);

  const getInitialValue = useCallback(() => {
    if (initialContent) {
      return initialContent;
    }
    if (!draftStorageKey) {
      return '';
    }

    return storageWrapper.getItem(draftStorageKey) || '';
  }, [initialContent, draftStorageKey]);

  const [input, setInput] = useState(getInitialValue);
  const [query, setQuery] = useState<string>(undefined);
  const [emojiQuery, setEmojiQuery] = useState<string>(undefined);
  const [offset, setOffset] = useState([0, 0]);
  const [selected, setSelected] = useState(0);
  const [selectedEmoji, setSelectedEmoji] = useState(0);

  inputRef.current = input;

  const maxLength = maxInputLength ?? textareaProps.maxLength;

  const LinkShortcut = useMemo(
    () =>
      Extension.create({
        name: 'linkShortcut',
        addKeyboardShortcuts() {
          return {
            'Mod-k': () => {
              toolbarRef.current?.openLinkModal();
              return true;
            },
          };
        },
      }),
    [],
  );

  const updateInput = useCallback(
    (
      value: string,
      options: { notify?: boolean; markDirty?: boolean } = {},
    ) => {
      const { notify = true, markDirty = true } = options;
      if (markDirty && !dirtyRef.current) {
        dirtyRef.current = true;
      }

      setInput(value);
      inputRef.current = value;

      if (notify) {
        onValueUpdate?.(value);
      }
    },
    [onValueUpdate],
  );

  const emojiData = useMemo(
    () =>
      emojiQuery ? emojiSearch(emojiQuery.toLowerCase()).slice(0, 20) : [],
    [emojiQuery],
  );

  const key = ['user', query, postId, sourceId];
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

  useEffect(() => {
    queryRef.current = query;
  }, [query]);

  useEffect(() => {
    mentionsRef.current = mentions || [];
  }, [mentions]);

  useEffect(() => {
    emojiDataRef.current = emojiData;
  }, [emojiData]);

  useEffect(() => {
    emojiQueryRef.current = emojiQuery;
  }, [emojiQuery]);

  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  useEffect(() => {
    selectedEmojiRef.current = selectedEmoji;
  }, [selectedEmoji]);

  const updateOffset = useCallback(
    (currentEditor: Editor | null) => {
      if (!currentEditor?.view?.dom) {
        return;
      }

      const coords = currentEditor.view.coordsAtPos(
        currentEditor.state.selection.from,
      );
      const rect =
        editorContainerRef.current?.getBoundingClientRect() ||
        currentEditor.view.dom.getBoundingClientRect();
      setOffset([coords.left - rect.left, coords.top - rect.top]);
    },
    [],
  );

  const updateSuggestionsFromEditor = useCallback(
    (currentEditor: Editor | null) => {
      if (!currentEditor) {
        return;
      }

      if (!currentEditor.state.selection.empty) {
        setQuery(undefined);
        setEmojiQuery(undefined);
        mentionRangeRef.current = null;
        emojiRangeRef.current = null;
        return;
      }

      const { $from } = currentEditor.state.selection;
      const parentText = $from.parent.textBetween(
        0,
        $from.parent.content.size,
        '\n',
        '\n',
      );
      const cursorOffset = $from.parentOffset;
      const textBefore = parentText.slice(0, cursorOffset);
      const wordMatch = /(?:^|\s)(\S+)$/.exec(textBefore);
      const word = wordMatch?.[1] || '';

      if (isMentionEnabled && word.startsWith('@')) {
        const mention = word.slice(1);
        const isValid = mention.length === 0 || handleRegex.test(mention);
        const looksLikeUrl =
          isValidHttpUrl(word) ||
          word.startsWith('www.') ||
          /^[a-zA-Z0-9-]+\.[a-zA-Z0-9-]+/i.test(word);

        if (isValid && !looksLikeUrl && !currentEditor.isActive('link')) {
          if (typeof queryRef.current === 'undefined') {
            updateOffset(currentEditor);
            setSelected(0);
          }

          const from = currentEditor.state.selection.from - word.length;
          mentionRangeRef.current = {
            from,
            to: currentEditor.state.selection.from,
          };
          queryRef.current = mention;
          setQuery(mention);
        } else if (typeof queryRef.current !== 'undefined') {
          queryRef.current = undefined;
          setQuery(undefined);
          mentionRangeRef.current = null;
        }
      } else if (typeof queryRef.current !== 'undefined') {
        queryRef.current = undefined;
        setQuery(undefined);
        mentionRangeRef.current = null;
      }

      if (isEmojiEnabled && word.startsWith(':')) {
        const emojiValue = word.slice(1);
        if (!specialCharsRegex.test(emojiValue)) {
          if (typeof emojiQueryRef.current === 'undefined') {
            updateOffset(currentEditor);
            setSelectedEmoji(0);
          }

          const from = currentEditor.state.selection.from - word.length;
          emojiRangeRef.current = {
            from,
            to: currentEditor.state.selection.from,
          };
          emojiQueryRef.current = emojiValue;
          setEmojiQuery(emojiValue);
          return;
        }
      }

      if (typeof emojiQueryRef.current !== 'undefined') {
        emojiQueryRef.current = undefined;
        setEmojiQuery(undefined);
        emojiRangeRef.current = null;
      }
    },
    [isEmojiEnabled, isMentionEnabled, updateOffset],
  );

  const onApplyMention = useCallback((mention: UserShortProfile) => {
    const currentEditor = editorRef.current;
    if (!currentEditor || !mentionRangeRef.current) {
      return;
    }

    currentEditor
      .chain()
      .focus()
      .insertContentAt(mentionRangeRef.current, `@${mention.username} `)
      .run();

    queryRef.current = undefined;
    setQuery(undefined);
    mentionRangeRef.current = null;
  }, []);

  const onApplyEmoji = useCallback((emoji: string) => {
    const currentEditor = editorRef.current;
    if (!currentEditor || !emojiRangeRef.current) {
      return;
    }

    currentEditor
      .chain()
      .focus()
      .insertContentAt(emojiRangeRef.current, `${emoji} `)
      .run();

    emojiQueryRef.current = undefined;
    setEmojiQuery(undefined);
    emojiRangeRef.current = null;
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        blockquote: false,
        horizontalRule: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener nofollow',
        },
      }),
      Placeholder.configure({
        placeholder: textareaProps.placeholder || 'Share your thoughts',
      }),
      Image,
      MarkdownInputRules,
      ...(maxLength ? [CharacterCount.configure({ limit: maxLength })] : []),
      LinkShortcut,
    ],
    content: markdownToHtmlBasic(input),
    onUpdate: ({ editor: updatedEditor }) => {
      if (isSyncingRef.current) {
        isSyncingRef.current = false;
        return;
      }

      const markdown = htmlToMarkdownBasic(updatedEditor.getHTML());
      updateInput(markdown);
      updateSuggestionsFromEditor(updatedEditor);
    },
    onSelectionUpdate: ({ editor: updatedEditor }) => {
      updateSuggestionsFromEditor(updatedEditor);
    },
    editorProps: {
      handleKeyDown: (_view, event) => {
        const isSpecialKey = event.ctrlKey || event.metaKey;
        const hasMentions =
          typeof queryRef.current !== 'undefined' &&
          (mentionsRef.current?.length ?? 0) > 0;
        const hasEmojis =
          typeof emojiQueryRef.current !== 'undefined' &&
          (emojiDataRef.current?.length ?? 0) > 0;

        if (isSpecialKey && event.key === 'Enter' && inputRef.current?.length) {
          event.preventDefault();
          onSubmit?.({
            currentTarget: { value: inputRef.current },
          } as React.FormEvent<HTMLTextAreaElement>);
          return true;
        }

        if (!hasMentions && !hasEmojis) {
          return false;
        }

        const isArrowUp = event.key === 'ArrowUp';
        const isArrowDown = event.key === 'ArrowDown';
        const isEnter = event.key === 'Enter';

        if (!isArrowUp && !isArrowDown && !isEnter) {
          return false;
        }

        event.preventDefault();

        if (isArrowUp || isArrowDown) {
          if (hasMentions) {
            setSelected((prev) => {
              const total = mentionsRef.current?.length ?? 1;
              if (isArrowUp) {
                return (prev - 1 + total) % total;
              }
              return (prev + 1) % total;
            });
          } else if (hasEmojis) {
            setSelectedEmoji((prev) => {
              const total = emojiDataRef.current?.length || 1;
              if (isArrowUp) {
                return (prev - 1 + total) % total;
              }
              return (prev + 1) % total;
            });
          }

          return true;
        }

        if (isEnter) {
          if (hasMentions) {
            const mention = mentionsRef.current?.[selectedRef.current];
            if (mention) {
              onApplyMention(mention);
            }
          } else if (hasEmojis) {
            const emoji = emojiDataRef.current?.[selectedEmojiRef.current];
            if (emoji) {
              onApplyEmoji(emoji.emoji);
            }
          }
        }

        return true;
      },
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  useImperativeHandle(ref, () => ({
    onMentionCommand: () => {
      if (!editor) {
        return;
      }
      editor.chain().focus().insertContent('@').run();
      updateSuggestionsFromEditor(editor);
    },
    clearDraft: () => {
      if (draftStorageKey) {
        storageWrapper.removeItem(draftStorageKey);
      }
    },
    setInput: (value: string) => {
      updateInput(value, { notify: true, markDirty: true });
      if (!editor) {
        return;
      }
      isSyncingRef.current = true;
      editor.commands.setContent(markdownToHtmlBasic(value));
    },
    focus: () => {
      editor?.commands.focus();
    },
  }));

  useEffect(() => {
    const content = inputRef.current;
    if (!content || !editor) {
      return;
    }

    editor.commands.focus('end');
  }, [editor]);

  useEffect(() => {
    if (dirtyRef.current) {
      return;
    }

    if (input?.length === 0 && initialContent?.length > 0) {
      updateInput(initialContent, { notify: false, markDirty: false });

      if (editor) {
        isSyncingRef.current = true;
        editor.commands.setContent(markdownToHtmlBasic(initialContent));
      }
    }
  }, [editor, initialContent, input, updateInput]);

  useEffect(() => {
    if (!draftStorageKey || !dirtyRef.current) {
      return undefined;
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      if (input && input.trim().length > 0) {
        storageWrapper.setItem(draftStorageKey, input);
      } else {
        storageWrapper.removeItem(draftStorageKey);
      }
    }, 500);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [input, draftStorageKey]);

  const insertImage = useCallback((url: string, altText: string) => {
    const currentEditor = editorRef.current;
    if (!currentEditor) {
      return;
    }

    currentEditor.chain().focus().setImage({ src: url, alt: altText }).run();
  }, []);

  const { uploadedCount, queueCount, pushUpload, startUploading } =
    useSyncUploader({
      onStarted: () => {},
      onFinish: (status, file, url) => {
        if (status === UploadState.Failed || !url) {
          displayToast(uploadNotAcceptedMessage);
          return;
        }

        insertImage(url, file.name);
      },
    });

  const verifyFile = useCallback(
    (file: File) => {
      const isValidType = allowedContentImage.includes(file.type);

      if (file.size > allowedFileSize || !isValidType) {
        displayToast(uploadNotAcceptedMessage);
        return;
      }

      pushUpload(file);
    },
    [displayToast, pushUpload],
  );

  const onUpload: FormEventHandler<HTMLInputElement> = (event) => {
    if (!isUploadEnabled) {
      return;
    }

    const files = (event.currentTarget as HTMLInputElement).files;
    if (!files?.length) {
      return;
    }

    Array.from(files).forEach(verifyFile);
    startUploading();
  };

  const onGifCommand = async (gifUrl: string, altText: string) => {
    insertImage(gifUrl, altText);
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    if (!isUploadEnabled) {
      return;
    }

    event.preventDefault();
    const files = event.dataTransfer.files;
    if (!files?.length) {
      return;
    }

    Array.from(files).forEach(verifyFile);
    startUploading();
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
    if (!isUploadEnabled) {
      return;
    }

    const files = event.clipboardData.files;
    if (!files?.length) {
      return;
    }

    event.preventDefault();
    Array.from(files).forEach(verifyFile);
    startUploading();
  };

  const actionIcon =
    queueCount === 0 ? (
      <ImageIcon />
    ) : (
      <Loader
        className="btn-loader"
        innerClassName="before:border-t-accent-cabbage-default after:border-accent-cabbage-default"
      />
    );

  const remainingCharacters =
    maxLength && editor?.storage.characterCount
      ? maxLength - editor.storage.characterCount.characters()
      : null;

  const hasToolbarActions = isUploadEnabled || isMentionEnabled || isGifEnabled;
  const hasUploadHint = isUploadEnabled;
  const toolbarActions = (
    <>
      {isUploadEnabled && (
        <Button
          size={headerActionSize}
          variant={ButtonVariant.Tertiary}
          color={queueCount ? ButtonColor.Cabbage : undefined}
          icon={actionIcon}
          onClick={() => uploadRef?.current?.click()}
          type="button"
        />
      )}
      {isMentionEnabled && (
        <Button
          variant={ButtonVariant.Tertiary}
          size={headerActionSize}
          icon={<AtIcon />}
          onClick={() => {
            if (!editor) {
              return;
            }
            editor.chain().focus().insertContent('@').run();
            updateSuggestionsFromEditor(editor);
          }}
          type="button"
        />
      )}
      {isGifEnabled && (
        <GifPopover
          buttonProps={{
            size: headerActionSize,
            variant: ButtonVariant.Tertiary,
            icon: <GifIcon />,
          }}
          onGifCommand={onGifCommand}
        />
      )}
    </>
  );

  if (!editor) {
    return (
      <div
        className={classNames(
          'relative flex flex-col rounded-16 bg-surface-float',
          className?.container,
        )}
      >
        <div className="flex min-h-[8rem] items-center justify-center p-4">
          <Loader />
        </div>
      </div>
    );
  }

  return (
    <div
      className={classNames(
        'relative flex flex-col rounded-16 bg-surface-float',
        className?.container,
      )}
    >
      {typeof isUpdatingDraft !== 'undefined' && (
        <SavingLabel
          className="absolute right-4 top-3"
          isUpdating={isUpdatingDraft}
          isUptoDate={initialContent === input}
        />
      )}
      <ConditionalWrapper
        condition={!!timeline}
        wrapper={(component) => (
          <span className="relative flex flex-col">
            <Divider
              className="absolute left-8 !h-10 !bg-border-subtlest-tertiary"
              vertical
            />
            {timeline}
            {component}
          </span>
        )}
      >
        <ConditionalWrapper
          condition={showUserAvatar}
          wrapper={(component) => (
            <span className="flex w-full flex-row">
              <ProfilePicture
                size={ProfileImageSize.Large}
                className={classNames('ml-3 mt-3', className?.profile)}
                user={user}
                nativeLazyLoading
                fetchPriority="low"
              />
              {component}
            </span>
          )}
        >
          <div
            className={classNames(
              'flex flex-1 flex-col',
              showUserAvatar && 'ml-3',
            )}
            ref={editorContainerRef}
            onDrop={handleDrop}
            onDragOver={(event) => event.preventDefault()}
            onPaste={handlePaste}
          >
            <RichTextToolbar
              ref={toolbarRef}
              editor={editor}
              onLinkAdd={(url, label) => {
                if (!editor) {
                  return;
                }
                if (!editor.state.selection.empty) {
                  editor.chain().focus().setLink({ href: url }).run();
                } else {
                  const linkText = label || url;
                  editor
                    .chain()
                    .focus()
                    .insertContent(`<a href="${url}">${linkText}</a>`)
                    .run();
                }
              }}
              inlineActions={hasToolbarActions ? toolbarActions : null}
              rightActions={
                onClose ? (
                  <CloseButton size={ButtonSize.Small} onClick={onClose} />
                ) : null
              }
            />
            {isUploadEnabled && (
              <input
                type="file"
                className="hidden"
                name="content_upload"
                ref={uploadRef}
                accept={allowedContentImage.join(',')}
                onInput={onUpload}
              />
            )}
            <EditorContent
              editor={editor}
              className={classNames(
                styles.editor,
                'min-h-[8rem] p-4',
                showUserAvatar ? 'ml-0' : '',
                className?.input,
              )}
            />
            {textareaProps.name && (
              <input type="hidden" name={textareaProps.name} value={input} />
            )}
          </div>
        </ConditionalWrapper>
      </ConditionalWrapper>
      <RecommendedMentionTooltip
        elementRef={editorContainerRef}
        offset={offset}
        mentions={mentions}
        selected={selected}
        query={query}
        onMentionClick={onApplyMention}
        onClickOutside={() => {
          queryRef.current = undefined;
          setQuery(undefined);
          mentionRangeRef.current = null;
        }}
        appendTo={parentSelector}
      />
      <RecommendedEmojiTooltip
        elementRef={editorContainerRef}
        search={emojiQuery}
        emojiData={emojiData}
        offset={offset}
        selected={selectedEmoji}
        onSelect={onApplyEmoji}
        onClickOutside={() => {
          emojiQueryRef.current = undefined;
          setEmojiQuery(undefined);
          emojiRangeRef.current = null;
        }}
      />
      {footer ?? (
        <span className="flex flex-row items-center gap-3 border-border-subtlest-tertiary p-3 px-4 text-text-tertiary laptop:border-t">
          {hasUploadHint && (
            <span className="typo-caption1 text-text-quaternary">
              Drag and drop images to attach
            </span>
          )}
          {maxLength && remainingCharacters !== null && (
            <span
              className={classNames(
                'ml-auto font-bold typo-callout',
                remainingCharacters < 100
                  ? 'text-status-warning'
                  : 'text-text-tertiary',
              )}
            >
              {remainingCharacters}
            </span>
          )}
          {shouldShowSubmit && (
            <Button
              className={
                maxLength && remainingCharacters !== null ? '' : 'ml-auto'
              }
              variant={ButtonVariant.Primary}
              color={ButtonColor.Cabbage}
              type="submit"
              disabled={isLoading || disabledSubmit || input === ''}
              loading={isLoading}
            >
              {submitCopy}
            </Button>
          )}
        </span>
      )}
    </div>
  );
}

export default forwardRef(RichTextInput);
