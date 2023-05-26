import React, { FormEventHandler, ReactElement } from 'react';
import ImageInput from '../../../fields/ImageInput';
import CameraIcon from '../../../icons/Camera';
import { TextField } from '../../../fields/TextField';
import MarkdownInput from '../../../fields/MarkdownInput';
import { Switch } from '../../../fields/Switch';
import { Button } from '../../../buttons/Button';
import { WritePageMain } from './common';
import { useNotificationToggle } from '../../../../hooks/notifications';
import { Post } from '../../../../graphql/posts';
import AlertPointer, { AlertPlacement } from '../../../alert/AlertPointer';
import { useActions } from '../../../../hooks/useActions';
import { ActionType } from '../../../../graphql/actions';

export interface WriteFreeformContentProps {
  onSubmitForm: FormEventHandler<HTMLFormElement>;
  isPosting?: boolean;
  squadId: string;
  post?: Post;
}

export function WriteFreeformContent({
  onSubmitForm,
  isPosting,
  squadId,
  post,
}: WriteFreeformContentProps): ReactElement {
  const { isFetched, checkHasCompleted, completeAction } = useActions();
  const { shouldShowCta, isEnabled, onToggle, onSubmitted } =
    useNotificationToggle();

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    completeAction(ActionType.WritePost);
    await onSubmitted();
    await onSubmitForm(e);
  };

  return (
    <WritePageMain onSubmit={handleSubmit}>
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
        initialValue={post?.image}
      >
        <CameraIcon secondary />
        <span className="flex flex-row ml-1.5 font-bold typo-callout">
          Cover image
        </span>
      </ImageInput>
      <AlertPointer
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
        isAlertDisabled={!isFetched || checkHasCompleted(ActionType.WritePost)}
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
          defaultValue={post?.title}
        />
      </AlertPointer>
      <MarkdownInput
        className="mt-4"
        onSubmit={() => {}}
        sourceId={squadId}
        initialContent={post?.content}
        textareaProps={{ name: 'content', required: true }}
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
