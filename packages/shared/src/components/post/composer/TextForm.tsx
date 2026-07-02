import type { ReactElement, ReactNode } from 'react';
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
} from 'react';
import classNames from 'classnames';
import RichTextInput, {
  type RichTextInputRef,
} from '../../fields/RichTextInput';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { CameraIcon, MiniCloseIcon } from '../../icons';
import { IconSize } from '../../Icon';
import { Tooltip } from '../../tooltip/Tooltip';
import { useFileInput } from '../../../hooks/utils/useFileInput';
import {
  acceptedTypesList,
  ACCEPTED_TYPES,
  imageSizeLimitMB,
} from '../../../graphql/posts';
import { TITLE_MAX_LENGTH, type TextFormState } from './types';

export interface TextFormCover {
  preview: string;
  file?: File;
  isUploading?: boolean;
}

interface TextFormProps {
  value: TextFormState;
  onChange: (next: TextFormState) => void;
  sourceId?: string;
  cover?: TextFormCover | null;
  onCoverChange?: (cover: TextFormCover | null) => void;
  toolbarLeading?: ReactNode;
  toolbarRightActions?: ReactNode;
  onMarkdownModeChange?: (isMarkdownMode: boolean) => void;
}

export interface TextFormHandle {
  focus: () => void;
  toggleMarkdownMode: () => void;
}

const BODY_MAX_LENGTH = 20_000;

export const TextForm = forwardRef<TextFormHandle, TextFormProps>(
  function TextForm(
    {
      value,
      onChange,
      sourceId,
      cover,
      onCoverChange,
      toolbarLeading,
      toolbarRightActions,
      onMarkdownModeChange,
    },
    ref,
  ): ReactElement {
    const titleRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const editorRef = useRef<RichTextInputRef>(null);

    useImperativeHandle(ref, () => ({
      focus: () => titleRef.current?.focus(),
      toggleMarkdownMode: () => editorRef.current?.toggleMarkdownMode(),
    }));

    useEffect(() => {
      titleRef.current?.focus();
    }, []);

    useLayoutEffect(() => {
      const titleEl = titleRef.current;
      if (!titleEl) {
        return;
      }
      titleEl.style.height = 'auto';
      titleEl.style.height = `${titleEl.scrollHeight}px`;
    }, [value.title]);

    const onTitleKeyDown = useCallback(
      (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.nativeEvent.isComposing) {
          return;
        }
        const isCmd = event.ctrlKey || event.metaKey;
        if (event.key === 'Enter' && isCmd) {
          event.preventDefault();
          event.currentTarget.form?.requestSubmit();
          return;
        }
        if (event.key === 'Enter' && !event.shiftKey) {
          event.preventDefault();
          editorRef.current?.focus();
        }
      },
      [],
    );

    const setCoverFile = useCallback(
      (file?: File) => {
        if (!file) {
          onCoverChange?.(null);
          return;
        }
        const reader = new FileReader();
        reader.onload = () => {
          onCoverChange?.({ preview: reader.result as string, file });
        };
        reader.readAsDataURL(file);
      },
      [onCoverChange],
    );

    const { onFileChange } = useFileInput({
      acceptedTypes: acceptedTypesList,
      limitMb: imageSizeLimitMB,
      onChange: (_, file) => setCoverFile(file),
    });

    const onFileInputChange = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        onFileChange(event.target.files?.[0]);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      },
      [onFileChange],
    );

    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex shrink-0 flex-col gap-3 px-5 pb-3 pt-2">
          <textarea
            ref={titleRef}
            name="title"
            placeholder="Post title…"
            maxLength={TITLE_MAX_LENGTH}
            rows={1}
            value={value.title}
            onChange={(e) =>
              onChange({
                ...value,
                title: e.currentTarget.value.replace(/\n/g, ''),
              })
            }
            onKeyDown={onTitleKeyDown}
            aria-label="Post title"
            className="w-full resize-none overflow-hidden break-words bg-transparent font-bold leading-tight text-text-primary outline-none typo-title2 placeholder:text-text-quaternary"
          />
          {cover ? (
            <div className="group relative w-fit max-w-full">
              <img
                src={cover.preview}
                alt="Post cover"
                className={classNames(
                  'block h-auto max-h-44 w-auto max-w-full rounded-16 object-contain transition-opacity',
                  'group-hover:brightness-95',
                  cover.isUploading && 'opacity-50',
                )}
              />
              <Tooltip content="Remove cover">
                <Button
                  type="button"
                  size={ButtonSize.Small}
                  variant={ButtonVariant.Primary}
                  icon={<MiniCloseIcon />}
                  onClick={() => onCoverChange?.(null)}
                  aria-label="Remove cover"
                  className="absolute right-3 top-3 z-1 !rounded-full !bg-surface-invert !text-text-primary !shadow-3 hover:!bg-text-primary hover:!text-surface-invert"
                />
              </Tooltip>
            </div>
          ) : (
            onCoverChange && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex w-fit items-center gap-1.5 rounded-12 border border-dashed border-border-subtlest-tertiary px-3 py-1.5 text-text-tertiary transition-colors typo-callout hover:border-border-subtlest-secondary hover:bg-surface-float hover:text-text-primary"
                aria-label="Add a cover image"
              >
                <CameraIcon size={IconSize.Size16} />
                Add cover
              </button>
            )
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_TYPES}
            className="hidden"
            onChange={onFileInputChange}
          />
        </div>
        <RichTextInput
          ref={editorRef}
          initialContent={value.body}
          onValueUpdate={(body) => onChange({ ...value, body })}
          sourceId={sourceId}
          textareaProps={{
            name: 'content',
            placeholder: 'Share your thoughts',
          }}
          enabledCommand={{
            upload: true,
            link: true,
            mention: true,
            emoji: true,
            gif: true,
          }}
          maxInputLength={BODY_MAX_LENGTH}
          allowBlockFormatting
          minHeightClassName="min-h-[12rem]"
          toolbarPosition="bottom"
          toolbarLeading={toolbarLeading}
          toolbarRightActions={toolbarRightActions}
          hideMarkdownToggle
          hideMarkdownHeader
          hideFooter
          onMarkdownModeChange={onMarkdownModeChange}
          className={{
            container: '!min-h-0 !flex-1 !rounded-none !bg-transparent',
            input: '!px-5',
          }}
        />
      </div>
    );
  },
);
