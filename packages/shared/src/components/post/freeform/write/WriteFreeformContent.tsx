import type { FormEventHandler, ReactElement } from 'react';
import React, { useImperativeHandle, useRef } from 'react';
import classNames from 'classnames';
import ImageInput from '../../../fields/ImageInput';
import { CameraIcon } from '../../../icons';
import { TextField } from '../../../fields/TextField';
import RichTextInput from '../../../fields/RichTextInput';
import { WritePageMain } from './common';
import type { EditPostProps } from '../../../../graphql/posts';
import { imageSizeLimitMB, PostType } from '../../../../graphql/posts';
import { formToJson } from '../../../../lib/form';
import useDebounceFn from '../../../../hooks/useDebounceFn';
import { useViewSize, ViewSize } from '../../../../hooks';
import { base64ToFile } from '../../../../lib/base64';
import type { MergedWriteObject, WriteForm } from '../../../../contexts';
import { useWritePostContext } from '../../../../contexts';
import { defaultMarkdownCommands } from '../../../../hooks/input';
import {
  EMOJI_FREE_TITLE_HINT,
  useEmojiFreeInput,
} from '../../../../hooks/input/useEmojiFreeInput';
import { WriteFooter } from '../../write';

export const generateWritePostKey = (reference = 'create'): string =>
  `write:post:${reference}`;

export const checkSavedProperty = (
  prop: keyof WriteForm,
  form: EditPostProps,
  draft: Partial<WriteForm>,
  post?: MergedWriteObject,
): boolean =>
  !form[prop] || (form[prop] === draft?.[prop] && form[prop] !== post?.[prop]);

const defaultFilename = 'thumbnail.png';

// Shared constants - remember to update them in daily-api
const MAX_TITLE_LENGTH = 250;
const MAX_CONTENT_LENGTH = 10_000;

interface WriteFreeformContentProps {
  className?: string;
  initialTitle?: string;
  initialContent?: string;
}

export function WriteFreeformContent({
  className,
  initialTitle,
  initialContent,
}: WriteFreeformContentProps): ReactElement {
  const {
    onSubmitForm,
    isPosting,
    squad,
    fetchedPost,
    draft,
    updateDraft,
    isUpdatingDraft,
    formRef: propRef,
  } = useWritePostContext();
  const formRef = useRef<HTMLFormElement>();
  useImperativeHandle(propRef, () => formRef?.current);
  const isLaptop = useViewSize(ViewSize.Laptop);
  const { hasStrippedEmojis, onEmojiFreeInput, resetEmojiHint } =
    useEmojiFreeInput();

  const getDraftImage = () => {
    if (!draft?.image) {
      return null;
    }

    return base64ToFile(draft.image, draft.filename ?? defaultFilename);
  };

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    const {
      title,
      content,
      image: files,
    } = formToJson<{ title: string; content: string; image: string | File }>(
      e.currentTarget,
    );
    const image = files?.[0] ?? (await getDraftImage());
    await onSubmitForm(e, { title, content, image }, PostType.Freeform);
  };

  const onUpdate = async () => {
    const { title, content } = formToJson<{ title: string; content: string }>(
      formRef.current,
    );
    await updateDraft({ title, content, image: draft?.image });
  };

  const [onFormUpdate] = useDebounceFn(onUpdate, 3000);

  return (
    <WritePageMain
      className={classNames(className, 'gap-4')}
      onSubmit={handleSubmit}
      ref={formRef}
      id="write-post-freeform"
    >
      <ImageInput
        size={isLaptop ? 'medium' : 'large'}
        className={{
          container:
            '!w-full !rounded-14 border-none bg-accent-pepper-subtlest text-text-tertiary tablet:!w-[20.25rem] laptop:!w-[11.5rem]',
          root: 'relative w-full tablet:w-min',
        }}
        enableHover={false}
        fallbackImage={null}
        closeable
        fileSizeLimitMB={imageSizeLimitMB}
        name="image"
        initialValue={draft?.image ?? fetchedPost?.image}
        onChange={(base64, file) =>
          updateDraft({
            ...draft,
            image: base64,
            filename: file?.name ?? defaultFilename,
          })
        }
      >
        <CameraIcon secondary />
        <span className="ml-1.5 flex flex-row font-bold typo-callout">
          Thumbnail
        </span>
      </ImageInput>
      <TextField
        className={{ container: 'w-full' }}
        inputId="title"
        name="title"
        label="Post Title*"
        placeholder="Give your post a title"
        required
        defaultValue={draft?.title ?? initialTitle ?? fetchedPost?.title}
        onInputCapture={onEmojiFreeInput}
        onInput={onFormUpdate}
        onBlur={resetEmojiHint}
        hint={hasStrippedEmojis ? EMOJI_FREE_TITLE_HINT : undefined}
        maxLength={MAX_TITLE_LENGTH}
      />
      <RichTextInput
        sourceId={squad?.id}
        onValueUpdate={onFormUpdate}
        initialContent={
          draft?.content ?? initialContent ?? fetchedPost?.content ?? ''
        }
        textareaProps={{ name: 'content' }}
        enabledCommand={{ ...defaultMarkdownCommands, upload: true }}
        isUpdatingDraft={isUpdatingDraft}
        maxInputLength={MAX_CONTENT_LENGTH}
      />
      <WriteFooter isLoading={isPosting} />
    </WritePageMain>
  );
}
