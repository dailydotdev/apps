import React, { ReactElement, useContext, useState } from 'react';
import { useQueryClient } from 'react-query';
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

export type PostToSquadModalProps = {
  squad: Squad;
  post?: Post;
} & LazyModalCommonProps;

const modalSteps: ModalStep[] = [
  {
    key: ModalState.SelectArticle,
  },
  {
    key: ModalState.WriteComment,
  },
];
function PostToSquadModal({
  onRequestClose,
  isOpen,
  post,
  squad,
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

  const onSubmit = async (
    e?: React.MouseEvent | React.KeyboardEvent,
    commentary?: string,
  ) => {
    e?.preventDefault();
    const squadPost = await addPostToSquad({
      id: form.post.post.id,
      sourceId: squad.id,
      commentary: commentary ?? e?.target[0].value,
    });
    if (squadPost) {
      displayToast('This post has been shared to your squad');
      await client.invalidateQueries(['sourceFeed', user.id]);
      onRequestClose(e);
    }
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
  const title = `Share post`;

  return (
    <Modal
      isOpen={isOpen}
      kind={Modal.Kind.FixedCenter}
      size={Modal.Size.Small}
      onRequestClose={onRequestClose}
      steps={post ? undefined : modalSteps}
    >
      <Modal.Header title={title} kind={ModalHeaderKind.Tertiary} />
      {post ? (
        <SquadComment form={form} onSubmit={onSubmit} />
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
