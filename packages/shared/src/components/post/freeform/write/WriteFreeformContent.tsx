import React, {
  FormEventHandler,
  ReactElement,
  useImperativeHandle,
  useRef,
} from 'react';
import ImageInput from '../../../fields/ImageInput';
import { CameraIcon } from '../../../icons';
import { TextField } from '../../../fields/TextField';
import MarkdownInput from '../../../fields/MarkdownInput';
import { WritePageMain } from './common';
import {
  EditPostProps,
  Post,
  imageSizeLimitMB,
} from '../../../../graphql/posts';
import { formToJson } from '../../../../lib/form';
import useDebounce from '../../../../hooks/useDebounce';
import AlertPointer, { AlertPlacement } from '../../../alert/AlertPointer';
import { useActions, useViewSize, ViewSize } from '../../../../hooks';
import { ActionType } from '../../../../graphql/actions';
import useSidebarRendered from '../../../../hooks/useSidebarRendered';
import { base64ToFile } from '../../../../lib/base64';
import { useWritePostContext, WriteForm } from '../../../../contexts';
import { defaultMarkdownCommands } from '../../../../hooks/input';
import { WriteFooter } from '../../write';

export const generateWritePostKey = (reference = 'create'): string =>
  `write:post:${reference}`;

export const checkSavedProperty = (
  prop: keyof WriteForm,
  form: EditPostProps,
  draft: Partial<WriteForm>,
  post?: Post,
): boolean =>
  !form[prop] || (form[prop] === draft?.[prop] && form[prop] !== post?.[prop]);

const defaultFilename = 'thumbnail.png';

interface WriteFreeformContentProps {
  className?: string;
}

export function WriteFreeformContent({
  className,
}: WriteFreeformContentProps): ReactElement {
  const {
    onSubmitForm,
    isPosting,
    squad,
    post,
    draft,
    updateDraft,
    isUpdatingDraft,
    formRef: propRef,
  } = useWritePostContext();
  const formRef = useRef<HTMLFormElement>();
  useImperativeHandle(propRef, () => formRef?.current);
  const { isActionsFetched, checkHasCompleted, completeAction } = useActions();
  const { sidebarRendered } = useSidebarRendered();
  const isLaptop = useViewSize(ViewSize.Laptop);

  const getDraftImage = () => {
    if (!draft?.image) {
      return null;
    }

    return base64ToFile(draft.image, draft.filename ?? defaultFilename);
  };

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    completeAction(ActionType.WritePost);
    const {
      title,
      content,
      image: files,
    } = formToJson<{ title: string; content: string; image: string | File }>(
      e.currentTarget,
    );
    const image = files?.[0] ?? (await getDraftImage());
    await onSubmitForm(e, { title, content, image });
  };

  const onUpdate = async () => {
    const { title, content } = formToJson<{ title: string; content: string }>(
      formRef.current,
    );
    await updateDraft({ title, content, image: draft?.image });
  };

  const [onFormUpdate] = useDebounce(onUpdate, 3000);

  return (
    <WritePageMain
      className={className}
      onSubmit={handleSubmit}
      ref={formRef}
      id="write-post"
    >
      <ImageInput
        size={isLaptop ? 'medium' : 'large'}
        className={{
          container:
            '!w-full border-none bg-accent-pepper-subtlest text-text-tertiary tablet:!w-[20.25rem] laptop:!w-[11.5rem]',
          root: 'mobileL:w-full',
        }}
        enableHover={false}
        fallbackImage={null}
        closeable
        fileSizeLimitMB={imageSizeLimitMB}
        name="image"
        initialValue={draft?.image ?? post?.image}
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
      <AlertPointer
        className={{ container: 'bg-background-default' }}
        offset={[0, -12]}
        message={
          <div className="flex w-64 flex-col">
            <h3 className="font-bold typo-body">First time? 👋</h3>
            <p className="mt-1 typo-subhead">
              It looks like this is your first time sharing a post with the
              Squad! This is a community we build together. Please be welcoming
              and open-minded.
            </p>
          </div>
        }
        isAlertDisabled={
          !isActionsFetched ||
          !sidebarRendered ||
          checkHasCompleted(ActionType.WritePost)
        }
        onClose={() => completeAction(ActionType.WritePost)}
        placement={AlertPlacement.Right}
      >
        <TextField
          className={{ container: 'mt-6 w-full' }}
          inputId="title"
          name="title"
          label="Post Title*"
          placeholder="Give your post a title"
          required
          defaultValue={draft?.title ?? post?.title}
          onInput={onFormUpdate}
          maxLength={250}
        />
      </AlertPointer>
      <MarkdownInput
        className={{ container: 'mt-4' }}
        sourceId={squad?.id}
        onValueUpdate={onFormUpdate}
        initialContent={draft?.content ?? post?.content ?? ''}
        textareaProps={{ name: 'content' }}
        enabledCommand={{ ...defaultMarkdownCommands, upload: true }}
        isUpdatingDraft={isUpdatingDraft}
      />
      <WriteFooter isLoading={isPosting} className="mt-5" />
    </WritePageMain>
  );
}
