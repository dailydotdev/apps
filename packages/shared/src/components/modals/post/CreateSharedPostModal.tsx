import React, { FormEventHandler, ReactElement, useRef, useState } from 'react';
import { Modal, ModalProps } from '../common/Modal';
import { ExternalLinkPreview } from '../../../graphql/posts';
import MarkdownInput, { MarkdownRef } from '../../fields/MarkdownInput';
import { WriteLinkPreview, WritePreviewSkeleton } from '../../post/write';
import { usePostToSquad } from '../../../hooks';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '../../buttons/Button';
import { AtIcon } from '../../icons';
import { Divider, Justify } from '../../utilities';
import SourceButton from '../../cards/SourceButton';
import { Squad } from '../../../graphql/sources';
import { formToJson } from '../../../lib/form';
import { useDebouncedUrl } from '../../../hooks/input';
import { useNotificationToggle } from '../../../hooks/notifications';
import { Switch } from '../../fields/Switch';
import { ProfileImageSize } from '../../ProfilePicture';

export interface CreateSharedPostModalProps extends ModalProps {
  preview: ExternalLinkPreview;
  onSharedSuccessfully?: (enableNotification?: boolean) => void;
  squad: Squad;
}

export function CreateSharedPostModal({
  preview,
  squad,
  onSharedSuccessfully,
  onRequestClose,
  ...props
}: CreateSharedPostModalProps): ReactElement {
  const markdownRef = useRef<MarkdownRef>();
  const [link, setLink] = useState(preview?.permalink ?? preview?.url ?? '');
  const { shouldShowCta, isEnabled, onToggle, onSubmitted } =
    useNotificationToggle();
  const {
    getLinkPreview,
    isLoadingPreview,
    preview: updatedPreview,
    isPosting,
    onSubmitPost,
  } = usePostToSquad({
    initialPreview: preview,
    onPostSuccess: () => {
      if (onSharedSuccessfully) {
        onSharedSuccessfully();
      }
      onSubmitted();
      onRequestClose(null);
    },
  });
  const onFormSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();

    const { commentary } = formToJson<{ commentary: string }>(e.currentTarget);

    return onSubmitPost(e, squad.id, commentary);
  };

  const links = [updatedPreview?.url, updatedPreview?.permalink];
  const [checkUrl] = useDebouncedUrl(getLinkPreview, (value) =>
    links.every((url) => url !== value),
  );

  const onInput: FormEventHandler<HTMLInputElement> = (e) => {
    const { value } = e.currentTarget;
    setLink(value);
    checkUrl(value);
  };

  const footer = (
    <>
      <Button
        icon={<AtIcon />}
        size={ButtonSize.Small}
        variant={ButtonVariant.Tertiary}
        onClick={markdownRef?.current?.onMentionCommand}
      />
      <Divider vertical />
      <SourceButton source={squad} size={ProfileImageSize.Small} />
      <span className="-ml-1 flex-1">
        <strong>{squad.name}</strong>
        <span className="ml-1 text-text-tertiary">@{squad.handle}</span>
      </span>
    </>
  );

  const submitProps = {
    color: ButtonColor.Cabbage,
    variant: ButtonVariant.Primary,
    disabled: isPosting,
    loading: isPosting,
  };

  return (
    <Modal
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.Medium}
      onRequestClose={onRequestClose}
      {...props}
      formProps={{
        form: 'share_post',
        title: 'New post',
        rightButtonProps: submitProps,
        copy: { right: 'Post' },
      }}
    >
      <Modal.Header title="New post" />
      <form
        className="flex w-full flex-col p-3"
        action="#"
        onSubmit={onFormSubmit}
        id="share_post"
      >
        <MarkdownInput
          ref={markdownRef}
          showUserAvatar
          textareaProps={{ rows: 5, name: 'commentary' }}
          sourceId={squad?.id}
          allowPreview={false}
          enabledCommand={{ mention: true }}
          footer={
            isLoadingPreview ? (
              <WritePreviewSkeleton
                link={link}
                className="m-3 flex-col-reverse"
              />
            ) : (
              <WriteLinkPreview
                className="m-3 !w-auto flex-col-reverse"
                preview={updatedPreview ?? preview}
                link={link}
                onLinkChange={onInput}
              />
            )
          }
        />
        {shouldShowCta && (
          <Switch
            data-testid="push_notification-switch"
            inputId="push_notification-switch"
            name="push_notification"
            labelClassName="flex-1 font-normal"
            className="py-3"
            compact={false}
            checked={isEnabled}
            onToggle={onToggle}
          >
            Receive updates whenever your Squad members engage with your post
          </Switch>
        )}
      </form>
      <span className="flex flex-row items-center gap-2 px-4 tablet:hidden">
        {footer}
      </span>
      <Modal.Footer className="typo-caption1" justify={Justify.Start}>
        {footer}

        <Button {...submitProps} className="ml-auto" form="share_post">
          Post
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default CreateSharedPostModal;
