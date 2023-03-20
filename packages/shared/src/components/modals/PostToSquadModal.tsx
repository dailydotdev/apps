import React, { ReactElement, useContext, useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import request from 'graphql-request';
import { LazyModalCommonProps, Modal } from './common/Modal';
import { addPostToSquad, Squad, SquadForm } from '../../graphql/squads';
import { SquadComment } from '../squads/Comment';
import { ModalHeaderKind, ModalStep } from './common/types';
import { Post } from '../../graphql/posts';
import { useToastNotification } from '../../hooks/useToastNotification';
import { SquadSelectArticle } from '../squads/SelectArticle';
import { SteppedSquadComment } from '../squads/SteppedComment';
import { ModalState, SquadStateProps } from '../squads/utils';
import AuthContext from '../../contexts/AuthContext';

export interface PostToSquadModalProps extends LazyModalCommonProps {
  squad: Squad;
  post?: Post;
  onSharedSuccessfully?: (post: Post) => void;
  requestMethod?: typeof request;
}

const modalSteps: ModalStep[] = [
  {
    key: ModalState.SelectArticle,
  },
  {
    key: ModalState.WriteComment,
  },
];
function PostToSquadModal({
  onSharedSuccessfully,
  onRequestClose,
  isOpen,
  post,
  squad,
  requestMethod = request,
  ...props
}: PostToSquadModalProps): ReactElement {
  const client = useQueryClient();
  const { user } = useContext(AuthContext);
  const { displayToast } = useToastNotification();
  const [form, setForm] = useState<Partial<SquadForm>>({
    post: { post },
    name: squad.name,
    file: squad.image,
    handle: squad.handle,
    buttonText: 'Done',
  });

  const { mutateAsync: onPost, isLoading } = useMutation(
    addPostToSquad(requestMethod),
    {
      onSuccess: async (squadPost) => {
        if (squadPost || requestMethod !== request) {
          displayToast('This post has been shared to your squad');
          await client.invalidateQueries(['sourceFeed', user.id]);
          onSharedSuccessfully?.(squadPost);
          onRequestClose(null);
        }
      },
    },
  );

  const onSubmit = async (
    e?: React.MouseEvent | React.KeyboardEvent,
    commentary?: string,
  ) => {
    e?.preventDefault();

    if (isLoading) return;

    await onPost({
      id: form.post.post.id,
      sourceId: squad.id,
      commentary: commentary ?? e?.target[0].value,
    });
  };

  const onNext = async (squadForm?: SquadForm) => {
    if (squadForm) setForm(squadForm);
    if (!squadForm.commentary) return;
    onSubmit(undefined, squadForm.commentary);
  };

  const stateProps: SquadStateProps = {
    form,
    setForm,
    onNext,
    onRequestClose,
  };

  return (
    <Modal
      isOpen={isOpen}
      kind={Modal.Kind.FixedCenter}
      size={Modal.Size.Small}
      onRequestClose={onRequestClose}
      steps={post ? undefined : modalSteps}
      {...props}
    >
      <Modal.Header title="Share post" kind={ModalHeaderKind.Tertiary} />
      {post ? (
        <SquadComment form={form} onSubmit={onSubmit} isLoading={isLoading} />
      ) : (
        <>
          <SquadSelectArticle {...stateProps} />
          <SteppedSquadComment {...stateProps} />
        </>
      )}
    </Modal>
  );
}

export default PostToSquadModal;
