import React, {
  FormEventHandler,
  MutableRefObject,
  ReactElement,
  useImperativeHandle,
  useRef,
} from 'react';
import ImageInput from '../../../fields/ImageInput';
import CameraIcon from '../../../icons/Camera';
import { TextField } from '../../../fields/TextField';
import MarkdownInput from '../../../fields/MarkdownInput';
import { Switch } from '../../../fields/Switch';
import { Button } from '../../../buttons/Button';
import { WritePageMain } from './common';
import { useNotificationToggle } from '../../../../hooks/notifications';
import { EditPostProps, Post } from '../../../../graphql/posts';
import usePersistentContext from '../../../../hooks/usePersistentContext';
import { formToJson } from '../../../../lib/form';
import useDebounce from '../../../../hooks/useDebounce';
import AlertPointer, { AlertPlacement } from '../../../alert/AlertPointer';
import { useActions } from '../../../../hooks/useActions';
import { ActionType } from '../../../../graphql/actions';
import useSidebarRendered from '../../../../hooks/useSidebarRendered';

export interface WriteFreeformContentProps {
  onSubmitForm: FormEventHandler<HTMLFormElement>;
  isPosting?: boolean;
  squadId: string;
  post?: Post;
  enableUpload?: boolean;
  formRef?: MutableRefObject<HTMLFormElement>;
  draft?: Partial<WriteForm>;
  updateDraft?: (props: Partial<WriteForm>) => Promise<void>;
}

export interface WriteForm {
  title: string;
  content: string;
  image: string;
}

export const generateWritePostKey = (reference = 'create'): string =>
  `write:post:${reference}`;

export const checkSavedProperty = (
  prop: keyof WriteForm,
  form: EditPostProps,
  draft: Partial<WriteForm>,
  post?: Post,
): boolean =>
  !form[prop] || (form[prop] === draft?.[prop] && form[prop] !== post?.[prop]);

export function WriteFreeformContent({
  onSubmitForm,
  isPosting,
  squadId,
  post,
  draft,
  updateDraft,
  formRef: propRef,
}: WriteFreeformContentProps): ReactElement {
  const formRef = useRef<HTMLFormElement>();
  useImperativeHandle(propRef, () => formRef?.current);
  const { isFetched, checkHasCompleted, completeAction } = useActions();
  const { sidebarRendered } = useSidebarRendered();
  const { shouldShowCta, isEnabled, onToggle, onSubmitted } =
    useNotificationToggle();

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    completeAction(ActionType.WritePost);
    await onSubmitted();
    await onSubmitForm(e);
  };

  const onUpdate = async () => {
    const { title, content } = formToJson(formRef.current);
    await updateDraft({ title, content, image: draft.image });
  };

  const [onFormUpdate] = useDebounce(onUpdate, 3000);

  return (
    <WritePageMain onSubmit={handleSubmit} ref={formRef}>
      <ImageInput
        className={{
          container:
            '!w-[11.5rem] border-none bg-theme-bg-tertiary text-theme-label-tertiary',
        }}
        enableHover={false}
        fallbackImage={null}
        closeable
        fileSizeLimitMB={5}
        name="image"
        initialValue={draft?.image ?? post?.image}
        onChange={(base64) => updateDraft({ ...draft, image: base64 })}
      >
        <CameraIcon secondary />
        <span className="flex flex-row ml-1.5 font-bold typo-callout">
          Thumbnail
        </span>
      </ImageInput>
      <AlertPointer
        className={{ container: 'bg-theme-bg-primary' }}
        offset={[4, -14]}
        message={
          <div className="flex flex-col w-64">
            <h3 className="font-bold typo-headline">First time? 👋</h3>
            <p className="mt-1 typo-subhead">
              It looks like this is your first time sharing a post with the
              squad! This is a community we build together. Please be welcoming
              and open-minded.
            </p>
          </div>
        }
        isAlertDisabled={
          !isFetched ||
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
        />
      </AlertPointer>
      <MarkdownInput
        className="mt-4"
        sourceId={squadId}
        onValueUpdate={onFormUpdate}
        initialContent={draft?.content ?? post?.content}
        textareaProps={{ name: 'content' }}
        enableUpload
      />
      <span className="flex flex-row items-center mt-4">
        {shouldShowCta && (
          <Switch
            data-testId="push_notification-switch"
            inputId="push_notification-switch"
            name="push_notification"
            labelClassName="flex-1 font-normal"
            className="py-3 w-full max-w-full"
            compact={false}
            checked={isEnabled}
            onToggle={onToggle}
          >
            Receive updates whenever your Squad members engage with your post
          </Switch>
        )}
        <Button
          type="submit"
          className="ml-auto btn-primary-cabbage"
          disabled={isPosting}
        >
          Post
        </Button>
      </span>
    </WritePageMain>
  );
}
