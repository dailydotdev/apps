import React, { FormEventHandler, ReactElement, useRef, useState } from 'react';
import { Modal, ModalProps } from '../common/Modal';
import { ExternalLinkPreview } from '../../../graphql/posts';
import MarkdownInput, { MarkdownRef } from '../../fields/MarkdownInput';
import { WriteLinkPreview, WritePreviewSkeleton } from '../../post/write';
import {
  usePostToSquad,
  useMedia,
  useViewSize,
  ViewSize,
} from '../../../hooks';
import { Button, ButtonSize } from '../../buttons/Button';
import AtIcon from '../../icons/At';
import { Divider, Justify } from '../../utilities';
import SourceButton from '../../cards/SourceButton';
import { Squad } from '../../../graphql/sources';
import { formToJson } from '../../../lib/form';
import { useDebouncedUrl } from '../../../hooks/input';
import { useNotificationToggle } from '../../../hooks/notifications';
import { Switch } from '../../fields/Switch';
import CloseButton from '../../CloseButton';
import { tablet } from '../../../styles/media';

export interface CreateSharedPostModalProps extends ModalProps {
  preview: ExternalLinkPreview;
  onSharedSuccessfully?: (enableNotification?: boolean) => void;
  squad: Squad;
}

export function CreateSharedPostModal({
  preview,
  squad,
  onSharedSuccessfully,
  ...props
}: CreateSharedPostModalProps): ReactElement {
  const markdownRef = useRef<MarkdownRef>();
  const [link, setLink] = useState(preview?.permalink ?? preview?.url ?? '');
  const { shouldShowCta, isEnabled, onToggle, onSubmitted } =
    useNotificationToggle();
  const isMobile = useViewSize(ViewSize.MobileL);
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
      props.onRequestClose(null);
    },
  });
  const onFormSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();

    const { commentary } = formToJson(e.currentTarget);

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

  return (
    <Modal kind={Modal.Kind.FlexibleCenter} size={Modal.Size.Medium} {...props}>
      <Modal.Header
        showCloseButton={!isMobile}
        title={isMobile ? null : 'New post'}
      >
        {isMobile && (
          <div className="flex flex-row flex-1 justify-between items-center">
            <CloseButton onClick={props.onRequestClose} />

            <Button
              className="btn-primary-cabbage"
              disabled={isPosting}
              loading={isPosting}
              form="share_post"
              buttonSize={ButtonSize.Small}
            >
              Post
            </Button>
          </div>
        )}
      </Modal.Header>
      <form
        className="flex flex-col p-3 w-full"
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
                className="flex-col-reverse m-3"
              />
            ) : (
              <WriteLinkPreview
                className="flex-col-reverse m-3 !w-auto"
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
      <Modal.Footer className="typo-caption1" justify={Justify.Start}>
        <Button
          icon={<AtIcon />}
          className="btn-tertiary"
          buttonSize={ButtonSize.Small}
          onClick={markdownRef?.current?.onMentionCommand}
        />
        <Divider vertical />
        <SourceButton source={squad} size="small" />
        <span className="flex-1 -ml-1">
          <strong>{squad.name}</strong>
          <span className="ml-1 text-theme-label-tertiary">
            @{squad.handle}
          </span>
        </span>

        {!isMobile && (
          <Button
            className="ml-auto btn-primary-cabbage"
            disabled={isPosting}
            loading={isPosting}
            form="share_post"
          >
            Post
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
}

export default CreateSharedPostModal;
