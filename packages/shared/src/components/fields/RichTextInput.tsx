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
import type { Editor } from '@tiptap/react';
import { useEditor, EditorContent } from '@tiptap/react';
import { Extension } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import Image from '@tiptap/extension-image';
import { ImageIcon, AtIcon } from '../icons';
import { GifIcon } from '../icons/Gif';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '../buttons/Button';
import { RecommendedMentionTooltip } from '../tooltips/RecommendedMentionTooltip';
import { SavingLabel } from './MarkdownInput/SavingLabel';
import { useAuthContext } from '../../contexts/AuthContext';
import { Loader } from '../Loader';
import { Divider } from '../utilities';
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
import { useMentionAutocomplete } from './RichTextEditor/useMentionAutocomplete';
import { useEmojiAutocomplete } from './RichTextEditor/useEmojiAutocomplete';
import { useImageUpload } from './RichTextEditor/useImageUpload';
import { useDraftStorage } from './RichTextEditor/useDraftStorage';
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

export interface RichTextInputRef {
  onMentionCommand?: () => void;
  clearDraft: () => void;
  setInput: (value: string) => void;
  focus: () => void;
}

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
  const toolbarRef = useRef<RichTextToolbarRef>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<Editor | null>(null);
  const markdownTextareaRef = useRef<HTMLTextAreaElement>(null);
  const dirtyRef = useRef(false);
  const isSyncingRef = useRef(false);
  const inputRef = useRef('');
  const [offset, setOffset] = useState([0, 0]);
  const [isMarkdownMode, setIsMarkdownMode] = useState(false);

  const isUploadEnabled = enabledCommand[MarkdownCommand.Upload];
  const isMentionEnabled = enabledCommand[MarkdownCommand.Mention];
  const isEmojiEnabled = enabledCommand[MarkdownCommand.Emoji];
  const isGifEnabled = enabledCommand[MarkdownCommand.Gif];
  const headerActionSize = ButtonSize.XSmall;
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
    enabled: isMentionEnabled,
    postId,
    sourceId,
    userId: user?.id,
    onOffsetUpdate: updateOffset,
  });

  const emoji = useEmojiAutocomplete({
    enabled: isEmojiEnabled,
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
      handlePaste: (_view, event) => {
        const hasFiles = (event.clipboardData?.files?.length ?? 0) > 0;
        if (hasFiles) {
          return false;
        }

        const text = event.clipboardData?.getData('text/plain')?.trim();
        if (!text || !looksLikeMarkdown(text)) {
          return false;
        }

        const convertedHtml = markdownToHtmlBasic(text);
        if (!convertedHtml) {
          return false;
        }

        event.preventDefault();
        editorRef.current?.chain().focus().insertContent(convertedHtml).run();
        return true;
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
    enabled: isUploadEnabled,
    editorRef,
  });

  const onGifCommand = async (gifUrl: string, altText: string) => {
    upload.insertImage(gifUrl, altText);
  };

  const switchToMarkdownMode = useCallback(() => {
    if (editorRef.current) {
      const markdown = htmlToMarkdownBasic(editorRef.current.getHTML());
      updateInput(markdown);
    }
    setIsMarkdownMode(true);
  }, [updateInput]);

  const switchToRichMode = useCallback(() => {
    if (editorRef.current) {
      isSyncingRef.current = true;
      editorRef.current.commands.setContent(
        markdownToHtmlBasic(inputRef.current),
      );
    }
    setIsMarkdownMode(false);
  }, []);

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
      onSubmit?.({
        currentTarget: { value: inputRef.current },
      } as React.FormEvent<HTMLTextAreaElement>);
    },
    [onSubmit],
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
      editor.commands.setContent(markdownToHtmlBasic(value));
    },
    focus: () => {
      if (isMarkdownMode) {
        markdownTextareaRef.current?.focus();
        return;
      }

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
          : editor?.storage.characterCount.characters() ?? input.length)
      : null;

  const hasToolbarActions = isUploadEnabled || isMentionEnabled || isGifEnabled;
  const hasUploadHint = isUploadEnabled;
  const toolbarActions = (
    <>
      {isUploadEnabled && (
        <Button
          size={headerActionSize}
          variant={ButtonVariant.Tertiary}
          color={upload.queueCount ? ButtonColor.Cabbage : undefined}
          icon={actionIcon}
          onClick={() => upload.uploadRef?.current?.click()}
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
            onDrop={isMarkdownMode ? undefined : upload.handleDrop}
            onDragOver={
              isMarkdownMode ? undefined : (event) => event.preventDefault()
            }
            onPaste={isMarkdownMode ? undefined : upload.handlePaste}
          >
            {isMarkdownMode ? (
              <>
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-subtlest-tertiary p-2">
                  <span className="px-2 text-text-tertiary typo-caption1">
                    Markdown editor
                  </span>
                  <div className="ml-auto flex items-center gap-2">
                    <Button
                      type="button"
                      variant={ButtonVariant.Tertiary}
                      size={ButtonSize.XSmall}
                      className="mobileXL:hidden"
                      onClick={switchToRichMode}
                    >
                      Rich
                    </Button>
                    <Button
                      type="button"
                      variant={ButtonVariant.Tertiary}
                      size={ButtonSize.XSmall}
                      className="hidden mobileXL:inline-flex"
                      onClick={switchToRichMode}
                    >
                      Switch to Rich Text Editor
                    </Button>
                    {onClose && (
                      <CloseButton size={ButtonSize.Small} onClick={onClose} />
                    )}
                  </div>
                </div>
                <textarea
                  {...textareaProps}
                  name={undefined}
                  ref={markdownTextareaRef}
                  value={input}
                  maxLength={maxLength}
                  className={classNames(
                    'min-h-[8rem] resize-y bg-transparent p-4 outline-none',
                    className?.input,
                  )}
                  onInput={onMarkdownInput}
                  onKeyDown={onMarkdownKeyDown}
                />
              </>
            ) : (
              <>
                <RichTextToolbar
                  ref={toolbarRef}
                  editor={editor}
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
                  inlineActions={hasToolbarActions ? toolbarActions : null}
                  rightActions={
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant={ButtonVariant.Tertiary}
                        size={ButtonSize.XSmall}
                        className="mobileXL:hidden"
                        onClick={switchToMarkdownMode}
                      >
                        Markdown
                      </Button>
                      <Button
                        type="button"
                        variant={ButtonVariant.Tertiary}
                        size={ButtonSize.XSmall}
                        className="hidden mobileXL:inline-flex"
                        onClick={switchToMarkdownMode}
                      >
                        Switch to Markdown Editor
                      </Button>
                      {onClose && (
                        <CloseButton
                          size={ButtonSize.Small}
                          onClick={onClose}
                        />
                      )}
                    </div>
                  }
                />
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
                <EditorContent
                  editor={editor}
                  className={classNames(
                    styles.editor,
                    'min-h-[8rem] p-4',
                    showUserAvatar ? 'ml-0' : '',
                    className?.input,
                  )}
                />
              </>
            )}
            {textareaProps.name && (
              <input type="hidden" name={textareaProps.name} value={input} />
            )}
          </div>
        </ConditionalWrapper>
      </ConditionalWrapper>
      {!isMarkdownMode && (
        <RecommendedMentionTooltip
          elementRef={editorContainerRef}
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
          elementRef={editorContainerRef}
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
      {footer ?? (
        <span className="flex flex-row items-center gap-3 border-border-subtlest-tertiary p-3 px-4 text-text-tertiary laptop:border-t">
          {hasUploadHint && !isMarkdownMode && (
            <span className="hidden text-text-quaternary typo-caption1 tablet:inline">
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
