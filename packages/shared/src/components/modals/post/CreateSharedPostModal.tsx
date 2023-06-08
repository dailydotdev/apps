import React, { FormEventHandler, ReactElement, useState } from 'react';
import { Modal, ModalProps } from '../common/Modal';
import { ExternalLinkPreview } from '../../../graphql/posts';
import MarkdownInput from '../../fields/MarkdownInput';
import { WriteLinkPreview, WritePreviewSkeleton } from '../../post/write';
import useDebounce from '../../../hooks/useDebounce';
import { isValidHttpUrl } from '../../../lib/links';
import { usePostToSquad } from '../../../hooks';

interface CreateSharedPostModalProps extends ModalProps {
  preview: ExternalLinkPreview;
  onSharedSuccessfully: () => void;
}

export function CreateSharedPostModal({
  preview,
  ...props
}: CreateSharedPostModalProps): ReactElement {
  const [link, setLink] = useState(preview?.permalink ?? preview?.url ?? '');
  const {
    getLinkPreview,
    isLoadingPreview,
    preview: updatedPreview,
    isPosting,
    onSubmitPost,
    onUpdatePreview,
  } = usePostToSquad();
  const onFormSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
  };

  const [checkUrl] = useDebounce((value: string) => {
    if (!isValidHttpUrl(value) || value === updatedPreview?.url) return null;

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
      >
        <MarkdownInput
          showUserAvatar
          textareaProps={{ rows: 5 }}
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
    </Modal>
  );
}

export default CreateSharedPostModal;
