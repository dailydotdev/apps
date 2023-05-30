import React, { MouseEvent, ReactElement, useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { Modal } from '../common/Modal';
import { Button } from '../../buttons/Button';
import { NewCommentModalProps } from './NewCommentModal';
import { PromptOptions, usePrompt } from '../../../hooks/usePrompt';
import PreviewTab from '../tabs/PreviewTab';
import { editPost, PostData, PostType } from '../../../graphql/posts';
import ContentWriteTab from '../tabs/ContentWriteTab';
import { getPostByIdKey } from '../../../hooks/usePostById';
import { useToastNotification } from '../../../hooks/useToastNotification';
import { useActions } from '../../../hooks/useActions';
import { ActionType } from '../../../graphql/actions';

enum EditPostTab {
  Write = 'Write',
  Preview = 'Preview',
}

const promptOptions: PromptOptions = {
  title: 'Discard changes',
  description: 'Are you sure you want to close and discard your changes?',
  okButton: {
    className: 'btn-primary-ketchup',
    title: 'Discard',
  },
  cancelButton: {
    title: 'Stay',
  },
};

function EditWelcomePostModal({
  post,
  parentSelector,
  onRequestClose,
  ...props
}: Omit<NewCommentModalProps, 'parentComment'>): ReactElement {
  const client = useQueryClient();
  const { displayToast } = useToastNotification();
  const [input, setInput] = useState<string>(post.content);
  const [errorMessage, setErrorMessage] = useState<string>(null);
  const { completeAction } = useActions();
  const { mutateAsync: updatePost, isLoading } = useMutation(editPost, {
    onSuccess: (updatedPost) => {
      if (!updatedPost) return;

      const key = getPostByIdKey(post.id);
      client.setQueryData<PostData>(key, (data) =>
        !data
          ? { post: updatedPost }
          : { post: { ...data.post, ...updatedPost } },
      );
      displayToast('Post updated successfully!');

      if (post.type === PostType.Welcome) {
        completeAction(ActionType.EditWelcomePost);
      }

      onRequestClose(null);
    },
    onError: () => setErrorMessage('Something went wrong, try again'),
  });

  const { showPrompt } = usePrompt();
  const modalRef = (element: HTMLDivElement): void => {
    if (element) {
      // eslint-disable-next-line no-param-reassign
      element.scrollTop = element.scrollHeight - element.clientHeight;
    }
  };

  const confirmClose = async (event: MouseEvent): Promise<void> => {
    if (post.content !== input && !(await showPrompt(promptOptions))) {
      return;
    }
    onRequestClose(event);
  };

  const updateContent = () => updatePost({ id: post.id, content: input });
  const updateButton = (
    <Button
      disabled={!input}
      loading={isLoading}
      onClick={updateContent}
      className="ml-auto btn-primary-cabbage"
    >
      Save
    </Button>
  );

  return (
    <Modal
      contentRef={modalRef}
      kind={Modal.Kind.FlexibleTop}
      size={Modal.Size.Medium}
      tabs={Object.values(EditPostTab)}
      parentSelector={parentSelector}
      {...props}
      onRequestClose={confirmClose}
    >
      <Modal.Header.Tabs
        disabledTab={(tab) => tab === EditPostTab.Preview && !input?.length}
      />
      <ContentWriteTab
        {...props}
        tabName={EditPostTab.Write}
        parentComment={{
          authorName: post.author.name,
          authorImage: post.author.image,
          post,
        }}
        errorMessage={errorMessage}
        sendComment={updateContent}
        sendingComment={isLoading}
        input={input}
        onInput={setInput}
        isComment={false}
        submitAction={updateButton}
      />
      <PreviewTab
        input={input}
        sourceId={post.source.id}
        parentSelector={parentSelector}
        tabName={EditPostTab.Preview}
      >
        {updateButton}
      </PreviewTab>
    </Modal>
  );
}

export default EditWelcomePostModal;
