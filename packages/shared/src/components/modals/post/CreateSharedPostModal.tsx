import React, { FormEventHandler, ReactElement, useRef, useState } from 'react';
import { Modal, ModalProps } from '../common/Modal';
import { ExternalLinkPreview } from '../../../graphql/posts';
import MarkdownInput, { MarkdownRef } from '../../fields/MarkdownInput';
import { WriteLinkPreview, WritePreviewSkeleton } from '../../post/write';
import useDebounce from '../../../hooks/useDebounce';
import { isValidHttpUrl } from '../../../lib/links';
import { usePostToSquad } from '../../../hooks';
import { Button, ButtonSize } from '../../buttons/Button';
import AtIcon from '../../icons/At';
import { Divider } from '../../utilities';
import SourceButton from '../../cards/SourceButton';
import { Squad } from '../../../graphql/sources';
import { formToJson } from '../../../lib/form';

export interface CreateSharedPostModalProps extends ModalProps {
  preview: ExternalLinkPreview;
  onSharedSuccessfully?: () => void;
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
  const {
    getLinkPreview,
    isLoadingPreview,
    preview: updatedPreview,
    isPosting,
    onSubmitPost,
  } = usePostToSquad({
    initialPreview: preview,
    onPostSuccess: () => {
      if (onSharedSuccessfully) onSharedSuccessfully();
      props.onRequestClose(null);
    },
  });
  const onFormSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();

    const { commentary } = formToJson(e.currentTarget);

    return onSubmitPost(e, squad.id, commentary);
  };

  const [checkUrl] = useDebounce((value: string) => {
    const links = [updatedPreview?.url, updatedPreview?.permalink];

    if (!isValidHttpUrl(value) || links.some((url) => url === value)) {
      return null;
    }

    return getLinkPreview(value);
  }, 1000);

  const onInput: FormEventHandler<HTMLInputElement> = (e) => {
    const { value } = e.currentTarget;
    setLink(value);
    checkUrl(value);
  };

  return (
    <Modal kind={Modal.Kind.FlexibleCenter} size={Modal.Size.Medium} {...props}>
      <Modal.Header title="New post" />
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
      </form>
      <Modal.Footer className="typo-caption1">
        <Button
          icon={<AtIcon />}
          className="btn-tertiary"
          buttonSize={ButtonSize.Small}
          onClick={markdownRef?.current?.onMentionCommand}
        />
        <Divider vertical />
        <SourceButton source={squad} size="small" />
        <span className="-ml-1">
          <strong>{squad.name}</strong>
          <span className="ml-1 text-theme-label-tertiary">
            @{squad.handle}
          </span>
        </span>
        <Button
          className="ml-auto btn-primary-cabbage"
          disabled={isPosting}
          loading={isPosting}
          form="share_post"
        >
          Post
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default CreateSharedPostModal;
