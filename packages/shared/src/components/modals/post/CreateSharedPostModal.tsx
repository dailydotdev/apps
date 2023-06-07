import React, { FormEventHandler, ReactElement } from 'react';
import { Modal, ModalProps } from '../common/Modal';
import { ExternalLinkPreview } from '../../../graphql/posts';
import MarkdownInput from '../../fields/MarkdownInput';
import PostPreview from '../../post/PostPreview';

interface CreateSharedPostModalProps extends ModalProps {
  preview: ExternalLinkPreview;
  onSharedSuccessfully: () => void;
}

export function CreateSharedPostModal({
  preview,
  ...props
}: CreateSharedPostModalProps): ReactElement {
  const onFormSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
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
          shouldShowFooter={false}
          allowPreview={false}
          enabledCommand={{ mention: true }}
          footer={<PostPreview className="m-3 !w-auto" preview={preview} />}
        />
      </form>
    </Modal>
  );
}

export default CreateSharedPostModal;
