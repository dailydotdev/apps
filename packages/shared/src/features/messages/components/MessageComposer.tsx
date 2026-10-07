import type {
  ClipboardEvent,
  DragEvent,
  KeyboardEvent,
  ReactElement,
  ReactNode,
} from 'react';
import React, { useEffect, useRef, useState } from 'react';
import { FlexCol, FlexRow } from '../../../components/utilities';
import { composerFrame } from '../../interests/components/AgentComposer';
import { AgentSendButton } from '../../interests/components/AgentSendButton';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { ImageIcon, MiniCloseIcon } from '../../../components/icons';
import { GifIcon } from '../../../components/icons/Gif';
import { IconSize } from '../../../components/Icon';
import GifPopover from '../../../components/popover/GifPopover';
import { EmojiPicker } from '../../../components/fields/EmojiPicker';
import { GenericLoaderSpinner } from '../../../components/utilities/loaders';
import { Tooltip } from '../../../components/tooltip/Tooltip';
import {
  allowedContentImage,
  allowedFileSize,
  uploadContentImage,
  uploadNotAcceptedMessage,
} from '../../../graphql/posts';
import { useToastNotification } from '../../../hooks/useToastNotification';
import { DM_MAX_LENGTH } from '../types';
import { DM_MAX_ATTACHMENTS, toImageMarkdown } from '../media';

const maxComposerHeight = 160;

type Attachment = {
  id: string;
  alt: string;
  preview: string;
  url?: string;
};

const altFromFilename = (filename: string): string =>
  filename.split('.').slice(0, -1).join('.') || filename;

export const MessageComposer = ({
  username,
  attachment,
  onSend,
}: {
  username: string;
  attachment?: ReactNode;
  onSend: (body: string) => void;
}): ReactElement => {
  const [value, setValue] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewsRef = useRef<string[]>([]);
  const { displayToast } = useToastNotification();
  const isUploading = attachments.some(({ url }) => !url);
  const body = [
    value.trim(),
    ...attachments.map(({ url, alt }) => toImageMarkdown(url ?? '', alt)),
  ]
    .filter(Boolean)
    .join('\n\n');
  const canSend = !!body && !isUploading && body.length <= DM_MAX_LENGTH;

  useEffect(
    () => () => previewsRef.current.forEach((url) => URL.revokeObjectURL(url)),
    [],
  );

  const removeAttachment = (id: string) =>
    setAttachments((current) =>
      current.filter((item) => {
        if (item.id === id) {
          URL.revokeObjectURL(item.preview);
        }

        return item.id !== id;
      }),
    );

  const addFiles = (files: File[]) => {
    const room = DM_MAX_ATTACHMENTS - attachments.length;
    const images = files.filter(
      (file) =>
        allowedContentImage.includes(file.type) && file.size <= allowedFileSize,
    );

    if (images.length < files.length) {
      displayToast(uploadNotAcceptedMessage);
    }

    if (images.length > room) {
      displayToast(`You can attach up to ${DM_MAX_ATTACHMENTS} images`);
    }

    images.slice(0, Math.max(room, 0)).forEach((file) => {
      const id = `${Date.now()}-${Math.random()}`;
      const preview = URL.createObjectURL(file);
      previewsRef.current.push(preview);
      setAttachments((current) => [
        ...current,
        { id, preview, alt: altFromFilename(file.name) },
      ]);

      uploadContentImage(file)
        .then((url) =>
          setAttachments((current) =>
            current.map((item) => (item.id === id ? { ...item, url } : item)),
          ),
        )
        .catch(() => {
          displayToast(uploadNotAcceptedMessage);
          removeAttachment(id);
        });
    });
  };

  const resize = () => {
    const input = inputRef.current;

    if (!input) {
      return;
    }

    input.style.height = 'auto';
    input.style.height = `${Math.min(input.scrollHeight, maxComposerHeight)}px`;
  };

  const onSubmit = () => {
    if (!canSend) {
      return;
    }

    onSend(body);
    setValue('');
    attachments.forEach(({ preview }) => URL.revokeObjectURL(preview));
    setAttachments([]);
    requestAnimationFrame(resize);
    inputRef.current?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      event.key === 'Enter' &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      onSubmit();
    }
  };

  const onPaste = (event: ClipboardEvent<HTMLTextAreaElement>) => {
    if (!event.clipboardData.files.length) {
      return;
    }

    event.preventDefault();
    addFiles(Array.from(event.clipboardData.files));
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    if (!event.dataTransfer.files.length) {
      return;
    }

    event.preventDefault();
    addFiles(Array.from(event.dataTransfer.files));
  };

  const insertEmoji = (emoji: string) => {
    const input = inputRef.current;
    const start = input?.selectionStart ?? value.length;
    const end = input?.selectionEnd ?? value.length;
    const caret = start + emoji.length;

    setValue(`${value.slice(0, start)}${emoji}${value.slice(end)}`);
    requestAnimationFrame(() => {
      input?.focus();
      input?.setSelectionRange(caret, caret);
      resize();
    });
  };

  return (
    <div className="shrink-0 px-4 pb-4 tablet:px-6">
      <FlexCol
        className={composerFrame}
        onDragOver={(event) => event.preventDefault()}
        onDrop={onDrop}
      >
        {attachment}
        {attachments.length > 0 && (
          <FlexRow className="flex-wrap gap-2 pt-1">
            {attachments.map((item) => (
              <div
                key={item.id}
                className="relative size-16 overflow-hidden rounded-12 bg-surface-float"
              >
                <img
                  src={item.preview}
                  alt={item.alt}
                  className="size-full object-cover"
                />
                {!item.url && (
                  <div className="absolute inset-0 flex items-center justify-center bg-overlay-quaternary-onion">
                    <GenericLoaderSpinner size={IconSize.Small} />
                  </div>
                )}
                <Button
                  type="button"
                  className="absolute right-1 top-1"
                  variant={ButtonVariant.Primary}
                  size={ButtonSize.XSmall}
                  icon={<MiniCloseIcon />}
                  aria-label="Remove image"
                  onClick={() => removeAttachment(item.id)}
                />
              </div>
            ))}
          </FlexRow>
        )}
        <FlexRow className="items-end gap-1.5">
          <textarea
            ref={inputRef}
            id="dm-composer"
            name="dm-composer"
            rows={1}
            aria-label={`Message @${username}`}
            placeholder={`Message @${username}`}
            maxLength={DM_MAX_LENGTH}
            value={value}
            className="block min-h-8 w-full min-w-0 flex-1 resize-none bg-transparent py-1.5 text-text-primary outline-none typo-callout placeholder:text-text-quaternary"
            onChange={(event) => {
              setValue(event.target.value);
              resize();
            }}
            onKeyDown={onKeyDown}
            onPaste={onPaste}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept={allowedContentImage.join(',')}
            multiple
            hidden
            onChange={(event) => {
              addFiles(Array.from(event.target.files ?? []));
              // eslint-disable-next-line no-param-reassign
              event.target.value = '';
            }}
          />
          <Tooltip content="Add image">
            <Button
              type="button"
              className="shrink-0"
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.Small}
              icon={<ImageIcon />}
              aria-label="Add image"
              disabled={attachments.length >= DM_MAX_ATTACHMENTS}
              onClick={() => fileInputRef.current?.click()}
            />
          </Tooltip>
          <GifPopover
            buttonProps={{
              size: ButtonSize.Small,
              variant: ButtonVariant.Tertiary,
              icon: <GifIcon />,
            }}
            textareaRef={inputRef}
            // A GIF is a message of its own, like in most chat apps.
            onGifCommand={async (url, alt) => onSend(toImageMarkdown(url, alt))}
          />
          <EmojiPicker
            value=""
            label={null}
            className="shrink-0"
            onChange={insertEmoji}
            renderTrigger={({ toggleOpen }) => (
              <Button
                type="button"
                variant={ButtonVariant.Tertiary}
                size={ButtonSize.Small}
                aria-label="Add emoji"
                onClick={toggleOpen}
              >
                <span className="text-lg leading-none">🙂</span>
              </Button>
            )}
          />
          <AgentSendButton
            label="Send message"
            className="shrink-0"
            disabled={!canSend}
            onClick={onSubmit}
          />
        </FlexRow>
      </FlexCol>
    </div>
  );
};
