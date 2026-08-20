import type {
  ForwardedRef,
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
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames';
import dynamic from 'next/dynamic';
import type { Editor } from '@tiptap/react';
import { useEditor, EditorContent } from '@tiptap/react';
import { Extension } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import Image from '@tiptap/extension-image';
import { ImageIcon, AtIcon, MarkdownIcon } from '../icons';
import { EditIcon } from '../icons/Edit';
import { GifIcon } from '../icons/Gif';
import { LinkIcon } from '../icons/Link';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { RecommendedMentionTooltip } from '../tooltips/RecommendedMentionTooltip';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';
import { SavingLabel } from './MarkdownInput/SavingLabel';
import { useAuthContext } from '../../contexts/AuthContext';
import { Loader } from '../Loader';
import { usePopupSelector } from '../../hooks/usePopupSelector';
import ConditionalWrapper from '../ConditionalWrapper';
import { ProfileImageSize, ProfilePicture } from '../ProfilePicture';
import CloseButton from '../CloseButton';
import GifPopover from '../popover/GifPopover';
import { allowedContentImage } from '../../graphql/posts';
import {
  htmlToMarkdownBasic,
  markdownToHtmlBasic,
} from '../../lib/markdownConversion';
import { looksLikeMarkdown } from '../../lib/markdown';
import { MarkdownCommand } from '../../hooks/input/useMarkdownInput';
import type { RichTextToolbarRef } from './RichTextEditor/RichTextToolbar';
import { RichTextToolbar } from './RichTextEditor/RichTextToolbar';
import { MarkdownInputRules } from './RichTextEditor/markdownInputRules';
import { Video } from './RichTextEditor/videoExtension';
import { useMentionAutocomplete } from './RichTextEditor/useMentionAutocomplete';
import { useEmojiAutocomplete } from './RichTextEditor/useEmojiAutocomplete';
import { useImageUpload } from './RichTextEditor/useImageUpload';
import { useDraftStorage } from './RichTextEditor/useDraftStorage';
import { useToastNotification } from '../../hooks/useToastNotification';
import styles from './RichTextEditor/richtext.module.css';
import type { UserShortProfile } from '../../lib/user';
import { isAppleDevice } from '../../lib/func';

const RecommendedEmojiTooltip = dynamic(
  () =>
    import(
      /* webpackChunkName: "lazyRecommendedEmojiTooltip" */ '../tooltips/RecommendedEmojiTooltip'
    ),
  { ssr: false },
);

const PASTE_TRUNCATED_MESSAGE =
  'Pasted content was truncated to fit the character limit';
const CHARACTER_LIMIT_REACHED_MESSAGE = 'Character limit reached';

/**
 * Calculates available characters and truncates text if needed
 * @returns null if paste should proceed normally, or an object with truncated text and whether limit was exceeded
 */
const calculatePasteLimits = (
  pastedText: string,
  currentLength: number,
  selectedLength: number,
  maxLength: number | undefined,
): { limitedText: string; exceededLimit: boolean } | null => {
  if (typeof maxLength !== 'number') {
    return null;
  }

  const availableCharacters = maxLength - (currentLength - selectedLength);

  if (availableCharacters <= 0) {
    return { limitedText: '', exceededLimit: true };
  }

  const exceededLimit = pastedText.length > availableCharacters;
  const limitedText = exceededLimit
    ? pastedText.slice(0, availableCharacters)
    : pastedText;

  return { limitedText, exceededLimit };
};

/**
 * Gets the length of the current selection in the editor
 */
const getSelectedLength = (editor: Editor | null): number => {
  const selection = editor?.state.selection;
  if (!selection) {
    return 0;
  }
  return (
    editor?.state.doc.textBetween(selection.from, selection.to, '', '')
      .length ?? 0
  );
};

interface ClassName {
  container?: string;
  input?: string;
  profile?: string;
}

interface RichTextInputProps {
  className?: ClassName;
  inputId?: string;
  footer?: ReactNode;
  textareaProps?: Omit<
    TextareaHTMLAttributes<HTMLTextAreaElement>,
    'className'
  >;
  submitCopy?: string;
  submitButtonVariant?: ButtonVariant;
  showUserAvatar?: boolean;
  isUpdatingDraft?: boolean;
  header?: ReactNode;
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
  mentionSuggestions?: UserShortProfile[];
  allowBlockFormatting?: boolean;
  minHeightClassName?: string;
  markdownToHtml?: (markdown: string) => string;
  hideToolbar?: boolean;
  toolbarPosition?: 'top' | 'bottom';
  toolbarLeading?: ReactNode;
  toolbarRightActions?: ReactNode;
  stackToolbarLeading?: boolean;
  hideMarkdownToggle?: boolean;
  hideMarkdownHeader?: boolean;
  hideFooter?: boolean;
  onMarkdownModeChange?: (isMarkdownMode: boolean) => void;
}

export interface RichTextInputRef {
  onMentionCommand?: () => void;
  clearDraft: () => void;
  setInput: (value: string) => void;
  focus: () => void;
  toggleMarkdownMode: () => void;
}

function RichTextInput(
  {
    className = {},
    inputId,
    footer,
    textareaProps = {},
    submitCopy,
    submitButtonVariant = ButtonVariant.Float,
    showUserAvatar,
    isUpdatingDraft,
    header,
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
    mentionSuggestions,
    allowBlockFormatting = true,
    minHeightClassName = 'min-h-[8rem]',
    markdownToHtml = markdownToHtmlBasic,
    hideToolbar = false,
    toolbarPosition = 'top',
    toolbarLeading,
    toolbarRightActions,
    stackToolbarLeading = false,
    hideMarkdownToggle = false,
    hideMarkdownHeader = false,
    hideFooter = false,
    onMarkdownModeChange,
  }: RichTextInputProps,
  ref: ForwardedRef<RichTextInputRef>,
): ReactElement {
  const shouldShowSubmit = !!submitCopy;
  const { user } = useAuthContext();
  const { displayToast } = useToastNotification();
  const { parentSelector } = usePopupSelector();
  const toolbarRef = useRef<RichTextToolbarRef>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<Editor | null>(null);
  const markdownTextareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollOffsetRef = useRef(0);
  const shouldRestoreScrollRef = useRef(false);
  const pendingFocusRef = useRef(false);
  const dirtyRef = useRef(false);
  const isSyncingRef = useRef(false);
  const inputRef = useRef('');
  const [offset, setOffset] = useState([0, 0]);
  const [isMarkdownMode, setIsMarkdownMode] = useState(false);
  const [submitShortcut, setSubmitShortcut] = useState('Ctrl + Enter');
  useEffect(() => {
    setSubmitShortcut(isAppleDevice() ? '⌘ + Enter' : 'Ctrl + Enter');
  }, []);

  const isUploadEnabled = enabledCommand[MarkdownCommand.Upload];
  const isLinkEnabled = enabledCommand[MarkdownCommand.Link];
  const isMentionEnabled = enabledCommand[MarkdownCommand.Mention];
  const isEmojiEnabled = enabledCommand[MarkdownCommand.Emoji];
  const isGifEnabled = enabledCommand[MarkdownCommand.Gif];
  const headerActionSize = ButtonSize.Small;
  const maxLength = maxInputLength ?? textareaProps.maxLength;

  const { getInitialValue, clearDraft } = useDraftStorage({
    postId,
    editCommentId,
    parentCommentId,
    content: inputRef.current,
    isDirty: dirtyRef.current,
  });

  const [input, setInput] = useState(() => getInitialValue(initialContent));
  inputRef.current = input;
  const isInputEmpty = input.trim() === '';

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

  const updateOffset = useCallback((currentEditor: Editor | null) => {
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
  }, []);

  const mention = useMentionAutocomplete({
    enabled: isMentionEnabled ?? false,
    postId,
    sourceId,
    userId: user?.id,
    onOffsetUpdate: updateOffset,
    suggestions: mentionSuggestions,
  });

  const emoji = useEmojiAutocomplete({
    enabled: isEmojiEnabled ?? false,
    onOffsetUpdate: updateOffset,
  });

  const updateSuggestionsFromEditor = useCallback(
    (currentEditor: Editor | null) => {
      if (!currentEditor) {
        return;
      }

      if (!currentEditor.state.selection.empty) {
        mention.clearMention();
        emoji.clearEmoji();
        return;
      }

      mention.updateFromEditor(currentEditor);
      emoji.updateFromEditor(currentEditor);
    },
    [mention, emoji],
  );

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

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: allowBlockFormatting ? undefined : false,
        bulletList: allowBlockFormatting ? undefined : false,
        orderedList: allowBlockFormatting ? undefined : false,
        listItem: allowBlockFormatting ? undefined : false,
        codeBlock: allowBlockFormatting ? undefined : false,
        blockquote: false,
        horizontalRule: false,
        link: false,
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
      Video,
      MarkdownInputRules,
      ...(maxLength ? [CharacterCount.configure({ limit: maxLength })] : []),
      LinkShortcut,
    ],
    content: markdownToHtml(input),
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
      attributes: {
        ...(inputId ? { id: inputId } : {}),
        role: 'textbox',
        'aria-multiline': 'true',
      },
      handlePaste: (_view, event) => {
        const hasFiles = (event.clipboardData?.files?.length ?? 0) > 0;
        if (hasFiles) {
          return false;
        }

        const clipboardText = event.clipboardData?.getData('text/plain');
        if (!clipboardText) {
          return false;
        }

        const currentCharacters =
          editorRef.current?.storage.characterCount?.characters?.() ??
          inputRef.current.length;
        const selectedCharacters = getSelectedLength(editorRef.current);

        const limits = calculatePasteLimits(
          clipboardText,
          currentCharacters,
          selectedCharacters,
          maxLength,
        );

        if (limits?.limitedText === '') {
          event.preventDefault();
          displayToast(CHARACTER_LIMIT_REACHED_MESSAGE);
          return true;
        }

        const textToInsert = limits?.limitedText ?? clipboardText;
        const trimmedText = textToInsert.trim();

        if (trimmedText && looksLikeMarkdown(trimmedText)) {
          const convertedHtml = markdownToHtml(trimmedText);
          if (convertedHtml) {
            event.preventDefault();
            editorRef.current
              ?.chain()
              .focus()
              .insertContent(convertedHtml)
              .run();
            if (limits?.exceededLimit) {
              displayToast(PASTE_TRUNCATED_MESSAGE);
            }
            return true;
          }
        }

        if (limits?.exceededLimit) {
          event.preventDefault();
          editorRef.current?.chain().focus().insertContent(textToInsert).run();
          displayToast(PASTE_TRUNCATED_MESSAGE);
          return true;
        }

        return false;
      },
      handleKeyDown: (_view, event) => {
        const isSpecialKey = event.ctrlKey || event.metaKey;
        const hasMentions =
          typeof mention.queryRef.current !== 'undefined' &&
          (mention.mentionsRef.current?.length ?? 0) > 0;
        const hasEmojis =
          typeof emoji.emojiQueryRef.current !== 'undefined' &&
          (emoji.emojiDataRef.current?.length ?? 0) > 0;

        if (isSpecialKey && event.key === 'Enter' && inputRef.current?.length) {
          event.preventDefault();
          if (onSubmit) {
            onSubmit({
              currentTarget: { value: inputRef.current },
            } as React.FormEvent<HTMLTextAreaElement>);
          } else {
            editorContainerRef.current?.closest('form')?.requestSubmit();
          }
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
            mention.setSelected((prev) => {
              const total = mention.mentionsRef.current?.length ?? 1;
              if (isArrowUp) {
                return (prev - 1 + total) % total;
              }
              return (prev + 1) % total;
            });
          } else if (hasEmojis) {
            emoji.setSelectedEmoji((prev) => {
              const total = emoji.emojiDataRef.current?.length || 1;
              if (isArrowUp) {
                return (prev - 1 + total) % total;
              }
              return (prev + 1) % total;
            });
          }

          return true;
        }

        if (isEnter) {
          if (hasMentions && editorRef.current) {
            const selectedMention =
              mention.mentionsRef.current?.[mention.selectedRef.current];
            if (selectedMention) {
              mention.applyMention(editorRef.current, selectedMention);
            }
          } else if (hasEmojis && editorRef.current) {
            const selectedEmoji =
              emoji.emojiDataRef.current?.[emoji.selectedEmojiRef.current];
            if (selectedEmoji) {
              emoji.applyEmoji(editorRef.current, selectedEmoji.emoji);
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

  const upload = useImageUpload({
    enabled: isUploadEnabled ?? false,
    editorRef,
  });

  const onGifCommand = async (gifUrl: string, altText: string) => {
    upload.insertImage(gifUrl, altText);
  };

  const rememberScroll = useCallback(() => {
    scrollOffsetRef.current = scrollContainerRef.current?.scrollTop ?? 0;
    shouldRestoreScrollRef.current = true;
  }, []);

  const switchToMarkdownMode = useCallback(() => {
    rememberScroll();
    if (editorRef.current) {
      const markdown = htmlToMarkdownBasic(editorRef.current.getHTML());
      updateInput(markdown);
    }
    setIsMarkdownMode(true);
  }, [rememberScroll, updateInput]);

  const switchToRichMode = useCallback(() => {
    rememberScroll();
    if (editorRef.current) {
      isSyncingRef.current = true;
      editorRef.current.commands.setContent(markdownToHtml(inputRef.current));
    }
    setIsMarkdownMode(false);
  }, [markdownToHtml, rememberScroll]);

  const toggleMarkdownMode = useCallback(() => {
    if (isMarkdownMode) {
      switchToRichMode();
      return;
    }
    switchToMarkdownMode();
  }, [isMarkdownMode, switchToMarkdownMode, switchToRichMode]);

  useEffect(() => {
    onMarkdownModeChange?.(isMarkdownMode);
  }, [isMarkdownMode, onMarkdownModeChange]);

  const didInitMarkdownRef = useRef(false);
  const restoreScroll = useCallback(() => {
    if (!shouldRestoreScrollRef.current || !scrollContainerRef.current) {
      return;
    }
    scrollContainerRef.current.scrollTop = scrollOffsetRef.current;
    shouldRestoreScrollRef.current = false;
  }, []);

  useEffect(() => {
    if (!didInitMarkdownRef.current) {
      didInitMarkdownRef.current = true;
      return undefined;
    }
    const frame = requestAnimationFrame(() => {
      if (isMarkdownMode) {
        const textarea = markdownTextareaRef.current;
        if (!textarea) {
          return;
        }
        textarea.focus({ preventScroll: true });
        const end = textarea.value.length;
        textarea.setSelectionRange(end, end);
        restoreScroll();
        return;
      }
      // `scrollIntoView: false` or ProseMirror undoes the restore below.
      editorRef.current?.commands.focus('end', { scrollIntoView: false });
      restoreScroll();
    });
    return () => cancelAnimationFrame(frame);
  }, [isMarkdownMode, restoreScroll]);

  useLayoutEffect(() => {
    if (!isMarkdownMode) {
      return;
    }
    const ta = markdownTextareaRef.current;
    if (!ta) {
      return;
    }
    // Measured from 0, not `auto`, so `rows` never acts as a floor —
    // `minHeightClassName` sets the empty height in both modes.
    ta.style.height = '0px';
    ta.style.height = `${ta.scrollHeight}px`;
    // Swapping editors momentarily shrinks the scroll container, clamping its
    // offset to 0; restore before paint — a later frame is too late.
    restoreScroll();
  }, [input, isMarkdownMode, restoreScroll]);

  const onMarkdownInput = useCallback(
    (event: React.FormEvent<HTMLTextAreaElement>) => {
      const { value } = event.currentTarget;
      updateInput(value);
    },
    [updateInput],
  );

  const onMarkdownKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      const isSpecialKey = event.ctrlKey || event.metaKey;
      if (!isSpecialKey || event.key !== 'Enter' || !inputRef.current?.length) {
        return;
      }

      event.preventDefault();
      if (onSubmit) {
        onSubmit({
          currentTarget: { value: inputRef.current },
        } as React.FormEvent<HTMLTextAreaElement>);
        return;
      }
      event.currentTarget.form?.requestSubmit();
    },
    [onSubmit],
  );

  const onMarkdownPaste = useCallback(
    (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const pastedText = event.clipboardData.getData('text/plain');
      if (!pastedText) {
        return;
      }

      const textarea = event.currentTarget;
      const selectionStart = textarea.selectionStart ?? 0;
      const selectionEnd = textarea.selectionEnd ?? selectionStart;
      const selectedLength = Math.max(0, selectionEnd - selectionStart);

      const limits = calculatePasteLimits(
        pastedText,
        inputRef.current.length,
        selectedLength,
        maxLength,
      );

      if (!limits) {
        return;
      }

      event.preventDefault();

      if (limits.limitedText === '') {
        displayToast(CHARACTER_LIMIT_REACHED_MESSAGE);
        return;
      }

      const valueBefore = inputRef.current.slice(0, selectionStart);
      const valueAfter = inputRef.current.slice(selectionEnd);
      const nextValue = `${valueBefore}${limits.limitedText}${valueAfter}`;
      updateInput(nextValue);

      if (limits.exceededLimit) {
        displayToast(PASTE_TRUNCATED_MESSAGE);
      }

      const nextCursor = selectionStart + limits.limitedText.length;
      requestAnimationFrame(() => {
        markdownTextareaRef.current?.setSelectionRange(nextCursor, nextCursor);
      });
    },
    [displayToast, maxLength, updateInput],
  );

  useImperativeHandle(ref, () => ({
    onMentionCommand: () => {
      if (!editor) {
        return;
      }
      editor.chain().focus().insertContent('@').run();
      updateSuggestionsFromEditor(editor);
    },
    clearDraft,
    setInput: (value: string) => {
      updateInput(value, { notify: true, markDirty: true });
      if (!editor) {
        return;
      }
      isSyncingRef.current = true;
      editor.commands.setContent(markdownToHtml(value));
    },
    focus: () => {
      if (isMarkdownMode) {
        markdownTextareaRef.current?.focus();
        return;
      }

      if (!editor) {
        // The editor is created async (`immediatelyRender: false`), so a focus
        // requested at mount — the composer's autofocus — would silently miss.
        pendingFocusRef.current = true;
        return;
      }

      editor.commands.focus('end');
    },
    toggleMarkdownMode,
  }));

  useEffect(() => {
    if (dirtyRef.current) {
      return;
    }

    if (input?.length === 0 && initialContent?.length > 0) {
      updateInput(initialContent, { notify: false, markDirty: false });

      if (editor) {
        isSyncingRef.current = true;
        editor.commands.setContent(markdownToHtml(initialContent));
      }
    }
  }, [editor, initialContent, input, markdownToHtml, updateInput]);

  // Ordered after the initial-content sync above so a queued autofocus lands
  // with the caret at the end of the prefilled mention, not an empty doc.
  useEffect(() => {
    if (!editor || !pendingFocusRef.current) {
      return;
    }
    pendingFocusRef.current = false;
    editor.commands.focus('end');
  }, [editor]);

  const actionIcon =
    upload.queueCount === 0 ? (
      <ImageIcon />
    ) : (
      <Loader
        className="btn-loader"
        innerClassName="before:border-t-accent-cabbage-default after:border-accent-cabbage-default"
      />
    );

  const remainingCharacters =
    maxLength && (isMarkdownMode || editor?.storage.characterCount)
      ? maxLength -
        (isMarkdownMode
          ? input.length
          : editor?.storage.characterCount?.characters?.() ?? input.length)
      : null;

  const isBottomToolbar = toolbarPosition === 'bottom';
  // Rendered outside the rich/markdown branches so switching editors never
  // drops it.
  const avatar = showUserAvatar && user && (
    <ProfilePicture
      size={ProfileImageSize.Large}
      className={classNames('ml-4 mt-4 shrink-0', className?.profile)}
      user={user}
      nativeLazyLoading
      fetchPriority="low"
    />
  );
  const renderSubmitButton = (buttonClassName?: string) =>
    shouldShowSubmit ? (
      <Button
        size={ButtonSize.Small}
        className={buttonClassName}
        variant={submitButtonVariant}
        type="submit"
        disabled={isLoading || disabledSubmit || isInputEmpty}
        loading={isLoading}
      >
        {submitCopy}
      </Button>
    ) : null;

  const hasToolbarActions =
    isUploadEnabled || isLinkEnabled || isMentionEnabled || isGifEnabled;
  const preventEditorBlur = (event: React.MouseEvent) => event.preventDefault();
  const toolbarActions = (
    <>
      {isUploadEnabled && (
        <SimpleTooltip content="Add image">
          <Button
            size={headerActionSize}
            variant={ButtonVariant.Tertiary}
            icon={actionIcon}
            onClick={() => {
              upload.uploadRef?.current?.click();
            }}
            onMouseDown={preventEditorBlur}
            type="button"
            aria-label="Add image"
          />
        </SimpleTooltip>
      )}
      {isLinkEnabled && (
        <SimpleTooltip content="Add link">
          <Button
            variant={ButtonVariant.Tertiary}
            size={headerActionSize}
            icon={<LinkIcon />}
            onClick={() => toolbarRef.current?.openLinkModal()}
            onMouseDown={preventEditorBlur}
            type="button"
            aria-label="Add link"
          />
        </SimpleTooltip>
      )}
      {isMentionEnabled && (
        <SimpleTooltip content="Mention someone">
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
            onMouseDown={preventEditorBlur}
            type="button"
            aria-label="Mention someone"
          />
        </SimpleTooltip>
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
        <div
          className={classNames(
            minHeightClassName,
            'flex items-center justify-center p-4',
          )}
        >
          <Loader />
        </div>
      </div>
    );
  }

  const savingLabel =
    typeof isUpdatingDraft !== 'undefined' ? (
      <SavingLabel
        className="h-6 rounded-8"
        isUpdating={isUpdatingDraft}
        isUptoDate={initialContent === input}
      />
    ) : null;

  // Both editors hang off one tree so toggling markdown swaps only the editor
  // element instead of remounting the avatar and action bar.
  const rightActionsNode = (
    <div
      className={classNames(
        'flex items-center',
        isBottomToolbar ? 'gap-2' : 'gap-1',
      )}
    >
      {savingLabel}
      {!hideMarkdownToggle && (
        <SimpleTooltip
          content={
            isMarkdownMode
              ? 'Switch to Rich Text Editor'
              : 'Switch to Markdown Editor'
          }
        >
          <Button
            type="button"
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            icon={isMarkdownMode ? <EditIcon /> : <MarkdownIcon />}
            onClick={isMarkdownMode ? switchToRichMode : switchToMarkdownMode}
          />
        </SimpleTooltip>
      )}
      {onClose && <CloseButton size={ButtonSize.Small} onClick={onClose} />}
      {toolbarRightActions}
      {isBottomToolbar && renderSubmitButton()}
    </div>
  );

  const toolbarNode = hideToolbar ? null : (
    <RichTextToolbar
      ref={toolbarRef}
      editor={editor}
      allowBlockFormatting={allowBlockFormatting}
      onLinkAdd={(url, label) => {
        if (!editor) {
          return;
        }
        if (!editor.state.selection.empty) {
          editor.chain().focus().setLink({ href: url }).run();
          return;
        }
        const linkText = label || url;
        editor
          .chain()
          .focus()
          .insertContent({
            type: 'text',
            text: linkText,
            marks: [{ type: 'link', attrs: { href: url } }],
          })
          .run();
      }}
      position={toolbarPosition}
      className={
        // The bar absorbs the device safe area itself; the drawer around it
        // adds no bottom padding of its own (`!p-0`).
        isBottomToolbar
          ? '!gap-3 !px-5 !pb-[max(1.25rem,env(safe-area-inset-bottom))] !pt-4'
          : undefined
      }
      leadingActions={toolbarLeading}
      stackLeading={stackToolbarLeading}
      inlineActions={
        hasToolbarActions && !isMarkdownMode ? toolbarActions : null
      }
      hideInlineLink={isLinkEnabled}
      hideFormatting={isMarkdownMode}
      rightActions={rightActionsNode}
    />
  );

  const editorBody = (
    <div className="flex w-full flex-1 flex-row">
      {avatar}
      {isMarkdownMode ? (
        <textarea
          {...textareaProps}
          id={inputId}
          name={undefined}
          ref={markdownTextareaRef}
          value={input}
          className={classNames(
            minHeightClassName,
            'min-w-0 flex-1 resize-none overflow-hidden bg-transparent p-4 font-mono outline-none',
            avatar && '!pl-3',
            className?.input,
          )}
          onInput={onMarkdownInput}
          onPaste={onMarkdownPaste}
          onKeyDown={onMarkdownKeyDown}
        />
      ) : (
        <EditorContent
          editor={editor}
          className={classNames(
            styles.editor,
            minHeightClassName,
            // Flex, not `height: 100%`, on the editable child: a percentage
            // resolves to nothing under a `min-height`-only ancestor.
            'flex min-w-0 flex-1 flex-col p-4',
            avatar && '!pl-3',
            className?.input,
          )}
        />
      )}
    </div>
  );

  return (
    <div
      className={classNames(
        'relative flex flex-col rounded-16 bg-surface-float',
        className?.container,
      )}
    >
      {header}
      <div
        className="flex min-h-0 flex-1 flex-col"
        ref={editorContainerRef}
        onDrop={isMarkdownMode ? undefined : upload.handleDrop}
        onDragOver={
          isMarkdownMode ? undefined : (event) => event.preventDefault()
        }
        onPaste={isMarkdownMode ? undefined : upload.handlePaste}
      >
        {isMarkdownMode && !hideMarkdownHeader && !isBottomToolbar && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-subtlest-tertiary p-2">
            <span className="px-2 text-text-tertiary typo-caption1">
              Markdown editor
            </span>
            <div className="flex items-center gap-2">
              {savingLabel}
              <SimpleTooltip content="Switch to Rich Text Editor">
                <Button
                  type="button"
                  variant={ButtonVariant.Tertiary}
                  size={ButtonSize.Small}
                  icon={<EditIcon />}
                  onClick={switchToRichMode}
                />
              </SimpleTooltip>
              {onClose && (
                <CloseButton size={ButtonSize.Small} onClick={onClose} />
              )}
            </div>
          </div>
        )}
        {toolbarPosition === 'top' && !isMarkdownMode && toolbarNode}
        {isUploadEnabled && (
          <input
            type="file"
            className="hidden"
            name="content_upload"
            ref={upload.uploadRef}
            accept={allowedContentImage.join(',')}
            onInput={upload.onUpload}
          />
        )}
        <ConditionalWrapper
          condition={isBottomToolbar}
          wrapper={(component) => (
            <div
              ref={scrollContainerRef}
              className="flex min-h-0 flex-1 flex-col overflow-y-auto"
            >
              {component}
            </div>
          )}
        >
          {editorBody}
        </ConditionalWrapper>
        {isBottomToolbar && toolbarNode}
        {textareaProps.name && (
          <input type="hidden" name={textareaProps.name} value={input} />
        )}
      </div>
      {!isMarkdownMode && (
        <RecommendedMentionTooltip
          elementRef={editorContainerRef as MutableRefObject<HTMLElement>}
          offset={offset}
          mentions={mention.mentions}
          selected={mention.selected}
          query={mention.query}
          onMentionClick={(m) => {
            if (editorRef.current) {
              mention.applyMention(editorRef.current, m);
            }
          }}
          onClickOutside={mention.clearMention}
          appendTo={parentSelector}
        />
      )}
      {!isMarkdownMode && (
        <RecommendedEmojiTooltip
          elementRef={editorContainerRef as MutableRefObject<HTMLElement>}
          search={emoji.emojiQuery}
          emojiData={emoji.emojiData}
          offset={offset}
          selected={emoji.selectedEmoji}
          onSelect={(e) => {
            if (editorRef.current) {
              emoji.applyEmoji(editorRef.current, e);
            }
          }}
          onClickOutside={emoji.clearEmoji}
        />
      )}
      {hideFooter
        ? null
        : footer ?? (
            <span className="flex flex-row items-center gap-3 border-border-subtlest-tertiary p-2 px-3 text-text-tertiary laptop:border-t">
              {shouldShowSubmit && !isMarkdownMode && (
                <span className="hidden text-text-quaternary typo-caption1 tablet:inline">
                  Press {submitShortcut} to send
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
              {!isBottomToolbar &&
                renderSubmitButton(
                  maxLength && remainingCharacters !== null ? '' : 'ml-auto',
                )}
            </span>
          )}
    </div>
  );
}

export default forwardRef(RichTextInput);
